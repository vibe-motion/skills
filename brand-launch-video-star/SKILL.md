---
name: brand-launch-video-star
description: Create fast, high-impact 15-30 second brand and product marketing videos from an official company website, verified brand sources, or user-uploaded product imagery. Use for launch films, website motion videos, AI/SaaS demos, product promos, and Vibe Motion/Remotion productions that require exact logos, authentic imagery, English-first copy, product-feature storytelling, strong visual impact, smooth transitions, and deterministic frame-based animation.
---

# Brand Launch Video Star

Create an authentic launch film, not a generic motion template. Verify the brand, tell a product-specific story, and render a fast, polished sequence with exact assets and deterministic motion.

## Release blockers

1. **Use authentic assets.** Never invent, redraw, approximate, trace, or generate a logo, wordmark, product, interface, mascot, packaging, person, or brand scene.
2. **Make the logo exact.** Download the current official file or use the user's original. Never typeset a wordmark or rebuild a logo with CSS/SVG primitives.
3. **Research beyond uploads.** Treat uploads as usable source material, not the asset ceiling. Find additional official or licensed material when the story needs it.
4. **Show the product.** Demonstrate actual features, interactions, scenarios, outputs, and proof. Do not hide a weak product story behind abstract effects.
5. **Default to English.** Use another language only when explicitly requested.
6. **Keep motion deterministic.** Compute every state from frame/time and explicit inputs. Never depend on render order or unseeded randomness.
7. **Verify claims.** Confirm current names, features, metrics, slogans, and CTAs against official sources.

If an identity-bearing asset cannot be authenticated, stop and ask for an authorized original. Do not render a plausible substitute.

Use procedural graphics only as non-representational motion layers: masks, gradients, color fields, grids, glows, particles, trails, typography, verified-data charts, and transition geometry.

## Quick start

Install the skill:

```bash
npx skills add vibe-motion/skills
```

Invoke it with a concrete brief:

```text
Use $brand-launch-video-star to create a 15-second 16:9 English launch film
for https://example.com. Research official assets, show the core product
workflow, and deliver a Vibe Motion/Remotion MP4 plus provenance files.
```

Work inside the user's existing Vibe Motion or Remotion project. If none exists, initialize a Vibe Motion project with `npx create-vibe-motion`, then follow the generated project's own install and render commands.

Before implementation:

1. Copy `references/asset-manifest.example.json` into the project and replace every example value.
2. Copy `references/timeline.example.json` into the project and adapt its duration and shots.
3. Validate both files:

```bash
node <skill-dir>/scripts/validate-assets.mjs path/to/asset-manifest.json
node <skill-dir>/scripts/validate-timeline.mjs path/to/timeline.json
```

Use `--schema-only` only to inspect the bundled manifest template:

```bash
node <skill-dir>/scripts/validate-assets.mjs \
  <skill-dir>/references/asset-manifest.example.json --schema-only
```

## Workflow

### 1. Resolve the brief

Determine:

- Company/product and official URL
- Product or campaign focus
- Audience and distribution
- Duration; default to 15 seconds, normally support 15-30 seconds
- Aspect ratio; default to 16:9
- Language; default to English
- Required claims, CTA, and disclaimer needs
- Whether the user owns or may publish supplied assets

Ask only questions that materially change the film.

### 2. Build the brand truth sheet

Browse current official sources and extract:

- Exact logo variants and usage
- Official fonts or webfonts
- Primary, secondary, and dynamic colors
- Brand principles, tone, and visual motifs
- Current product names, features, scenarios, metrics, and CTA
- Official photography, renders, UI screenshots, footage, press assets, and media kits

Prioritize:

1. User-provided original
2. Company website, static bundle, newsroom, brand portal, media kit, or official repository
3. Company-controlled media library
4. Licensed stock or authorized partner kit

Read [references/asset-authenticity.md](references/asset-authenticity.md) before acquiring assets.

### 3. Create the asset manifest

Record every identity-bearing asset in `asset-manifest.json`:

- Stable ID and role
- Local path
- Exact source URL
- Source type
- Official verification page/file
- Rights/licensing note
- Authenticity status
- Optional SHA-256 checksum

The validator checks manifest structure, declared provenance, local file existence, and optional checksums. It does not independently grant usage rights or prove a remote source is truthful; manually perform the official-source comparison.

Do not start final rendering while validation fails.

### 4. Choose the story spine

Present 2-3 concise directions and recommend one:

- **AI/SaaS:** intent -> thinking/planning -> capabilities -> execution -> output -> proof -> logo
- **Physical product:** hero -> interaction -> feature macro -> usage context -> result -> logo
- **Service/company:** context -> process -> evidence -> outcome -> promise -> logo
- **Image-led brand:** authentic imagery -> visual motif -> benefit -> emotional payoff -> logo

Read [references/story-patterns.md](references/story-patterns.md) for duration patterns.

### 5. Plan exact frames

Use 30fps unless the project requires otherwise. Convert every boundary to an integer frame.

For 15 seconds, target 5-8 major beats; for 30 seconds, target 8-12. Give every beat:

- Start/end frame
- Visual owner and authentic asset IDs
- Primary action
- Anticipation, commitment, impact, brake, and settle
- Copy and readable hold
- Color state
- Incoming/outgoing transition

Use 6-12 frame overlaps when continuity benefits. One shot owns velocity; the next owns the destination.

### 6. Build intensity with control

- Use product motion, cursor paths, light, scrolling content, object edges, or matched geometry to drive transitions.
- Use 2-5 deliberate color states with strong contrast.
- Keep one primary action per beat; delay secondary layers by 2-6 frames.
- Establish 2-3 high-energy peaks and quieter braking moments.
- Preserve readable silhouettes, copy, and logo clear space.
- Avoid fake HUDs, arbitrary glass cards, decorative text walls, unverified metrics, and identical easing everywhere.

Read [references/motion-quality.md](references/motion-quality.md) before implementation.

### 7. Demonstrate cause and effect

Include at least one readable chain:

```text
user intent -> product action -> system response -> useful output
```

For AI products:

```text
prompt -> planning -> parallel capabilities -> generated result -> proof
```

Use actual UI captures, recordings, source code, or officially supplied screenshots. If actual UI is unavailable, use clearly conceptual abstract motion; never fabricate a branded interface and present it as real.

### 8. Implement and render

For Remotion:

- Define `state = f(frame, fps, inputs, constants)`.
- Keep shot boundaries in one timeline/constants module.
- Seed procedural variation with stable IDs.
- Preserve fractional values when deriving velocity.
- Keep image dimensions and aspect ratios explicit.
- Preserve previous compositions/outputs during iteration.

Prefer the project's local CLI. Typical discovery and render commands are:

```bash
pnpm exec remotion compositions <entry-file>
pnpm exec remotion render <entry-file> <composition-id> out/launch-film.mp4
```

Default preview:

- 1920x1080
- 30fps
- H.264 MP4
- Exact requested duration
- Visual-first V1; add sound only when requested or available

### 9. Verify

- Run asset-manifest and timeline validation.
- Run composition discovery/build and targeted lint/type checks.
- Verify media duration, frame rate, dimensions, and file integrity.
- Inspect representative frames and the complete render.
- Ask for timecoded feedback on pace, clarity, impact, authenticity, and smoothness.

### 10. Deliver provenance

Provide:

- Rendered video
- Composition/source path
- Exact specs and duration
- Asset manifest
- Brand/product source links
- Rights/disclaimer note
- Version identifier

State when the film is an unofficial concept and when commercial publication requires permission.

## Failure recovery

- **Wrong logo:** remove it, locate the current official file, record provenance, and rerender.
- **Fake-looking product/UI:** replace it with official, user-supplied, or licensed media; do not improve the imitation.
- **Fast but chaotic:** reduce simultaneous actions, assign a visual owner, and preserve matched motion across cuts.
- **Beautiful but generic:** add a complete product interaction, verified claims, and real outputs.
- **Smooth but slow:** shorten holds, overlap transitions, and brake only around key messages.
- **Asset unavailable:** ask for an authorized original; never guess.
