/* Ethiopian and Gregorian calendar math shared by the browser tools and tools/build.mjs.
   Dates go through the Julian Day Number; 1 Meskerem 1 E.C. is JDN 1724221. */
(function(root){
  'use strict';
  var ETHIOPIAN_EPOCH = 1724221;

  function gregorianToJdn(y, m, d){
    var a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }
  function jdnToGregorian(j){
    var a = j + 32044, b = Math.floor((4 * a + 3) / 146097), c = a - Math.floor(146097 * b / 4);
    var d = Math.floor((4 * c + 3) / 1461), e = c - Math.floor(1461 * d / 4), m = Math.floor((5 * e + 2) / 153);
    return { y: 100 * b + d - 4800 + Math.floor(m / 10), m: m + 3 - 12 * Math.floor(m / 10), d: e - Math.floor((153 * m + 2) / 5) + 1 };
  }
  function ethiopianToJdn(y, m, d){
    return ETHIOPIAN_EPOCH + 365 * (y - 1) + Math.floor(y / 4) + 30 * (m - 1) + d - 1;
  }
  function jdnToEthiopian(j){
    var y = Math.floor((4 * (j - ETHIOPIAN_EPOCH) + 1463) / 1461);
    var day = j - ethiopianToJdn(y, 1, 1);
    return { y: y, m: Math.floor(day / 30) + 1, d: (day % 30) + 1 };
  }
  function pagumeDays(y){ return y % 4 === 3 ? 6 : 5; }
  // Monday is 0 and Sunday is 6.
  function weekday(j){ return j % 7; }
  // Orthodox Easter (Fasika): Julian computus, shifted to the Gregorian calendar (valid 1900–2099).
  function fasikaJdn(gregorianYear){
    var a = gregorianYear % 4, b = gregorianYear % 7, c = gregorianYear % 19;
    var d = (19 * c + 15) % 30, e = (2 * a + 4 * b - d + 34) % 7;
    var month = Math.floor((d + e + 114) / 31), day = ((d + e + 114) % 31) + 1;
    return gregorianToJdn(gregorianYear, month, day) + 13;
  }

  var api = {
    gregorianToJdn: gregorianToJdn, jdnToGregorian: jdnToGregorian,
    ethiopianToJdn: ethiopianToJdn, jdnToEthiopian: jdnToEthiopian,
    pagumeDays: pagumeDays, weekday: weekday, fasikaJdn: fasikaJdn,
    MONTHS_AM: ['መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'],
    MONTHS_EN: ['Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit', 'Megabit', 'Miyazya', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'],
    WEEKDAYS_AM: ['ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ', 'እሑድ'],
    WEEKDAYS_EN: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  };
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EthiopicDate = api;
})(this);
