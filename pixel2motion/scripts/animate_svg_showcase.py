#!/usr/bin/env python3
"""Build a showcase-style Pixel2Motion HTML deliverable.

The output follows the richer delivery shell used by the CueRecord sample:
main animation stage, atomic motion previews, replay/slow/speed controls, and
deterministic QA hooks (`?t=<ms>`, `?static=1`, `window.__p2mReady`).

The main SVG is recreated through JavaScript DOM calls from parsed SVG data.
Atomic thumbnails use a data-URI copy of the SVG so duplicate ids in the page do
not collide with motion CSS targeting the hero SVG.
"""

from __future__ import annotations

import argparse
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build showcase HTML from SVG + motion CSS.")
    parser.add_argument("svg", type=Path, help="Input SVG file (motion-ready structure).")
    parser.add_argument("--css", type=Path, required=True, help="Motion CSS file for the main hero animation.")
    parser.add_argument("--out", type=Path, default=Path("logo_motion.html"), help="Output HTML file.")
    parser.add_argument("--title", default="Logo Motion", help="HTML document title.")
    parser.add_argument("--background", default="#ffffff", help="Page background color.")
    parser.add_argument("--duration-hint", type=int, default=1500, help="Total choreography duration in ms.")
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
    return "960"


def display_width_for(max_width: str) -> str:
    try:
        return f"{float(max_width) * 0.7:.3f}".rstrip("0").rstrip(".")
    except ValueError:
        return max_width


def svg_markup_for_data_uri(svg_markup: str) -> str:
    defaults = (
        "<style>:root,svg{"
        "--bg:#ffffff;--surface:#f5f5f3;--text-primary:#0d0d0d;"
        "--text-secondary:#777;--text-tertiary:#aaa;--logo-wordmark:#363e47;"
        "--accent:#e64036;--red:#e64036;--red-bright:#ff493f;"
        "}</style>"
    )
    return re.sub(r"(<svg\b[^>]*>)", r"\1" + defaults, svg_markup, count=1)


def html_for(
    svg_data: dict,
    svg_markup: str,
    motion_css: str,
    title: str,
    background: str,
    duration_hint: int,
) -> str:
    payload = json.dumps(svg_data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    svg_text = json.dumps(svg_markup_for_data_uri(svg_markup), ensure_ascii=False).replace("</", "<\\/")
    safe_title = re.sub(r"[<>]", "", title)
    max_width = max_width_for(svg_data)
    display_width = display_width_for(max_width)
    indented_css = "\n".join("      " + line if line.strip() else line for line in motion_css.splitlines())
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{safe_title}</title>
  <style>
    *, *::before, *::after {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    :root {{
      --bg: {background};
      --surface: #f5f5f3;
      --border: rgba(0,0,0,0.08);
      --text-primary: #0d0d0d;
      --text-secondary: #777;
      --text-tertiary: #aaa;
      --accent: #e64036;
      --speed-progress: 9%;
    }}

    html, body {{
      min-height: 100%;
      background: var(--bg);
      color: var(--text-primary);
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    }}

    body {{
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      padding: 2rem;
    }}

    #logo-root {{
      width: min(92vw, {display_width}px);
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: visible;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }}

    #logo-root svg {{
      width: 100%;
      height: auto;
      display: block;
      overflow: visible;
      text-rendering: geometricPrecision;
    }}

    .atomic-motions {{
      display: flex;
      gap: 1.5rem;
      align-items: flex-end;
      justify-content: center;
      flex-wrap: wrap;
    }}

    .atom {{
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }}

    .atom-stage {{
      width: 74px;
      height: 74px;
      display: grid;
      place-items: center;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }}

    .atom-stage img {{
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 260ms cubic-bezier(0.34,1.56,0.64,1);
      transform-origin: center;
    }}

    .atom-label {{
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-tertiary);
      white-space: nowrap;
    }}

    .principles {{
      max-width: 760px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }}

    .pill {{
      font-size: 11px;
      line-height: 1;
      padding: 5px 10px;
      border: 0.5px solid var(--border);
      border-radius: 999px;
      color: var(--text-secondary);
      white-space: nowrap;
    }}

    .pill.active {{
      border-color: var(--accent);
      color: var(--accent);
    }}

    .controls {{
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
    }}

    button {{
      font: 12px/1.2 inherit;
      letter-spacing: 0.04em;
      padding: 8px 18px;
      border: 0.5px solid var(--border);
      border-radius: 999px;
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
    }}

    button.primary {{
      color: var(--bg);
      background: var(--text-primary);
      border-color: var(--text-primary);
    }}

    .speed-control {{
      width: min(340px, 80vw);
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      border: 0.5px solid var(--border);
      border-radius: 999px;
      color: var(--text-secondary);
    }}

    .speed-caption,
    .speed-value {{
      font-size: 11px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      white-space: nowrap;
    }}

    .speed-value {{
      min-width: 46px;
      text-align: right;
      color: var(--text-primary);
      text-transform: none;
      font-variant-numeric: tabular-nums;
    }}

    input[type="range"] {{
      flex: 1;
      min-width: 120px;
      height: 24px;
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      cursor: grab;
      accent-color: var(--accent);
    }}

    input[type="range"]::-webkit-slider-runnable-track {{
      height: 3px;
      border-radius: 999px;
      background: linear-gradient(to right, var(--accent) 0%, var(--accent) var(--speed-progress), var(--border) var(--speed-progress), var(--border) 100%);
    }}

    input[type="range"]::-webkit-slider-thumb {{
      appearance: none;
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      margin-top: -6.5px;
      border-radius: 50%;
      border: 2px solid var(--bg);
      background: var(--accent);
      box-shadow: 0 1px 6px rgba(0,0,0,0.18);
    }}

    .footer {{
      font-size: 11px;
      color: var(--text-tertiary);
      text-align: center;
      line-height: 1.7;
    }}

    .p2m-chromeless .atomic-motions,
    .p2m-chromeless .principles,
    .p2m-chromeless .controls,
    .p2m-chromeless .footer {{
      display: none;
    }}

    @media (prefers-reduced-motion: reduce) {{
      * {{
        animation: none !important;
        transition: none !important;
      }}
    }}

    @media (prefers-reduced-motion: no-preference) {{
{indented_css}
    }}
  </style>
</head>
<body>
  <main id="logo-root" aria-label="Animated logo" data-p2m-duration="{duration_hint}"></main>

  <section class="atomic-motions" aria-label="Atomic motion studies">
    <div class="atom" data-atom="hover"><div class="atom-stage"></div><span class="atom-label">Hover</span></div>
    <div class="atom" data-atom="pulse"><div class="atom-stage"></div><span class="atom-label">Pulse</span></div>
    <div class="atom" data-atom="arc"><div class="atom-stage"></div><span class="atom-label">Arc</span></div>
    <div class="atom" data-atom="press"><div class="atom-stage"></div><span class="atom-label">Press</span></div>
  </section>

  <div class="principles" id="principlesRow">
    <span class="pill" data-p="squashstretch">Squash &amp; stretch</span>
    <span class="pill" data-p="anticipation">Anticipation</span>
    <span class="pill" data-p="staging">Staging</span>
    <span class="pill" data-p="followthrough">Follow through</span>
    <span class="pill" data-p="overlap">Overlapping</span>
    <span class="pill" data-p="slowinout">Slow in / out</span>
    <span class="pill" data-p="arc">Arc</span>
    <span class="pill" data-p="secondary">Secondary action</span>
    <span class="pill" data-p="timing">Timing</span>
    <span class="pill" data-p="appeal">Appeal</span>
  </div>

  <div class="controls">
    <button class="primary" id="btnReplay" type="button">Replay</button>
    <button id="btnSlow" type="button">Slow motion</button>
    <label class="speed-control" for="speedSlider">
      <span class="speed-caption">Speed</span>
      <input id="speedSlider" type="range" min="0.25" max="2.5" step="0.05" value="0.45" aria-label="Animation speed">
      <span class="speed-value" id="speedValue">0.45x</span>
    </label>
  </div>

  <p class="footer">Click the main logo to replay | Drag speed | Try atomic motions</p>

  <script>
    const SVG_NS = "http://www.w3.org/2000/svg";
    const LOGO = {payload};
    const SVG_TEXT = {svg_text};
    const SVG_URI = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(SVG_TEXT);
    const DURATION = {duration_hint};

    let playbackRate = 0.45;
    let pulseRaf = null;
    let arcRaf = null;
    window.__p2mReady = false;

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

    function heroAnimations() {{
      const root = document.getElementById("logo-root");
      if (root.getAnimations) return root.getAnimations({{ subtree: true }});
      return document.getAnimations().filter(animation => {{
        const target = animation.effect && animation.effect.target;
        return target && root.contains(target);
      }});
    }}

    function applyPlaybackRate() {{
      for (const animation of heroAnimations()) {{
        if (animation.updatePlaybackRate) animation.updatePlaybackRate(playbackRate);
        else animation.playbackRate = playbackRate;
      }}
    }}

    function renderHero() {{
      const root = document.getElementById("logo-root");
      root.replaceChildren(createSvgNode(LOGO));
      const svg = root.querySelector("svg");
      if (svg) {{
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.style.width = "100%";
        svg.style.height = "auto";
        svg.style.overflow = "visible";
      }}
      requestAnimationFrame(() => requestAnimationFrame(applyPlaybackRate));
    }}

    function flashPills(...names) {{
      document.querySelectorAll(".pill").forEach(pill => pill.classList.remove("active"));
      names.forEach(name => {{
        const pill = document.querySelector(`[data-p="${{name}}"]`);
        if (pill) pill.classList.add("active");
      }});
    }}

    function cyclePrinciples() {{
      const phases = [
        ["staging", "timing"],
        ["anticipation", "squashstretch"],
        ["arc", "slowinout"],
        ["overlap", "followthrough"],
        ["appeal"]
      ];
      let i = 0;
      flashPills(...phases[0]);
      return setInterval(() => {{
        i = (i + 1) % phases.length;
        flashPills(...phases[i]);
      }}, Math.max(240, DURATION / phases.length / Math.max(playbackRate, 0.25)));
    }}

    let pillTimer = null;
    function replayMain() {{
      clearInterval(pillTimer);
      renderHero();
      pillTimer = cyclePrinciples();
      setTimeout(() => {{
        clearInterval(pillTimer);
        document.querySelectorAll(".pill").forEach(pill => pill.classList.remove("active"));
      }}, DURATION / Math.max(playbackRate, 0.25) + 600);
    }}

    function formatSpeed(rate) {{
      return `${{rate.toFixed(2)}}x`;
    }}

    function updateSpeedUI() {{
      const slider = document.getElementById("speedSlider");
      const value = Number(slider.value);
      const min = Number(slider.min);
      const max = Number(slider.max);
      const progress = ((value - min) / (max - min)) * 100;
      document.getElementById("speedValue").textContent = formatSpeed(value);
      slider.style.setProperty("--speed-progress", `${{progress}}%`);
      const slow = value <= 0.251;
      const btnSlow = document.getElementById("btnSlow");
      btnSlow.textContent = slow ? "Normal speed" : "Slow motion";
      btnSlow.style.background = slow ? "var(--surface)" : "";
      btnSlow.style.borderColor = slow ? "var(--text-secondary)" : "";
    }}

    function setPlaybackRate(rate, replay = false) {{
      const slider = document.getElementById("speedSlider");
      const min = Number(slider.min);
      const max = Number(slider.max);
      playbackRate = Math.min(max, Math.max(min, Number(rate)));
      slider.value = String(playbackRate);
      updateSpeedUI();
      applyPlaybackRate();
      if (replay) replayMain();
    }}

    function setupAtomImages() {{
      document.querySelectorAll(".atom-stage").forEach(stage => {{
        const img = new Image();
        img.src = SVG_URI;
        img.alt = "";
        stage.appendChild(img);
      }});
    }}

    function setupAtoms() {{
      const hover = document.querySelector('[data-atom="hover"] img');
      const pulse = document.querySelector('[data-atom="pulse"] img');
      const arc = document.querySelector('[data-atom="arc"] img');
      const press = document.querySelector('[data-atom="press"] img');

      hover.parentElement.addEventListener("mouseenter", () => {{
        flashPills("squashstretch", "appeal");
        hover.style.transform = "scale(1.08) rotate(-1.5deg)";
      }});
      hover.parentElement.addEventListener("mouseleave", () => {{
        hover.style.transform = "scale(1)";
      }});

      function pulseTick(ts) {{
        const p = (Math.sin(ts / 900) + 1) / 2;
        pulse.style.transform = `scale(${{1 + 0.1 * p}})`;
        pulseRaf = requestAnimationFrame(pulseTick);
      }}
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {{
        pulseRaf = requestAnimationFrame(pulseTick);
      }}

      let arcAngle = -14;
      let arcVel = 0;
      function arcTick() {{
        arcVel += (0 - arcAngle) * 0.08;
        arcVel *= 0.86;
        arcAngle += arcVel;
        arc.style.transform = `rotate(${{arcAngle}}deg)`;
        arcRaf = requestAnimationFrame(arcTick);
      }}
      arc.parentElement.addEventListener("mouseenter", () => {{
        flashPills("arc", "anticipation", "appeal");
        cancelAnimationFrame(arcRaf);
        arcAngle = 28;
        arcVel = 0;
        arcTick();
      }});
      arc.parentElement.addEventListener("mouseleave", () => {{
        arcAngle = 0;
      }});

      press.parentElement.addEventListener("mousedown", () => {{
        flashPills("squashstretch", "anticipation");
        press.style.transform = "scaleX(1.10) scaleY(0.88)";
      }});
      ["mouseup", "mouseleave"].forEach(ev => {{
        press.parentElement.addEventListener(ev, () => {{
          press.style.transform = "scale(1)";
        }});
      }});
    }}

    function applyQaMode() {{
      const params = new URLSearchParams(location.search);
      const seekMs = params.get("t");
      const staticMode = params.get("static");
      if (seekMs === null && staticMode === null) {{
        requestAnimationFrame(() => requestAnimationFrame(() => {{
          applyPlaybackRate();
          window.__p2mReady = true;
        }}));
        return;
      }}

      document.documentElement.classList.add("p2m-chromeless");
      cancelAnimationFrame(pulseRaf);
      cancelAnimationFrame(arcRaf);
      requestAnimationFrame(() => requestAnimationFrame(() => {{
        for (const animation of heroAnimations()) {{
          if (staticMode !== null) {{
            try {{
              animation.finish();
            }} catch (err) {{
              animation.cancel();
            }}
          }} else {{
            animation.pause();
            animation.currentTime = Number(seekMs);
          }}
        }}
        window.__p2mReady = true;
      }}));
    }}

    document.getElementById("btnReplay").addEventListener("click", replayMain);
    document.getElementById("logo-root").addEventListener("click", replayMain);
    document.getElementById("speedSlider").addEventListener("input", event => {{
      setPlaybackRate(event.target.value, false);
    }});
    document.getElementById("btnSlow").addEventListener("click", () => {{
      const slow = Number(document.getElementById("speedSlider").value) <= 0.251;
      setPlaybackRate(slow ? 0.45 : 0.25, true);
    }});

    setupAtomImages();
    setupAtoms();
    setPlaybackRate(0.45, false);
    renderHero();
    applyQaMode();
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
            "Motion CSS should not contain its own prefers-reduced-motion media query; "
            "this script wraps the whole file already."
        )
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        html_for(
            node_to_data(root),
            args.svg.read_text(encoding="utf-8"),
            motion_css,
            args.title,
            args.background,
            args.duration_hint,
        ),
        encoding="utf-8",
    )
    print(args.out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
