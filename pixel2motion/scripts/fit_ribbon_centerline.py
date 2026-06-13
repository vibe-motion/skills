#!/usr/bin/env python3
"""Fit a closed variable-width ribbon (calligraphic ∞ marks, scripts, swooshes
that cross themselves) as: closed Catmull-Rom centerline scaffold -> measured
auto-recentering against the raster mask -> width profile -> sub-pixel edge
snap to the source boundary -> smooth cubic-Bezier outline.

This is the recipe for topologies where two open boundaries don't exist and
direct per-boundary fitting is impractical (see fitting-playbook §3/§8). The
final edge-snap pass against SOURCE pixels is what keeps the centerline
scaffold honest — without it, smoothing biases high-curvature caps ~1px inward.

Inputs:
  source.png            raster logo
  --seeds seeds.json    {"points": [[x,y], ...],             # closed loop, drawing order
                         "exclusions": [{"cx":..,"cy":..,"r":..}, ...]}
                        Exclusion circles mark occluders (covering dots) AND
                        self-crossing zones: measurement/snapping is skipped
                        inside them and bridged by circular interpolation.
Outputs (in --out-dir):
  ribbon_path.txt       closed filled-outline path d (nonzero fill unions the crossing)
  centerline_path.txt   closed centerline path d (give it pathLength="1" for draw-on)
  fit_report.json       convergence, widths, arc fractions of each exclusion's passes
  preview.svg           ribbon + centerline preview for overlay QA

Typical: 2-3 --recenter passes converge (mean shift 1.6 -> 0.3px).
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image


def parse_args():
    p = argparse.ArgumentParser(description="Closed variable-width ribbon fitter.")
    p.add_argument("source", type=Path)
    p.add_argument("--seeds", type=Path, required=True)
    p.add_argument("--out-dir", type=Path, default=Path("outputs/ribbon_fit"))
    p.add_argument("--lum-thresh", type=float, default=170.0,
                   help="Foreground = mean RGB below this (default 170).")
    p.add_argument("--mask-png", type=Path, default=None,
                   help="Optional explicit mask (white=foreground) instead of threshold.")
    p.add_argument("--roi", default=None, metavar="X0,Y0,X1,Y1",
                   help="Restrict the mask to this box (e.g. exclude a wordmark).")
    p.add_argument("--recenter", type=int, default=3, help="Recenter passes (default 3).")
    p.add_argument("--ctrl-spacing", type=float, default=55.0,
                   help="Arclength between rebuilt control points, px (default 55). "
                        "Arclength spacing prevents control-point inflation.")
    p.add_argument("--sig-mid", type=float, default=2.5, help="Midpoint smoothing sigma.")
    p.add_argument("--sig-w", type=float, default=3.0, help="Width smoothing sigma.")
    p.add_argument("--min-width", type=float, default=1.8)
    p.add_argument("--max-width", type=float, default=40.0,
                   help="Reject wider measurements as contaminated (merged strokes).")
    p.add_argument("--snap-clamp", type=float, default=2.5,
                   help="Max edge-snap shift, px; 0 disables snapping.")
    p.add_argument("--samples-per-seg", type=int, default=30)
    p.add_argument("--chunk", type=int, default=30, help="Samples per fitted outline cubic.")
    p.add_argument("--color", default="#000000", help="Preview fill color.")
    return p.parse_args()


args = parse_args()
seeds = json.loads(args.seeds.read_text())
SEED = [tuple(pt) for pt in seeds["points"]]
EXCL = [(np.array([e["cx"], e["cy"]], float), float(e["r"]))
        for e in seeds.get("exclusions", [])]

img = Image.open(args.source).convert("RGB")
a = np.array(img)
H, W = a.shape[:2]
lum = a.mean(axis=2)
if args.mask_png:
    m = np.array(Image.open(args.mask_png).convert("L"))
    if m.shape != lum.shape:
        raise SystemExit("--mask-png size mismatch")
    mask = m > 127
else:
    mask = lum < args.lum_thresh
if args.roi:
    x0, y0, x1, y1 = (int(v) for v in args.roi.split(","))
    keep = np.zeros_like(mask)
    keep[y0:y1, x0:x1] = True
    mask &= keep


def in_exclusion(p):
    return any(np.linalg.norm(p - c) < r for c, r in EXCL)


def catmull_rom_closed(pts, sps):
    P = np.array(pts, float)
    n = len(P)
    segs, dense, seg_index = [], [], []
    for i in range(n):
        p0, p1, p2, p3 = P[(i - 1) % n], P[i], P[(i + 1) % n], P[(i + 2) % n]
        c1 = p1 + (p2 - p0) / 6.0
        c2 = p2 - (p3 - p1) / 6.0
        segs.append((p1, c1, c2, p2))
        for t in np.linspace(0, 1, sps, endpoint=False):
            mt = 1 - t
            dense.append((mt**3) * p1 + 3 * (mt**2) * t * c1 + 3 * mt * (t**2) * c2 + (t**3) * p2)
            seg_index.append(i)
    return segs, np.array(dense), np.array(seg_index)


def mask_at(p):
    x, y = int(round(p[0])), int(round(p[1]))
    return mask[y, x] if 0 <= x < W and 0 <= y < H else False


def measure(p, nrm, max_d, step=0.25):
    q = p.copy()
    if not mask_at(q):
        found = False
        for s in np.arange(step, 5.0, step):
            for sgn in (1, -1):
                if mask_at(p + sgn * s * nrm):
                    q = p + sgn * s * nrm
                    found = True
                    break
            if found:
                break
        if not found:
            return None
    sp = 0.0
    while sp < max_d and mask_at(q + (sp + step) * nrm):
        sp += step
    sm = 0.0
    while sm < max_d and mask_at(q - (sm + step) * nrm):
        sm += step
    return q + ((sp - sm) / 2.0) * nrm, sp + sm + step


def circular_fill(vals, valid):
    n = len(vals)
    if valid.all():
        return vals
    idx = np.where(valid)[0]
    out = vals.copy()
    for i in np.where(~valid)[0]:
        nxt = idx[np.argmin((idx - i) % n)]
        prv = idx[np.argmin((i - idx) % n)]
        gap = (nxt - prv) % n
        w = ((i - prv) % n) / max(gap, 1)
        out[i] = (1 - w) * vals[prv] + w * vals[nxt]
    return out


def gauss_smooth_circ(vals, sigma):
    k = int(3 * sigma)
    kern = np.exp(-0.5 * (np.arange(-k, k + 1) / sigma) ** 2)
    kern /= kern.sum()
    if vals.ndim == 1:
        ext = np.concatenate([vals[-k:], vals, vals[:k]])
        return np.convolve(ext, kern, "same")[k:-k]
    ext = np.concatenate([vals[-k:], vals, vals[:k]], axis=0)
    return np.stack([np.convolve(ext[:, j], kern, "same")[k:-k]
                     for j in range(vals.shape[1])], axis=1)


report = {}
ctrl = list(SEED)
for it in range(args.recenter + 1):
    segs, dense, seg_idx = catmull_rom_closed(ctrl, args.samples_per_seg)
    n = len(dense)
    tang = np.roll(dense, -1, axis=0) - np.roll(dense, 1, axis=0)
    tang /= np.maximum(np.linalg.norm(tang, axis=1, keepdims=True), 1e-9)
    nrm = np.stack([-tang[:, 1], tang[:, 0]], axis=1)
    mids = dense.copy()
    widths = np.full(n, np.nan)
    valid = np.zeros(n, bool)
    for i in range(n):
        if in_exclusion(dense[i]):
            continue
        m = measure(dense[i], nrm[i], args.max_width * 0.75)
        if m is None or m[1] > args.max_width:
            continue
        mids[i], widths[i] = m
        valid[i] = True
    mids = circular_fill(mids, valid)
    widths = np.maximum(circular_fill(widths, valid), args.min_width)
    mids_s = gauss_smooth_circ(mids, args.sig_mid)
    widths_s = gauss_smooth_circ(widths, args.sig_w)
    report[f"pass{it}"] = {
        "valid_frac": round(float(valid.mean()), 4),
        "mean_shift_px": round(float(np.linalg.norm(mids - dense, axis=1)[valid].mean()), 3)
        if valid.any() else None,
        "width_min": round(float(widths_s.min()), 2),
        "width_max": round(float(widths_s.max()), 2),
    }
    if it < args.recenter:
        seglen = np.linalg.norm(np.diff(np.vstack([mids_s, mids_s[:1]]), axis=0), axis=1)
        arc = np.concatenate([[0], np.cumsum(seglen)])
        n_ctrl = max(12, int(round(arc[-1] / args.ctrl_spacing)))
        targets = np.linspace(0, arc[-1], n_ctrl, endpoint=False)
        ctrl = [tuple(mids_s[np.searchsorted(arc, t) % n]) for t in targets]

# final geometry on converged centerline
segs, dense, seg_idx = catmull_rom_closed(ctrl, args.samples_per_seg)
n = len(dense)
tang = np.roll(dense, -1, axis=0) - np.roll(dense, 1, axis=0)
tang /= np.maximum(np.linalg.norm(tang, axis=1, keepdims=True), 1e-9)
nrm = np.stack([-tang[:, 1], tang[:, 0]], axis=1)
widths = np.full(n, np.nan)
valid = np.zeros(n, bool)
for i in range(n):
    if in_exclusion(dense[i]):
        continue
    m = measure(dense[i], nrm[i], args.max_width * 0.75)
    if m and m[1] <= args.max_width:
        widths[i], valid[i] = m[1], True
widths = gauss_smooth_circ(np.maximum(circular_fill(widths, valid), args.min_width), args.sig_w)
left = dense + (widths[:, None] / 2) * nrm
right = dense - (widths[:, None] / 2) * nrm


def lum_at(p):
    x, y = p
    x0, y0 = int(np.floor(x)), int(np.floor(y))
    if x0 < 0 or y0 < 0 or x0 >= W - 1 or y0 >= H - 1:
        return 255.0
    fx, fy = x - x0, y - y0
    return (lum[y0, x0] * (1 - fx) * (1 - fy) + lum[y0, x0 + 1] * fx * (1 - fy)
            + lum[y0 + 1, x0] * (1 - fx) * fy + lum[y0 + 1, x0 + 1] * fx * fy)


def snap_edges(edge, outward):
    if args.snap_clamp <= 0 or args.mask_png:
        return edge
    npts = len(edge)
    shifts = np.zeros(npts)
    ok = np.zeros(npts, bool)
    for i in range(npts):
        if in_exclusion(edge[i]) or widths[i] < 6:
            continue
        ss = np.arange(-3.0, 3.01, 0.1)
        vals = np.array([lum_at(edge[i] + s * outward[i]) for s in ss])
        best = None
        for j in range(len(ss) - 1):
            if (vals[j] - args.lum_thresh) * (vals[j + 1] - args.lum_thresh) <= 0 \
                    and vals[j + 1] >= vals[j]:
                f = (args.lum_thresh - vals[j]) / max(vals[j + 1] - vals[j], 1e-9)
                s_cross = ss[j] + f * 0.1
                if best is None or abs(s_cross) < abs(best):
                    best = s_cross
        if best is not None and abs(best) <= args.snap_clamp:
            shifts[i], ok[i] = best, True
    if ok.any():
        shifts = gauss_smooth_circ(circular_fill(shifts, ok), 2)
    return edge + shifts[:, None] * outward


left = snap_edges(left, nrm)
right = snap_edges(right, -nrm)


def fit_cubic(pts):
    p0, p3 = pts[0], pts[-1]
    t0 = pts[1] - pts[0]; t0 /= max(np.linalg.norm(t0), 1e-9)
    t1 = pts[-2] - pts[-1]; t1 /= max(np.linalg.norm(t1), 1e-9)
    chord = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    u = np.concatenate([[0], np.cumsum(chord)])
    u /= max(u[-1], 1e-9)
    C = np.zeros((2, 2)); X = np.zeros(2)
    for i in range(len(pts)):
        b1 = 3 * (1 - u[i]) ** 2 * u[i]
        b2 = 3 * (1 - u[i]) * u[i] ** 2
        a1, a2 = t0 * b1, t1 * b2
        base = ((1 - u[i]) ** 3 + 3 * (1 - u[i]) ** 2 * u[i]) * p0 \
             + (3 * (1 - u[i]) * u[i] ** 2 + u[i] ** 3) * p3
        diff = pts[i] - base
        C[0, 0] += a1 @ a1; C[0, 1] += a1 @ a2
        C[1, 0] += a2 @ a1; C[1, 1] += a2 @ a2
        X[0] += a1 @ diff; X[1] += a2 @ diff
    try:
        al, be = np.linalg.solve(C, X)
    except np.linalg.LinAlgError:
        al = be = np.linalg.norm(p3 - p0) / 3
    fb = np.linalg.norm(p3 - p0) / 3
    if al <= 0 or not np.isfinite(al): al = fb
    if be <= 0 or not np.isfinite(be): be = fb
    return p0, p0 + al * t0, p3 + be * t1, p3


def fit_chunks(samples):
    m = len(samples)
    k = max(1, round((m - 1) / args.chunk))
    bounds = np.linspace(0, m - 1, k + 1).astype(int)
    out = []
    for s, e in zip(bounds[:-1], bounds[1:]):
        if e - s < 3:
            p0, p3 = samples[s], samples[e]
            out.append((p0, p0 + (p3 - p0) / 3, p0 + 2 * (p3 - p0) / 3, p3))
        else:
            out.append(fit_cubic(samples[s:e + 1]))
    return out


def fmt(p):
    return f"{p[0]:.2f},{p[1]:.2f}"


leftC = fit_chunks(np.vstack([left, left[:1]]))
rightC = fit_chunks(np.vstack([right, right[:1]])[::-1])
ribbon_d = (f"M {fmt(leftC[0][0])} "
            + "".join(f"C {fmt(c[1])} {fmt(c[2])} {fmt(c[3])} " for c in leftC)
            + f"L {fmt(rightC[0][0])} "
            + "".join(f"C {fmt(c[1])} {fmt(c[2])} {fmt(c[3])} " for c in rightC) + "Z")
cl_d = f"M {fmt(segs[0][0])} " + "".join(
    f"C {fmt(c1)} {fmt(c2)} {fmt(p2)} " for (_, c1, c2, p2) in segs) + "Z"

# arc fractions where the centerline passes each exclusion (useful as split
# cuts for draw-on choreography across self-intersections)
seglen = np.linalg.norm(np.diff(dense, axis=0), axis=1)
arc = np.concatenate([[0], np.cumsum(seglen)])
total = float(arc[-1] + np.linalg.norm(dense[0] - dense[-1]))
passes = []
for c, r in EXCL:
    d2 = np.linalg.norm(dense - c, axis=1)
    inside = d2 < r
    runs, s = [], None
    for i in range(n):
        if inside[i] and s is None:
            s = i
        if not inside[i] and s is not None:
            runs.append(round(float(arc[(s + i - 1) // 2] / total), 4)); s = None
    if s is not None:
        runs.append(round(float(arc[(s + n - 1) // 2] / total), 4))
    passes.append({"cx": float(c[0]), "cy": float(c[1]), "r": r, "arc_fractions": runs})

report.update({
    "n_ctrl": len(ctrl),
    "n_outline_cubics": len(leftC) + len(rightC),
    "centerline_length_px": round(total, 1),
    "exclusion_passes": passes,
})

args.out_dir.mkdir(parents=True, exist_ok=True)
(args.out_dir / "ribbon_path.txt").write_text(ribbon_d)
(args.out_dir / "centerline_path.txt").write_text(cl_d)
(args.out_dir / "fit_report.json").write_text(json.dumps(report, indent=1))
(args.out_dir / "preview.svg").write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">\n'
    f'  <path id="ribbon-centerline" d="{cl_d}" fill="none" pathLength="1"/>\n'
    f'  <path id="ribbon" d="{ribbon_d}" fill="{args.color}" fill-rule="nonzero"/>\n'
    f'</svg>\n')
print(json.dumps(report, indent=1))
