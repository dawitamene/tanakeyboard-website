// Serves the Addiyon Keyboard site at addiyon.com/keyboard by proxying the Cloudflare Pages
// project, and permanently redirects the old keyboard.addiyon.com host to the new paths.
const PAGES_ORIGIN = 'https://tanakeyboard-website.pages.dev';
const SITE_ORIGIN = 'https://addiyon.com';
const BASE_PATH = '/keyboard';
const LEGACY_HOST = 'keyboard.addiyon.com';
const FORWARDED_HEADERS = ['accept', 'accept-encoding', 'accept-language', 'if-none-match', 'if-modified-since', 'range', 'user-agent'];

export function cleanLegacyPath(pathname) {
  if (pathname.endsWith('/index.html')) return pathname.slice(0, -'index.html'.length);
  if (pathname.endsWith('.html')) return pathname.slice(0, -'.html'.length);
  return pathname;
}

function permanentRedirect(location) {
  return new Response(null, { status: 301, headers: { Location: location, 'Cache-Control': 'public, max-age=86400' } });
}

function upstreamHeaders(request) {
  // Only forward what the static site needs; addiyon.com cookies must never reach the Pages host.
  const headers = new Headers();
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

function publicLocation(location) {
  const target = new URL(location, PAGES_ORIGIN);
  if (target.origin !== PAGES_ORIGIN) return location;
  return `${SITE_ORIGIN}${BASE_PATH}${target.pathname}${target.search}`;
}

export async function handleRequest(request, fetchUpstream = fetch) {
  const url = new URL(request.url);
  if (url.hostname === LEGACY_HOST) {
    return permanentRedirect(`${SITE_ORIGIN}${BASE_PATH}${cleanLegacyPath(url.pathname)}${url.search}`);
  }
  if (url.pathname === BASE_PATH) {
    return permanentRedirect(`${SITE_ORIGIN}${BASE_PATH}/${url.search}`);
  }
  if (!url.pathname.startsWith(`${BASE_PATH}/`)) {
    return fetchUpstream(request);
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  const upstreamUrl = `${PAGES_ORIGIN}${url.pathname.slice(BASE_PATH.length)}${url.search}`;
  const upstream = await fetchUpstream(new Request(upstreamUrl, {
    method: request.method,
    headers: upstreamHeaders(request),
    redirect: 'manual'
  }));
  const headers = new Headers(upstream.headers);
  headers.delete('x-robots-tag');
  headers.delete('set-cookie');
  const location = headers.get('location');
  if (location) headers.set('location', publicLocation(location));
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
}

export default {
  fetch(request) {
    return handleRequest(request);
  }
};
