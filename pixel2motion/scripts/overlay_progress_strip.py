#!/usr/bin/env python3
"""Combine current-run iteration overlay images into one horizontal progress strip."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Make a horizontal strip from current-run iterative overlay images.")
    parser.add_argument("overlays", nargs="*", type=Path, help="Overlay PNGs generated during this fitting run, in iteration order.")
    parser.add_argument("--dir", type=Path, help="Directory to scan for overlay PNGs.")
    parser.add_argument("--pattern", default="*overlay*.png", help="Glob pattern used with --dir.")
    parser.add_argument("--source", type=Path, help="Original raster logo image shown as the first panel.")
    parser.add_argument("--source-label", default="source raster")
    parser.add_argument("--final-image", type=Path, help="Final SVG/HTML render PNG shown as the last panel.")
    parser.add_argument("--final-label", default="final vector render")
    parser.add_argument("--out", type=Path, default=Path("overlay_progress_strip.png"))
    parser.add_argument("--max-height", type=int, default=480, help="Maximum height for each overlay panel.")
    parser.add_argument("--gutter", type=int, default=18)
    parser.add_argument("--margin", type=int, default=18)
    return parser.parse_args()


def natural_key(path: Path) -> list[int | str]:
    parts = re.split(r"(\d+)", path.name.lower())
    return [int(part) if part.isdigit() else part for part in parts]


def collect_overlay_paths(args: argparse.Namespace) -> list[Path]:
    paths = list(args.overlays)
    if args.dir:
        paths.extend(sorted(args.dir.glob(args.pattern), key=natural_key))
    unique = []
    seen = set()
    for path in paths:
        resolved = path.resolve()
        if resolved in seen:
            continue
        seen.add(resolved)
        unique.append(path)
    return unique


def flatten(image: Image.Image) -> Image.Image:
    base = Image.new("RGBA", image.size, (255, 255, 255, 255))
    base.alpha_composite(image.convert("RGBA"))
    return base.convert("RGB")


def resize_panel(image: Image.Image, max_height: int) -> Image.Image:
    if max_height <= 0 or image.height <= max_height:
        return image
    scale = max_height / image.height
    width = max(1, int(round(image.width * scale)))
    resample = getattr(getattr(Image, "Resampling", Image), "LANCZOS")
    return image.resize((width, max_height), resample)


def overlay_label_for(index: int, path: Path) -> str:
    stem = path.stem
    stem = re.sub(r"[_-]*overlay[_-]*", " ", stem, flags=re.IGNORECASE)
    stem = re.sub(r"[_-]+", " ", stem).strip()
    stem = re.sub(r"^\d+\s*", "", stem).strip()
    return f"{index:02d} {stem}" if stem else f"{index:02d}"


def build_strip(
    overlay_paths: list[Path],
    source_path: Path | None,
    source_label: str,
    final_path: Path | None,
    final_label: str,
    max_height: int,
    margin: int,
    gutter: int,
) -> Image.Image:
    font = ImageFont.load_default()
    label_height = 28
    panels = []

    if source_path:
        panels.append((source_label, resize_panel(flatten(Image.open(source_path)), max_height)))

    for index, path in enumerate(overlay_paths, start=1):
        image = resize_panel(flatten(Image.open(path)), max_height)
        panels.append((overlay_label_for(index, path), image))

    if final_path:
        panels.append((final_label, resize_panel(flatten(Image.open(final_path)), max_height)))

    if not panels:
        raise SystemExit("No images found. Provide --source, overlay images, --dir, or --final-image.")

    width = margin * 2 + sum(image.width for _, image in panels) + gutter * max(0, len(panels) - 1)
    panel_height = max(image.height for _, image in panels)
    height = margin * 2 + label_height + panel_height
    strip = Image.new("RGB", (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(strip)

    x = margin
    image_y = margin + label_height
    for label, image in panels:
        draw.text((x, margin), label, fill=(30, 36, 44), font=font)
        draw.rectangle((x - 1, image_y - 1, x + image.width, image_y + image.height), outline=(210, 216, 224))
        strip.paste(image, (x, image_y))
        x += image.width + gutter
    return strip


def main() -> int:
    args = parse_args()
    overlay_paths = collect_overlay_paths(args)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    build_strip(
        overlay_paths,
        args.source,
        args.source_label,
        args.final_image,
        args.final_label,
        args.max_height,
        args.margin,
        args.gutter,
    ).save(args.out)
    print(args.out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
