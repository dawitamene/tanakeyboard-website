// Loads the browser scripts that the build also needs (the Fidel engine and the calendar math),
// so the server-rendered pages and the in-browser tools share one implementation.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface FidelApi {
  transliterate(latin: string): string;
  toGeez(digits: string): string | null;
  families: Record<string, { forms: string; ua?: string }>;
}

export interface EthiopicDateApi {
  gregorianToJdn(y: number, m: number, d: number): number;
  jdnToGregorian(j: number): { y: number; m: number; d: number };
  ethiopianToJdn(y: number, m: number, d: number): number;
  jdnToEthiopian(j: number): { y: number; m: number; d: number };
  pagumeDays(y: number): number;
  weekday(j: number): number;
  fasikaJdn(gregorianYear: number): number;
  MONTHS_AM: string[];
  MONTHS_EN: string[];
  WEEKDAYS_AM: string[];
  WEEKDAYS_EN: string[];
}

/** Runs a UMD browser script as CommonJS and returns its exports; reading it from disk keeps the bundler out. */
function loadBrowserScript<T>(file: string): T {
  const source = readFileSync(join(process.cwd(), 'public', 'js', file), 'utf8');
  const moduleRecord = { exports: {} as T };
  new Function('module', 'exports', source).call({}, moduleRecord, moduleRecord.exports);
  return moduleRecord.exports;
}

export const Fidel = loadBrowserScript<FidelApi>('fidel.js');
export const EthiopicDate = loadBrowserScript<EthiopicDateApi>('ethiopic-date.js');
