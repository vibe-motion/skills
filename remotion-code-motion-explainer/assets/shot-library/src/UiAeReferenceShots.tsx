import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
const overshoot = Easing.bezier(0.34, 1.56, 0.64, 1);

const progress = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = easeOut,
) =>
  interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing,
  });

const UiStage: React.FC<
  React.PropsWithChildren<{background?: string; color?: string}>
> = ({children, background = '#050608', color = '#f8fbff'}) => (
  <AbsoluteFill
    style={{
      overflow: 'hidden',
      background,
      color,
      fontFamily:
        'Inter, SF Pro Display, -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif',
    }}
  >
    {children}
  </AbsoluteFill>
);

const NeonStar: React.FC<{
  size?: number;
  color?: string;
  opacity?: number;
}> = ({size = 44, color = '#77f7ff', opacity = 1}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{opacity}}>
    <path
      d="M50 4 C55 36 64 45 96 50 C64 55 55 64 50 96 C45 64 36 55 4 50 C36 45 45 36 50 4Z"
      fill={color}
    />
    <path
      d="M50 18 C53 39 61 47 82 50 C61 53 53 61 50 82 C47 61 39 53 18 50 C39 47 47 39 50 18Z"
      fill="#161631"
    />
  </svg>
);

const CursorGlyph: React.FC<{size?: number; color?: string}> = ({
  size = 52,
  color = '#7fefff',
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path
      d="M10 6 L53 31 L35 36 L27 56 Z"
      fill={color}
      stroke="#ffffff"
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </svg>
);

const SoftGlow: React.FC<{
  x: string;
  y: string;
  size: number;
  color: string;
  opacity?: number;
  blur?: number;
}> = ({x, y, size, color, opacity = 0.55, blur = 38}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      opacity,
      filter: `blur(${blur}px)`,
      translate: '-50% -50%',
      mixBlendMode: 'screen',
    }}
  />
);

export type UiAeNeonPathSystemProps = {
  eyebrow: string;
  title: string;
  steps: string[];
  accentA?: string;
  accentB?: string;
  accentC?: string;
};

/**
 * Responsive reconstruction of the two Youmotion-style references.
 * The same semantic object graph is intentionally used in wide and portrait
 * compositions so the asset library tests responsive choreography, not crops.
 */
export const UiAeNeonPathSystem: React.FC<UiAeNeonPathSystemProps> = ({
  eyebrow,
  title,
  steps,
  accentA = '#725bff',
  accentB = '#27e7ff',
  accentC = '#ff3fb4',
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height / width > 1.05;
  const cx = width * 0.5;
  const cy = height * (portrait ? 0.43 : 0.48);
  const pathWidth = width * (portrait ? 0.66 : 0.58);
  const pathHeight = height * (portrait ? 0.34 : 0.45);
  const draw = progress(frame, 8, 64, easeInOut);
  const orbit = progress(frame, 12, 78, easeInOut);
  const cardIn = progress(frame, 54, 80, overshoot);
  const focus = progress(frame, 92, 130, easeInOut);
  const stepPhase = progress(frame, 126, 184, easeInOut);
  const resolution = progress(frame, 184, 228, easeInOut);
  const pillWidth = interpolate(cardIn, [0, 1], [70, portrait ? width * 0.68 : width * 0.4]);
  const activeStep = Math.min(
    Math.max(steps.length - 1, 0),
    Math.floor(interpolate(stepPhase, [0, 1], [0, steps.length], clamp)),
  );
  const path = `M ${cx - pathWidth * 0.48} ${cy + pathHeight * 0.34}
    C ${cx - pathWidth * 0.65} ${cy - pathHeight * 0.22},
      ${cx - pathWidth * 0.15} ${cy - pathHeight * 0.58},
      ${cx + pathWidth * 0.02} ${cy - pathHeight * 0.12}
    S ${cx + pathWidth * 0.66} ${cy + pathHeight * 0.32},
      ${cx + pathWidth * 0.45} ${cy + pathHeight * 0.5}`;
  const cardY = cy + interpolate(focus, [0, 1], [0, height * (portrait ? 0.17 : 0.12)]);
  const pathOpacity = interpolate(resolution, [0, 0.72, 1], [1, 0.5, 0], clamp);

  return (
    <UiStage>
      <SoftGlow
        x={`${42 - resolution * 25}%`}
        y={`${46 + orbit * 7}%`}
        size={Math.max(width, height) * 0.32}
        color={accentA}
        opacity={0.34 * (1 - resolution)}
      />
      <SoftGlow
        x={`${58 + resolution * 22}%`}
        y={`${42 - orbit * 8}%`}
        size={Math.max(width, height) * 0.27}
        color={accentB}
        opacity={0.4 * (1 - resolution)}
      />
      <SoftGlow
        x="50%"
        y="55%"
        size={Math.max(width, height) * 0.18}
        color={accentC}
        opacity={0.28 * (1 - resolution)}
      />

      <div
        style={{
          position: 'absolute',
          top: height * 0.075,
          left: width * 0.08,
          right: width * 0.08,
          textAlign: portrait ? 'left' : 'center',
          opacity: progress(frame, 0, 18),
        }}
      >
        <div
          style={{
            color: '#8d93a2',
            fontSize: portrait ? width * 0.031 : width * 0.015,
            letterSpacing: portrait ? 4 : 6,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: portrait ? width * 0.078 : width * 0.047,
            fontWeight: 620,
            letterSpacing: '-0.045em',
          }}
        >
          {title}
        </div>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{position: 'absolute', inset: 0, opacity: pathOpacity}}
      >
        <defs>
          <linearGradient id="ui-ae-neon-path" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={accentA} />
            <stop offset=".48" stopColor={accentB} />
            <stop offset="1" stopColor={accentC} />
          </linearGradient>
          <filter id="ui-ae-neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={path}
          fill="none"
          stroke="url(#ui-ae-neon-path)"
          strokeWidth={portrait ? 7 : 9}
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - draw}
          filter="url(#ui-ae-neon-glow)"
        />
        <path
          d={path}
          fill="none"
          stroke="rgba(255,255,255,.78)"
          strokeWidth={2}
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="0.012 0.135"
          strokeDashoffset={1 - orbit}
        />
      </svg>

      {Array.from({length: 5}, (_, index) => {
        const angle = orbit * Math.PI * 2 + index * 1.2;
        const radiusX = pathWidth * (0.28 + index * 0.018);
        const radiusY = pathHeight * (0.24 + index * 0.014);
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: cx + Math.cos(angle) * radiusX,
              top: cy + Math.sin(angle * 1.18) * radiusY,
              width: portrait ? 15 : 18,
              height: portrait ? 15 : 18,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: `0 0 14px 5px ${index % 2 ? accentB : accentA}`,
              translate: '-50% -50%',
              opacity: interpolate(draw, [0, 0.15, 1], [0, 1, 1], clamp),
            }}
          />
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: cx,
          top: cardY,
          width: pillWidth,
          height: portrait ? width * 0.16 : height * 0.135,
          borderRadius: 999,
          background:
            'linear-gradient(105deg, rgba(24,24,32,.98), rgba(4,4,7,.98))',
          border: '1.5px solid rgba(255,255,255,.48)',
          boxShadow: `0 0 0 1px rgba(72,90,255,.25), 0 0 35px ${accentA}88, 0 0 72px ${accentB}55`,
          translate: '-50% -50%',
          scale: `${interpolate(cardIn, [0, 0.6, 1], [0.25, 1.06, 1], clamp)}`,
          display: 'flex',
          alignItems: 'center',
          padding: portrait ? `0 ${width * 0.055}px` : `0 ${width * 0.025}px`,
          gap: portrait ? width * 0.035 : width * 0.015,
          overflow: 'hidden',
        }}
      >
        <div style={{flex: '0 0 auto', width: portrait ? 38 : 48, height: portrait ? 38 : 48}}>
          <NeonStar size={portrait ? 38 : 48} />
        </div>
        <div
          style={{
            opacity: progress(frame, 70, 90),
            fontSize: portrait ? width * 0.043 : height * 0.037,
            color: '#dfe5f1',
            whiteSpace: 'nowrap',
          }}
        >
          {steps[activeStep] ?? 'Shape meaning'}
        </div>
        <div
          style={{
            marginLeft: 'auto',
            width: portrait ? 12 : 15,
            height: portrait ? 12 : 15,
            borderRadius: '50%',
            background: activeStep === steps.length - 1 ? accentB : '#ffffff',
            boxShadow: `0 0 16px ${accentB}`,
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: cx,
          top: cardY + (portrait ? width * 0.18 : height * 0.18),
          translate: '-50% 0',
          width: portrait ? width * 0.75 : width * 0.5,
          display: 'flex',
          justifyContent: 'center',
          gap: portrait ? 18 : 28,
          opacity: progress(frame, 125, 148) * (1 - resolution),
        }}
      >
        {steps.map((step, index) => (
          <div
            key={step}
            style={{
              height: 5,
              flex: 1,
              borderRadius: 99,
              background:
                index <= activeStep
                  ? `linear-gradient(90deg, ${accentA}, ${accentB})`
                  : '#242733',
              scale: `${interpolate(stepPhase, [0, 1], [0.55, 1], clamp)} 1`,
              transformOrigin: '0 50%',
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: interpolate(resolution, [0, 0.45, 1], [0, 1, 1], clamp),
          scale: `${interpolate(resolution, [0, 0.6, 1], [0.6, 1.08, 1], clamp)}`,
        }}
      >
        <div style={{textAlign: 'center'}}>
          <NeonStar size={portrait ? width * 0.14 : height * 0.16} />
          <div
            style={{
              marginTop: 28,
              fontSize: portrait ? width * 0.062 : height * 0.06,
              letterSpacing: '-0.04em',
              color: '#eefaff',
            }}
          >
            Motion becomes a system.
          </div>
        </div>
      </div>
    </UiStage>
  );
};

export type UiAeNeonMessageJourneyProps = {
  message: string;
  focusLabel: string;
  result: string;
  accentA?: string;
  accentB?: string;
};

export const UiAeNeonMessageJourney: React.FC<UiAeNeonMessageJourneyProps> = ({
  message,
  focusLabel,
  result,
  accentA = '#2de7ff',
  accentB = '#ff3aa7',
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height / width > 1.05;
  const input = progress(frame, 0, 38, easeOut);
  const card = progress(frame, 32, 74, easeInOut);
  const eye = progress(frame, 70, 112, easeInOut);
  const box = progress(frame, 108, 151, easeOut);
  const beam = progress(frame, 147, 194, easeInOut);
  const corner = progress(frame, 190, 234, easeInOut);
  const stageOpacity = (start: number, end: number) =>
    interpolate(frame, [start - 8, start, end, end + 8], [0, 1, 1, 0], clamp);
  const cardWidth = portrait ? width * 0.72 : width * 0.46;
  const lineWidth = portrait ? width * 0.68 : width * 0.55;

  return (
    <UiStage>
      <SoftGlow
        x={`${50 - beam * 20}%`}
        y={`${49 + Math.sin(beam * Math.PI) * 6}%`}
        size={Math.max(width, height) * 0.36}
        color={accentA}
        opacity={0.28}
        blur={72}
      />
      <SoftGlow
        x={`${58 + beam * 18}%`}
        y="52%"
        size={Math.max(width, height) * 0.28}
        color={accentB}
        opacity={0.24}
        blur={66}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '46%',
          width: lineWidth,
          translate: '-50% -50%',
          opacity: stageOpacity(0, 43),
        }}
      >
        <div
          style={{
            fontSize: portrait ? width * 0.05 : height * 0.045,
            translate: `${(1 - input) * -60}px 0`,
            opacity: input,
          }}
        >
          {message}
        </div>
        <div
          style={{
            marginTop: 22,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${accentA}, ${accentB}, transparent)`,
            scale: `${input} 1`,
            transformOrigin: '0 50%',
            boxShadow: `0 0 18px ${accentA}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: -10,
            width: portrait ? 60 : 78,
            height: portrait ? 38 : 46,
            borderRadius: 999,
            background: `linear-gradient(100deg, ${accentB}, ${accentA})`,
            boxShadow: `0 0 25px ${accentB}88`,
            display: 'grid',
            placeItems: 'center',
            scale: `${interpolate(input, [0, 0.75, 1], [0, 1.15, 1], clamp)}`,
          }}
        >
          <NeonStar size={portrait ? 24 : 30} color="#fff" />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '47%',
          width: cardWidth,
          height: portrait ? height * 0.18 : height * 0.27,
          borderRadius: 32,
          border: '1px solid rgba(255,255,255,.52)',
          background: 'rgba(4,6,10,.96)',
          boxShadow: `0 0 36px ${accentA}77, 0 0 80px ${accentB}44`,
          translate: '-50% -50%',
          scale: `${interpolate(card, [0, 0.7, 1], [0.65, 1.06, 1], clamp)}`,
          opacity: stageOpacity(35, 78),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: portrait ? `0 ${width * 0.055}px` : `0 ${width * 0.035}px`,
        }}
      >
        <div
          style={{
            fontSize: portrait ? width * 0.035 : height * 0.031,
            color: '#bfc5d0',
          }}
        >
          Watch the story take shape
        </div>
        <div
          style={{
            marginTop: 22,
            height: 12,
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,.22)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${card * 100}%`,
              height: '100%',
              borderRadius: 999,
              background: `linear-gradient(90deg, ${accentA}, ${accentB})`,
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '49%',
          width: portrait ? width * 0.7 : width * 0.46,
          height: portrait ? width * 0.34 : height * 0.36,
          borderRadius: '50% / 60%',
          background: `radial-gradient(ellipse at center, #050608 0 35%, ${accentB} 41%, ${accentA} 62%, transparent 70%)`,
          translate: '-50% -50%',
          scale: `${interpolate(eye, [0, 0.72, 1], [0.35, 1.08, 1], clamp)}`,
          opacity: stageOpacity(73, 116),
          filter: 'drop-shadow(0 0 32px rgba(80,220,255,.5))',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div
          style={{
            border: '1px solid rgba(255,255,255,.52)',
            background: '#0b0c10',
            borderRadius: 999,
            padding: portrait ? '14px 28px' : '17px 38px',
            fontSize: portrait ? width * 0.04 : height * 0.035,
            boxShadow: `0 0 24px ${accentB}66`,
          }}
        >
          {focusLabel}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '49%',
          width: cardWidth,
          height: portrait ? height * 0.19 : height * 0.29,
          translate: '-50% -50%',
          opacity: stageOpacity(110, 154),
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '1px dashed rgba(255,255,255,.72)',
            scale: `${interpolate(box, [0, 1], [0.55, 1], clamp)}`,
          }}
        />
        {[
          ['0%', '0%'],
          ['100%', '0%'],
          ['0%', '100%'],
          ['100%', '100%'],
        ].map(([left, top]) => (
          <div
            key={`${left}-${top}`}
            style={{
              position: 'absolute',
              left,
              top,
              width: 11,
              height: 11,
              borderRadius: '50%',
              background: '#fff',
              translate: '-50% -50%',
              scale: `${box}`,
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            translate: '-50% -50%',
            fontSize: portrait ? width * 0.045 : height * 0.045,
            letterSpacing: '0.12em',
            whiteSpace: 'nowrap',
          }}
        >
          {result}
        </div>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{position: 'absolute', inset: 0, opacity: stageOpacity(148, 199)}}
      >
        <defs>
          <linearGradient id="ui-ae-beam-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={accentB} stopOpacity="0" />
            <stop offset=".25" stopColor={accentB} />
            <stop offset=".55" stopColor="#fff" />
            <stop offset=".82" stopColor={accentA} />
            <stop offset="1" stopColor={accentA} stopOpacity="0" />
          </linearGradient>
          <filter id="ui-ae-beam-glow" x="-40%" y="-400%" width="180%" height="900%">
            <feGaussianBlur stdDeviation="13" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={`M ${width * 0.12} ${height * 0.5}
            C ${width * 0.28} ${height * (0.5 - 0.045 * Math.sin(beam * Math.PI * 2))},
              ${width * 0.39} ${height * (0.5 + 0.05 * Math.sin(beam * Math.PI * 3))},
              ${width * 0.5} ${height * 0.5}
            S ${width * 0.72} ${height * (0.5 - 0.04 * Math.sin(beam * Math.PI * 2.4))},
              ${width * 0.88} ${height * 0.5}`}
          fill="none"
          stroke="url(#ui-ae-beam-gradient)"
          strokeWidth={portrait ? 8 : 12}
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - beam}
          filter="url(#ui-ae-beam-glow)"
        />
      </svg>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{position: 'absolute', inset: 0, opacity: stageOpacity(192, 240)}}
      >
        <defs>
          <linearGradient id="ui-ae-corner-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#6e44ff" />
            <stop offset=".52" stopColor={accentA} />
            <stop offset="1" stopColor="#72ff9d" />
          </linearGradient>
        </defs>
        <path
          d={`M ${width * 0.13} ${height * 0.68}
            H ${width * 0.66}
            Q ${width * 0.82} ${height * 0.68} ${width * 0.82} ${height * 0.5}
            V ${height * 0.25}`}
          fill="none"
          stroke="url(#ui-ae-corner-gradient)"
          strokeWidth={portrait ? 14 : 18}
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - corner}
          style={{filter: `drop-shadow(0 0 18px ${accentA})`}}
        />
      </svg>
    </UiStage>
  );
};

export type UiAePromptAgentFlowProps = {
  prompt: string;
  agentName: string;
  features: string[];
  accent?: string;
};

export const UiAePromptAgentFlow: React.FC<UiAePromptAgentFlowProps> = ({
  prompt,
  agentName,
  features,
  accent = '#26b9ee',
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const typed = Math.floor(interpolate(frame, [10, 60], [0, prompt.length], clamp));
  const promptCommit = progress(frame, 62, 82, easeIn);
  const specIn = progress(frame, 76, 108, easeOut);
  const appReveal = progress(frame, 132, 164, easeInOut);
  const metricBuild = progress(frame, 165, 218, easeOut);
  const cursorX = interpolate(frame, [12, 58, 72, 132, 182], [width * 0.28, width * 0.72, width * 0.79, width * 0.68, width * 0.82], {
    ...clamp,
    easing: easeInOut,
  });
  const cursorY = interpolate(frame, [12, 58, 72, 132, 182], [height * 0.68, height * 0.58, height * 0.28, height * 0.74, height * 0.46], {
    ...clamp,
    easing: easeInOut,
  });

  return (
    <UiStage background="#efede8" color="#111319">
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 70% 16%, rgba(53,202,255,.25), transparent 32%), #efede8',
          opacity: 1 - appReveal,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: width * 0.5,
          top: interpolate(promptCommit, [0, 1], [height * 0.44, height * 0.11]),
          width: interpolate(promptCommit, [0, 1], [width * 0.52, width * 0.34]),
          minHeight: interpolate(promptCommit, [0, 1], [height * 0.2, height * 0.12]),
          padding: `${height * 0.035}px ${width * 0.025}px`,
          borderRadius: interpolate(promptCommit, [0, 1], [28, 22]),
          background: interpolateColors(
            promptCommit,
            [0, 1],
            ['rgba(255,255,255,.96)', 'rgba(17,19,25,.96)'],
          ),
          color: promptCommit > 0.5 ? '#f8fbff' : '#111319',
          boxShadow: '0 24px 90px rgba(29,36,46,.16)',
          translate: '-50% 0',
          fontSize: height * 0.035,
          lineHeight: 1.35,
          zIndex: 4,
        }}
      >
        {prompt.slice(0, typed)}
        {frame < 68 ? <span style={{color: accent}}>▌</span> : null}
        <div
          style={{
            position: 'absolute',
            right: 20,
            bottom: 18,
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: promptCommit > 0.6 ? accent : '#111319',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 25,
          }}
        >
          ↑
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: width * 0.09,
          top: height * 0.19,
          width: width * 0.56,
          height: height * 0.68,
          borderRadius: 36,
          background: '#fff',
          border: '1px solid rgba(20,29,37,.09)',
          padding: `${height * 0.065}px ${width * 0.055}px`,
          boxShadow: '0 30px 110px rgba(22,31,40,.14)',
          opacity: specIn * (1 - appReveal),
          translate: `${(1 - specIn) * -120}px 0`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: accent,
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: 26,
            }}
          >
            AI
          </div>
          <div>
            <div style={{fontSize: height * 0.052, fontWeight: 760}}>{agentName}</div>
            <div style={{fontSize: height * 0.024, color: '#d74e64', marginTop: 8}}>
              Building your reusable agent
            </div>
          </div>
        </div>
        <div style={{marginTop: height * 0.055, display: 'grid', gap: height * 0.027}}>
          {features.map((feature, index) => {
            const rowIn = progress(frame, 88 + index * 8, 103 + index * 8);
            return (
              <div
                key={feature}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  fontSize: height * 0.029,
                  opacity: rowIn,
                  translate: `${(1 - rowIn) * 32}px 0`,
                }}
              >
                <span style={{color: '#26a565', fontWeight: 900}}>✓</span>
                {feature}
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: height * 0.055,
            height: 2,
            background: '#e7e8e9',
            scale: `${progress(frame, 112, 128)} 1`,
            transformOrigin: '0 50%',
          }}
        />
        <div style={{marginTop: 28, color: '#5f6671', fontSize: height * 0.024}}>
          A production-ready workflow is being assembled from your instruction.
        </div>
      </div>

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 20% 22%, #55dcff, transparent 29%), radial-gradient(circle at 80% 74%, #78a8ff, transparent 34%), linear-gradient(135deg, #b9f1ff 0%, #40c5f3 46%, #86a9ff 100%)',
          opacity: appReveal,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: width * 0.13,
          top: height * 0.12,
          width: width * 0.74,
          height: height * 0.69,
          borderRadius: 34,
          background: '#16181d',
          border: '1px solid rgba(255,255,255,.18)',
          boxShadow: '0 50px 150px rgba(6,15,32,.35)',
          opacity: appReveal,
          translate: `0 ${(1 - appReveal) * 140}px`,
          scale: `${interpolate(appReveal, [0, 1], [0.86, 1], clamp)}`,
          color: '#fff',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: 72,
            padding: '0 30px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: '1px solid rgba(255,255,255,.08)',
          }}
        >
          <span style={{width: 11, height: 11, borderRadius: '50%', background: '#ff6e63'}} />
          <span style={{width: 11, height: 11, borderRadius: '50%', background: '#ffc85b'}} />
          <span style={{width: 11, height: 11, borderRadius: '50%', background: '#6de183'}} />
          <span style={{marginLeft: 18, color: '#aeb5c0'}}>Contract Review · Live</span>
        </div>
        <div style={{padding: '34px 42px'}}>
          <div style={{fontSize: height * 0.036, fontWeight: 720}}>Contracts</div>
          <div
            style={{
              marginTop: 32,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 18,
            }}
          >
            {[
              ['Reviewed', 248, '#6fc7ff'],
              ['Risk clauses', 37, '#ff657d'],
              ['Needs action', 15, '#ffe36f'],
            ].map(([label, value, color], index) => (
              <div
                key={String(label)}
                style={{
                  background: '#22252b',
                  borderRadius: 20,
                  padding: '22px 24px',
                  opacity: progress(frame, 169 + index * 7, 187 + index * 7),
                  translate: `0 ${(1 - progress(frame, 169 + index * 7, 187 + index * 7)) * 28}px`,
                }}
              >
                <div style={{fontSize: height * 0.019, color: '#8e96a4'}}>{label}</div>
                <div style={{fontSize: height * 0.055, fontWeight: 780, color, marginTop: 10}}>
                  {Math.round(Number(value) * metricBuild)}
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop: 26, display: 'grid', gap: 14}}>
            {['Master Service Agreement', 'Software Subscription', 'Data Processing Addendum'].map(
              (label, index) => (
                <div
                  key={label}
                  style={{
                    height: 58,
                    borderRadius: 16,
                    background: index % 2 ? '#202329' : '#1d2025',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                    gap: 16,
                    opacity: progress(frame, 188 + index * 6, 206 + index * 6),
                  }}
                >
                  <span style={{color: index === 1 ? '#ff657d' : '#6de183'}}>●</span>
                  <span>{label}</span>
                  <span style={{marginLeft: 'auto', color: '#7b8290'}}>
                    {index === 1 ? 'review' : 'ready'}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: cursorX,
          top: cursorY,
          zIndex: 12,
          translate: '-10% -10%',
          filter: 'drop-shadow(0 8px 14px rgba(0,0,0,.25))',
          opacity: frame < 225 ? 1 : 1 - progress(frame, 225, 235),
        }}
      >
        <CursorGlyph />
      </div>
    </UiStage>
  );
};

export type UiAeCardSwarmTimelineProps = {
  brand: string;
  title: string;
  cardLabels: string[];
  accent?: string;
};

export const UiAeCardSwarmTimeline: React.FC<UiAeCardSwarmTimelineProps> = ({
  brand,
  title,
  cardLabels,
  accent = '#45ee9b',
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const typeBeat = progress(frame, 0, 42, easeInOut);
  const swarm = progress(frame, 38, 105, easeOut);
  const grid = progress(frame, 92, 132, easeInOut);
  const timeline = progress(frame, 133, 174, easeInOut);
  const playhead = progress(frame, 172, 222, easeInOut);
  const colors = ['#7b63ff', '#ff6d86', '#45ee9b', '#ffb547', '#64b5ff', '#eee8df'];

  return (
    <UiStage
      background={timeline > 0.45 ? '#f4f3ef' : '#07090c'}
      color={timeline > 0.45 ? '#111318' : '#f9fbff'}
    >
      <SoftGlow
        x={`${55 - grid * 15}%`}
        y={`${60 - grid * 18}%`}
        size={700}
        color={accent}
        opacity={(1 - timeline) * 0.4}
        blur={80}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          opacity: 1 - swarm,
        }}
      >
        <div
          style={{
            fontSize: height * 0.16,
            fontWeight: 640,
            letterSpacing: '-0.07em',
            translate: `${interpolate(typeBeat, [0, 0.5, 1], [-width * 0.12, 0, width * 0.12], clamp)}px 0`,
            scale: `${interpolate(typeBeat, [0, 0.55, 1], [0.74, 1.06, 0.84], clamp)}`,
            filter: `blur(${interpolate(typeBeat, [0, 0.4, 1], [16, 0, 6], clamp)}px)`,
          }}
        >
          {title}
        </div>
      </div>

      {cardLabels.map((label, index) => {
        const angle = (index / Math.max(1, cardLabels.length)) * Math.PI * 2 - 0.7;
        const targetCol = index % 4;
        const targetRow = Math.floor(index / 4);
        const targetX = width * (0.25 + targetCol * 0.17);
        const targetY = height * (0.31 + targetRow * 0.22);
        const orbitX = width * 0.5 + Math.cos(angle) * width * 0.34;
        const orbitY = height * 0.52 + Math.sin(angle) * height * 0.32;
        const x = interpolate(grid, [0, 1], [orbitX, targetX]);
        const y = interpolate(grid, [0, 1], [orbitY, targetY]);
        const local = progress(frame, 39 + index * 4, 65 + index * 4, overshoot);
        return (
          <div
            key={label}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: width * 0.145,
              height: height * 0.2,
              borderRadius: 24,
              background: `linear-gradient(145deg, ${colors[index % colors.length]}, #12151b 72%)`,
              border: '1px solid rgba(255,255,255,.34)',
              boxShadow: '0 28px 70px rgba(0,0,0,.35)',
              translate: '-50% -50%',
              rotate: `${interpolate(grid, [0, 1], [Math.sin(index * 2.3) * 16, 0], clamp)}deg`,
              scale: `${local * interpolate(grid, [0, 1], [0.72 + (index % 3) * 0.12, 1], clamp)}`,
              opacity: local * (1 - timeline),
              padding: 22,
              display: 'flex',
              alignItems: 'flex-end',
              fontSize: height * 0.029,
              fontWeight: 720,
            }}
          >
            {label}
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: width * 0.5,
          top: height * 0.5,
          translate: '-50% -50%',
          opacity: swarm * (1 - timeline),
          scale: `${interpolate(swarm, [0, 0.6, 1], [0.4, 1.1, 1], clamp)}`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 86,
            height: 86,
            borderRadius: 24,
            margin: '0 auto',
            display: 'grid',
            placeItems: 'center',
            background: accent,
            color: '#07110c',
            fontWeight: 950,
            fontSize: 42,
            boxShadow: `0 0 50px ${accent}88`,
          }}
        >
          M
        </div>
        <div style={{fontSize: height * 0.055, marginTop: 22, fontWeight: 680}}>{brand}</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: width * 0.1,
          top: height * 0.14,
          width: width * 0.8,
          height: height * 0.7,
          borderRadius: 24,
          background: '#ffffff',
          border: '1px solid #d8d9dc',
          boxShadow: '0 34px 100px rgba(24,28,34,.18)',
          opacity: timeline,
          translate: `0 ${(1 - timeline) * 90}px`,
          overflow: 'hidden',
          color: '#181b21',
        }}
      >
        <div
          style={{
            height: 78,
            display: 'flex',
            alignItems: 'center',
            padding: '0 32px',
            borderBottom: '1px solid #e1e2e4',
            gap: 12,
          }}
        >
          <span style={{width: 13, height: 13, borderRadius: '50%', background: '#ff6961'}} />
          <span style={{width: 13, height: 13, borderRadius: '50%', background: '#ffc860'}} />
          <span style={{width: 13, height: 13, borderRadius: '50%', background: '#5dd477'}} />
          <strong style={{marginLeft: 20}}>Motion timeline</strong>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 78,
            bottom: 0,
            width: '28%',
            background: '#f6f7f8',
            borderRight: '1px solid #dedfe2',
            padding: '32px 28px',
          }}
        >
          {['Card swarm', 'Hero title', 'Brand mark', 'Color field'].map((label, index) => (
            <div
              key={label}
              style={{
                height: 48,
                borderRadius: 12,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                background: index === 1 ? '#e5fdf1' : 'transparent',
                color: index === 1 ? '#18754a' : '#68707c',
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: '28%', right: 0, top: 78, bottom: 0}}>
          {Array.from({length: 5}, (_, row) => (
            <div
              key={row}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 32 + row * 76,
                height: 2,
                background: '#eceef1',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 28 + row * 44,
                  top: -10,
                  width: width * (0.17 + row * 0.032) * playhead,
                  height: 22,
                  borderRadius: 7,
                  background: row === 1 ? accent : colors[row % colors.length],
                  opacity: 0.84,
                }}
              />
              {[0.22, 0.58, 0.86].map((point, index) => (
                <div
                  key={point}
                  style={{
                    position: 'absolute',
                    left: `${point * 100}%`,
                    top: -7,
                    width: 15,
                    height: 15,
                    background: '#fff',
                    border: `3px solid ${index === 1 ? accent : '#58606d'}`,
                    rotate: '45deg',
                    scale: `${progress(frame, 179 + row * 3 + index * 2, 188 + row * 3 + index * 2)}`,
                  }}
                />
              ))}
            </div>
          ))}
          <div
            style={{
              position: 'absolute',
              top: 18,
              bottom: 22,
              left: `${interpolate(playhead, [0, 1], [7, 92], clamp)}%`,
              width: 3,
              background: '#278cff',
              boxShadow: '0 0 12px rgba(39,140,255,.45)',
            }}
          />
        </div>
      </div>
    </UiStage>
  );
};

export type UiAeProductGridWorldProps = {
  brand: string;
  statement: string;
  actions: string[];
  accent?: string;
};

export const UiAeProductGridWorld: React.FC<UiAeProductGridWorldProps> = ({
  brand,
  statement,
  actions,
  accent = '#4dff9b',
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const deck = progress(frame, 0, 56, easeInOut);
  const tiles = progress(frame, 48, 92, easeOut);
  const field = progress(frame, 88, 130, easeInOut);
  const interfaceIn = progress(frame, 128, 172, easeOut);
  const macro = progress(frame, 176, 230, easeInOut);
  const tileCols = 10;
  const tileRows = 5;

  return (
    <UiStage background="#050907">
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 112%, rgba(51,255,130,.5), transparent 42%), linear-gradient(#030705, #06100b)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: width * 0.11,
          right: width * 0.11,
          top: height * 0.16,
          height: height * 0.54,
          perspective: 1200,
          opacity: 1 - tiles,
        }}
      >
        {Array.from({length: 15}, (_, index) => {
          const column = index % 5;
          const row = Math.floor(index / 5);
          const local = progress(frame, index * 2, 22 + index * 2);
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${column * 17 + 7}%`,
                top: `${row * 27 + 4}%`,
                width: '23%',
                height: '42%',
                borderRadius: 20,
                background:
                  index % 3 === 0
                    ? `linear-gradient(155deg, ${accent}, #163522)`
                    : 'linear-gradient(155deg, #d9f5df, #194a2d)',
                border: '1px solid rgba(255,255,255,.3)',
                boxShadow: '0 24px 70px rgba(0,0,0,.42)',
                translate: `${interpolate(deck, [0, 1], [index * 8, -column * 13], clamp)}px ${interpolate(local, [0, 1], [100, row * -12], clamp)}px`,
                rotate: `${interpolate(deck, [0, 1], [-7 + index * 0.7, 0], clamp)}deg`,
                scale: `${local}`,
                opacity: local,
                padding: 18,
                color: index % 3 === 0 ? '#07130c' : '#edf9f0',
                fontWeight: 760,
              }}
            >
              <div style={{fontSize: height * 0.018, opacity: 0.72}}>Analysis {index + 1}</div>
              <div style={{fontSize: height * 0.034, marginTop: 14}}>
                {actions[index % actions.length]}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: width * 0.12,
          right: width * 0.12,
          top: height * 0.19,
          height: height * 0.48,
          display: 'grid',
          gridTemplateColumns: `repeat(${tileCols}, 1fr)`,
          gridTemplateRows: `repeat(${tileRows}, 1fr)`,
          gap: 4,
          opacity: tiles * (1 - field),
          scale: `${interpolate(tiles, [0, 1], [1.25, 1], clamp)}`,
        }}
      >
        {Array.from({length: tileCols * tileRows}, (_, index) => (
          <div
            key={index}
            style={{
              borderRadius: 5,
              background:
                index % 7 === 0
                  ? accent
                  : `rgba(${24 + (index % 4) * 7}, ${67 + (index % 5) * 12}, ${
                      40 + (index % 3) * 10
                    }, .94)`,
              opacity: progress(frame, 48 + (index % 10) * 2, 72 + (index % 10) * 2),
              scale: `${interpolate(
                progress(frame, 48 + (index % 10) * 2, 72 + (index % 10) * 2),
                [0, 1],
                [0.45, 1],
              )}`,
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            fontSize: height * 0.09,
            fontWeight: 760,
            letterSpacing: '-0.05em',
            textShadow: '0 12px 50px #000',
          }}
        >
          {brand}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: field * (1 - interfaceIn),
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '13%',
            right: '13%',
            top: '20%',
            bottom: '24%',
            display: 'grid',
            gridTemplateColumns: 'repeat(34, 1fr)',
            gap: 7,
            maskImage: 'radial-gradient(ellipse at center, #000 35%, transparent 75%)',
          }}
        >
          {Array.from({length: 34 * 14}, (_, index) => {
            const x = index % 34;
            const y = Math.floor(index / 34);
            const wave = Math.sin(x * 0.5 + field * 9) + Math.cos(y * 0.78 - field * 7);
            return (
              <span
                key={index}
                style={{
                  width: 4 + Math.max(0, wave) * 2,
                  height: 4 + Math.max(0, wave) * 2,
                  borderRadius: '50%',
                  background: index % 9 === 0 ? accent : '#b7ffd4',
                  opacity: 0.12 + Math.max(0, wave) * 0.16,
                  translate: `0 ${wave * 9}px`,
                }}
              />
            );
          })}
        </div>
        <div style={{fontSize: height * 0.055, letterSpacing: '-0.04em'}}>
          {statement}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: width * 0.2,
          right: width * 0.2,
          top: height * 0.15,
          height: height * 0.7,
          borderRadius: 38,
          background:
            'linear-gradient(180deg, rgba(16,22,19,.96), rgba(5,9,7,.98))',
          border: '1px solid rgba(132,255,184,.28)',
          boxShadow: `0 0 0 1px rgba(255,255,255,.04), 0 60px 140px rgba(0,0,0,.48), 0 0 80px ${accent}22`,
          opacity: interfaceIn,
          translate: `0 ${(1 - interfaceIn) * 110}px`,
          scale: `${interpolate(interfaceIn, [0, 1], [0.88, 1], clamp)}`,
          overflow: 'hidden',
        }}
      >
        <div style={{padding: '34px 38px', borderBottom: '1px solid rgba(255,255,255,.08)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <strong style={{fontSize: height * 0.028}}>{brand}</strong>
            <span style={{color: '#9aa89f'}}>Online · Secure</span>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: interpolate(macro, [0, 1], [38, -width * 0.08]),
            right: 38,
            top: 112,
            bottom: 38,
            scale: `${interpolate(macro, [0, 1], [1, 1.38], clamp)}`,
            transformOrigin: '72% 66%',
          }}
        >
          <div style={{fontSize: height * 0.045, fontWeight: 650}}>How can I help?</div>
          <div style={{marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 14}}>
            {actions.map((label, index) => (
              <div
                key={label}
                style={{
                  border: '1px solid rgba(255,255,255,.17)',
                  background: 'rgba(255,255,255,.035)',
                  borderRadius: 999,
                  padding: '16px 24px',
                  fontSize: height * 0.021,
                  opacity: progress(frame, 145 + index * 5, 162 + index * 5),
                  translate: `${(1 - progress(frame, 145 + index * 5, 162 + index * 5)) * 30}px 0`,
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 92,
              borderRadius: 22,
              border: '1px solid rgba(255,255,255,.16)',
              background: '#0c110e',
              display: 'flex',
              alignItems: 'center',
              padding: '0 28px',
              color: '#75827a',
            }}
          >
            Ask anything…
            <div
              style={{
                marginLeft: 'auto',
                width: 52,
                height: 52,
                borderRadius: 16,
                background: accent,
                color: '#061009',
                display: 'grid',
                placeItems: 'center',
                fontSize: 28,
              }}
            >
              ↑
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${interpolate(macro, [0, 1], [0, 100], clamp)}%`,
          height: 3,
          background: accent,
          boxShadow: `0 0 18px 5px ${accent}`,
          opacity: macro * (1 - progress(frame, 224, 234)),
        }}
      />
    </UiStage>
  );
};

export type UiAeVoicePersonaFlowProps = {
  title: string;
  persona: string;
  clips: string[];
  accent?: string;
};

export const UiAeVoicePersonaFlow: React.FC<UiAeVoicePersonaFlowProps> = ({
  title,
  persona,
  clips,
  accent = '#8fffea',
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const blocks = progress(frame, 12, 52, easeInOut);
  const sphere = progress(frame, 48, 84, overshoot);
  const personaIn = progress(frame, 78, 112, easeOut);
  const network = progress(frame, 105, 148, easeInOut);
  const recorder = progress(frame, 142, 188, easeInOut);
  const library = progress(frame, 184, 228, easeOut);
  const centerX = width * 0.5;
  const centerY = height * 0.4;

  return (
    <UiStage>
      <SoftGlow
        x="50%"
        y="42%"
        size={width * 0.8}
        color={accent}
        opacity={(sphere - library * 0.5) * 0.35}
        blur={65}
      />
      <div
        style={{
          position: 'absolute',
          left: width * 0.08,
          top: height * 0.08,
          fontSize: width * 0.11,
          fontWeight: 610,
          letterSpacing: '-0.055em',
          opacity: 1 - sphere,
          translate: `${interpolate(blocks, [0, 1], [0, width * 0.05], clamp)}px 0`,
        }}
      >
        {title}
      </div>

      {Array.from({length: 4}, (_, index) => {
        const targetX = centerX + (index - 1.5) * width * 0.045;
        const targetY = centerY + Math.sin(index * 2.4) * height * 0.025;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: interpolate(blocks, [0, 1], [width * (0.18 + index * 0.18), targetX]),
              top: interpolate(blocks, [0, 1], [height * (0.25 + (index % 2) * 0.08), targetY]),
              width: interpolate(sphere, [0, 1], [width * 0.045, width * 0.22]),
              height: interpolate(sphere, [0, 1], [width * 0.045, width * 0.22]),
              borderRadius: interpolate(sphere, [0, 1], [6, width * 0.11]),
              background:
                index % 2
                  ? '#eafff9'
                  : `linear-gradient(130deg, #eafff9, ${accent} 55%, #4ea895)`,
              translate: '-50% -50%',
              opacity: (1 - personaIn) * progress(frame, 8 + index * 4, 24 + index * 4),
              boxShadow: `0 0 ${20 + sphere * 50}px ${accent}55`,
              scale: `${interpolate(sphere, [0, 1], [1, 0.98], clamp)}`,
            }}
          />
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: centerX,
          top: centerY,
          width: width * 0.22,
          height: width * 0.22,
          borderRadius: '50%',
          background: `linear-gradient(110deg, #effffb 4%, ${accent} 47%, #4f9f8f 70%, #eafff9)`,
          translate: '-50% -50%',
          opacity: sphere * (1 - personaIn),
          scale: `${interpolate(sphere, [0, 0.7, 1], [0.35, 1.08, 1], clamp)}`,
          boxShadow: `0 0 0 1px rgba(255,255,255,.7), 0 0 80px ${accent}66`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: centerX,
          top: height * 0.19,
          minWidth: width * 0.5,
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,.4)',
          background: 'rgba(12,15,16,.88)',
          padding: `${height * 0.025}px ${width * 0.04}px`,
          translate: '-50% 0',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          opacity: personaIn * (1 - recorder),
          scale: `${interpolate(personaIn, [0, 1], [0.76, 1], clamp)}`,
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: `linear-gradient(120deg, #e9fff9, ${accent}, #4e9b8c)`,
            boxShadow: `0 0 25px ${accent}55`,
          }}
        />
        <div>
          <div style={{fontSize: width * 0.038, fontWeight: 680}}>{persona}</div>
          <div style={{fontSize: width * 0.024, color: '#8f9c9a', marginTop: 4}}>
            Ethereal · expressive · controlled
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        style={{position: 'absolute', inset: 0, opacity: network * (1 - recorder)}}
      >
        {clips.map((clip, index) => {
          const y = height * (0.46 + index * 0.1);
          const targetY = height * 0.31;
          return (
            <path
              key={clip}
              d={`M ${width * 0.14} ${y} C ${width * 0.28} ${y}, ${width * 0.36} ${targetY}, ${width * 0.5} ${targetY}`}
              fill="none"
              stroke={index === 1 ? accent : 'rgba(255,255,255,.35)'}
              strokeWidth={2}
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - network}
            />
          );
        })}
      </svg>
      {clips.map((clip, index) => {
        const local = progress(frame, 108 + index * 7, 130 + index * 7);
        return (
          <div
            key={clip}
            style={{
              position: 'absolute',
              left: width * 0.14,
              top: height * (0.46 + index * 0.1),
              width: width * (0.5 + index * 0.08),
              height: height * 0.065,
              borderRadius: 14,
              background: index === 1 ? `linear-gradient(90deg, ${accent}, #dffcf6)` : '#1e2425',
              color: index === 1 ? '#08100e' : '#dce4e3',
              translate: `${(1 - local) * -80}px -50%`,
              opacity: local * (1 - recorder),
              display: 'flex',
              alignItems: 'center',
              padding: `0 ${width * 0.025}px`,
              fontSize: width * 0.026,
              boxShadow: index === 1 ? `0 0 28px ${accent}55` : 'none',
            }}
          >
            {clip}
            <div style={{marginLeft: 'auto', display: 'flex', gap: 3, alignItems: 'center'}}>
              {Array.from({length: 13}, (_, bar) => (
                <span
                  key={bar}
                  style={{
                    width: 3,
                    height: 6 + Math.abs(Math.sin(bar * 1.7 + index)) * 22,
                    background: index === 1 ? '#174b41' : accent,
                    opacity: 0.75,
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: width * 0.12,
          right: width * 0.12,
          top: height * 0.25,
          height: height * 0.42,
          borderRadius: 26,
          border: '1px solid rgba(255,255,255,.19)',
          background: 'rgba(18,22,24,.94)',
          boxShadow: '0 40px 100px rgba(0,0,0,.5)',
          opacity: recorder * (1 - library),
          scale: `${interpolate(recorder, [0, 1], [0.8, 1], clamp)}`,
          overflow: 'hidden',
        }}
      >
        <div style={{height: 58, borderBottom: '1px solid rgba(255,255,255,.08)'}} />
        <div
          style={{
            position: 'absolute',
            left: 30,
            right: 30,
            top: 108,
            height: 90,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {Array.from({length: 55}, (_, index) => {
            const reveal = progress(frame, 154 + index * 0.6, 162 + index * 0.6);
            const amplitude = 12 + Math.abs(Math.sin(index * 1.47)) * 62;
            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: amplitude * reveal,
                  minHeight: 2,
                  borderRadius: 2,
                  background: index < 34 ? '#ff4269' : '#3c4749',
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 85,
            bottom: 80,
            width: 2,
            background: '#ff4269',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 34,
            translate: '-50% 0',
            borderRadius: 999,
            padding: '14px 30px',
            background: '#f2f6f5',
            color: '#111',
            fontWeight: 700,
          }}
        >
          Record a sample
        </div>
      </div>

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 30% 20%, #dffbf4, transparent 27%), radial-gradient(circle at 78% 80%, #65d8c3, transparent 34%), linear-gradient(145deg, #8ee7d6, #d8fff7)',
          opacity: library,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: width * 0.09,
          right: width * 0.09,
          top: height * 0.16,
          height: height * 0.68,
          borderRadius: 30,
          background: '#101415',
          color: '#f7fbfa',
          padding: `${height * 0.045}px ${width * 0.05}px`,
          boxShadow: '0 45px 120px rgba(17,45,39,.3)',
          opacity: library,
          translate: `0 ${(1 - library) * 100}px`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center'}}>
          <div>
            <div style={{fontSize: width * 0.056, fontWeight: 700}}>{title}</div>
            <div style={{fontSize: width * 0.026, color: '#86918f', marginTop: 8}}>
              Your reusable voice system
            </div>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              border: '1px solid rgba(255,255,255,.18)',
              borderRadius: 999,
              padding: '12px 18px',
              fontSize: width * 0.022,
            }}
          >
            + Create voice
          </div>
        </div>
        <div style={{marginTop: height * 0.07, display: 'grid', gap: 13}}>
          {[persona, ...clips, 'Warm narrator', 'Product guide'].map((label, index) => {
            const row = progress(frame, 195 + index * 5, 211 + index * 5);
            return (
              <div
                key={`${label}-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  minHeight: 58,
                  opacity: row,
                  translate: `${(1 - row) * 28}px 0`,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background:
                      index === 0
                        ? `linear-gradient(120deg, #effffb, ${accent}, #4e9b8c)`
                        : `hsl(${index * 47 + 170} 55% 58%)`,
                  }}
                />
                <span>{label}</span>
                <span style={{marginLeft: 'auto', color: '#687370'}}>•••</span>
              </div>
            );
          })}
        </div>
      </div>
    </UiStage>
  );
};
