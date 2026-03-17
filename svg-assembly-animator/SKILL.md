---
name: svg-assembly-animator
description: 为 SVG 矢量图创建充满“力量感”与“速度感”的零件组装动画，并支持一键导出 30fps 的透明背景序列帧。适用于需要将静态 SVG 转换为可用于视频剪辑（如 AE/PR）的透明素材场景。
---

# SVG Assembly Animator

这个 Skill 专门用于将静态 SVG 转换为具有专业动效（Viscous & Dynamic 风格）的 HTML5 动画，并提供透明序列帧导出功能。

## 核心工作流

1. **分析 SVG 结构**：读取 SVG 文件，识别出主要的“船体/主体”（通常是第一个 path）和“细节零件”（剩余 path）。
2. **准备 HTML 模板**：
   - 使用 GSAP (TweenMax) 作为动画引擎。
   - 使用 JSZip 和 Canvas 实现纯前端透明帧导出。
   - 加载内置资产 `assets/animation_template.html` 作为基础。
3. **实现动画逻辑**（参考 `references/animation_logic.md`）：
   - **打散阶段**：利用“反向逻辑”，将零件随机抛射到视口外，并进行极端的轴向缩放（ScaleX: 0.05, ScaleY: 4）以营造速度感。
   - **组装阶段**：
     - 主体骨架率先以 `elastic.out` 效果浮现。
     - 零件以 `stagger` 随机顺序飞入，伴随 `back.out` 的过冲回弹（Overshoot）。
     - 整体场景伴随大角度旋转（180° 或 360°）和缩放。
4. **生成与交付**：生成 `.html` 文件，提示用户可以在浏览器中预览并点击导出按钮。

## 动画参数建议

- **标准组装**：`duration: 1.2`, `ease: "back.out(2.5)"`。
- **力量组装**：`duration: 0.7`, `ease: "back.out(5)"`, `rotation: -360`。
- **优雅组装**：`duration: 1.5`, `ease: "power4.out"`, `stagger: 0.02`。

## 导出说明

- 默认导出 1080x1080 分辨率、30fps 的透明 PNG 序列帧 ZIP 包。
- 如果用户需要合成视频，可建议使用以下 ffmpeg 命令：
  `ffmpeg -framerate 30 -i frame_%04d.png -vcodec prores_ks -profile:v 4 -pix_fmt yuva444p10le output.mov`

## 关联资源
- **动画经验法则**：`references/animation_logic.md`
- **HTML 基础模板**：`assets/animation_template.html`
