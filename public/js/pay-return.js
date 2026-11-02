// Jami only returns buyers to https pages, so a telebirr / CBE Birr payment started in the
// Addiyon app comes back here and is handed to the app through its own scheme. The browser tab
// closes on that link and the app shows the result; the button covers browsers that block it.
(function () {
  var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  var FALLBACK_DELAY_MS = 2500;
  var order = new URLSearchParams(location.search).get('order');
  var button = document.getElementById('openApp');
  var text = document.getElementById('payReturnText');
  if (!button || !text) return;
  if (!order || !UUID.test(order)) {
    text.textContent = 'This page only returns you to Addiyon Keyboard after paying there.';
    return;
  }
  var appUrl = 'addiyonkeyboard://pay?order=' + encodeURIComponent(order);
  button.href = appUrl;
  button.style.display = '';
  location.replace(appUrl);
  setTimeout(function () {
    text.textContent = 'Tap below to return to the app. Pro turns on as soon as the payment is confirmed.';
  }, FALLBACK_DELAY_MS);
})();
