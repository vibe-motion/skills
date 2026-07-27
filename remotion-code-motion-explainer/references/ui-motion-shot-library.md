# UI Motion Shot Library

This public catalog contains brand-neutral systems extracted from original UI and After Effects
studies. Implement them as parameterized Remotion components; do not depend on private paths or
source projects.

## Catalog

### Neon path focus

- Purpose: route attention through a dark interface or AI workflow.
- Actors: path, glow field, focus node, labels, background grid.
- Parameters: path points, progress, glow radius, focus color, labels, camera scale.
- Motion: trace path, energize destination, settle glow, hand off destination as next scene anchor.
- Reject: decorative neon with no semantic destination.

### Responsive UI stage

- Purpose: show the same product state across landscape and portrait layouts.
- Actors: navigation, workspace, inspector, floating actions, safe-area mask.
- Parameters: aspect ratio, breakpoint, panel widths, content density, active tool.
- Motion: reflow independent regions instead of cropping one layout.
- Reject: scaling a 16:9 screenshot to impersonate a mobile layout.

### Command-to-result workflow

- Purpose: show a prompt or command producing coordinated product actions.
- Actors: command input, task nodes, connectors, status indicators, result panel.
- Parameters: command, node count, labels, task states, connection topology.
- Motion: type, submit, dispatch, execute, converge, reveal result.
- Reject: results appearing without an observable system response.

### Audio waveform transformation

- Purpose: explain recording, filtering, synthesis, transcription, or signal conversion.
- Actors: waveform, playhead, frequency bands, state labels, output trace.
- Parameters: samples, amplitude, frequency, smoothing, color, duration.
- Motion: trace input, transform the signal, compare output, hold the measured result.
- Reject: random waveforms that do not correspond to the stated transformation.

### Data pipeline

- Purpose: explain ingestion, processing, branching, aggregation, and output.
- Actors: packets, nodes, queues, filters, counters, output cards.
- Parameters: topology, throughput, failure state, branch rules, labels.
- Motion: inject, route, react, aggregate, confirm.
- Reject: particles moving without nodes visibly responding.

### Layered design-tool transformation

- Purpose: demonstrate editing, compositing, layout, or design-system changes.
- Actors: canvas, layers, selection box, handles, inspector values, result comparison.
- Parameters: layer tree, selected layer, bounds, property values, before/after states.
- Motion: select, manipulate, update inspector, reveal resulting composition.
- Reject: cursor theater without editable-state evidence.

## Selection record

For each candidate, record whether it was reused, adapted, or rejected and why. Preserve object
identity and responsive evidence. Validate a system in two projects before calling it a reusable
shot template.

