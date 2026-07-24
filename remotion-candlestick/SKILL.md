---
name: remotion-candlestick
description: >
  在 Remotion 项目中创建带动画的金融 K 线图（蜡烛图）。涵盖数据获取（Yahoo Finance）、
  插件架构（config / timeline / Scene / plugin）、Canvas 逐帧绘制、深色交易终端风格、
  以及 Remotion Studio 预览和渲染输出。触发词：K线图、蜡烛图、candlestick、OHLC、
  股票动画、金融图表视频、Remotion 图表。
metadata:
  type: project
---

# Remotion 蜡烛图 (Candlestick) 动画制作流程

本 skill 记录了在 vibe-motion-app 这个 Remotion 项目中创建 S&P 500 K 线图的完整制作过程。

## 前置条件

- Remotion 4.0.438 项目，已配置 React 19 + TailwindCSS v4
- 插件架构：`motion/` 定义场景，`remotion/` 处理 Remotion 合成管线
- pnpm 作为包管理器

## 步骤 1：获取金融数据

Yahoo Finance 提供免费的历史 OHLC 数据（无需 API Key）。

创建 `scripts/fetch-sp500-data.mjs`：

```js
// 核心：调用 Yahoo Finance Chart API
const url = `https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?period1=${PERIOD1}&period2=${PERIOD2}&interval=1wk`;
const resp = await fetch(url);
const json = await resp.json();
const result = json.chart?.result?.[0];
const ts = result.timestamp;
const quote = result.indicators.quote[0];
// 提取 { t: timestamp, o: open, h: high, l: low, c: close }
```

保存到 `public/data/sp500-weekly.json`，供 Remotion 通过 `staticFile()` 加载。

**参数说明：**
- `%5EGSPC` = S&P 500 的 Yahoo 符号（`^GSPC` URL 编码）
- `interval=1wk` = 周线；可选 `1d`, `1mo`
- `period1` / `period2` = Unix 时间戳，覆盖约 40 年（1984-2026）

## 步骤 2：创建插件文件结构

每个 Remotion 插件需要 4 个核心文件 + 渲染预设：

```
motion/插件名/
  config.js                 → 默认参数
  timeline.js               → 场景上下文 + 逐帧动画计算
  Scene.jsx                 → React 组件（Canvas 绘制）
  plugin.js                 → 插件注册对象
  render-presets/
    default.json            → 渲染预设
```

### 2a. config.js — 默认参数

```js
export const DEFAULT_LAYOUT_PARAMS = Object.freeze({
  videoWidth: 1920,    // 16:9 横屏
  videoHeight: 1080,
});

export const DEFAULT_ANIMATION_PARAMS = Object.freeze({
  durationSeconds: 28,  // 动画总时长
  title: "S&P 500",
  subtitle: "过去40年 · 周线K线图",
});

export const DEFAULT_MOTION_PROPS = Object.freeze({
  ...DEFAULT_LAYOUT_PARAMS,
  ...DEFAULT_ANIMATION_PARAMS,
});
```

### 2b. timeline.js — 动画逻辑

必须实现三个核心函数：

```js
// 1. 场景上下文：验证 + 强制类型转换所有参数
export const resolveXxxSceneContext = (pluginParams) => { ... }

// 2. 时长计算：durationSeconds * fps
export const getXxxDurationInFrames = ({ fps, sceneContext }) => { ... }

// 3. 逐帧 props：从 frame/fps 计算 progress 等动画值
export const buildXxxSceneProps = ({ frame, fps, loop, sceneContext }) => { ... }
```

关键设计原则：**所有动画状态仅依赖 `frame` 参数**，满足 Remotion 并行渲染要求。

### 2c. Scene.jsx — Canvas 绘制组件

使用 `<canvas>` 而非大量 DOM 元素，性能更好。

**数据加载模式：**
```jsx
const [dataHandle] = useState(() => delayRender("Loading data"));

useEffect(() => {
  fetch(staticFile("data/xxx.json"))
    .then(r => r.json())
    .then(data => { setData(data); continueRender(dataHandle); })
    .catch(err => cancelRender(err));
}, [dataHandle]);
```

**Canvas 绘制核心逻辑：**
```jsx
const draw = useCallback(() => {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  // 高清屏适配
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 1. 背景填充
  // 2. 网格线 + Y轴价格刻度
  // 3. 蜡烛绘制（wick + body）
  // 4. X轴年份标签
  // 5. 标题/副标题/统计信息
  // 6. 进度条
}, [data, progress, ...]);

useEffect(() => { draw(); }, [draw]);
```

**蜡烛绘制关键参数：**
```js
const CANDLE_GAP_RATIO = 0.28;  // 蜡烛间距比例
const CANDLE_FADE_FRAMES = 22;  // 入场动画帧数
const MAX_CANDLE_W = 8;         // 最大蜡烛宽度（按缩放后）
const MIN_CANDLE_W = 0.6;       // 最小蜡烛宽度

// 蜡烛宽度随可见数量自适应
const slotW = plotWidth / visibleCount;
const bodyW = Math.max(MIN_CANDLE_W, Math.min(MAX_CANDLE_W * scale, slotW * (1 - GAP_RATIO)));
```

**入场动画（fade-in + 从底部生长）：**
```js
const appearFrame = (i / (N - 1)) * revealEndFrame;
const candleAge = currentFrame - appearFrame;
const fadeAlpha = Math.min(1, Math.max(0, candleAge / CANDLE_FADE_FRAMES));

// 生长动画
if (candleAge < CANDLE_FADE_FRAMES && candleAge > 0) {
  const growT = easeOutCubic(candleAge / CANDLE_FADE_FRAMES);
  displayBodyBottom = lerp(lowY, bodyBottom, growT);
}

ctx.globalAlpha = fadeAlpha;
// ... 绘制 wick + body ...
ctx.globalAlpha = 1;
```

**深色主题色彩：**
```js
const COLORS = {
  bg: "#1a1a19",
  grid: "#2c2c2a",
  upBorder: "#e66767",       // 阳线边框（红）
  upFill: "rgba(230,103,103,0.15)",  // 阳线填充（半透明）
  downFill: "#199e70",        // 阴线填充（绿）
  textPrimary: "#ffffff",
  textSecondary: "#c3c2b7",
  textMuted: "#898781",
  accent: "#3987e5",
};
```

### 2d. plugin.js — 插件注册

```js
export const xxxPlugin = Object.freeze({
  id: "插件ID",
  defaultProps: DEFAULT_MOTION_PROPS,
  SceneComponent: XxxScene,
  waitForSceneLayoutReady: true,  // 等待数据加载完毕

  resolveSceneContext: (params) => ...,
  getDurationInFrames: ({ fps, sceneContext }) => ...,
  buildSceneProps: ({ frame, fps, loop, sceneContext }) => ...,
  getLayout: ({ sceneContext }) => sceneContext.layout,
});
```

`waitForSceneLayoutReady: true` 确保 Scene 组件调用 `onAutoLayoutReady()` 后才开始渲染帧。

### 2e. render-presets/default.json

```json
{
  "title": "S&P 500",
  "subtitle": "过去40年 · 周线K线图",
  "videoWidth": 1920,
  "videoHeight": 1080,
  "durationSeconds": 28
}
```

## 步骤 3：注册合成

修改 `motion/project.js`，将 `ACTIVE_COMPOSITION` 切换到新插件：

```js
import { xxxPlugin } from "./xxx/plugin.js";

export const ACTIVE_COMPOSITION = Object.freeze({
  id: "SP500Kline",
  fps: 30,
  plugin: xxxPlugin,
});
```

## 步骤 4：验证和渲染

```bash
# 验证合成注册
pnpm run remotion:compositions

# 启动 Studio 预览（支持时间轴拖拽、参数调整）
pnpm run dev

# 渲染单帧截图
npx remotion still SP500Kline out/frame.png --frame=420

# 渲染完整视频
npx remotion render SP500Kline out/output.mp4

# 使用预设渲染
REMOTION_PROPS_FILE=motion/xxx/render-presets/default.json pnpm run remotion:render
```

## 常见问题

### Yahoo Finance API CORS 问题
在 Remotion 渲染环境（Node.js 无头浏览器）中不存在 CORS 问题。
如果浏览器预览遇到 CORS，使用 `staticFile()` 加载预获取的本地 JSON。

### Canvas 在高 DPI 屏幕上模糊
始终乘以 `devicePixelRatio`：
```js
canvas.width = W * dpr;
canvas.height = H * dpr;
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
```

### 蜡烛数量过多导致宽度太小
设置最小宽度 0.6px，当 `slotW < 1` 时缩小间距比或聚合数据。

### 动画进度控制
使用分段缓动函数：
- 开头 3% 快速建立基线
- 中间 90% 匀速揭示
- 结尾可以略微减速增强戏剧感
