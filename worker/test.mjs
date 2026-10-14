// Run: node worker/test.mjs
import assert from 'node:assert/strict';
import { handleRequest, cleanLegacyPath } from './src/index.js';

const seen = [];
const upstream = async (request) => {
  seen.push(request.url);
  return new Response('addiyon.com');
};

async function redirectOf(url) {
  const response = await handleRequest(new Request(url), upstream);
  assert.equal(response.status, 301, url);
  return response.headers.get('location');
}

assert.equal(cleanLegacyPath('/features.html'), '/features');
assert.equal(cleanLegacyPath('/index.html'), '/');
assert.equal(cleanLegacyPath('/guides/index.html'), '/guides/');
assert.equal(await redirectOf('https://addiyon.com/keyboard/guides/'), 'https://addiyonkeyboard.com/guides');

assert.equal(await redirectOf('https://addiyon.com/keyboard'), 'https://addiyonkeyboard.com/');
assert.equal(await redirectOf('https://addiyon.com/keyboard/'), 'https://addiyonkeyboard.com/');
assert.equal(await redirectOf('https://addiyon.com/keyboard/privacy'), 'https://addiyonkeyboard.com/privacy');
assert.equal(await redirectOf('https://addiyon.com/keyboard/am/amharic-typing?x=1'), 'https://addiyonkeyboard.com/am/amharic-typing?x=1');
assert.equal(await redirectOf('https://addiyon.com/keyboard/sitemap.xml'), 'https://addiyonkeyboard.com/sitemap.xml');

assert.equal(await redirectOf('https://keyboard.addiyon.com/privacy.html?x=1'), 'https://addiyonkeyboard.com/privacy?x=1');
assert.equal(await redirectOf('https://keyboard.addiyon.com/'), 'https://addiyonkeyboard.com/');

assert.equal(await redirectOf('https://www.addiyonkeyboard.com/guides/'), 'https://addiyonkeyboard.com/guides');

const before = seen.length;
const passthrough = await handleRequest(new Request('https://addiyon.com/keyboardish'), upstream);
assert.equal(await passthrough.text(), 'addiyon.com');
assert.equal(seen.length, before + 1, 'paths outside /keyboard pass through untouched');

console.log('worker tests passed');
