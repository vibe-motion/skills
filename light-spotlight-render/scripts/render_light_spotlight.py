#!/usr/bin/env python3
"""Generate a configurable spotlight text reveal HTML animation."""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path


DEFAULT_LABEL = "vibe-motion"
DEFAULT_SWING_ANGLE_DEGREES = 26.0
DEFAULT_SWING_CYCLE_SECONDS = 2.0
DEFAULT_LAMP_SCALE = 1.0
DEFAULT_GLOW_OPACITY = 0.5
DEFAULT_MASK_COLOR = "#F5F5F5"
DEFAULT_TEXT_COLOR = "#454545"
DEFAULT_BACKGROUND_COLOR = "transparent"
DEFAULT_VIDEO_WIDTH = 1080
DEFAULT_VIDEO_HEIGHT = 1080


def clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(max_value, value))


def slugify(value: str) -> str:
    text = value.strip().lower()
    text = re.sub(r"[\\/:*?\"<>|]+", "", text)
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"[^a-z0-9\u4e00-\u9fff-]+", "", text)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text or "light-spotlight"


def format_number(value: float) -> str:
    if float(value).is_integer():
        return str(int(value))
    return f"{value:.4f}".rstrip("0").rstrip(".")


def build_output_path(label_text: str, explicit_output: str | None) -> Path:
    if explicit_output:
        return Path(explicit_output).expanduser().resolve()
    return (Path.cwd() / f"{slugify(label_text)}-spotlight.html").resolve()


def load_template() -> str:
    skill_dir = Path(__file__).resolve().parent.parent
    template_path = skill_dir / "assets" / "light_spotlight_template.html"
    return template_path.read_text(encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate a standalone HTML spotlight text reveal animation."
    )
    parser.add_argument("--label-text", default=DEFAULT_LABEL, help="Text shown in the spotlight animation.")
    parser.add_argument("--output", help="Output HTML path. Defaults to <label>-spotlight.html in cwd.")
    parser.add_argument(
        "--swing-angle-degrees",
        type=float,
        default=DEFAULT_SWING_ANGLE_DEGREES,
        help=f"Lamp swing angle in degrees (default: {DEFAULT_SWING_ANGLE_DEGREES}).",
    )
    parser.add_argument(
        "--swing-cycle-seconds",
        type=float,
        default=DEFAULT_SWING_CYCLE_SECONDS,
        help=f"Full back-and-forth cycle duration in seconds (default: {DEFAULT_SWING_CYCLE_SECONDS}).",
    )
    parser.add_argument(
        "--lamp-scale",
        type=float,
        default=DEFAULT_LAMP_SCALE,
        help=f"Scale factor applied from the lamp tip (default: {DEFAULT_LAMP_SCALE}).",
    )
    parser.add_argument(
        "--glow-opacity",
        type=float,
        default=DEFAULT_GLOW_OPACITY,
        help=f"Glow opacity from 0 to 1 (default: {DEFAULT_GLOW_OPACITY}).",
    )
    parser.add_argument("--mask-color", default=DEFAULT_MASK_COLOR, help=f"Mask/light color (default: {DEFAULT_MASK_COLOR}).")
    parser.add_argument("--text-color", default=DEFAULT_TEXT_COLOR, help=f"Base text color (default: {DEFAULT_TEXT_COLOR}).")
    parser.add_argument(
        "--background-color",
        default=DEFAULT_BACKGROUND_COLOR,
        help=f"Page background color (default: {DEFAULT_BACKGROUND_COLOR}).",
    )
    parser.add_argument(
        "--video-width",
        type=int,
        default=DEFAULT_VIDEO_WIDTH,
        help=f"Preview width cap in pixels (default: {DEFAULT_VIDEO_WIDTH}).",
    )
    parser.add_argument(
        "--video-height",
        type=int,
        default=DEFAULT_VIDEO_HEIGHT,
        help=f"Preview height cap in pixels (default: {DEFAULT_VIDEO_HEIGHT}).",
    )
    args = parser.parse_args()

    label_text = (args.label_text or "").strip() or DEFAULT_LABEL
    swing_angle_degrees = clamp(args.swing_angle_degrees, 0, 90)
    swing_cycle_seconds = clamp(args.swing_cycle_seconds, 0.2, 60)
    lamp_scale = clamp(args.lamp_scale, 0.05, 6)
    glow_opacity = clamp(args.glow_opacity, 0, 1)
    video_width = max(256, int(args.video_width))
    video_height = max(256, int(args.video_height))
    output_path = build_output_path(label_text, args.output)

    template = load_template()
    rendered = (
        template.replace("__LABEL_TEXT__", html.escape(label_text))
        .replace("__VIDEO_WIDTH__", str(video_width))
        .replace("__VIDEO_HEIGHT__", str(video_height))
        .replace("__SWING_ANGLE_DEGREES__", format_number(swing_angle_degrees))
        .replace("__HALF_SWING_DURATION_SECONDS__", format_number(swing_cycle_seconds / 2))
        .replace("__LAMP_SCALE__", format_number(lamp_scale))
        .replace("__GLOW_OPACITY__", format_number(glow_opacity))
        .replace("__MASK_COLOR__", args.mask_color.strip() or DEFAULT_MASK_COLOR)
        .replace("__TEXT_COLOR__", args.text_color.strip() or DEFAULT_TEXT_COLOR)
        .replace("__BACKGROUND_COLOR__", args.background_color.strip() or DEFAULT_BACKGROUND_COLOR)
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(rendered, encoding="utf-8")
    print(f"Output: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
