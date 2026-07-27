# Motion Production Patterns

## Concept angle

Write a single sentence that names the visual world and its logic. Examples:

- A live circuit bench where energy travels through every conversion stage.
- A product workspace that expands from one command into a coordinated agent system.
- A city of data blocks whose roads reveal an algorithm's decisions.

The concept angle constrains choices without forcing every scene into the same layout.

## Hero-frame-first construction

For each motion window:

1. Compose the frame with the maximum meaningful information.
2. Verify hierarchy, spacing, labels, and evidence.
3. Decompose it into independent actors.
4. Design setup and entrance motion.
5. Design the visible result and handoff.

Do not begin with entrance animations and hope they assemble into a good frame.

## Motion atoms

Combine a small number of compatible atoms:

- reveal along path;
- follow-path transfer;
- state morph;
- value count or interpolation;
- focus pulse;
- mask wipe;
- camera push or pull;
- staggered assembly;
- graph trace;
- particle flow;
- orbit or field response;
- UI press, type, drag, select, confirm.

Give every atom a semantic owner, active interval, easing family, result, and handoff velocity.

## Rhythm signature

Avoid uniform timing. A useful explanatory rhythm is:

`orient → anticipate → transform → inspect → handoff`

Reserve short pauses for comprehension after visible results. Avoid long dead zones unless the
narration requires reflection.

## Parameterized scenes

Expose meaningful parameters instead of cosmetic trivia:

- data values and units;
- topology or number of stages;
- labels and language;
- colors by semantic role;
- timing and frame rate;
- camera framing;
- waveform frequency and amplitude;
- product states;
- output aspect ratio.

Keep parameters validated and deterministic. A reusable component must work with at least two
fixtures before being promoted as a general template.

## UI interaction

Render the complete interaction:

`idle → pointer/focus → action → immediate feedback → system response → settled result`

Do not show a cursor moving without a state change. Do not replace product evidence with ornamental
glow. Use realistic hit areas, typing cadence, selection states, loading behavior, and success
feedback.

## Audio event map

Create audio cues from visible events rather than adding effects after rendering:

```json
[
  {"frame": 96, "event": "panel-lock", "sound": "soft-click"},
  {"frame": 184, "event": "data-transfer", "sound": "short-sweep"},
  {"frame": 268, "event": "result-confirmed", "sound": "tonal-resolve"}
]
```

Keep sound effects sparse and subordinate to narration.

