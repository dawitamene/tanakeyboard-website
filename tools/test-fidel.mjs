// Checks js/fidel.js against cases copied from the Android Transliterator tests.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const Fidel = require('../public/js/fidel.js');
const here = new URL('.', import.meta.url);
const cases = readFileSync(new URL('fidel-cases.tsv', here), 'utf8').trim().split('\n').map((line) => line.split('\t'));
const extra = [['selam', 'ሰላም'], ['amargna', 'አማርኛ'], ['qelebet', 'ቀለበት'], ['ityoPya', 'ኢትዮጵያ'], ['addis abeba', 'አድዲስ አበባ']];
const numerals = [['1', '፩'], ['10', '፲'], ['100', '፻'], ['2026', '፳፻፳፮'], ['10000', '፼'], ['123', '፻፳፫'], ['1000000', '፻፼']];
let failed = 0;
for (const [latin, fidel] of [...cases, ...extra]) {
  const got = Fidel.transliterate(latin);
  if (got !== fidel) { failed++; console.log(`FAIL ${latin}: expected ${fidel}, got ${got}`); }
}
for (const [digits, geez] of numerals) {
  const got = Fidel.toGeez(digits);
  if (got !== geez) { failed++; console.log(`FAIL numeral ${digits}: expected ${geez}, got ${got}`); }
}
console.log(`${cases.length + extra.length + numerals.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
