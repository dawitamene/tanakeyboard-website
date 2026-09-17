(function(){
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== Navbar scroll state ===== */
  var siteNav = document.getElementById('siteNav');
  function syncNavState(){
    if(!siteNav) return;
    siteNav.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  syncNavState();
  window.addEventListener('scroll', syncNavState, { passive:true });

  /* ===== Theme toggle ===== */
  var themeBtn = document.getElementById('themeToggle');
  function applyGlyph(){
    if(!themeBtn) return;
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeBtn.textContent = isDark ? '☀' : '☾';
  }
  applyGlyph();
  if(themeBtn){
    themeBtn.addEventListener('click', function(){
      var cur = document.documentElement.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try{ localStorage.setItem('theme', next); }catch(e){}
      applyGlyph();
    });
  }

  /* ===== Live transliteration demo ===== */
  var tlLatin = document.getElementById('tlLatin');
  var tlFidel = document.getElementById('tlFidel');
  var tlCaret = document.getElementById('tlCaret');
  if(tlLatin && tlFidel){
    var pairs = [
      { l:'amarigna', f:'አማርኛ' },
      { l:'kelebet',  f:'ቀለበት' }
    ];

    if(reduced){
      if(tlCaret) tlCaret.style.display = 'none';
      tlLatin.textContent = pairs[0].l;
      tlFidel.textContent = pairs[0].f;
    } else {
      var alive = true;
      function sleep(ms){ return new Promise(function(res){ setTimeout(res, ms); }); }
      async function loop(){
        var i = 0;
        while(alive){
          var pair = pairs[i % pairs.length];
          i++;
          tlLatin.textContent = '';
          tlFidel.textContent = '';
          await sleep(260);
          if(!alive) return;
          for(var c = 0; c < pair.l.length; c++){
            if(!alive) return;
            tlLatin.textContent += pair.l[c];
            await sleep(95);
          }
          if(!alive) return;
          await sleep(160);
          tlFidel.textContent = pair.f;
          await sleep(1900);
          if(!alive) return;
        }
      }
      loop();
      window.addEventListener('beforeunload', function(){ alive = false; });
    }
  }
})();
