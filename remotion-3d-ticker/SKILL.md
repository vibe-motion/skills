---
name: remotion-3d-ticker
description: Creates infinite 3D vertical scrolling ticker animations in Remotion. Use when you need to build a parallax gallery, infinite image scroll, multi-column continuous vertical scrolling effect, or a 3D photo wall (3D照片滚动墙 / 3D相册瀑布流).
---

# Remotion 3D Vertical Ticker

This skill provides a reusable architectural pattern and component for creating infinite, multi-column 3D scrolling animations (often used for photo galleries, 3D照片滚动墙, tech-stack showcases, or credit rolls) in Remotion.

## How it works

The infinite scrolling illusion is achieved using **domain duplication and modular arithmetic**, combined with CSS 3D transforms:

1. **The Math of Infinity:** We duplicate the content list (`[...items, ...items]`). We calculate a \`progress\` from 0 to 1 based on the frame rate and desired loop duration. We translate the column from \`0%\` to \`-50%\` (or \`-50%\` to \`0%\` for reverse). Because the content is duplicated, the frame at \`-50%\` looks identical to the frame at \`0%\`, creating a seamless loop when it resets.
2. **3D Perspective:** A parent wrapper applies \`perspective: 1000px\`, \`rotateX(20deg)\`, and \`scale(1.2)\`. The scale is crucial to ensure the tilted top and bottom edges stretch beyond the 2D screen bounds, preventing empty background bleeding.
3. **Masking:** CSS \`linear-gradient\` overlays are placed absolutely at the top and bottom with a high \`zIndex\` to smoothly fade the content into the background color.

## How to use this skill

When a user requests a vertical scrolling gallery or infinite ticker:

1. **Copy the asset:** Provide or copy the generic component located at `assets/VerticalTicker.tsx` into their project's components/animations folder.
2. **Configure:** Guide the user to import and render the `<VerticalTicker />` component within their Remotion `<Composition />`.
3. **Adapt Data:** The component is data-agnostic. It accepts any array of image URLs or React nodes as columns. You can specify different \`durationInSeconds\` and \`direction\` (1 or -1) per column to achieve parallax.

## Provided Assets

- `assets/VerticalTicker.tsx`: The highly reusable, strongly-typed Remotion component implementing the 3D infinite scroll pattern.
