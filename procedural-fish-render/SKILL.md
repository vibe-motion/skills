---
name: procedural-fish-render
description: Clone or update https://github.com/vibe-motion/procedural-fish and render procedural-fish animation to a video using the project's own render command. Use when the user asks to render 程序鱼/procedural fish, export a 程序鱼视频, or run procedural-fish Remotion rendering.
---

# Procedural Fish Render

## Workflow

1. Resolve `skill_dir` and run the helper script:
   ```bash
   skill_dir=""
   for base in "${AGENTS_HOME:-$HOME/.agents}" "${CLAUDE_HOME:-$HOME/.claude}" "${CODEX_HOME:-$HOME/.codex}"; do
     if [ -d "$base/skills/procedural-fish-render" ]; then
       skill_dir="$base/skills/procedural-fish-render"
       break
     fi
   done
   [ -n "$skill_dir" ] || { echo "procedural-fish-render skill not found under ~/.agents, ~/.claude, or ~/.codex"; exit 1; }

   /usr/local/bin/python3 "$skill_dir/scripts/render_procedural_fish.py"
   ```
2. Optional parameters:
   ```bash
   /usr/local/bin/python3 "$skill_dir/scripts/render_procedural_fish.py" \
     --workspace "$(pwd)" \
     --output "out/procedural-fish-custom.mov" \
     --props-file "shared/project/render-presets/default.json"
   ```
3. Return the final absolute video path printed by the script.

## Behavior

- Repository source is fixed to `https://github.com/vibe-motion/procedural-fish` by default.
- If local repo exists, the script performs `git fetch` + `git checkout main` + `git pull --ff-only`.
- If local repo does not exist, the script clones it.
- Rendering always uses project command `pnpm run remotion:render`.
- Default output is `out/procedural-fish-transparent.mov`.
- Default props file is `shared/project/render-presets/default.json`.
