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

## Scroll, type and palette refinements

- Desktop wheel input uses a short 65ms exponential easing time constant with an immediate 25% response. Small trackpad deltas keep their original distance. Scroll and artwork motion share one demand-driven frame loop in `src/animation.js`; `src/scroll.js` leaves touch, reduced motion, keyboard input, scrollbar dragging and independently scrolling panels native. History traversal restores the browser's saved position. No page wrapper is transformed.
- `src/design-tokens.css` defines the 64/48/32/24/18/16/14/12px scale. `src/typography.css` applies it responsively. Headlines use line height 1 and body 1.3, both with −0.01em tracking. Mojo Draft headings/specimens use 1.1 to give pixel serifs room on wrapped lines. The logo retains its existing metrics.
- `src/palette.css` uses five equal flex shares above an 850px **content** width on fine-pointer devices. Hover or keyboard focus expands one share to 2.4 over 500ms; keyboard focus takes precedence. Smaller/touch layouts use a stable grid with RGB always visible. Each swatch is one semantic copy button; success and clipboard failure are announced. Swatches have no added border, outline or shadow in any state; keyboard focus underlines the colour name. Ink is used on orange, cream and sage, with cream on ink and forest; measured contrast is at least 5.55:1.
- `public/cursors/` contains local 19px SVG pixel arrow/pointer assets (32% smaller than the original 28px canvases, with unchanged paths). `src/cursor.css` applies them only with fine pointer/hover support, using a centred 19px pixel I-beam for selectable/editable text while retaining native disabled and drag/resize cursors. The I-beam changes the mouse cursor only; native selection, keyboard editing and the blinking insertion caret are unchanged. The standalone guide embeds its cursor assets for offline use.
- The supplied Lemma typography and palette specifications guided the refinement. Direct inspection of its live scrolling was blocked by the cloud network proxy; the easing is tuned and validated locally rather than claimed as a measured match.

`npm test` includes `tests/brand-refinements.mjs`: palette focus/hover/copy/contrast, typography, cursors, responsive layouts, simulated wheel/trackpad input, native panel/touch/reduced motion and history restoration. `tests/navigation-polish.mjs` checks all navigation links on desktop, short laptops and mobile, shared row alignment, icon accessibility, border-free palette states during transitions, and rasterized cursor bounds/hotspots. `npm run resources` refreshes the guide and download pack after intentional brand UI changes.

The copy audit removes the Overview status strip and “Details” link, “Less searching. More making.”, “Your next idea starts here.” (now “Explore the toolkit”), the redundant sidebar footer, repeated page introductions, the generic audience link row, and duplicate merchandise/contact/status text. Useful approval and development statuses remain with the relevant content; version details live on Requests & updates. Quick Guide keeps brand rules, font roles, copy/download actions and meaningful statuses.

The top-left “Brand Toolkit” title uses the original typography from commit `1877608`: Mojo Draft, ink, weight 400, 30px/1.1 (28px on small laptops), with −0.4px tracking. The redesigned navigation remains in place.

`src/button-typography.css` owns action typography: Nunito Sans, 14px, weight 500, line height 1.2. Component styles share its padding and 36px minimum height (44px on touch devices). The only compact geometry is the 32px icon-only search submit target inside a 40px field; its label font remains 14px. The stylesheet loads before the bundle for the introduction’s skip button, is imported by `src/style.css` for reusable components, and is embedded in the offline Quick Guide. Hover and focus keep the same geometry; pressing lowers a decorative button face by 1px while its hit area and surrounding content stay stationary. Shared motion values use 160ms hover/release and 100ms press with an ease-out curve. `tests/controls-typography.mjs` audits all pages and the guide at five widths, native dialogs, cursor selection/editing and the early intro control.

## Edit the reference

- `src/brand-content.json` owns the brand line, supplied fonts, approval statuses and contact sentence. The approved signature combines the original cat on the left with lowercase mojo in Mojo Draft. Primary palette: Proposed. Voice and imagery: Work in progress. Templates and mascot animation: Under development.
- `src/templates.json` lists five categories only: Social Media Banners, Presentation Templates, Email Signatures, Virtual Meeting Backgrounds and Event Posters. They have no previews, editors or download actions.
- `src/navigation.js` owns one shared navigation row and twelve custom pixel SVG illustrations on a 20px grid. Rows are 44px high, with Nunito Sans labels, a fixed 20px icon column and an 11px gap; sidebar width is shared with the header divider. The navigation retains its scroll position on page changes. `src/content.js` owns page titles, resource metadata, completion lists and recorded changes. `src/working-pages.js` renders the developing pages, practical components, campus concepts and request briefs.
- `src/header.css` owns the shared header height, sidebar width and native baseline alignment. The document scrolls beneath the sticky header; desktop navigation scrolls independently. Mobile navigation opens beneath the same header and closes with Escape or a page selection. Anchor offsets use the shared height. A passive scroll listener adds only a subtle shadow.
- `src/controls.js` supplies pixel icons, search and copy behaviour. `src/design-tokens.css` supplies shared radius and spacing. `src/ui.js` and `src/palette.css` share the expanding palette markup/layout with the main pages and Quick Guide. Focus on composite search fields belongs to the existing outer frame.
- `public/hero-surface.svg` supplies a full cream base, continuous 3.5–5% diffuse orange wash, 2% static fine texture and faint 5% forest leaf shadows. It fades to cream at the bottom; the shadows are hidden on mobile. `src/scene.css` isolates the cream base, decorative surface, Sunlit artwork/steam, and text in that order. The source raster and pixel mask are unchanged.
- `src/scene.js` renders the original `public/sunlit-workspace.png` without altering its pixels. SVG masks blend its baked cream edges into the page while preserving the desk’s pixel transition. `src/sunlit-scene.json` records its 1631 × 964 dimensions, checksum and measured mug opening. The illustration and steam share one SVG viewBox. Mobile framing crops the quiet left wall while keeping the window and main desk objects visible. One finite clock pauses for offscreen scenes, hidden tabs and reduced motion, settles within five seconds of visible motion, and is disposed on navigation. Courtyard source files remain available for comparison and the Imagery page.
- `index.html` starts an opaque cream cover before the app paints and preloads the logo assets. `src/intro.js` reveals complete glyphs in reserved word and mascot spaces. The HTML watchdog also dismisses the cover if the application bundle never loads; a delayed bundle cannot restart an expired introduction. It runs once per session, supports skip and reduced motion, and removes itself on font/mascot errors or timeout.
- `scripts/guide.mjs` embeds the supplied fonts and cat into the standalone guide. Full-section links work from the running toolkit. Local file mode hides those links and explains how adjacent downloads work. The Close guide link returns to the toolkit’s downloads page.
- Requests and relevant footers use: **Reach out with requests or updates to @c.c. in #marketing on the company Discord.** No verified Discord URL is supplied, so the channel remains text. Copying a brief does not submit it.

## Assets and current limitations

The four supplied TTF files and original cat SVG are preserved unchanged. The original Courtyard and Sunlit artwork are retained unchanged. Download cat SVG contains the mascot only, not the cat-and-wordmark arrangement. Combined-logo, standalone wordmark, reversed/one-colour exports, custom font licences and separate WOFF/WOFF2 files remain unavailable.

Imagery & motion shows the supplied Courtyard and Sunlit workspace artwork as current explorations. The original Sunlit PNG is preserved at `public/sunlit-workspace.png`, including its proportions, transparency and pixel transition. The overview hero uses the supplied Sunlit workspace artwork.

The merchandise page has plain text cards for stickers, T-shirts and totes. **Production artwork pending.** No mockups, order actions, suppliers, prices, materials or production specifications are supplied.

Brand foundations await a finalized product. The tool is editable through source; there is no authentication or server-side content editor. This GitHub repository update does not deploy a public website.

Nunito Sans 3.101 is self-hosted in `public/fonts` as regular and italic variable WOFF2, with installable TTF files, SIL OFL licence, and pinned upstream URLs/SHA-256 hashes in `NunitoSans-source.json`. `src/supporting-font.css` defines the family centrally. Use 400 for body copy, 500 for controls, and 600 for emphasis. Font and Starter Pack archives include the licence and webfonts.

Actions use 6px rounded keycaps with a subtle 2px lower shadow; quiet actions have no depth. `src/selection-controls.css` provides the native radio background picker (four columns, two on narrow screens). Filters use a flat selection treatment. Hover styles require a fine pointer and hover support, with reduced-motion overrides for faces, selections and navigation icons. The sidebar cat is a separate monochrome 20px drawing; the supplied mascot SVG remains unchanged.

The header Search and Quick Guide share `--header-control-height` (40px, 44px for touch). Search retains its submit button with a quiet inset face. Foundations use three shared 4:3 preview surfaces, stacking below 1000px; captions and copy actions sit outside them. `src/page-flow.css` owns their layout and ordinary section spacing. Decorative content/card rules are removed; inputs, tables, navigation and focus boundaries remain.

Overview steam settles with an 800ms fade at 4.8 seconds of visible motion; hidden/offscreen/reduced-motion states stop its clock, and navigation disposes it. There is no visible pause control. The orange I-beam retains its 19px geometry and centred hotspot, with an ink edge and cream highlights.

Design guidance for these refinements: the public [Anthropic frontend-design SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md), read directly because the skill and its installer were unavailable in this environment. The established Mojo palette and fonts take precedence.

Theme support uses immutable brand palette colours plus semantic interface tokens in `src/theme-tokens.css`. `public/theme-init.js` resolves Light / Dark / System before styles/rendering, remembers choices, follows live system changes, synchronizes controls/tabs and tolerates unavailable storage. It is also embedded into the offline Quick Guide. `src/theme.css` owns coordinated surfaces, borders, focus, outlined quiet actions and the responsive theme selector.

The blue-hour scene uses the exact original raster through controlled SVG channel grading and a masked warm desk light. No source pixels, object geometry or scene positioning are regenerated. An image-editing candidate was compared at window, laptop, mug, cat, books and plant edges; its 1–2px offsets were rejected for the production scene. The grade preserves the original shadow shapes rather than simulating a new physical light source.

Outdoor motion is deliberately limited to two tiny cypress crowns (150 original leaf pixels total). `src/foliage.json` stores stepped masks and anchored pivots. Adjacent water repairs the static crown silhouette before its original pixels are drawn once on a moving layer, behind the window clip. Both theme grades reference these same source layers. An eased 4.8-second breeze returns to zero rotation, shares the existing visibility/reduced-motion clock, and never moves indoor objects. Pixel comparisons verify the resting repairs and that no pixels outside the selected crowns move.

Reusable components includes the original three cursor SVGs and individual downloads, plus `mojo-cursors.zip`. `src/cursors.json` supplies preview/download metadata; resources copy the exact runtime SVG bytes and put display sizes, hotspot coordinates and native fallback guidance only in the ZIP README. The starter pack includes the same collection.
