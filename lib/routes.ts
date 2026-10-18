// Maps content pages to the English and Amharic route segments.
import { notFound } from 'next/navigation';
import { allPages, pageByPath, type Page } from './content';

const NOT_ROUTED = new Set(['/404']);

const PREFIXED = ['/am', '/om', '/ti'];

const hasPrefix = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

export function englishParams(): { slug: string[] }[] {
  return allPages()
    .filter((page) => !PREFIXED.some((prefix) => hasPrefix(page.meta.path, prefix)) && !NOT_ROUTED.has(page.meta.path))
    .map((page) => ({ slug: page.meta.path.split('/').filter(Boolean) }));
}

/** Route params for the pages under a language prefix such as /am. */
export function prefixedParams(prefix: string): { slug: string[] }[] {
  return allPages()
    .filter((page) => hasPrefix(page.meta.path, prefix))
    .map((page) => ({ slug: page.meta.path.split('/').filter(Boolean).slice(1) }));
}

export function pageForSlug(prefix: string, slug: string[] | undefined): Page {
  const path = `${prefix}/${(slug ?? []).join('/')}`.replace(/\/$/, '') || '/';
  const page = pageByPath(path);
  if (!page) notFound();
  return page;
}
