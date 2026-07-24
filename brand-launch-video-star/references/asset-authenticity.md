# Asset Authenticity and Logo Zero-Tolerance

## Source hierarchy

Use the strongest available provenance:

1. User-provided original export
2. Official company website or static bundle
3. Official newsroom, brand portal, media kit, press kit, or repository
4. Official company-controlled media library
5. Licensed stock or authorized partner kit

Do not use search-result thumbnails, logo aggregation sites, fan recreations, Pinterest, unverified reposts, or AI-generated substitutes.

## Logo gate

Before using a logo:

1. Locate the current mark on the official website or brand portal.
2. Download the original SVG/PNG/WebP or exact website-bundle asset.
3. Compare silhouette, letterforms, spacing, marks, colors, and aspect ratio.
4. Record the source URL and verification target.
5. Preserve aspect ratio and official color.
6. Use alternate variants only when official guidance provides them.

If the site exposes only an inline SVG, save the exact original markup/path. Never redraw, trace, or typeset the mark.

## Identity-bearing asset gate

Require authentic sources for:

- Products and packaging
- Product UI and screenshots
- People, mascots, and characters
- Vehicles, devices, buildings, and facilities
- Campaign photography and footage
- Partner logos and certification marks

Abstract transition graphics may be procedural, but must not impersonate these subjects.

## Website extraction

Inspect:

- DOM image sources and `srcset`
- CSS background images and webfonts
- Static JS/CSS bundles
- Open Graph images
- Newsroom/media downloads
- Product pages and press releases
- Official repositories and controlled media libraries

Prefer original-resolution files. Do not upscale a favicon or tiny logo when an original exists.

## Product and claim verification

Record the official page and access date for:

- Product name/version
- Feature wording
- Performance numbers
- Availability
- Slogans and CTA

Do not turn inferred behavior into a product claim.

## Rights

Provenance does not equal publication permission. Record:

- Owner
- Stated usage terms
- Editorial/noncommercial/commercial restrictions
- Attribution requirements
- Whether the user supplied the asset

Keep an unofficial-concept disclaimer when authorization is unclear.

Use [asset-manifest.example.json](asset-manifest.example.json) as a template. Run it with `validate-assets.mjs --schema-only`; copied project manifests must pass full validation with real local files.
