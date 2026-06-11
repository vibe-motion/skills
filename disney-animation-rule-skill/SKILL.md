---
name: disney-animation-rule-skill
description: Apply Disney's 12 principles as practical design and engineering rules for procedural animation. Use when creating, improving, reviewing, or debugging code-driven motion in web, SVG, canvas, React, Remotion, game, UI, character, camera, or 3D scenes; especially when motion feels stiff, weightless, mechanical, unclear, or physically correct but visually weak.
---

# Disney Animation Rules for Procedural Animation

Design motion for readable intent, weight, rhythm, and personality. Treat physical simulation and interpolation as inputs, not as the final animation.

Do not force all 12 principles into every shot. Select the smallest set that fixes the perceptual problem.

## Workflow

1. Inspect the scene, code, inputs, renderer, and project constraints before changing motion.
2. State the action in one sentence: subject, intention, force, destination, and desired feeling.
3. Identify the primary action and rank all secondary actions beneath it.
4. Block semantic phases and event poses before selecting easing curves.
5. Select relevant principles from `references/twelve-principles.md`.
6. Define one deterministic state evaluator from frame or time plus explicit inputs.
7. Derive deformation, overlap, accents, and effects from primary motion or semantic events.
8. Tune timing and spacing at representative frames, then review the full motion.
9. Remove effects that hide weak posing, unclear timing, broken contacts, or poor silhouettes.

For detailed engineering patterns, read `references/implementation-patterns.md`. For the motivating jump comparison, read `references/clawd-jump-case-study.md`.

## Block the Action

Define event poses such as:

- Rest or setup
- Anticipation
- Commitment or launch
- Passing pose
- Apex, hold, or decision point
- Contact or impact
- Overshoot
- Settle or recovery

Adapt the vocabulary to the action. A button press may use rest, press, contact, overshoot, and settle. A camera move may use establish, accelerate, reveal, brake, and settle.

For each phase, specify:

- Duration or duration ratio
- Position and path
- Velocity at each boundary
- Scale, rotation, and pivot
- Contact constraints
- Silhouette or readability goal
- Secondary-action lag
- Optional accent such as smear, blink, particles, or camera shake

Prefer a phase table or explicit constants over one opaque easing expression.

## Build the Motion Hierarchy

Build in this order:

1. Preserve functional constraints, contacts, bounds, and input behavior.
2. Make the primary path and timing readable with the subject rendered as a simple shape.
3. Add pose changes and deformation around force and contact events.
4. Add follow-through and overlap with controlled phase offsets.
5. Add secondary action that reinforces, never competes with, the main action.
6. Add accents only where speed, impact, or clarity justify them.

Make the primary motion work without motion blur, particles, trails, or sound.

## Engineer Deterministically

- Compute animation state as `state = f(frameOrTime, inputs, parameters)`.
- Keep evaluation independent of previous renders and render order.
- Preserve fractional frames through interpolation and derivative calculations.
- Seed procedural variation from stable identifiers; never use unseeded randomness during rendering.
- Derive velocity and acceleration analytically or by sampling the pure state function.
- Snapshot interactive inputs at an intentional commitment event when later changes would break the action.
- Keep contact anchors fixed during squash, stretch, recoil, or settle unless sliding is intentional.
- Preserve position and velocity continuity across phase boundaries unless a deliberate hit, cut, or snap requires discontinuity.
- Normalize thresholds and amplitudes by subject size, travel distance, viewport, or scene scale.
- Clamp exaggeration to protect legibility, geometry, and interaction constraints.

For Remotion, make every frame independently calculable because frames may render in parallel and out of order. For browser-based 3D work in environments that prohibit Remotion for 3D, use the project's Puppeteer capture workflow.

## Tune by Perception

Judge spacing, not just curves:

- More distance between samples reads as more speed.
- A short preparation followed by a large spacing change reads as force.
- Closely spaced samples near an apex or decision point create emphasis.
- Fast contact followed by compression and recovery creates weight.
- Delayed extremities create flexibility and momentum.
- A clean silhouette creates clarity before detail does.

Use asymmetry deliberately. Equal ascent and descent, identical easing on every channel, and synchronized body parts often read as mechanical.

## Review Checklist

- Read the action correctly from a few still frames.
- Confirm anticipation points in the direction of the coming action.
- Confirm the path, orientation, and deformation agree with velocity and force.
- Confirm impact intensity responds to incoming speed or force.
- Confirm secondary action starts later and settles later than the primary action.
- Confirm holds are intentional and do not freeze every channel.
- Confirm responsive layouts preserve the same action logic at different scales and endpoints.
- Confirm no effect compensates for a weak pose or broken transition.
- Confirm each rendered frame is deterministic for identical inputs.

## Avoid These Defaults

- Do not use one linear progress value for every property.
- Do not assume a symmetric parabola automatically creates a convincing jump.
- Do not add generic bounce or elastic easing without identifying the force and pivot.
- Do not apply squash and stretch continuously; concentrate it around acceleration and contact.
- Do not let secondary motion lead the primary action.
- Do not preserve physical realism at the cost of readability.
- Do not exaggerate every channel at once.
- Do not introduce stateful frame-to-frame simulation into an out-of-order renderer.
