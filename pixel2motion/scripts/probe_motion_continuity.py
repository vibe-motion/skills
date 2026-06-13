#!/usr/bin/env python3
"""Quantitative motion-QA probes for Pixel2Motion HTML deliverables.

Two modes, both built on the deterministic ?t=<ms> seek hook (requires
playwright: pip install playwright && playwright install chromium):

1. Computed-style probe — verifies that the easing you designed is the easing
   the browser actually runs. Catches the silent-linear failure where
   `animation-timing-function: var(--token)` inside @keyframes is dropped
   (Chromium resolves it to the animation's base timing function).

   probe_motion_continuity.py logo_motion.html \
       --times 500,700,917,980 \
       --probe "#draw-stroke-a:stroke-dashoffset,#pen-glint:offset-distance"

   Compare the printed values against your designed curve: if they equal the
   LINEAR window fraction at every timestamp, a keyframe easing was dropped.

2. Ink-delta continuity sweep — screenshots #logo-root at every step and
   reports dark-pixel ("ink") counts and per-step deltas. A flatline followed
   by a jump is the stall+pop signature (e.g. round-cap handoffs); a single
   near-zero sample at a known paint-under-ink transit is physical and should
   be bridged perceptually (tip glint), not left bare.

   probe_motion_continuity.py logo_motion.html --ink-sweep 850:1010:10
"""
from __future__ import annotations

import argparse
import io
import json
import pathlib
import sys


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Easing probe + ink continuity sweep.")
    p.add_argument("html", type=pathlib.Path, help="Animated HTML with ?t= QA hook.")
    p.add_argument("--times", default=None,
                   help="Comma-separated timestamps in ms for --probe mode.")
    p.add_argument("--probe", default=None,
                   help='Comma-separated "css-selector:css-property" pairs to read '
                        'computed values for at each timestamp.')
    p.add_argument("--ink-sweep", default=None, metavar="START:END:STEP",
                   help="Sweep ink-pixel counts, e.g. 850:1010:10.")
    p.add_argument("--threshold", type=float, default=120.0,
                   help="Ink luminance threshold for --ink-sweep (default 120).")
    p.add_argument("--root", default="#logo-root", help="Screenshot/query root element.")
    p.add_argument("--viewport", default="800x800", help="Viewport WxH (default 800x800).")
    p.add_argument("--scale", type=float, default=1.0, help="Device scale factor.")
    p.add_argument("--report", type=pathlib.Path, default=None, help="Optional JSON report path.")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    if not args.probe and not args.ink_sweep:
        print("Nothing to do: pass --probe (with --times) and/or --ink-sweep.", file=sys.stderr)
        return 2
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("playwright is required: pip install playwright && playwright install chromium",
              file=sys.stderr)
        return 2

    url = args.html.resolve().as_uri()
    w, _, h = args.viewport.partition("x")
    report: dict = {"html": str(args.html)}

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": int(w), "height": int(h)},
                                device_scale_factor=args.scale)

        def seek(t: float) -> None:
            page.goto(f"{url}?t={t}")
            page.wait_for_function("window.__p2mReady === true")

        if args.probe:
            if not args.times:
                print("--probe requires --times", file=sys.stderr)
                return 2
            pairs = []
            for item in args.probe.split(","):
                sel, _, prop = item.rpartition(":")
                pairs.append((sel.strip(), prop.strip()))
            times = [float(t) for t in args.times.split(",")]
            rows = []
            header = ["t(ms)"] + [f"{s} {p}" for s, p in pairs]
            print("  ".join(f"{c:>28}" if i else f"{c:>8}" for i, c in enumerate(header)))
            for t in times:
                seek(t)
                vals = []
                for sel, prop in pairs:
                    v = page.evaluate(
                        "([sel, prop]) => { const el = document.querySelector(sel);"
                        " return el ? getComputedStyle(el).getPropertyValue(prop) : '<missing>'; }",
                        [sel, prop])
                    vals.append(v.strip())
                rows.append({"t": t, **{f"{s}:{p}": v for (s, p), v in zip(pairs, vals)}})
                print("  ".join([f"{t:>8.0f}"] + [f"{v:>28}" for v in vals]))
            report["probe"] = rows
            print("\nInterpretation: convert each value to progress and compare with the")
            print("designed cubic-bezier at that timestamp. Values matching the LINEAR")
            print("window fraction at every t mean a keyframe timing function was dropped")
            print("(var() inside @keyframes? use literal cubic-bezier values).")

        if args.ink_sweep:
            try:
                import numpy as np
                from PIL import Image
            except ImportError:
                print("numpy+pillow required for --ink-sweep", file=sys.stderr)
                return 2
            start, end, step = (int(x) for x in args.ink_sweep.split(":"))
            times = list(range(start, end + 1, step))
            inks: list[int] = []
            for t in times:
                seek(t)
                png = page.locator(args.root).screenshot()
                arr = np.array(Image.open(io.BytesIO(png)).convert("RGB"))
                inks.append(int((arr.mean(axis=2) < args.threshold).sum()))
            deltas = [inks[i] - inks[i - 1] for i in range(1, len(inks))]
            moving = sorted(d for d in deltas if d > 0)
            med = moving[len(moving) // 2] if moving else 0
            print(f"\n{'t(ms)':>7} {'ink px':>9} {'delta':>8}")
            flags = []
            for i, t in enumerate(times):
                d = deltas[i - 1] if i else 0
                mark = ""
                if i and med:
                    if d <= max(2, med * 0.05):
                        mark = "  <- flatline"
                    elif d > med * 3:
                        mark = "  <- jump"
                if mark:
                    flags.append({"t": t, "delta": d, "kind": mark.strip(" <-")})
                print(f"{t:>7} {inks[i]:>9} {d:>8}{mark}")
            stalls = [i for i in range(1, len(deltas))
                      if deltas[i - 1] <= max(2, med * 0.05) and deltas[i] > med * 3]
            print(f"\nmedian positive delta: {med}")
            if stalls:
                print("WARNING: flatline-then-jump pattern detected (stall+pop signature) at:",
                      ", ".join(f"t≈{times[i]}ms" for i in stalls))
            else:
                print("No stall+pop signature. Isolated flatlines at known paint-under-ink")
                print("transits are physical; bridge them perceptually (tip glint).")
            report["ink_sweep"] = {"times": times, "ink": inks, "deltas": deltas,
                                   "median_delta": med, "flags": flags}
        browser.close()

    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, indent=1))
        print(f"\nreport -> {args.report}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
