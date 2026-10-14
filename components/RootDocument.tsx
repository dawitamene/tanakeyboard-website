import type { ReactNode } from 'react';
import { preload } from 'react-dom';
import { ASSET_VERSION, type Lang } from '@/lib/site';

// Sets the saved or system theme before the first paint, so the page never flashes the wrong colors.
const THEME_SCRIPT = `(function(){var t=null;try{t=localStorage.getItem('theme');}catch(e){}t=t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);})();`;

export function RootDocument({ lang, children }: { lang: Lang; children: ReactNode }) {
  preload('/fonts/Pally-Bold.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="stylesheet" href={`/css/site.css?v=${ASSET_VERSION}`} />
      </head>
      <body>{children}</body>
    </html>
  );
}
