#!/usr/local/bin/python3
"""Render Claude typer animation using remote Remotion CLI."""

from __future__ import annotations

import argparse
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
from pathlib import Path

SERVE_URL = "https://www.laosunwendao.com"
COMPOSITION = "Typer30fps"

DEFAULT_TYPING_SPEED_MS = 30
DEFAULT_VIDEO_WIDTH = 1080
DEFAULT_VIDEO_HEIGHT = 1080
DEFAULT_CLAUDE_WIDTH = 880
DEFAULT_FPS = 30
DEFAULT_CODEC = "prores"
DEFAULT_PRORES_PROFILE = "4444"
DEFAULT_PIXEL_FORMAT = "yuva444p10le"
DEFAULT_IMAGE_FORMAT = "png"
DEFAULT_SCALE = 2
DEFAULT_TIMEOUT_MS = 300000
DEFAULT_CONCURRENCY = 1
DEFAULT_REMOTION_VERSION = "4.0.440"
REMOTION_CLI_PACKAGE = f"@remotion/cli@{DEFAULT_REMOTION_VERSION}"
REMOTION_TAILWIND_PACKAGE = f"@remotion/tailwind-v4@{DEFAULT_REMOTION_VERSION}"


def condense_prompt(prompt: str) -> str:
    text = prompt.strip().strip("\"'“”‘’")
    text = re.sub(r"\s+", "", text)

    lead_patterns = [
        r"^(帮我|请你|请|麻烦|可以|能否|帮忙)",
        r"^(做一个|做个|生成一个|生成|制作一个|制作|创建一个|创建|来个|做)",
        r"^(关于)",
    ]
    for pattern in lead_patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)

    text = re.sub(r"(claude|提示词|打字机|动画|视频)+$", "", text, flags=re.IGNORECASE)
    text = re.sub(r"^[的]+|[的]+$", "", text)
    text = re.sub(r"[\\/:*?\"<>|\n\r\t]", "", text)
    text = re.sub(r"[^A-Za-z0-9_\-\u4e00-\u9fff]", "", text)
    text = text.strip("._-")

    if not text:
        return "claude-typer"
    return text[:24]


def resolve_runners(runner_prefix: str | None) -> list[tuple[list[str], str]]:
    if runner_prefix:
        parts = shlex.split(runner_prefix)
        if not parts:
            raise RuntimeError("--runner-prefix must not be empty.")
        return [(parts, runner_prefix)]

    runners: list[tuple[list[str], str]] = []
    if shutil.which("bunx"):
        runners.append((["bunx", "@remotion/cli"], "bunx @remotion/cli"))
    if shutil.which("npx"):
        runners.append(
            (
                [
                    "npx",
                    "-y",
                    "-p",
                    REMOTION_CLI_PACKAGE,
                    "-p",
                    REMOTION_TAILWIND_PACKAGE,
                    "remotion",
                ],
                f"npx -y -p {REMOTION_CLI_PACKAGE} -p {REMOTION_TAILWIND_PACKAGE} remotion",
            )
        )
    if not runners:
        raise RuntimeError("Neither bunx nor npx is available in PATH.")
    return runners


def detect_browser_executable() -> str | None:
    if os.name == "nt":
        return None

    candidate_paths = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ]
    for candidate in candidate_paths:
        if Path(candidate).exists():
            return candidate

    for binary in ("google-chrome", "google-chrome-stable", "chromium-browser", "chromium"):
        found = shutil.which(binary)
        if found:
            return found

    return None


def build_props(prompt: str, video_width: int, video_height: int, claude_width: int) -> str:
    props = {
        "prompt": prompt,
        "typingSpeedMs": DEFAULT_TYPING_SPEED_MS,
        "model": "MiniMax-M2.7",
        "videoWidth": video_width,
        "videoHeight": video_height,
        "claudeWidth": claude_width,
        "tiltStartX": 9.2,
        "tiltStartY": 0,
        "tiltEndX": -2.2,
        "tiltEndY": 10.5,
        "tiltDurationRatio": 1,
    }
    return json.dumps(props, ensure_ascii=False, separators=(",", ":"))


def build_render_args(
    prompt: str,
    serve_url: str,
    composition: str,
    output_file: Path,
    video_width: int,
    video_height: int,
    claude_width: int,
    fps: int,
    codec: str,
    prores_profile: str | None,
    audio_codec: str | None,
    pixel_format: str | None,
    image_format: str | None,
    scale: int,
    timeout_ms: int,
    concurrency: int,
    browser_executable: str | None,
    extra_render_args: list[str],
) -> list[str]:
    args = [
        "render",
        serve_url,
        composition,
        str(output_file),
        f"--fps={fps}",
        f"--codec={codec}",
        f"--scale={scale}",
        f"--timeout={timeout_ms}",
        f"--concurrency={concurrency}",
        f"--props={build_props(prompt, video_width, video_height, claude_width)}",
    ]
    if prores_profile:
        args.append(f"--prores-profile={prores_profile}")
    if audio_codec:
        args.append(f"--audio-codec={audio_codec}")
    if pixel_format:
        args.append(f"--pixel-format={pixel_format}")
    if image_format:
        args.append(f"--image-format={image_format}")
    if browser_executable:
        args.append(f"--browser-executable={browser_executable}")
    args.extend(extra_render_args)
    return args


def run_with_fallback(runners: list[tuple[list[str], str]], render_args: list[str]) -> None:
    last_error: subprocess.CalledProcessError | None = None

    for index, (runner_prefix, runner_name) in enumerate(runners):
        cmd = runner_prefix + render_args
        print(f"Using runner: {runner_name}", flush=True)
        print("Command:", flush=True)
        print(" ".join(cmd), flush=True)

        try:
            subprocess.run(cmd, check=True)
            return
        except subprocess.CalledProcessError as exc:
            last_error = exc
            has_next = index < len(runners) - 1
            if has_next:
                print(
                    f"Runner {runner_name} failed with exit code {exc.returncode}, trying fallback...",
                    file=sys.stderr,
                    flush=True,
                )

    if last_error is not None:
        raise last_error


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Render Claude prompt typing animation to current directory."
    )
    parser.add_argument("prompt", help="Prompt text to animate.")
    parser.add_argument(
        "--serve-url",
        default=SERVE_URL,
        help=f"Remotion serve URL (default: {SERVE_URL}).",
    )
    parser.add_argument(
        "--composition",
        default=COMPOSITION,
        help=f"Remotion composition id (default: {COMPOSITION}).",
    )
    parser.add_argument(
        "--output-name",
        help="Optional output base name without extension.",
    )
    parser.add_argument(
        "--output-file",
        help="Optional explicit output file path; overrides --output-name.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print commands only without rendering.",
    )
    parser.add_argument(
        "--video-width",
        type=int,
        default=DEFAULT_VIDEO_WIDTH,
        help=f"Video width passed to composition props (default: {DEFAULT_VIDEO_WIDTH}).",
    )
    parser.add_argument(
        "--video-height",
        type=int,
        default=DEFAULT_VIDEO_HEIGHT,
        help=f"Video height passed to composition props (default: {DEFAULT_VIDEO_HEIGHT}).",
    )
    parser.add_argument(
        "--claude-width",
        type=int,
        default=DEFAULT_CLAUDE_WIDTH,
        help=f"Claude window width passed to composition props (default: {DEFAULT_CLAUDE_WIDTH}).",
    )
    parser.add_argument(
        "--fps",
        type=int,
        default=DEFAULT_FPS,
        help=f"Output fps (default: {DEFAULT_FPS}).",
    )
    parser.add_argument(
        "--codec",
        default=DEFAULT_CODEC,
        help=f"Video codec (default: {DEFAULT_CODEC}).",
    )
    parser.add_argument(
        "--prores-profile",
        default=DEFAULT_PRORES_PROFILE,
        help=f"ProRes profile, empty to disable (default: {DEFAULT_PRORES_PROFILE}).",
    )
    parser.add_argument(
        "--audio-codec",
        default=None,
        help="Audio codec, for example aac; omitted by default.",
    )
    parser.add_argument(
        "--pixel-format",
        default=DEFAULT_PIXEL_FORMAT,
        help=f"Pixel format, empty to disable (default: {DEFAULT_PIXEL_FORMAT}).",
    )
    parser.add_argument(
        "--image-format",
        default=DEFAULT_IMAGE_FORMAT,
        help=f"Image format, empty to disable (default: {DEFAULT_IMAGE_FORMAT}).",
    )
    parser.add_argument(
        "--scale",
        type=int,
        default=DEFAULT_SCALE,
        help=f"Render scale (default: {DEFAULT_SCALE}).",
    )
    parser.add_argument(
        "--timeout-ms",
        type=int,
        default=DEFAULT_TIMEOUT_MS,
        help=f"delayRender timeout in milliseconds (default: {DEFAULT_TIMEOUT_MS}).",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=DEFAULT_CONCURRENCY,
        help=f"Render concurrency (default: {DEFAULT_CONCURRENCY}).",
    )
    parser.add_argument(
        "--browser-executable",
        help="Optional explicit Chrome/Chromium executable path.",
    )
    parser.add_argument(
        "--runner-prefix",
        help=(
            "Optional runner command prefix. Example: "
            "\"npx -y -p @remotion/cli@4.0.440 -p @remotion/tailwind-v4@4.0.440 remotion\"."
        ),
    )
    args, extra_render_args = parser.parse_known_args()

    if args.video_width <= 0 or args.video_height <= 0:
        raise RuntimeError("--video-width and --video-height must be positive integers.")
    if args.claude_width <= 0:
        raise RuntimeError("--claude-width must be a positive integer.")
    if args.fps <= 0:
        raise RuntimeError("--fps must be a positive integer.")
    if args.scale <= 0:
        raise RuntimeError("--scale must be a positive integer.")
    if args.timeout_ms <= 0:
        raise RuntimeError("--timeout-ms must be a positive integer.")
    if args.concurrency <= 0:
        raise RuntimeError("--concurrency must be a positive integer.")

    if args.output_file:
        output_file = Path(args.output_file)
    else:
        base_name = args.output_name or condense_prompt(args.prompt)
        output_file = Path.cwd() / f"{base_name}.mov"

    runners = resolve_runners(args.runner_prefix)
    browser_executable = args.browser_executable or detect_browser_executable()
    render_args = build_render_args(
        prompt=args.prompt,
        serve_url=args.serve_url,
        composition=args.composition,
        output_file=output_file,
        video_width=args.video_width,
        video_height=args.video_height,
        claude_width=args.claude_width,
        fps=args.fps,
        codec=args.codec,
        prores_profile=args.prores_profile or None,
        audio_codec=args.audio_codec,
        pixel_format=args.pixel_format or None,
        image_format=args.image_format or None,
        scale=args.scale,
        timeout_ms=args.timeout_ms,
        concurrency=args.concurrency,
        browser_executable=browser_executable,
        extra_render_args=extra_render_args,
    )

    if args.dry_run:
        if browser_executable:
            print(f"Browser executable: {browser_executable}")
        else:
            print("Browser executable: <auto-download by Remotion if needed>")
        for runner_prefix, runner_name in runners:
            cmd = runner_prefix + render_args
            print(f"Runner candidate: {runner_name}")
            print(" ".join(cmd))
        return 0

    run_with_fallback(runners, render_args)
    print(f"Output: {output_file}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except subprocess.CalledProcessError as exc:
        print(f"Render failed with exit code {exc.returncode}", file=sys.stderr)
        raise SystemExit(exc.returncode)
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        raise SystemExit(1)
