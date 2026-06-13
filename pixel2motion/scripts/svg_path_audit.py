#!/usr/bin/env python3
"""Audit SVG path complexity and generate a Bezier segment visualization."""

from __future__ import annotations

import argparse
import json
import math
import re
import xml.etree.ElementTree as ET
from pathlib import Path


COMMAND_RE = re.compile(r"[MmLlHhVvCcQqZz]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?")
PALETTE = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Audit an SVG path and draw segment/control-handle overlays.")
    parser.add_argument("svg", type=Path, help="Input SVG file.")
    parser.add_argument("--path-index", type=int, help="Path index to audit. Defaults to the black/longest path.")
    parser.add_argument("--out-svg", type=Path, default=Path("bezier_segments.svg"))
    parser.add_argument("--report", type=Path, default=Path("bezier_audit.json"))
    parser.add_argument("--budget", type=int, help="Optional agent-chosen max cubic segment count for this specific mark.")
    parser.add_argument("--angle-threshold", type=float, default=8.0, help="Warn when adjacent tangents differ by more than this many degrees.")
    return parser.parse_args()


def is_command(token: str) -> bool:
    return len(token) == 1 and token.isalpha()


def parse_float(tokens: list[str], index: int) -> tuple[float, int]:
    if index >= len(tokens) or is_command(tokens[index]):
        raise ValueError("Expected numeric SVG path token.")
    return float(tokens[index]), index + 1


def parse_path(d: str) -> tuple[list[dict], bool]:
    tokens = COMMAND_RE.findall(d)
    index = 0
    command = ""
    current = (0.0, 0.0)
    subpath_start = (0.0, 0.0)
    segments: list[dict] = []
    closed = False

    while index < len(tokens):
        if is_command(tokens[index]):
            command = tokens[index]
            index += 1
        if not command:
            raise ValueError("Path data starts without a command.")

        relative = command.islower()
        op = command.upper()

        if op == "M":
            x, index = parse_float(tokens, index)
            y, index = parse_float(tokens, index)
            if relative:
                x += current[0]
                y += current[1]
            current = (x, y)
            subpath_start = current
            command = "l" if relative else "L"
            continue

        if op == "L":
            x, index = parse_float(tokens, index)
            y, index = parse_float(tokens, index)
            if relative:
                x += current[0]
                y += current[1]
            end = (x, y)
            segments.append({"type": "L", "p0": current, "p3": end})
            current = end
            continue

        if op == "H":
            x, index = parse_float(tokens, index)
            if relative:
                x += current[0]
            end = (x, current[1])
            segments.append({"type": "L", "p0": current, "p3": end})
            current = end
            continue

        if op == "V":
            y, index = parse_float(tokens, index)
            if relative:
                y += current[1]
            end = (current[0], y)
            segments.append({"type": "L", "p0": current, "p3": end})
            current = end
            continue

        if op == "C":
            values = []
            for _ in range(6):
                value, index = parse_float(tokens, index)
                values.append(value)
            c1 = (values[0], values[1])
            c2 = (values[2], values[3])
            end = (values[4], values[5])
            if relative:
                c1 = (c1[0] + current[0], c1[1] + current[1])
                c2 = (c2[0] + current[0], c2[1] + current[1])
                end = (end[0] + current[0], end[1] + current[1])
            segments.append({"type": "C", "p0": current, "c1": c1, "c2": c2, "p3": end})
            current = end
            continue

        if op == "Q":
            qx, index = parse_float(tokens, index)
            qy, index = parse_float(tokens, index)
            x, index = parse_float(tokens, index)
            y, index = parse_float(tokens, index)
            q = (qx, qy)
            end = (x, y)
            if relative:
                q = (q[0] + current[0], q[1] + current[1])
                end = (end[0] + current[0], end[1] + current[1])
            c1 = (current[0] + (2.0 / 3.0) * (q[0] - current[0]), current[1] + (2.0 / 3.0) * (q[1] - current[1]))
            c2 = (end[0] + (2.0 / 3.0) * (q[0] - end[0]), end[1] + (2.0 / 3.0) * (q[1] - end[1]))
            segments.append({"type": "C", "p0": current, "c1": c1, "c2": c2, "p3": end, "source": "Q"})
            current = end
            continue

        if op == "Z":
            closed = True
            current = subpath_start
            command = ""
            continue

        raise ValueError(f"Unsupported path command: {command}")

    return segments, closed


def cubic_point(segment: dict, t: float) -> tuple[float, float]:
    p0 = segment["p0"]
    c1 = segment["c1"]
    c2 = segment["c2"]
    p3 = segment["p3"]
    mt = 1.0 - t
    x = mt**3 * p0[0] + 3 * mt * mt * t * c1[0] + 3 * mt * t * t * c2[0] + t**3 * p3[0]
    y = mt**3 * p0[1] + 3 * mt * mt * t * c1[1] + 3 * mt * t * t * c2[1] + t**3 * p3[1]
    return x, y


def segment_points(segment: dict, samples: int = 24) -> list[tuple[float, float]]:
    if segment["type"] == "L":
        return [segment["p0"], segment["p3"]]
    return [cubic_point(segment, i / samples) for i in range(samples + 1)]


def segment_length(segment: dict) -> float:
    points = segment_points(segment)
    return sum(math.dist(points[i - 1], points[i]) for i in range(1, len(points)))


def tangent_start(segment: dict) -> tuple[float, float]:
    if segment["type"] == "L":
        p0, p3 = segment["p0"], segment["p3"]
        return p3[0] - p0[0], p3[1] - p0[1]
    p0, c1 = segment["p0"], segment["c1"]
    return c1[0] - p0[0], c1[1] - p0[1]


def tangent_end(segment: dict) -> tuple[float, float]:
    if segment["type"] == "L":
        p0, p3 = segment["p0"], segment["p3"]
        return p3[0] - p0[0], p3[1] - p0[1]
    c2, p3 = segment["c2"], segment["p3"]
    return p3[0] - c2[0], p3[1] - c2[1]


def angle_between(a: tuple[float, float], b: tuple[float, float]) -> float:
    la = math.hypot(a[0], a[1])
    lb = math.hypot(b[0], b[1])
    if la == 0 or lb == 0:
        return 0.0
    value = max(-1.0, min(1.0, (a[0] * b[0] + a[1] * b[1]) / (la * lb)))
    return math.degrees(math.acos(value))


def format_point(point: tuple[float, float]) -> str:
    return f"{point[0]:.1f} {point[1]:.1f}"


def path_fragment(segment: dict) -> str:
    if segment["type"] == "L":
        return f"M {format_point(segment['p0'])} L {format_point(segment['p3'])}"
    return (
        f"M {format_point(segment['p0'])} "
        f"C {format_point(segment['c1'])}, {format_point(segment['c2'])}, {format_point(segment['p3'])}"
    )


def midpoint(segment: dict) -> tuple[float, float]:
    if segment["type"] == "L":
        p0, p3 = segment["p0"], segment["p3"]
        return (p0[0] + p3[0]) / 2, (p0[1] + p3[1]) / 2
    return cubic_point(segment, 0.5)


def collect_paths(svg_path: Path) -> tuple[ET.Element, list[ET.Element]]:
    root = ET.parse(svg_path).getroot()
    paths = [element for element in root.iter() if element.tag.endswith("path") and element.get("d")]
    if not paths:
        raise SystemExit(f"No SVG path elements found in {svg_path}")
    return root, paths


def choose_path(paths: list[ET.Element], path_index: int | None) -> int:
    if path_index is not None:
        if path_index < 0 or path_index >= len(paths):
            raise SystemExit(f"--path-index {path_index} is out of range for {len(paths)} paths")
        return path_index
    for index, path in enumerate(paths):
        fill = (path.get("fill") or "").lower()
        style = (path.get("style") or "").lower()
        if "#111" in fill or "#111" in style or "rgb(17" in style:
            return index
    return max(range(len(paths)), key=lambda idx: len(paths[idx].get("d") or ""))


def root_view_box(root: ET.Element, segments: list[dict]) -> tuple[str, float, float]:
    view_box = root.get("viewBox")
    if view_box:
        parts = [float(value) for value in re.findall(r"[-+]?(?:\d*\.\d+|\d+)", view_box)]
        if len(parts) == 4:
            return view_box, parts[2], parts[3]

    width = float(re.sub(r"[^0-9.]", "", root.get("width", "0")) or 0)
    height = float(re.sub(r"[^0-9.]", "", root.get("height", "0")) or 0)
    if width and height:
        return f"0 0 {width:g} {height:g}", width, height

    points = [point for segment in segments for point in segment_points(segment)]
    min_x = min(point[0] for point in points) - 24
    min_y = min(point[1] for point in points) - 24
    max_x = max(point[0] for point in points) + 24
    max_y = max(point[1] for point in points) + 24
    width = max_x - min_x
    height = max_y - min_y
    return f"{min_x:g} {min_y:g} {width:g} {height:g}", width, height


def build_report(segments: list[dict], closed: bool, budget: int | None, angle_threshold: float) -> dict:
    lengths = [segment_length(segment) for segment in segments]
    cubic_count = sum(1 for segment in segments if segment["type"] == "C")
    line_count = sum(1 for segment in segments if segment["type"] == "L")
    median_length = sorted(lengths)[len(lengths) // 2] if lengths else 0.0

    join_warnings = []
    pairs = list(zip(segments, segments[1:]))
    if closed and len(segments) > 1:
        pairs.append((segments[-1], segments[0]))
    for index, (left, right) in enumerate(pairs, start=1):
        if math.dist(left["p3"], right["p0"]) > 0.5:
            continue
        angle = angle_between(tangent_end(left), tangent_start(right))
        if angle > angle_threshold:
            join_warnings.append({"join_after_segment": index, "angle_degrees": round(angle, 3)})

    short_segments = []
    if median_length:
        for index, length in enumerate(lengths, start=1):
            if length < median_length * 0.25:
                short_segments.append({"segment": index, "length": round(length, 3)})

    return {
        "segment_count": len(segments),
        "cubic_segments": cubic_count,
        "line_segments": line_count,
        "closed": closed,
        "budget": budget,
        "over_budget": bool(budget is not None and cubic_count > budget),
        "median_segment_length": round(median_length, 3),
        "short_segment_warnings": short_segments,
        "join_angle_threshold_degrees": angle_threshold,
        "join_angle_warnings": join_warnings,
    }


def build_visual_svg(root: ET.Element, path_d: str, segments: list[dict], report: dict) -> str:
    view_box, width, height = root_view_box(root, segments)
    lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width:g}" height="{height:g}" viewBox="{view_box}">',
        '<rect width="100%" height="100%" fill="#ffffff"/>',
        f'<path d="{path_d}" fill="#111111" opacity="0.16"/>',
        '<g fill="none" stroke-linecap="round" stroke-linejoin="round">',
    ]

    for index, segment in enumerate(segments, start=1):
        color = PALETTE[(index - 1) % len(PALETTE)]
        lines.append(f'<path d="{path_fragment(segment)}" stroke="{color}" stroke-width="4.5"/>')
    lines.append("</g>")

    lines.append('<g stroke="#64748b" stroke-width="1.2" stroke-dasharray="5 5" opacity="0.58">')
    for segment in segments:
        if segment["type"] != "C":
            continue
        lines.append(
            f'<path d="M {format_point(segment["p0"])} L {format_point(segment["c1"])} '
            f'M {format_point(segment["p3"])} L {format_point(segment["c2"])}"/>'
        )
    lines.append("</g>")

    warning_segments = {item["join_after_segment"] for item in report["join_angle_warnings"]}
    short_segments = {item["segment"] for item in report["short_segment_warnings"]}
    lines.append('<g font-family="Arial, Helvetica, sans-serif">')
    for index, segment in enumerate(segments, start=1):
        color = PALETTE[(index - 1) % len(PALETTE)]
        p0 = segment["p0"]
        mx, my = midpoint(segment)
        label_color = "#dc2626" if index in warning_segments or index in short_segments else color
        lines.append(f'<circle cx="{p0[0]:.1f}" cy="{p0[1]:.1f}" r="3.1" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>')
        if segment["type"] == "C":
            for point in (segment["c1"], segment["c2"]):
                lines.append(f'<circle cx="{point[0]:.1f}" cy="{point[1]:.1f}" r="2.4" fill="#2563eb" opacity="0.72"/>')
        lines.append(
            f'<text x="{mx:.1f}" y="{my - 7:.1f}" text-anchor="middle" font-size="10" font-weight="700" '
            f'fill="{label_color}" stroke="#ffffff" stroke-width="3.5" paint-order="stroke fill">{index}</text>'
        )
    lines.append("</g>")

    if report["budget"] is None:
        status = "no fixed budget"
    else:
        status = "OVER BUDGET" if report["over_budget"] else "within chosen budget"
    lines.extend(
        [
            '<g font-family="Arial, Helvetica, sans-serif" fill="#111827">',
            '<rect x="18" y="16" width="430" height="82" rx="8" fill="#ffffff" opacity="0.90" stroke="#cbd5e1"/>',
            f'<text x="34" y="42" font-size="14" font-weight="700">Path audit: {report["cubic_segments"]} cubic segments ({status})</text>',
            f'<text x="34" y="64" font-size="12" fill="#475569">Join warnings: {len(report["join_angle_warnings"])}; short segments: {len(report["short_segment_warnings"])}</text>',
            '<text x="34" y="84" font-size="12" fill="#475569">Colored curves = segments; blue dots/gray lines = Bezier handles</text>',
            "</g>",
            "</svg>",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> int:
    args = parse_args()
    root, paths = collect_paths(args.svg)
    selected = choose_path(paths, args.path_index)
    path_d = paths[selected].get("d") or ""
    segments, closed = parse_path(path_d)
    report = build_report(segments, closed, args.budget, args.angle_threshold)
    report["input_svg"] = str(args.svg)
    report["selected_path_index"] = selected
    report["path_count"] = len(paths)

    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.out_svg.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    args.out_svg.write_text(build_visual_svg(root, path_d, segments, report), encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
