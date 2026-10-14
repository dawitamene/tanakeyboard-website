import { assertInternalLinks, renderBody } from '@/lib/blocks';
import { renderFooter, renderNav } from '@/lib/chrome';
import type { Page } from '@/lib/content';
import { pageSchema } from '@/lib/schema';
import { ASSET_VERSION } from '@/lib/site';
import { Analytics } from './Analytics';

// Renders a content page. Nav, body and footer are static HTML enhanced by the scripts in /js,
// which run on every full page load.
export function PageView({ page }: { page: Page }) {
  const nav = renderNav(page);
  const body = renderBody(page);
  const footer = renderFooter(page.meta.lang);
  assertInternalLinks(page, nav + body + footer);
  const scripts = ['/js/site.js', ...(page.meta.scripts ?? [])];
  return (
    <>
      <nav id="siteNav" dangerouslySetInnerHTML={{ __html: nav }} />
      <main dangerouslySetInnerHTML={{ __html: body }} />
      <footer dangerouslySetInnerHTML={{ __html: footer }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema(page)).replace(/</g, '\\u003c') }} />
      {scripts.map((src) => <script key={src} src={`${src}?v=${ASSET_VERSION}`} defer />)}
      {page.meta.noindex ? null : <Analytics />}
    </>
  );
}
