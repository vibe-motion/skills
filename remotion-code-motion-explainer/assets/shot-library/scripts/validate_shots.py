#!/usr/bin/env python3
"""Validate reusable shot metadata, SRT authority and representative QC frames."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "shot-library.json"
ROOT_TSX = ROOT / "src" / "Root.tsx"
TIMELINE = ROOT / "public" / "data" / "srt-timeline.json"
BROWSER_CANDIDATES = [
    Path.home()
    / "Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell",
    Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
]


def check_timeline(timeline: dict) -> list[str]:
    errors: list[str] = []
    if timeline.get("authority") != "srt":
        errors.append("timeline.authority 必须是 srt")
    fps = int(timeline.get("fps", 0))
    if fps <= 0:
        errors.append("timeline.fps 无效")
    previous_end = 0
    ids: set[str] = set()
    for index, beat in enumerate(timeline.get("beats", []), start=1):
        beat_id = str(beat.get("id", ""))
        if not beat_id or beat_id in ids:
            errors.append(f"字幕段 {index} ID 缺失或重复")
        ids.add(beat_id)
        if beat.get("caption", {}).get("text") != beat.get("text"):
            errors.append(f"{beat_id}: caption.text 与 SRT 正文不一致")
        if int(beat.get("from", -1)) < previous_end:
            errors.append(f"{beat_id}: 时间与前一字幕重叠")
        if int(beat.get("duration", 0)) <= 0:
            errors.append(f"{beat_id}: duration 无效")
        if not beat.get("visual", {}).get("composition"):
            errors.append(f"{beat_id}: 缺少镜头推荐")
        if not beat.get("audio", {}).get("bgm", {}).get("instrumentalOnly", True):
            errors.append(f"{beat_id}: BGM 未声明纯乐器")
        if not beat.get("transition", {}).get("in"):
            errors.append(f"{beat_id}: 缺少转场")
        previous_end = int(beat.get("end", previous_end))
    if previous_end > int(timeline.get("durationInFrames", 0)):
        errors.append("timeline.durationInFrames 小于最后一条字幕")
    return errors


def render_frames(compositions: list[tuple[str, int]], output_dir: Path) -> list[dict]:
    output_dir.mkdir(parents=True, exist_ok=True)
    binary = ROOT / "node_modules" / ".bin" / "remotion"
    if not binary.exists():
        return [{"ok": False, "error": "Remotion CLI 不存在，无法渲染 QC 帧"}]
    browser = next((path for path in BROWSER_CANDIDATES if path.exists()), None)
    rows = []
    for composition, duration in compositions:
        for phase, frame in (
            ("entry", min(8, max(0, duration - 1))),
            ("middle", max(0, duration // 2)),
            ("exit", max(0, duration - 2)),
        ):
            output = output_dir / f"{composition}-{phase}-{frame}.png"
            command = [
                    str(binary),
                    "still",
                    "src/index.ts",
                    composition,
                    str(output),
                    "--frame",
                    str(frame),
                    "--scale",
                    "0.25",
                    "--overwrite",
                ]
            if browser:
                command.append(f"--browser-executable={browser}")
            result = subprocess.run(
                command,
                cwd=ROOT,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
            )
            rows.append(
                {
                    "composition": composition,
                    "phase": phase,
                    "frame": frame,
                    "path": str(output),
                    "ok": result.returncode == 0 and output.exists(),
                    "log": "\n".join(result.stdout.splitlines()[-8:]),
                }
            )
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--render", action="store_true")
    args = parser.parse_args()

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    timeline = json.loads(TIMELINE.read_text(encoding="utf-8"))
    root_text = ROOT_TSX.read_text(encoding="utf-8")
    registered = set(re.findall(r'id="([^"]+)"', root_text))
    errors = check_timeline(timeline)
    warnings: list[str] = []
    seen_ids: set[str] = set()
    for shot in manifest:
        shot_id = shot.get("id")
        if not shot_id or shot_id in seen_ids:
            errors.append(f"镜头 ID 缺失或重复: {shot_id}")
        seen_ids.add(shot_id)
        composition = shot.get("composition")
        if composition not in registered:
            errors.append(f"{shot_id}: Composition 未在 Root.tsx 注册: {composition}")
        if not shot.get("tags") or not shot.get("category"):
            errors.append(f"{shot_id}: 标签或分类缺失")
        preview = ROOT / str(shot.get("preview", ""))
        if not preview.exists():
            warnings.append(f"{shot_id}: 预览尚未生成")
        if shot.get("production_status") == "生产版":
            for field in ("parameters", "supported_inputs", "transition_contract", "version"):
                if not shot.get(field):
                    errors.append(f"{shot_id}: 生产版缺少 {field}")

    qc = []
    if args.render:
        qc = render_frames(
            [
                ("WideKnowledgeWorld", int(timeline["durationInFrames"])),
                ("SrtDrivenVideo", int(timeline["durationInFrames"])),
            ],
            ROOT / "qc" / "shots",
        )
        errors.extend(
            f"{row.get('composition', 'QC')}-{row.get('phase', '')}: 渲染失败"
            for row in qc
            if not row.get("ok")
        )

    report = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "ok": not errors,
        "manifestCount": len(manifest),
        "registeredCompositions": len(registered),
        "timelineBeats": len(timeline.get("beats", [])),
        "errors": errors,
        "warnings": warnings,
        "qcFrames": qc,
    }
    output_dir = ROOT / "qc"
    output_dir.mkdir(exist_ok=True)
    (output_dir / "shot-validation.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    lines = [
        "# 镜头库自动验收",
        "",
        f"- 结果：{'通过' if report['ok'] else '失败'}",
        f"- 镜头清单：{len(manifest)}",
        f"- 注册 Composition：{len(registered)}",
        f"- SRT 字幕段：{len(timeline.get('beats', []))}",
        "",
        "## 错误",
        *(f"- {row}" for row in errors),
        "",
        "## 提醒",
        *(f"- {row}" for row in warnings),
    ]
    (output_dir / "shot-validation.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))
    raise SystemExit(0 if report["ok"] else 1)


if __name__ == "__main__":
    main()
