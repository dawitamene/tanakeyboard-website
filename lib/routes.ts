// Maps content pages to the English and Amharic route segments.
import { notFound } from 'next/navigation';
import { allPages, pageByPath, type Page } from './content';

const NOT_ROUTED = new Set(['/404']);

const isAmharicPath = (path: string) => path === '/am' || path.startsWith('/am/');

export function englishParams(): { slug: string[] }[] {
  return allPages()
    .filter((page) => !isAmharicPath(page.meta.path) && !NOT_ROUTED.has(page.meta.path))
    .map((page) => ({ slug: page.meta.path.split('/').filter(Boolean) }));
}

export function amharicParams(): { slug: string[] }[] {
  return allPages()
    .filter((page) => isAmharicPath(page.meta.path))
    .map((page) => ({ slug: page.meta.path.split('/').filter(Boolean).slice(1) }));
}

export function pageForSlug(prefix: string, slug: string[] | undefined): Page {
  const path = `${prefix}/${(slug ?? []).join('/')}`.replace(/\/$/, '') || '/';
  const page = pageByPath(path);
  if (!page) notFound();
  return page;
}
