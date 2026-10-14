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


  /* ===== Copy buttons (alphabet chart, numerals, tool output) ===== */
  var toast = null, toastTimer = null;
  function showToast(text){
    if(!toast){
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.classList.remove('is-on'); }, 1400);
  }
  function copyText(text){
    var lang = document.documentElement.lang;
    var done = function(){ showToast((lang === 'am' ? 'ተቀድቷል፦ ' : 'Copied ') + (text.length > 24 ? '' : text)); };
    if(navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(text).then(done, function(){ fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }
  function fallbackCopy(text){
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try{ document.execCommand('copy'); }catch(e){}
    document.body.removeChild(area);
  }
  window.AddiyonCopy = copyText;
  document.addEventListener('click', function(event){
    var button = event.target.closest ? event.target.closest('[data-copy]') : null;
    if(button) copyText(button.getAttribute('data-copy'));
  });

  /* ===== Analytics: install clicks and the opt-out switch on the privacy page ===== */
  document.addEventListener('click', function(event){
    var link = event.target.closest ? event.target.closest('a[href*="play.google.com/store/apps/details?id=com.addiyon.keyboard"]') : null;
    if(link && typeof window.gtag === 'function'){
      window.gtag('event', 'install_android', { placement: link.getAttribute('data-install') || 'link' });
    }
  });
  var analyticsSwitch = document.getElementById('analyticsSwitch');
  if(analyticsSwitch){
    var analyticsOff = false;
    try{ analyticsOff = localStorage.getItem('analytics-off') === '1'; }catch(e){}
    var analyticsState = document.getElementById('analyticsState');
    function renderAnalyticsChoice(){
      analyticsSwitch.textContent = analyticsOff ? 'Turn analytics on' : 'Turn analytics off';
      if(analyticsState) analyticsState.textContent = analyticsOff ? 'Analytics is off in this browser.' : 'Analytics is on in this browser.';
    }
    analyticsSwitch.addEventListener('click', function(){
      analyticsOff = !analyticsOff;
      try{
        if(analyticsOff) localStorage.setItem('analytics-off', '1');
        else localStorage.removeItem('analytics-off');
      }catch(e){}
      if(analyticsOff) window['ga-disable-G-HVXJCY4MR8'] = true;
      renderAnalyticsChoice();
    });
    renderAnalyticsChoice();
  }

  /* ===== Live transliteration demo ===== */
  var tlLatin = document.getElementById('tlLatin');
  var tlFidel = document.getElementById('tlFidel');
  var tlCaret = document.getElementById('tlCaret');
  if(tlLatin && tlFidel){
    var pairs = [
      { l:'amargna', f:'አማርኛ' },
      { l:'qelebet',  f:'ቀለበት' }
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
