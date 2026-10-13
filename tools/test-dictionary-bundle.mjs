// Checks that the dictionary bundle rebuilds the exact Android dictionary database:
// same tables, rows, value types, indexes and header pragmas. Uses the same vendored sql.js and
// brotli decoder the browser uses. Run: node tools/test-dictionary-bundle.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { brotliCompressSync, constants } from 'node:zlib';
import { BrotliDecode } from '../src/engine/vendor/brotli/decode.min.js';
import { buildDatabase, encodeBundle } from '../src/engine/dictionary-bundle.mjs';

const require = createRequire(import.meta.url);
const initSqlJs = require('../src/engine/vendor/sql.js/sql-wasm.js');
const ANDROID = process.env.ADDIYON_ANDROID || '/Users/dev/code/preener/android';
const SQL = await initSqlJs({ locateFile: (file) => new URL(`../src/engine/vendor/sql.js/${file}`, import.meta.url).pathname });

function rows(database, sql) {
  const statement = database.prepare(sql);
  const result = [];
  while (statement.step()) result.push(statement.get());
  statement.free();
  return result;
}

const original = new SQL.Database(readFileSync(`${ANDROID}/language/amharic/build/generated/dictionaryAssets/amharic.db`));
const bundle = encodeBundle(original);
const compressed = brotliCompressSync(bundle, { params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_LGWIN]: 24, [constants.BROTLI_PARAM_SIZE_HINT]: bundle.length } });
let started = performance.now();
const decoded = BrotliDecode(new Int8Array(compressed.buffer, compressed.byteOffset, compressed.byteLength));
const decodeMs = performance.now() - started;
assert.deepEqual(Buffer.from(decoded.buffer, decoded.byteOffset, decoded.byteLength), Buffer.from(bundle));
started = performance.now();
const rebuilt = buildDatabase(SQL, decoded);
const buildMs = performance.now() - started;

for (const pragma of ['user_version', 'application_id']) {
  assert.deepEqual(rows(rebuilt, `PRAGMA ${pragma}`), rows(original, `PRAGMA ${pragma}`), pragma);
}
assert.deepEqual(rows(rebuilt, 'SELECT type, name, tbl_name, sql FROM sqlite_master ORDER BY name'), rows(original, 'SELECT type, name, tbl_name, sql FROM sqlite_master ORDER BY name'));
let total = 0;
for (const [table] of rows(original, "SELECT name FROM sqlite_master WHERE type = 'table'")) {
  const columns = rows(original, `PRAGMA table_info("${table}")`).map((column) => `"${column[1]}", typeof("${column[1]}")`).join(', ');
  const before = rows(original, `SELECT ${columns} FROM "${table}"`);
  const after = rows(rebuilt, `SELECT ${columns} FROM "${table}"`);
  assert.equal(after.length, before.length, `${table} row count`);
  assert.deepEqual(after, before, `${table} rows`);
  total += before.length;
}
assert.equal(rows(rebuilt, 'PRAGMA integrity_check')[0][0], 'ok');
console.log(`bundle rebuilds all ${total} rows exactly: ${(bundle.length / 1e6).toFixed(1)} MB text, ${(compressed.length / 1e6).toFixed(2)} MB brotli; decode ${Math.round(decodeMs)} ms, rebuild ${Math.round(buildMs)} ms`);
