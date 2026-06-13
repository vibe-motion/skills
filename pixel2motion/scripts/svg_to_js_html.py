#!/usr/bin/env python3
"""Convert an SVG file into a standalone JS-rendered HTML preview."""

from __future__ import annotations

import argparse
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build standalone HTML that recreates an SVG via JavaScript DOM calls.")
    parser.add_argument("svg", type=Path, help="Input SVG file.")
    parser.add_argument("--out", type=Path, default=Path("logo.html"), help="Output HTML file.")
    parser.add_argument("--title", default="Vectorized Logo", help="HTML document title.")
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


def html_for(svg_data: dict, title: str) -> str:
    payload = json.dumps(svg_data, ensure_ascii=False, separators=(",", ":"))
    safe_title = re.sub(r"[<>]", "", title)
    attrs = svg_data.get("attrs", {})
    max_width = re.sub(r"[^0-9.]", "", attrs.get("width", "")) or "1196"
    if not attrs.get("width") and attrs.get("viewBox"):
        values = re.findall(r"[-+]?(?:\d*\.\d+|\d+)", attrs["viewBox"])
        if len(values) == 4:
            max_width = values[2]
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
      background: #ffffff;
    }}

    body {{
      display: grid;
      place-items: center;
    }}

    #logo-root {{
      width: min(100vw, {max_width}px);
    }}

    #logo-root svg {{
      width: 100%;
      height: auto;
      display: block;
    }}
  </style>
</head>
<body>
  <main id="logo-root" aria-label="Vectorized logo"></main>
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

    document.getElementById("logo-root").appendChild(createSvgNode(LOGO));
  </script>
</body>
</html>
"""


def main() -> int:
    args = parse_args()
    root = ET.parse(args.svg).getroot()
    if strip_namespace(root.tag) != "svg":
        raise SystemExit(f"Expected SVG root element in {args.svg}")
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(html_for(node_to_data(root), args.title), encoding="utf-8")
    print(args.out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
