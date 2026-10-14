// Permanently redirects every old Addiyon Keyboard address (addiyon.com/keyboard/*, keyboard.addiyon.com/*
// and www.addiyonkeyboard.com/*) to the same page on addiyonkeyboard.com, which Cloudflare Pages serves.
const SITE_ORIGIN = 'https://addiyonkeyboard.com';
const OLD_BASE_PATH = '/keyboard';
const LEGACY_SUBDOMAIN = 'keyboard.addiyon.com';
const WWW_HOST = 'www.addiyonkeyboard.com';

export function cleanLegacyPath(pathname) {
  if (pathname.endsWith('/index.html')) return pathname.slice(0, -'index.html'.length);
  if (pathname.endsWith('.html')) return pathname.slice(0, -'.html'.length);
  return pathname;
}

function permanentRedirect(location) {
  return new Response(null, { status: 301, headers: { Location: location, 'Cache-Control': 'public, max-age=86400' } });
}

function newPathFor(url) {
  if (url.hostname === LEGACY_SUBDOMAIN) return cleanLegacyPath(url.pathname);
  if (url.hostname === WWW_HOST) return url.pathname;
  if (url.pathname === OLD_BASE_PATH) return '/';
  if (url.pathname.startsWith(`${OLD_BASE_PATH}/`)) return url.pathname.slice(OLD_BASE_PATH.length);
  return null;
}

// The site's URLs never end in a slash except the home page, so redirect straight to the final address.
function withoutTrailingSlash(path) {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

export async function handleRequest(request, fetchUpstream = fetch) {
  const url = new URL(request.url);
  const path = newPathFor(url);
  if (path === null) return fetchUpstream(request);
  return permanentRedirect(`${SITE_ORIGIN}${withoutTrailingSlash(path)}${url.search}`);
}

export default {
  fetch(request) {
    return handleRequest(request);
  }
};
