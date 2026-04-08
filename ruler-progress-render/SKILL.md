---
name: ruler-progress-render
description: Clone or update https://github.com/sxhzju/ruler-progress-animator and render a ruler progress video with default parameters. Use when users ask for requests like "绘制个尺子进度条", "做个尺子进度动画", "渲染 ruler progress", or ask to export the default demo video from this project.
---

# Ruler Progress Render

## Workflow

1. Use `scripts/render_ruler_progress.sh` from this skill.
2. Pass `workspace_dir` as the first argument when the user specifies a folder; otherwise use current directory.
3. Pass `output_path` as the second argument when the user specifies output; otherwise use `out/scaffold-demo-defaults-transparent.mov`.
4. Run the script and wait for completion.
5. Return the final absolute output path printed by the script.

## Command

```bash
bash scripts/render_ruler_progress.sh [workspace_dir] [output_path]
```

## Behavior

- Reuse local repo if `workspace_dir/ruler-progress-animator` exists; otherwise clone from GitHub.
- Track remote default branch (`origin/HEAD`) when updating existing repo.
- Install npm dependencies.
- If `bunx` is available, run the new scaffold flow:
  - `npm run remotion:ensure-browser`
  - `REMOTION_OUTPUT=... REMOTION_PROPS_FILE=shared/project/render-presets/default.json npm run remotion:render`
- This flow reuses shared Chrome Headless Shell cache and avoids repeated browser downloads.
- If `bunx` is unavailable, fallback to `npx remotion render` with equivalent defaults as a compatibility path (without shared browser cache optimization).

## Requirements

- `git`
- `node`
- `npm`
- network access for clone/update and dependency install
