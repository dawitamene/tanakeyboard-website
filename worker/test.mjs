// Run: node worker/test.mjs
import assert from 'node:assert/strict';
import { handleRequest, cleanLegacyPath } from './src/index.js';

const seen = [];
function fakeUpstream(responses) {
  return async (request) => {
    seen.push({ url: request.url, cookie: request.headers.get('cookie') });
    const make = responses[new URL(request.url).pathname];
    return make ? make() : new Response('missing', { status: 404 });
  };
}
const upstream = fakeUpstream({
  '/': () => new Response('home', { headers: { 'content-type': 'text/html', 'x-robots-tag': 'noindex' } }),
  '/features.html': () => new Response(null, { status: 308, headers: { location: '/features' } }),
  '/guides': () => new Response(null, { status: 308, headers: { location: 'https://tanakeyboard-website.pages.dev/guides/' } })
});

assert.equal(cleanLegacyPath('/features.html'), '/features');
assert.equal(cleanLegacyPath('/index.html'), '/');
assert.equal(cleanLegacyPath('/guides/index.html'), '/guides/');

let r = await handleRequest(new Request('https://keyboard.addiyon.com/privacy.html?x=1'), upstream);
assert.equal(r.status, 301);
assert.equal(r.headers.get('location'), 'https://addiyon.com/keyboard/privacy?x=1');

r = await handleRequest(new Request('https://keyboard.addiyon.com/'), upstream);
assert.equal(r.headers.get('location'), 'https://addiyon.com/keyboard/');

r = await handleRequest(new Request('https://addiyon.com/keyboard'), upstream);
assert.equal(r.status, 301);
assert.equal(r.headers.get('location'), 'https://addiyon.com/keyboard/');

r = await handleRequest(new Request('https://addiyon.com/keyboard/', { headers: { cookie: 'session=secret' } }), upstream);
assert.equal(r.status, 200);
assert.equal(await r.text(), 'home');
assert.equal(r.headers.get('x-robots-tag'), null);
assert.equal(seen.at(-1).url, 'https://tanakeyboard-website.pages.dev/');
assert.equal(seen.at(-1).cookie, null);

r = await handleRequest(new Request('https://addiyon.com/keyboard/features.html'), upstream);
assert.equal(r.status, 308);
assert.equal(r.headers.get('location'), 'https://addiyon.com/keyboard/features');

r = await handleRequest(new Request('https://addiyon.com/keyboard/guides'), upstream);
assert.equal(r.headers.get('location'), 'https://addiyon.com/keyboard/guides/');

r = await handleRequest(new Request('https://addiyon.com/keyboard/nope'), upstream);
assert.equal(r.status, 404);

r = await handleRequest(new Request('https://addiyon.com/keyboard/', { method: 'POST' }), upstream);
assert.equal(r.status, 405);

const before = seen.length;
await handleRequest(new Request('https://addiyon.com/keyboardish'), upstream);
assert.equal(seen.length, before + 1, 'paths outside /keyboard/ pass through untouched');

console.log('worker tests passed');
