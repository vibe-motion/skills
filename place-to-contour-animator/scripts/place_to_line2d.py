#!/usr/local/bin/python3
"""Generate godot_line2d_v1 contour JSON from a place name.

This wrapper calls the project exporter:
  universal/export_outer_contour.ts
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

DEFAULT_REPO = Path("/Users/zhangluyi/Downloads/charts")
EXPORTER_RELATIVE_PATH = Path("universal/export_outer_contour.ts")

JAPAN_NO_HOKKAIDO_ALIASES = {
    "japan",
    "nippon",
    "nihon",
    "日本",
    "日本本岛",
    "日本本州",
    "本州",
    "本州岛",
    "日本岛",
}

PLACE_TO_COUNTRY_NAME = {
    "日本": "Japan",
    "japan": "Japan",
    "indonesia": "Indonesia",
    "印度尼西亚": "Indonesia",
    "china": "China",
    "中国": "China",
    "unitedstates": "United States of America",
    "usa": "United States of America",
    "美国": "United States of America",
    "uk": "United Kingdom",
    "unitedkingdom": "United Kingdom",
    "英国": "United Kingdom",
}


def normalize_place(text: str) -> str:
    return re.sub(r"\s+", "", text.strip().lower())


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", text.strip().lower())
    slug = slug.strip("_")
    return slug or "region"


def resolve_country_name(place: str) -> str:
    normalized = normalize_place(place)
    if normalized in PLACE_TO_COUNTRY_NAME:
        return PLACE_TO_COUNTRY_NAME[normalized]
    return place.strip()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Generate line2d.json by place name using universal/export_outer_contour.ts",
    )
    parser.add_argument("place", help="Place or country name, e.g. 日本 / Japan / Indonesia")
    parser.add_argument("--repo", default=str(DEFAULT_REPO), help="charts repository path")
    parser.add_argument("--output", help="Output file path (default under universal/) ")
    parser.add_argument("--country-name", help="Override country name passed to exporter")
    parser.add_argument("--country-id", help="Use topology numeric id instead of country name")
    parser.add_argument("--region-id", help="Output region id")
    parser.add_argument("--region-name", help="Output region name")
    parser.add_argument(
        "--component-centroid-lat-max",
        type=float,
        help="Override max component centroid latitude filter",
    )
    parser.add_argument("--keep-all-loops", action="store_true", help="Export all boundary loops")
    parser.add_argument("--dry-run", action="store_true", help="Print command only")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    repo = Path(args.repo).expanduser().resolve()
    exporter = repo / EXPORTER_RELATIVE_PATH

    if not repo.exists():
        print(f"[ERROR] Repo not found: {repo}", file=sys.stderr)
        return 1
    if not exporter.exists():
        print(f"[ERROR] Exporter not found: {exporter}", file=sys.stderr)
        return 1

    normalized_place = normalize_place(args.place)
    is_japan_mainland_mode = normalized_place in JAPAN_NO_HOKKAIDO_ALIASES

    country_name = args.country_name or resolve_country_name(args.place)
    output_stem = (
        "japan_mainland_no_hokkaido_outer_line2d"
        if is_japan_mainland_mode and not args.country_name and not args.country_id
        else f"{slugify(country_name)}_outer_line2d"
    )

    default_output = repo / "universal" / f"{output_stem}.json"
    output_path = Path(args.output).expanduser().resolve() if args.output else default_output
    output_path.parent.mkdir(parents=True, exist_ok=True)

    region_id = args.region_id or output_stem
    region_name = args.region_name or (
        "Japan Mainland (No Hokkaido) Outer Contour"
        if is_japan_mainland_mode and not args.country_name and not args.country_id
        else f"{country_name} Outer Contour"
    )

    component_centroid_lat_max = args.component_centroid_lat_max
    if component_centroid_lat_max is None and is_japan_mainland_mode and not args.country_id:
        component_centroid_lat_max = 42.2

    cmd = ["tsx", str(EXPORTER_RELATIVE_PATH)]
    if args.country_id:
        cmd.append(f"--country-id={args.country_id}")
    else:
        cmd.append(f"--country-name={country_name}")

    cmd.extend(
        [
            f"--output={output_path}",
            f"--region-id={region_id}",
            f"--region-name={region_name}",
        ]
    )

    if component_centroid_lat_max is not None:
        cmd.append(f"--component-centroid-lat-max={component_centroid_lat_max}")
    if args.keep_all_loops:
        cmd.append("--keep-all-loops")

    print("[INFO] Running:", " ".join(cmd))
    print("[INFO] Working directory:", repo)

    if args.dry_run:
        return 0

    subprocess.run(cmd, cwd=repo, check=True)
    print(f"[OK] Generated: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
