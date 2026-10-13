// Local preview server mirroring production: the site lives under /keyboard with clean URLs (/keyboard/features -> features.html).
// Run: node tools/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const PORT = Number(process.argv[2] || 3311);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain', '.woff2': 'font/woff2', '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.gz': 'application/octet-stream', '.br': 'application/octet-stream' };

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function resolvePath(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  const base = join(ROOT, safe);
  if (safe.endsWith('/')) return join(base, 'index.html');
  if (await isFile(base)) return base;
  if (await isFile(`${base}.html`)) return `${base}.html`;
  if (await isFile(join(base, 'index.html'))) return join(base, 'index.html');
  return null;
}

createServer(async (request, response) => {
  const fullPath = new URL(request.url, 'http://localhost').pathname;
  if (!fullPath.startsWith('/keyboard/')) {
    response.writeHead(302, { Location: '/keyboard/' });
    response.end();
    return;
  }
  const urlPath = fullPath.slice('/keyboard'.length);
  const file = await resolvePath(urlPath);
  const target = file && await isFile(file) ? file : join(ROOT, '404.html');
  const body = await readFile(target);
  response.writeHead(target.endsWith('404.html') && !urlPath.startsWith('/404') ? 404 : 200, { 'Content-Type': TYPES[extname(target)] || 'application/octet-stream' });
  response.end(body);
}).listen(PORT, '127.0.0.1', () => console.log(`Serving on http://127.0.0.1:${PORT}`));
