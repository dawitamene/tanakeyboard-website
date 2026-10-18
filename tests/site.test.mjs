// Checks the static export in out/ (run `npm run build` first).
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const OUT = 'out';
const CONTENT = 'content/pages';

function sources(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? sources(full) : name.endsWith('.html') ? [full] : [];
  });
}
const pages = sources(CONTENT).map((file) => JSON.parse(readFileSync(file, 'utf8').match(/^<!--meta\s*([\s\S]*?)-->/)[1]));
const canonical = (path) => (path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path);
const outFile = (path) => (path === '/' ? join(OUT, 'index.html') : join(OUT, `${canonical(path)}.html`));
const read = (path) => readFileSync(outFile(path), 'utf8');

test('every content page is exported with its title, canonical and language', () => {
  for (const meta of pages) {
    if (meta.path === '/404') continue;
    const html = read(meta.path);
    assert.match(html, new RegExp(`<html lang="${meta.lang}"`), meta.path);
    assert.ok(html.includes('<title>'), meta.path);
    if (meta.noindex) assert.match(html, /<meta name="robots" content="noindex/, meta.path);
    else assert.ok(html.includes(`<link rel="canonical" href="https://addiyonkeyboard.com${meta.path === '/' ? '' : canonical(meta.path)}"/>`), meta.path);
  }
});

test('the sitemap lists every indexable page and nothing else', () => {
  const sitemap = readFileSync(join(OUT, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expected = pages.filter((meta) => !meta.noindex && meta.path !== '/404');
  assert.equal(urls.length, expected.length);
  assert.ok(!urls.some((url) => url.includes('/theme-link') || url.endsWith('/404')));
  assert.match(sitemap, /hreflang="am"/);
});

test('pages carry structured data and analytics only when indexable', () => {
  const home = read('/');
  assert.match(home, /"@type":"Organization"/);
  assert.match(home, /G-HVXJCY4MR8/);
  // gtag.js is fetched only by the bot gate in /js/analytics.js, never straight from the HTML.
  assert.match(home, /\/js\/analytics\.js/);
  assert.doesNotMatch(home, /googletagmanager/);
  assert.doesNotMatch(read('/theme-link'), /G-HVXJCY4MR8/);
  assert.match(read('/holidays/fasika'), /"@type":"FAQPage"/);
  assert.match(read('/guides/amharic-keyboard-samsung'), /"@type":"BreadcrumbList"/);
});

test('internal links never use the old trailing-slash URLs', () => {
  for (const meta of pages) {
    const html = read(meta.path === '/404' ? '/404' : meta.path);
    assert.doesNotMatch(html, /href="\/(am|guides|compare|holidays|learn)\/"/, meta.path);
  }
});

test('robots, llms.txt, redirects, headers and the 404 page are exported', () => {
  assert.match(readFileSync(join(OUT, 'robots.txt'), 'utf8'), /Sitemap: https:\/\/addiyonkeyboard.com\/sitemap.xml/);
  assert.match(readFileSync(join(OUT, 'llms.txt'), 'utf8'), /^# Addiyon Keyboard/);
  assert.match(readFileSync(join(OUT, '_redirects'), 'utf8'), /\/t\/\*\s+\/theme-link 200/);
  assert.ok(existsSync(join(OUT, '_headers')));
  assert.match(readFileSync(join(OUT, '404.html'), 'utf8'), /Page not found/);
});

test('pages ship without the Next.js client runtime', () => {
  for (const meta of pages) {
    const html = read(meta.path === '/404' ? '/404' : meta.path);
    assert.doesNotMatch(html, /\/_next\/|__next_f/, meta.path);
  }
  assert.ok(!existsSync(join(OUT, '_next')));
  assert.ok(!existsSync(join(OUT, 'am.txt')));
});

test('Afaan Oromoo and Tigrinya pages link their translations with hreflang', () => {
  const sitemap = readFileSync(join(OUT, 'sitemap.xml'), 'utf8');
  assert.match(sitemap, /hreflang="om" href="https:\/\/addiyonkeyboard.com\/om"/);
  assert.match(sitemap, /hreflang="ti" href="https:\/\/addiyonkeyboard.com\/ti"/);
  const oromo = read('/afaan-oromoo-keyboard');
  assert.match(oromo, /<link rel="alternate" hrefLang="om" href="https:\/\/addiyonkeyboard.com\/om"\/>/);
  assert.match(oromo, /"@type":"MobileApplication"/);
  assert.match(read('/om'), /<a href="\/afaan-oromoo-keyboard" class="nav-link nav-lang" hreflang="en"/);
  assert.match(read('/ti'), /<meta property="og:locale" content="ti_ET"\/>/);
  assert.match(read('/tigrinya-typing'), /data-spelling="ti"/);
});
