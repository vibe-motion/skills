#!/usr/bin/env python3
"""Clone or update 3D-Chladni and invoke its deterministic video exporter."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path


DEFAULT_REPO_URL = "https://github.com/nolangz/3D-Chladni.git"
DEFAULT_BRANCH = "main"
DEFAULT_REPO_DIR = "3D-Chladni"
DEFAULT_OUTPUT = "out/3d-chladni-cosmic.mp4"
STYLE_ALIASES = {
    "sand": "sand",
    "dynamic-sand": "sand",
    "msand": "msand",
    "modal-sand": "msand",
    "cosmic": "cosmic",
    "cosmic-web": "cosmic",
    "dcosmic": "dcosmic",
    "dynamic-cosmic": "dcosmic",
}


def run(
    command: list[str],
    cwd: Path | None = None,
    *,
    capture: bool = False,
) -> subprocess.CompletedProcess[str]:
    shown_cwd = str(cwd) if cwd else os.getcwd()
    print(f"[cmd] (cwd={shown_cwd}) {' '.join(command)}", flush=True)
    return subprocess.run(
        command,
        cwd=cwd,
        check=True,
        text=True,
        capture_output=capture,
    )


def require_command(name: str) -> str:
    path = shutil.which(name)
    if not path:
        raise RuntimeError(f"{name} is required but was not found in PATH.")
    return path


def resolve_output_path(value: str) -> Path:
    output = Path(value).expanduser()
    if output.is_absolute():
        return output.resolve()
    return (Path.cwd() / output).resolve()


def resolve_input_file(value: str, label: str) -> Path:
    path = Path(value).expanduser().resolve()
    if not path.is_file():
        raise RuntimeError(f"{label} file is unavailable: {path}")
    return path


def validate_repo_dir(value: str) -> str:
    path = Path(value)
    if path.is_absolute() or len(path.parts) != 1 or value in {"", ".", ".."}:
        raise RuntimeError("--repo-dir must be one directory name inside --workspace.")
    return value


def ensure_repo(
    repo_url: str,
    branch: str,
    workspace: Path,
    repo_dir: str,
    skip_update: bool,
) -> Path:
    if (
        (workspace / ".git").exists()
        and (workspace / "package.json").is_file()
        and (workspace / "scripts" / "export-video.cjs").is_file()
    ):
        repo_path = workspace
        if skip_update:
            print(f"[Skill] Reusing existing repo without update: {repo_path}", flush=True)
            return repo_path
        dirty = run(["git", "status", "--porcelain"], cwd=repo_path, capture=True).stdout.strip()
        if dirty:
            raise RuntimeError(
                f"Checkout has local changes: {repo_path}. Commit them or rerun with --skip-update."
            )
        run(["git", "fetch", "origin", branch], cwd=repo_path)
        run(["git", "checkout", branch], cwd=repo_path)
        run(["git", "pull", "--ff-only", "origin", branch], cwd=repo_path)
        return repo_path

    workspace.mkdir(parents=True, exist_ok=True)
    repo_path = workspace / validate_repo_dir(repo_dir)

    if (repo_path / ".git").exists():
        if skip_update:
            print(f"[Skill] Reusing existing repo without update: {repo_path}", flush=True)
            return repo_path

        dirty = run(["git", "status", "--porcelain"], cwd=repo_path, capture=True).stdout.strip()
        if dirty:
            raise RuntimeError(
                f"Checkout has local changes: {repo_path}. Commit them or rerun with --skip-update."
            )
        run(["git", "fetch", "origin", branch], cwd=repo_path)
        run(["git", "checkout", branch], cwd=repo_path)
        run(["git", "pull", "--ff-only", "origin", branch], cwd=repo_path)
        return repo_path

    if repo_path.exists():
        raise RuntimeError(f"Path exists but is not a git repository: {repo_path}")

    run(["git", "clone", "--branch", branch, repo_url, repo_dir], cwd=workspace)
    return repo_path


def ensure_dependencies(repo_path: Path, skip_install: bool, force_install: bool) -> None:
    electron = repo_path / "node_modules" / ".bin" / "electron"
    if electron.exists() and not force_install:
        print(f"[Skill] Reusing installed dependencies: {repo_path / 'node_modules'}", flush=True)
        return
    if skip_install:
        raise RuntimeError(
            f"Electron dependencies are missing in {repo_path}. Rerun without --skip-install."
        )
    run(["npm", "ci"], cwd=repo_path)


def validate_options(args: argparse.Namespace, output: Path) -> None:
    if args.width < 64 or args.width > 8192 or args.width % 2:
        raise RuntimeError("--width must be an even integer between 64 and 8192.")
    if args.height < 64 or args.height > 8192 or args.height % 2:
        raise RuntimeError("--height must be an even integer between 64 and 8192.")
    if args.fps < 1 or args.fps > 240:
        raise RuntimeError("--fps must be between 1 and 240.")
    if args.seconds <= 0 or args.seconds > 3600:
        raise RuntimeError("--seconds must be greater than 0 and no more than 3600.")
    if args.particles < 0.01 or args.particles > 1:
        raise RuntimeError("--particles must be between 0.01 and 1.")
    if args.light < 0 or args.light > 9:
        raise RuntimeError("--light must be between 0 and 9.")
    if args.rotation_speed < 0 or args.rotation_speed > 10:
        raise RuntimeError("--rotation-speed must be between 0 and 10.")
    if output.suffix.lower() not in {".mp4", ".mov"}:
        raise RuntimeError("--output must end in .mp4 or .mov.")
    if args.alpha and output.suffix.lower() != ".mov":
        raise RuntimeError("--alpha requires a .mov output path.")
    if args.codec == "h264" and output.suffix.lower() != ".mp4":
        raise RuntimeError("--codec h264 requires a .mp4 output path.")
    if args.codec == "prores" and output.suffix.lower() != ".mov":
        raise RuntimeError("--codec prores requires a .mov output path.")


def build_export_command(
    args: argparse.Namespace,
    output: Path,
    audio: Path | None,
    pattern: Path | None,
) -> list[str]:
    command = [
        "npm",
        "run",
        "export:video",
        "--",
        "--output",
        str(output),
        "--style",
        STYLE_ALIASES[args.style],
        "--width",
        str(args.width),
        "--height",
        str(args.height),
        "--fps",
        str(args.fps),
        "--seconds",
        str(args.seconds),
        "--seed",
        str(args.seed),
        "--particles",
        str(args.particles),
        "--light",
        str(args.light),
    ]
    if args.codec:
        command.extend(["--codec", args.codec])
    if audio:
        command.extend(["--audio", str(audio)])
    if pattern:
        command.extend(["--pattern", str(pattern)])
    if args.no_rotation:
        command.append("--no-rotation")
    else:
        command.extend(
            ["--rotation", args.rotation, "--rotation-speed", str(args.rotation_speed)]
        )
    if args.alpha:
        command.append("--alpha")
    return command


def verify_output(output: Path, width: int, height: int, expect_audio: bool) -> None:
    if not output.is_file() or output.stat().st_size == 0:
        raise RuntimeError(f"Renderer did not create a non-empty output: {output}")

    probe = run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration:stream=codec_type,codec_name,width,height",
            "-of",
            "json",
            str(output),
        ],
        capture=True,
    )
    metadata = json.loads(probe.stdout)
    streams = metadata.get("streams", [])
    videos = [stream for stream in streams if stream.get("codec_type") == "video"]
    audios = [stream for stream in streams if stream.get("codec_type") == "audio"]
    if not videos:
        raise RuntimeError(f"No video stream found in output: {output}")
    video = videos[0]
    if video.get("width") != width or video.get("height") != height:
        raise RuntimeError(
            f"Unexpected output dimensions: {video.get('width')}x{video.get('height')}"
        )
    if expect_audio and not audios:
        raise RuntimeError(f"No audio stream found in audio-driven output: {output}")

    duration = float(metadata.get("format", {}).get("duration", 0))
    if duration <= 0:
        raise RuntimeError(f"Invalid output duration: {duration}")
    print(
        "VALIDATION=PASS "
        f"video={video.get('codec_name')} size={width}x{height} "
        f"duration={duration:.3f}s audio={'yes' if audios else 'no'}",
        flush=True,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Clone/update 3D-Chladni and export deterministic MP4 or ProRes MOV motion."
    )
    parser.add_argument(
        "--workspace",
        default=".",
        help="Parent workspace for cloning, or an existing 3D-Chladni checkout",
    )
    parser.add_argument("--repo-url", default=DEFAULT_REPO_URL, help="Source Git repository URL")
    parser.add_argument("--branch", default=DEFAULT_BRANCH, help="Source branch to use")
    parser.add_argument("--repo-dir", default=DEFAULT_REPO_DIR, help="Checkout directory name")
    parser.add_argument("--skip-update", action="store_true", help="Preserve an existing checkout")
    parser.add_argument("--skip-install", action="store_true", help="Do not install npm dependencies")
    parser.add_argument("--force-install", action="store_true", help="Run npm ci even if Electron exists")
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="Output .mp4 or .mov path")
    parser.add_argument("--style", choices=sorted(STYLE_ALIASES), default="cosmic")
    parser.add_argument("--width", type=int, default=1280)
    parser.add_argument("--height", type=int, default=720)
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("--seconds", type=float, default=6)
    parser.add_argument("--seed", type=int, default=20260710)
    parser.add_argument("--particles", type=float, default=0.15)
    parser.add_argument("--light", type=int, default=9)
    parser.add_argument("--rotation", choices=["single", "tumble", "precess"], default="precess")
    parser.add_argument("--rotation-speed", type=float, default=1.0)
    parser.add_argument("--no-rotation", action="store_true")
    parser.add_argument("--audio", default="", help="Optional audio file for reactive motion")
    parser.add_argument("--pattern", default="", help="Optional Chladni pattern JSON")
    parser.add_argument("--codec", choices=["h264", "prores"], default="")
    parser.add_argument("--alpha", action="store_true", help="Export transparent ProRes 4444 MOV")
    parser.add_argument("--dry-run", action="store_true", help="Print the exporter command only")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    require_command("git")
    require_command("npm")

    output = resolve_output_path(args.output)
    validate_options(args, output)
    audio = resolve_input_file(args.audio, "Audio") if args.audio else None
    pattern = resolve_input_file(args.pattern, "Pattern") if args.pattern else None
    workspace = Path(args.workspace).expanduser().resolve()
    repo_path = ensure_repo(
        repo_url=args.repo_url,
        branch=args.branch,
        workspace=workspace,
        repo_dir=args.repo_dir,
        skip_update=args.skip_update,
    )
    command = build_export_command(args, output, audio, pattern)

    if args.dry_run:
        print(f"DRY_RUN_COMMAND={' '.join(command)}", flush=True)
        return 0

    require_command("ffmpeg")
    require_command("ffprobe")
    ensure_dependencies(repo_path, args.skip_install, args.force_install)
    run(command, cwd=repo_path)
    verify_output(output, args.width, args.height, audio is not None)
    print(f"OUTPUT_VIDEO={output}", flush=True)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("\n[Error] Interrupted.", file=sys.stderr)
        raise SystemExit(130)
    except (RuntimeError, subprocess.CalledProcessError, json.JSONDecodeError) as error:
        print(f"[Error] {error}", file=sys.stderr)
        raise SystemExit(1)
