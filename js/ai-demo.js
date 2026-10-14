/* AI quick-edit demo on the home page: a message typed with mistakes, then
   rewritten by the chosen edit. Same script and timing as the Addiyon app's
   keyboard promo screen. Without JS, or with reduced motion, the HTML shows
   the finished Fix grammar result. */
(function(){
  'use strict';
  var root = document.getElementById('aiDemo');
  if(!root) return;
  var msg = root.querySelector('.ai-msg');
  var status = root.querySelector('.ai-status');
  var undo = root.querySelector('.ai-undo');
  var field = root.querySelector('.ai-field');
  var chips = Array.prototype.slice.call(root.querySelectorAll('.ai-chip'));

  var DRAFT = [
    { t:'ዛሪ', bad:true }, { t:' ' }, { t:'ሰብሰባ', bad:true },
    { t:' ላይ መምጣት ' }, { t:'አልቺልም', bad:true }, { t:' ይቅርታ' }
  ];
  var RESULTS = {
    fixGrammar: [
      { t:'ዛሬ', hl:true }, { t:' ' }, { t:'ስብሰባ', hl:true }, { t:' ላይ መምጣት ' },
      { t:'አልችልም፣', hl:true }, { t:' ' }, { t:'ይቅርታ።', hl:true }
    ],
    casual: [{ t:'ዛሬ ስብሰባው ላይ አልመጣም፣ ይቅርታ!' }],
    humanize: [{ t:'ይቅርታ፣ ዛሬ ስብሰባው ላይ መምጣት አልችልም።' }],
    professional: [{ t:'ይቅርታ፣ ዛሬ በስብሰባው ላይ መገኘት አልችልም።' }],
    formal: [{ t:'ይቅርታ እጠይቃለሁ፤ ዛሬ በስብሰባው ላይ መገኘት አልችልም።' }],
    friendly: [{ t:'ይቅርታ ወዳጄ፣ ዛሬ ስብሰባው ላይ መምጣት አልችልም። በቅርቡ እንገናኝ!' }],
    shorten: [{ t:'ዛሬ ስብሰባ አልመጣም፣ ይቅርታ።' }],
    summarize: [{ t:'ዛሬ ስብሰባ ላይ አልገኝም።' }]
  };
  var MISSPELLED = DRAFT.filter(function(s){ return s.bad; }).length;
  var TICK_MS = 240;
  var draftLength = DRAFT.reduce(function(n, s){ return n + s.t.length; }, 0);
  // The draft types two characters per tick.
  var typed = Math.ceil(draftLength / 2);
  var T = { pressing: typed + 5, working: typed + 7, done: typed + 11, end: typed + 28 };

  var edit = 0, tick = T.done, timer = null, visible = false;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function phase(){
    if(tick < typed) return 'typing';
    if(tick < T.pressing) return 'checked';
    if(tick < T.working) return 'pressing';
    if(tick < T.done) return 'working';
    return 'done';
  }

  function draft(chars, showMistakes){
    var out = [], left = chars;
    for(var i = 0; i < DRAFT.length && left > 0; i++){
      var text = DRAFT[i].t.slice(0, left);
      left -= text.length;
      out.push({ t:text, bad: showMistakes && DRAFT[i].bad });
    }
    return out;
  }

  function segments(p, chip){
    if(p === 'done') return RESULTS[chip.getAttribute('data-edit')];
    if(p === 'typing') return draft(tick * 2, false);
    return draft(draftLength, true);
  }

  function statusText(p, chip){
    var name = chip.textContent;
    var isFix = chip.getAttribute('data-edit') === 'fixGrammar';
    if(p === 'checked') return MISSPELLED + ' words look misspelled';
    if(p === 'pressing' || p === 'working') return isFix ? 'Fixing grammar' : 'Rewriting: ' + name;
    if(p === 'done') return isFix ? 'Fixed ' + MISSPELLED + ' mistakes' : 'Rewritten: ' + name;
    return ' ';
  }

  function render(){
    var p = phase(), chip = chips[edit];
    msg.textContent = '';
    segments(p, chip).forEach(function(s){
      var node = s.bad ? document.createElement('u') : s.hl ? document.createElement('mark') : null;
      if(node){ node.textContent = s.t; msg.appendChild(node); }
      else msg.appendChild(document.createTextNode(s.t));
    });
    if(p === 'typing' || p === 'checked'){
      var caret = document.createElement('span');
      caret.className = 'ai-caret';
      caret.textContent = '|';
      msg.appendChild(caret);
    }
    // The message pulses while the edit runs, like the keyboard's busy state.
    msg.style.opacity = p === 'working' ? (tick % 2 === 0 ? '.35' : '.6') : '';
    status.textContent = statusText(p, chip);
    status.classList.toggle('is-warn', p === 'checked');
    status.style.visibility = p === 'typing' ? 'hidden' : '';
    undo.hidden = p !== 'done';
    field.classList.toggle('is-working', p === 'pressing' || p === 'working');
    var applied = p === 'pressing' || p === 'working' || p === 'done';
    chips.forEach(function(c, i){
      var on = applied && i === edit;
      c.classList.toggle('is-on', on);
      c.classList.toggle('is-pressed', on && p === 'pressing');
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function step(){
    tick = tick < T.end ? tick + 1 : 0;
    render();
  }

  function sync(){
    var run = visible && !reduced && !document.hidden;
    if(run && !timer) timer = setInterval(step, TICK_MS);
    if(!run && timer){ clearInterval(timer); timer = null; }
  }

  chips.forEach(function(chip, i){
    chip.addEventListener('click', function(){
      edit = i;
      // Picking an edit replays it from the tap so the rewrite is visible; with reduced motion it jumps to the result.
      tick = reduced ? T.done : T.pressing;
      render();
    });
  });

  if(reduced){ render(); return; }
  tick = 0;
  render();
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.25 }).observe(root);
  } else {
    visible = true;
  }
  document.addEventListener('visibilitychange', sync);
  sync();
})();
