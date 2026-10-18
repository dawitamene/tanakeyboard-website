// JSON-LD for every page: the site-wide Organization and WebSite, a WebPage, and per-page
// BreadcrumbList, FAQPage and Article nodes built from the page's meta.
import type { Page } from './content';
import { homePath } from './chrome';
import { copy, DEFAULT_IMAGE, ORIGIN, PLAY_URL, SITE_NAME } from './site';

type Node = Record<string, unknown>;

const ORGANIZATION_ID = `${ORIGIN}/#organization`;
const WEBSITE_ID = `${ORIGIN}/#website`;
const stripTags = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&#8217;/g, '’').replace(/&#8220;|&#8221;/g, '"').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const absolute = (path: string) => (path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path}`);

const siteNodes: Node[] = [
  {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    legalName: 'Addiyon LLC',
    url: `${ORIGIN}/`,
    logo: `${ORIGIN}/img/icon-512.png`,
    email: 'keyboard@addiyon.com',
    sameAs: ['https://t.me/addiyonkeyboard', PLAY_URL]
  },
  {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: `${ORIGIN}/`,
    inLanguage: ['en', 'am', 'om', 'ti'],
    publisher: { '@id': ORGANIZATION_ID }
  }
];

function breadcrumbNode(page: Page): Node | null {
  if (!page.meta.breadcrumbs) return null;
  const items: [string, string | null][] = [[copy[page.meta.lang].home, homePath(page.meta.lang)], ...page.meta.breadcrumbs];
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absolute(page.meta.path)}#breadcrumb`,
    itemListElement: items.map(([name, path], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: stripTags(name),
      item: absolute(path || page.meta.path)
    }))
  };
}

function faqNode(page: Page): Node | null {
  if (!page.meta.faq?.length) return null;
  return {
    '@type': 'FAQPage',
    '@id': `${absolute(page.meta.path)}#faq`,
    mainEntity: page.meta.faq.map(([question, answer]) => ({
      '@type': 'Question',
      name: stripTags(question),
      acceptedAnswer: { '@type': 'Answer', text: stripTags(answer) }
    }))
  };
}

function articleNode(page: Page): Node | null {
  if (!page.meta.article) return null;
  return {
    '@type': 'Article',
    '@id': `${absolute(page.meta.path)}#article`,
    headline: stripTags(page.meta.h1 || page.meta.title),
    description: page.meta.description,
    inLanguage: page.meta.lang,
    datePublished: page.meta.published || page.meta.updated,
    dateModified: page.meta.updated,
    mainEntityOfPage: { '@id': absolute(page.meta.path) },
    image: `${ORIGIN}/img/${page.meta.image || DEFAULT_IMAGE.replace('/img/', '')}`,
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID }
  };
}

export function pageSchema(page: Page): Node {
  const ownIds = new Set((page.meta.schema ?? []).map((node) => node['@id']));
  const url = absolute(page.meta.path);
  const breadcrumb = breadcrumbNode(page);
  const webPage: Node = {
    '@type': 'WebPage',
    '@id': url,
    url,
    name: stripTags(page.meta.title),
    description: page.meta.description,
    inLanguage: page.meta.lang,
    dateModified: page.meta.updated,
    isPartOf: { '@id': WEBSITE_ID },
    ...(breadcrumb ? { breadcrumb: { '@id': breadcrumb['@id'] } } : {})
  };
  const graph = [
    ...siteNodes.filter((node) => !ownIds.has(node['@id'])),
    ...(page.meta.schema ?? []),
    webPage,
    breadcrumb,
    faqNode(page),
    articleNode(page)
  ].filter(Boolean);
  return { '@context': 'https://schema.org', '@graph': graph };
}
