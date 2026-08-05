---
name: 3d-chladni-render
description: Clone or update https://github.com/nolangz/3D-Chladni and export deterministic 3D Chladni particle motion as MP4 or transparent ProRes MOV. Use when users ask for 3D 克拉尼, 克拉尼粒子动画, Chladni motion, sound-reactive sand or cosmic-web visuals, audio-to-motion, music visualizer video, or rendering Dynamic Sand, Modal Sand, Cosmic Web, or Dynamic Cosmic.
---

# 3D Chladni Render

## Workflow

1. Resolve the requested workspace, output path, duration, dimensions, and visual mode.
2. Use `cosmic` when the user does not choose a mode.
3. Pass an audio file with `--audio` when the user wants sound-reactive motion. Prefer `sand` or `dcosmic` for audio-driven output.
4. Resolve the installed skill directory and run `scripts/render_3d_chladni.py`.
5. Wait for the script to print `VALIDATION=PASS` and `OUTPUT_VIDEO=<absolute path>`.
6. Return the absolute output path and the render settings.

## Quick Start

```bash
python3 scripts/render_3d_chladni.py \
  --workspace "$(pwd)" \
  --output "$(pwd)/out/3d-chladni-cosmic.mp4"
```

## Installed Skill Resolution

Use the installed skill copy, not a source checkout of this skill collection:

```bash
skill_dir=""
for base in "${AGENTS_HOME:-$HOME/.agents}" "${CLAUDE_HOME:-$HOME/.claude}" "${CODEX_HOME:-$HOME/.codex}"; do
  if [ -d "$base/skills/3d-chladni-render" ]; then
    skill_dir="$base/skills/3d-chladni-render"
    break
  fi
done
[ -n "$skill_dir" ] || { echo "3d-chladni-render skill not found under ~/.agents, ~/.claude, or ~/.codex"; exit 1; }

python3 "$skill_dir/scripts/render_3d_chladni.py" \
  --workspace "$(pwd)" \
  --output "$(pwd)/out/3d-chladni-cosmic.mp4"
```

## Modes

| `--style` | Visual mode | Best use |
| --- | --- | --- |
| `sand` | Dynamic Sand | Audio-reactive inertial sand motion |
| `msand` | Modal Sand | Stable sculptural Chladni nodes |
| `cosmic` | Cosmic Web | Calm rotating three-dimensional particle web |
| `dcosmic` | Dynamic Cosmic | Audio-reactive cosmic deformation |

## Audio-Driven Render

Use an absolute path for the user's audio file:

```bash
python3 "$skill_dir/scripts/render_3d_chladni.py" \
  --workspace "$(pwd)" \
  --style dcosmic \
  --audio "/absolute/path/to/music.wav" \
  --seconds 12 \
  --output "$(pwd)/out/audio-chladni.mp4"
```

The source exporter analyzes the supplied audio frame by frame and muxes it into the video. Do not describe browser microphone or desktop system-audio capture as part of this offline export path.

## Transparent Output

Use ProRes 4444 MOV for transparency:

```bash
python3 "$skill_dir/scripts/render_3d_chladni.py" \
  --workspace "$(pwd)" \
  --alpha \
  --output "$(pwd)/out/3d-chladni-alpha.mov"
```

## Behavior

- Accept either a parent workspace or an existing 3D Chladni checkout through `--workspace`.
- Clone `https://github.com/nolangz/3D-Chladni.git` into `<workspace>/3D-Chladni` when absent.
- Fetch and fast-forward the selected branch when the checkout is clean.
- Refuse to update a dirty checkout; use `--skip-update` to preserve intentional local edits.
- Install project dependencies with `npm ci` only when Electron is missing, unless `--skip-install` is set.
- Invoke the repository's pixel-exact Electron exporter instead of screen-recording the live page.
- Default to 1280×720, 30 fps, 6 seconds, 15% particles, sweep lighting, and precession.
- Use deterministic seeds so reruns with the same settings reproduce the same particle motion.
- Accept `.mp4` for H.264 and `.mov` for ProRes; require `.mov` when `--alpha` is used.
- Validate the finished container with `ffprobe`, including dimensions, duration, and audio-stream presence when `--audio` is supplied.
- Pass `--pattern /absolute/path/pattern.json` to render a saved Chladni pattern.

## Requirements

- `git`
- Python 3.9+
- Node.js and `npm`
- `ffmpeg` and `ffprobe`
- Network access for the initial clone and dependency installation

## Preview Asset License

`assets/3d-chladni-cosmic.gif` is adapted from the source project's demo media. Attribution: **3D Chladni media by Lykno, licensed under CC BY-NC 4.0.**
