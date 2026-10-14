import type { NextConfig } from 'next';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Every page is pre-rendered to static HTML in out/, which Cloudflare Pages serves with public/_headers and public/_redirects.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  experimental: { globalNotFound: true }
};

export default nextConfig;
