/* Ethiopian ⇄ Gregorian date converter, using the calendar math in js/ethiopic-date.js. */
(function(){
  'use strict';
  if(!window.EthiopicDate) return;
  var E = window.EthiopicDate;
  var am = document.documentElement.lang === 'am';
  var MONTHS_AM = E.MONTHS_AM, MONTHS_EN = E.MONTHS_EN, WEEKDAYS_AM = E.WEEKDAYS_AM, WEEKDAYS_EN = E.WEEKDAYS_EN;
  var gregorianToJdn = E.gregorianToJdn, jdnToGregorian = E.jdnToGregorian, ethiopianToJdn = E.ethiopianToJdn;
  var jdnToEthiopian = E.jdnToEthiopian, pagumeDays = E.pagumeDays, weekday = E.weekday;
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
