/* Ethiopian age calculator: birth date in either calendar, age by the Ethiopian calendar, and the next Ethiopian birthday. */
(function(){
  'use strict';
  if(!window.EthiopicDate) return;
  var E = window.EthiopicDate;
  var gInput = document.getElementById('birthG');
  var eDay = document.getElementById('birthDay');
  var eMonth = document.getElementById('birthMonth');
  var eYear = document.getElementById('birthYear');
  var output = document.getElementById('ageOut');
  var detail = document.getElementById('ageDetail');
  if(!gInput || !eDay || !eMonth || !eYear || !output) return;

  E.MONTHS_AM.forEach(function(name, index){
    var option = document.createElement('option');
    option.value = String(index + 1);
    option.textContent = E.MONTHS_EN[index] + ' (' + name + ')';
    eMonth.appendChild(option);
  });

  var now = new Date();
  var todayJdn = E.gregorianToJdn(now.getFullYear(), now.getMonth() + 1, now.getDate());
  var today = E.jdnToEthiopian(todayJdn);

  function ethiopianLabel(e){ return E.MONTHS_EN[e.m - 1] + ' ' + e.d + ', ' + e.y + ' E.C. (' + E.MONTHS_AM[e.m - 1] + ' ' + e.d + ' ቀን ' + e.y + ' ዓ.ም.)'; }
  function gregorianLabel(j){
    var g = E.jdnToGregorian(j);
    return new Date(Date.UTC(g.y, g.m - 1, g.d)).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  }
  function birthdayJdn(birth, year){
    var day = birth.m === 13 ? Math.min(birth.d, E.pagumeDays(year)) : birth.d;
    return E.ethiopianToJdn(year, birth.m, day);
  }

  function show(birthJdn){
    if(birthJdn > todayJdn){ output.textContent = 'That date is in the future'; output.classList.add('is-error'); detail.textContent = ''; return; }
    var birth = E.jdnToEthiopian(birthJdn);
    var age = today.y - birth.y;
    if(birthdayJdn(birth, today.y) > todayJdn) age -= 1;
    var next = birthdayJdn(birth, birth.y + age + 1);
    output.classList.remove('is-error');
    output.textContent = age + (age === 1 ? ' year old' : ' years old');
    detail.textContent = 'Born ' + ethiopianLabel(birth) + '. Next Ethiopian birthday: ' + gregorianLabel(next) + '.';
  }

  function fromGregorian(){
    var parts = gInput.value.split('-').map(Number);
    if(parts.length !== 3 || !parts[0]) return;
    var j = E.gregorianToJdn(parts[0], parts[1], parts[2]);
    var e = E.jdnToEthiopian(j);
    eDay.value = String(e.d); eMonth.value = String(e.m); eYear.value = String(e.y);
    show(j);
  }
  function fromEthiopian(){
    var y = parseInt(eYear.value, 10), m = parseInt(eMonth.value, 10), d = parseInt(eDay.value, 10);
    if(!y || y < 1 || !d || d < 1 || d > (m === 13 ? E.pagumeDays(y) : 30)){
      output.textContent = 'Enter a valid Ethiopian date'; output.classList.add('is-error'); detail.textContent = ''; return;
    }
    var j = E.ethiopianToJdn(y, m, d);
    var g = E.jdnToGregorian(j);
    gInput.value = g.y + '-' + String(g.m).padStart(2, '0') + '-' + String(g.d).padStart(2, '0');
    show(j);
  }

  gInput.value = '2000-01-01';
  gInput.addEventListener('input', fromGregorian);
  [eDay, eMonth, eYear].forEach(function(field){ field.addEventListener('input', fromEthiopian); });
  fromGregorian();
})();
