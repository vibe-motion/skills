# Perspective illusion: extras

Optional layers on top of the base style in SKILL.md. `templates/scramble_night.html` has all of them working.

## Matching a reference video

- Pull frames at every shot and solve each shot from them:
  - The vanishing point and horizon give `H`.
  - Two things of known width give `x` and `W`.
  - The near and far edges of something of known length give `y`, distance and `fov`.
- Take the palette from the frames with k-means.
- After every change, compare side by side at the same timestamps.

## Night variant

- **Light.** Blue moonlight, low blue ambient, and coloured point lights near bright screens and signs. Lit windows use an emissive map that keeps only the lit panes of the facade texture.
- **Wet ground.** Use screen-space reflection along the mirrored view ray (about 48 growing steps).
  - Sample softly, and fade at screen edges and with ray length.
  - Put puddles in world-anchored noise, and add fresnel.
  - Rain ripple rings go on a world grid, a whole number per loop.
- **Glow.** Bloom only pixels brighter than about 0.8. Lower thresholds make white road paint glow like neon.
- **Haze.** Anchor it to distance from the scene centre, never from the camera. Camera-distance haze washes out every telephoto shot.
- **Grade.** Saturation about 1.18, a gentle S-curve and a vignette.
- **Rain.** About 2,600 instanced streaks, 0.02 m wide at 0.26 opacity. They fall a whole number of volume heights per loop and are hidden from the line passes (`NOINK`).
- **Light cones** under street lamps: additive open cones, also `NOINK`.

## People and crowds

- **A crowd is a cast, not random variation.** Each archetype has its own build, stride, clothes and props, for example office workers, students, fashion kids, elderly people, tourists and kids. Groups walk together: couples, a parent and child, friends in threes. In rain, about 40% carry umbrellas.
- **Shape-built people read as figurines** however carefully they're tapered. Use rigged CC0 models (Quaternius Universal Base Characters and Animation Library) for real humans.
- **If built from shapes,** use:
  - tapered lathe limbs that bend at the knee and elbow
  - an egg-shaped head
  - hair made of locks
  - a slight walking lean
  - no painted faces, which look uncanny at these sizes
- **Walking.** Each walker moves along its facing direction with swinging limbs and a small bob. All of them wrap at the same instant, during the fastest whip-pan, so nobody pops in view. Use a whole number of step cycles per loop.
- **Performance.** Merge each person's rigid parts by material, and keep only limb groups separate. Keep walkers out of the static merge.

## Signs, screens and ads

- **Draw all text in code** on canvas textures, with real fonts. Image models misspell.
- **For ad art, generate cut-outs** (image-gen `--cutout`) and compose the ads in code: background graphics, layout and type. This gives far more control than generating finished ads.
- **Give each campaign a concept.** For a maximalist look, add a layer of a giant character imprint, sound-effect lettering, stamps, tape and sparkles. Keep sound effects beside the action, off the headline.
- **Gemini returns JPEGs,** which the cut-out keying skips. Key the green out with numpy: soft ramp, 1 px choke, despill.
- **Screens slide between two ads** a whole number of times per loop. LED tickers crawl a whole number of texture widths.
- **Use made-up brands and original characters only.** Leave real place names off the art if they aren't wanted.
- `templates/cutouts/` has 12 sample cut-outs to start from.

## Speed details

- **Merge at load.** Merge static meshes by material at load with `mergeGeometries`, after stripping attributes to position, normal and uv. Keep these out of the merge: swap objects, `GLOW`, `NOINK`, walkers, and anything with `userData.noMerge`.
- **`renderMany`** renders each sub-frame into a target, adds it to an accumulation target with additive blending at weight 1/n, and draws the result once. One screenshot per frame leaves the browser.
- **Preview settings** are `?scale=.5`, 30 fps, 1 jitter sample and JPEG frames. One 10 s preview takes about 1.5 min, against about 30 min for the final.
