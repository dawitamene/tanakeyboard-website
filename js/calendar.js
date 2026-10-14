/* Ethiopian ⇄ Gregorian date converter. Dates go through the Julian Day Number; 1 Meskerem 1 E.C. is JDN 1724221. */
(function(){
  'use strict';
  var ETHIOPIAN_EPOCH = 1724221;
  var am = document.documentElement.lang === 'am';
  var MONTHS_AM = ['መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'];
  var MONTHS_EN = ['Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit', 'Megabit', 'Miyazya', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'];
  var WEEKDAYS_AM = ['ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ', 'እሑድ'];
  var WEEKDAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
  function weekday(j){ return j % 7; }
  function geez(n){ return window.Fidel ? Fidel.toGeez(String(n)) : ''; }

  function amharicDate(e, j){
    return WEEKDAYS_AM[weekday(j)] + '፣ ' + MONTHS_AM[e.m - 1] + ' ' + e.d + ' ቀን ' + e.y + ' ዓ.ም.';
  }
  function ethiopianText(e, j){
    if(am) return amharicDate(e, j);
    return WEEKDAYS_EN[weekday(j)] + ', ' + MONTHS_EN[e.m - 1] + ' ' + e.d + ', ' + e.y + ' E.C.';
  }
  function ethiopianSubText(e, j){
    if(am) return MONTHS_AM[e.m - 1] + ' ' + geez(e.d) + ' ቀን ' + geez(e.y) + ' ዓ.ም.';
    return amharicDate(e, j);
  }
  function gregorianText(g, j){
    var date = new Date(Date.UTC(g.y, g.m - 1, g.d));
    return date.toLocaleDateString(am ? 'en-GB' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  }

  var gInput = document.getElementById('gDate');
  var gOut = document.getElementById('gOut');
  var gSub = document.getElementById('gSub');
  var eDay = document.getElementById('eDay');
  var eMonth = document.getElementById('eMonth');
  var eYear = document.getElementById('eYear');
  var eOut = document.getElementById('eOut');
  var eSub = document.getElementById('eSub');
  var today = document.getElementById('todayEt');
  if(!gInput || !eDay || !eMonth || !eYear) return;

  MONTHS_AM.forEach(function(name, index){
    var option = document.createElement('option');
    option.value = String(index + 1);
    option.textContent = am ? name : MONTHS_EN[index] + ' (' + name + ')';
    eMonth.appendChild(option);
  });

  function showError(out, sub, message){
    out.textContent = message;
    out.classList.add('is-error');
    sub.textContent = '';
  }

  function fromGregorian(){
    var parts = gInput.value.split('-').map(Number);
    if(parts.length !== 3 || !parts[0]){ showError(gOut, gSub, am ? 'ቀን ይምረጡ' : 'Pick a date'); return; }
    var j = gregorianToJdn(parts[0], parts[1], parts[2]);
    var e = jdnToEthiopian(j);
    gOut.classList.remove('is-error');
    gOut.textContent = ethiopianText(e, j);
    gSub.textContent = ethiopianSubText(e, j);
  }

  function fromEthiopian(){
    var y = parseInt(eYear.value, 10), m = parseInt(eMonth.value, 10), d = parseInt(eDay.value, 10);
    var maxDay = m === 13 ? pagumeDays(y) : 30;
    if(!y || y < 1 || y > 9999 || !d || d < 1 || d > maxDay){
      showError(eOut, eSub, am ? 'ትክክለኛ ቀን ያስገቡ (ጳጉሜ ' + pagumeDays(y || 1) + ' ቀን አለው)' : 'Enter a valid date (Pagume has ' + pagumeDays(y || 1) + ' days that year)');
      return;
    }
    var j = ethiopianToJdn(y, m, d);
    eOut.classList.remove('is-error');
    eOut.textContent = gregorianText(jdnToGregorian(j), j);
    eSub.textContent = ethiopianText({ y: y, m: m, d: d }, j);
  }

  var now = new Date();
  var todayJdn = gregorianToJdn(now.getFullYear(), now.getMonth() + 1, now.getDate());
  var todayE = jdnToEthiopian(todayJdn);
  gInput.value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  eDay.value = String(todayE.d);
  eMonth.value = String(todayE.m);
  eYear.value = String(todayE.y);
  if(today) today.textContent = ethiopianText(todayE, todayJdn);

  gInput.addEventListener('input', fromGregorian);
  [eDay, eMonth, eYear].forEach(function(field){ field.addEventListener('input', fromEthiopian); });
  document.querySelectorAll('[data-copy-from]').forEach(function(button){
    button.addEventListener('click', function(){
      var source = document.getElementById(button.getAttribute('data-copy-from'));
      if(source && source.textContent && !source.classList.contains('is-error')) window.AddiyonCopy(source.textContent);
    });
  });
  fromGregorian();
  fromEthiopian();

})();
