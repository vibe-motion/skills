# Logo Choreography Pattern Library

Reveal, loop, and hover patterns. Each entry: when to use, principles it leans on, timeline shape, and a CSS skeleton targeting motion-ready part ids. All durations assume the personality tokens from `motion-personality.md`; multiply, don't hardcode.

The timeline shape notation `A:B:C` = anticipation : action : follow-through as % of total (golden ratio default 20:50:30).

---

## Reveals

### 1. Draw-On (stroke reveal)
**For**: marks with a clear stroke skeleton — monograms, signatures, line icons, circular C-marks.
**Principles**: straight-ahead feel on a pose-to-pose spine; slow in/out; staging (the pen leads the eye).
**Requires**: `pathLength="1"` on each drawn path; path direction = draw direction.
**Shape**: 10:70:20 (drawing IS the action; brief pre-beat; ink "dries" as fills fade in after).

```css
#mark path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: p2m-draw calc(var(--p2m-duration) * 0.7) var(--p2m-ease-natural) calc(var(--p2m-duration) * 0.1) forwards;
}
@keyframes p2m-draw { to { stroke-dashoffset: 0; } }
/* fills fade in during the last 20% */
#mark .fill { opacity: 0; animation: p2m-fade calc(var(--p2m-duration) * 0.25) ease-out calc(var(--p2m-duration) * 0.75) forwards; }
@keyframes p2m-fade { to { opacity: 1; } }
```
Multiple strokes: stagger starts by 10–15% of one stroke's duration, ordered by natural writing order.

#### Dash math — artifact table

With `pathLength="1"` everything is normalized; `stroke-dasharray: <dash> <gap>`. Wrong combinations leak ink before the draw starts — check the t=0 frame explicitly:

| caps | dasharray | start offset | result |
|---|---|---|---|
| round | `1` (gap=1, period 2) | `1` | **artifact**: the zero-length dash at the path start renders its round cap — an ink dot before the draw begins |
| round | `1` | `1.05` (overshoot) | **artifact**: period-2 wraparound shows the path TAIL — [0.95, 1] is visible at t=0 |
| round | `1 1.2` (gap > path) | `1.1` | correct for round caps: every dash interval stays off [0, 1] until the draw starts. Note the visible tip still LEADS the pen by half the stroke width (cap lookahead) — fine for single-stroke draws, disqualifying for multi-piece handoffs |
| butt | `1 1` | `1` | correct and exact: a zero-length butt dash renders nothing, visible tip == pen position. Mandatory for split-fill handoffs (§1b) |

If a mask stroke's seam/caps would rest at a visible location, hide them under an occluder (dot, knot, letter) chosen back in Phase 2.

### 1b. Draw-On Across Self-Intersections (split-fill)
**For**: ∞ marks, script signatures, monograms — any centerline that crosses itself.
**Problem**: the reveal stroke is roughly the ribbon's max width; at a crossing it reveals the *other* branch's fill before the pen reaches it — an "X" pops in mid-draw.
**Principles**: same as Draw-On, plus solid drawing (the partial mark must always look hand-drawn, never glitched).

Recipe (all numbers field-verified):

1. **Split the FILL into pieces** cut between crossing passes — cut ~40px of arc before the later pass; overlap the pieces ~4px with the same color (invisible, AA-proof). A piece that hasn't started is entirely absent from screen, so no stroke width can pre-reveal it.
2. **One mask per piece**, each containing its own centerline sub-path spine with `pathLength="1"`. Get the cut parameters (each crossing's arc fractions) from `fit_ribbon_centerline.py`'s report.
3. **Butt caps + `stroke-dasharray: 1 1`, offset `1 → 0`** on every mask spine (see the artifact table). Round caps stall the visible tip at each handoff (the half-stroke-width lookahead "re-arms"), then pop the next piece in as a cap-radius disk — measured as a 50ms ink flatline plus a disk-sized jump.
4. **Extend the LATER piece's spine ~6px back before the cut**, so both pieces' tips traverse the overlap together and the handoff is spatially continuous.
5. **Subdivide the global easing exactly** (de Casteljau). For draw easing E as a cubic Bézier in (time, progress) space — P0=(0,0), P1=(x1,y1), P2=(x2,y2), P3=(1,1):
   - solve τ where progress y(τ) = the piece boundary's arc fraction (bisection on the monotonic y);
   - de Casteljau-split E at τ; normalize each half into its own `cubic-bezier()` by translating to its start point and dividing control coordinates by the segment's (Δx, Δy) spans;
   - subdivide at the cut fraction for the earlier piece's END, and at (cut − 6px)'s fraction for the later piece's START. Each piece animates over its own keyframe window with its own literal curve; the combined pen pace equals the original design exactly (verify: tip speed continuous across the handoff, e.g. 1.49 → 1.45 px/ms).
6. **Bridge the paint-under-ink dead window.** The later pass crosses *under* already-painted fill: for ~10–25ms no pixel can change — physically unavoidable (the ink sweep shows one near-zero sample). Add a **tip glint**: a small soft radial-gradient light (r ≈ 0.3× max ribbon width) with base `opacity="0"` in the SVG, riding the FULL centerline via `offset-path: path(...)` + `offset-distance 0% → 100%` with the ORIGINAL un-subdivided easing — it then coincides with the pen tip exactly (probe: 0px divergence). Z-order it beneath the occluding dot/bead so it emerges from and returns under it; fade it in after the anticipation beat and out before the settle. Base opacity 0 keeps static/?static=1/reduced-motion/final states clean.

QA for this pattern: frames bracketing EACH crossing pass (the early pass must show a single clean branch), the easing probe (tip and glint must agree), the ink-delta sweep across the handoff (no flatline-then-jump), and the Final Frame Contract.

### 2. Staggered Assembly
**For**: multi-part logos — mark + wordmark, geometric compositions, dots + swooshes.
**Principles**: follow-through & overlapping action (the star), staging (reading order), arcs (parts arrive on curves).
**Shape**: 20:50:30. Drag hierarchy: container/mark → letters → accents. Per-part stagger = 10–20% of part duration.

```css
#mark     { animation: p2m-arrive var(--p2m-duration-part) var(--p2m-ease-enter) 0ms both; }
#letter-1 { animation: p2m-arrive var(--p2m-duration-part) var(--p2m-ease-enter) 60ms both; }
#letter-2 { animation: p2m-arrive var(--p2m-duration-part) var(--p2m-ease-enter) 120ms both; }
#dot      { animation: p2m-arrive-bounce var(--p2m-duration-part) var(--p2m-ease-settle) 220ms both; }
@keyframes p2m-arrive {
  from { opacity: 0; transform: translateY(12px) scale(0.95); }
  60%  { opacity: 1; transform: translateY(-2px) scale(var(--p2m-overshoot)); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```
Cap the full cascade at ~700ms beyond the first arrival; with many letters shrink stagger, not letter duration. Parts need `transform-box: fill-box; transform-origin: center;`.

### 3. Scale-Pop with Overshoot
**For**: compact marks, app icons, badges; the default splash gesture.
**Principles**: anticipation (pre-shrink), squash & stretch (personality-gated), exaggeration, follow-through (overshoot + settle).
**Shape**: 20:50:30 literally — this is the textbook golden-ratio pattern.

```css
#logo {
  transform-box: fill-box; transform-origin: center;
  animation: p2m-pop var(--p2m-duration) var(--p2m-ease-narrative) both;
}
@keyframes p2m-pop {
  0%   { opacity: 0; transform: scale(0.6); }
  20%  { opacity: 0; transform: scale(0.55); }            /* anticipation: coil */
  60%  { opacity: 1; transform: scale(var(--p2m-overshoot)); }
  80%  { transform: scale(0.99); }                        /* counter-settle */
  100% { transform: scale(1); }
}
```
Deliberate splash variant: start `scale(0.6) translateY(50px)` with `filter: blur(10px)`, clear blur by 60%.

### 4. Mask Wipe
**For**: wordmarks, horizontal lockups, elegant/premium personalities (motion without deformation).
**Principles**: staging (the wipe directs reading), timing, solid drawing (geometry never deforms).
**Shape**: 15:60:25. Wipe direction = reading direction (LTR logos wipe left→right).

```css
#wordmark { clip-path: inset(0 100% 0 0); animation: p2m-wipe calc(var(--p2m-duration) * 0.6) var(--p2m-ease-enter) calc(var(--p2m-duration) * 0.15) forwards; }
@keyframes p2m-wipe { to { clip-path: inset(0 0 0 0); } }
```
Premium touch: pair with a 2–4px translateX drift in the same direction, settling as the wipe completes.

### 5. Morph-from-Primitive
**For**: logos whose mark relates to a simple shape (a circle becoming the C, a square unfolding).
**Principles**: anticipation (the primitive IS the anticipation), appeal, solid drawing.
**Note**: keep it cheap — morph between *few-knot* paths with identical command structure (this is where Phase 2's minimal geometry pays off; a 400-point traced path cannot morph). Animate `d` via CSS `d: path()` (Chromium) or pre-computed keyframe paths; cross-fade fallback for engines without `d` support.
**Shape**: 25:50:25 — hold the primitive a beat longer so viewers register the transformation.

### 6. Letter Cascade (wordmark-first logos)
**For**: type-driven brands.
**Principles**: overlapping action, arcs (letters arrive on subtle curves), timing (per-letter weight).
Per-letter duration 200–300ms, stagger 30–60ms, total ≤ 700ms. Letters rise `translateY(0.6em → 0)` + fade, with optional 1–2° rotation that zeroes on landing (keeps baselines honest — check solid drawing in mid-frames).

---

## Idle / Loading Loops

Seamlessness rule: the 100% keyframe must equal the 0% keyframe exactly. Verify with seam frames (capture just before and after the loop point).

### Breathing
`scale(1 ↔ 1.02)`, 3000–4000ms, ease-in-out, infinite. Calm/ambient. Amplitude ≤ 2% — the logo is present, not performing.

### Pulse Accent
One part (the dot, the accent) pulses `opacity 0.7 ↔ 1` or `scale 1 ↔ 1.06`, 1500–2000ms cycle. Staging: only ONE part may pulse.

### Orbit / Spinner
A satellite element rotates around the mark, 1200–2000ms, **linear** (the one legitimate use of linear — eased rotation pulses). Mark itself stays still or breathes counter-phase.

### Draw-Cycle
Draw-on forward (70%), hold (15%), fade strokes (15%), repeat. For loading states 2000–3000ms cycle. Decay rule: if loading completes mid-cycle, finish the current draw then settle to the static logo — never hard-cut.

Loop hygiene: still pleasant after 30 seconds? If it would annoy on the tenth loop, halve the amplitude. Stop or decay attention-grabbing loops after 3–5 cycles when nothing is actually loading.

---

## Hover / Micro-interactions

Duration 150–300ms, ease-out only (no time for ease-in). Must read as *response*, not *performance*.

- **Lift**: `translateY(-2px)` + shadow tighten, 200ms. Trust/professional.
- **Wink**: the accent part (dot, leaf) does a single 8–12% squash-bounce, 250ms. Playful.
- **Sheen**: a masked highlight sweeps the wordmark once, 300ms. Premium.
- **Re-draw**: the mark's stroke redraws at 2× speed, 300ms. Technical/creative brands.

Hover must return to the exact rest state (Final Frame Contract applies to interaction end-states too). Provide `:focus-visible` parity for keyboard users.

---

## Composition rules

1. One reveal + at most one idle loop + at most one hover behavior. More is noise.
2. Reveal plays once per session/page-load context; never on every route change.
3. All variants share the same personality tokens.
4. Everything lives inside `@media (prefers-reduced-motion: no-preference)`; the reduced-motion experience is the finished static logo, immediately.
5. Performance: animate only `transform`, `opacity`, `clip-path`, `stroke-dashoffset`, `filter` (sparingly). Never layout properties. One `will-change` per animated part at most, removed after the reveal.
