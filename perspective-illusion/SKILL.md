---
name: perspective-illusion
description: Make a looping illustrated 3D video in the Japanese perspective-illusion style (e.g. @garments__) of any place, such as a street, crossing, station, shop aisle, room, park or rooftop. A clean line-art scene squashed flat by a telephoto lens opens into deep perspective with dolly zooms, swings round to corner views that first read flat and then turn 3D, and objects quietly swap depth while the view is flat. Use when asked for a perspective or optical-illusion video, a "dolly zoom" or "flat to 3D" loop, an isometric-looking illustrated scene that turns out to be 3D, or to recreate one of these clips.
---

# Perspective illusion

## The style, in one paragraph

A level camera on a very long lens (about 2° from 400 m away) flattens a deep scene into what looks like a flat drawing. Then it dolly-zooms: the lens widens while the camera moves in, so the subject stays the same size but the space behind it stretches open. The camera also swings round to corner views. Each one starts flat and opens into 3D. While the view is flat, objects slide in depth where nobody can see it, so when the depth comes back, a row has become a diagonal. Everything is drawn as clean ink line art with flat two-tone shading, hatched cast shadows and a painted sky, and the whole thing loops seamlessly.

## Quick start

```
mkdir -p ~/Movies/edits/<date>-<name>/stills && cd $_
printf '{"type":"module"}' > package.json && npm i three@0.170.0 playwright@1.60.0
cp -r ~/simcraft/skills/video/perspective-illusion/templates/* .
cp scramble_night.html scene.html                                # or the closest template (see below), then edit
node render.mjs scene.html x --stills=0.3,1.5,3,6,8.5           # stills of each shot, in stills/
node render_fast.mjs scene.html preview.mp4 --preview            # whole loop, half size, about 1.5 min
node render_fast.mjs scene.html final.mp4                        # full quality, about 30 min for 10 s
python3 ~/simcraft/skills/video/vox-explainer/scripts/motion_check.py final.mp4
python3 ~/simcraft/skills/video/perspective-illusion/scripts/blink_map.py ffmpeg final.mp4 blink.png
```

Fix things on stills and previews. Render full quality only once the preview is approved. Set `$FFMPEG` if ffmpeg isn't on the PATH.

## Templates

Start from the template closest to the new scene. Keep its camera rig, timeline, post pass and render hooks, and replace only the scene section (everything between `// ---------- kit` and `// ---------- cameras`).

| Template | Scene | Renderer |
|---|---|---|
| `street.html`, `street_plus.html` | Day street with poles, cones, a crossing and a red sky. `street_plus` adds detail and corner views. | `render_smooth.mjs` |
| `market.html`, `market_real.html` | A supermarket aisle, drawn and realistic. | `render_smooth.mjs` (`market.html`: `render.mjs`) |
| `scramble_night.html` | A big crossing at night in the rain, with a walking crowd, wet reflections and ad screens. It has every speed-up. | `render_fast.mjs` |

For a new scene, `scramble_night.html` is the best base for the engine, because it is the only one with the fast renderer hooks. Strip its night extras (see [reference.md](reference.md)) for a day look.

## Step 1: Build a scene that can fool the eye

Any place works if it has these:

- **One long axis.** Lay the scene out along -z (a street, an aisle, a platform, a corridor), with the camera looking down it. Depth along this axis is what the telephoto hides.
- **Repeated things at different depths.** Poles, lamps, shelves, columns, signs, trees, people. On a long lens they stack into one plane. Lined-up poles merge into one, and sign stacks on far facades pile into one wall.
- **Swap objects.** 3 to 6 similar objects (cones, people, bins, chairs, boxes) whose arrangement changes between a row and a diagonal. They can also be drawn larger in the flat view (`cs`), so the scale reads right when flattened.
- **Real-world scale in metres.** The lenses and focus planes only make sense at true scale: a 0.75 m cone, 1.7 m people, a 3.2 m storey.
- **Detail where the corner views look.** Every corner view reveals building sides, the backs of objects and the ground. Fill them: side windows, drains, cables, kerbs, the contact shadow under a car. Flat views hide sloppiness and corner views expose it.
- **Make every detail part of one surface** (textures, stacked sleeves), or keep separate surfaces at least 0.4 m apart. From 400 m away, surfaces a few centimetres apart flicker.

## Step 2: Choreograph the camera

The camera is never tilted. It stays level so verticals stay vertical, like an architect's drawing. Each shot is a plain object:

`{ x, y, zf, W, fov, H, el, yaw, lay, cs }`

| Key | Meaning |
|---|---|
| `x`, `y` | Camera side position and height (m) |
| `zf`, `W` | The focus plane, and the width framed there (m). Keeping `W` while changing `fov` is the dolly zoom. |
| `fov` | Horizontal lens angle. About 2° is flat, 25 to 90° is deep. |
| `H` | Lens shift: where the horizon sits (-1 bottom, 0 middle, 1 top). |
| `el` | Look down by raising the camera and shifting the lens, never by tilting. |
| `yaw` | Swing round the focus point for corner views. |
| `lay`, `cs` | Swap-object layout (0 row, 1 diagonal) and their flat-view scale. |

Shot vocabulary that works:

| Shot | Settings |
|---|---|
| Flat | `fov` about 2, `H` 0. The whole scene reads as one elevation. |
| Worm's eye | Knee height, `fov` 90, horizon pushed low (`H` about -0.7). |
| High | Camera up high on a medium lens, horizon above the frame. |
| Corner view | `yaw` ±18 to 35°, `el` 9 to 50°. It comes as a pair: a telephoto version (`fov` 4) first, then the same view wide (`fov` 25 to 45). |
| Diagonal and low | Medium lenses that show the swap objects in depth. |

**Loop structure.** Flat, then a deep view, then a corner view (flat then 3D), back to flat (swap the objects here), a high diagonal, the other corner view, a low shot, then flat again. The loop ends on the shot it starts on.

**Timing.** All parameters run through one monotone cubic (Fritsch-Carlson) curve over the key times, so speed never jumps. Interpolate `W` and `fov` in log space. Add tiny "drift" shots (`W` × 0.96) so holds breathe instead of freezing. 10 s feels smooth, while 7 s feels rushed. To change the length, scale the key times rather than rewriting them.

**Cheat while flat.** Only change `lay` during flat holds. If the camera is moving in depth while objects move, the trick shows.

The first corner view should go to the side that the hero object (a car, a sign) does not cover. That way the reveal shows something new.

## Step 3: The look

The page renders four passes: colour, normals with depth, flat colour (no lighting), and a sun-only shadow mask. A final shader combines them.

- **Ink lines** where depth (second difference), normals or flat colour change. Make lines heavier up close. Ground markings get thin grey lines. Fade colour lines where one pixel covers many metres, or far textures turn to noise.
- **Two-tone shading.** Light versus shade, with no gradients. Set the mask light to `2*PI`, because three.js divides Lambert by pi, and without it everything turns to shade.
- **Hatch only cast shadows,** with hatching anchored in world space (never screen space) and faded by `fwidth`.
- **Paint the sky by view direction,** not screen position, so clouds stay put as the camera moves. Keep cloud edges soft.
- **Palette.** 6 to 10 flat colours plus one accent (a red sky, a yellow sign). To match a reference, take the colours from its frames with k-means.
- **Light.** One low, hard sun placed so the main subjects stay lit and throw long shadows across the ground. A sun from the tall side buries the scene in one big shadow.

For a night variant (moonlight, lit windows, wet reflections, glow, rain, grade), a crowd of walkers, or ad screens and signs, see [reference.md](reference.md).

To get a day look from `scramble_night.html`:
- Swap the moon for a warm sun, and raise the ambient light.
- Delete the point-light loop.
- Remove the wet-ground block, the haze line and the night grade from the post shader.
- Drop the rain, and set `emissiveIntensity` on windows to 0.
- Paint a day `skyAt`.

## Step 4: Detail passes (what makes it great)

First versions always look empty. Great versions come from deliberate passes, each checked on stills before the next one starts.

1. **Forms.** Main masses at true scale, the long axis, the swap objects, and the camera timeline. Check that the flat shot really reads flat, and that every move reveals something.
2. **Structure.** Everything a real place has, built from real-world logic. For a street, that means kerbs, drains, manholes, poles with their arms and boxes, signs on both faces, fences, bins, vending machines, bike racks, overhead wires, and window frames with sills and AC units. Look at photos of the real kind of place, and list what is there before building.
3. **Wear and story.** Small things that make it lived-in: stickers, tape, posters with code-drawn text, puddle stains, a bicycle left leaning, laundry, a cat, a coffee cup. Aim for 3 or more per surface the camera lingers on.
4. **Corner-view audit.** For each corner view, render the wide still and fill whatever looks bare there. Usually that is building sides, the backs of signs, rooftops (tanks, railings, antennas) and the ground between objects.
5. **Light and shadow.** Make sure every object casts a readable shadow, add contact shadows under parked things, and get the shadow side of every main form into the two-tone step. Shadows that only appear in one view are a reward for the camera move.
6. **Life (optional).** Walkers, a train or cars moving at constant speed, screens, birds, flags. Everything loops a whole number of times.
7. **Polish.** Palette harmony, line weight, sky, vignette and grade. Then the blinking check on the final.

Density rule: from the flat telephoto shot, the frame should feel full edge to edge, like a dense illustration, with no large empty wall or ground area unless it is a deliberate rest for the eye.

## The quality bar

Before any full render, check stills at every key time (and halfway between moves) against this list. Fix anything that fails, then check again.

- [ ] The flat shot reads as a flat drawing. Nothing gives away the depth.
- [ ] Every move ends on a reveal: a hidden diagonal, a side street, objects that were far apart.
- [ ] Corner views start flat and open up, and the first one turns away from the hero object.
- [ ] Lines are crisp and even, with no double lines, no ink on glowing faces, and no noise on far textures.
- [ ] Two-tone shading is clear on every main form, and hatching appears only in cast shadows.
- [ ] Nothing reads as a bare primitive. Every box has trim, seams, a base or a label.
- [ ] Text is legible and spelled right, in real fonts, with made-up brands.
- [ ] The sky matches the light direction and colour of the scene.
- [ ] The palette is limited and harmonious, with one clear accent.
- [ ] The loop seam is invisible (frame 0 equals the last frame) and nothing pops.
- [ ] The preview has no stutter. On the final, the `blink_map` count is low, and what blinks is intended motion (rain, screens).

When reviewing stills, look at them like an illustrator: name the three weakest areas of each frame, fix those, and repeat. Don't stop at "it works".

## Step 5: Render and check

- **`render_fast.mjs`** renders each frame on the GPU as an average of jittered sub-renders: 4 for anti-aliasing, and up to 32 on fast moves for gapless motion blur, sized by how far `window.probe` points move on screen. Use `--preview` for half size at 30 fps. `--from`, `--to` and `--fps` are also available.
- **`render_smooth.mjs`** gives the same quality for pages without `renderMany`, but averages in ffmpeg, so it is several times slower.
- **Merge static meshes by material at load** (`BufferGeometryUtils.mergeGeometries`). One scene went from 7,654 draw calls to 530, about 7x faster. Keep anything that moves out of the merge.
- **Check the final** with `motion_check.py` (nothing freezes) and `blink_map.py`, which counts pixels that flicker in nearly still frames. Compare the count before and after a change. Previews shimmer by design, so judge blinking on the final only.

### The page contract

Any scene page works with the renderers if it provides:

| Hook | What it does |
|---|---|
| `#frame` | The canvas that gets screenshotted. |
| `window.READY` | Set once assets and fonts are loaded. |
| `window.render(ms)` | Draws the frame at time `ms`. |
| `window.probe(ms)` | Returns screen positions of a few world points, used to size the motion blur. |
| `window.setJitter(x, y)` | Sub-pixel lens offset in pixels, set through `projectionMatrix.elements[8]` and `[9]`. |
| `window.renderMany([[ms, jx, jy], ...])` | Averages several renders in one call (needed for `render_fast`). |
| `?scale=.5` | Renders at half size. |

Everything animated must be a pure function of `ms`, periodic in the loop length. Use whole numbers of cycles per loop for steps, crawls and rain.

## Blinking and glitches

| Cause | Fix |
|---|---|
| Anything in screen space (wobble, hatching, noise, haze by camera distance) | Anchor it to the world or to view direction. |
| Surfaces a few cm apart | Merge them into one surface, or keep them 0.4 m or more apart. |
| Overlapping coplanar planes (road markings, floor pieces) | Paint markings onto one plane, and make pieces meet edge to edge. |
| Sub-pixel detail (rails, grids, cables, rain) | Jitter anti-aliasing on every frame, and fade dense lines by metres per pixel. |
| One render per frame | Never do this in finals. |
| Hard edges on clouds or reflections | Soften them, and fade effects at screen borders. |
| Moving things that wrap or pop | Wrap them during the fastest camera move of the loop, found with `window.probe`. |

## Pitfalls

- A `//` comment added to one-line code swallows the rest of the line (a `scene.add`, a light). Use `/* */`.
- Helpers that add to the scene root (like `plane()`) ignore the current group, and can land on top of things. Build inside groups.
- Keep emissive faces (screens, sign panels) out of the flat-colour and shadow passes, or every glyph gets inked and darkened.
- `ffmpeg -stream_loop ... -c copy` makes loops that some players stop early. Re-encode instead.
- For X, side-by-sides at 32:9 are too wide to upload. Stack them vertically.
- Use original characters and made-up brands only. Copy the technique of a reference, never its artwork.
