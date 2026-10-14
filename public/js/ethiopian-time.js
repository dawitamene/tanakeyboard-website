/* Converts clock time to Ethiopian time, where the day's hours are counted from 6 a.m. (ከጠዋቱ 12 ሰዓት). */
(function(){
  'use strict';
  var input = document.getElementById('clockIn');
  var output = document.getElementById('etOut');
  var sub = document.getElementById('etSub');
  if(!input || !output) return;
  var am = document.documentElement.lang === 'am';
  var PERIODS = [
    { from: 0, am: 'ከሌሊቱ', en: 'at night' },
    { from: 6, am: 'ከጠዋቱ', en: 'in the morning' },
    { from: 12, am: 'ከቀኑ', en: 'in the afternoon' },
    { from: 18, am: 'ከምሽቱ', en: 'in the evening' }
  ];

  function ethiopianHour(hour){ return ((hour + 5) % 12) + 1; }
  function periodFor(hour){
    return PERIODS.filter(function(period){ return hour >= period.from; }).pop();
  }
  function minutesText(minutes){
    if(minutes === 0) return '';
    if(minutes === 30) return ' ተኩል';
    return ' ከ' + minutes + ' ደቂቃ';
  }

  function render(){
    var parts = input.value.split(':').map(Number);
    if(parts.length < 2 || isNaN(parts[0])){ output.textContent = ''; sub.textContent = ''; return; }
    var hour = parts[0], minutes = parts[1];
    var period = periodFor(hour);
    var etHour = ethiopianHour(hour);
    output.textContent = period.am + ' ' + etHour + ' ሰዓት' + minutesText(minutes);
    sub.textContent = am
      ? 'በኢትዮጵያ አቆጣጠር ' + etHour + ':' + String(minutes).padStart(2, '0')
      : etHour + ':' + String(minutes).padStart(2, '0') + ' Ethiopian time, ' + period.en;
  }

  var now = new Date();
  input.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  input.addEventListener('input', render);
  var copy = document.getElementById('etCopy');
  if(copy) copy.addEventListener('click', function(){ if(output.textContent) window.AddiyonCopy(output.textContent); });
  render();
})();
