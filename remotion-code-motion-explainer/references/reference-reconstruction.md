# Reference Reconstruction

## Declare fidelity

Choose one level before implementation:

- **inspired**: preserve principles and rhythm, not geometry;
- **structural**: preserve layout, topology, phases, and camera logic;
- **high fidelity**: reproduce measured geometry and timing with authorized assets;
- **exact**: reproduce pixels, audio, and timing only when the user owns or has licensed the source.

## Build an evidence ledger

Record:

- source dimensions, frame rate, duration, and checksum;
- semantic phase boundaries;
- object count and topology;
- bounding boxes and centers;
- path endpoints;
- camera scale and translation;
- color samples;
- text anchors;
- transition peaks;
- motion direction and easing observations.

A prose description is not enough for high-fidelity work.

## Reconstruction loop

1. Extract a fixed comparison frame set.
2. Segment the source into semantic phases.
3. Rebuild independent components.
4. Match topology and large geometry before styling.
5. Match typography, color, depth, and effects.
6. Match motion timing and transition peaks.
7. Render the identical frame set.
8. Compare overlays, crops, and numerical geometry.
9. Keep the previous best and merge only improvements.

Do not change the scorer, frame set, or weights during iteration.

## Generalization rule

Separate research evidence from reusable output. Remove logos, copy, proprietary audio, and
product-specific geometry before promoting a system. Expose semantic parameters and validate the
neutralized component in a second project.

