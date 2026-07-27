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
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const smooth = Easing.bezier(0.65, 0, 0.35, 1);
const p = (frame: number, from: number, to: number, easing = ease) =>
  interpolate(frame, [from, to], [0, 1], {...clamp, easing});

const Stage: React.FC<React.PropsWithChildren<{background?: string}>> = ({
  children,
  background = '#06050d',
}) => (
  <AbsoluteFill
    style={{
      overflow: 'hidden',
      background,
      color: '#fff',
      fontFamily:
        'Inter, SF Pro Display, -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif',
    }}
  >
    {children}
  </AbsoluteFill>
);

const MovingRibbon: React.FC<{
  color: string;
  phase: number;
  top: number;
  opacity?: number;
}> = ({color, phase, top, opacity = 0.75}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const travel = Math.sin(frame / 22 + phase);
  return (
    <div
      style={{
        position: 'absolute',
        left: -width * 0.18,
        top: top + travel * height * 0.045,
        width: width * 1.36,
        height: height * 0.2,
        borderRadius: '50%',
        border: `${height * 0.035}px solid ${color}`,
        filter: `blur(${height * 0.025}px)`,
        opacity,
        rotate: `${-8 + travel * 4}deg`,
        scale: `1 ${0.38 + (travel + 1) * 0.08}`,
      }}
    />
  );
};

export type AeGlassDashboardProps = {
  title: string;
  metric: string;
  labels: string[];
  accent?: string;
};

export const AeGlassDashboard: React.FC<AeGlassDashboardProps> = ({
  title,
  metric,
  labels,
  accent = '#8c46ff',
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const enter = p(frame, 8, 42);
  const chart = p(frame, 46, 112, smooth);
  const settle = p(frame, 116, 150);
  const bars = [0.48, 0.76, 0.58, 0.94, 0.7, 0.88];
  return (
    <Stage background="#05050a">
      <MovingRibbon color={accent} phase={0} top={height * 0.24} opacity={0.65} />
      <MovingRibbon color="#2c7cff" phase={2.1} top={height * 0.62} opacity={0.32} />
      <div
        style={{
          position: 'absolute',
          left: width * 0.14,
          right: width * 0.14,
          top: height * 0.15,
          bottom: height * 0.15,
          borderRadius: 42,
          padding: `${height * 0.065}px ${width * 0.055}px`,
          background:
            'linear-gradient(145deg, rgba(255,255,255,.22), rgba(255,255,255,.07))',
          border: '1px solid rgba(255,255,255,.38)',
          boxShadow: `0 34px 100px rgba(0,0,0,.5), inset 0 1px 1px rgba(255,255,255,.35), 0 0 70px ${accent}44`,
          backdropFilter: 'blur(30px)',
          opacity: enter,
          scale: `${interpolate(enter, [0, 1], [0.82, 1], clamp)}`,
          translate: `0 ${interpolate(enter, [0, 1], [90, 0], clamp)}px`,
        }}
      >
        <div style={{fontSize: 28, color: 'rgba(255,255,255,.66)'}}>{title}</div>
        <div style={{fontSize: 88, fontWeight: 700, marginTop: 14, letterSpacing: '-0.05em'}}>
          {metric}
        </div>
        <div
          style={{
            position: 'absolute',
            left: width * 0.055,
            right: width * 0.055,
            bottom: height * 0.11,
            height: height * 0.34,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 24,
          }}
        >
          {bars.map((value, index) => (
            <div key={index} style={{flex: 1, textAlign: 'center'}}>
              <div
                style={{
                  height: height * 0.27 * value * chart,
                  borderRadius: '18px 18px 6px 6px',
                  background: `linear-gradient(180deg, #fff, ${accent})`,
                  boxShadow: `0 0 28px ${accent}88`,
                  scale: `${1 + (index === 3 ? settle * 0.08 : 0)}`,
                  transformOrigin: 'bottom',
                }}
              />
              <div style={{marginTop: 18, fontSize: 20, color: 'rgba(255,255,255,.58)'}}>
                {labels[index] ?? `0${index + 1}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Stage>
  );
};

export type AeOrganicGradientFieldProps = {
  title: string;
  subtitle: string;
  colors?: [string, string, string];
};

export const AeOrganicGradientField: React.FC<AeOrganicGradientFieldProps> = ({
  title,
  subtitle,
  colors = ['#54f0b4', '#646cff', '#ff4aa2'],
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const reveal = p(frame, 8, 38);
  const resolve = p(frame, 124, 162, smooth);
  const angle = frame * 0.9;
  const blobs = [
    {x: 0.32, y: 0.43, size: 0.5, color: colors[0], phase: 0},
    {x: 0.66, y: 0.38, size: 0.44, color: colors[1], phase: 2},
    {x: 0.55, y: 0.7, size: 0.38, color: colors[2], phase: 4},
  ];
  return (
    <Stage background="#04050a">
      {blobs.map((blob, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left:
              width *
              (blob.x + Math.sin(frame / 24 + blob.phase) * (index === 0 ? 0.12 : 0.09)),
            top: height * (blob.y + Math.cos(frame / 29 + blob.phase) * 0.11),
            width: width * blob.size,
            height: width * blob.size,
            borderRadius: `${48 + Math.sin(frame / 18 + index) * 18}%`,
            background: blob.color,
            filter: `blur(${width * 0.075}px)`,
            opacity: 0.78 * reveal,
            translate: '-50% -50%',
            rotate: `${angle * (index % 2 ? -0.5 : 0.35)}deg`,
            scale: `${1 + Math.sin(frame / 17 + index) * 0.14}`,
            mixBlendMode: 'screen',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: width * 0.08,
          borderRadius: 48,
          border: '1px solid rgba(255,255,255,.18)',
          boxShadow: 'inset 0 0 90px rgba(0,0,0,.42)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: width * 0.1,
          right: width * 0.1,
          top: height * 0.38,
          textAlign: 'center',
          opacity: interpolate(resolve, [0, 1], [1, 0.88], clamp),
        }}
      >
        <div style={{fontSize: 86, fontWeight: 650, letterSpacing: '-0.055em'}}>{title}</div>
        <div style={{fontSize: 25, marginTop: 20, color: 'rgba(255,255,255,.72)', letterSpacing: 4}}>
          {subtitle}
        </div>
      </div>
    </Stage>
  );
};

export type AeSaasKineticTypeProps = {
  phrases: string[];
  kicker: string;
  accent?: string;
};

export const AeSaasKineticType: React.FC<AeSaasKineticTypeProps> = ({
  phrases,
  kicker,
  accent = '#ff2cc3',
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const segment = 42;
  const index = Math.min(phrases.length - 1, Math.floor(frame / segment));
  const local = frame - index * segment;
  const enter = p(local, 0, 14);
  const exit = p(local, 31, 41, Easing.in(Easing.cubic));
  const visible = enter * (1 - exit);
  const word = phrases[index] ?? '';
  const split = Math.max(1, Math.floor(word.length * 0.52));
  return (
    <Stage background="#080219">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${55 + Math.sin(frame / 24) * 22}% ${78 - Math.cos(frame / 31) * 18}%, ${accent}cc 0%, transparent 38%), radial-gradient(circle at 12% 20%, #6b17ff88, transparent 44%)`,
        }}
      />
      {[0.18, 0.28, 0.38].map((ratio) => (
        <div
          key={ratio}
          style={{
            position: 'absolute',
            left: -width * ratio,
            top: height * 0.5 - width * ratio,
            width: width * ratio * 2,
            height: width * ratio * 2,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.12)',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: width * 0.13,
          right: width * 0.13,
          top: height * 0.34,
          fontSize: Math.min(150, width * 0.09),
          lineHeight: 0.94,
          fontWeight: 560,
          letterSpacing: '-0.065em',
          opacity: visible,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            translate: `${interpolate(enter, [0, 1], [-120, 0], clamp)}px 0`,
          }}
        >
          {word.slice(0, split)}
        </span>
        <span
          style={{
            display: 'inline-block',
            color: accent,
            translate: `${interpolate(enter, [0, 1], [120, 0], clamp)}px 0`,
            filter: `blur(${interpolate(enter, [0, 1], [18, 0], clamp)}px)`,
          }}
        >
          {word.slice(split)}
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: width * 0.13,
          bottom: height * 0.18,
          fontSize: 22,
          color: 'rgba(255,255,255,.64)',
          letterSpacing: 3,
        }}
      >
        {kicker}
      </div>
    </Stage>
  );
};

export type AeWebsitePerspectiveShowcaseProps = {
  brand: string;
  headline: string;
  features: string[];
  accent?: string;
};

export const AeWebsitePerspectiveShowcase: React.FC<AeWebsitePerspectiveShowcaseProps> = ({
  brand,
  headline,
  features,
  accent = '#a75bff',
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const enter = p(frame, 4, 38);
  const zoom = p(frame, 44, 124, smooth);
  const feature = Math.min(features.length - 1, Math.floor(interpolate(zoom, [0, 1], [0, features.length], clamp)));
  const glow = interpolateColors(Math.sin(frame / 18) * 0.5 + 0.5, [0, 1], [accent, '#5d7cff']);
  return (
    <Stage background="#07050f">
      <div
        style={{
          position: 'absolute',
          left: width * 0.5,
          top: height * 0.54,
          width: width * 0.72,
          height: height * 0.67,
          borderRadius: 34,
          background: '#0c0b16',
          border: '2px solid rgba(255,255,255,.26)',
          boxShadow: `0 0 100px ${glow}66, 0 50px 120px rgba(0,0,0,.7)`,
          translate: '-50% -50%',
          rotateX: `${interpolate(enter, [0, 1], [28, 4], clamp)}deg`,
          rotateY: `${interpolate(zoom, [0, 1], [-13, 9], clamp)}deg`,
          rotateZ: `${interpolate(zoom, [0, 1], [-2, 1.5], clamp)}deg`,
          scale: `${interpolate(enter, [0, 1], [0.72, 1], clamp) * interpolate(zoom, [0, 1], [1, 1.12], clamp)}`,
          perspective: 1200,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: 58,
            borderBottom: '1px solid rgba(255,255,255,.12)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 26px',
            gap: 10,
          }}
        >
          {[0, 1, 2].map((dot) => (
            <div key={dot} style={{width: 10, height: 10, borderRadius: '50%', background: dot === 0 ? accent : '#383548'}} />
          ))}
          <div style={{marginLeft: 18, fontWeight: 650}}>{brand}</div>
        </div>
        <div style={{padding: `${height * 0.09}px ${width * 0.07}px`}}>
          <div style={{fontSize: 72, lineHeight: 1, fontWeight: 650, letterSpacing: '-0.055em', maxWidth: 780}}>
            {headline}
          </div>
          <div style={{marginTop: 34, display: 'flex', gap: 16}}>
            {features.map((label, index) => (
              <div
                key={label}
                style={{
                  padding: '15px 22px',
                  borderRadius: 999,
                  background: index === feature ? accent : 'rgba(255,255,255,.08)',
                  color: index === feature ? '#fff' : 'rgba(255,255,255,.58)',
                  scale: `${index === feature ? 1.06 : 1}`,
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 54,
              height: 210,
              borderRadius: 24,
              background: `radial-gradient(circle at ${25 + zoom * 55}% 50%, ${accent}, transparent 18%), linear-gradient(110deg, #11101c, #19142b)`,
              border: '1px solid rgba(255,255,255,.14)',
            }}
          />
        </div>
      </div>
    </Stage>
  );
};
