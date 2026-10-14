// Run: node tools/test-ethiopic-date.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const E = require('../js/ethiopic-date.js');
const gregorian = (j) => { const g = E.jdnToGregorian(j); return `${g.y}-${g.m}-${g.d}`; };

const knownDays = [
  [[2019, 1, 1], '2026-9-11'], [[2017, 1, 1], '2024-9-11'], [[2016, 1, 1], '2023-9-12'],
  [[2015, 13, 6], '2023-9-11'], [[2019, 13, 6], '2027-9-11'], [[2020, 1, 1], '2027-9-12'],
  [[2019, 9, 20], '2027-5-28'], [[2019, 1, 17], '2026-9-27']
];
for (const [ethiopian, expected] of knownDays) assert.equal(gregorian(E.ethiopianToJdn(...ethiopian)), expected, ethiopian.join('-'));

for (let j = E.gregorianToJdn(1900, 1, 1); j < E.gregorianToJdn(2100, 1, 1); j++) {
  const e = E.jdnToEthiopian(j);
  assert.equal(E.ethiopianToJdn(e.y, e.m, e.d), j);
  assert.ok(e.m >= 1 && e.m <= 13 && e.d >= 1 && e.d <= (e.m === 13 ? E.pagumeDays(e.y) : 30));
}

assert.equal(E.WEEKDAYS_EN[E.weekday(E.gregorianToJdn(2026, 9, 11))], 'Friday');

const fasika = { 2023: '2023-4-16', 2024: '2024-5-5', 2025: '2025-4-20', 2026: '2026-4-12' };
for (const [year, expected] of Object.entries(fasika)) {
  const j = E.fasikaJdn(Number(year));
  assert.equal(gregorian(j), expected, `Fasika ${year}`);
  assert.equal(E.WEEKDAYS_EN[E.weekday(j)], 'Sunday');
}

console.log('ethiopic date tests passed');
