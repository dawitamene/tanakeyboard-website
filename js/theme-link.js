// Turns /t/<code> into an Android intent link that opens the shared theme in Addiyon Keyboard,
// falling back to Google Play when the app is not installed. A bad or missing code keeps the button hidden.
(function () {
  var PLAY_URL = 'https://play.google.com/store/apps/details?id=com.addiyon.keyboard';
  var match = location.pathname.match(/^\/t\/([a-z0-9]{8})\/?$/);
  var button = document.getElementById('openTheme');
  if (!match || !button) return;
  button.href = 'intent://addiyonkeyboard.com/t/' + match[1] +
    '#Intent;scheme=https;package=com.addiyon.keyboard;S.browser_fallback_url=' +
    encodeURIComponent(PLAY_URL) + ';end';
  button.style.display = '';
})();
