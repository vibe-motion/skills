#!/usr/bin/env python3
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHOTS = json.loads((ROOT / "shot-library.json").read_text(encoding="utf-8"))
(ROOT / "previews").mkdir(parents=True, exist_ok=True)
only_missing = "--only-missing" in sys.argv
BROWSER_CANDIDATES = [
    Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
    Path.home()
    / "Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell",
]
browser = next((path for path in BROWSER_CANDIDATES if path.exists()), None)

for shot in SHOTS:
    target = ROOT / shot["preview"]
    if only_missing and target.exists():
        print(f"Skipping existing preview: {target.name}")
        continue
    command = [
        str(ROOT / "node_modules" / ".bin" / "remotion"), "render",
        shot["composition"], str(target), "--scale=0.4", "--codec=h264",
        "--crf=25", "--concurrency=1", "--timeout=120000",
    ]
    if browser:
        command.append(f"--browser-executable={browser}")
    print(f"Rendering {shot['composition']} -> {target.name}")
    subprocess.run(command, cwd=ROOT, check=True)
