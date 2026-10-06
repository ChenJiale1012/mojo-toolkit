# Mojo Brand Toolkit

Editable internal reference built with Vite and vanilla JavaScript. Version 0.6 refines the artwork edge, practical guidance, font downloads, and shared approval statuses. Source is maintained in https://github.com/ChenJiale1012/mojo-toolkit. The website has not been publicly deployed.

## Run locally

Use Node 22.12+ (tested with Node 24.19.0). In the project folder:

```sh
npm ci
npm run dev -- --port 5173
```

Open `http://localhost:5173` on the same computer. The development server must stay running. Hash links such as `/#colour` address individual pages.

```sh
npm run build
npm test                          # development server must be active
npm run preview -- --port 4173
TEST_URL=http://localhost:4173 npm test
```

Browser checks use `/usr/bin/chromium`; set `CHROMIUM_PATH` for another executable. They verify pages at desktop and mobile sizes, search, clipboard, intro behaviour, reduced motion, real downloads, archives, font loading, header controls, approval labels, and browser errors. Screenshots are saved to ignored `.playwright/`.

## Edit and regenerate

- `src/brand-content.json` owns the confirmed line **Mojo. Better together.**, actual font files, and shared approval statuses. The primary signature is **Approved**; the five-colour primary palette is **Proposed**; secondary and tertiary palettes are **To be decided**; Mojo animations are **Under development**. The whole toolkit remains a working draft.
- `src/content.js` holds chapters, colours, resource metadata, and search content. `src/reference-pages.js` renders practical Logo, Colour, and Typography pages. `src/foundations.js` owns visual decisions; Voice & language owns writing guidance.
- `src/style.css` owns styling and functional interface tokens. Keep the five primary values unchanged: #F06A21, #FFF8F0, #1D1B18, #A7B59E, #35594A. Warning and error tokens are separate from brand palettes. Contrast labels are calculated from rendered colour pairs.
- `src/brand.js` renders the supplied cat followed by lowercase mojo in Mojo Draft. The original SVG is unchanged. Size examples are illustrative; approved minimum sizes and spacing measurements have not been defined.
- Typography uses Mojo Pixel Serif Draft for the wordmark and main headings, Mojo Serif Refined for subtitles, and Inter for body text and controls. Actual TTF files are in `public/fonts/`. Three specimen rows lead the page; technical information is expandable. Only supplied formats are offered.
- Run `python3 scripts/resources.py` after changes to shared statuses or generated resources. It copies all four supplied TTF files, Inter’s licence, the font ZIP, quick guide, and starter pack. The same font bytes appear in individual downloads and both archives. Editable SVG templates use system fallbacks; extracted HTML downloads may need their relative font paths adjusted.
- `public/courtyard.png` is original concept artwork created for this project. It contains no decorative mascot. `scripts/courtyard-mask.py` uses Pillow to author a binary SVG mask from actual foreground colours without changing the image. Run it from the project root to regenerate `public/courtyard-mask.svg`. Fine cells follow foliage along the left and bottom; cream #FFF8F0 shows through transparency. No polygon clipping, blur, or random scatter is used. Pause motion and reduced motion stop the restrained steam animation.
- `src/intro.js` plays the short signature introduction once per browser session. Skip, Escape, Tab, reduced motion, failed assets, storage restrictions, and a watchdog allow access to the toolkit. It does not lock scrolling or capture focus.
- `node scripts/icons.mjs` regenerates padded mascot icons and the link preview with the development server running on port 5173. Set social metadata to an actual deployment URL before deploying.

## Missing assets

A standalone wordmark, combined-logo file, reversed/one-colour logo variants, and production app artwork have not been supplied. Neither have custom font licence/readme documents, separate WOFF/WOFF2 sources, or completed mascot animations. All supplied TTF files and Inter’s licence are available; no placeholder downloads are offered.

Product descriptions await a finalized product. Photography, product screenshots, real contact/submission routes, registration links, and merchandise production specifications also remain unavailable. Templates and general guidance are proposed.

The toolkit has no authentication or backend. Keep confidential files out of this static source. A future deployment requires explicit authorization; publish only the built `dist/` directory. Pushing source to GitHub does not deploy the website.
