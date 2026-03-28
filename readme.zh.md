[中文](./readme.zh.md) | [English](./README.md)

## 安装

```bash
npx skills add vibe-motion/skills
```

## 可用技能

### claude-typer

将纯文本提示词渲染为 Claude Code CLI 输入提示词的打字动画视频。

**效果：**
- 把提示词文本转换为 Claude Code CLI 风格的打字动画演示。

![claude-typer effect](https://img.laosunwendao.com/skill-uploads/3dbc047456374640bd00a078e22a5008.gif)

**适用场景：**
- 基于提示词内容制作技能演示。
- 产出展示“在 Claude Code 中输入提示词”过程的打字动效。

**核心能力：**
- 使用基于 Remotion 的渲染流程，对远端 composition 进行渲染。
- 使用确定性逐帧插值，适配并行/乱序渲染。

### svg-assembly-animator

创建高冲击力、高速度感的 SVG 零件组装动画，并导出 30fps 透明背景 PNG 序列帧，适用于视频合成工作流。

**效果：**
- 将静态矢量图转化为“力量感 + 速度感”明显的组装动效。

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

**适用场景：**
- 将静态 SVG 转成动态组装动画。
- 为 AE/PR 合成输出透明序列帧。
- 需要快速 HTML 预览与一键导出流程。

**核心能力：**
- 基于 `assets/animation_template.html` 构建动画输出。
- 使用 GSAP 实现交错（stagger）与回弹（overshoot）式组装运动。
- 通过 JSZip + Canvas 导出透明 PNG 序列（ZIP）。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=vibe-motion/skills&type=Date)](https://www.star-history.com/#vibe-motion/skills&Date)
