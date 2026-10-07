# Mojo Brand Toolkit

Internal reference built with Vite and vanilla JavaScript. The Overview uses the supplied Sunlit workspace artwork, with broad cream fades toward the text and around the existing bottom pixel transition. The window, laptop, mug and sleeping cat remain visible on mobile; subtle steam is anchored to the mug in the same source coordinate system. The primary brand palette and shared sticky header are unchanged. Source: https://github.com/ChenJiale1012/mojo-toolkit.

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
- `src/header.css` owns the shared header height, sidebar width and native baseline alignment. The document scrolls beneath the sticky header; desktop navigation scrolls independently. Mobile navigation opens beneath the same header and closes with Escape or a page selection. Anchor offsets use the shared height. A passive scroll listener adds only a subtle shadow.
- `src/controls.js` supplies pixel icons, search and copy behaviour. `src/design-tokens.css` supplies shared radius and spacing. `src/ui.js` and `src/palette.css` share the exact palette-card markup/layout with the main pages and Quick Guide. Focus on composite search fields belongs to the existing outer frame.
- `public/hero-surface.svg` supplies a full cream base, continuous 3.5–5% diffuse orange wash, 2% static fine texture and faint 5% forest leaf shadows. It fades to cream at the bottom; the shadows are hidden on mobile. `src/scene.css` isolates the cream base, decorative surface, Sunlit artwork/steam, text and controls in that order. The source raster and pixel mask are unchanged.
- `src/scene.js` renders the original `public/sunlit-workspace.png` without altering its pixels. SVG masks blend its baked cream edges into the page while preserving the desk’s pixel transition. `src/sunlit-scene.json` records its 1631 × 964 dimensions, checksum and measured mug opening. The illustration and steam share one SVG viewBox. Mobile framing crops the quiet left wall while keeping the window and main desk objects visible. One clock pauses for user pause, offscreen scenes, hidden tabs and reduced motion, and is disposed on navigation. Courtyard source files remain available for comparison and the Imagery page.
- `index.html` starts an opaque cream cover before the app paints and preloads the logo assets. `src/intro.js` reveals complete glyphs in reserved word and mascot spaces. The HTML watchdog also dismisses the cover if the application bundle never loads; a delayed bundle cannot restart an expired introduction. It runs once per session, supports skip and reduced motion, and removes itself on font/mascot errors or timeout.
- `scripts/guide.mjs` embeds the supplied fonts and cat into the standalone guide. Full-section links work from the running toolkit. Local file mode hides those links and explains how adjacent downloads work. The Close guide link returns to the toolkit’s downloads page.
- Requests and relevant footers use: **Reach out with requests or updates to @c.c. in #marketing on the company Discord.** No verified Discord URL is supplied, so the channel remains text. Copying a brief does not submit it.

## Assets and current limitations

The four supplied TTF files and original cat SVG are preserved unchanged. The original Courtyard and Sunlit artwork are retained unchanged. Download cat SVG contains the mascot only, not the cat-and-wordmark arrangement. Combined-logo, standalone wordmark, reversed/one-colour exports, custom font licences and separate WOFF/WOFF2 files remain unavailable.

Imagery & motion shows the supplied Courtyard and Sunlit workspace artwork as current explorations. The original Sunlit PNG is preserved at `public/sunlit-workspace.png`, including its proportions, transparency and pixel transition. The overview hero uses the supplied Sunlit workspace artwork.

The merchandise page has plain text cards for stickers, T-shirts and totes. **Production artwork pending.** No mockups, order actions, suppliers, prices, materials or production specifications are supplied.

Brand foundations await a finalized product. The tool is editable through source; there is no authentication or server-side content editor. This GitHub repository update does not deploy a public website.
