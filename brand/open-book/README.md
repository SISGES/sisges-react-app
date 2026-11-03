# SISGES — Open Book brand kit

The outlined open book from UI inspiration image 2 (Civic Blue mobile), reconstructed as editable vector geometry. This is the active SISGES identity.

## Deliverables

- `svg/`: 20 vector masters. Symbol, horizontal, horizontal with descriptor, vertical, vertical with descriptor; each in navy, black, white/negative and optional gold.
- `png/`: 40 transparent PNG exports, at 1200px and 2400px longest edge (`@1x` and `@2x`). White artwork is deliberately invisible on a white background.
- `pdf/`: one five-page vector PDF containing the navy masters, one page per layout. RGB, not a CMYK press profile; have the printer convert to the intended paper/press ICC profile.
- `icons/`: SVG, multi-resolution ICO, and square PNG icons from 16px through 1024px. White book on opaque navy; includes 180px Apple touch and 192/512px launcher sizes.
- `index.html`: browse every variation and download assets.
- `preview.png`: compact contact sheet.
- `generate.py`: reproducible master artwork and asset exporter. Requires Python, fonttools, cairosvg, Pillow, pypdf and DejaVu Sans regular/bold under `/usr/share/fonts/truetype/dejavu/`.

## Brand specifications

Primary navy: `#142D4E` (RGB 20, 45, 78). White: `#FFFFFF`. Monochrome: `#000000`. Optional ceremonial gold: `#B79753` (RGB 183, 151, 83).

The wordmark uses outlined DejaVu Sans Bold; the descriptor uses outlined DejaVu Sans. SVG/PDF files require no installed fonts. The book has a five-unit stroke in its 100-unit viewBox, rounded joins and caps. Preserve the stroke proportions when scaling.

Use navy on light backgrounds, white on dark backgrounds, black for single-color reproduction. Gold is optional display artwork, not the default app logo. Keep clear space at least twice the book stroke width around the visible artwork. Do not stretch, rotate, apply shadows, redraw, or put a detailed photo behind it.

Minimum suggested digital sizes: symbol 24px (favicon exception 16px), horizontal lockup 120px wide, descriptor lockups 280px wide. Below the descriptor minimum, use the version without the descriptor. Preserve the SVG viewBox whitespace.

## Application integration

`src/components/SisgesLogo/SisgesLogo.tsx` uses the same outlined SVG masters from `public/brand/`. The logo automatically switches to white in dark mode; `tone="inverse"` keeps it white on the permanent dark sidebar and mobile drawer. The shared component covers login, desktop sidebar and mobile header/drawer.

`public/sisges-icon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, and `site.webmanifest` provide browser and launcher branding. Regenerating this kit synchronizes the deployed artwork. The manifest provides icon metadata; it does not add offline support.
