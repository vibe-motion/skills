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
- Uses a Remotion-based rendering workflow against a remote composition.
- Runs deterministic frame interpolation suitable for parallel/out-of-order rendering.

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
