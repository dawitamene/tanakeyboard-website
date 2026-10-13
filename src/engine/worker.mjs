// Runs Addiyon Keyboard's Amharic suggestion engine (compiled from the app's Kotlin by
// android/web-engine in the preener repo) off the main thread. Data loads on the first message.
// The rebuilt dictionary is kept in Cache Storage, so later visits skip the download and rebuild.
import initSqlJs from './sql-wasm.mjs';
import { BrotliDecode } from './brotli-decode.mjs';
import { buildDatabase } from './dictionary-bundle.mjs';
import { AmharicWebEngine } from './addiyon-amharic-engine.mjs';

const CACHE_NAME = 'addiyon-keyboard-engine';
const BUILT_DATABASE = new URL('amharic.db', import.meta.url).href;
const DICTIONARY = 'amharic-dictionary.txt.br';
const VERBS = 'amharic_verbs.ahrf.br';
const STEMS = 'amharic_verb_stems.dat.gz';
let engine = null;
let loading = null;

function post(message) {
  self.postMessage(message);
}

function startsWith(bytes, prefix) {
  return prefix.every((value, index) => bytes[index] === value);
}

async function download(name, progress) {
  const response = await fetch(new URL(name, import.meta.url));
  if (!response.ok || !response.body) throw new Error(`${name}: HTTP ${response.status}`);
  progress.total += Number(response.headers.get('content-length')) || 0;
  const chunks = [];
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    progress.loaded += value.byteLength;
    post({ type: 'progress', loaded: progress.loaded, total: progress.total });
  }
  return new Uint8Array(await new Blob(chunks).arrayBuffer());
}

function unbrotli(bytes, plainPrefix) {
  if (startsWith(bytes, plainPrefix)) return bytes;
  return BrotliDecode(new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength));
}

async function gunzip(bytes) {
  if (!startsWith(bytes, [0x1f, 0x8b])) return bytes;
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
}

async function cachedDatabaseBytes() {
  try {
    const response = await (await caches.open(CACHE_NAME)).match(BUILT_DATABASE);
    return response ? new Uint8Array(await response.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

async function rememberDatabase(bytes) {
  try {
    const cache = await caches.open(CACHE_NAME);
    for (const request of await cache.keys()) {
      if (request.url !== BUILT_DATABASE) await cache.delete(request);
    }
    await cache.put(BUILT_DATABASE, new Response(bytes, { headers: { 'Content-Type': 'application/vnd.sqlite3' } }));
  } catch (error) {
    post({ type: 'warning', message: `Dictionary not cached: ${error && error.message || error}` });
  }
}

async function load() {
  const progress = { loaded: 0, total: 0 };
  const cached = await cachedDatabaseBytes();
  const [SQL, dictionary, verbs, stems] = await Promise.all([
    initSqlJs({ locateFile: (file) => new URL(file, import.meta.url).href }),
    cached ? null : download(DICTIONARY, progress),
    download(VERBS, progress),
    download(STEMS, progress)
  ]);
  let database;
  if (cached) {
    database = new SQL.Database(cached);
  } else {
    database = buildDatabase(SQL, unbrotli(dictionary, [...new TextEncoder().encode('ADDIYON-DICT')]));
    await rememberDatabase(database.export());
  }
  const verbBytes = unbrotli(verbs, [0x41, 0x48, 0x52, 0x46]);
  engine = new AmharicWebEngine(
    database,
    new Int8Array(verbBytes.buffer, verbBytes.byteOffset, verbBytes.byteLength),
    new TextDecoder().decode(await gunzip(stems)),
    new URL('.', import.meta.url).pathname,
    (message) => post({ type: 'warning', message })
  );
  engine.warmUp();
  post({ type: 'ready' });
}

function answer(request) {
  switch (request.type) {
    case 'complete':
      return Array.from(engine.complete(request.raw, request.previous || []));
    case 'commit':
      return Object.fromEntries(request.raws.map((raw) => [raw, engine.commitCandidate(raw)]));
    case 'predict':
      return Array.from(engine.predict(request.previous || [], request.limit || 6));
    default:
      throw new Error(`Unknown request ${request.type}`);
  }
}

self.onmessage = async (event) => {
  const request = event.data;
  try {
    if (!loading) loading = load();
    await loading;
    if (request.type === 'start') return;
    post({ type: 'result', id: request.id, value: answer(request) });
  } catch (error) {
    post({ type: 'error', id: request.id, message: String(error && error.message || error) });
  }
};
