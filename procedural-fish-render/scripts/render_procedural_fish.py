#!/usr/local/bin/python3
"""Clone/update procedural-fish repo and render video with the project's command."""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
from pathlib import Path

DEFAULT_REPO_URL = "https://github.com/vibe-motion/procedural-fish.git"
DEFAULT_BRANCH = "main"
DEFAULT_REPO_DIR = "procedural-fish"
DEFAULT_OUTPUT = "out/procedural-fish-transparent.mov"
DEFAULT_PROPS_FILE = "shared/project/render-presets/default.json"


def run(cmd: list[str], cwd: Path | None = None, env: dict[str, str] | None = None) -> None:
    shown_cwd = str(cwd) if cwd else os.getcwd()
    print(f"[cmd] (cwd={shown_cwd}) {' '.join(cmd)}")
    subprocess.run(cmd, cwd=cwd, env=env, check=True)


def resolve_pnpm_cmd() -> list[str]:
    if shutil.which("pnpm"):
        return ["pnpm"]
    if shutil.which("corepack"):
        return ["corepack", "pnpm"]
    raise RuntimeError("pnpm/corepack not found. Install pnpm or enable corepack first.")


def ensure_repo(repo_url: str, branch: str, workspace: Path, repo_dir: str) -> Path:
    workspace.mkdir(parents=True, exist_ok=True)
    repo_path = workspace / repo_dir

    if (repo_path / ".git").exists():
        run(["git", "fetch", "origin"], cwd=repo_path)
        run(["git", "checkout", branch], cwd=repo_path)
        run(["git", "pull", "--ff-only", "origin", branch], cwd=repo_path)
        return repo_path

    if repo_path.exists():
        raise RuntimeError(f"Path exists but is not a git repo: {repo_path}")

    run(["git", "clone", "--branch", branch, repo_url, repo_dir], cwd=workspace)
    return repo_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Clone/update procedural-fish and render video with pnpm run remotion:render"
    )
    parser.add_argument("--workspace", default=".", help="Workspace directory for repo checkout")
    parser.add_argument("--repo-url", default=DEFAULT_REPO_URL, help="Git repository URL")
    parser.add_argument("--branch", default=DEFAULT_BRANCH, help="Git branch to pull")
    parser.add_argument("--repo-dir", default=DEFAULT_REPO_DIR, help="Local directory name for checkout")
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="REMOTION_OUTPUT relative to repo root")
    parser.add_argument(
        "--props-file",
        default=DEFAULT_PROPS_FILE,
        help="REMOTION_PROPS_FILE relative to repo root; empty string disables it",
    )
    parser.add_argument("--props-json", default="", help="REMOTION_PROPS_JSON value")
    parser.add_argument("--composition-id", default="", help="REMOTION_COMPOSITION_ID override")
    parser.add_argument("--fps", default="", help="REMOTION_FPS override")
    parser.add_argument("--skip-install", action="store_true", help="Skip pnpm install")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    workspace = Path(args.workspace).expanduser().resolve()

    repo_path = ensure_repo(
        repo_url=args.repo_url,
        branch=args.branch,
        workspace=workspace,
        repo_dir=args.repo_dir,
    )

    pnpm_cmd = resolve_pnpm_cmd()

    if not args.skip_install:
        run(pnpm_cmd + ["install"], cwd=repo_path)

    env = os.environ.copy()
    env["REMOTION_OUTPUT"] = args.output

    if args.props_file:
        env["REMOTION_PROPS_FILE"] = args.props_file
    else:
        env.pop("REMOTION_PROPS_FILE", None)

    if args.props_json:
        env["REMOTION_PROPS_JSON"] = args.props_json
    else:
        env.pop("REMOTION_PROPS_JSON", None)

    if args.composition_id:
        env["REMOTION_COMPOSITION_ID"] = args.composition_id
    else:
        env.pop("REMOTION_COMPOSITION_ID", None)

    if args.fps:
        env["REMOTION_FPS"] = args.fps
    else:
        env.pop("REMOTION_FPS", None)

    run(pnpm_cmd + ["run", "remotion:render"], cwd=repo_path, env=env)

    output_path = (repo_path / args.output).resolve()
    print(f"OUTPUT_VIDEO={output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
