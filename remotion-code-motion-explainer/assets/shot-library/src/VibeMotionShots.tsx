import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const ink = '#11120f';
const paper = '#f4f1e9';
const lime = '#c9f36a';
const orange = '#ff7658';
const blue = '#8bb7ff';
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const Stage: React.FC<React.PropsWithChildren<{background?: string}>> = ({
  children,
  background = ink,
}) => (
  <AbsoluteFill
    style={{
      overflow: 'hidden',
      background,
      color: paper,
      fontFamily: '-apple-system, BlinkMacSystemFont, PingFang SC, sans-serif',
    }}
  >
    {children}
  </AbsoluteFill>
);

const PersonSilhouette: React.FC<{side: 'left' | 'right'}> = ({side}) => (
  <div
    style={{
      position: 'absolute',
      left: side === 'left' ? 90 : 1420,
      top: 80,
      width: 410,
      height: 900,
      opacity: 0.78,
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: 100,
        top: 40,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: '#9da398',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: 410,
        height: 690,
        borderRadius: '46% 46% 18% 18%',
        background: '#4b5048',
      }}
    />
  </div>
);

export type WideElasticKeyPointProps = {
  eyebrow: string;
  title: string;
  detail: string;
  accent?: string;
};

export const WideElasticKeyPoint: React.FC<WideElasticKeyPointProps> = ({
  eyebrow,
  title,
  detail,
  accent = lime,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const anticipation = interpolate(frame, [8, 15, 19], [1, 0.965, 1.025], {
    ...clamp,
    easing: ease,
  });
  const settle = spring({
    frame: frame - 16,
    fps,
    config: {mass: 0.85, damping: 13, stiffness: 155},
  });
  const scale = anticipation * interpolate(settle, [0, 1], [0.72, 1], clamp);
  const y = interpolate(settle, [0, 1], [120, 0], clamp);
  const words = title.split(' ');

  return (
    <Stage background="#d9ddd4">
      <PersonSilhouette side="left" />
      <PersonSilhouette side="right" />
      <AbsoluteFill style={{background: 'rgba(17,18,15,.18)'}} />
      <div
        style={{
          position: 'absolute',
          left: 430,
          right: 430,
          top: 180,
          minHeight: 610,
          padding: '58px 68px 66px',
          borderRadius: 44,
          background: 'rgba(17,18,15,.94)',
          border: `5px solid ${accent}`,
          boxShadow: '0 42px 110px rgba(0,0,0,.34)',
          transform: `translateY(${y}px) scale(${scale})`,
          transformOrigin: '50% 70%',
        }}
      >
        <div style={{fontSize: 25, letterSpacing: 5, fontWeight: 900, color: accent}}>
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: 36,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px 25px',
            fontSize: 86,
            lineHeight: 1.06,
            fontWeight: 950,
            letterSpacing: -4,
          }}
        >
          {words.map((word, index) => {
            const reveal = interpolate(
              frame,
              [20 + index * 5, 31 + index * 5],
              [0, 1],
              {...clamp, easing: ease},
            );
            return (
              <span
                key={`${word}-${index}`}
                style={{
                  opacity: reveal,
                  transform: `translateY(${(1 - reveal) * 36}px)`,
                  color: index === words.length - 1 ? accent : paper,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
        <div style={{marginTop: 42, fontSize: 34, lineHeight: 1.45, color: '#c4c8bf'}}>
          {detail}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 68,
            bottom: 42,
            height: 8,
            width: `${interpolate(frame, [33, 68], [0, 74], {...clamp, easing: ease})}%`,
            borderRadius: 999,
            background: accent,
          }}
        />
      </div>
    </Stage>
  );
};

export type WideRulerChapterProgressProps = {
  title: string;
  chapters: string[];
  activeIndex: number;
  accent?: string;
};

export const WideRulerChapterProgress: React.FC<WideRulerChapterProgressProps> = ({
  title,
  chapters,
  activeIndex,
  accent = lime,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 119], [0.04, 0.96], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const ticks = Array.from({length: 41}, (_, index) => index);

  return (
    <Stage background="#f3efe5">
      <div style={{position: 'absolute', left: 96, top: 80, color: ink}}>
        <div style={{fontSize: 25, fontWeight: 900, letterSpacing: 4}}>CHAPTER PROGRESS</div>
        <div style={{fontSize: 76, fontWeight: 950, letterSpacing: -4, marginTop: 18}}>
          {title}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 95,
          right: 95,
          top: 310,
          height: 500,
          borderRadius: 42,
          background: ink,
          padding: '56px 64px',
          boxShadow: '0 32px 80px rgba(24,23,19,.18)',
        }}
      >
        <div style={{display: 'grid', gridTemplateColumns: `repeat(${chapters.length},1fr)`, gap: 18}}>
          {chapters.map((chapter, index) => {
            const start = 9 + index * 7;
            const visible = interpolate(frame, [start, start + 14], [0, 1], {
              ...clamp,
              easing: ease,
            });
            const active = index === activeIndex;
            return (
              <div
                key={chapter}
                style={{
                  minHeight: 160,
                  padding: '28px 30px',
                  borderRadius: 26,
                  background: active ? accent : '#282b25',
                  color: active ? ink : paper,
                  opacity: visible,
                  transform: `translateY(${(1 - visible) * 38}px)`,
                }}
              >
                <div style={{fontSize: 22, opacity: 0.55}}>0{index + 1}</div>
                <div style={{fontSize: 33, fontWeight: 900, marginTop: 18}}>{chapter}</div>
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', left: 64, right: 64, bottom: 92, height: 128}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 74, height: 5, background: '#54594f'}} />
          {ticks.map((index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${(index / (ticks.length - 1)) * 100}%`,
                top: index % 5 === 0 ? 45 : 58,
                width: 3,
                height: index % 5 === 0 ? 54 : 28,
                background: index / 40 <= progress ? accent : '#71766d',
              }}
            />
          ))}
          <div
            style={{
              position: 'absolute',
              left: `${progress * 100}%`,
              top: 17,
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: orange,
              boxShadow: `0 0 0 10px rgba(255,118,88,.18)`,
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      </div>
    </Stage>
  );
};

export type WideEvidenceTickerProps = {
  title: string;
  labels: string[];
  accent?: string;
};

export const WideEvidenceTicker: React.FC<WideEvidenceTickerProps> = ({
  title,
  labels,
  accent = blue,
}) => {
  const frame = useCurrentFrame();
  const all = labels.length ? labels : ['真实案例', '公开数据', '用户反馈', '现场素材'];
  const columns = [0, 1, 2];

  return (
    <Stage>
      <div style={{position: 'absolute', left: 76, top: 64, width: 505, zIndex: 5}}>
        <div style={{fontSize: 24, letterSpacing: 4, color: accent, fontWeight: 900}}>EVIDENCE WALL</div>
        <div style={{fontSize: 72, lineHeight: 1.04, fontWeight: 950, marginTop: 24}}>{title}</div>
        <div style={{fontSize: 29, lineHeight: 1.48, color: '#aeb4a9', marginTop: 32}}>
          主持人保留在安全区，素材墙持续运动，当前证据在被解说时抬高
        </div>
      </div>
      <div style={{position: 'absolute', left: 70, bottom: 60, width: 390, height: 470}}>
        <PersonSilhouette side="left" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 610,
          top: -150,
          width: 1450,
          height: 1380,
          display: 'flex',
          gap: 34,
          transform: 'perspective(1200px) rotateY(-11deg) rotateZ(2deg)',
          transformOrigin: '50% 50%',
        }}
      >
        {columns.map((column) => (
          <div key={column} style={{position: 'relative', width: 430, height: 1380, overflow: 'hidden'}}>
            {Array.from({length: 7}, (_, index) => {
              const lane = column % 2 === 0 ? 1 : -1;
              const travel = (frame * (1.8 + column * 0.24) * lane + index * 230) % 1610;
              const y = lane === 1 ? travel - 260 : 1180 - travel;
              const label = all[(index + column) % all.length];
              const active = (index + column + Math.floor(frame / 30)) % 5 === 0;
              return (
                <div
                  key={`${column}-${index}`}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: y,
                    width: 410,
                    height: 200,
                    borderRadius: 28,
                    padding: '28px 30px',
                    background: active ? accent : '#282c27',
                    color: active ? ink : paper,
                    border: '3px solid rgba(255,255,255,.08)',
                    boxShadow: active ? `0 25px 70px rgba(139,183,255,.28)` : '0 20px 50px rgba(0,0,0,.24)',
                    transform: `scale(${active ? 1.06 : 0.96})`,
                  }}
                >
                  <div style={{fontSize: 19, opacity: 0.58}}>SOURCE 0{index + 1}</div>
                  <div style={{fontSize: 35, fontWeight: 900, marginTop: 48}}>{label}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Stage>
  );
};

export type WideSpotlightRevealProps = {
  eyebrow: string;
  title: string;
  accent?: string;
};

export const WideSpotlightReveal: React.FC<WideSpotlightRevealProps> = ({
  eyebrow,
  title,
  accent = lime,
}) => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [0, 74], [-28, 112], {...clamp, easing: ease});
  const reveal = interpolate(frame, [14, 54], [0, 100], {...clamp, easing: ease});
  const line = interpolate(frame, [42, 78], [0, 680], {...clamp, easing: ease});

  return (
    <Stage background="#090a08">
      <div
        style={{
          position: 'absolute',
          left: `${sweep}%`,
          top: -160,
          width: 640,
          height: 1450,
          background: 'linear-gradient(100deg,transparent 5%,rgba(255,249,214,.30) 49%,transparent 93%)',
          filter: 'blur(20px)',
          transform: 'skewX(-10deg)',
        }}
      />
      <div style={{position: 'absolute', left: 170, right: 170, top: 225}}>
        <div style={{fontSize: 27, letterSpacing: 6, color: accent, fontWeight: 900}}>{eyebrow}</div>
        <div
          style={{
            marginTop: 38,
            fontSize: 125,
            lineHeight: 1.02,
            fontWeight: 950,
            letterSpacing: -7,
            color: paper,
            clipPath: `inset(0 ${100 - reveal}% 0 0)`,
            textShadow: '0 26px 80px rgba(0,0,0,.65)',
          }}
        >
          {title}
        </div>
        <div style={{marginTop: 56, width: line, height: 11, borderRadius: 999, background: accent}} />
      </div>
      <div
        style={{
          position: 'absolute',
          right: 86,
          bottom: 70,
          fontSize: 22,
          letterSpacing: 4,
          color: '#777d72',
        }}
      >
        LIGHT / MASK / TYPOGRAPHY
      </div>
    </Stage>
  );
};
