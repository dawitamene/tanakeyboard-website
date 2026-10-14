// Post-build step: every page here is static HTML enhanced by the plain scripts in public/js, so Next.js's
// client runtime (React hydration chunks and RSC payloads) is removed from out/ to keep pages light on slow networks.
// Run automatically after `next build` (see package.json "postbuild").
import { readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUT = join(process.cwd(), 'out');
// RSC payload files start with a row id ("1:...") or a hint (":HL[...").
const RSC_PAYLOAD_FILE = /^(\d+:|:H)/;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const NEXT_SCRIPT_TAG = /<script\b[^>]*\bsrc="\/_next\/[^"]*"[^>]*><\/script>/g;
const NEXT_PRELOAD = /<link\b[^>]*\bhref="\/_next\/[^"]*"[^>]*\/?>/g;
const RSC_PAYLOAD = /<script>(?:\(self\.__next_f=self\.__next_f\|\|\[\]\)\.push|self\.__next_f\.push)\([\s\S]*?<\/script>/g;

let pages = 0;
let payloads = 0;
for (const file of walk(OUT)) {
  const name = relative(OUT, file);
  if (name.startsWith('engine/')) continue;
  if (file.endsWith('.html')) {
    const stripped = readFileSync(file, 'utf8').replace(NEXT_SCRIPT_TAG, '').replace(NEXT_PRELOAD, '').replace(RSC_PAYLOAD, '');
    if (/\/_next\/|__next_f/.test(stripped)) throw new Error(`${name} still references the Next.js runtime`);
    writeFileSync(file, stripped);
    pages++;
  } else if (file.endsWith('.txt') && RSC_PAYLOAD_FILE.test(readFileSync(file, 'utf8').slice(0, 8))) {
    rmSync(file);
    payloads++;
  }
}
rmSync(join(OUT, '_next'), { recursive: true, force: true });
console.log(`Removed the Next.js client runtime from ${pages} pages and ${payloads} payload files`);
