/* Online Amharic typing tool: Latin text in, Fidel out. js/fidel.js gives the instant reading;
   when the engine worker (js/suggest.js) has loaded, finished words use the app's commit choice
   and the bar shows the app's word suggestions and next-word predictions. */
(function(){
  'use strict';
  var input = document.getElementById('latinIn');
  var output = document.getElementById('fidelOut');
  var alts = document.getElementById('alts');
  var tool = document.querySelector('.tool');
  if(!input || !output || !window.Fidel) return;

  var am = document.documentElement.lang === 'am';
  // data-spelling="ti" applies the Tigrinya keyboard's one spelling difference: a bare vowel a is ኣ, not አ.
  var tigrinya = !!tool && tool.getAttribute('data-spelling') === 'ti';
  var STORAGE_KEY = tigrinya ? 'addiyon-typing-draft-ti' : 'addiyon-typing-draft';
  var LATIN = /[A-Za-z]/;
  var choices = {};
  var commits = {};
  var requestedCommits = {};
  var engineState = 'off';
  var engineStatus = '';
  var suggestRequest = 0;

  var text = am ? {
    other: 'ሌላ አጻጻፍ፦',
    suggestions: 'ጥቆማዎች፦',
    next: 'ቀጣይ ቃል፦',
    loading: 'የቃላት ጥቆማ በመጫን ላይ…',
    failed: 'የቃላት ጥቆማ አልተጫነም'
  } : {
    other: 'Other spellings:',
    suggestions: 'Suggestions:',
    next: 'Next word:',
    loading: 'Loading word suggestions…',
    failed: 'Word suggestions could not load'
  };

  var engineUrl = tool && tool.getAttribute('data-engine');
  var engine = engineUrl && window.AddiyonSuggest && window.AddiyonSuggest.supported()
    ? window.AddiyonSuggest.create(engineUrl, onEngineStatus)
    : null;

  function onEngineStatus(status){
    engineState = status.state;
    if(status.state === 'loading'){
      engineStatus = text.loading + (status.total ? ' ' + (status.loaded / 1e6).toFixed(1) + ' / ' + (status.total / 1e6).toFixed(1) + ' MB' : '');
    } else if(status.state === 'failed'){
      engineStatus = text.failed;
    } else {
      engineStatus = '';
      render();
      return;
    }
    renderBar();
  }

  function spell(fidel){
    return tigrinya ? fidel.replace(/አ/g, 'ኣ') : fidel;
  }

  function readings(latin){
    var seen = {};
    return Fidel.readings(latin).map(spell).filter(function(option){
      if(seen[option]) return false;
      seen[option] = true;
      return true;
    });
  }

  function tokens(value){
    return value.split(/(\s+)/);
  }

  function isWord(token){
    return !!token && !/^\s+$/.test(token);
  }

  function choiceKey(index, latin){
    return index + '|' + latin;
  }

  function isFinished(parts, index){
    return index < parts.length - 1;
  }

  function wordOutput(parts, index){
    var latin = parts[index];
    var chosen = choices[choiceKey(index, latin)];
    if(chosen) return chosen;
    if(isFinished(parts, index) && commits[latin]) return commits[latin];
    return spell(Fidel.transliterate(latin));
  }

  function render(){
    var parts = tokens(input.value);
    output.value = parts.map(function(part, index){
      return isWord(part) ? wordOutput(parts, index) : part;
    }).join('');
    requestCommits(parts);
    renderBar();
    try{ localStorage.setItem(STORAGE_KEY, input.value); }catch(e){}
  }

  function requestCommits(parts){
    if(!engine || engineState !== 'ready') return;
    var raws = [];
    parts.forEach(function(part, index){
      if(isWord(part) && isFinished(parts, index) && LATIN.test(part) && !commits[part] && !requestedCommits[part]){
        requestedCommits[part] = true;
        raws.push(part);
      }
    });
    if(!raws.length) return;
    engine.request('commit', { raws: raws }).then(function(result){
      var changed = false;
      Object.keys(result).forEach(function(raw){
        if(result[raw] && commits[raw] !== result[raw]){
          commits[raw] = result[raw];
          changed = true;
        }
      });
      if(changed) render();
    }, function(){
      raws.forEach(function(raw){ delete requestedCommits[raw]; });
    });
  }

  function caretPosition(){
    return input.selectionStart == null ? input.value.length : input.selectionStart;
  }

  function wordAtCaret(parts){
    var caret = caretPosition();
    var offset = 0;
    for(var i = 0; i < parts.length; i++){
      var end = offset + parts[i].length;
      if(isWord(parts[i]) && caret > offset && caret <= end) return i;
      offset = end;
    }
    return -1;
  }

  function previousWords(parts, index){
    var words = [];
    for(var i = index - 1; i >= 0 && words.length < 2; i--){
      if(isWord(parts[i])) words.unshift(wordOutput(parts, i).replace(/[።፣፤፥፦፧.,!?]+$/, ''));
    }
    return words;
  }

  function renderBar(){
    var parts = tokens(input.value);
    var index = wordAtCaret(parts);
    if(engine && engineState === 'ready'){
      if(index >= 0 && LATIN.test(parts[index])) showSuggestions(parts, index);
      else if(index < 0 && input.value.trim() && caretPosition() === input.value.length) showPredictions(parts);
      else clearBar();
      return;
    }
    if(engineStatus){
      showStatus(engineStatus);
      return;
    }
    if(index < 0){
      clearBar();
      return;
    }
    var latin = parts[index];
    var options = readings(latin);
    if(options.length < 2){
      clearBar();
      return;
    }
    drawChips(text.other, options, choices[choiceKey(index, latin)] || options[0], function(option){
      choices[choiceKey(index, latin)] = option;
    });
  }

  function showSuggestions(parts, index){
    var latin = parts[index];
    var id = ++suggestRequest;
    engine.request('complete', { raw: latin, previous: previousWords(parts, index) }).then(function(words){
      if(id !== suggestRequest) return;
      var current = wordOutput(parts, index);
      var list = words.slice(0, 6);
      if(list.indexOf(current) < 0) list.unshift(current);
      drawChips(text.suggestions, list.slice(0, 6), choices[choiceKey(index, latin)] || null, function(word){
        choices[choiceKey(index, latin)] = word;
      });
    }, function(){});
  }

  function showPredictions(parts){
    var id = ++suggestRequest;
    engine.request('predict', { previous: previousWords(parts, parts.length), limit: 6 }).then(function(words){
      if(id !== suggestRequest) return;
      if(!words.length){
        clearBar();
        return;
      }
      drawChips(text.next, words, null, function(word){
        var value = input.value;
        var spacer = /\s$/.test(value) ? '' : ' ';
        input.value = value + spacer + word + ' ';
        input.setSelectionRange(input.value.length, input.value.length);
      });
    }, function(){});
  }

  function clearBar(){
    alts.textContent = '';
  }

  function showStatus(message){
    alts.textContent = '';
    var label = document.createElement('span');
    label.className = 'alts-label';
    label.textContent = message;
    alts.appendChild(label);
  }

  function drawChips(labelText, options, selected, onPick){
    alts.textContent = '';
    var label = document.createElement('span');
    label.className = 'alts-label';
    label.textContent = labelText;
    alts.appendChild(label);
    options.forEach(function(option){
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'alt-chip eth' + (option === selected ? ' is-on' : '');
      chip.textContent = option;
      chip.addEventListener('mousedown', function(event){ event.preventDefault(); });
      chip.addEventListener('click', function(){
        onPick(option);
        render();
        input.focus();
      });
      alts.appendChild(chip);
    });
  }

  function startEngine(){
    if(engine && engineState === 'off') engine.start();
  }

  input.addEventListener('input', function(){
    startEngine();
    render();
  });
  input.addEventListener('focus', startEngine);
  input.addEventListener('keyup', function(event){
    if(event.key && event.key.indexOf('Arrow') === 0) renderBar();
  });
  input.addEventListener('click', renderBar);

  document.getElementById('copyOut').addEventListener('click', function(){
    if(output.value) window.AddiyonCopy(output.value);
  });
  document.getElementById('clearIn').addEventListener('click', function(){
    input.value = '';
    choices = {};
    render();
    input.focus();
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-example]'), function(button){
    button.addEventListener('click', function(){
      startEngine();
      input.value = button.getAttribute('data-example') + ' ';
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
