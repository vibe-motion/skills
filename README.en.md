[中文](./README.md) | [English](./README.en.md)

## Installation

```bash
npx skills add vibe-motion/skills
```

## Available Skills

### claude-typer

Render a Claude Code CLI prompt typing animation video from plain text prompts.

**Effect:**
- Converts prompt text into a Claude Code CLI typing animation demo.

![claude-typer effect](https://img.laosunwendao.com/skill-uploads/3dbc047456374640bd00a078e22a5008.gif)

**Use when:**
- Creating skill demos from prompt content.
- Producing prompt-typing visuals that depict text being entered in Claude Code.

**Core capabilities:**
- Calls Remotion CLI to render a remote composition.
- Outputs transparent-background ProRes 4444 MOV format videos by default.
- Smartly extracts the core prompt content as the output file name.
- Supports customizing render parameters like video dimensions, Claude window size, and passing through unknown CLI arguments.

### procedural-fish

Render a parameterized procedural fish swimming animation, with transparent-background video output by default and optional GIF conversion for sharing.

**Effect:**
- Generates a loop-friendly procedural fish animation for skill demos and social previews.

![procedural-fish effect](https://img.laosunwendao.com/skill-uploads/96d88ab6cb9a4e1ca76abd73db08d888.gif)

**Use when:**
- You need a quick 480x480 procedural fish motion asset.
- You want transparent ProRes 4444 output for AE/PR compositing.
- You need a loopable GIF for README or product pages.

**Core capabilities:**
- Renders procedural fish animation frame-by-frame with Remotion.
- Supports tuning speed, fish scale, orbit radius, and motion step precision.
- Keeps animation frame-deterministic for parallel/out-of-order Remotion rendering.


### procedural-fish-render

Automatically clone or update `https://github.com/vibe-motion/procedural-fish`, then render a procedural-fish video using the project's own `pnpm run remotion:render` command.

**Use when:**
- Users ask to "render procedural fish" or export a procedural-fish video.
- You need a consistent clone/pull + render workflow across environments.

**Core capabilities:**
- Clones repo if missing; otherwise runs `fetch + pull --ff-only`.
- Uses the project's native render command instead of a custom replacement pipeline.
- Supports output path, props file, composition id, and fps overrides.

### svg-assembly-animator

Create high-impact, high-speed SVG part-assembly animations and export 30fps transparent PNG frame sequences for video compositing workflows.

**Effect:**
- Delivers a strong "power + speed" assembly look from static vectors.

<table>
  <tr>
    <td align="center"><strong>SVG</strong></td>
    <td align="center"><strong>GIF</strong></td>
  </tr>
  <tr>
    <td><img src="https://img.laosunwendao.com/ship.svg" alt="ship svg" width="256" /></td>
    <td><img src="https://img.laosunwendao.com/ship_30fps_whitebg.gif" alt="ship gif 30fps white background" width="256" height="256" /></td>
  </tr>
</table>

**Use when:**
- Turning a static SVG into a dynamic assembly animation.
- Producing transparent frame sequences for AE/PR compositing.
- Needing a quick HTML preview plus one-click export workflow.

**Core capabilities:**
- Builds animation output from `assets/animation_template.html`.
- Uses GSAP for staggered, overshoot-based assembly motion.
- Exports transparent PNG sequences (ZIP) via JSZip + Canvas.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=vibe-motion/skills&type=Date)](https://www.star-history.com/#vibe-motion/skills&Date)
