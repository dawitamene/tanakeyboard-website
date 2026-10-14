# Addiyon Keyboard website: build and deploy

The public site is **https://addiyonkeyboard.com/**, a Next.js 16 (App Router) static export served by the
Cloudflare Pages project `addiyon-keyboard` (host `tanakeyboard-website.pages.dev`). Every push to `main`
builds and deploys production; other branches get preview URLs (`<branch>.tanakeyboard-website.pages.dev`).

| Pages setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `out` |
| Environment | `NODE_VERSION=22` |

## How it fits together

- **Content** lives in `content/pages/**.html`: a `<!--meta {json}-->` block (title, description, FAQ,
  breadcrumbs, related pages…) followed by the page body with `<!--placeholders-->`.
- **Rendering** is in `lib/` (content loading, nav/footer, placeholders, widgets, JSON-LD, metadata) and
  `app/` (one root layout per language: `app/(en)` and `app/(am)`, plus `sitemap.ts`, `robots.ts`,
  `llms.txt` and `global-not-found.tsx`). Internal URLs never end in a slash, except `/`.
- **Interactivity** (typing tool, converters, theme toggle, copy buttons, analytics opt-out) is the plain
  scripts in `public/js`, loaded per page from the meta `scripts` list. `public/js/fidel.js` and
  `public/js/ethiopic-date.js` are also used by the build, through `lib/legacy.ts`.
- **After `next build`**, `tools/strip-next-runtime.mjs` removes Next's client runtime from `out/`: the pages
  are static and need no React in the browser.
- **Analytics**: GA4 property "Addiyon Keyboard Web" (`G-HVXJCY4MR8`), on by default on the live domain only,
  without Google Signals or ad personalization. Visitors can turn it off on `/privacy`.
- `public/_headers` and `public/_redirects` are copied into `out/` (security and cache headers, the hub
  trailing-slash 301s, and `/t/*` → the shared-theme page).
- The Worker in `worker/` (`addiyon-keyboard-router`) 301-redirects the old `addiyon.com/keyboard/*`,
  `keyboard.addiyon.com/*` and `www.addiyonkeyboard.com/*` URLs. Deploy it with `npx wrangler deploy` from `worker/`.

## Commands

```bash
npm ci                    # install
npm run dev               # live development server on http://localhost:3311
npm run build             # static export to out/
npm start                 # serve out/ like Cloudflare Pages on http://localhost:3312
npm test                  # Fidel, calendar, export and Worker tests (build first)
npm run lint && npm run typecheck
node tools/generate-pages.mjs   # regenerate holiday, greetings, learning and yearly calendar pages
node tools/indexnow.mjs         # after a deploy: tell Bing and other IndexNow engines about every URL
```

The typing tool's word suggestions come from `public/engine/<hash>/`, which `node tools/sync-engine.mjs`
fills from the preener repo's `android/web-engine` build (see its README).
