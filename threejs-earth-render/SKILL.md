---
name: threejs-earth-render
description: Clone or update https://github.com/vibe-motion/threejs-earth and render the Three.js Earth route animation with Puppeteer frame capture. Use when users ask for 三维地球航线动画, Three.js Earth, 地球飞线, globe route animation, or exporting an Earth GIF/MP4/PNG sequence.
---

# Three.js Earth Render

## Workflow

1. Use `scripts/render_threejs_earth.py` from this skill.
2. Pass `--workspace` when the user specifies where the source checkout should live; otherwise use the current directory.
3. Pass `--output` when the user specifies a GIF/MP4 path; otherwise use `out/threejs-earth.gif`.
4. For customized routes, edit `threejs-earth/src/routeConfig.js` first and render with `--skip-update` so local edits are preserved.
5. Run the script and wait for completion.
6. Return the final absolute output path printed by the script.

## Command

```bash
/usr/local/bin/python3 scripts/render_threejs_earth.py \
  --workspace "$(pwd)" \
  --output "$(pwd)/out/threejs-earth.gif"
```

## Installed Skill Resolution

Use the installed skill copy, not the source repo checkout:

```bash
skill_dir=""
for base in "${AGENTS_HOME:-$HOME/.agents}" "${CLAUDE_HOME:-$HOME/.claude}" "${CODEX_HOME:-$HOME/.codex}"; do
  if [ -d "$base/skills/threejs-earth-render" ]; then
    skill_dir="$base/skills/threejs-earth-render"
    break
  fi
done
[ -n "$skill_dir" ] || { echo "threejs-earth-render skill not found under ~/.agents, ~/.claude, or ~/.codex"; exit 1; }

/usr/local/bin/python3 "$skill_dir/scripts/render_threejs_earth.py" \
  --workspace "$(pwd)" \
  --output "$(pwd)/out/threejs-earth.gif"
```

## Behavior

- Repository source is fixed to `https://github.com/vibe-motion/threejs-earth.git` by default.
- Reuse `workspace/threejs-earth` if it exists; otherwise clone it.
- If the repo already exists, fetch and fast-forward the target branch unless `--skip-update` is passed.
- Serve the Three.js app through a local HTTP server; do not open it with `file://`.
- Use Puppeteer, not Remotion, because this is a browser-based 3D scene.
- Seek each frame through `window.__SCENE_3D_EXPORT__.setFrame(frame)` so frames are independently reproducible.
- Capture a PNG frame sequence, then encode `.gif` or `.mp4` with `ffmpeg`.
- Default render is a 30 fps GIF at 448 px wide. Use `--output-width 0` to keep the native 2048 x 1152 capture.

## Project Notes

- Default route is Hangzhou to Paris in `src/routeConfig.js`.
- The app exports a 16:9 scene at 2048 x 1152 for `--render-scale 1` and 4096 x 2304 for `--render-scale 2`.
- The scene uses CDN imports for Three.js and local high-resolution Earth texture assets, so network access is required on first load.

## Requirements

- `git`
- `node`
- `npm`
- `ffmpeg`
- network access for clone/update, CDN imports, and Puppeteer installation
