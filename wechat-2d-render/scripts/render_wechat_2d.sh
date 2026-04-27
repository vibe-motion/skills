#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/sxhzju/wechat-2d.git}"
REPO_DIR_NAME="${REPO_DIR_NAME:-wechat-2d}"
WORKSPACE_DIR="${1:-$PWD}"
OUTPUT_PATH="${2:-out/wechat-2d-transparent.mov}"
PROPS_FILE="${3:-shared/project/render-presets/default.json}"

if ! command -v git >/dev/null 2>&1; then
  echo "[Error] git is required." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "[Error] node is required." >&2
  exit 1
fi

ensure_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    return 0
  fi

  if ! command -v corepack >/dev/null 2>&1; then
    echo "[Error] pnpm is required. Install pnpm or use a Node.js distribution with corepack." >&2
    exit 1
  fi

  echo "[Skill] pnpm not found; enabling pnpm through corepack"
  corepack enable pnpm
}

mkdir -p "$WORKSPACE_DIR"
cd "$WORKSPACE_DIR"

if [ -d "$REPO_DIR_NAME/.git" ]; then
  echo "[Skill] Reusing existing repo: $REPO_DIR_NAME"
  git -C "$REPO_DIR_NAME" fetch --all --prune

  DEFAULT_BRANCH="$(git -C "$REPO_DIR_NAME" ls-remote --symref origin HEAD 2>/dev/null | awk '/^ref:/ {sub("refs/heads/", "", $2); print $2; exit}')"
  if [ -z "$DEFAULT_BRANCH" ]; then
    DEFAULT_BRANCH="main"
  fi

  git -C "$REPO_DIR_NAME" checkout "$DEFAULT_BRANCH"
  git -C "$REPO_DIR_NAME" pull --ff-only origin "$DEFAULT_BRANCH"
else
  echo "[Skill] Cloning repo: $REPO_URL"
  git clone "$REPO_URL" "$REPO_DIR_NAME"
fi

cd "$REPO_DIR_NAME"

if [ ! -f package.json ]; then
  echo "[Error] package.json not found in $(pwd)" >&2
  exit 1
fi

if [ ! -f "$PROPS_FILE" ]; then
  echo "[Error] props file not found: $PROPS_FILE" >&2
  exit 1
fi

ensure_pnpm

echo "[Skill] Installing dependencies"
pnpm install

mkdir -p "$(dirname "$OUTPUT_PATH")"

echo "[Skill] Preparing shared Remotion browser cache"
pnpm run remotion:ensure-browser

echo "[Skill] Rendering WeChat 2D motion"
REMOTION_OUTPUT="$OUTPUT_PATH" \
REMOTION_PROPS_FILE="$PROPS_FILE" \
pnpm run remotion:render

ABS_OUTPUT="$(cd "$(dirname "$OUTPUT_PATH")" && pwd)/$(basename "$OUTPUT_PATH")"
echo "[Skill] Render completed: $ABS_OUTPUT"
