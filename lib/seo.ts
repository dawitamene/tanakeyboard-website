// Next.js metadata for a page: title, description, canonical URL, hreflang alternates and social cards.
import type { Metadata } from 'next';
import { alternatesFor, type Page } from './content';
import { DEFAULT_IMAGE, LANGS, ORIGIN, SITE_NAME } from './site';

export function pageMetadata(page: Page): Metadata {
  const { meta } = page;
  const alternates = alternatesFor(page);
  const languages: Record<string, string> = {};
  if (alternates.length > 1) {
    for (const alt of alternates) languages[alt.meta.lang] = alt.meta.path;
    const english = alternates.find((alt) => alt.meta.lang === 'en');
    if (english) languages['x-default'] = english.meta.path;
  }
  const image = `/img/${meta.image || DEFAULT_IMAGE.replace('/img/', '')}`;
  const title = meta.ogTitle || meta.title;
  return {
    metadataBase: new URL(ORIGIN),
    title: { absolute: meta.title },
    description: meta.description,
    alternates: meta.noindex ? undefined : { canonical: meta.path, languages },
    robots: meta.noindex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: {
      type: meta.path === LANGS[meta.lang].home ? 'website' : 'article',
      url: meta.path,
      title,
      description: meta.description,
      siteName: SITE_NAME,
      locale: LANGS[meta.lang].locale,
      alternateLocale: alternates.filter((alt) => alt.meta.lang !== meta.lang).map((alt) => LANGS[alt.meta.lang].locale),
      images: [{ url: image, alt: SITE_NAME }],
      ...(meta.article ? { modifiedTime: meta.updated } : {})
    },
    twitter: { card: 'summary_large_image', title, description: meta.description, images: [image] },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/img/icon-192.png', type: 'image/png', sizes: '192x192' },
        { url: '/img/logo.svg?v=20261009', type: 'image/svg+xml' }
      ],
      apple: '/img/apple-touch-icon.png'
    },
    appLinks: { android: { package: 'com.addiyon.keyboard', app_name: SITE_NAME } },
    other: { 'google-play-app': 'app-id=com.addiyon.keyboard' }
  };
}
