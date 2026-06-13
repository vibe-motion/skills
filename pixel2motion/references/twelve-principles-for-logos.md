# The 12 Principles, Applied to Logo Motion

Distilled from Disney's 12 Principles of Animation (Johnston & Thomas, *The Illusion of Life*) for the specific job of animating a vectorized logo. Each entry: what the principle means for a logo, concrete parameter ranges, and the failure mode to avoid.

## 1. Squash & Stretch

Deformation shows weight and life. For logos, deformation is **personality-gated**: playful brands may squash 10–25%; professional brands use plain scale transforms (0%) instead. Scale deformation proportionally to duration — ~5% at 100ms, up to 30–40% only in deliberate 1200ms+ brand moments.

- Dots landing: squash to `scaleY(0.8) scaleX(1.15)` on impact, recover over 30% of the bounce duration.
- Volume preservation: if X stretches, Y compresses. `scale(1.2, 0.85)` not `scale(1.2, 1)`.
- **Failure mode**: squashing a luxury/fintech mark. If the brand words are "precise / trustworthy / premium", skip deformation entirely.

## 2. Anticipation

Prepare the eye before the main action. The wind-up is **20–30% of the main action's duration** at any time scale: a 750ms assembly gets a 150–220ms anticipation; a deliberate splash can take a full 300–400ms dramatic pause or counter-movement.

- Patterns: brief dim/scale-down before the pop (`scale(0.96)` → action), a dot pulling back before sliding into place, a 1–2px counter-translate opposite the travel direction, a beat of empty canvas before the first stroke draws.
- **Failure mode**: elements just *starting*. Motion with no anticipation reads as a glitch, not an entrance.

## 3. Staging

One clear focus at a time. The logo reveal is a tiny film: establish the mark, then the wordmark, then the tagline — never all at once.

- Choreograph a **reading order** and verify it in the frame strip: where does the eye go at t=300? t=800?
- Background/secondary parts must be quieter (smaller amplitude, lower opacity delta) than the focal part.
- Negative space is staging too: a mask wipe that reveals the counter-form of a mark stages the silhouette itself.
- **Failure mode**: simultaneous equal-amplitude motion everywhere — the eye has nowhere to land.

## 4. Straight Ahead vs Pose to Pose

Logo motion is **pose-to-pose by design**: define key poses (hidden → anticipation pose → peak → overshoot → final), then let easing interpolate. A deliberate 1200–2000ms sequence wants 6–10 key poses; a 300ms header reveal wants 2–3.

- The final pose is non-negotiable: it is the QA-verified static vector (the Final Frame Contract).
- Straight-ahead thinking only suits continuous idle loops (drift, shimmer) where there is no destination.
- **Failure mode**: keyframes placed by trial-and-error percentages with no named pose behind each one.

## 5. Follow Through & Overlapping Action

Nothing stops all at once. The single highest-leverage principle for logo builds.

- **Drag hierarchy**: root (container/main mark) moves and lands first → primary parts (letters) → secondary (dots, accents) → tertiary (sparkle, underline). Offset each level by 2–4 frames (~35–70ms at 60fps).
- Letters in a wordmark arrive with **staggered settling**: stagger delay = 10–20% of one letter's duration (300ms letters → 30–60ms stagger). Cap total cascade ≈ 500–700ms; with many letters, shrink the per-letter stagger rather than stretching the total.
- Follow-through occupies ~30% of the timeline: overshoot the final pose slightly (`scale(1.02)`, `translateY(-2%)`), then settle with ease-out. Fast stops earn longer follow-through; slow arrivals settle subtly.
- **Failure modes**: everything stopping on the same frame (robotic); excessive overshoot (disconnected, floaty); all parts sharing one delay (no hierarchy).

## 6. Slow In / Slow Out

Easing is mandatory; linear motion looks mechanical at every duration (the only exception: continuous rotation in a spinner-style loop, which must be `linear` to avoid pulsing).

- Entrances: ease-out (`cubic-bezier(0, 0, 0.2, 1)` or the stronger `cubic-bezier(0.16, 1, 0.3, 1)`).
- Duration < 150ms: ease-out only — there is no time for an ease-in.
- 150–400ms: ease-out or custom; 400ms+: full ease-in-out becomes available.
- Deliberate narrative arcs: `cubic-bezier(0.34, 0, 0.14, 1)` (sharp interest, soft resolution).
- **Failure mode**: default `ease` everywhere — it's an opinion, not a decision.

## 7. Arcs

Natural motion curves. A dot flying to its position should travel a subtle arc, not a straight line — combine X and Y keyframes with different easing, or use `offset-path`.

- Short reveals: subtle curvature (a few px of perpendicular bow). Deliberate sequences: designed sweeping trajectories that echo the logo's own curves (a swoosh's dot should arrive along the swoosh's implied arc).
- Rotational entries (orbit-in) are arcs by construction; mind the transform-origin.
- **Failure mode**: diagonal straight-line travel — reads as engineered, not alive (fine only if the brand is deliberately mechanical).

## 8. Secondary Action

Supporting motion that reinforces without competing: a soft glow blooming as the mark lands, an underline drawing after the wordmark settles, a 1–2px shadow tightening on touchdown.

- Secondary action obeys staging: lower amplitude, often after the primary beat, never overlapping the focal moment.
- Use sparingly and personality-gated: playful brands can afford a sparkle; minimal brands get at most a fade or shadow shift.
- **Failure mode**: confetti on a B2B logo; or secondary action firing *during* the primary action and splitting attention.

## 9. Timing

Duration is the message. Pick the band from usage context, then refine per part:

| Context | Band | Notes |
|---|---|---|
| Hover / micro-feedback | 150–300ms | ease-out only |
| Header / in-page reveal | 300–800ms | standard reveal, stagger ≤ 3 beats |
| Splash / brand intro | 1200–2000ms | full narrative: anticipation–action–settle |
| Loading / idle loop | 1500–4000ms cycle | seamless, hypnotic not annoying |
| Error / attention shake | ~400ms, 1 cycle | rare for logos; only on interaction |

Universal laws: shorter distances → shorter durations; bigger/heavier parts move slower; enter fast, exit faster; first-visit tolerance is higher than repeat-visit (a 2000ms splash that plays on every route change is a bug, not a brand moment).

- **Failure mode**: one duration for every part regardless of size or travel distance.

## 10. Exaggeration

Push past reality for clarity — within personality bounds. Exaggeration budget scales with duration and brand energy: subtle polish ≈ scale from 0.95; dramatic ≈ from 0.6–0.8 with blur; playful overshoot ≈ `cubic-bezier(0.34, 1.56, 0.64, 1)`; elegant brands cap overshoot at ~2%.

- Exaggerate the *important* beat (the mark's landing), not everything.
- **Failure mode**: uniform exaggeration — when everything is dramatic, nothing is.

## 11. Solid Drawing

Volume, perspective, and proportion stay consistent while moving. For vector logos this means: transforms must not distort the verified geometry (uniform scale unless squash is intentional and volume-preserving), parts must not visually detach from the group during motion, strokes keep their width profile (`vector-effect="non-scaling-stroke"` when scaling stroked parts), and nothing clips the viewBox mid-flight.

- Check the mid-action frames: is the logo still *the logo* at t=50%?
- **Failure mode**: a swoosh that thins as it scales; letters whose baselines drift during the cascade.

## 12. Appeal

The sum test: would you watch it twice? The animation should feel like the brand wearing motion, not motion wearing a logo. Clean = appealing: fewer, better-chosen movements beat many simultaneous effects. Replay it; show it without context — is it recognizably *this* brand? Could a competitor ship the identical animation? If yes, the choreography is generic — revisit the personality mapping.

- **Failure mode**: technically flawless, emotionally anonymous.

---

## Quick interaction matrix

- Timing defines follow-through length (fast stop → long settle).
- Arcs govern follow-through paths (settling swings, not slides).
- Anticipation ratio is duration-invariant (20–30% of action).
- Squash/stretch reappears at settling (slight compression on landing).
- Staging decides which part gets exaggeration; appeal judges the whole.
