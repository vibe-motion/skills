<p align="right">
  简体中文 | <a href="./README.en.md">English</a>
</p>

## 安装

```bash
npx skills add vibe-motion/skills
```

> 提示：这是一个交互式安装脚本。用空格选择要安装的 skills，建议全部安装；另外别忘了选择对应的智能体（例如 Claude Code），不同智能体的 skill 存放路径不同。

## 可用技能

### remotion-code-motion-explainer

把脚本、旁白、字幕、产品流程、技术原理或参考视频转化为连续、可编辑、可参数化的
Remotion 代码动画。它擅长产品发布、AI 工作流、UI 交互、算法、科学原理、数据流、
系统架构、图表、公式和电路等抽象内容，并内置语义拆镜、持续空间逻辑、镜头库检索、
高保真参考复刻、音画绑定和逐帧 QC 工作流。

[![代码动画能力预览](remotion-code-motion-explainer/assets/showcase/code-motion-promo.gif)](remotion-code-motion-explainer/assets/showcase/code-motion-promo-30s.mp4)

能力示例：[220V 交流电转 15V 直流电原理动画](remotion-code-motion-explainer/assets/showcase/ac-to-dc-explainer.mp4)

[![可编辑镜头库动态预览](remotion-code-motion-explainer/assets/showcase/code-motion-shot-library-preview.gif)](remotion-code-motion-explainer/assets/showcase/code-motion-shot-library-preview.mp4)

内置镜头库包含 63 个可检索条目和 65 个 Remotion compositions。上方镜头墙展示
Prompt → Agent、AI 产品网格、玻璃仪表盘、工作流爆炸图、SRT 知识世界和霓虹路径。
这些镜头保留源码与 Props，可按品牌、文字、数据、画幅和时间重新组合。

#### 核心优势

- **先理解，再动画**：把内容拆成“输入状态 → 动作 → 系统反应 → 可见结果 → 镜头接力”，
  每个运动都有解释任务。
- **连续空间叙事**：让关键对象跨镜头持续存在并改变状态，避免 PPT 式的整屏重置。
- **完整可编辑**：文字、数据、品牌、时长、波形、路径、镜头和画幅均由 React Props
  与 Remotion 时间线控制。
- **镜头库优先**：先按语义检索已有组件，再决定复用、改造或新建；复用的是运动系统，
  不是把旧 MP4 剪进新视频。
- **高保真复刻**：可从 UI 录屏、参考视频或 AE 成片提取阶段、几何锚点、对象拓扑、
  摄影机运动和节奏峰值，再用独立组件重建。
- **确定性渲染**：同一帧由 `frame + fps + props + seeded data` 唯一决定，便于局部修复、
  自动化渲染和像素差分。
- **质量证据闭环**：同时检查语义准确、因果连续、字幕同步、安全区、数值/波形、
  最终定格、素材授权与隐私信息。

#### 工作原理

```text
脚本 / SRT / 产品说明 / 技术原理 / 参考视频
                         ↓
          语义拆解：对象、动作、数字、关系、状态
                         ↓
           导演分镜 + 持续对象表 + 镜头库检索
                         ↓
             Hook / 复杂机制 / 结尾英雄静帧
                         ↓
      React + Remotion + SVG / Canvas / WebGL / 3D
                         ↓
              旁白、字幕、标签与声音事件卡点
                         ↓
         代表帧 + 运动窗口 + 联系表 + 逐帧 QC
                         ↓
              成片 + 可编辑工程 + 可复用镜头
```

#### 与普通模板或文生视频的区别

| 对比项 | 普通模板 / 文生视频 | Code Motion Explainer |
| --- | --- | --- |
| 内容理解 | 关键词匹配或风格模仿 | 语义状态、动作与因果关系 |
| 镜头结构 | 独立画面拼接 | 持续对象与空间接力 |
| 可编辑性 | 通常只能局部修改 | 源码、Props、数据和时间线完整可编辑 |
| 技术表达 | 容易跳过中间过程 | 明确展示输入、转换与输出 |
| 复刻方式 | 追求“看起来相似” | 测量几何、拓扑、阶段和节奏 |
| 稳定性 | 重生成结果可能变化 | 逐帧确定性渲染 |
| 复用结果 | 重复套用成片模板 | 沉淀参数化组件与验证记录 |
| 交付物 | 通常只有视频 | 视频、工程、参数、镜头与 QC 证据 |

```text
使用 $remotion-code-motion-explainer，把这段产品说明做成 16:9 的连续代码动画。
要求每个操作都有可见结果，保留可编辑参数，并输出联系表和 QC 证据。
```

### ruler-progress-render

生成尺子进度动画。触发关键词：尺子进度动画；可配置文字和进度等参数。

<img src="https://img.laosunwendao.com/skill-uploads/916118e2be5c4b33a8c16f35a3b12200.gif" alt="ruler-progress effect" width="540" />

### claude-typer

把提示词文本转换为 Claude Code CLI 风格的打字动画演示。

![claude-typer effect](https://img.laosunwendao.com/skill-uploads/3dbc047456374640bd00a078e22a5008.gif)

### procedural-fish-render

生成循环游动的 procedural fish 动画。

![procedural-fish effect](https://img.laosunwendao.com/skill-uploads/96d88ab6cb9a4e1ca76abd73db08d888.gif)

### svg-assembly-animator

将静态矢量图转化为“力量感 + 速度感”明显的组装动效。

<table>
  <tr>
    <td align="center"><strong>SVG</strong></td>
    <td align="center"><strong>GIF</strong></td>
  </tr>
  <tr>
    <td><img src="https://img.laosunwendao.com/ship.svg" alt="ship svg" width="256" /></td>
    <td><img src="https://img.laosunwendao.com/ship_30fps_whitebg.gif" alt="ship gif 30fps white background" width="256" height="256" /></td>
  </tr>
</table>

### light-spotlight-render

生成摆动聚光灯扫过文字的 reveal 动画 HTML，可配置文本、摆幅、灯罩缩放、辉光和背景颜色。

<img src="light-spotlight-render/assets/demo.gif" alt="light spotlight effect" width="540" />

### remotion-3d-ticker

生成基于 Remotion 的无限循环 3D 照片滚动墙/瀑布流动画。可自由配置图片列、滚动方向与速度。

<img src="remotion-3d-ticker/assets/VerticalTicker.gif" alt="3d ticker effect" width="540" />

### remotion-vinyl-player

生成优雅逼真的黑胶唱片机/音乐播放器动画。支持自定义专辑封面、歌曲信息，并包含唱片无限旋转与文字无缝循环滚动（跑马灯）的视觉效果。

<img src="remotion-vinyl-player/assets/VinylPlayer.gif" alt="vinyl player effect" width="540" />

### threejs-earth-render

克隆或更新 `vibe-motion/threejs-earth`，并使用 Puppeteer 渲染 Three.js 3D 地球航线飞行动画。适用于地球飞线、城市航线转场和 16:9 地球动效 GIF/MP4 导出。

<img src="threejs-earth-render/assets/earth.gif" alt="threejs earth route animation" width="448" />

### wechat-2d-render

克隆或更新 `sxhzju/wechat-2d`，并渲染默认微信聊天 2D 动效视频。适用于微信聊天动画、视频消息气泡动效和透明背景 Remotion 导出。

<img src="wechat-2d-render/assets/wechat-2d-demo.gif" alt="wechat 2d chat motion effect" width="390" />

## 杂项

### 鱼群模拟

基于 Three.js 的 boids 鱼群模拟项目。这个不是 skill，只作为独立项目展示。

项目地址：[vibe-motion/threejs-boids](https://github.com/vibe-motion/threejs-boids)

<img src="https://raw.githubusercontent.com/vibe-motion/threejs-boids/%E4%BA%A4%E4%BA%92%E9%B1%BC%E7%BC%B8/demo.gif" alt="threejs boids fish school simulation" width="540" />

## 交流

- wechat群已满，后续可加入tg群交流: t.me/zjucat
<p align="center">
  <img src="https://img.laosunwendao.com/skill-uploads/c6e7b3f9a1e74c129866a6846a2246ee.jpg" alt="TG 交流群二维码" width="176" />
</p>

- 科技/科普自媒体收徒（有偿，非诚勿扰）
<p align="center">
  <img src="https://img.laosunwendao.com/skill-uploads/49bbd79ea9554357a2b9a9e839748dcc.jpg" alt="科技/科普自媒体收徒联系方式二维码" width="176" />
</p>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=vibe-motion/skills&type=Date)](https://www.star-history.com/#vibe-motion/skills&Date)
