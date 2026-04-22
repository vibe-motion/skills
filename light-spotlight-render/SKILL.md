---
name: light-spotlight-render
description: Generate a swinging spotlight text-reveal HTML animation with configurable text, swing angle, lamp scale, glow, and colors. Use when users ask for 聚光灯扫字动画, spotlight text reveal, light logo reveal, 发光文字揭示动画, or want a reusable HTML animation instead of a static image.
---

# Light Spotlight Render

## Workflow

1. Collect the animation parameters:
   - `label_text`
   - `swing_angle_degrees`
   - `swing_cycle_seconds`
   - `lamp_scale`
   - `glow_opacity`
   - `mask_color`
   - `text_color`
   - `background_color`
   - `video_width`
   - `video_height`
   - optional `output`
2. Resolve the installed skill directory and run `scripts/render_light_spotlight.py`.
3. Return the final absolute HTML path printed by the script.

## Command

```bash
python3 scripts/render_light_spotlight.py \
  --label-text "vibe-motion" \
  --output "out/light-spotlight-vibe-motion.html"
```

## Installed Skill Resolution

Use the installed skill copy, not the source repo checkout:

```bash
skill_dir=""
for base in "${AGENTS_HOME:-$HOME/.agents}" "${CLAUDE_HOME:-$HOME/.claude}" "${CODEX_HOME:-$HOME/.codex}"; do
  if [ -d "$base/skills/light-spotlight-render" ]; then
    skill_dir="$base/skills/light-spotlight-render"
    break
  fi
done
[ -n "$skill_dir" ] || { echo "light-spotlight-render skill not found under ~/.agents, ~/.claude, or ~/.codex"; exit 1; }

python3 "$skill_dir/scripts/render_light_spotlight.py" \
  --label-text "vibe-motion" \
  --output "$(pwd)/out/light-spotlight-vibe-motion.html"
```

## Behavior

- Read `assets/light_spotlight_template.html`.
- Replace template placeholders with sanitized parameter values.
- Keep the SVG spotlight animation self-contained in one HTML file.
- Default output name is derived from `label_text`.
- Preserve the top-vertex lamp scale pivot so the spotlight grows from the lamp tip rather than the swing axis.
- Allow `background_color=transparent` for transparent-background workflows.

## Output

- Primary output: a standalone `.html` animation file.
- Tell the user to open the HTML file in a browser to preview the animation.
- If the user wants video output after generating the HTML, suggest rendering it with another tool or browser capture flow rather than rewriting the skill.
