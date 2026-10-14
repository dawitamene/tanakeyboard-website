/* Ge'ez numeral converter, using Fidel.toGeez from js/fidel.js. */
(function(){
  'use strict';
  var input = document.getElementById('numIn');
  var output = document.getElementById('numOut');
  var copy = document.getElementById('numCopy');
  if(!input || !output || !window.Fidel) return;
  var am = document.documentElement.lang === 'am';

  function render(){
    var digits = input.value.replace(/[\s,]/g, '');
    var result = digits ? Fidel.toGeez(digits) : '';
    if(result === null){
      output.textContent = am ? 'ከ1 እስከ 999,999,999,999 ያለ ሙሉ ቁጥር ያስገቡ' : 'Enter a whole number from 1 to 999,999,999,999';
      output.classList.add('is-error');
      copy.disabled = true;
      return;
    }
    output.classList.remove('is-error');
    output.textContent = result;
    copy.disabled = !result;
  }
  input.addEventListener('input', render);
  copy.addEventListener('click', function(){
    if(output.textContent && !output.classList.contains('is-error')) window.AddiyonCopy(output.textContent);
  });
  render();
})();
