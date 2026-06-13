# Motion Personality: Brand → Parameters

Translate brand identity into motion parameters systematically. Never pick easing or duration by taste — derive them here, record the derivation in `motion_spec.md`.

## Step 1 — Locate the brand on two axes

- **Energy**: low (calm, premium, institutional) ↔ high (sporty, startup, entertainment)
- **Tone**: serious (finance, health, enterprise) ↔ playful (consumer, kids, social)

Read the logo itself for evidence: sharp geometric forms → engineered/serious motion; organic curves → flowing motion; rounded shapes and bright colors → soft/playful motion. User-stated brand words override visual inference.

## Step 2 — Axis → principle parameters

| Principle | Low energy | High energy |
|---|---|---|
| Squash & Stretch | 0–10% | 20–40% |
| Anticipation | 50–100ms | 150–300ms |
| Part timing | 400–800ms | 100–250ms |
| Exaggeration | 0–15% | 25–50% |
| Follow-through | extended soft settle | quick bounce |

| Principle | Serious | Playful |
|---|---|---|
| Arcs | direct, near-linear paths | curved, bouncy paths |
| Secondary action | minimal (shadow, fade) | abundant (sparkle, ripple) |
| Squash & Stretch | replace with plain scale | embrace |
| Appeal style | clean, geometric | round, organic |

## Step 3 — Personality presets

Pick the closest preset, then adjust from the axes. Each preset gives the **token set** to define once as CSS custom properties.

> **Token trap (Chromium)**: custom properties do NOT resolve in `animation-timing-function` declarations inside `@keyframes` — `animation-timing-function: var(--p2m-ease-enter)` is silently dropped and the segment runs with the animation's base timing function (usually `linear`), the exact mechanical motion these presets exist to prevent. Nothing errors and evenly-spaced frame strips look fine. Use the tokens in `animation:` shorthands (durations/delays resolve correctly) and as documentation, but write literal `cubic-bezier(...)` values inside keyframes with a comment naming the token. Verify with `scripts/probe_motion_continuity.py --probe`.

### Playful / Joyful (consumer apps, kids, social)
```css
--p2m-duration: 900ms;            /* reveal total; loops 1500-2000ms */
--p2m-ease-enter: cubic-bezier(0.34, 1.56, 0.64, 1);  /* overshoot */
--p2m-ease-settle: cubic-bezier(0.22, 1, 0.36, 1);
--p2m-squash: 0.18;               /* 18% deformation allowed */
--p2m-overshoot: 1.08;
```
Emphasize: squash & stretch, exaggeration, secondary action. Avoid: long anticipation (kills the fun).

### Elegant / Premium (luxury, fashion, hospitality)
```css
--p2m-duration: 1600ms;
--p2m-ease-enter: cubic-bezier(0.4, 0, 0.6, 1);       /* extended symmetric */
--p2m-ease-settle: cubic-bezier(0.16, 1, 0.3, 1);
--p2m-squash: 0;                  /* no deformation */
--p2m-overshoot: 1.02;            /* whisper of overshoot, or none */
```
Emphasize: timing (slow, unhurried), staging, arcs (long graceful paths), restraint as appeal. Fades and mask wipes over movement. Avoid: bounce, squash, fast cuts.

### Trustworthy / Professional (fintech, enterprise, B2B, healthcare)
```css
--p2m-duration: 700ms;
--p2m-ease-enter: cubic-bezier(0, 0, 0.2, 1);         /* confident ease-out */
--p2m-ease-settle: cubic-bezier(0.4, 0, 0.2, 1);
--p2m-squash: 0;
--p2m-overshoot: 1.0;             /* land exactly, no bounce */
```
Emphasize: slow in/out (smoothness = stability), consistent timing, solid drawing. Motion must be predictable: same easing family everywhere. Avoid: overshoot, randomness, secondary flourishes.

### Energetic / Bold (sports, gaming, startups, media)
```css
--p2m-duration: 600ms;
--p2m-ease-enter: cubic-bezier(0.16, 1, 0.3, 1);      /* explosive out */
--p2m-ease-settle: cubic-bezier(0.34, 1.56, 0.64, 1);
--p2m-squash: 0.25;
--p2m-overshoot: 1.12;
```
Emphasize: timing (fast), exaggeration, strong anticipation (coil before release), impact frames. Avoid: slow fades, symmetric easing.

### Calm / Caring (wellness, meditation, education)
```css
--p2m-duration: 1400ms;           /* loops: 3000-4000ms breathing */
--p2m-ease-enter: ease-in-out;
--p2m-ease-settle: cubic-bezier(0.4, 0, 0.6, 1);
--p2m-squash: 0.04;               /* breathing-level only */
--p2m-overshoot: 1.0;
```
Emphasize: slow in/out (symmetric oscillation), arcs, gentle staging. Opacity and blur over translation. Avoid: anything sudden; keep amplitudes small.

### Friendly / Approachable (small business, community, services)
```css
--p2m-duration: 850ms;
--p2m-ease-enter: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--p2m-ease-settle: cubic-bezier(0.22, 1, 0.36, 1);
--p2m-squash: 0.08;
--p2m-overshoot: 1.04;
```
Middle of every axis: soft deformation, moderate timing, one gentle secondary action.

## Step 4 — Sanity checks

- Describe the finished animation in 3 words. Do they match the brand words from the brief?
- Would a competitor's logo wearing this exact motion feel the same? If yes, push one principle further toward the personality.
- The same token values must drive reveal, loop, and hover variants — one brand, one motion voice.
- Show the animation without the product around it: still recognizably this brand?

## Universal tokens (work for any personality)

```css
--p2m-ease-out-universal: cubic-bezier(0.16, 1, 0.3, 1);
--p2m-ease-natural: cubic-bezier(0.4, 0, 0.2, 1);
--p2m-ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);   /* scale amplitude with duration */
--p2m-ease-narrative: cubic-bezier(0.34, 0, 0.14, 1);   /* deliberate sequences */
```
