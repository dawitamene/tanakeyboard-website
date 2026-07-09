
---

## Revision — July 2026 site modifications

Implemented on 2026-07-08, superseding parts of the original spec above:

1. **Tagline changed.** "Type Amharic the way you speak it" → **"The easiest way to type Amharic"**. Updated in `index.html` `<title>`, `og:title`, and hero H1. Any spec references above to the old tagline are superseded.
2. **Official Google Play icon.** The hand-drawn play-triangle SVG was replaced with the official multicolor Google Play icon (downloaded to `img/google-play.svg`, inlined as SVG paths) in the nav pill, hero primary button, and final CTA buttons on all pages.
3. **Wordmark font.** "Addiyon Keyboard" nav/footer wordmark now uses **Playpen Sans** (700) instead of Lilita One; the Google Fonts link was updated accordingly.
4. **Responsive design.** Added `@media (max-width:768px)` and `@media (max-width:480px)` layout rules to `css/site.css`: compact nav (wordmark hidden and icon-only Play pill on phones), reduced section paddings, stacked feature rows, single-column privacy TOC, 2-column trust strip, capped phone-mockup sizes.
5. **Theme-matching nav.** The nav is transparent with white text only at the top of the home page; everywhere else a `.nav-solid` class (toggled by `js/site.js`) applies the theme glass background (`--nav-bg`), theme text colors, and border. The Google Play pill is now a neutral card-style pill (`--card` background, `--border` border) holding the colored official icon; the final CTA button uses the same card style so the colored icon reads correctly.
