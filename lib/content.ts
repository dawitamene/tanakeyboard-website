// Reads every page in content/pages: a <!--meta {json} --> block followed by the page body.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Lang } from './site';

export interface PageMeta {
  path: string;
  lang: Lang;
  title: string;
  description: string;
  updated: string;
  published?: string;
  h1?: string;
  ogTitle?: string;
  cardTitle?: string;
  cardText?: string;
  image?: string;
  translationKey?: string;
  scripts?: string[];
  breadcrumbs?: [string, string | null][];
  faq?: [string, string][];
  schema?: Record<string, unknown>[];
  article?: boolean;
  noindex?: boolean;
  bodyPage?: string;
}

export interface Page {
  meta: PageMeta;
  body: string;
  file: string;
}

const CONTENT_ROOT = join(process.cwd(), 'content', 'pages');

/** Internal URLs never end in a slash, except the home page. */
export function canonicalPath(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

function listSources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return listSources(full);
    return name.endsWith('.html') ? [full] : [];
  });
}

function parseSource(file: string): Page {
  const text = readFileSync(file, 'utf8');
  const match = text.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  const name = relative(CONTENT_ROOT, file);
  if (!match) throw new Error(`${name} has no <!--meta --> block`);
  let raw: PageMeta;
  try {
    raw = JSON.parse(match[1]) as PageMeta;
  } catch (error) {
    throw new Error(`${name} has invalid meta JSON: ${(error as Error).message}`);
  }
  for (const key of ['path', 'title', 'description', 'lang', 'updated'] as const) {
    if (!raw[key]) throw new Error(`${name} meta is missing "${key}"`);
  }
  const meta: PageMeta = {
    ...raw,
    path: canonicalPath(raw.path),
    breadcrumbs: raw.breadcrumbs?.map(([label, path]) => [label, path ? canonicalPath(path) : null])
  };
  return { meta, body: text.slice(match[0].length), file };
}

let cache: Page[] | null = null;

export function allPages(): Page[] {
  if (!cache) {
    cache = listSources(CONTENT_ROOT).map(parseSource);
    const paths = new Set(cache.map((page) => page.meta.path));
    if (paths.size !== cache.length) throw new Error('Two pages share the same path');
  }
  return cache;
}

export function pageByPath(path: string): Page | undefined {
  return allPages().find((page) => page.meta.path === path);
}

export function indexablePages(): Page[] {
  return allPages().filter((page) => !page.meta.noindex);
}

export function alternatesFor(page: Page): Page[] {
  if (!page.meta.translationKey) return [];
  return allPages().filter((other) => other.meta.translationKey === page.meta.translationKey);
}
