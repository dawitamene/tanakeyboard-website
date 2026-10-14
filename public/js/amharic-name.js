/* Shows a name in Fidel: the usual spelling for names in the page's table, otherwise Fidel.transliterate by sound. */
(function(){
  'use strict';
  var input = document.getElementById('nameIn');
  var output = document.getElementById('nameOut');
  var note = document.getElementById('nameNote');
  var copy = document.getElementById('nameCopy');
  if(!input || !output || !window.Fidel) return;
  var known = {};
  document.querySelectorAll('tr[data-name]').forEach(function(row){
    known[row.getAttribute('data-name')] = { amharic: row.getAttribute('data-am'), label: row.cells[0].textContent };
  });

  function render(){
    var name = input.value.trim();
    if(!name){ output.textContent = ''; note.textContent = ''; return; }
    var usual = known[name.toLowerCase()];
    if(usual){
      output.textContent = usual.amharic;
      note.textContent = 'The usual Amharic spelling of ' + usual.label + '.';
      return;
    }
    output.textContent = Fidel.transliterate(name);
    note.textContent = 'Spelled by sound. Change the letters until it reads right.';
  }
  input.addEventListener('input', render);
  copy.addEventListener('click', function(){ if(output.textContent) window.AddiyonCopy(output.textContent); });
  render();
})();
