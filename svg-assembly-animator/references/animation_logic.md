# SVG Assembly Animation Framework

This reference documents the "Viscous & Dynamic" assembly animation logic derived from professional motion graphics workflows (Viscous Realm, Guillaume Kurkdjian styles).

## 1. Core Visual Principles

### Layering (Spatial Sequence)
- **Base -> Skeleton -> Large Surfaces -> Detail Parts**.
- Never fly everything in at once.
- Use a **3-5 frame offset (Stagger)** between layers to create a "visual wave" of growth.

### Pivot & Origin Point
- **Anchor Point is Destiny**: If the pivot is at the bottom, the object "grows" from the floor; if center, it "expands" from within.
- Always set `transform-origin: center center` or specific connection points for mechanical parts.

### Axis Independence (The Viscous Look)
- **Non-proportional Scaling**: Use "Squash and Stretch".
- Example: Scale an incoming part to 0.05 on X and 4.0 on Y during flight, then snap back to 1.0. This removes mechanical stiffness and adds "rubbery" or "sticky" life.

### The TPS Rule (Transformation Formula)
- **T (Translation)**: Fly in from outside the viewport.
- **P (Pivot)**: Ensure growth starts from the connection point.
- **S (Scale)**: Snap from 0 to 1 at the moment of impact.
- **Formula**: 90° Rotation + Axial Scaling + High-speed Translation = Modern Industrial Assembly.

## 2. Motion Easing & Physics

### Overshoot & Back-Out
- Objects should not just stop; they should "hit" and "vibrate".
- Use `Back.out` or `Elastic.out` curves.
- **Back.out(5)** provides a hard, high-power mechanical impact.
- **Back.out(1.7 - 2.5)** provides a smoother, more elegant "comfortable" snap.

### Reverse Logic
- **Build perfect, then break**: The most efficient way to animate complex assembly is to place everything at its final 100% position first, then record the "broken" state as the starting keyframe and animate back to 0.

## 3. High-Quality Export Requirements
- **Transparent Background**: Essential for layering over other video content.
- **Standard Framerate**: 30 FPS for smooth motion graphics.
- **Resolution**: Typically 1080x1080 (1:1) or 1920x1080 for high-fidelity needs.
