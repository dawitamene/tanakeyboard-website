/*
 * Google Analytics, loaded only for verified human visitors on the live domain.
 *
 * Bot sessions (datacenter crawlers, uptime checkers, headless scrapers) pollute
 * GA4, so gtag.js is fetched only after the visitor passes the automation checks
 * AND performs a trusted input gesture. Passive bots, including stealth-patched
 * headless browsers, never interact, so they never send a hit. Events queued
 * before that (install clicks) wait in dataLayer and are sent once gtag.js loads.
 * Ported from the addiyon.com frontend (features/bot-guard).
 */
(function(){
  'use strict';
  var script = document.currentScript;
  var gaId = script && script.getAttribute('data-ga-id');
  if(!gaId || location.hostname !== 'addiyonkeyboard.com') return;
  try{ if(localStorage.getItem('analytics-off') === '1') return; }catch(e){}

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', gaId, { allow_google_signals:false, allow_ad_personalization_signals:false });

  /* ===== Bot classification ===== */
  // Word-bounded where the token could appear inside a real in-app browser UA.
  var BOT_UA = new RegExp([
    'crawl', 'spider', 'slurp', 'headless', 'lighthouse', 'pagespeed', 'gtmetrix', 'phantomjs',
    'puppeteer', 'playwright', 'selenium', 'webdriver', 'cypress', 'electron/', 'jsdom', 'python',
    'curl/', 'wget', 'httpclient', 'okhttp', 'go-http', 'java/', 'axios', 'node-fetch', 'undici',
    'scrapy', 'mediapartners', 'adsbot', 'google-inspectiontool', 'apis-google', 'feedfetcher',
    'facebookexternalhit', 'facebookcatalog', 'meta-external', 'bingpreview', 'yandex(bot|images|metrika)',
    'baiduspider', 'bytespider', 'semrush', 'ahrefs', 'dataforseo', 'screaming frog', 'sitebulb',
    'pingdom', 'statuscake', 'uptimerobot'
  ].join('|'), 'i');
  // Case-sensitive on purpose: crawlers write "Googlebot", "GPTBot", "bingbot",
  // while phone brands in real UAs are upper-case ("CUBOT X30").
  var BOT_TOKEN = /[Bb]ot(?:[/;\-)\s]|$)/;
  var SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|mesa offscreen/i;
  var SOFT_SIGNAL_THRESHOLD = 2;

  // Globals left by Playwright, Puppeteer, Selenium/WebDriver, PhantomJS, Nightmare and Cypress.
  var AUTOMATION_GLOBALS = [
    '__playwright__binding__', '__pwInitScripts', '_phantom', 'callPhantom', '__phantomas', '__nightmare',
    'domAutomation', 'domAutomationController', '_selenium', 'calledSelenium', '_Selenium_IDE_Recorder',
    '__webdriver_evaluate', '__selenium_evaluate', '__webdriver_script_fn', '__webdriver_script_func',
    '__webdriver_script_function', '__driver_evaluate', '__driver_unwrapped', '__webdriver_unwrapped',
    '__selenium_unwrapped', '__fxdriver_evaluate', '__fxdriver_unwrapped', '__lastWatirAlert',
    '_WEBDRIVER_ELEM_CACHE', 'Cypress'
  ];
  // ChromeDriver leaves `cdc_…` / `$cdc_…` keys on window and document.
  var DRIVER_KEY = /^\$?cdc_|^\$wdc_|^\$chrome_asyncScriptInfo/;

  function hasAutomationGlobals(){
    if(AUTOMATION_GLOBALS.some(function(name){ return name in window; })) return true;
    var keys = Object.getOwnPropertyNames(window).concat(Object.getOwnPropertyNames(document));
    if(keys.some(function(key){ return DRIVER_KEY.test(key); })) return true;
    var root = document.documentElement;
    return ['webdriver', 'selenium', 'driver'].some(function(name){ return root.hasAttribute(name); });
  }

  // Real browsers expose `webdriver` only as a native getter on Navigator.prototype;
  // an own property or non-native getter means a script tried to hide automation.
  function isWebdriverPatched(){
    if(Object.getOwnPropertyDescriptor(navigator, 'webdriver')) return true;
    var descriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver');
    var getter = descriptor && descriptor.get;
    return Boolean(getter && !/\[native code\]/.test(Function.prototype.toString.call(getter)));
  }

  function readWebglRenderer(){
    var gl = document.createElement('canvas').getContext('webgl');
    if(!gl) return null;
    var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    var renderer = gl.getParameter(debugInfo ? debugInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER);
    var lose = gl.getExtension('WEBGL_lose_context');
    if(lose) lose.loseContext();
    return typeof renderer === 'string' ? renderer : null;
  }

  // Headless Chrome reports Notification.permission "denied" while the
  // Permissions API still says "prompt"; real browsers keep the two in sync.
  function hasPermissionMismatch(){
    if(typeof Notification === 'undefined' || !navigator.permissions || !navigator.permissions.query){
      return Promise.resolve(false);
    }
    return navigator.permissions.query({ name:'notifications' }).then(function(status){
      return Notification.permission === 'denied' && status.state === 'prompt';
    }, function(){ return false; });
  }

  function hasHardSignal(ua){
    var brands = (navigator.userAgentData && navigator.userAgentData.brands) || [];
    return navigator.webdriver === true || isWebdriverPatched() || BOT_UA.test(ua) || BOT_TOKEN.test(ua) ||
      brands.some(function(b){ return /headless/i.test(b.brand); }) || hasAutomationGlobals();
  }

  function countSoftSignals(ua, permissionMismatch){
    var isChrome = /Chrome\//.test(ua);
    var isDesktopChrome = isChrome && !/Mobile|Android|Edg\/|OPR\//.test(ua);
    var renderer = readWebglRenderer();
    return [
      !navigator.languages || navigator.languages.length === 0,
      isDesktopChrome && (!navigator.plugins || navigator.plugins.length === 0),
      isChrome && !('chrome' in window),
      Boolean(renderer && SOFTWARE_RENDERER.test(renderer)),
      permissionMismatch,
      !('webdriver' in Navigator.prototype),
      // Old headless mode reports a 0×0 window, but so do some Android WebViews.
      window.outerWidth === 0 && window.outerHeight === 0
    ].filter(Boolean).length;
  }

  function isHumanBrowser(){
    var ua = navigator.userAgent;
    if(hasHardSignal(ua)) return Promise.resolve(false);
    return hasPermissionMismatch().then(function(mismatch){
      return countSoftSignals(ua, mismatch) < SOFT_SIGNAL_THRESHOLD;
    });
  }

  /* ===== Human gate ===== */
  // Programmatic `scroll` is not counted: window.scrollTo fires trusted scroll events without any human.
  var INSTANT_GESTURES = ['pointerdown', 'touchstart', 'keydown', 'wheel'];
  var POINTER_MOVES_REQUIRED = 4;

  function waitForTrustedGesture(){
    return new Promise(function(resolve){
      var moves = 0;
      var options = { capture:true, passive:true };
      function finish(){
        INSTANT_GESTURES.forEach(function(type){ window.removeEventListener(type, onGesture, options); });
        window.removeEventListener('pointermove', onMove, options);
        resolve();
      }
      function onGesture(event){ if(event.isTrusted) finish(); }
      function onMove(event){
        if(!event.isTrusted || (event.movementX === 0 && event.movementY === 0)) return;
        moves += 1;
        if(moves >= POINTER_MOVES_REQUIRED) finish();
      }
      INSTANT_GESTURES.forEach(function(type){ window.addEventListener(type, onGesture, options); });
      window.addEventListener('pointermove', onMove, options);
    });
  }

  function loadGtag(){
    var tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    document.head.appendChild(tag);
  }

  // The probe runs after the gesture, when the page is certainly visible:
  // background and prerendered tabs report window metrics that look headless.
  waitForTrustedGesture().then(isHumanBrowser).then(function(human){
    if(human) loadGtag();
  }).catch(function(error){
    // Fail closed: an unreadable environment is itself a strong automation signal.
    console.warn('analytics: bot check failed, withholding analytics', error);
  });
})();
