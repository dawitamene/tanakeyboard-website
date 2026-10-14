import type { MetadataRoute } from 'next';
import { alternatesFor, indexablePages } from '@/lib/content';
import { ORIGIN } from '@/lib/site';

export const dynamic = 'force-static';

const absolute = (path: string) => (path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path}`);

export default function sitemap(): MetadataRoute.Sitemap {
  return indexablePages()
    .sort((a, b) => (a.meta.path === '/' ? -1 : b.meta.path === '/' ? 1 : a.meta.path.localeCompare(b.meta.path)))
    .map((page) => {
      const alternates = alternatesFor(page);
      return {
        url: absolute(page.meta.path),
        lastModified: page.meta.updated,
        ...(alternates.length > 1
          ? { alternates: { languages: Object.fromEntries(alternates.map((alt) => [alt.meta.lang, absolute(alt.meta.path)])) } }
          : {})
      };
    });
}
