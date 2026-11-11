// node render.mjs <page.html> out.mp4 [--stills=0,1,2]   1920x1080, 30 fps, 7 s loop, 4-subframe motion blur
import { chromium } from "playwright"; import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { spawn } from "node:child_process";
const [page, out, ...rest] = process.argv.slice(2), dir = path.dirname(path.resolve(page)), stills = rest.find((a) => a.startsWith("--stills="));
const FF = process.env.FFMPEG || "ffmpeg", types = { ".html": "text/html", ".js": "text/javascript" };
const srv = http.createServer((q, r) => { const f = path.join(dir, decodeURIComponent(q.url.split("?")[0])); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); r.end(b); } }); }).listen(0);
const b = await chromium.launch({ args: ["--use-angle=metal"] }), p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on("pageerror", (e) => { console.error("[page]", e.message); process.exitCode = 1; });
await p.goto(`http://localhost:${srv.address().port}/${path.basename(page)}`); await p.waitForFunction(() => window.render && window.READY);
const fr = await p.$("#frame");
if (stills) for (const t of stills.slice(9).split(",").map(Number)) { await p.evaluate((ms) => window.render(ms), t * 1000); await fr.screenshot({ path: path.join(dir, "stills", `st_${t}.png`) }); }
else {
  // motion blur: 4 subframes per frame spread over a 180-degree shutter (half the frame time), averaged by ffmpeg
  const n = 210, SUB = 4, shutter = (1000 / 30) * 0.5;
  const ff = spawn(FF, ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(30 * SUB), "-c:v", "png", "-i", "-",
    "-vf", `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/30/TB`, "-r", "30",
    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-frames:v", String(n), out], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((r) => ff.on("close", r));
  for (let i = 0; i < n; i++) for (let k = 0; k < SUB; k++) {
    await p.evaluate((ms) => window.render(ms), (i * 1000) / 30 + (k / SUB - .5) * shutter);
    const buf = await fr.screenshot({ type: "png" }); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r)); }
  ff.stdin.end(); await done; console.log("frames", n, out); }
await b.close(); srv.close();
