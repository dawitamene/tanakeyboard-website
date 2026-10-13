// Builds every page from src/pages/**/*.html into the static site at the repo root.
// Each source file starts with a <!--meta {json} --> block followed by the page body.
// Run: node tools/build.mjs   (Cloudflare Pages serves the committed output; no build step there)
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Fidel = require('../js/fidel.js');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src', 'pages');
// The site is served at addiyon.com/keyboard through a Cloudflare Worker (worker/), which proxies the Pages project.
const BASE_PATH = '/keyboard';
const ORIGIN = `https://addiyon.com${BASE_PATH}`;
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.addiyon.keyboard';
const ASSET_VERSION = '20261013c';
// Set to the GA4 web stream ID (G-XXXXXXX) to turn on website analytics; empty keeps the site analytics-free.
const GA_MEASUREMENT_ID = '';

const copy = {
  en: {
    nav: [['/amharic-typing', 'Type online'], ['/amharic-alphabet', 'Alphabet'], ['/guides/', 'Guides']],
    getApp: 'Get the app',
    getAppLabel: 'Get Addiyon Keyboard on Google Play',
    playButton: 'Get it on Google Play',
    toggleTheme: 'Toggle dark mode',
    switchLang: ['am', 'አማ', 'ይህን ገጽ በአማርኛ ያንብቡ'],
    footDesc: 'The fast, private way to type Amharic in the Ge&#8217;ez script.',
    footCols: [
      ['Product', [['/features', 'Features'], ['/privacy', 'Privacy Policy'], [PLAY_URL, 'Google Play']]],
      ['Free tools', [['/amharic-typing', 'Type Amharic online'], ['/amharic-alphabet', 'Amharic alphabet chart'], ['/geez-numbers', 'Ge&#8217;ez number converter'], ['/am/', 'በአማርኛ']]],
      ['Guides', [['/guides/how-to-type-amharic-on-android', 'Type Amharic on Android'], ['/guides/amharic-typing-rules', 'Amharic spelling rules'], ['/guides/amharic-keyboard-for-whatsapp', 'Amharic on WhatsApp'], ['/compare/', 'Compare keyboards']]]
    ],
    contact: 'Contact',
    telegram: 'Join our Telegram group',
    rights: '© 2026 Addiyon LLC. All rights reserved.',
    madeWith: 'Made with care for the <span class="eth">አማርኛ</span> community.',
    ctaTitle: 'Type Amharic in every app.',
    ctaBody: 'Addiyon Keyboard is free on Google Play. It turns English letters into Fidel as you type, works offline, and keeps your typing on your phone.',
    ctaSecondary: ['/features', 'See all features'],
    faqTitle: 'Common questions.',
    relatedTitle: 'Keep reading',
    updated: 'Updated',
    home: 'Addiyon Keyboard'
  },
  am: {
    nav: [['/am/amharic-typing', 'በኦንላይን ይጻፉ'], ['/am/amharic-alphabet', 'ፊደል'], ['/am/geez-numbers', 'ቁጥሮች']],
    getApp: 'አውርድ',
    getAppLabel: 'አዲዮን ኪቦርድን ከGoogle Play ያውርዱ',
    playButton: 'ከGoogle Play ያውርዱ',
    toggleTheme: 'ጨለማ ገጽታ',
    switchLang: ['en', 'EN', 'Read this page in English'],
    footDesc: 'አማርኛን በግዕዝ ፊደል በፍጥነትና በግል ለመጻፍ።',
    footCols: [
      ['አዲዮን ኪቦርድ', [['/am/', 'መነሻ'], ['/features', 'ባህሪያት (English)'], ['/privacy', 'የግላዊነት መመሪያ (English)'], [PLAY_URL, 'Google Play']]],
      ['ነጻ መሣሪያዎች', [['/am/amharic-typing', 'አማርኛ በኦንላይን መጻፊያ'], ['/am/amharic-alphabet', 'የአማርኛ ፊደል ገበታ'], ['/am/geez-numbers', 'የግዕዝ ቁጥሮች መቀየሪያ']]],
      ['English', [['/', 'Home'], ['/amharic-typing', 'Type Amharic online'], ['/guides/', 'Guides']]]
    ],
    contact: 'ያግኙን',
    telegram: 'የቴሌግራም ቡድናችንን ይቀላቀሉ',
    rights: '© 2026 Addiyon LLC። መብቱ በሕግ የተጠበቀ ነው።',
    madeWith: 'ለአማርኛ ተናጋሪዎች በጥንቃቄ የተሠራ።',
    ctaTitle: 'በሁሉም መተግበሪያ አማርኛ ይጻፉ።',
    ctaBody: 'አዲዮን ኪቦርድ በGoogle Play በነጻ ይገኛል። በላቲን ፊደል ሲጽፉ ወዲያው ወደ ግዕዝ ፊደል ይቀይራል፣ ያለ ኢንተርኔት ይሠራል፣ የሚጽፉትም በስልክዎ ላይ ይቀራል።',
    ctaSecondary: ['/am/amharic-typing', 'በኦንላይን ይሞክሩ'],
    faqTitle: 'ተደጋጋሚ ጥያቄዎች።',
    relatedTitle: 'ተጨማሪ ያንብቡ',
    updated: 'የተሻሻለው',
    home: 'አዲዮን ኪቦርድ'
  }
};

const PLAY_ICON = `<svg width="17" height="18" viewBox="30 336.7 120.9 129.2" aria-hidden="true">
          <path fill="#FFD400" d="M119.2,421.2c15.3-8.4,27-14.8,28-15.3c3.2-1.7,6.5-6.2,0-9.7c-2.1-1.1-13.4-7.3-28-15.3l-20.1,20.2L119.2,421.2z"/>
          <path fill="#FF3333" d="M99.1,401.1l-64.2,64.7c1.5,0.2,3.2-0.2,5.2-1.3c4.2-2.3,48.8-26.7,79.1-43.3L99.1,401.1L99.1,401.1z"/>
          <path fill="#48FF48" d="M99.1,401.1l20.1-20.2c0,0-74.6-40.7-79.1-43.1c-1.7-1-3.6-1.3-5.3-1L99.1,401.1z"/>
          <path fill="#3BCCFF" d="M99.1,401.1l-64.3-64.3c-2.6,0.6-4.8,2.9-4.8,7.6c0,7.5,0,107.5,0,113.8c0,4.3,1.7,7.4,4.9,7.7L99.1,401.1z"/>
        </svg>`;

function listSources(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listSources(full) : name.endsWith('.html') ? [full] : [];
  });
}

function parseSource(file) {
  const text = readFileSync(file, 'utf8');
  const match = text.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!match) throw new Error(`${relative(ROOT, file)} has no <!--meta --> block`);
  let meta;
  try {
    meta = JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`${relative(ROOT, file)} has invalid meta JSON: ${error.message}`);
  }
  for (const key of ['path', 'title', 'description', 'lang']) {
    if (!meta[key]) throw new Error(`${relative(ROOT, file)} meta is missing "${key}"`);
  }
  if (meta.description.length > 165) console.warn(`warn: ${meta.path} description is ${meta.description.length} chars`);
  if (meta.title.length > 70) console.warn(`warn: ${meta.path} title is ${meta.title.length} chars`);
  return { meta, body: text.slice(match[0].length), file };
}

function outputFile(path) {
  if (path.endsWith('/')) return join(ROOT, path, 'index.html');
  return join(ROOT, `${path}.html`);
}

const escapeAttr = (value) => String(value).replace(/&(?!#?\w+;)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const stripTags = (html) => html.replace(/<[^>]+>/g, '').replace(/&#8217;/g, '’').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const isExternal = (href) => /^https?:/.test(href);
const linkAttrs = (href) => (isExternal(href) ? ' target="_blank" rel="noopener"' : '');

function alternatesFor(page, pages) {
  if (!page.meta.translationKey) return [];
  return pages.filter((other) => other.meta.translationKey === page.meta.translationKey);
}

function renderHead(page, pages) {
  const { meta } = page;
  const url = ORIGIN + meta.path;
  const image = `${ORIGIN}/img/${meta.image || 'feature-graphic-v2.webp'}`;
  const alternates = alternatesFor(page, pages);
  const hreflang = alternates.length > 1
    ? alternates.map((alt) => `<link rel="alternate" hreflang="${alt.meta.lang}" href="${ORIGIN}${alt.meta.path}">`)
      .concat(alternates.filter((alt) => alt.meta.lang === 'en').map((alt) => `<link rel="alternate" hreflang="x-default" href="${ORIGIN}${alt.meta.path}">`))
      .join('\n')
    : '';
  const schema = buildSchema(page);
  const analytics = GA_MEASUREMENT_ID && !meta.noindex
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}',{anonymize_ip:true});</script>`
    : '';
  const scripts = ['/js/site.js', ...(meta.scripts || [])]
    .map((src) => `<script src="${src}?v=${ASSET_VERSION}" defer></script>`).join('\n');
  return `<!DOCTYPE html>
<html lang="${meta.lang}">
<head>
<script>
(function(){
  var t = null;
  try { t = localStorage.getItem('theme'); } catch (e) {}
  t = t || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', t);
})();
</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.title}</title>
<meta name="description" content="${escapeAttr(meta.description)}">
${meta.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
${hreflang}
<meta property="og:title" content="${escapeAttr(meta.ogTitle || meta.title)}">
<meta property="og:description" content="${escapeAttr(meta.description)}">
<meta property="og:type" content="${meta.path === '/' || meta.path === '/am/' ? 'website' : 'article'}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:site_name" content="Addiyon Keyboard">
<meta property="og:locale" content="${meta.lang === 'am' ? 'am_ET' : 'en_US'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(meta.ogTitle || meta.title)}">
<meta name="twitter:description" content="${escapeAttr(meta.description)}">
<meta name="twitter:image" content="${image}">
<link rel="icon" href="/img/logo.svg?v=20261009" type="image/svg+xml">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<meta name="theme-color" content="#00717D">
<link rel="stylesheet" href="/css/site.css?v=${ASSET_VERSION}">
${scripts}
${analytics}
${schema ? `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>` : ''}
</head>`.replace(/\n{2,}/g, '\n');
}

function buildSchema(page) {
  const { meta } = page;
  const graph = [...(meta.schema || [])];
  if (meta.breadcrumbs) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [[copy[meta.lang].home, meta.lang === 'am' ? '/am/' : '/'], ...meta.breadcrumbs].map(([name, path], index, all) => ({
        '@type': 'ListItem',
        position: index + 1,
        name,
        ...(index < all.length - 1 || path ? { item: ORIGIN + (path || meta.path) } : {})
      }))
    });
  }
  if (meta.faq) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: meta.faq.map(([question, answer]) => ({
        '@type': 'Question',
        name: stripTags(question),
        acceptedAnswer: { '@type': 'Answer', text: stripTags(answer) }
      }))
    });
  }
  if (meta.article) {
    graph.push({
      '@type': 'Article',
      headline: stripTags(meta.h1 || meta.title),
      description: meta.description,
      inLanguage: meta.lang,
      datePublished: meta.published || meta.updated,
      dateModified: meta.updated,
      mainEntityOfPage: ORIGIN + meta.path,
      image: `${ORIGIN}/img/${meta.image || 'feature-graphic-v2.webp'}`,
      author: { '@type': 'Organization', name: 'Addiyon LLC', url: `${ORIGIN}/` },
      publisher: { '@id': `${ORIGIN}/#organization` }
    });
  }
  if (!graph.length) return null;
  return { '@context': 'https://schema.org', '@graph': graph };
}

function alternatePath(page, pages, lang) {
  const match = alternatesFor(page, pages).find((alt) => alt.meta.lang === lang);
  if (match) return match.meta.path;
  return lang === 'am' ? '/am/' : '/';
}

function renderNav(page, pages) {
  const t = copy[page.meta.lang];
  const current = page.meta.path;
  const links = t.nav.map(([href, label]) => {
    const active = current === href || (href.endsWith('/') && href.length > 1 && current.startsWith(href));
    return `<a href="${href}" class="nav-link"${active ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('\n      ');
  const [lang, label, title] = t.switchLang;
  return `<nav id="siteNav">
  <div class="nav-inner">
    <a href="${page.meta.lang === 'am' ? '/am/' : '/'}" class="nav-brand">
      <img src="/img/logo.svg?v=20261009" width="30" height="30" alt="Addiyon Keyboard logo">
      <span class="nav-wordmark">Addiyon Keyboard</span>
    </a>
    <div class="nav-spacer"></div>
    <div class="nav-right">
      ${links}
      <a href="${alternatePath(page, pages, lang)}" class="nav-link nav-lang" hreflang="${lang}" lang="${lang}" title="${title}">${label}</a>
      <button id="themeToggle" class="theme-toggle" aria-label="${t.toggleTheme}">☾</button>
      <a href="${PLAY_URL}" target="_blank" rel="noopener" class="nav-cta" aria-label="${t.getAppLabel}">${t.getApp}</a>
    </div>
  </div>
</nav>`;
}

function renderFooter(lang) {
  const t = copy[lang];
  const cols = t.footCols.map(([heading, links]) => `      <div>
        <p class="foot-h">${heading}</p>
        <div class="foot-links">
${links.map(([href, label]) => `          <a href="${href}"${linkAttrs(href)}>${label}</a>`).join('\n')}
        </div>
      </div>`).join('\n');
  return `<footer>
  <div class="wrap">
    <div class="foot-top">
      <div>
        <div class="foot-brand">
          <img src="/img/logo.svg?v=20261009" width="30" height="30" alt="">
          Addiyon Keyboard
        </div>
        <p class="foot-desc">${t.footDesc}</p>
        <div class="foot-contact" style="margin-top:22px">
          <a href="https://t.me/addiyonkeyboard" target="_blank" rel="noopener">${t.telegram}</a>
          <span class="em">keyboard [at] addiyon.com</span>
        </div>
      </div>
${cols}
    </div>
    <div class="foot-bottom">
      <span>${t.rights}</span>
      <span>${t.madeWith}</span>
    </div>
  </div>
</footer>`;
}

function renderPlayButton(lang, className = 'btn btn-solid') {
  return `<a href="${PLAY_URL}" target="_blank" rel="noopener" class="${className}">
        ${PLAY_ICON}
        ${copy[lang].playButton}
      </a>`;
}

function renderCta(lang) {
  const t = copy[lang];
  return `<div class="cta-panel">
      <h2>${t.ctaTitle}</h2>
      <p>${t.ctaBody}</p>
      <div class="cta-row">
      ${renderPlayButton(lang, 'btn btn-paper')}
        <a href="${t.ctaSecondary[0]}" class="btn btn-ghost" style="color:var(--panel-text);border-color:var(--panel-line)">${t.ctaSecondary[1]}</a>
      </div>
    </div>`;
}

function renderFaq(page) {
  const t = copy[page.meta.lang];
  return `<section class="faq-block">
      <h2 class="faq-title">${t.faqTitle}</h2>
      <div class="faq-grid">
${page.meta.faq.map(([question, answer]) => `        <div class="faq-item">
          <h3>${question}</h3>
          <p>${answer}</p>
        </div>`).join('\n')}
      </div>
    </section>`;
}

function renderRelated(paths, page, byPath) {
  const t = copy[page.meta.lang];
  const cards = paths.map((path) => {
    const target = byPath.get(path);
    if (!target) throw new Error(`${page.meta.path} links to unknown page ${path}`);
    return `        <a class="rel-card" href="${path}"><span class="rel-t">${target.meta.cardTitle || target.meta.h1 || target.meta.title}</span><span class="rel-d">${target.meta.cardText || target.meta.description}</span></a>`;
  }).join('\n');
  return `<section class="related">
      <h2 class="related-title">${t.relatedTitle}</h2>
      <div class="rel-grid">
${cards}
      </div>
    </section>`;
}

function renderCrumbs(page) {
  if (!page.meta.breadcrumbs) return '';
  const t = copy[page.meta.lang];
  const items = [[t.home, page.meta.lang === 'am' ? '/am/' : '/'], ...page.meta.breadcrumbs];
  return `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([name, path], index) =>
    index === items.length - 1 ? `<span aria-current="page">${name}</span>` : `<a href="${path}">${name}</a>`).join('<span class="sep">/</span>')}</nav>`;
}

function renderUpdated(page) {
  if (!page.meta.updated || !page.meta.article) return '';
  const t = copy[page.meta.lang];
  return `<p class="page-meta">${t.updated} <time datetime="${page.meta.updated}">${new Date(`${page.meta.updated}T00:00:00Z`).toLocaleDateString(page.meta.lang === 'am' ? 'en-GB' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</time></p>`;
}

function renderAlphabet(lang) {
  const order = ['h', 'l', 'H', 'm', 'S', 'r', 's', 'sh', 'q', 'b', 'v', 't', 'ch', 'kh_velar', 'n', 'gn', "'", 'k', 'kh', 'w', '`', 'z', 'zh', 'y', 'd', 'j', 'g', 'T', 'C', 'P', 'ts', 'Ts', 'f', 'p'];
  const vowelKeys = ['e', 'u', 'i', 'a', 'ie', '', 'o'];
  const names = lang === 'am'
    ? ['ግዕዝ', 'ካዕብ', 'ሣልስ', 'ራብዕ', 'ኀምስ', 'ሳድስ', 'ሳብዕ']
    : ['1st (ä)', '2nd (u)', '3rd (i)', '4th (a)', '5th (é)', '6th (ə)', '7th (o)'];
  const head = `<tr><th scope="col">${lang === 'am' ? 'ቤት' : 'Letter'}</th>${names.map((name) => `<th scope="col">${name}</th>`).join('')}<th scope="col">${lang === 'am' ? 'ዲቃላ' : 'wa'}</th></tr>`;
  const bareVowelKeys = { "'": ['a', 'u', 'i', '', 'ie', 'e', 'o'], '`': ['A', 'U', 'I', '', '', 'E', 'O'] };
  const rows = order.map((key) => {
    if (key === 'kh_velar') {
      return `<tr class="velar"><th scope="row"><span class="eth">ኀ</span></th>${'ኀኁኂኃኄኅኆ'.split('').map((form) => `<td><button type="button" class="fc" data-copy="${form}"><span class="eth">${form}</span><span class="fk">&nbsp;</span></button></td>`).join('')}<td><button type="button" class="fc" data-copy="ኋ"><span class="eth">ኋ</span><span class="fk">&nbsp;</span></button></td></tr>`;
    }
    const family = Fidel.families[key];
    const cells = family.forms.split('').map((form, index) => {
      let typed;
      if (bareVowelKeys[key]) typed = bareVowelKeys[key][index];
      else typed = key + vowelKeys[index];
      const check = typed ? Fidel.transliterate(typed) : null;
      const label = typed && check === form ? typed : '';
      return `<td><button type="button" class="fc" data-copy="${form}"><span class="eth">${form}</span><span class="fk">${label || '&nbsp;'}</span></button></td>`;
    }).join('');
    const ua = family.ua ? `<td><button type="button" class="fc" data-copy="${family.ua}"><span class="eth">${family.ua}</span><span class="fk">${key}ua</span></button></td>` : '<td></td>';
    return `<tr><th scope="row"><span class="eth">${family.forms[0]}</span></th>${cells}${ua}</tr>`;
  }).join('\n');
  return `<div class="chart-scroll"><table class="fidel-chart">
<thead>${head}</thead>
<tbody>
${rows}
</tbody>
</table></div>`;
}

function renderNumberTable() {
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 1000, 10000, 100000, 1000000];
  return `<div class="num-grid">${values.map((value) => `<button type="button" class="num-cell" data-copy="${Fidel.toGeez(String(value))}"><span class="eth">${Fidel.toGeez(String(value))}</span><span class="fk">${value.toLocaleString('en-US')}</span></button>`).join('')}</div>`;
}

function renderNumbers100() {
  const cells = Array.from({ length: 100 }, (_, index) => {
    const geez = Fidel.toGeez(String(index + 1));
    return `<button type="button" class="num-cell small" data-copy="${geez}"><span class="eth">${geez}</span><span class="fk">${index + 1}</span></button>`;
  });
  return `<div class="num-grid num-100">${cells.join('')}</div>`;
}

function engineWorkerPath() {
  const versionFile = join(ROOT, 'engine', 'VERSION');
  try {
    return `${BASE_PATH}/engine/${readFileSync(versionFile, 'utf8').trim()}/worker.mjs`;
  } catch {
    return '';
  }
}

function expandBody(page, byPath) {
  return page.body
    .replace(/\{\{ENGINE_WORKER\}\}/g, () => engineWorkerPath())
    .replace(/<!--cta-->/g, () => renderCta(page.meta.lang))
    .replace(/<!--faq-->/g, () => renderFaq(page))
    .replace(/<!--play-->/g, () => renderPlayButton(page.meta.lang))
    .replace(/<!--crumbs-->/g, () => renderCrumbs(page))
    .replace(/<!--updated-->/g, () => renderUpdated(page))
    .replace(/<!--alphabet-->/g, () => renderAlphabet(page.meta.lang))
    .replace(/<!--numbers-->/g, () => renderNumberTable())
    .replace(/<!--numbers100-->/g, () => renderNumbers100())
    .replace(/<!--related:([^>]*?)-->/g, (_, list) => renderRelated(list.split(',').map((s) => s.trim()), page, byPath));
}

function checkInternalLinks(page, html, byPath) {
  const missing = [...html.matchAll(/href="(\/[^"#?]*)/g)]
    .map((match) => match[1])
    .filter((href) => !href.match(/\.(svg|png|webp|jpg|css|js|xml|txt|ico)$/) && !byPath.has(href));
  if (missing.length) throw new Error(`${page.meta.path} has broken internal links: ${[...new Set(missing)].join(', ')}`);
}

function withBasePath(html) {
  return html.replace(/(href|src)="\/(?!\/)/g, `$1="${BASE_PATH}/`);
}

function renderSitemap(pages) {
  const indexed = pages.filter((page) => !page.meta.noindex)
    .sort((a, b) => (a.meta.path === '/' ? -1 : b.meta.path === '/' ? 1 : a.meta.path.localeCompare(b.meta.path)));
  const urls = indexed.map((page) => {
    const alternates = alternatesFor(page, pages);
    const links = alternates.length > 1
      ? alternates.map((alt) => `\n    <xhtml:link rel="alternate" hreflang="${alt.meta.lang}" href="${ORIGIN}${alt.meta.path}"/>`).join('')
      : '';
    return `  <url>
    <loc>${ORIGIN}${page.meta.path}</loc>
    <lastmod>${page.meta.updated}</lastmod>${links}
  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

const pages = listSources(SRC).map(parseSource);
const byPath = new Map(pages.map((page) => [page.meta.path, page]));
if (byPath.size !== pages.length) throw new Error('Two pages share the same path');

for (const page of pages) {
  if (!page.meta.updated) throw new Error(`${page.meta.path} meta is missing "updated"`);
  const html = `${renderHead(page, pages)}
<body data-page="${page.meta.bodyPage || 'page'}">

${renderNav(page, pages)}

${expandBody(page, byPath).trim()}

${renderFooter(page.meta.lang)}

</body>
</html>
`;
  checkInternalLinks(page, html, byPath);
  const out = outputFile(page.meta.path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, withBasePath(html));
}
writeFileSync(join(ROOT, 'sitemap.xml'), renderSitemap(pages));
console.log(`Built ${pages.length} pages and sitemap.xml`);
