import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTypescript,
  // App Router root layouts render <head> directly; the rule targets the Pages Router.
  { files: ['components/RootDocument.tsx'], rules: { '@next/next/no-head-element': 'off' } },
  { ignores: ['out/**', '.next/**', 'public/**', 'worker/**', 'tools/**', 'src/engine/**', 'next-env.d.ts'] }
];

export default config;
