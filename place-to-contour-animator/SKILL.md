---
name: place-to-contour-animator
description: Generate `godot_line2d_v1` outer-contour JSON from a user-provided place name by calling the charts project exporter. Use when the user asks to export map outlines/contours into `line2d.json` for Godot Line2D, especially requests like “给一个地名生成 line2d.json”, “导出某国家外轮廓”, “按地区生成轮廓 JSON”, or “做可动画的外轮廓”.
---

# Place to Contour Animator

## Overview

Convert a place name into a `godot_line2d_v1` contour JSON by running the wrapper script in this skill, which calls `universal/export_outer_contour.ts` in the charts repository.

## Workflow

1. Confirm repository path and exporter exist.
Path defaults:
`/Users/zhangluyi/Downloads/charts`
`/Users/zhangluyi/Downloads/charts/universal/export_outer_contour.ts`

2. Resolve place name.
Use built-in aliases in `references/place_aliases.md`.
If no alias matches, pass the original place string as `--country-name`.

3. Run wrapper script with `/usr/local/bin/python3`.
Default command:
```bash
/usr/local/bin/python3 /Users/zhangluyi/.agents/skills/place-to-contour-animator/scripts/place_to_line2d.py "<place>"
```

4. Use overrides only when user asks.
Examples:
```bash
# Export all loops
/usr/local/bin/python3 /Users/zhangluyi/.agents/skills/place-to-contour-animator/scripts/place_to_line2d.py "Indonesia" --keep-all-loops

# Force country id
/usr/local/bin/python3 /Users/zhangluyi/.agents/skills/place-to-contour-animator/scripts/place_to_line2d.py "Japan" --country-id=392

# Custom output path
/usr/local/bin/python3 /Users/zhangluyi/.agents/skills/place-to-contour-animator/scripts/place_to_line2d.py "China" --output=/Users/zhangluyi/Downloads/charts/universal/china_outer_line2d.json
```

5. Validate generated file before finishing.
Check:
- JSON has `format = godot_line2d_v1`
- `regions[0].polylines` exists and non-empty
- output path matches the user request

## Behavior Notes

- For `日本/Japan/日本本岛/本州`, default mode applies `--component-centroid-lat-max=42.2` to exclude Hokkaido and output mainland contour.
- Wrapper script file:
`/Users/zhangluyi/.agents/skills/place-to-contour-animator/scripts/place_to_line2d.py`
- Exporter script file:
`/Users/zhangluyi/Downloads/charts/universal/export_outer_contour.ts`
