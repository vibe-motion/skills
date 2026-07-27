import React from 'react';
import {Audio, Video} from '@remotion/media';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';

export type ThemeName = 'studio' | 'apple' | 'paper' | 'data-wall';
export type MediaKind = 'video' | 'image';
export type FitMode = 'cover' | 'contain';
export type FaceSafeSide = 'left' | 'center' | 'right';

export type MediaControl = {
  src?: string;
  kind?: MediaKind;
  fit?: FitMode;
  focalX?: number;
  focalY?: number;
  scale?: number;
  startFrom?: number;
  endAt?: number;
  playbackRate?: number;
  blurBackdrop?: boolean;
  muted?: boolean;
  faceSafeSide?: FaceSafeSide;
};

export type KnowledgeNode = {
  id: string;
  label: string;
  subtitle?: string;
  tier?: 'application' | 'model' | 'infrastructure' | 'person' | 'product';
  x: number;
  y: number;
  width?: number;
  color?: string;
};

export type KnowledgeEdge = {
  id: string;
  from: string;
  to: string;
  type?: 'invest' | 'supply' | 'compete' | 'partner' | 'owns';
  label?: string;
  color?: string;
};

export type CameraState = {
  x: number;
  y: number;
  scale: number;
  rotateX?: number;
  rotateZ?: number;
};

export type TimelineBeat = {
  id: string;
  text: string;
  startMs: number;
  endMs: number;
  from: number;
  duration: number;
  end: number;
  semantic: {tags: string[]; entityHints?: string[]};
  visual: {
    composition: string;
    reason?: string;
    brollQuery?: string;
    assetPath?: string;
    assetKind?: MediaKind;
    assetCandidates?: Array<{path?: string; title?: string}>;
    knowledgeMode?: 'orbit' | 'map' | 'relationship';
    focusNodeIds?: string[];
    focusEdgeIds?: string[];
    camera?: Partial<CameraState>;
  };
  audio: {
    bgm?: {
      src?: string;
      emotion?: string;
      intensity?: number;
      crossfadeMs?: number;
      instruments?: string[];
    };
    sfx?: Array<{
      type: string;
      at: number;
      src?: string;
      volume?: number;
      reason?: string;
    }>;
  };
  transition: {in: string; out: string; durationFrames: number};
  lifecycle: {entryFrames: number; holdFrames: number; exitFrames: number};
  caption: {
    text: string;
    startMs: number;
    endMs: number;
    timestampMs: number | null;
    confidence: number | null;
  };
};

export type SrtTimeline = {
  schemaVersion: string;
  authority: 'srt';
  fps: number;
  durationMs: number;
  durationInFrames: number;
  beats: TimelineBeat[];
};

const themes = {
  studio: {
    background: '#10120f',
    surface: '#252921',
    paper: '#fffdf7',
    ink: '#11120f',
    text: '#fffdf7',
    muted: '#aeb5a7',
    accent: '#c9f36a',
    secondary: '#ff7658',
    grid: 'rgba(255,255,255,.035)',
  },
  apple: {
    background: '#f5f5f7',
    surface: '#ffffff',
    paper: '#ffffff',
    ink: '#1d1d1f',
    text: '#1d1d1f',
    muted: '#6e6e73',
    accent: '#0071e3',
    secondary: '#ff375f',
    grid: 'rgba(29,29,31,.045)',
  },
  paper: {
    background: '#eee6d5',
    surface: '#f9f4e8',
    paper: '#fffaf0',
    ink: '#282219',
    text: '#282219',
    muted: '#756b5c',
    accent: '#d65035',
    secondary: '#1c7086',
    grid: 'rgba(40,34,25,.055)',
  },
  'data-wall': {
    background: '#071016',
    surface: '#10212b',
    paper: '#eaf8ff',
    ink: '#071016',
    text: '#eaf8ff',
    muted: '#7fa4b5',
    accent: '#37e1ff',
    secondary: '#ffb84d',
    grid: 'rgba(55,225,255,.055)',
  },
} as const;

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const resolveMedia = (src: string) =>
  /^(https?:|data:|blob:)/.test(src) ? src : staticFile(src);

export const SrtDrivenVideoSchema = z.object({
  theme: z.enum(['studio', 'apple', 'paper', 'data-wall']),
  title: z.string(),
  captionBottom: z.number().min(70).max(300),
  captionColor: zColor(),
  showDebug: z.boolean(),
});

export type SrtDrivenStudioProps = z.infer<typeof SrtDrivenVideoSchema>;

export type SrtDrivenVideoProps = z.infer<typeof SrtDrivenVideoSchema> & {
  timeline: SrtTimeline;
  aRoll?: MediaControl;
  graph?: {nodes: KnowledgeNode[]; edges: KnowledgeEdge[]};
};

const fallbackGraph: {nodes: KnowledgeNode[]; edges: KnowledgeEdge[]} = {
  nodes: [
    {id: 'microsoft', label: 'Microsoft', subtitle: '云服务', tier: 'application', x: 320, y: 190, color: '#8bb7ff'},
    {id: 'amazon', label: 'Amazon', subtitle: '云服务', tier: 'application', x: 920, y: 155, color: '#ffe8ae'},
    {id: 'google', label: 'Google', subtitle: '云 + 模型', tier: 'application', x: 1490, y: 220, color: '#dce8ff'},
    {id: 'openai', label: 'OpenAI', subtitle: '大模型', tier: 'model', x: 520, y: 500, color: '#fffdf7'},
    {id: 'anthropic', label: 'Anthropic', subtitle: '大模型', tier: 'model', x: 1180, y: 505, color: '#f4dfbd'},
    {id: 'nvidia', label: 'NVIDIA', subtitle: '芯片', tier: 'infrastructure', x: 420, y: 650, color: '#c9f36a'},
    {id: 'amd', label: 'AMD', subtitle: '芯片', tier: 'infrastructure', x: 1000, y: 660, color: '#d9f3df'},
    {id: 'oracle', label: 'Oracle', subtitle: '云服务', tier: 'infrastructure', x: 1510, y: 650, color: '#ffd9d2'},
  ],
  edges: [
    {id: 'microsoft-openai', from: 'microsoft', to: 'openai', type: 'invest', label: '投资', color: '#ff7658'},
    {id: 'nvidia-openai', from: 'nvidia', to: 'openai', type: 'supply', label: '算力', color: '#c9f36a'},
    {id: 'amazon-anthropic', from: 'amazon', to: 'anthropic', type: 'invest', label: '投资', color: '#ff7658'},
    {id: 'google-anthropic', from: 'google', to: 'anthropic', type: 'partner', label: '合作', color: '#8bb7ff'},
    {id: 'amd-anthropic', from: 'amd', to: 'anthropic', type: 'supply', label: '算力', color: '#c9f36a'},
    {id: 'oracle-openai', from: 'oracle', to: 'openai', type: 'partner', label: '云合作', color: '#8bb7ff'},
  ],
};

export const SmartMedia: React.FC<{
  control?: MediaControl;
  label?: string;
  background?: string;
}> = ({control, label = '媒体素材', background = '#353a32'}) => {
  const frame = useCurrentFrame();
  if (!control?.src) {
    const safeX =
      control?.faceSafeSide === 'left' ? '31%' : control?.faceSafeSide === 'right' ? '69%' : '50%';
    return (
      <AbsoluteFill style={{background: `linear-gradient(135deg,${background},#111)`}}>
        <div
          style={{
            position: 'absolute',
            left: safeX,
            top: '17%',
            width: 245,
            height: 245,
            borderRadius: '50%',
            background: '#8f978b',
            translate: '-50% 0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: safeX,
            bottom: '-12%',
            width: 560,
            height: 640,
            borderRadius: '48% 48% 10% 10%',
            background: '#474d45',
            translate: '-50% 0',
          }}
        />
        <div style={{position: 'absolute', left: 38, top: 34, fontSize: 25, fontWeight: 800}}>
          {label}
        </div>
      </AbsoluteFill>
    );
  }

  const fit = control.fit ?? 'cover';
  const focalX = Math.min(100, Math.max(0, control.focalX ?? 50));
  const focalY = Math.min(100, Math.max(0, control.focalY ?? 40));
  const mediaStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: fit,
    objectPosition: `${focalX}% ${focalY}%`,
    scale: control.scale ?? 1,
  };
  const element =
    control.kind === 'image' ? (
      <Img src={resolveMedia(control.src)} style={mediaStyle} />
    ) : (
      <Video
        src={resolveMedia(control.src)}
        style={mediaStyle}
        muted={control.muted ?? true}
        startFrom={control.startFrom}
        endAt={control.endAt}
        playbackRate={control.playbackRate ?? 1}
      />
    );
  return (
    <AbsoluteFill style={{background}}>
      {fit === 'contain' && control.blurBackdrop ? (
        control.kind === 'image' ? (
          <Img
            src={resolveMedia(control.src)}
            style={{
              position: 'absolute',
              inset: -50,
              width: 'calc(100% + 100px)',
              height: 'calc(100% + 100px)',
              objectFit: 'cover',
              objectPosition: `${focalX}% ${focalY}%`,
              filter: 'blur(34px) brightness(.52)',
              scale: 1.08,
            }}
          />
        ) : (
          <Video
            src={resolveMedia(control.src)}
            muted
            startFrom={control.startFrom}
            endAt={control.endAt}
            playbackRate={control.playbackRate ?? 1}
            style={{
              position: 'absolute',
              inset: -50,
              width: 'calc(100% + 100px)',
              height: 'calc(100% + 100px)',
              objectFit: 'cover',
              objectPosition: `${focalX}% ${focalY}%`,
              filter: 'blur(34px) brightness(.52)',
              scale: 1.08,
            }}
          />
        )
      ) : null}
      <div style={{position: 'absolute', inset: 0, opacity: interpolate(frame, [0, 6], [0, 1], clamp)}}>
        {element}
      </div>
    </AbsoluteFill>
  );
};

const getBeatAtFrame = (timeline: SrtTimeline, frame: number) =>
  timeline.beats.find((beat) => frame >= beat.from && frame < beat.end) ??
  timeline.beats[timeline.beats.length - 1];

const cameraForBeat = (beat: TimelineBeat | undefined): CameraState => {
  if (!beat) return {x: 0, y: 0, scale: 0.9, rotateX: 0, rotateZ: 0};
  const explicit = beat.visual.camera ?? {};
  const mode = beat.visual.knowledgeMode;
  const defaults =
    mode === 'relationship'
      ? {x: -20, y: -10, scale: 1.05, rotateX: 1.5, rotateZ: -0.4}
      : mode === 'orbit'
        ? {x: 30, y: -20, scale: 0.96, rotateX: 0.5, rotateZ: 0}
        : {x: 0, y: -35, scale: 0.92, rotateX: 2.2, rotateZ: 0};
  return {...defaults, ...explicit};
};

const nodeCenter = (node: KnowledgeNode) => ({
  x: node.x + (node.width ?? 270) / 2,
  y: node.y + 80,
});

const GraphCard: React.FC<{
  node: KnowledgeNode;
  active: boolean;
  theme: ThemeName;
  delay: number;
  localFrame: number;
}> = ({node, active, theme, delay, localFrame}) => {
  const palette = themes[theme];
  const progress = interpolate(localFrame, [delay, delay + 16], [0, 1], {...clamp, easing: ease});
  return (
    <div
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        width: node.width ?? 270,
        height: 160,
        padding: '26px 28px',
        borderRadius: theme === 'paper' ? 5 : 24,
        background: node.color ?? palette.paper,
        color: palette.ink,
        border: active ? `7px solid ${palette.secondary}` : '3px solid rgba(255,255,255,.38)',
        boxShadow: active
          ? `0 0 0 11px ${palette.secondary}22,0 35px 75px rgba(0,0,0,.42)`
          : '0 24px 54px rgba(0,0,0,.28)',
        opacity: progress,
        translate: `0 ${48 * (1 - progress)}px`,
        scale: active ? 1.08 : 1,
        rotate: theme === 'paper' ? `${((node.x + node.y) % 7) - 3}deg` : '0deg',
        zIndex: active ? 8 : 4,
      }}
    >
      <div style={{fontSize: 34, lineHeight: 1, fontWeight: 950}}>{node.label}</div>
      <div style={{fontSize: 21, marginTop: 38, opacity: 0.58, fontWeight: 760}}>
        {node.subtitle}
      </div>
    </div>
  );
};

export const KnowledgeWorld: React.FC<{
  timeline: SrtTimeline;
  graph?: {nodes: KnowledgeNode[]; edges: KnowledgeEdge[]};
  theme?: ThemeName;
  showPresenter?: boolean;
  presenter?: MediaControl;
}> = ({timeline, graph = fallbackGraph, theme = 'studio', showPresenter = true, presenter}) => {
  const frame = useCurrentFrame();
  const palette = themes[theme];
  const activeBeat = getBeatAtFrame(timeline, frame);
  const beatIndex = Math.max(0, timeline.beats.findIndex((beat) => beat.id === activeBeat.id));
  const previousBeat = timeline.beats[Math.max(0, beatIndex - 1)];
  const localFrame = frame - activeBeat.from;
  const cameraProgress = interpolate(
    localFrame,
    [0, Math.min(24, Math.max(1, activeBeat.duration / 3))],
    [0, 1],
    {...clamp, easing: ease},
  );
  const previousCamera = cameraForBeat(previousBeat);
  const nextCamera = cameraForBeat(activeBeat);
  const camera = {
    x: interpolate(cameraProgress, [0, 1], [previousCamera.x, nextCamera.x]),
    y: interpolate(cameraProgress, [0, 1], [previousCamera.y, nextCamera.y]),
    scale: interpolate(cameraProgress, [0, 1], [previousCamera.scale, nextCamera.scale]),
    rotateX: interpolate(cameraProgress, [0, 1], [previousCamera.rotateX ?? 0, nextCamera.rotateX ?? 0]),
    rotateZ: interpolate(cameraProgress, [0, 1], [previousCamera.rotateZ ?? 0, nextCamera.rotateZ ?? 0]),
  };
  const focusNodes = new Set(activeBeat.visual.focusNodeIds ?? []);
  const focusEdges = new Set(activeBeat.visual.focusEdgeIds ?? []);
  const relationProgress = interpolate(localFrame, [10, Math.min(46, activeBeat.duration - 1)], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        background: palette.background,
        color: palette.text,
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, PingFang SC, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${palette.grid} 1px,transparent 1px),linear-gradient(90deg,${palette.grid} 1px,transparent 1px)`,
          backgroundSize: '52px 52px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 1920,
          height: 1080,
          translate: `calc(-50% + ${camera.x}px) calc(-50% + ${camera.y}px)`,
          scale: camera.scale,
          rotate: `${camera.rotateZ}deg`,
          transformStyle: 'preserve-3d',
          transform: `perspective(1600px) rotateX(${camera.rotateX}deg)`,
        }}
      >
        <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
          {graph.edges.map((edge) => {
            const from = graph.nodes.find((node) => node.id === edge.from);
            const to = graph.nodes.find((node) => node.id === edge.to);
            if (!from || !to) return null;
            const start = nodeCenter(from);
            const end = nodeCenter(to);
            const active = focusEdges.has(edge.id) || (focusNodes.has(edge.from) && focusNodes.has(edge.to));
            const dashOffset = active ? 680 * (1 - relationProgress) : 0;
            return (
              <g key={edge.id} opacity={focusNodes.size && !active ? 0.15 : active ? 1 : 0.46}>
                <path
                  d={`M${start.x} ${start.y} C${start.x} ${(start.y + end.y) / 2} ${end.x} ${(start.y + end.y) / 2} ${end.x} ${end.y}`}
                  fill="none"
                  stroke={edge.color ?? palette.accent}
                  strokeWidth={active ? 13 : 7}
                  strokeLinecap="round"
                  strokeDasharray={active ? 680 : undefined}
                  strokeDashoffset={active ? dashOffset : undefined}
                />
              </g>
            );
          })}
        </svg>
        {graph.nodes.map((node, index) => (
          <div
            key={node.id}
            style={{
              opacity: focusNodes.size && !focusNodes.has(node.id) ? 0.24 : 1,
              filter: focusNodes.size && !focusNodes.has(node.id) ? 'saturate(.35)' : undefined,
            }}
          >
            <GraphCard
              node={node}
              active={focusNodes.has(node.id)}
              theme={theme}
              delay={4 + index * 3}
              localFrame={localFrame}
            />
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 610,
          top: 28,
          width: 700,
          padding: '18px 30px 20px',
          borderRadius: 22,
          background: `${palette.background}ee`,
          border: `2px solid ${palette.grid}`,
          textAlign: 'center',
          boxShadow: '0 16px 44px rgba(0,0,0,.22)',
          zIndex: 30,
        }}
      >
        <div style={{fontSize: 26, letterSpacing: 4, fontWeight: 850, color: palette.accent}}>
          KNOWLEDGE WORLD
        </div>
        <div style={{fontSize: 38, lineHeight: 1.08, marginTop: 8, fontWeight: 950}}>
          {activeBeat.visual.reason ?? '关系持续存在 摄影机负责叙事'}
        </div>
      </div>
      {showPresenter ? (
        <div
          style={{
            position: 'absolute',
            right: 70,
            bottom: 72,
            width: 255,
            height: 255,
            overflow: 'hidden',
            borderRadius: '50%',
            border: `9px solid ${palette.accent}`,
            boxShadow: '0 22px 65px rgba(0,0,0,.42)',
          }}
        >
          <SmartMedia control={{...presenter, faceSafeSide: 'center'}} label="主持人" />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const lifecycleOpacity = (beat: TimelineBeat, localFrame: number) => {
  const enter = Math.max(1, beat.lifecycle?.entryFrames ?? 10);
  const exit = Math.max(0, beat.lifecycle?.exitFrames ?? 0);
  const inOpacity = interpolate(localFrame, [0, enter], [0, 1], clamp);
  if (!exit) return inOpacity;
  const outOpacity = interpolate(localFrame, [beat.duration - exit, beat.duration], [1, 0], clamp);
  return Math.min(inOpacity, outOpacity);
};

const BasicBeatVisual: React.FC<{
  beat: TimelineBeat;
  aRoll?: MediaControl;
  theme: ThemeName;
}> = ({beat, aRoll, theme}) => {
  const frame = useCurrentFrame();
  const palette = themes[theme];
  const visual = beat.visual;
  const asset =
    visual.assetPath ??
    visual.assetCandidates?.find((candidate) => candidate.path?.startsWith('assets/'))?.path;
  const isData = visual.composition === 'WideDataSidebar';
  const isDocument = visual.composition === 'WideSourceDocument';
  const isFullBroll = ['WideEvidenceBridge', 'WideBrollFullCover'].includes(visual.composition);
  const life = lifecycleOpacity(beat, frame);
  const mediaControl: MediaControl | undefined = asset
    ? {
        src: asset,
        kind: visual.assetKind ?? 'video',
        fit: isDocument ? 'contain' : 'cover',
        blurBackdrop: isDocument,
        muted: true,
      }
    : aRoll;
  const push = interpolate(frame, [0, Math.min(28, beat.duration - 1)], [0.94, 1], {...clamp, easing: ease});

  return (
    <AbsoluteFill style={{background: palette.background, color: palette.text}}>
      <div style={{position: 'absolute', inset: 0, scale: isFullBroll ? push : 1}}>
        <SmartMedia
          control={{...mediaControl, faceSafeSide: isData ? 'left' : mediaControl?.faceSafeSide}}
          label={visual.brollQuery || visual.composition}
          background={palette.surface}
        />
      </div>
      <AbsoluteFill
        style={{
          background: isDocument
            ? 'rgba(0,0,0,.18)'
            : 'linear-gradient(90deg,rgba(0,0,0,.62),transparent 62%),linear-gradient(0deg,rgba(0,0,0,.66),transparent 55%)',
        }}
      />
      {isData ? (
        <div
          style={{
            position: 'absolute',
            right: 82,
            top: 150,
            width: 520,
            padding: '38px 42px',
            borderRadius: 28,
            color: palette.ink,
            background: palette.paper,
            boxShadow: '0 30px 80px rgba(0,0,0,.28)',
          }}
        >
          <div style={{fontSize: 25, letterSpacing: 3, color: palette.secondary, fontWeight: 850}}>
            DATA FROM SRT
          </div>
          <div style={{fontSize: 76, lineHeight: 1.08, marginTop: 24, fontWeight: 950}}>
            {beat.text.match(/(?:\d+(?:\.\d+)?%?|\d+[万亿]|[$¥￥]\s*\d+)/)?.[0] ?? '关键数据'}
          </div>
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 94,
          maxWidth: isData ? 940 : 1220,
          opacity: interpolate(frame, [4, 16], [0, life], clamp),
          translate: `0 ${interpolate(frame, [4, 24], [40, 0], {...clamp, easing: ease})}px`,
        }}
      >
        <div style={{fontSize: 24, letterSpacing: 4, color: palette.accent, fontWeight: 850}}>
          {beat.semantic.tags.join(' · ').toUpperCase() || 'STORY BEAT'}
        </div>
        <div style={{fontSize: 72, lineHeight: 1.08, marginTop: 18, fontWeight: 950}}>
          {visual.brollQuery?.slice(0, 34)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CaptionLayer: React.FC<{
  timeline: SrtTimeline;
  bottom: number;
  color: string;
}> = ({timeline, bottom, color}) => {
  const frame = useCurrentFrame();
  const beat = getBeatAtFrame(timeline, frame);
  if (!beat) return null;
  const localFrame = frame - beat.from;
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom,
        width: 1200,
        color,
        fontSize: 48,
        lineHeight: 1.22,
        fontWeight: 900,
        textAlign: 'center',
        textShadow: '0 4px 16px rgba(0,0,0,.82)',
        opacity: interpolate(localFrame, [0, Math.min(7, beat.duration - 1)], [0, 1], clamp),
        translate: `-50% ${interpolate(localFrame, [0, Math.min(12, beat.duration - 1)], [24, 0], {...clamp, easing: ease})}px`,
        zIndex: 80,
      }}
    >
      {beat.caption.text}
    </div>
  );
};

const TransitionCue: React.FC<{beat: TimelineBeat; theme: ThemeName}> = ({beat, theme}) => {
  const frame = useCurrentFrame();
  const palette = themes[theme];
  const duration = Math.max(1, beat.transition.durationFrames ?? 10);
  const progress = interpolate(frame, [0, duration], [0, 1], clamp);
  if (beat.transition.in === 'match-cut' || beat.transition.in === 'camera') return null;
  if (beat.transition.in === 'impact-cut') {
    return (
      <AbsoluteFill
        style={{
          background: palette.paper,
          opacity: interpolate(progress, [0, 0.35, 1], [0.8, 0.38, 0]),
          zIndex: 70,
        }}
      />
    );
  }
  const fromLeft = beat.transition.in === 'paper-reveal';
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 70,
        background: beat.transition.in === 'foreground-occlusion' ? palette.secondary : palette.accent,
        clipPath: fromLeft
          ? `inset(0 ${100 * progress}% 0 0)`
          : `inset(0 0 0 ${100 * progress}%)`,
      }}
    />
  );
};

const AudioCues: React.FC<{timeline: SrtTimeline}> = ({timeline}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      {timeline.beats.map((beat) => {
        const bgm = beat.audio.bgm;
        const fadeFrames = Math.max(1, Math.round(((bgm?.crossfadeMs ?? 1800) / 1000) * fps));
        return bgm?.src ? (
          <Sequence key={`bgm-${beat.id}`} from={beat.from} durationInFrames={beat.duration}>
            <Audio
              src={resolveMedia(bgm.src)}
              volume={(localFrame) => {
                const enter = interpolate(localFrame, [0, fadeFrames], [0, bgm.intensity ?? 0.42], clamp);
                const exit = interpolate(
                  localFrame,
                  [Math.max(0, beat.duration - fadeFrames), beat.duration],
                  [bgm.intensity ?? 0.42, 0],
                  clamp,
                );
                return Math.min(enter, exit);
              }}
            />
          </Sequence>
        ) : null;
      })}
      {timeline.beats.flatMap((beat) =>
        (beat.audio.sfx ?? []).map((cue, index) => {
          if (!cue.src) return null;
          const from = beat.from + Math.round(beat.duration * cue.at);
          return (
            <Sequence key={`sfx-${beat.id}-${index}`} from={from}>
              <Audio src={resolveMedia(cue.src)} volume={cue.volume ?? 0.55} />
            </Sequence>
          );
        }),
      )}
    </>
  );
};

export const SrtDrivenVideo: React.FC<SrtDrivenVideoProps> = ({
  timeline,
  aRoll,
  graph = fallbackGraph,
  theme = 'studio',
  title = 'SRT 驱动视频系统',
  captionBottom = 104,
  captionColor = '#fffdf7',
  showDebug = false,
}) => {
  const frame = useCurrentFrame();
  const knowledgeBeatIds = new Set(
    timeline.beats
      .filter((beat) => beat.visual.composition === 'WideKnowledgeWorld')
      .map((beat) => beat.id),
  );
  const activeBeat = getBeatAtFrame(timeline, frame);
  const knowledgeActive = knowledgeBeatIds.has(activeBeat.id);

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, opacity: knowledgeActive ? 1 : 0}}>
        <KnowledgeWorld timeline={timeline} graph={graph} theme={theme} presenter={aRoll} />
      </div>
      {timeline.beats.map((beat) => {
        if (knowledgeBeatIds.has(beat.id)) return null;
        return (
          <Sequence key={beat.id} from={beat.from} durationInFrames={beat.duration}>
            <div style={{position: 'absolute', inset: 0}}>
              <BasicBeatVisual beat={beat} aRoll={aRoll} theme={theme} />
            </div>
            <TransitionCue beat={beat} theme={theme} />
          </Sequence>
        );
      })}
      {!knowledgeActive ? null : (
        <Sequence from={activeBeat.from} durationInFrames={activeBeat.duration}>
          <TransitionCue beat={activeBeat} theme={theme} />
        </Sequence>
      )}
      <CaptionLayer timeline={timeline} bottom={captionBottom} color={captionColor} />
      <AudioCues timeline={timeline} />
      {showDebug ? (
        <div
          style={{
            position: 'absolute',
            right: 34,
            top: 28,
            padding: '12px 18px',
            borderRadius: 12,
            background: 'rgba(0,0,0,.75)',
            color: '#fff',
            fontSize: 20,
            fontFamily: 'monospace',
            zIndex: 100,
          }}
        >
          {title} · {activeBeat.id} · {activeBeat.visual.composition} · {frame}f
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const defaultKnowledgeGraph = fallbackGraph;
