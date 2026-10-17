# Mojo toolkit favicon

## Construction specification

Use the supplied cat on a warm cream square (#FFF8F0). Keep the mascot colours and pixel geometry unchanged. This specification applies to the toolkit favicon, not general logo clear-space rules.

| Property | 64-unit master | Proportion of square side |
|---|---:|---:|
| Background | 64 × 64 | 100% × 100% |
| Corner radius | 12 | 18.75% |
| Cat width | 48 | 75% |
| Cat height | 41.419680 | 64.718251% |
| Left/right margins | 8 each | 12.5% each |
| Top/bottom margins | 11.290160 each | 17.640875% each |

Centre the cat's visible outer bounding box horizontally and vertically. Measure margins from the square's straight outer edges to the outermost visible mascot pixels, including its outline and ears; do not measure from the rounded arc or the face interior. The vertical and horizontal margins differ because the cat is wider than it is tall.

The verified source artwork bounds are 1189 × 1026. Exact construction for any square side S:
- Cat width = 0.75 × S.
- Cat height = 0.75 × S × 1026 / 1189.
- Left and right margin = 0.125 × S.
- Top and bottom margin = (S − cat height) / 2.
- Corner radius = 0.1875 × S.

The formulas are authoritative; displayed decimals are rounded. SVG stores high-precision coordinates. Small PNGs snap artwork to physical pixels, so apparent raster margins can differ by a fraction of a pixel. Never stretch the mascot or independently adjust its height.

## Suggested guideline wording

Use the cream toolkit icon with the cat centred. The cat occupies 75% of the square's width, leaving 12.5% on each side. Preserve its proportions; the space above and below is approximately 17.64% each. Use a corner radius of 18.75% of the square's width.

## Installation

Place the supplied files in the site's public asset directory and replace conflicting favicon references. For a root-hosted site:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="shortcut icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png">
```

Adjust paths for subdirectory hosting. The ICO includes 16, 32 and 48 px versions. PNGs also include 64, 180, 192 and 512 px. Browser caches may retain the old favicon; verify with cache cleared.
