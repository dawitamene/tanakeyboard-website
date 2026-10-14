// Tells Bing, Yandex and other IndexNow engines about every URL in the live sitemap.
// Run after a deploy: node tools/indexnow.mjs
const KEY = '20c266c76105648a8195fb9f0140ef97';
const HOST = 'addiyonkeyboard.com';

const sitemap = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList })
});
console.log(`IndexNow: ${response.status} for ${urlList.length} URLs`);
if (!response.ok && response.status !== 202) process.exit(1);
