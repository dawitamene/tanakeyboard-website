(function(){
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== 7.2 Nav scroll state ===== */
  function updateNav(){
    var nav = document.getElementById('siteNav');
    if(!nav) return;
    var isHome = document.body.getAttribute('data-page') === 'home';
    var atTop = window.scrollY <= 20;
    nav.classList.toggle('nav-solid', !(isHome && atTop));
  }
  window.addEventListener('scroll', updateNav, {passive:true});
  updateNav();

  /* ===== 7.1 Theme toggle ===== */
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

  /* ===== 7.3 Hero entrance ===== */
  var heroEls = document.querySelectorAll('[data-anim="hero"]');
  if(heroEls.length){
    if(reduced){
      heroEls.forEach(function(el){ el.classList.add('is-visible'); });
    } else {
      heroEls.forEach(function(el, i){
        setTimeout(function(){ el.classList.add('is-visible'); }, 90 + i*110);
      });
    }
  }

  /* ===== 7.3 Scroll reveals ===== */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if(revealEls.length){
    if(reduced || !('IntersectionObserver' in window)){
      revealEls.forEach(function(el){ el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
      revealEls.forEach(function(el){ io.observe(el); });
    }
  }

  /* ===== 7.4 Tilt on hover ===== */
  if(!reduced){
    document.querySelectorAll('[data-tilt]').forEach(function(wrapper){
      var inner = wrapper.querySelector('[data-tiltinner]');
      if(!inner || inner.dataset.tiltBound) return;
      inner.dataset.tiltBound = '1';
      var baseTransform = inner.style.transform || '';
      wrapper.addEventListener('mousemove', function(e){
        var r = wrapper.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        inner.style.transform = baseTransform + ' rotateY(' + (px*10).toFixed(2) + 'deg) rotateX(' + (-py*10).toFixed(2) + 'deg)';
      });
      wrapper.addEventListener('mouseleave', function(){
        inner.style.transform = baseTransform;
      });
    });
  }

  /* ===== 7.5 Live transliteration demo ===== */
  var tlLatin = document.getElementById('tlLatin');
  var tlFidel = document.getElementById('tlFidel');
  var tlChip = document.getElementById('tlChip');
  var tlCaret = document.getElementById('tlCaret');
  if(tlLatin && tlFidel && tlChip){
    var pairs = [
      { l:'amarigna', f:'አማርኛ' },
      { l:'kelebet',  f:'ቀለበት' }
    ];

    if(reduced){
      if(tlCaret) tlCaret.style.display = 'none';
      tlLatin.textContent = pairs[0].l;
      tlFidel.textContent = pairs[0].f;
      tlFidel.style.opacity = '1';
      tlFidel.style.transform = 'none';
      tlChip.textContent = pairs[0].f;
      tlChip.style.opacity = '1';
      tlChip.style.transform = 'none';
    } else {
      var alive = true;
      function sleep(ms){ return new Promise(function(res){ setTimeout(res, ms); }); }
      async function loop(){
        var i = 0;
        while(alive){
          var pair = pairs[i % pairs.length];
          i++;
          tlLatin.textContent = '';
          tlFidel.textContent = pair.f;
          tlFidel.style.opacity = '0';
          tlFidel.style.transform = 'translateY(6px)';
          tlChip.textContent = pair.f;
          tlChip.style.opacity = '0';
          tlChip.style.transform = 'translateY(6px)';
          await sleep(260);
          if(!alive) return;
          for(var c = 0; c < pair.l.length; c++){
            if(!alive) return;
            tlLatin.textContent += pair.l[c];
            await sleep(95);
          }
          if(!alive) return;
          await sleep(160);
          tlFidel.style.opacity = '1';
          tlFidel.style.transform = 'none';
          await sleep(420);
          if(!alive) return;
          tlChip.style.opacity = '1';
          tlChip.style.transform = 'none';
          await sleep(1500);
          if(!alive) return;
          tlFidel.style.opacity = '0';
          tlChip.style.opacity = '0';
          await sleep(360);
        }
      }
      loop();
      window.addEventListener('beforeunload', function(){ alive = false; });
    }
  }
})();
