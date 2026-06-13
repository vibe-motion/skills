#!/usr/bin/env python3
"""Trace a raster logo into SVG/HTML starter artifacts with overlay QA images."""

from __future__ import annotations

import argparse
import json
import math
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Trace a raster logo to SVG and HTML.")
    parser.add_argument("input", type=Path, help="Raster logo image.")
    parser.add_argument("--out", type=Path, default=Path("outputs"), help="Output directory.")
    parser.add_argument("--colors", type=int, default=6, help="Maximum color buckets.")
    parser.add_argument("--simplify", type=float, default=1.1, help="Path simplification tolerance.")
    parser.add_argument("--min-area", type=int, default=16, help="Ignore smaller color regions.")
    parser.add_argument("--alpha-threshold", type=int, default=12)
    parser.add_argument("--bg-threshold", type=float, default=24.0)
    parser.add_argument("--overlay-opacity", type=int, default=112)
    return parser.parse_args()


def infer_foreground(rgba: np.ndarray, alpha_threshold: int, bg_threshold: float) -> tuple[np.ndarray, dict]:
    alpha = rgba[:, :, 3]
    rgb = rgba[:, :, :3].astype(float)
    if int((alpha < 250).sum()) > max(8, alpha.size // 200):
        mask = alpha > alpha_threshold
        return mask, {"mode": "alpha", "alpha_threshold": alpha_threshold}

    border = np.concatenate([rgb[0, :, :], rgb[-1, :, :], rgb[:, 0, :], rgb[:, -1, :]], axis=0)
    bg = np.median(border, axis=0)
    distance = np.linalg.norm(rgb - bg, axis=2)
    border_distance = np.linalg.norm(border - bg, axis=1)
    threshold = max(bg_threshold, float(np.percentile(border_distance, 98) + 10.0))
    mask = distance > threshold
    return mask, {
        "mode": "background-distance",
        "background_rgb": [round(float(v), 2) for v in bg],
        "distance_threshold": round(float(threshold), 3),
    }


def color_groups(source: Image.Image, fg: np.ndarray, max_colors: int, min_area: int) -> list[dict]:
    rgb_image = source.convert("RGB")
    quantized = rgb_image.quantize(colors=max(2, max_colors), method=Image.Quantize.MEDIANCUT)
    indexes = np.asarray(quantized)
    rgb = np.asarray(rgb_image)
    groups = []
    for idx in sorted(np.unique(indexes[fg]).tolist()):
        mask = fg & (indexes == idx)
        area = int(mask.sum())
        if area < min_area:
            continue
        median = np.median(rgb[mask], axis=0).astype(int)
        fill = "#{:02x}{:02x}{:02x}".format(int(median[0]), int(median[1]), int(median[2]))
        groups.append({"fill": fill, "mask": mask, "area": area})
    groups.sort(key=lambda item: item["area"], reverse=True)
    return groups


def add_edge(edges: dict[tuple[int, int], list[tuple[int, int]]], start: tuple[int, int], end: tuple[int, int]) -> None:
    edges[start].append(end)


def trace_mask(mask: np.ndarray) -> list[list[tuple[float, float]]]:
    height, width = mask.shape
    edges: dict[tuple[int, int], list[tuple[int, int]]] = defaultdict(list)
    ys, xs = np.nonzero(mask)
    for y, x in zip(ys.tolist(), xs.tolist()):
        if y == 0 or not mask[y - 1, x]:
            add_edge(edges, (x, y), (x + 1, y))
        if x == width - 1 or not mask[y, x + 1]:
            add_edge(edges, (x + 1, y), (x + 1, y + 1))
        if y == height - 1 or not mask[y + 1, x]:
            add_edge(edges, (x + 1, y + 1), (x, y + 1))
        if x == 0 or not mask[y, x - 1]:
            add_edge(edges, (x, y + 1), (x, y))

    for outgoing in edges.values():
        outgoing.sort(key=lambda point: (point[1], point[0]))

    loops = []
    while edges:
        start = next(iter(edges))
        current = start
        loop = [current]
        while True:
            outgoing = edges.get(current)
            if not outgoing:
                break
            nxt = outgoing.pop(0)
            if not outgoing:
                del edges[current]
            loop.append(nxt)
            current = nxt
            if current == start:
                break
        if len(loop) >= 4 and loop[-1] == loop[0]:
            loops.append([(float(x), float(y)) for x, y in loop[:-1]])
    loops.sort(key=lambda pts: abs(polygon_area(pts)), reverse=True)
    return loops


def polygon_area(points: list[tuple[float, float]]) -> float:
    area = 0.0
    for i, (x1, y1) in enumerate(points):
        x2, y2 = points[(i + 1) % len(points)]
        area += x1 * y2 - x2 * y1
    return area / 2.0


def point_line_distance(point: tuple[float, float], start: tuple[float, float], end: tuple[float, float]) -> float:
    px, py = point
    sx, sy = start
    ex, ey = end
    dx = ex - sx
    dy = ey - sy
    if dx == 0 and dy == 0:
        return math.hypot(px - sx, py - sy)
    return abs(dy * px - dx * py + ex * sy - ey * sx) / math.hypot(dx, dy)


def rdp(points: list[tuple[float, float]], epsilon: float) -> list[tuple[float, float]]:
    if len(points) <= 2:
        return points
    start = points[0]
    end = points[-1]
    index = 0
    max_distance = -1.0
    for i in range(1, len(points) - 1):
        distance = point_line_distance(points[i], start, end)
        if distance > max_distance:
            max_distance = distance
            index = i
    if max_distance > epsilon:
        left = rdp(points[: index + 1], epsilon)
        right = rdp(points[index:], epsilon)
        return left[:-1] + right
    return [start, end]


def simplify_closed(points: list[tuple[float, float]], epsilon: float) -> list[tuple[float, float]]:
    if len(points) <= 4:
        return points
    start_index = min(range(len(points)), key=lambda i: (points[i][1], points[i][0]))
    rotated = points[start_index:] + points[:start_index]
    simplified = rdp(rotated + [rotated[0]], epsilon)
    if simplified and simplified[-1] == simplified[0]:
        simplified = simplified[:-1]
    return simplified


def fmt(value: float) -> str:
    if abs(value - round(value)) < 1e-6:
        return str(int(round(value)))
    return f"{value:.2f}".rstrip("0").rstrip(".")


def path_data(loops: list[list[tuple[float, float]]]) -> str:
    parts = []
    for loop in loops:
        if len(loop) < 3:
            continue
        commands = [f"M {fmt(loop[0][0])} {fmt(loop[0][1])}"]
        commands.extend(f"L {fmt(x)} {fmt(y)}" for x, y in loop[1:])
        commands.append("Z")
        parts.append(" ".join(commands))
    return " ".join(parts)


def svg_document(width: int, height: int, paths: list[dict]) -> str:
    lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        "  <title>Vectorized logo</title>",
        '  <g fill-rule="evenodd" shape-rendering="geometricPrecision">',
    ]
    for item in paths:
        lines.append(f'    <path d="{item["d"]}" fill="{item["fill"]}"/>')
    lines.extend(["  </g>", "</svg>", ""])
    return "\n".join(lines)


def html_document(svg_text: str) -> str:
    inline = svg_text.replace("<svg ", '<svg role="img" aria-label="Vectorized logo" ')
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Vectorized Logo</title>
  <style>
    * {{ box-sizing: border-box; }}
    html, body {{ margin: 0; min-height: 100%; background: #fff; }}
    body {{ display: grid; min-height: 100vh; place-items: center; }}
    main {{ width: min(100vw, 100vh); aspect-ratio: 1; display: grid; place-items: center; }}
    svg {{ display: block; max-width: 100%; max-height: 100%; width: 100%; height: auto; }}
  </style>
</head>
<body>
  <main>
    {inline}
  </main>
</body>
</html>
"""


def draw_evenodd_mask(size: tuple[int, int], loops: list[list[tuple[float, float]]]) -> Image.Image:
    width, height = size
    mask = np.zeros((height, width), dtype=bool)
    for loop in loops:
        temp = Image.new("L", size, 0)
        ImageDraw.Draw(temp).polygon(loop, fill=255)
        mask ^= np.asarray(temp) > 0
    return Image.fromarray(mask.astype(np.uint8) * 255, "L")


def render_vector(size: tuple[int, int], paths: list[dict]) -> Image.Image:
    result = Image.new("RGBA", size, (0, 0, 0, 0))
    for item in paths:
        mask = draw_evenodd_mask(size, item["loops"])
        fill = item["fill"].lstrip("#")
        rgb = tuple(int(fill[i : i + 2], 16) for i in (0, 2, 4))
        layer = Image.new("RGBA", size, (*rgb, 255))
        result.alpha_composite(Image.composite(layer, Image.new("RGBA", size, (0, 0, 0, 0)), mask))
    return result


def make_overlay(source: Image.Image, vector: Image.Image, opacity: int) -> Image.Image:
    alpha = np.asarray(vector.split()[-1])
    tint_alpha = ((alpha > 0).astype(np.uint8) * max(0, min(255, opacity))).astype(np.uint8)
    tint = Image.new("RGBA", source.size, (0, 209, 255, 0))
    tint.putalpha(Image.fromarray(tint_alpha, "L"))
    return Image.alpha_composite(source.convert("RGBA"), tint)


def mask_metrics(source_mask: np.ndarray, vector: Image.Image) -> dict:
    vector_mask = np.asarray(vector.split()[-1]) > 0
    source = source_mask.astype(bool)
    overlap = source & vector_mask
    union = source | vector_mask
    source_area = int(source.sum())
    vector_area = int(vector_mask.sum())
    intersection = int(overlap.sum())
    union_area = int(union.sum())
    return {
        "source_foreground_pixels": source_area,
        "vector_foreground_pixels": vector_area,
        "intersection_pixels": intersection,
        "union_pixels": union_area,
        "iou": round(intersection / union_area, 6) if union_area else 0.0,
        "recall_source_covered_by_vector": round(intersection / source_area, 6) if source_area else 0.0,
        "precision_vector_inside_source": round(intersection / vector_area, 6) if vector_area else 0.0,
    }


def main() -> int:
    args = parse_args()
    source = Image.open(args.input).convert("RGBA")
    width, height = source.size
    args.out.mkdir(parents=True, exist_ok=True)

    fg, detection = infer_foreground(np.asarray(source), args.alpha_threshold, args.bg_threshold)
    groups = color_groups(source, fg, args.colors, args.min_area)
    paths = []
    summaries = []
    for group in groups:
        loops = [simplify_closed(loop, args.simplify) for loop in trace_mask(group["mask"])]
        loops = [loop for loop in loops if len(loop) >= 3]
        d = path_data(loops)
        if not d:
            continue
        paths.append({"fill": group["fill"], "d": d, "loops": loops})
        summaries.append({
            "fill": group["fill"],
            "area_pixels": group["area"],
            "loop_count": len(loops),
            "point_count": int(sum(len(loop) for loop in loops)),
        })

    if not paths:
        raise SystemExit("No vector paths produced. Adjust thresholds or min-area.")

    svg_path = args.out / "logo.svg"
    html_path = args.out / "logo.html"
    vector_path = args.out / "vector_render.png"
    overlay_path = args.out / "overlay.png"
    metrics_path = args.out / "metrics.json"

    svg_text = svg_document(width, height, paths)
    svg_path.write_text(svg_text, encoding="utf-8")
    html_path.write_text(html_document(svg_text), encoding="utf-8")

    vector = render_vector((width, height), paths)
    vector.save(vector_path)
    make_overlay(source, vector, args.overlay_opacity).save(overlay_path)

    metrics = {
        "input": str(args.input),
        "foreground_detection": detection,
        "groups": summaries,
        "metrics": mask_metrics(fg, vector),
        "outputs": {
            "svg": str(svg_path),
            "html": str(html_path),
            "vector_render": str(vector_path),
            "overlay": str(overlay_path),
        },
    }
    metrics_path.write_text(json.dumps(metrics, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(metrics, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
