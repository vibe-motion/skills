// node render_smooth.mjs <page.html> out.mp4 [--fps=60] [--shutter=1] [--from=0 --to=7] [--step=2.5]
// Gapless, speed-adaptive motion blur. Each output frame is the average of 32 slots spread over `shutter` x frame time
// (shutter 1 = 360 deg, so one frame's streak meets the next and fast moves smear instead of strobing).
// The page's window.probe(ms) says how far things move on screen; frames that move more get more distinct renders
// (up to 32, about `step` px apart), slow frames reuse each render across several slots.
import { chromium } from "playwright"; import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { spawn } from "node:child_process";
const [page, out, ...rest] = process.argv.slice(2), dir = path.dirname(path.resolve(page));
const opt = (k, d) => { const a = rest.find((x) => x.startsWith(`--${k}=`)); return a ? +a.split("=")[1] : d; };
const MINK = opt("mink", 4), JIT4 = [[-.375, -.125], [.125, -.375], [.375, .125], [-.125, .375]];   // rotated-grid sub-pixel offsets
const FPS = opt("fps", 60), SHUT = opt("shutter", 1), FROM = opt("from", 0), TO = opt("to", 7), STEP = opt("step", 2.5), SLOTS = 32;
const FF = process.env.FFMPEG || "ffmpeg";
const ctype = (f) => f.endsWith(".html") ? "text/html" : /\.m?js$/.test(f) ? "text/javascript" : "application/octet-stream";
const srv = http.createServer((q, r) => { const f = path.join(dir, decodeURIComponent(q.url.split("?")[0])); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "content-type": ctype(f) }); r.end(b); } }); }).listen(0);
const b = await chromium.launch({ args: ["--use-angle=metal"] }), p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on("pageerror", (e) => { console.error("[page]", e.message); process.exitCode = 1; });
await p.goto(`http://localhost:${srv.address().port}/${path.basename(page)}`); await p.waitForFunction(() => window.render && window.READY && window.probe);
const n = Math.round((TO - FROM) * FPS), dt = 1000 / FPS, t0 = FROM * 1000;
// how many px the fastest visible probe point travels during one shutter
const move = async (a, c) => { const [P, Q] = await p.evaluate(([a, c]) => [window.probe(a), window.probe(c)], [a, c]);
  let m = 0; P.forEach((u, i) => { const v = Q[i]; if (Math.abs(u[2]) < 1 && Math.abs(v[2]) < 1 && Math.abs(u[0]) < 1400 && Math.abs(v[0]) < 1400) m = Math.max(m, Math.hypot(u[0] - v[0], u[1] - v[1])); }); return m; };
const ff = spawn(FF, ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS * SLOTS), "-c:v", "png", "-i", "-",
  "-vf", `tmix=frames=${SLOTS},select='eq(mod(n\\,${SLOTS})\\,${SLOTS - 1})',setpts=N/${FPS}/TB,scale=1920:1080:flags=lanczos`, "-r", String(FPS),
  "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-frames:v", String(n), out], { stdio: ["pipe", "inherit", "inherit"] });
const done = new Promise((r) => ff.on("close", r)), fr = await p.$("#frame"), put = async (buf) => { if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r)); };
let renders = 0;
for (let i = 0; i < n; i++) {
  const mid = t0 + i * dt, a = mid - dt * SHUT / 2, c = mid + dt * SHUT / 2;
  const px = await move(a, c); let k = MINK; while (k < SLOTS && px / k > STEP) k *= 2;   // never fewer than MINK renders: each is jittered by a sub-pixel, so still frames are anti-aliased too
  for (let j = 0; j < k; j++) {
    const jj = JIT4[j % 4]; await p.evaluate(([ms, jx, jy]) => { if (window.setJitter) window.setJitter(jx, jy); window.render(ms); }, [k === 1 ? mid : a + (j + .5) / k * (c - a), jj[0], jj[1]]);
    const buf = await fr.screenshot({ type: "png" }); renders++;
    for (let r = 0; r < SLOTS / k; r++) await put(buf); }
  if (i % 30 === 0) console.log(`frame ${i}/${n}  move ${px.toFixed(0)}px  renders ${k}`); }
ff.stdin.end(); await done; console.log("done", out, "renders", renders); await b.close(); srv.close();
