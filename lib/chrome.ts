// The site nav and footer, rendered as HTML so the page scripts can enhance them without React re-rendering.
import { alternatesFor, canonicalPath, type Page } from './content';
import { copy, PLAY_URL, type Lang } from './site';

const LOGO = '/img/logo.svg?v=20261009';
const isExternal = (href: string) => /^https?:/.test(href);
const linkAttrs = (href: string) => (isExternal(href) ? ' target="_blank" rel="noopener"' : '');

export function homePath(lang: Lang): string {
  return lang === 'am' ? '/am' : '/';
}

export function alternatePath(page: Page, lang: Lang): string {
  const match = alternatesFor(page).find((alt) => alt.meta.lang === lang);
  return match ? match.meta.path : homePath(lang);
}

function isActive(current: string, href: string): boolean {
  return current === href || (href !== '/' && href !== '/am' && current.startsWith(`${href}/`));
}

export function renderNav(page: Page): string {
  const t = copy[page.meta.lang];
  const links = t.nav.map(([rawHref, label]) => {
    const href = canonicalPath(rawHref);
    return `<a href="${href}" class="nav-link"${isActive(page.meta.path, href) ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('\n      ');
  const [lang, label, title] = t.switchLang;
  return `<div class="nav-inner">
    <a href="${homePath(page.meta.lang)}" class="nav-brand">
      <img src="${LOGO}" width="30" height="30" alt="Addiyon Keyboard logo">
      <span class="nav-wordmark">Addiyon Keyboard</span>
    </a>
    <div class="nav-spacer"></div>
    <div class="nav-right">
      ${links}
      <a href="${alternatePath(page, lang)}" class="nav-link nav-lang" hreflang="${lang}" lang="${lang}" title="${title}">${label}</a>
      <button id="themeToggle" class="theme-toggle" aria-label="${t.toggleTheme}">☾</button>
      <a href="${PLAY_URL}" target="_blank" rel="noopener" class="nav-cta" data-install="nav" aria-label="${t.getAppLabel}">${t.getApp}</a>
    </div>
  </div>`;
}

export function renderFooter(lang: Lang): string {
  const t = copy[lang];
  const cols = t.footCols.map(([heading, links]) => `      <div>
        <p class="foot-h">${heading}</p>
        <div class="foot-links">
${links.map(([rawHref, label]) => { const href = isExternal(rawHref) ? rawHref : canonicalPath(rawHref); return `          <a href="${href}"${linkAttrs(href)}>${label}</a>`; }).join('\n')}
        </div>
      </div>`).join('\n');
  return `<div class="wrap">
    <div class="foot-top">
      <div>
        <div class="foot-brand">
          <img src="${LOGO}" width="30" height="30" alt="">
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
  </div>`;
}
