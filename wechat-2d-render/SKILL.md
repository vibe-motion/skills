---
name: wechat-2d-render
description: Clone or update https://github.com/sxhzju/wechat-2d and render the default WeChat-style 2D chat motion video with Remotion. Use when users ask for 微信聊天动画, wechat 2d chat render, 微信视频消息动效, or exporting the default demo from the wechat-2d project.
---

# WeChat 2D Render

## Workflow

1. Use `scripts/render_wechat_2d.sh` from this skill.
2. Pass `workspace_dir` as the first argument when the user specifies a folder; otherwise use the current directory.
3. Pass `output_path` as the second argument when the user specifies output; otherwise use `out/wechat-2d-transparent.mov`.
4. Pass a props JSON path as the third argument when the user provides custom Remotion props; otherwise use `shared/project/render-presets/default.json`.
5. Run the script and wait for completion.
6. Return the final absolute output path printed by the script.

## Command

```bash
bash scripts/render_wechat_2d.sh [workspace_dir] [output_path] [props_file]
```

## Installed Skill Resolution

Use the installed skill copy, not the source repo checkout:

```bash
skill_dir=""
for base in "${AGENTS_HOME:-$HOME/.agents}" "${CLAUDE_HOME:-$HOME/.claude}" "${CODEX_HOME:-$HOME/.codex}"; do
  if [ -d "$base/skills/wechat-2d-render" ]; then
    skill_dir="$base/skills/wechat-2d-render"
    break
  fi
done
[ -n "$skill_dir" ] || { echo "wechat-2d-render skill not found under ~/.agents, ~/.claude, or ~/.codex"; exit 1; }

bash "$skill_dir/scripts/render_wechat_2d.sh" "$(pwd)" "$(pwd)/out/wechat-2d-transparent.mov"
```

## Behavior

- Reuse local repo if `workspace_dir/wechat-2d` exists; otherwise clone from GitHub.
- Track remote default branch (`origin/HEAD`) when updating an existing repo.
- Install dependencies with `pnpm install`; if `pnpm` is missing, enable it through `corepack`.
- Run the project Remotion scripts:
  - `pnpm run remotion:ensure-browser`
  - `REMOTION_OUTPUT=... REMOTION_PROPS_FILE=... pnpm run remotion:render`
- Default render target is the active composition from `shared/project/projectConfig.js`, currently the `wechat-chat-motion` plugin via `ScaffoldDemo30fps`.
- Default output is ProRes 4444 with `yuva444p10le` pixel format and PNG image format, suitable for transparent-background workflows.

## Project Notes

- The project uses a scaffold/plugin split:
  - `preview/*` for local UI controls and browser preview.
  - `remotion/*` for Remotion entry wrappers.
  - `shared/scaffold/*` for common runtime.
  - `shared/project/*` for plugin and composition registry.
  - `shared/features/demoMotion/*` for the WeChat chat scene.
- Animation state must be deterministic per frame. Remotion renders frames in parallel and out of order, so do not rely on timers, mutable cursors, previous renders, or render order.
- Frame-specific data should be built from `{frame, fps, loop, sceneContext, pluginParams}` in `buildSceneProps`.
- Keep `videoWidth` and `videoHeight` as layout props; use a props JSON file for custom sizes.

## Requirements

- `git`
- `node`
- `corepack` or `pnpm`
- network access for clone/update and dependency install
