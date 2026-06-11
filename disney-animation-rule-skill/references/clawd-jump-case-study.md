# Clawd Jump Case Study

Use this comparison as a diagnostic example, not as a fixed jump recipe.

## Stiff Version

The weaker implementation uses:

- Four intro hold frames
- One 24-frame travel phase
- Linear horizontal interpolation
- Linear vertical interpolation plus a symmetric parabolic bump
- Four outro hold frames
- No anticipation, pose change, overlap, impact response, or recovery

The trajectory reaches the correct platform, but every visible property shares one progress value. The motion communicates transport, not intention, effort, mass, or impact.

## Improved Version

The stronger implementation separates the action into:

| Phase | Baseline frames | Purpose |
| --- | ---: | --- |
| Intro hold | 4 | Establish the starting pose |
| Anticipation | 6 | Compress and reveal intent |
| Anticipation hold | 2 | Make the prepared pose readable |
| Ascent | 10 | Create a fast committed takeoff |
| Hangtime | 20 | Emphasize the apex and destination |
| Descent | 7 | Accelerate into contact |
| Landing squash | 3 | Show impact and weight |
| Recovery | 5 | Restore shape and settle |

It also adds:

- A two-frame squat release and four-frame smear overlay inside ascent
- Quintic Hermite segments to control endpoint velocities
- Arc-length-aware remapping for continuous exit speed
- A short apex lift and deliberate hangtime
- Velocity-aligned stretch
- Takeoff smear gated by speed
- Arm motion derived from jump phase and position
- Delayed arm reversal during descent
- Landing squash driven by incoming speed
- Adaptive clearance based on endpoints, viewport, and subject size
- Input updates before commitment, followed by trajectory locking

## Principles Demonstrated

- Squash and stretch: anticipation and landing compression
- Anticipation: crouch and arm preparation before launch
- Staging: readable phase contrast and apex emphasis
- Pose to pose: explicit launch, apex, contact, and recovery events
- Follow through and overlap: arm lag through direction changes
- Slow in and slow out: controlled boundary velocities and accelerated descent
- Arcs: curved travel with continuous tangent behavior
- Secondary action: arms and smear reinforce the jump
- Timing: asymmetric phase durations create effort and weight
- Exaggeration: hangtime, smear, and compression clarify the action
- Solid drawing: bottom-origin scaling preserves platform contact
- Appeal: the same simple shape gains intention and personality

## General Lessons

1. Replace a single progress curve with semantic phases.
2. Make spacing and pose carry the action before adding effects.
3. Derive visual response from motion signals and events.
4. Use asymmetry to communicate force, gravity, thought, and material.
5. Preserve interaction rules by choosing an explicit commitment point.
6. Scale thresholds and amplitudes to the scene instead of hardcoding pixels.
