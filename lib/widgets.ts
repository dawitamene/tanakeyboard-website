// Server-rendered widgets that pages embed with <!--placeholders-->: the Fidel chart,
// Ge'ez numeral grids and the printable Ethiopian year calendar.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EthiopicDate, Fidel } from './legacy';
import type { Lang } from './site';

const ALPHABET_ORDER = ['h', 'l', 'H', 'm', 'S', 'r', 's', 'sh', 'q', 'b', 'v', 't', 'ch', 'kh_velar', 'n', 'gn', "'", 'k', 'kh', 'w', '`', 'z', 'zh', 'y', 'd', 'j', 'g', 'T', 'C', 'P', 'ts', 'Ts', 'f', 'p'];
const VOWEL_KEYS = ['e', 'u', 'i', 'a', 'ie', '', 'o'];
const BARE_VOWEL_KEYS: Record<string, string[]> = { "'": ['a', 'u', 'i', '', 'ie', 'e', 'o'], '`': ['A', 'U', 'I', '', '', 'E', 'O'] };

function fidelCell(form: string, label: string): string {
  return `<td><button type="button" class="fc" data-copy="${form}"><span class="eth">${form}</span><span class="fk">${label || '&nbsp;'}</span></button></td>`;
}

export function renderAlphabet(lang: Lang): string {
  const names = lang === 'am'
    ? ['ግዕዝ', 'ካዕብ', 'ሣልስ', 'ራብዕ', 'ኀምስ', 'ሳድስ', 'ሳብዕ']
    : ['1st (ä)', '2nd (u)', '3rd (i)', '4th (a)', '5th (é)', '6th (ə)', '7th (o)'];
  const head = `<tr><th scope="col">${lang === 'am' ? 'ቤት' : 'Letter'}</th>${names.map((name) => `<th scope="col">${name}</th>`).join('')}<th scope="col">${lang === 'am' ? 'ዲቃላ' : 'wa'}</th></tr>`;
  const rows = ALPHABET_ORDER.map((key) => {
    if (key === 'kh_velar') {
      return `<tr class="velar"><th scope="row"><span class="eth">ኀ</span></th>${'ኀኁኂኃኄኅኆ'.split('').map((form) => fidelCell(form, '')).join('')}${fidelCell('ኋ', '')}</tr>`;
    }
    const family = Fidel.families[key];
    const cells = family.forms.split('').map((form, index) => {
      const typed = BARE_VOWEL_KEYS[key] ? BARE_VOWEL_KEYS[key][index] : key + VOWEL_KEYS[index];
      return fidelCell(form, typed && Fidel.transliterate(typed) === form ? typed : '');
    }).join('');
    const ua = family.ua ? fidelCell(family.ua, `${key}ua`) : '<td></td>';
    return `<tr><th scope="row"><span class="eth">${family.forms[0]}</span></th>${cells}${ua}</tr>`;
  }).join('\n');
  return `<div class="chart-scroll"><table class="fidel-chart">\n<thead>${head}</thead>\n<tbody>\n${rows}\n</tbody>\n</table></div>`;
}

function numeralButton(value: number, className: string): string {
  const geez = Fidel.toGeez(String(value)) ?? '';
  return `<button type="button" class="${className}" data-copy="${geez}"><span class="eth">${geez}</span><span class="fk">${value.toLocaleString('en-US')}</span></button>`;
}

export function renderNumberTable(): string {
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 1000, 10000, 100000, 1000000];
  return `<div class="num-grid">${values.map((value) => numeralButton(value, 'num-cell')).join('')}</div>`;
}

export function renderNumbers100(): string {
  return `<div class="num-grid num-100">${Array.from({ length: 100 }, (_, index) => numeralButton(index + 1, 'num-cell small')).join('')}</div>`;
}

const ET_WEEKDAYS = [['እሑድ', 'Sun'], ['ሰኞ', 'Mon'], ['ማክሰኞ', 'Tue'], ['ረቡዕ', 'Wed'], ['ሐሙስ', 'Thu'], ['ዓርብ', 'Fri'], ['ቅዳሜ', 'Sat']];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Holidays fixed in the Ethiopian calendar, then those fixed in the Gregorian calendar.
const ET_HOLIDAYS: Record<string, string> = { '1-1': 'Enkutatash', '1-17': 'Meskel', '5-11': 'Timket' };
const GREGORIAN_HOLIDAYS: Record<string, string> = { '1-7': 'Genna', '3-2': 'Adwa', '5-1': 'Labour Day', '5-5': 'Patriots&#8217; Day', '5-28': 'Derg Downfall Day' };

function renderEthiopianMonth(year: number, month: number): string {
  const amName = EthiopicDate.MONTHS_AM[month - 1];
  const enName = EthiopicDate.MONTHS_EN[month - 1];
  const days = month === 13 ? EthiopicDate.pagumeDays(year) : 30;
  const first = EthiopicDate.ethiopianToJdn(year, month, 1);
  const cells: string[] = Array.from({ length: (first + 1) % 7 }, () => '<td></td>');
  for (let day = 1; day <= days; day++) {
    const g = EthiopicDate.jdnToGregorian(first + day - 1);
    const holiday = ET_HOLIDAYS[`${month}-${day}`] || GREGORIAN_HOLIDAYS[`${g.m}-${g.d}`];
    cells.push(`<td${holiday ? ' class="holiday"' : ''}><span class="et-day">${day}</span><span class="g-day">${SHORT_MONTHS[g.m - 1]} ${g.d}</span>${holiday ? `<span class="hol">${holiday}</span>` : ''}</td>`);
  }
  while (cells.length % 7) cells.push('<td></td>');
  const rows: string[] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(`<tr>${cells.slice(i, i + 7).join('')}</tr>`);
  const start = EthiopicDate.jdnToGregorian(first);
  const end = EthiopicDate.jdnToGregorian(first + days - 1);
  return `<section class="et-month" id="${enName.toLowerCase()}">
      <h3><span class="eth">${amName}</span> ${enName} ${year}<small>${SHORT_MONTHS[start.m - 1]} ${start.d}, ${start.y} – ${SHORT_MONTHS[end.m - 1]} ${end.d}, ${end.y}</small></h3>
      <div class="chart-scroll"><table class="month-grid">
        <thead><tr>${ET_WEEKDAYS.map(([am, en]) => `<th scope="col"><span class="eth">${am}</span><span class="g-day">${en}</span></th>`).join('')}</tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table></div>
    </section>`;
}

export function renderEthiopianYear(year: number): string {
  const jump = EthiopicDate.MONTHS_AM.map((amName, index) => `<a href="#${EthiopicDate.MONTHS_EN[index].toLowerCase()}" class="eth">${amName}</a>`).join('');
  const months = Array.from({ length: 13 }, (_, index) => renderEthiopianMonth(year, index + 1));
  return `<nav class="month-jump" aria-label="Months">${jump}</nav>\n${months.join('\n')}`;
}

export function engineWorkerPath(): string {
  try {
    return `/engine/${readFileSync(join(process.cwd(), 'public', 'engine', 'VERSION'), 'utf8').trim()}/worker.mjs`;
  } catch {
    return '';
  }
}
