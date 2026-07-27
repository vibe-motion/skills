# Production and QC

## Required project artifacts

Recommended layout:

```text
project/
├── src/
│   ├── components/
│   ├── data/choreography-plan.json
│   ├── Root.tsx
│   └── index.ts
├── public/
├── out/
└── qc/
    ├── stills/
    ├── contact-sheet.jpg
    ├── workflow-evidence.json
    └── production-learning.json
```

## Deterministic rendering

- Derive visual state only from frame, fps, props, and seeded data.
- Do not fetch unstable network content during render.
- Copy approved remote assets locally before final rendering.
- Validate that every asset resolves from a relative project path.
- Use one display frame for all children that must freeze together.
- Render representative frames twice when randomness or simulation is involved.

## Layered production

For complex work, preserve separate outputs for:

- base visual;
- transparent overlays;
- narration;
- music;
- sound effects;
- final mix.

Layered outputs make local repairs possible without re-rendering or degrading unaffected material.

## Visual checks

- no clipping, overflow, missing glyphs, or unsafe title placement;
- readable smallest text at delivery resolution;
- consistent semantic colors and object identities;
- no accidental blank frames;
- correct z-order and transparency;
- charts, formulas, waveforms, and UI results match the source facts;
- transitions preserve a visible invariant;
- the ending resolves and holds.

## Technical checks

Verify with a media probe:

- exact dimensions;
- expected frame rate;
- duration;
- video codec;
- audio codec and channel layout when audio exists;
- no unintended audio stream;
- file size suitable for the publishing destination.

## Evidence schema

`qc/workflow-evidence.json` should record:

```json
{
  "semanticActionResult": "pass",
  "persistentObjectHandoff": "pass",
  "motionWindowReview": "pass",
  "cueSync": "pass",
  "finalHold": {
    "frameA": 1045,
    "frameB": 1079,
    "identical": true
  },
  "notes": []
}
```

`qc/production-learning.json` should record each issue, root cause, fix, prevention rule,
verification, and reusable candidate. Promote a candidate only after validation in multiple
projects.

## Licensing and privacy

- Scan all text and metadata for usernames, home paths, tokens, internal domains, private contacts,
  client names, and unreleased products.
- Treat reference videos and After Effects projects as study material unless their license permits
  redistribution.
- Publish extracted, brand-neutral motion systems—not third-party footage or source projects.
- Keep attribution required by licenses near the relevant asset.

