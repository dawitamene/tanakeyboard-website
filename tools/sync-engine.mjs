// Copies Addiyon Keyboard's Amharic suggestion engine and its data into engine/<version>/.
// First build the engine and dictionary in the preener repo:
//   /Users/dev/code/preener/android/gradlew -p /Users/dev/code/preener/android/web-engine compileProductionExecutableKotlinJs
//   /Users/dev/code/preener/android/gradlew :language:amharic:generateAmharicDictionaryDb
// Then run: node tools/sync-engine.mjs && node tools/build.mjs
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ANDROID = process.env.ADDIYON_ANDROID || '/Users/dev/code/preener/android';
const ENGINE_JS = join(ANDROID, 'web-engine/build/compileSync/js/main/productionExecutable/kotlin');
const DATABASE = join(ANDROID, 'language/amharic/build/generated/dictionaryAssets/amharic.db');
const ASSETS = join(ANDROID, 'language/amharic/src/main/assets');
const VENDOR = join(ROOT, 'src/engine/vendor/sql.js');
const OUT_ROOT = join(ROOT, 'engine');

function requireFile(path) {
  if (!existsSync(path)) throw new Error(`Missing ${path}. Build it first (see the header of tools/sync-engine.mjs).`);
  return path;
}

const engineFiles = readdirSync(requireFile(ENGINE_JS)).filter((name) => name.endsWith('.mjs'));
if (!engineFiles.includes('addiyon-amharic-engine.mjs')) throw new Error(`No addiyon-amharic-engine.mjs in ${ENGINE_JS}`);

const outputs = new Map();
for (const name of engineFiles) outputs.set(name, readFileSync(join(ENGINE_JS, name)));
outputs.set('worker.mjs', readFileSync(join(ROOT, 'src/engine/worker.mjs')));
outputs.set('sql-wasm.mjs', Buffer.concat([Buffer.from('var module;\n'), readFileSync(requireFile(join(VENDOR, 'sql-wasm.js'))), Buffer.from('\nexport default initSqlJs;\n')]));
outputs.set('sql-wasm.wasm', readFileSync(requireFile(join(VENDOR, 'sql-wasm.wasm'))));
outputs.set('amharic.db.gz', gzipSync(readFileSync(requireFile(DATABASE)), { level: 9 }));
outputs.set('amharic_verbs.ahrf.gz', gzipSync(readFileSync(requireFile(join(ASSETS, 'amharic_verbs.ahrf'))), { level: 9 }));
outputs.set('amharic_verb_stems.dat.gz', readFileSync(requireFile(join(ASSETS, 'amharic_verb_stems.dat'))));
outputs.set('NOTICE.txt', Buffer.from([
  'Addiyon Keyboard web suggestion engine',
  '',
  'Compiled from the Addiyon Keyboard Android source (Addiyon LLC).',
  '',
  'sql.js 1.13.0, MIT license:',
  readFileSync(join(VENDOR, 'LICENSE'), 'utf8'),
  readFileSync(join(ASSETS, 'leipzig_corpora_NOTICE.txt'), 'utf8'),
  'Amharic verb morphology data is derived from HornMorpho (https://github.com/hltdi/HornMorpho),',
  'licensed under the GNU General Public License version 3:',
  '',
  readFileSync(join(ASSETS, 'hornmorpho_LICENSE.txt'), 'utf8')
].join('\n')));

const hash = createHash('sha256');
for (const [name, bytes] of [...outputs].sort(([a], [b]) => a.localeCompare(b))) hash.update(name).update(bytes);
const version = hash.digest('hex').slice(0, 12);

mkdirSync(OUT_ROOT, { recursive: true });
for (const entry of readdirSync(OUT_ROOT)) {
  if (entry !== version && entry !== 'VERSION') rmSync(join(OUT_ROOT, entry), { recursive: true, force: true });
}
const outDir = join(OUT_ROOT, version);
mkdirSync(outDir, { recursive: true });
for (const [name, bytes] of outputs) writeFileSync(join(outDir, name), bytes);
writeFileSync(join(OUT_ROOT, 'VERSION'), `${version}\n`);

const total = [...outputs.values()].reduce((sum, bytes) => sum + bytes.length, 0);
console.log(`engine/${version}: ${outputs.size} files, ${(total / 1e6).toFixed(1)} MB`);
