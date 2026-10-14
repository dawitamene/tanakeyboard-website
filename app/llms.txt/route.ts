// A plain-text guide to the site for AI assistants and answer engines (llmstxt.org).
import { indexablePages } from '@/lib/content';
import { ORIGIN, PLAY_URL } from '@/lib/site';

export const dynamic = 'force-static';

const SECTIONS: [string, (path: string) => boolean][] = [
  ['Free tools', (path) => ['/amharic-typing', '/amharic-alphabet', '/geez-numbers', '/ethiopian-calendar-converter', '/ethiopian-time', '/ethiopian-age-calculator', '/amharic-name'].includes(path) || path.startsWith('/ethiopian-calendar-20')],
  ['Learn Amharic', (path) => path.startsWith('/learn') || ['/amharic-phrases', '/amharic-numbers', '/amharic-days-and-months', '/amharic-holiday-greetings'].includes(path)],
  ['Ethiopian holidays', (path) => path.startsWith('/holidays')],
  ['Guides', (path) => path.startsWith('/guides')],
  ['Compare Amharic keyboards', (path) => path.startsWith('/compare')],
  ['About the app', (path) => ['/', '/features', '/privacy'].includes(path)]
];

export function GET() {
  const pages = indexablePages().filter((page) => page.meta.lang === 'en');
  const lines = [
    '# Addiyon Keyboard',
    '',
    `> Addiyon Keyboard is a free Android keyboard for typing Amharic in the Ge'ez (Fidel) script by sound with English letters (selam → ሰላም), with offline suggestions, Ge'ez numerals and optional AI edits. Get it on Google Play: ${PLAY_URL}`,
    '',
    'This site also offers free Amharic tools (online typing, alphabet chart, Ge\'ez numbers, Ethiopian calendar and time converters) and guides. Amharic versions of key pages live under /am.',
    ''
  ];
  for (const [title, matches] of SECTIONS) {
    const section = pages.filter((page) => matches(page.meta.path));
    if (!section.length) continue;
    lines.push(`## ${title}`, '');
    for (const page of section) lines.push(`- [${page.meta.title}](${ORIGIN}${page.meta.path === '/' ? '/' : page.meta.path}): ${page.meta.description}`);
    lines.push('');
  }
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
