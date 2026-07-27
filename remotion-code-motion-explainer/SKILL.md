---
name: remotion-code-motion-explainer
description: Create polished, code-driven Remotion motion explainers from scripts, narration, subtitles, product specifications, reference videos, UI recordings, diagrams, or abstract concepts. Use for product launches, AI demonstrations, UI interactions, algorithms, scientific principles, electrical systems, data flows, architecture, charts, equations, and concepts best expressed with React, SVG, Canvas, WebGL, or Three.js. Prioritize continuous spatial logic, visible cause and effect, precise interaction states, editable parameters, deterministic rendering, and evidence-backed visual QA.
---

# Remotion Code Motion Explainer

Build an abstract explanation as one continuous, editable visual system. Show how each concept
changes instead of decorating narration with unrelated motion.

## Load the relevant guidance

- Read `references/code-motion-design.md` for every production.
- Read `references/motion-production-patterns.md` for every production.
- Read `references/production-and-qc.md` before implementation and final delivery.
- Read `references/ui-motion-shot-library.md` for UI, product, AI workflow, neon focus, waveform,
  dashboard, design-tool, or high-fidelity interface work.
- Read `references/reference-reconstruction.md` when studying or reproducing a reference video,
  After Effects render, prototype, or screen recording.
- Use `assets/shot-library` as the bundled editable starter library. Search
  `assets/shot-library/shot-library.json` before designing a new shot. Copy the library into the
  target project when a reusable component matches the semantic job; do not edit the installed
  Skill in place.
- Consult the installed Remotion documentation or best-practices skill before using unfamiliar APIs.

## Establish the production contract

1. Resolve the approved script or explanation, narration status, subtitle authority, aspect ratio,
   frame rate, duration, brand system, technical facts, and delivery format.
2. Treat human-verified subtitles as timing authority when narration exists. If there is no
   narration, create an explicit beat timeline and design the video to remain understandable muted.
3. Use only user-provided, licensed, public-domain, or clearly redistributable assets.
4. Never invent product behavior, numerical data, scientific relationships, or interaction results.
5. Prefer a parameterized visual system over one-off hard-coded scenes.

## Execute the workflow

### 1. Convert language into visual states

- Split the explanation into clause-level semantic beats.
- For every beat, record:
  - narration or on-screen statement;
  - narrative purpose;
  - input state;
  - dominant verb;
  - visible transformation;
  - output state;
  - viewer focus;
  - handoff to the next beat.
- Compile nouns, actions, numbers, relationships, and state changes into independent visual actors.
- Identify persistent objects that survive across beats.
- Choose the simplest accurate representation: UI, flow, diagram, waveform, formula, chart,
  spatial model, or 3D.
- Write the plan to `src/data/choreography-plan.json`.

Gate: every statement has a visible reasoning job, performer, result, and handoff.

### 2. Lock the visual system

- Define the grid, safe area, spacing, typography, color semantics, depth, camera, and motion curves.
- Write one concept-angle sentence describing the visual world.
- Design representative static frames for the hook, most complex mechanism, and ending.
- Build the maximum-information hero frame before designing entrances.
- Create a persistent-object registry and world-coordinate plan.
- Decompose complex objects into meaningful moving parts rather than animating flat screenshots.
- Keep identical concepts visually consistent throughout.

Gate: the static frames read as one system and the complex frame can be assembled from editable
components.

### 3. Implement deterministic Remotion motion

- Drive animation from `useCurrentFrame()`, `interpolate()`, `spring()`, and explicit frame ranges.
- Do not use CSS transitions, CSS keyframes, random values without seeded determinism, or
  independently timed browser animation.
- Keep values parameterized through props and Zod schemas where useful.
- Prefer React, SVG, and HTML. Use Canvas, WebGL, or Three.js only when the concept needs them.
- Measure text, clamp ranges, validate numerical inputs, and avoid frame-dependent side effects.
- Keep persistent objects mounted and mutate their state across beats.
- Compose two to four compatible motion atoms in each four-to-six-second review window.
- Give each window setup, action, visible result, and handoff phases.
- Freeze every time-dependent child from the same display frame when the ending must hold.

Gate: rendering is deterministic, editable, technically accurate, and stable at arbitrary frames.

### 4. Preserve continuity and causality

- Reuse position, object identity, scale, masks, direction, and audio motifs across transitions.
- Transform or hand off one meaningful element before introducing the next.
- Use camera moves only to reveal hierarchy or relationship.
- Avoid repeated full-screen fade-and-scale resets.
- Maintain at least one visual invariant across adjacent beats unless a chapter reset is deliberate.
- Make cause and effect legible: input moves, process reacts, output becomes visible, and the camera
  reveals the larger system.

Gate: the silent video remains understandable as one continuous explanation.

### 5. Bind narration, labels, and sound

- Trigger labels, values, states, and interaction feedback on exact subtitle cues.
- Keep narration clearly dominant over music and effects.
- Use restrained ticks, impacts, sweeps, and tonal accents only for visible events.
- Create an audio-event map alongside the motion plan.
- End music and motion with an intentional resolution instead of a hard cut.

### 6. Review, render, and learn

- Render the hook, the most complex mechanism, equations/data states, transitions, and ending first.
- Inspect entry, midpoint, maximum-information, handoff, and hold frames.
- Review contiguous motion windows and their overlaps, not only isolated screenshots.
- Create a contact sheet covering the full timeline.
- Verify the final frame hold by comparing two late frames pixel-for-pixel.
- Check text clipping, safe areas, color contrast, waveform/data correctness, missing assets, audio
  peaks, duration, frame rate, and codec.
- Save review evidence in `qc/workflow-evidence.json`.
- Record fixes and reusable components in `qc/production-learning.json`.

Gate: the complete render passes semantic, continuity, causality, composition, timing, technical,
and licensing checks.

## Reject

Reject inaccurate interactions, invented data, arbitrary movement, unreadable labels, flattened
process diagrams, generic slide resets, narration/subtitle mismatch, unlicensed assets, hard-coded
personal paths, non-deterministic rendering, missing motion-window review, skipped final-frame hold
checks, or branded reference copies presented as reusable templates.

## Deliver

Return the final video, editable Remotion project, timeline, component parameters, approved input
assets, audio stems when used, contact sheet, QC evidence, and a short list of reusable components.

## Bundled examples

- `assets/showcase/code-motion-promo-30s.mp4`: 30-second capability trailer.
- `assets/showcase/ac-to-dc-explainer.mp4`: scientific explainer example.
- `assets/shot-library`: editable Remotion shot library and searchable catalog.

