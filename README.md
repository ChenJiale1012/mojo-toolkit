# Mojo Brand Toolkit

Internal reference built with Vite and vanilla JavaScript. The current refinement simplifies the overview, header, typography and merchandise pages, aligns the Quick Guide cards and fixes courtyard steam in source-image coordinates. Source: https://github.com/ChenJiale1012/mojo-toolkit.

## Run locally

Open a terminal in the extracted project folder containing `package.json`:

```sh
npm ci
npm run dev
```

Open the address printed by Vite, normally `http://localhost:5173`, on the same computer. Keep the terminal running. Hash links such as `/#colour` address individual pages.

## Build and check

```sh
npm run build
npm test
```

Browser checks require Chromium (`CHROMIUM_PATH` defaults to `/usr/bin/chromium`) and a running development server. To check a production build, run `npm run preview` and set `TEST_URL` to the address it prints when running the tests.

With the development server running, `npm run resources` rebuilds the Quick Guide, supplied fonts, guide preview and download archives. Requires Node, Python and Chromium. The generator removes retired template sources and previews before packaging; no template files are distributed.

## Edit the reference

- `src/brand-content.json` owns the brand line, supplied fonts, approval statuses and contact sentence. The approved signature combines the original cat on the left with lowercase mojo in Mojo Draft. Primary palette: Proposed. Voice and imagery: Work in progress. Templates and mascot animation: Under development.
- `src/templates.json` lists five categories only: Social Media Banners, Presentation Templates, Email Signatures, Virtual Meeting Backgrounds and Event Posters. They have no previews, editors or download actions.
- `src/content.js` owns navigation, resource metadata, completion lists and recorded changes. `src/working-pages.js` renders the developing pages, practical components, campus concepts and request briefs.
- `src/controls.js` supplies pixel icons, search and copy behaviour. `src/design-tokens.css` supplies shared radius and spacing. `src/ui.js` and `src/palette.css` share the exact palette-card markup/layout with the main pages and Quick Guide. Focus on composite search fields belongs to the existing outer frame.
- `src/scene.js` places the courtyard image, its existing mask and steam in a shared SVG viewBox. `src/courtyard-scene.json` records the measured 1536 × 1024 source dimensions, mug opening and three inner emission points. One clock pauses for user pause, offscreen scenes, hidden tabs and reduced motion, and is disposed on navigation. The original raster and mask stay unchanged. Flowers are static because no separate flower/background layers are supplied.
- `src/intro.js` reveals complete glyphs in reserved word and mascot spaces. It runs once per session, supports skip and reduced motion, and removes itself on font/mascot errors or timeout.
- `scripts/guide.mjs` embeds the supplied fonts and cat into the standalone guide. Full-section links work from the running toolkit. Local file mode hides those links and explains how adjacent downloads work. The Close guide link returns to the toolkit’s downloads page.
- Requests and relevant footers use: **Reach out with requests or updates to @c.c. in #marketing on the company Discord.** No verified Discord URL is supplied, so the channel remains text. Copying a brief does not submit it.

## Assets and current limitations

The four supplied TTF files and original cat SVG are preserved unchanged. The courtyard artwork and overview hero are unchanged. Download cat SVG contains the mascot only, not the cat-and-wordmark arrangement. Combined-logo, standalone wordmark, reversed/one-colour exports, custom font licences and separate WOFF/WOFF2 files remain unavailable.

The supplied Sunlit workspace screenshot has no downloadable attachment in this session. Its original image file is needed to complete the second Imagery preview; the page shows only available artwork, with no replacement image or placeholder. The missing original is listed under Requests & updates. Upload `image(4).png` to add the actual image without regenerating it.

The merchandise page has plain text cards for stickers, T-shirts and totes. **Production artwork pending.** No mockups, order actions, suppliers, prices, materials or production specifications are supplied.

Brand foundations await a finalized product. The tool is editable through source; there is no authentication or server-side content editor. This GitHub repository update does not deploy a public website.
