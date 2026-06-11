# Procedural Animation Implementation Patterns

## Contents

- Pure state evaluation
- Semantic timeline
- Boundary continuity
- Motion-derived signals
- Follow-through without stateful simulation
- Contact-aware deformation
- Responsive actions
- Rendering strategy
- Tuning order

## Pure State Evaluation

Define one source of truth:

```js
function getStateAtTime({ time, inputs, params }) {
  const phase = getPhase(time, params.timeline);
  const primary = getPrimaryMotion({ time, phase, inputs, params });
  const velocity = sampleVelocity(getPrimaryMotion, time, inputs, params);
  const pose = getPose({ time, phase, primary, velocity, params });
  const secondary = getSecondaryMotion({ time, phase, primary, velocity, params });
  return { primary, pose, secondary };
}
```

Keep DOM, React, canvas, SVG, or 3D rendering as a projection of this state.

## Semantic Timeline

Represent phases explicitly:

```js
const timeline = [
  { name: "anticipation", duration: 0.16 },
  { name: "commit", duration: 0.07 },
  { name: "travel", duration: 0.42 },
  { name: "impact", duration: 0.08 },
  { name: "settle", duration: 0.18 },
];
```

Return local phase progress, global progress, start time, and end time. Keep events such as launch and contact addressable by name.

## Boundary Continuity

- Use Hermite interpolation when endpoint position and velocity both matter.
- Use arc-length remapping when a curved path needs controlled speed.
- Match velocity at connected phase boundaries.
- Introduce discontinuity only for a purposeful hit, snap, cut, teleport, or collision response.

## Motion-Derived Signals

Sample a pure trajectory around the current time:

```js
const before = getPrimaryAt(time - dt);
const after = getPrimaryAt(time + dt);
const vx = (after.x - before.x) / (2 * dt);
const vy = (after.y - before.y) / (2 * dt);
const speed = Math.hypot(vx, vy);
const direction = Math.atan2(vy, vx);
```

Use these signals to drive:

- Stretch along travel direction
- Cross-axis squash
- Smear visibility and length
- Cloth, hair, ear, tail, or antenna lag
- Impact compression from incoming speed
- Particle amount or camera shake from force

Normalize speed and force by subject size or scene scale before mapping them to visual intensity.

## Follow-Through Without Stateful Simulation

- Sample the primary state at `time - delay` for simple lag.
- Use different delays and amplitudes down a hierarchy.
- Use a closed-form damped oscillator for recoil or settle.
- Seed any noise from stable IDs and evaluate it directly from time.
- Avoid accumulating velocity or position from the previous rendered frame.

## Contact-Aware Deformation

Apply transforms around a meaningful pivot:

- Ground contact: bottom or foot support point
- Button press: pressed surface
- Hanging object: attachment point
- Arm swing: shoulder or joint pivot
- Camera recoil: intended optical or rig pivot

Recompute visual position after scale changes so the contact anchor does not drift.

## Responsive Actions

- Express distances and thresholds relative to viewport, subject size, or travel distance.
- Recompute valid paths while the action is still preparing.
- Snapshot source and target at the commitment event.
- Keep the committed trajectory stable through travel and contact.
- Adapt arc height, clearance, and exaggeration to available space.

## Rendering Strategy

- Preserve fractional frame values.
- Make each Remotion frame independently calculable.
- Keep subframe-dependent state inside any motion-blur sampling subtree.
- Use Puppeteer capture for browser-based 3D when project rules exclude Remotion.
- Separate animation state from renderer-specific side effects.

## Tuning Order

1. Verify contacts and bounds.
2. Tune key poses and silhouette.
3. Tune phase durations and spacing.
4. Tune path and orientation.
5. Tune squash, stretch, overshoot, and settle.
6. Tune overlap and secondary action.
7. Add smear, blur, particles, and camera accents.
