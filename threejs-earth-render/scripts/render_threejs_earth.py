#!/usr/local/bin/python3
"""Clone/update threejs-earth and render it via Puppeteer frame capture."""

from __future__ import annotations

import argparse
import contextlib
import functools
import http.server
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
from pathlib import Path

DEFAULT_REPO_URL = "https://github.com/vibe-motion/threejs-earth.git"
DEFAULT_BRANCH = "main"
DEFAULT_REPO_DIR = "threejs-earth"
DEFAULT_OUTPUT = "out/threejs-earth.gif"
DEFAULT_FPS = 30
DEFAULT_OUTPUT_WIDTH = 448


def run(cmd: list[str], cwd: Path | None = None, env: dict[str, str] | None = None) -> None:
    shown_cwd = str(cwd) if cwd else os.getcwd()
    print(f"[cmd] (cwd={shown_cwd}) {' '.join(cmd)}", flush=True)
    subprocess.run(cmd, cwd=cwd, env=env, check=True)


def require_command(name: str) -> str:
    path = shutil.which(name)
    if not path:
        raise RuntimeError(f"{name} is required but was not found in PATH.")
    return path


def resolve_output_path(value: str) -> Path:
    output = Path(value).expanduser()
    if output.is_absolute():
        return output
    return (Path.cwd() / output).resolve()


def ensure_repo(
    repo_url: str,
    branch: str,
    workspace: Path,
    repo_dir: str,
    skip_update: bool,
) -> Path:
    workspace.mkdir(parents=True, exist_ok=True)
    repo_path = workspace / repo_dir

    if (repo_path / ".git").exists():
        if skip_update:
            print(f"[Skill] Reusing existing repo without update: {repo_path}", flush=True)
            return repo_path
        run(["git", "fetch", "origin"], cwd=repo_path)
        run(["git", "checkout", branch], cwd=repo_path)
        run(["git", "pull", "--ff-only", "origin", branch], cwd=repo_path)
        return repo_path

    if repo_path.exists():
        raise RuntimeError(f"Path exists but is not a git repo: {repo_path}")

    run(["git", "clone", "--branch", branch, repo_url, repo_dir], cwd=workspace)
    return repo_path


def find_free_port(host: str = "127.0.0.1") -> int:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
        sock.bind((host, 0))
        return int(sock.getsockname()[1])


class QuietHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        return


@contextlib.contextmanager
def serve_directory(directory: Path):
    host = "127.0.0.1"
    port = find_free_port(host)
    handler = functools.partial(QuietHTTPRequestHandler, directory=str(directory))
    server = http.server.ThreadingHTTPServer((host, port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://{host}:{port}/index.html"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def ensure_puppeteer(tool_dir: Path, capture_script_source: Path, skip_install: bool) -> Path:
    tool_dir.mkdir(parents=True, exist_ok=True)
    package_json = tool_dir / "package.json"
    capture_script = tool_dir / "capture_threejs_earth.mjs"

    package_json.write_text(
        json.dumps(
            {
                "private": True,
                "type": "module",
                "dependencies": {"puppeteer": "^24.0.0"},
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    shutil.copyfile(capture_script_source, capture_script)

    if not skip_install and not (tool_dir / "node_modules" / "puppeteer").exists():
        run(["npm", "install", "--silent"], cwd=tool_dir)

    return capture_script


def infer_format(output: Path, requested_format: str) -> str:
    if requested_format != "auto":
        return requested_format
    suffix = output.suffix.lower()
    if suffix == ".gif":
        return "gif"
    if suffix in {".mp4", ".m4v"}:
        return "mp4"
    return "frames"


def ffmpeg_input_args(fps: int, start_frame: int, frames_dir: Path) -> list[str]:
    return [
        "-framerate",
        str(fps),
        "-start_number",
        str(start_frame),
        "-i",
        str(frames_dir / "frame-%04d.png"),
    ]


def encode_gif(frames_dir: Path, output: Path, fps: int, start_frame: int, output_width: int) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="threejs-earth-palette-") as temp_dir:
        palette = Path(temp_dir) / "palette.png"
        scale = (
            f"scale={output_width}:-1:flags=lanczos,"
            if output_width and output_width > 0
            else ""
        )
        run(
            ["ffmpeg", "-y"]
            + ffmpeg_input_args(fps, start_frame, frames_dir)
            + ["-vf", f"{scale}palettegen=stats_mode=diff", "-frames:v", "1", str(palette)]
        )
        if output_width and output_width > 0:
            paletteuse_filter = (
                f"[0:v]scale={output_width}:-1:flags=lanczos[x];"
                "[x][1:v]paletteuse=dither=bayer:bayer_scale=3"
            )
        else:
            paletteuse_filter = "[0:v][1:v]paletteuse=dither=bayer:bayer_scale=3"
        run(
            ["ffmpeg", "-y"]
            + ffmpeg_input_args(fps, start_frame, frames_dir)
            + [
                "-i",
                str(palette),
                "-filter_complex",
                paletteuse_filter,
                "-loop",
                "0",
                str(output),
            ]
        )


def encode_mp4(frames_dir: Path, output: Path, fps: int, start_frame: int, output_width: int) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    args = ["ffmpeg", "-y"] + ffmpeg_input_args(fps, start_frame, frames_dir)
    if output_width and output_width > 0:
        args += ["-vf", f"scale={output_width}:-2:flags=lanczos"]
    args += [
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(output),
    ]
    run(args)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Clone/update threejs-earth and render a GIF/MP4/PNG sequence with Puppeteer."
    )
    parser.add_argument("--workspace", default=".", help="Workspace directory for repo checkout")
    parser.add_argument("--repo-url", default=DEFAULT_REPO_URL, help="Git repository URL")
    parser.add_argument("--branch", default=DEFAULT_BRANCH, help="Git branch to pull")
    parser.add_argument("--repo-dir", default=DEFAULT_REPO_DIR, help="Local directory name for checkout")
    parser.add_argument("--skip-update", action="store_true", help="Reuse existing repo without fetching")
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="Output .gif/.mp4 path")
    parser.add_argument(
        "--format",
        choices=["auto", "gif", "mp4", "frames"],
        default="auto",
        help="Output format; auto uses the output extension",
    )
    parser.add_argument("--frames-dir", default="", help="Directory for captured PNG frames")
    parser.add_argument("--keep-frames", action="store_true", help="Keep temporary PNG frames")
    parser.add_argument("--start-frame", type=int, default=0, help="First frame to capture")
    parser.add_argument("--end-frame", type=int, default=-1, help="Last frame to capture; -1 means all")
    parser.add_argument("--fps", type=int, default=DEFAULT_FPS, help="Frame rate for encoding")
    parser.add_argument("--render-scale", type=int, default=1, help="Three.js native render scale")
    parser.add_argument(
        "--output-width",
        type=int,
        default=DEFAULT_OUTPUT_WIDTH,
        help="Encoded output width; 0 keeps native capture size",
    )
    parser.add_argument("--timeout-ms", type=int, default=120000, help="Puppeteer page timeout")
    parser.add_argument("--skip-puppeteer-install", action="store_true", help="Skip npm install")
    parser.add_argument("--puppeteer-executable", default="", help="Optional Chrome/Chromium executable path")
    parser.add_argument("--verbose-browser", action="store_true", help="Forward browser console logs")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    require_command("git")
    require_command("node")
    require_command("npm")

    output_path = resolve_output_path(args.output)
    output_format = infer_format(output_path, args.format)
    if output_format in {"gif", "mp4"}:
        require_command("ffmpeg")

    workspace = Path(args.workspace).expanduser().resolve()
    repo_path = ensure_repo(
        repo_url=args.repo_url,
        branch=args.branch,
        workspace=workspace,
        repo_dir=args.repo_dir,
        skip_update=args.skip_update,
    )

    script_dir = Path(__file__).resolve().parent
    tool_dir = workspace / ".threejs-earth-renderer"
    capture_script = ensure_puppeteer(
        tool_dir=tool_dir,
        capture_script_source=script_dir / "capture_threejs_earth.mjs",
        skip_install=args.skip_puppeteer_install,
    )

    explicit_frames_dir = bool(args.frames_dir)
    if explicit_frames_dir:
        frames_dir = Path(args.frames_dir).expanduser().resolve()
        frames_dir.mkdir(parents=True, exist_ok=True)
        temp_context = contextlib.nullcontext(str(frames_dir))
    else:
        temp_context = tempfile.TemporaryDirectory(prefix="threejs-earth-frames-")

    with temp_context as temp_frames:
        frames_dir = Path(temp_frames).resolve()
        end_frame = args.end_frame
        if end_frame < 0:
            end_frame = 1000000

        with serve_directory(repo_path) as url:
            config_path = tool_dir / "capture-config.json"
            config = {
                "url": url,
                "framesDir": str(frames_dir),
                "startFrame": max(0, args.start_frame),
                "endFrame": end_frame,
                "renderScale": max(1, args.render_scale),
                "timeoutMs": args.timeout_ms,
                "executablePath": args.puppeteer_executable,
                "verbose": args.verbose_browser,
            }
            config_path.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
            run(["node", str(capture_script), str(config_path)], cwd=tool_dir)

        if output_format == "gif":
            encode_gif(frames_dir, output_path, args.fps, max(0, args.start_frame), args.output_width)
            print(f"OUTPUT_GIF={output_path}", flush=True)
        elif output_format == "mp4":
            encode_mp4(frames_dir, output_path, args.fps, max(0, args.start_frame), args.output_width)
            print(f"OUTPUT_VIDEO={output_path}", flush=True)
        else:
            if not explicit_frames_dir:
                output_path.mkdir(parents=True, exist_ok=True)
                for png in frames_dir.glob("frame-*.png"):
                    shutil.copy2(png, output_path / png.name)
                info_file = frames_dir / "scene-info.json"
                if info_file.exists():
                    shutil.copy2(info_file, output_path / info_file.name)
                frames_dir = output_path
            print(f"OUTPUT_FRAMES_DIR={frames_dir}", flush=True)

        if args.keep_frames and not explicit_frames_dir and output_format != "frames":
            keep_dir = output_path.with_suffix("").parent / f"{output_path.stem}-frames"
            if keep_dir.exists():
                shutil.rmtree(keep_dir)
            shutil.copytree(frames_dir, keep_dir)
            print(f"OUTPUT_FRAMES_DIR={keep_dir.resolve()}", flush=True)

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("\n[Error] Interrupted.", file=sys.stderr)
        raise SystemExit(130)
