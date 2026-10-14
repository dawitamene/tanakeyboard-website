// Generates the holiday, greetings, learning and yearly calendar pages in src/pages from tools/vocab.json and js/ethiopic-date.js.
// Every Amharic word's key string is checked against js/fidel.js first. Update YEARS and UPDATED, then run:
// node tools/generate-pages.mjs && node tools/build.mjs
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');
const E = require(`${SITE}/js/ethiopic-date.js`);
const F = require(`${SITE}/js/fidel.js`);
const V = require('./vocab.json');
const UPDATED = '2026-10-14';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const gText = (j) => { const g = E.jdnToGregorian(j); return `${E.WEEKDAYS_EN[E.weekday(j)]} ${g.d} ${MONTHS[g.m - 1]} ${g.y}`; };
const eText = (j) => { const e = E.jdnToEthiopian(j); return `<span class="eth">${E.MONTHS_AM[e.m - 1]} ${e.d}, ${e.y}</span>`; };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
let bad = 0;
for (const rows of Object.values(V)) for (const [, am, k] of rows) if (F.transliterate(k) !== am) { bad++; console.error('BAD', k); }
if (bad) process.exit(1);

function write(path, meta, body) {
  const file = `${SITE}/src/pages${path.endsWith('/') ? `${path}index` : path}.html`;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `<!--meta\n${JSON.stringify({ path, updated: UPDATED, ...meta }, null, 2)}\n-->\n<main>\n<div class="wrap">\n  <div class="page">\n    <!--crumbs-->\n${body}\n  </div>\n</div>\n</main>\n`);
}
function vocabTable(rows, head = 'English') {
  return `      <table>
        <thead><tr><th>${head}</th><th>Amharic (tap to copy)</th><th>Type this</th></tr></thead>
        <tbody>
${rows.map(([en, am, k]) => `          <tr><td>${en}</td><td><button type="button" class="fc phrase" data-copy="${am}"><span class="eth">${am}</span></button></td><td><code>${esc(k)}</code></td></tr>`).join('\n')}
        </tbody>
      </table>`;
}
const greet = (english) => english.map((name) => V.greetings.find(([en]) => en === name));

// Holidays: the Gregorian year range shown on each page.
const YEARS = [2026, 2027, 2028, 2029, 2030];
const holidays = [
  {
    slug: 'enkutatash', name: 'Enkutatash', am: 'እንቁጣጣሽ', what: 'Ethiopian New Year',
    jdn: (y) => E.ethiopianToJdn(y - 7, 1, 1), etDate: '<span class="eth">መስከረም</span> 1',
    intro: 'Enkutatash is the Ethiopian New Year, on <span class="eth">መስከረም</span> 1. It comes as the long rainy season ends and the hills turn yellow with <span class="eth">አደይ አበባ</span> (Meskel daisies).',
    about: ['Children, especially girls, go from house to house singing <span class="eth">አበባዬ ሆሽ</span> and giving flowers or drawings.', 'Families gather for a holiday meal and coffee, and people wish each other a good year.', 'The date is 11 September, or 12 September in the year after an Ethiopian leap year.'],
    greetings: ['Happy new year', 'Happy new year (full wish)', 'Happy holiday (to everyone)', 'Reply: and to you too', 'Wishing you a year of peace']
  },
  {
    slug: 'meskel', name: 'Meskel', am: 'መስቀል', what: 'the Finding of the True Cross',
    jdn: (y) => E.ethiopianToJdn(y - 7, 1, 17), etDate: '<span class="eth">መስከረም</span> 17',
    intro: 'Meskel, on <span class="eth">መስከረም</span> 17, celebrates the finding of the True Cross. UNESCO lists the celebration as Intangible Cultural Heritage.',
    about: ['On the eve, <span class="eth">መስከረም</span> 16, crowds light the <span class="eth">ደመራ</span> (Demera), a tall bonfire decorated with Meskel daisies.', 'The largest celebration is in Meskel Square in Addis Ababa.', 'The date is 27 September, or 28 September in the year after an Ethiopian leap year.'],
    greetings: ['Happy Meskel', 'Happy holiday (to everyone)', 'Reply: and to you too', 'Happy holiday']
  },
  {
    slug: 'genna', name: 'Genna', am: 'ገና', what: 'Ethiopian Christmas',
    jdn: (y) => E.gregorianToJdn(y, 1, 7), etDate: '<span class="eth">ታኅሣሥ</span> 29 (28 in some years)',
    intro: 'Genna is Ethiopian Orthodox Christmas, celebrated on 7 January. Many people keep a 43-day fast before it.',
    about: ['Church services run through the night before Genna, with worshippers dressed in white <span class="eth">ነጠላ</span> (netela).', 'The fast ends after the service, and families share doro wat and other holiday food.', 'In the Ethiopian calendar it falls on <span class="eth">ታኅሣሥ</span> 29, or <span class="eth">ታኅሣሥ</span> 28 in the year after a leap year, so the Gregorian date stays 7 January.'],
    greetings: ['Merry Christmas', 'Happy holiday (to everyone)', 'Reply: and to you too', 'Happy holiday']
  },
  {
    slug: 'timket', name: 'Timket', am: 'ጥምቀት', what: 'Ethiopian Epiphany',
    jdn: (y) => E.ethiopianToJdn(y - 8, 5, 11), etDate: '<span class="eth">ጥር</span> 11',
    intro: 'Timket, on <span class="eth">ጥር</span> 11, celebrates the baptism of Jesus in the Jordan. UNESCO lists it as Intangible Cultural Heritage.',
    about: ['On the eve, <span class="eth">ከተራ</span> (Ketera), priests carry the tabots from each church to a pool or river in procession.', 'At dawn the water is blessed and sprinkled on the crowd, and the tabots return to their churches with singing and dancing.', 'The date is 19 January, or 20 January in the year after an Ethiopian leap year.'],
    greetings: ['Happy Timket', 'Happy holiday (to everyone)', 'Reply: and to you too', 'Happy holiday']
  },
  {
    slug: 'fasika', name: 'Fasika', am: 'ፋሲካ', what: 'Ethiopian Easter',
    jdn: (y) => E.fasikaJdn(y), etDate: 'changes every year',
    intro: 'Fasika is Ethiopian Orthodox Easter. Its date changes every year and follows the Orthodox calculation, so it is often a week or more after Western Easter.',
    about: ['It ends <span class="eth">ዐቢይ ጾም</span>, the 55-day Lent, during which many people eat no meat, eggs or dairy.', '<span class="eth">ስቅለት</span> (Siklet, Good Friday) comes two days before, and the Easter service runs late into Saturday night.', 'People greet each other with <span class="eth">ክርስቶስ ተንሥአ እሙታን</span>, &#8220;Christ is risen from the dead&#8221;.'],
    greetings: ['Happy Easter', 'Christ is risen', 'Happy holiday (to everyone)', 'Reply: and to you too', 'Happy holiday']
  }
];

for (const h of holidays) {
  const rows = YEARS.map((y) => {
    const j = h.jdn(y);
    const extra = h.slug === 'fasika' ? `<td>${gText(j - 2)}</td><td>${gText(j - 55)}</td>` : '';
    return `          <tr><td>${y}</td><td>${gText(j)}</td><td>${eText(j)}</td>${extra}</tr>`;
  }).join('\n');
  const next = h.jdn(2027) < E.gregorianToJdn(2026, 10, 14) ? h.jdn(2028) : (h.jdn(2026) >= E.gregorianToJdn(2026, 10, 14) ? h.jdn(2026) : h.jdn(2027));
  const extraHead = h.slug === 'fasika' ? '<th>Siklet (Good Friday)</th><th>Lent begins</th>' : '';
  write(`/holidays/${h.slug}`, {
    lang: 'en',
    title: `${h.name} ${E.jdnToGregorian(next).y} – Date, Meaning and Amharic Greetings`,
    h1: `${h.name} (<span class="eth">${h.am}</span>)`,
    cardTitle: `${h.name}`,
    cardText: `${h.what[0].toUpperCase()}${h.what.slice(1)}: dates for ${YEARS[0]}–${YEARS.at(-1)} and greetings to copy.`,
    description: `When is ${h.name} (${h.what})? Next: ${gText(next)}. Dates for ${YEARS[0]}–${YEARS.at(-1)}, what the day means, and Amharic greetings to copy and send.`,
    breadcrumbs: [['Ethiopian holidays', '/holidays/'], [h.name, null]],
    article: true,
    faq: [
      [`When is ${h.name} ${E.jdnToGregorian(next).y}?`, `${gText(next)}, which is ${eText(next)} in the Ethiopian calendar.`],
      [`How do you say happy ${h.name} in Amharic?`, `${greet(h.greetings).slice(0, 1).map(([, am]) => `<span class="eth">${am}</span>`).join('')}. To wish everyone a good holiday, say <span class="eth">እንኳን አደረሳችሁ</span>; the usual reply is <span class="eth">እንኳን አብሮ አደረሰን</span>.`]
    ]
  }, `    <h1>${h.name} (<span class="eth">${h.am}</span>)</h1>
    <p class="standfirst">${h.intro} The next ${h.name} is on <strong>${gText(next)}</strong>.</p>
    <!--updated-->

    <div class="prose lead-block">
      <h2>${h.name} dates</h2>
      <table>
        <thead><tr><th>Year</th><th>Date</th><th>Ethiopian date</th>${extraHead}</tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
      <p>In the Ethiopian calendar: ${h.etDate}. Convert other dates with the <a href="/ethiopian-calendar-converter">Ethiopian calendar converter</a>.</p>

      <h2>About ${h.name}</h2>
      <ul>
${h.about.map((line) => `        <li>${line}</li>`).join('\n')}
      </ul>

      <h2>${h.name} greetings in Amharic</h2>
${vocabTable(greet(h.greetings), 'Meaning')}
      <p>More wishes for every holiday are on <a href="/amharic-holiday-greetings">Amharic holiday greetings</a>.</p>
    </div>

    <!--faq-->
    <!--related:/holidays/,/amharic-holiday-greetings,/ethiopian-calendar-2019,/ethiopian-calendar-converter-->
    <!--cta-->`);
}

write('/holidays/', {
  lang: 'en',
  title: 'Ethiopian Holidays 2026–2027 – Dates and Amharic Greetings',
  h1: 'Ethiopian holidays',
  cardTitle: 'Ethiopian holidays',
  cardText: 'Enkutatash, Meskel, Genna, Timket and Fasika: dates and greetings.',
  description: 'Dates of the main Ethiopian holidays: Enkutatash, Meskel, Genna, Timket and Fasika, with their Ethiopian dates and Amharic greetings to copy.',
  breadcrumbs: [['Ethiopian holidays', null]]
}, `    <h1>Ethiopian holidays</h1>
    <p class="standfirst">The main holidays of the Ethiopian year, with their next dates and the greetings people send.</p>
    <!--updated-->
    <div class="prose lead-block">
      <table>
        <thead><tr><th>Holiday</th><th>Next date</th><th>Ethiopian date</th></tr></thead>
        <tbody>
${holidays.map((h) => { const j = [2026, 2027, 2028].map(h.jdn).find((x) => x >= E.gregorianToJdn(2026, 10, 14)); return `          <tr><td><a href="/holidays/${h.slug}">${h.name}</a> (<span class="eth">${h.am}</span>)</td><td>${gText(j)}</td><td>${eText(j)}</td></tr>`; }).join('\n')}
        </tbody>
      </table>
      <p>National days fixed to the Gregorian calendar include Adwa Victory Day (2 March), Labour Day (1 May), Patriots&#8217; Victory Day (5 May) and Derg Downfall Day (28 May). Muslim holidays follow the moon and are announced each year. The <a href="/ethiopian-calendar-2019">2019 E.C. calendar</a> marks the fixed ones.</p>
    </div>
    <!--related:/holidays/enkutatash,/holidays/meskel,/holidays/genna,/holidays/timket,/holidays/fasika,/amharic-holiday-greetings-->
    <!--cta-->`);

write('/amharic-holiday-greetings', {
  lang: 'en',
  title: 'Amharic Holiday Greetings – New Year, Christmas and Easter Wishes',
  h1: 'Amharic holiday greetings',
  cardTitle: 'Amharic holiday greetings',
  cardText: 'እንኳን አደረሳችሁ and other wishes for every Ethiopian holiday, ready to copy.',
  description: 'Amharic greetings for Ethiopian holidays: እንኳን አደረሳችሁ, Happy New Year, Merry Christmas, Happy Easter and more. Tap to copy, with the keys that type each one.',
  breadcrumbs: [['Amharic holiday greetings', null]],
  article: true,
  faq: [
    ['What does እንኳን አደረሳችሁ mean?', 'Roughly &#8220;glad you have reached this day&#8221;. It is the standard wish for any holiday, said to a group or family. The usual reply is <span class="eth">እንኳን አብሮ አደረሰን</span>, &#8220;glad we reached it together&#8221;.'],
    ['How do I send these on WhatsApp or Telegram?', 'Tap a greeting to copy it, then paste it into your chat. To write your own message in Amharic, install Addiyon Keyboard and type the letters shown in the table.']
  ]
}, `    <h1>Amharic holiday greetings</h1>
    <p class="standfirst">Wishes for Ethiopian holidays and birthdays. Tap one to copy it, or type the letters on the right with an Amharic keyboard.</p>
    <!--updated-->
    <div class="prose lead-block">
${vocabTable(V.greetings, 'Meaning')}
      <p>Holiday dates: <a href="/holidays/enkutatash">Enkutatash</a>, <a href="/holidays/meskel">Meskel</a>, <a href="/holidays/genna">Genna</a>, <a href="/holidays/timket">Timket</a> and <a href="/holidays/fasika">Fasika</a>. More everyday words are on <a href="/amharic-phrases">Common Amharic phrases</a>.</p>
    </div>
    <!--faq-->
    <!--related:/holidays/,/amharic-phrases,/amharic-name,/guides/amharic-keyboard-for-whatsapp-->
    <!--cta-->`);

const learn = [
  ['amharic-family-words', 'family', 'Family Words in Amharic – Mother, Father, Brother, Sister', 'Family words in Amharic', 'Mother, father, brother, sister and more family words in Amharic, with the keys that type them.', 'Family words', 'Talk about family in Amharic: <span class="eth">እናት</span>, <span class="eth">አባት</span>, <span class="eth">ወንድም</span>, <span class="eth">እህት</span>.'],
  ['amharic-colors', 'colors', 'Colors in Amharic – Red, Blue, Green and More', 'Colors in Amharic', 'Red, blue, green, yellow and every common color in Amharic, with the keys that type them.', 'Colors', '<span class="eth">ቀይ</span>, <span class="eth">ሰማያዊ</span>, <span class="eth">አረንጓዴ</span> and every common color.'],
  ['amharic-food-words', 'food', 'Ethiopian Food Words in Amharic – Injera, Wat, Coffee', 'Ethiopian food words in Amharic', 'Injera, wat, shiro, coffee and other Ethiopian food words in Amharic, with the keys that type them.', 'Food words', '<span class="eth">እንጀራ</span>, <span class="eth">ወጥ</span>, <span class="eth">ቡና</span> and the words for an Ethiopian meal.']
];
for (const [slug, key, title, h1, description, card, cardText] of learn) {
  write(`/learn/${slug}`, {
    lang: 'en', title, h1, cardTitle: h1, cardText, description,
    breadcrumbs: [['Learn Amharic', '/learn/'], [card, null]],
    article: true
  }, `    <h1>${h1}</h1>
    <p class="standfirst">${cardText} Tap a word to copy it, or type the letters on the right with an Amharic keyboard.</p>
    <!--updated-->
    <div class="prose lead-block">
${vocabTable(V[key])}
      <p>New to the letters? Start with the <a href="/amharic-alphabet">Amharic alphabet chart</a>, then practise in the <a href="/amharic-typing">online typing tool</a>.</p>
    </div>
    <!--related:/learn/,/amharic-phrases,/amharic-numbers,/amharic-days-and-months-->
    <!--cta-->`);
}
write('/learn/', {
  lang: 'en',
  title: 'Learn Amharic for Beginners – Alphabet, Words and Phrases',
  h1: 'Learn Amharic for beginners',
  cardTitle: 'Learn Amharic',
  cardText: 'Start with the alphabet, then everyday words and phrases.',
  description: 'A free path for beginners learning Amharic: the Fidel alphabet, greetings, numbers, days and months, family, colors and food words, all with typing keys.',
  breadcrumbs: [['Learn Amharic', null]]
}, `    <h1>Learn Amharic for beginners</h1>
    <p class="standfirst">A simple path for learners and for parents teaching children: learn the letters first, then the words you use every day. Every page shows the English letters that type each word, so you can practise on your phone.</p>
    <!--updated-->
    <div class="prose lead-block">
      <h2>1. Letters</h2>
      <p>Amharic is written in Fidel, where each letter is a whole syllable. Start with the <a href="/amharic-alphabet">Amharic alphabet chart</a> and the <a href="/guides/amharic-typing-rules">typing rules</a>.</p>
      <h2>2. Everyday words</h2>
    </div>
    <!--related:/amharic-phrases,/amharic-numbers,/amharic-days-and-months,/learn/amharic-family-words,/learn/amharic-colors,/learn/amharic-food-words,/amharic-holiday-greetings,/amharic-name-->
    <div class="prose lead-block">
      <h2>3. Practise</h2>
      <p>Write sentences in the <a href="/amharic-typing">online Amharic typing tool</a>, or install Addiyon Keyboard to type Amharic in every app on your phone.</p>
    </div>
    <!--cta-->`);

for (const [path, lang, year] of [['/ethiopian-calendar-2020', 'en', 2020], ['/am/ethiopian-calendar-2019', 'am', 2019]]) {
  const first = E.ethiopianToJdn(year, 1, 1), last = E.ethiopianToJdn(year, 13, E.pagumeDays(year));
  const leap = E.pagumeDays(year) === 6;
  if (lang === 'en') {
    write(path, {
      lang, title: `Ethiopian Calendar ${year} E.C. (${E.jdnToGregorian(first).y}–${E.jdnToGregorian(last).y}) – All 13 Months`,
      h1: `Ethiopian calendar ${year}`, cardTitle: `Ethiopian calendar ${year}`,
      cardText: `Every day of ${year} E.C. with its Gregorian date and the fixed holidays.`,
      description: `The full Ethiopian calendar for ${year} E.C. (September ${E.jdnToGregorian(first).y} to September ${E.jdnToGregorian(last).y}): all 13 months with Gregorian dates, weekdays and holidays. Printable.`,
      breadcrumbs: [['Ethiopian calendar converter', '/ethiopian-calendar-converter'], [`${year} E.C.`, null]],
      article: true,
      faq: [[`When does ${year} E.C. start and end?`, `It starts on <span class="eth">መስከረም</span> 1, ${gText(first)}, and ends on <span class="eth">ጳጉሜ</span> ${E.pagumeDays(year)}, ${gText(last)}.`],
        [`Is ${year} E.C. a leap year?`, leap ? `Yes, so <span class="eth">ጳጉሜ</span> has 6 days.` : `No. <span class="eth">ጳጉሜ</span> has 5 days. The next leap year is ${year + ((3 - year % 4 + 4) % 4 || 4)} E.C.`]]
    }, `    <h1>Ethiopian calendar ${year}</h1>
    <p class="standfirst">Every day of ${year} E.C. (<span class="eth">${F.toGeez(String(year))} ዓ.ም.</span>), from ${gText(first)} to ${gText(last)}. Holidays fixed to a date are marked; Fasika and Muslim holidays move each year.</p>
    <!--updated-->
    <!--ethiopian-year:${year}-->
    <!--faq-->
    <!--related:/ethiopian-calendar-2019,/ethiopian-calendar-converter,/holidays/,/ethiopian-age-calculator-->
    <!--cta-->`);
  } else {
    write(path, {
      lang, translationKey: 'calendar2019',
      title: `የ${year} ዓ.ም. የቀን መቁጠሪያ – 13ቱ ወራት ከፈረንጅ ቀን ጋር`,
      h1: `የ${year} ዓ.ም. ቀን መቁጠሪያ`, cardTitle: `የ${year} ዓ.ም. ቀን መቁጠሪያ`,
      cardText: `የ${year} ዓ.ም. ሁሉም ቀናት ከፈረንጅ ቀናቸውና ከበዓላት ጋር።`,
      description: `የ${year} ዓ.ም. ሙሉ የቀን መቁጠሪያ፦ 13ቱም ወራት ከፈረንጅ ቀን፣ ከሳምንቱ ቀናትና ከበዓላት ጋር። ለህትመት የሚመች።`,
      breadcrumbs: [['የቀን መቀየሪያ', '/am/ethiopian-calendar-converter'], [`${year} ዓ.ም.`, null]]
    }, `    <h1>የ${year} ዓ.ም. ቀን መቁጠሪያ</h1>
    <p class="standfirst">የ${year} ዓ.ም. ሁሉም ቀናት። በእያንዳንዱ ሳጥን ውስጥ ትልቁ ቁጥር የኢትዮጵያ ቀን፣ ከሥሩ ያለው የፈረንጅ ቀን ነው። ${leap ? 'ዘንድሮ ዘመነ ሉቃስ ስለሆነ ጳጉሜ 6 ቀናት አሏት።' : ''}</p>
    <!--updated-->
    <!--ethiopian-year:${year}-->
    <!--related:/am/ethiopian-calendar-converter,/am/ethiopian-time,/am/geez-numbers-->
    <!--cta-->`);
  }
}
console.log('pages written');
