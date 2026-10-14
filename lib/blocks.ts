// Expands a page body's <!--placeholders--> (CTA, FAQ, breadcrumbs, related cards, widgets) into HTML.
import { allPages, canonicalPath, type Page } from './content';
import { homePath } from './chrome';
import { copy, PLAY_ICON, PLAY_URL, type Lang } from './site';
import { engineWorkerPath, renderAlphabet, renderEthiopianYear, renderNumbers100, renderNumberTable } from './widgets';

function renderPlayButton(lang: Lang, className = 'btn btn-solid'): string {
  return `<a href="${PLAY_URL}" target="_blank" rel="noopener" class="${className}" data-install="button">
        ${PLAY_ICON}
        ${copy[lang].playButton}
      </a>`;
}

function renderCta(lang: Lang): string {
  const t = copy[lang];
  return `<div class="cta-panel">
      <h2>${t.ctaTitle}</h2>
      <p>${t.ctaBody}</p>
      <div class="cta-row">
      ${renderPlayButton(lang, 'btn btn-paper')}
        <a href="${canonicalPath(t.ctaSecondary[0])}" class="btn btn-ghost" style="color:var(--panel-text);border-color:var(--panel-line)">${t.ctaSecondary[1]}</a>
      </div>
    </div>`;
}

function renderFaq(page: Page): string {
  const t = copy[page.meta.lang];
  return `<section class="faq-block">
      <h2 class="faq-title">${t.faqTitle}</h2>
      <div class="faq-grid">
${(page.meta.faq ?? []).map(([question, answer]) => `        <div class="faq-item">
          <h3>${question}</h3>
          <p>${answer}</p>
        </div>`).join('\n')}
      </div>
    </section>`;
}

function renderRelated(paths: string[], page: Page): string {
  const t = copy[page.meta.lang];
  const pages = new Map(allPages().map((other) => [other.meta.path, other]));
  const cards = paths.map((rawPath) => {
    const path = canonicalPath(rawPath);
    const target = pages.get(path);
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

function renderCrumbs(page: Page): string {
  if (!page.meta.breadcrumbs) return '';
  const items: [string, string | null][] = [[copy[page.meta.lang].home, homePath(page.meta.lang)], ...page.meta.breadcrumbs];
  return `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([name, path], index) =>
    index === items.length - 1 ? `<span aria-current="page">${name}</span>` : `<a href="${path}">${name}</a>`).join('<span class="sep">/</span>')}</nav>`;
}

export function formatUpdated(page: Page): string {
  return new Date(`${page.meta.updated}T00:00:00Z`).toLocaleDateString(page.meta.lang === 'am' ? 'en-GB' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function renderUpdated(page: Page): string {
  if (!page.meta.article) return '';
  return `<p class="page-meta">${copy[page.meta.lang].updated} <time datetime="${page.meta.updated}">${formatUpdated(page)}</time></p>`;
}

/** Internal links point at canonical URLs, so /guides/ becomes /guides. */
function canonicalLinks(html: string): string {
  return html.replace(/href="(\/[^"#?]*?)\/(["#?])/g, (match, path: string, end: string) => (path ? `href="${path}${end}` : match));
}

const ASSET_LINK = /\.(svg|png|webp|jpg|jpeg|css|js|mjs|xml|txt|ico|pdf)$/;

export function assertInternalLinks(page: Page, html: string): void {
  const paths = new Set(allPages().map((other) => other.meta.path));
  const missing = [...html.matchAll(/href="(\/[^"#?]*)/g)]
    .map((match) => match[1])
    .filter((href) => !ASSET_LINK.test(href) && !paths.has(href));
  if (missing.length) throw new Error(`${page.meta.path} has broken internal links: ${[...new Set(missing)].join(', ')}`);
}

/** The page body as HTML, without its outer <main> element. */
export function renderBody(page: Page): string {
  const html = page.body.trim()
    .replace(/^<main>\s*/, '')
    .replace(/\s*<\/main>$/, '')
    .replace(/\{\{ENGINE_WORKER\}\}/g, () => engineWorkerPath())
    .replace(/<!--cta-->/g, () => renderCta(page.meta.lang))
    .replace(/<!--faq-->/g, () => renderFaq(page))
    .replace(/<!--play-->/g, () => renderPlayButton(page.meta.lang))
    .replace(/<!--crumbs-->/g, () => renderCrumbs(page))
    .replace(/<!--updated-->/g, () => renderUpdated(page))
    .replace(/<!--alphabet-->/g, () => renderAlphabet(page.meta.lang))
    .replace(/<!--numbers-->/g, () => renderNumberTable())
    .replace(/<!--numbers100-->/g, () => renderNumbers100())
    .replace(/<!--ethiopian-year:(\d+)-->/g, (_, year: string) => renderEthiopianYear(Number(year)))
    .replace(/<!--related:([^>]*?)-->/g, (_, list: string) => renderRelated(list.split(',').map((item) => item.trim()), page));
  return canonicalLinks(html);
}
