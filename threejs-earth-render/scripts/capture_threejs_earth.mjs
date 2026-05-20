import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";

const configPath = process.argv[2];

if (!configPath) {
  throw new Error("Usage: node capture_threejs_earth.mjs <config.json>");
}

const config = JSON.parse(await fs.readFile(configPath, "utf8"));
const frameStart = Number(config.startFrame ?? 0);
const frameEnd = Number(config.endFrame ?? frameStart);
const timeoutMs = Number(config.timeoutMs ?? 120000);
const renderScale = Number(config.renderScale ?? 1);
const nativeWidth = 2048;
const nativeHeight = 1152;
const captureWidth = Math.round(nativeWidth * renderScale);
const captureHeight = Math.round(nativeHeight * renderScale);

await fs.mkdir(config.framesDir, { recursive: true });

const launchOptions = {
  headless: "new",
  defaultViewport: {
    width: captureWidth,
    height: captureHeight,
    deviceScaleFactor: 1,
  },
  args: [
    "--disable-dev-shm-usage",
    "--disable-web-security",
    "--hide-scrollbars",
    "--no-sandbox",
  ],
};

if (config.executablePath) {
  launchOptions.executablePath = config.executablePath;
}

const browser = await puppeteer.launch(launchOptions);

try {
  const page = await browser.newPage();
  page.setDefaultTimeout(timeoutMs);
  page.on("pageerror", (error) => {
    console.error(`[browser pageerror] ${error.message}`);
  });
  page.on("requestfailed", (request) => {
    console.error(`[browser requestfailed] ${request.url()} ${request.failure()?.errorText ?? ""}`);
  });

  if (config.verbose) {
    page.on("console", (message) => {
      console.log(`[browser ${message.type()}] ${message.text()}`);
    });
  }

  const url = new URL(config.url);
  url.searchParams.set("exportMode", "composite");
  url.searchParams.set("renderScale", String(renderScale));

  await page.goto(url.toString(), {
    waitUntil: "domcontentloaded",
    timeout: timeoutMs,
  });

  await page.waitForFunction(
    () => window.__SCENE_3D_EXPORT__?.isReady?.() === true,
    { timeout: timeoutMs }
  );

  const sceneInfo = await page.evaluate(() => ({
    totalFrames: window.__SCENE_3D_EXPORT__.getTotalFrames(),
    size: window.__SCENE_3D_EXPORT__.getSize(),
  }));
  const totalFrames = Number(sceneInfo.totalFrames);
  const endFrame = Math.min(frameEnd, totalFrames - 1);

  console.log(
    `[capture] ${sceneInfo.size.width}x${sceneInfo.size.height} @ ${sceneInfo.size.fps}fps, `
    + `${totalFrames} total frames`
  );

  for (let frame = frameStart; frame <= endFrame; frame += 1) {
    await page.evaluate(
      async (targetFrame) => window.__SCENE_3D_EXPORT__.setFrame(targetFrame),
      frame
    );

    const filename = `frame-${String(frame).padStart(4, "0")}.png`;
    await page.screenshot({
      path: path.join(config.framesDir, filename),
      captureBeyondViewport: false,
      omitBackground: false,
    });

    console.log(`[capture] frame ${frame + 1}/${totalFrames}`);
  }

  await fs.writeFile(
    path.join(config.framesDir, "scene-info.json"),
    JSON.stringify(sceneInfo, null, 2)
  );
} finally {
  await browser.close();
}
