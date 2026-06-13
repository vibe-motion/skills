#!/usr/bin/env python3
"""Render an SVG in headless Chrome and overlay it on the source raster for fit QA.

One command per fit iteration: renders the SVG at the source image's exact pixel
size (real browser, no rasterizer dependency), composites a cyan overlay of the
render silhouette onto the source, and reports IoU / src_only / render_only pixel
counts. Inspect the overlay with multimodal vision; use the numbers only as a
trend signal between iterations.

Requires Pillow + numpy (use a venv if the system Python is externally managed)
and a Chrome/Chromium binary (auto-detected, or set CHROME_BIN).
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

CHROME_CANDIDATES = [
    os.environ.get("CHROME_BIN", ""),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "google-chrome",
    "chromium",
    "chromium-browser",
]


def find_chrome() -> str:
    for cand in CHROME_CANDIDATES:
        if not cand:
            continue
        if Path(cand).exists():
            return cand
        found = shutil.which(cand)
        if found:
            return found
    raise SystemExit("No Chrome/Chromium found. Set CHROME_BIN to a browser binary.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Render SVG via headless Chrome and build a cyan fit overlay.")
    parser.add_argument("svg", type=Path, help="Fitted SVG file.")
    parser.add_argument("source", type=Path, help="Source raster image (PNG/JPG/WebP).")
    parser.add_argument("--out", type=Path, required=True, help="Overlay PNG path (e.g. outputs/fit_iterations/01_x_overlay.png).")
    parser.add_argument("--render-out", type=Path, default=None, help="Also save the bare SVG render PNG here.")
    parser.add_argument("--report", type=Path, default=None, help="Optional JSON metrics path.")
    parser.add_argument(
        "--fg-threshold", type=int, default=720,
        help="Pixel is foreground when R+G+B < threshold (default 720 = non-near-white).",
    )
    return parser.parse_args()


def render_svg(svg: Path, width: int, height: int, chrome: str) -> Image.Image:
    from PIL import Image

    with tempfile.TemporaryDirectory() as td:
        wrapper = Path(td) / "wrap.html"
        shot = Path(td) / "shot.png"
        wrapper.write_text(
            "<!doctype html><html><head><style>html,body{margin:0;padding:0}</style></head>"
            f'<body><img src="{svg.resolve().as_uri()}" width="{width}" height="{height}"></body></html>',
            encoding="utf-8",
        )
        subprocess.run(
            [
                chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                f"--screenshot={shot}", f"--window-size={width},{height}",
                "--default-background-color=FFFFFFFF", wrapper.resolve().as_uri(),
            ],
            check=True, capture_output=True,
        )
        return Image.open(shot).convert("RGB").copy()


def main() -> int:
    args = parse_args()

    import numpy as np
    from PIL import Image

    src_img = Image.open(args.source).convert("RGB")
    W, H = src_img.size
    render = render_svg(args.svg, W, H, find_chrome())
    if args.render_out:
        args.render_out.parent.mkdir(parents=True, exist_ok=True)
        render.save(args.render_out)

    a = np.asarray(src_img).astype(int)
    b = np.asarray(render).astype(int)
    src_sil = a.sum(axis=2) < args.fg_threshold
    ren_sil = b.sum(axis=2) < args.fg_threshold

    over = a.copy()
    over[ren_sil] = (over[ren_sil] * 0.35 + np.array([0, 200, 220]) * 0.65).astype(int)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(over.astype(np.uint8)).save(args.out)

    inter = int((src_sil & ren_sil).sum())
    union = int((src_sil | ren_sil).sum())
    metrics = {
        "svg": str(args.svg),
        "source": str(args.source),
        "overlay": str(args.out),
        "iou": round(inter / union, 4) if union else 0.0,
        "src_only_px": int((src_sil & ~ren_sil).sum()),
        "render_only_px": int((ren_sil & ~src_sil).sum()),
    }
    print(f"IoU={metrics['iou']}  src_only={metrics['src_only_px']}  render_only={metrics['render_only_px']}")
    print("Numbers are a trend signal — judge the overlay visually.")
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
