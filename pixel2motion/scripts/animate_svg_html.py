#!/usr/bin/env python3
"""Build a standalone animated HTML deliverable from an SVG plus motion CSS.

The HTML recreates the SVG via JavaScript DOM calls (document.createElementNS),
injects the motion CSS wrapped in `@media (prefers-reduced-motion: no-preference)`,
and exposes deterministic hooks for motion QA:

  ?t=<ms>     pause every animation at the given timeline position (for frame capture)
  ?static=1   jump straight to the finished state (finite animations finished,
              infinite loops cancelled)
  replay      an on-page button re-renders the SVG so the choreography replays;
              hidden automatically when ?t= or ?static= is present

All motion rules (including initial hidden states) must live in the provided CSS
file so the reduced-motion experience is the finished static logo. Do not put
`opacity: 0`-style hidden states anywhere else.
"""

from __future__ import annotations

import argparse
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build standalone animated HTML from SVG + motion CSS.")
    parser.add_argument("svg", type=Path, help="Input SVG file (motion-ready structure).")
    parser.add_argument("--css", type=Path, required=True, help="Motion CSS file (keyframes + per-part rules).")
    parser.add_argument("--out", type=Path, default=Path("logo_motion.html"), help="Output HTML file.")
    parser.add_argument("--title", default="Logo Motion", help="HTML document title.")
    parser.add_argument("--background", default="#ffffff", help="Page background color.")
    parser.add_argument(
        "--duration-hint",
        type=int,
        default=None,
        help="Total choreography duration in ms; stored as data-p2m-duration for tooling.",
    )
    return parser.parse_args()


def strip_namespace(name: str) -> str:
    if "}" in name:
        return name.rsplit("}", 1)[1]
    return name


def clean_attrs(attrs: dict[str, str]) -> dict[str, str]:
    cleaned: dict[str, str] = {}
    for key, value in attrs.items():
        local = strip_namespace(key)
        if local == "xmlns":
            continue
        cleaned[local] = value
    return cleaned


def node_to_data(element: ET.Element) -> dict:
    node = {
        "tag": strip_namespace(element.tag),
        "attrs": clean_attrs(element.attrib),
        "children": [node_to_data(child) for child in list(element)],
    }
    text = (element.text or "").strip()
    if text:
        node["text"] = text
    return node


def max_width_for(svg_data: dict) -> str:
    attrs = svg_data.get("attrs", {})
    width = re.sub(r"[^0-9.]", "", attrs.get("width", ""))
    if width:
        return width
    if attrs.get("viewBox"):
        values = re.findall(r"[-+]?(?:\d*\.\d+|\d+)", attrs["viewBox"])
        if len(values) == 4:
            return values[2]
    return "1196"


def display_width_for(max_width: str) -> str:
    try:
        return f"{float(max_width) * 0.7:.3f}".rstrip("0").rstrip(".")
    except ValueError:
        return max_width


def html_for(svg_data: dict, motion_css: str, title: str, background: str, duration_hint: int | None) -> str:
    payload = json.dumps(svg_data, ensure_ascii=False, separators=(",", ":"))
    safe_title = re.sub(r"[<>]", "", title)
    max_width = max_width_for(svg_data)
    display_width = display_width_for(max_width)
    duration_attr = f' data-p2m-duration="{duration_hint}"' if duration_hint else ""
    indented_css = "\n".join("      " + line if line.strip() else line for line in motion_css.splitlines())
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{safe_title}</title>
  <style>
    html,
    body {{
      width: 100%;
      height: 100%;
      margin: 0;
      background: {background};
    }}

    body {{
      display: grid;
      place-items: center;
    }}

    #logo-root {{
      width: min(100vw, {display_width}px);
    }}

    #logo-root svg {{
      width: 100%;
      height: auto;
      display: block;
    }}

    #p2m-replay {{
      position: fixed;
      right: 16px;
      bottom: 16px;
      padding: 6px 14px;
      font: 13px/1.4 system-ui, sans-serif;
      color: #444;
      background: #f4f4f4;
      border: 1px solid #ccc;
      border-radius: 6px;
      cursor: pointer;
    }}

    #p2m-replay:hover {{
      background: #e8e8e8;
    }}

    .p2m-chromeless #p2m-replay {{
      display: none;
    }}

    /* ---- motion (skipped entirely under prefers-reduced-motion) ---- */
    @media (prefers-reduced-motion: no-preference) {{
{indented_css}
    }}
  </style>
</head>
<body>
  <main id="logo-root" aria-label="Animated logo"{duration_attr}></main>
  <button id="p2m-replay" type="button">Replay</button>
  <script>
    const SVG_NS = "http://www.w3.org/2000/svg";
    const LOGO = {payload};

    function createSvgNode(node) {{
      const element = document.createElementNS(SVG_NS, node.tag);
      for (const [name, value] of Object.entries(node.attrs || {{}})) {{
        element.setAttribute(name, value);
      }}
      if (node.text) {{
        element.appendChild(document.createTextNode(node.text));
      }}
      for (const child of node.children || []) {{
        element.appendChild(createSvgNode(child));
      }}
      return element;
    }}

    function render() {{
      const root = document.getElementById("logo-root");
      root.replaceChildren(createSvgNode(LOGO));
    }}

    const params = new URLSearchParams(location.search);
    const seekMs = params.get("t");
    const staticMode = params.get("static");
    window.__p2mReady = false;

    render();
    document.getElementById("p2m-replay").addEventListener("click", render);

    if (seekMs !== null || staticMode !== null) {{
      document.documentElement.classList.add("p2m-chromeless");
      // Two rAFs so styles/animations are fully applied before seeking.
      requestAnimationFrame(() => requestAnimationFrame(() => {{
        const animations = document.getAnimations();
        for (const animation of animations) {{
          if (staticMode !== null) {{
            try {{
              animation.finish();
            }} catch (err) {{
              animation.cancel(); // infinite loops cannot finish()
            }}
          }} else {{
            animation.pause();
            animation.currentTime = Number(seekMs);
          }}
        }}
        window.__p2mReady = true;
      }}));
    }} else {{
      requestAnimationFrame(() => requestAnimationFrame(() => {{
        window.__p2mReady = true;
      }}));
    }}
  </script>
</body>
</html>
"""


def main() -> int:
    args = parse_args()
    root = ET.parse(args.svg).getroot()
    if strip_namespace(root.tag) != "svg":
        raise SystemExit(f"Expected SVG root element in {args.svg}")
    motion_css = args.css.read_text(encoding="utf-8")
    if "@media" in motion_css and "prefers-reduced-motion" in motion_css:
        raise SystemExit(
            "Motion CSS should NOT contain its own prefers-reduced-motion media query; "
            "this script wraps the whole file already."
        )
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        html_for(node_to_data(root), motion_css, args.title, args.background, args.duration_hint),
        encoding="utf-8",
    )
    print(args.out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
