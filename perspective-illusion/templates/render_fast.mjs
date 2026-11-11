// node render_fast.mjs <page.html> out.mp4 [--preview] [--fps=60] [--from=0 --to=10] [--step=2] [--mink=4]
// Same look as render_smooth.mjs (gapless 360-degree motion blur, speed-adaptive, sub-pixel jitter anti-aliasing),
// but every frame's renders are averaged on the GPU inside the page (window.renderMany), so ONE image per output frame
// leaves the browser instead of up to 32. --preview: half resolution, 30 fps, light AA, JPEG frames: minutes, not an hour.
import { chromium } from "playwright"; import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { spawn } from "node:child_process";
const [page, out, ...rest] = process.argv.slice(2), dir = path.dirname(path.resolve(page)), PREVIEW = rest.includes("--preview");
const opt = (k, d) => { const a = rest.find((x) => x.startsWith(`--${k}=`)); return a ? +a.split("=")[1] : d; };
const FPS = opt("fps", PREVIEW ? 30 : 60), FROM = opt("from", 0), TO = opt("to", 10), STEP = opt("step", PREVIEW ? 6 : 2), MINK = opt("mink", PREVIEW ? 1 : 4), MAXK = PREVIEW ? 8 : 32, SHUT = 1;
const JIT = [[-.375, -.125], [.125, -.375], [.375, .125], [-.125, .375]], FF = process.env.FFMPEG || "ffmpeg";
const ctype = (f) => f.endsWith(".html") ? "text/html" : /\.m?js$/.test(f) ? "text/javascript" : f.endsWith(".png") ? "image/png" : f.endsWith(".jpg") ? "image/jpeg" : "application/octet-stream";
const srv = http.createServer((q, r) => { const f = path.join(dir, decodeURIComponent(q.url.split("?")[0])); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "content-type": ctype(f) }); r.end(b); } }); }).listen(0);
const b = await chromium.launch({ args: ["--use-angle=metal"] }), p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on("pageerror", (e) => { console.error("[page]", e.message); process.exitCode = 1; });
await p.goto(`http://localhost:${srv.address().port}/${path.basename(page)}${PREVIEW ? "?scale=.5" : ""}`); await p.waitForFunction(() => window.renderMany && window.READY && window.probe);
const n = Math.round((TO - FROM) * FPS), dt = 1000 / FPS, t0 = FROM * 1000;
const move = async (a, c) => { const [P, Q] = await p.evaluate(([a, c]) => [window.probe(a), window.probe(c)], [a, c]);
  let m = 0; P.forEach((u, i) => { const v = Q[i]; if (Math.abs(u[2]) < 1 && Math.abs(v[2]) < 1 && Math.abs(u[0]) < 1400 && Math.abs(v[0]) < 1400) m = Math.max(m, Math.hypot(u[0] - v[0], u[1] - v[1])); }); return m; };
const size = PREVIEW ? "960:540" : "1920:1080";
const ff = spawn(FF, ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", "-vf", `scale=${size}:flags=lanczos`, "-r", String(FPS),
  "-c:v", "libx264", "-preset", PREVIEW ? "veryfast" : "slow", "-crf", PREVIEW ? "21" : "15", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-frames:v", String(n), out], { stdio: ["pipe", "inherit", "inherit"] });
const done = new Promise((r) => ff.on("close", r)), fr = await p.$("#frame"); let renders = 0; const T = Date.now();
for (let i = 0; i < n; i++) {
  const mid = t0 + i * dt, a = mid - dt * SHUT / 2, c = mid + dt * SHUT / 2, px = await move(a, c); let k = MINK; while (k < MAXK && px / k > STEP) k *= 2;
  const list = []; for (let j = 0; j < k; j++) { const jj = JIT[j % 4]; list.push([k === 1 ? mid : a + (j + .5) / k * (c - a), MINK > 1 || k > 1 ? jj[0] : 0, MINK > 1 || k > 1 ? jj[1] : 0]); }
  await p.evaluate((l) => window.renderMany(l), list); renders += k;
  const buf = await fr.screenshot(PREVIEW ? { type: "jpeg", quality: 92 } : { type: "png" }); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (i % 60 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - T) / 1000).toFixed(0)}s`); }
ff.stdin.end(); await done; console.log("done", out, "renders", renders, "in", ((Date.now() - T) / 60000).toFixed(1), "min"); await b.close(); srv.close();
