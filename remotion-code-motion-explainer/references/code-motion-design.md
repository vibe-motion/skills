# Code Motion Design

## Semantic compilation

Turn each clause into a state transition:

`input state → action → physical or logical consequence → visible result → handoff`

Do not assign one generic illustration to an entire paragraph. Spoken buttons must be pressed,
spoken values must change, and spoken relationships must become visible.

Create a choreography entry for every beat:

```json
{
  "id": "rectification",
  "startFrame": 360,
  "endFrame": 540,
  "statement": "The bridge flips the negative half-cycle.",
  "actors": ["waveform", "diodes", "current-path"],
  "setup": "AC enters the bridge",
  "action": "alternate diode pairs conduct",
  "result": "both half-cycles appear positive",
  "handoff": "pulsating DC enters the capacitor"
}
```

## Persistent object registry

Assign stable identities to objects that continue across scenes. Keep them mounted whenever
possible and animate state, position, scale, path, or camera framing. This creates continuity and
prevents the presentation from feeling like unrelated slides.

Useful registry fields:

- semantic name;
- component;
- world position;
- visual state by beat;
- entry and exit ownership;
- transition handoff;
- audio cue;
- accessibility label.

## Representation selection

- Use UI simulation for software actions and product state.
- Use diagrams for relationships, architecture, and cause-and-effect systems.
- Use waveforms and charts for continuous values and comparisons.
- Use equations when symbol manipulation is the meaning.
- Use spatial models or 3D only when depth materially clarifies the explanation.

## Composition

- Establish one dominant focal object per beat.
- Keep labels close to the object they explain.
- Reserve saturated colors for semantic states, not decoration.
- Use foreground and background depth to reinforce hierarchy.
- Keep safe margins proportional to the output aspect ratio.
- Design maximum-information frames first; entrances should reveal an already sound composition.

## Motion

Use motion to communicate:

- causality;
- direction;
- hierarchy;
- comparison;
- continuity;
- state change.

Assign different easing families to different masses. Light UI elements may use a crisp spring;
large panels require slower acceleration and settling. Do not start three unrelated animations on
the same frame. Offset actions so the eye can follow cause and effect.

## Scientific and technical explainers

- Distinguish measured values, peak values, averages, and illustrative normalization.
- Label conceptual particles or energy markers so viewers do not mistake them for literal scale or
  velocity.
- Preserve conservation relationships and topology.
- Show intermediate conversion stages rather than jumping from input to output.
- Put safety caveats in the visual when the subject involves hazardous voltage, heat, pressure,
  chemicals, or machinery.

