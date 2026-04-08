#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/sxhzju/ruler-progress-animator.git}"
REPO_DIR_NAME="${REPO_DIR_NAME:-ruler-progress-animator}"
WORKSPACE_DIR="${1:-$PWD}"
OUTPUT_PATH="${2:-out/scaffold-demo-defaults-transparent.mov}"

if ! command -v git >/dev/null 2>&1; then
  echo "[Error] git is required." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "[Error] node is required." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[Error] npm is required." >&2
  exit 1
fi

mkdir -p "$WORKSPACE_DIR"
cd "$WORKSPACE_DIR"

if [ -d "$REPO_DIR_NAME/.git" ]; then
  echo "[Skill] Reusing existing repo: $REPO_DIR_NAME"
  git -C "$REPO_DIR_NAME" fetch --all --prune

  DEFAULT_BRANCH="$(git ls-remote --symref origin HEAD 2>/dev/null | awk '/^ref:/ {sub("refs/heads/", "", $2); print $2; exit}')"
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

echo "[Skill] Installing dependencies"
npm install

mkdir -p "$(dirname "$OUTPUT_PATH")"

if command -v bunx >/dev/null 2>&1; then
  echo "[Skill] Preparing shared Remotion browser cache"
  npm run remotion:ensure-browser

  echo "[Skill] Rendering via new scaffold npm scripts (shared browser enabled)"
  REMOTION_OUTPUT="$OUTPUT_PATH" \
  REMOTION_PROPS_FILE="shared/project/render-presets/default.json" \
  npm run remotion:render
else
  echo "[Skill] bunx not found; fallback to npx remotion (without shared browser cache optimization)"

  COMPOSITION_ID="$(node --input-type=module -e "import { ACTIVE_COMPOSITION_ID } from './shared/project/projectConfig.js'; process.stdout.write(ACTIVE_COMPOSITION_ID)")"
  PROPS_JSON="$(node --input-type=module -e "import { readFileSync } from 'node:fs'; const props = JSON.parse(readFileSync('./shared/project/render-presets/default.json','utf8')); process.stdout.write(JSON.stringify(props))")"

  npx remotion render \
    "$COMPOSITION_ID" \
    "$OUTPUT_PATH" \
    --codec prores \
    --prores-profile 4444 \
    --pixel-format yuva444p10le \
    --image-format png \
    --scale 2 \
    --props "$PROPS_JSON"
fi

ABS_OUTPUT="$(cd "$(dirname "$OUTPUT_PATH")" && pwd)/$(basename "$OUTPUT_PATH")"
echo "[Skill] Render completed: $ABS_OUTPUT"
