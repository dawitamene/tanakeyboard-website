// Runs Addiyon Keyboard's Amharic suggestion engine (compiled from the app's Kotlin by
// android/web-engine in the preener repo) off the main thread. Data loads on the first message.
import initSqlJs from './sql-wasm.mjs';
import { AmharicWebEngine } from './addiyon-amharic-engine.mjs';

const DATA_FILES = ['amharic.db.gz', 'amharic_verbs.ahrf.gz', 'amharic_verb_stems.dat.gz'];
let engine = null;
let loading = null;

function post(message) {
  self.postMessage(message);
}

async function fetchGunzipped(name, progress) {
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
  const bytes = new Uint8Array(await new Blob(chunks).arrayBuffer());
  const gzipped = bytes[0] === 0x1f && bytes[1] === 0x8b;
  if (!gzipped) return bytes;
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
}

async function load() {
  const progress = { loaded: 0, total: 0 };
  const [SQL, database, verbs, stems] = await Promise.all([
    initSqlJs({ locateFile: (file) => new URL(file, import.meta.url).href }),
    ...DATA_FILES.map((name) => fetchGunzipped(name, progress))
  ]);
  const failures = [];
  engine = new AmharicWebEngine(
    new SQL.Database(database),
    new Int8Array(verbs.buffer, verbs.byteOffset, verbs.byteLength),
    new TextDecoder().decode(stems),
    new URL('.', import.meta.url).pathname,
    (message) => {
      if (failures.length < 5) failures.push(message);
      post({ type: 'warning', message });
    }
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
