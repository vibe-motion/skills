# Closed / Self-Intersecting Ribbon Fitting — Centerline Scaffold + Recenter + Snap

Field-tested on a calligraphic ∞ mark (variable width 2→28px, one self-crossing,
one occluding bead). Use this recipe when the mark is a **closed** variable-width
ribbon and/or **crosses itself** — there are no two open boundaries to fit
directly, so the playbook's "fit boundaries from source pixels" rule needs this
adapted form. The principle survives: the centerline is only *scaffolding*; the
final edges are snapped to SOURCE pixels.

Implementation: `scripts/fit_ribbon_centerline.py` (seeds + exclusions JSON in,
outline/centerline path d + report out).

## The recipe

1. **Seed a closed Catmull-Rom centerline** through hand-read keypoints in
   drawing order: loop extrema, caps, the crossing (listed once per pass), the
   taper. 15–25 points suffice; accuracy ±5px is fine — recentering fixes it.
   Put the START at a hidden spot (behind an occluding dot, inside a knot):
   both outline caps land there.

2. **Measure along normals; auto-recenter.** Sample the spline densely (~30/seg).
   At each sample march ±along the normal: the mask interval containing the
   point yields a *midpoint* (true center) and a *width*. Then rebuild the
   control points from the smoothed midpoints and repeat. Converges in 2–3
   passes (mean shift 1.6 → 0.3px in the field run).
   - **Space rebuilt control points by ARCLENGTH** (~55px apart). Rebuilding by
     sample stride inflates the control count every pass (22 → 56 in one run)
     because each pass resamples denser.
   - Reject measurements wider than a contamination bound (~40px): they mean
     the normal crossed into a merged/parallel stroke.

3. **Exclusion circles bridge occlusions and crossings.** Inside each exclusion
   (covering dots/beads, every self-crossing) skip measurement entirely and
   fill midpoints/widths by interpolation along arclength — **circularly**,
   the gap may wrap the seam. Smooth lightly afterwards: σ≈2.5 samples for
   midpoints, σ≈3 for widths. Heavier smoothing curve-cuts high-curvature caps
   (~1px inward bias) and flattens fast width ramps near caps.

4. **Sub-pixel edge snap (the honesty pass).** Offset edges = center ± width/2
   · normal still carry ~1px of systematic smoothing bias. For each edge sample,
   find the luminance-threshold crossing along the normal by bilinear
   interpolation and shift the sample onto it (clamp ±2.5px; skip inside
   exclusions and where width < 6px — on hairline tapers the two edges are
   closer than the search radius and snap to each other; smooth the shifts,
   σ≈2). This pass is what reconciles the centerline-scaffold approach with
   the "boundaries from source pixels" rule.

5. **Emit smooth cubics.** Fit one cubic per ~30-sample chunk per edge
   (endpoints fixed, tangents from data, least-squares handle lengths — two
   scalars, closed form). Path = left edge forward + straight cut + right edge
   reversed + closing cut + `Z`, `fill-rule: nonzero` (a self-crossing stroke
   outline traversed left-forward/right-back winds consistently, so nonzero
   unions the overlap — no holes). Both cut caps sit at the hidden seam.

6. **Report exclusion arc-fractions.** For every exclusion circle, record where
   the centerline passes through it as fractions of total arclength. A
   crossing's two passes (e.g. 0.357 / 0.835) are exactly the cut parameters a
   downstream split draw-on animation needs (see pixel2motion's reveal-patterns
   "Draw-On Across Self-Intersections").

## Pitfalls measured in the field

| pitfall | symptom | fix |
|---|---|---|
| stride-based control rebuild | control count inflates every recenter pass | space by arclength |
| heavy width smoothing (σ≈6) | caps/fast ramps cut ~1.5px inward | σ≈3 + edge snap |
| snapping hairline tapers | edge snaps onto the *opposite* edge | skip snap where width < 6px |
| linear (non-circular) gap fill | seam-adjacent exclusion interpolates across the whole loop | circular interpolation |
| trusting the dot-region width | occluded; garbage measurements | exclusion circle + bridge |
| gradient-filled parts in IoU | binary-mask diff inflates while visually faithful | judge structurally; report the artifact |

## Wordmark font matching (live `<text>`)

When the lockup includes a wordmark and exact letterforms are not required:

1. **Enumerate fonts actually installed** (`ls /System/Library/Fonts*`,
   `fc-list`). Never trust name-based stacks: two "different" families scoring
   *identical* region IoU means both fell back to the same font — a missing
   "Garamond" can silently resolve while a real one never existed.
2. Per candidate, **auto-tune `font-size` to the source cap height** (2–3
   render-measure-scale iterations against the wordmark bbox), baseline pinned.
3. Rank by wordmark-region IoU **and ink-weight ratio** (rendered ink px ÷
   source ink px). Weight ratio ≈ 1.0 beats marginally-higher IoU with 1.2×
   heavier strokes: weight mismatch reads instantly, letterform differences
   read slowly. (Field run: Baskerville 1.04 ratio / IoU 0.535 chosen over
   Times 1.26 / 0.540 — visibly better.)
4. Lock geometry cross-platform: `textLength="<measured width>"
   lengthAdjust="spacingAndGlyphs"`, `text-anchor` + measured baseline; stack
   best-first with graceful fallbacks; document the substitution as a known
   residual.
