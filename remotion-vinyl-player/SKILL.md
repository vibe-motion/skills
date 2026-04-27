---
name: remotion-vinyl-player
description: Creates an elegant, realistic Vinyl Record Player animation component for Remotion. Use when needing a music player UI, album showcase, or audio-visualizer interface in a video. (Keywords: 黑胶唱片, 音乐播放器, 唱片机, 专辑展示, 音频可视化)
---

# Remotion Vinyl Player

This skill provides a reusable architectural pattern and component for creating a highly aesthetic "Vinyl Record Player" interface in Remotion videos.

## How it works

The Vinyl Player relies on standard Remotion hooks (`useCurrentFrame`, `useVideoConfig`) to drive an infinite rotation, marquee scrolling text, and a synced progress bar.

1. **Infinite Rotation:** Using `frame / (fps * secondsPerRev) * 360`, the vinyl disc spins continuously, simulating realistic record playback.
2. **Seamless Marquee:** To handle long song titles, the text is duplicated (`<h2>Title</h2><h2>Title</h2>`) inside a flex container. `transform: translateX(-%)` maps from 0 to -50% to create a perfect, invisible looping marquee.
3. **Progress Bar:** Maps the current frame to the total duration of the composition or specified track length to animate a progress fill and knob.
4. **Realistic Textures:** CSS tricks like `radial-gradient` are applied to the record disc to create the illusion of vinyl grooves, while `box-shadow` generates edge lighting and depth.

## How to use this skill

1. **Copy the asset:** Copy the generic component located at `assets/VinylPlayer.tsx` into the user's `src/components/animations/` folder.
2. **Configure:** Guide the user to import and use the `<VinylPlayer />` component within their Remotion `<Composition />`.
3. **Adapt Data:** Pass standard props (`coverUrl`, `songTitle`, `artistName`) to customize the music player's display.

## Provided Assets

- `assets/VinylPlayer.tsx`: The highly reusable, strongly-typed Remotion component implementing the Vinyl Player layout and animations.
