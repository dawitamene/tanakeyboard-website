/* Online Amharic typing tool: Latin text in, Fidel out, using js/fidel.js. */
(function(){
  'use strict';
  var input = document.getElementById('latinIn');
  var output = document.getElementById('fidelOut');
  var alts = document.getElementById('alts');
  if(!input || !output || !window.Fidel) return;

  var am = document.documentElement.lang === 'am';
  var STORAGE_KEY = 'addiyon-typing-draft';
  var choices = {};

  function tokens(text){
    return text.split(/(\s+)/);
  }

  function choiceKey(index, latin){
    return index + '|' + latin;
  }

  function render(){
    var parts = tokens(input.value);
    output.value = parts.map(function(part, index){
      if(!part || /^\s+$/.test(part)) return part;
      return choices[choiceKey(index, part)] || Fidel.transliterate(part);
    }).join('');
    renderAlternates(parts);
    try{ localStorage.setItem(STORAGE_KEY, input.value); }catch(e){}
  }

  function wordAtCaret(parts){
    var caret = input.selectionStart == null ? input.value.length : input.selectionStart;
    var offset = 0;
    for(var i = 0; i < parts.length; i++){
      var end = offset + parts[i].length;
      if(parts[i] && !/^\s+$/.test(parts[i]) && caret >= offset && caret <= end) return i;
      offset = end;
    }
    for(var j = parts.length - 1; j >= 0; j--) if(parts[j] && !/^\s+$/.test(parts[j])) return j;
    return -1;
  }

  function renderAlternates(parts){
    alts.textContent = '';
    var index = wordAtCaret(parts);
    if(index < 0) return;
    var latin = parts[index];
    var options = Fidel.readings(latin);
    if(options.length < 2) return;
    var current = choices[choiceKey(index, latin)] || options[0];
    var label = document.createElement('span');
    label.className = 'alts-label';
    label.textContent = am ? 'ሌላ አጻጻፍ፦' : 'Other spellings:';
    alts.appendChild(label);
    options.forEach(function(option){
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'alt-chip eth' + (option === current ? ' is-on' : '');
      chip.textContent = option;
      chip.addEventListener('mousedown', function(event){ event.preventDefault(); });
      chip.addEventListener('click', function(){
        choices[choiceKey(index, latin)] = option;
        render();
        input.focus();
      });
      alts.appendChild(chip);
    });
  }

  input.addEventListener('input', render);
  input.addEventListener('keyup', function(){ renderAlternates(tokens(input.value)); });
  input.addEventListener('click', function(){ renderAlternates(tokens(input.value)); });

  document.getElementById('copyOut').addEventListener('click', function(){
    if(output.value) window.AddiyonCopy(output.value);
  });
  document.getElementById('clearIn').addEventListener('click', function(){
    input.value = '';
    choices = {};
    render();
    input.focus();
  });

  var examples = document.querySelectorAll('[data-example]');
  Array.prototype.forEach.call(examples, function(button){
    button.addEventListener('click', function(){
      input.value = button.getAttribute('data-example');
      choices = {};
      render();
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
  });

  try{
    var saved = localStorage.getItem(STORAGE_KEY);
    if(saved) input.value = saved;
  }catch(e){}
  render();
})();
