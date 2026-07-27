import React from 'react';
import {Video} from '@remotion/media';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

const palette = {
  black: '#050806',
  surface: '#101510',
  surface2: '#1a211a',
  white: '#f7f7ef',
  paper: '#f3f0e6',
  ink: '#20251f',
  green: '#a8ff47',
  yellow: '#ffe64f',
  red: '#ff604d',
  muted: '#9ba499',
};

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const snap = Easing.bezier(0.22, 1.12, 0.3, 1);

type MediaKind = 'image' | 'video';

type MediaProps = {
  src?: string;
  kind?: MediaKind;
  fit?: 'cover' | 'contain';
  objectPosition?: string;
};

const mediaSource = (src: string) =>
  /^(https?:|data:|blob:)/.test(src) ? src : staticFile(src);

const MediaFill: React.FC<MediaProps> = ({
  src,
  kind = 'video',
  fit = 'cover',
  objectPosition = '50% 40%',
}) => {
  if (!src) {
    return (
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 30% 25%,rgba(168,255,71,.16),transparent 26%),linear-gradient(145deg,#293229,#0b0f0b 68%)',
        }}
      />
    );
  }
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: fit,
    objectPosition,
  };
  return kind === 'image' ? (
    <Img src={mediaSource(src)} style={style} />
  ) : (
    <Video src={mediaSource(src)} style={style} muted />
  );
};

const GridBackdrop: React.FC<{light?: boolean}> = ({light = false}) => (
  <AbsoluteFill
    style={{
      backgroundColor: light ? palette.paper : palette.black,
      backgroundImage: light
        ? 'linear-gradient(rgba(32,37,31,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(32,37,31,.045) 1px,transparent 1px)'
        : 'linear-gradient(rgba(168,255,71,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(168,255,71,.045) 1px,transparent 1px)',
      backgroundSize: '54px 54px',
    }}
  />
);

const Stage: React.FC<
  React.PropsWithChildren<{light?: boolean; padding?: number}>
> = ({children, light = false, padding = 0}) => (
  <AbsoluteFill
    style={{
      color: light ? palette.ink : palette.white,
      backgroundColor: light ? palette.paper : palette.black,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
      overflow: 'hidden',
      padding,
    }}
  >
    <GridBackdrop light={light} />
    {children}
  </AbsoluteFill>
);

const Presenter: React.FC<{
  src?: string;
  kind?: MediaKind;
  label?: string;
  outline?: string;
}> = ({src, kind, label = 'A-ROLL', outline = palette.green}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      background: '#657064',
    }}
  >
    {src ? (
      <MediaFill src={src} kind={kind} objectPosition="50% 28%" />
    ) : (
      <>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '15%',
            width: '33%',
            aspectRatio: '1',
            borderRadius: '50%',
            background: '#a9b0a6',
            translate: '-50% 0',
            boxShadow: `0 0 0 7px ${outline}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '-20%',
            width: '76%',
            height: '78%',
            borderRadius: '48% 48% 8% 8%',
            background: '#465047',
            translate: '-50% 0',
          }}
        />
      </>
    )}
    <div
      style={{
        position: 'absolute',
        left: 18,
        bottom: 16,
        padding: '7px 12px',
        borderRadius: 999,
        background: 'rgba(5,8,6,.76)',
        color: palette.white,
        fontSize: 18,
        fontWeight: 850,
        letterSpacing: 1,
      }}
    >
      {label}
    </div>
  </div>
);

const MiniTimeline: React.FC<{accent?: string}> = ({
  accent = palette.green,
}) => {
  const frame = useCurrentFrame();
  const clips = [74, 112, 88, 128, 64, 104, 82];
  return (
    <div
      style={{
        height: 150,
        borderRadius: 26,
        background: '#202820',
        padding: 26,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {clips.map((width, index) => (
        <div
          key={`${width}-${index}`}
          style={{
            width,
            height: 58,
            borderRadius: 8,
            background:
              index % 3 === 0
                ? accent
                : index % 3 === 1
                  ? '#5ca6ff'
                  : '#fb7a5f',
            opacity: interpolate(
              frame,
              [8 + index * 3, 17 + index * 3],
              [0, 1],
              clamp,
            ),
            scale: `${interpolate(
              frame,
              [8 + index * 3, 22 + index * 3],
              [0.35, 1],
              {...clamp, easing: ease},
            )} 1`,
            transformOrigin: 'left center',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          top: 16,
          bottom: 16,
          left: `${interpolate(frame, [12, 96], [12, 88], clamp)}%`,
          width: 3,
          background: palette.white,
          boxShadow: '0 0 16px rgba(255,255,255,.8)',
        }}
      />
    </div>
  );
};

export type TimelinePreviewCompareProps = {
  title: string;
  timelineLabel: string;
  previewLabel: string;
  sourceDuration: string;
  outputDuration: string;
  accent: string;
  presenterSrc?: string;
  presenterKind?: MediaKind;
};

export const WideTimelinePreviewCompare: React.FC<
  TimelinePreviewCompareProps
> = ({
  title,
  timelineLabel,
  previewLabel,
  sourceDuration,
  outputDuration,
  accent,
  presenterSrc,
  presenterKind,
}) => {
  const frame = useCurrentFrame();
  const cardY = interpolate(frame, [5, 28], [110, 0], {
    ...clamp,
    easing: ease,
  });
  const arrow = interpolate(frame, [54, 82], [0, 1], {
    ...clamp,
    easing: ease,
  });
  return (
    <Stage padding={76}>
      <div
        style={{
          position: 'relative',
          fontSize: 60,
          fontWeight: 920,
          letterSpacing: -2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          marginTop: 76,
          translate: `0 ${cardY}px`,
        }}
      >
        <div
          style={{
            borderRadius: 42,
            padding: 34,
            background: palette.surface,
            border: '2px solid rgba(255,255,255,.1)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: '12px 22px',
              borderRadius: 14,
              border: `3px dashed ${accent}`,
              fontSize: 28,
              fontWeight: 850,
            }}
          >
            {timelineLabel}
          </div>
          <div style={{marginTop: 38}}>
            <MiniTimeline accent={accent} />
          </div>
          <div
            style={{
              marginTop: 28,
              color: palette.muted,
              fontSize: 24,
            }}
          >
            原素材 {sourceDuration}
          </div>
        </div>
        <div
          style={{
            borderRadius: 42,
            padding: 34,
            background: palette.surface,
            border: '2px solid rgba(255,255,255,.1)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: '12px 22px',
              borderRadius: 14,
              border: `3px dashed ${accent}`,
              fontSize: 28,
              fontWeight: 850,
            }}
          >
            {previewLabel}
          </div>
          <div
            style={{
              position: 'relative',
              height: 300,
              marginTop: 38,
              borderRadius: 28,
              overflow: 'hidden',
            }}
          >
            <Presenter
              src={presenterSrc}
              kind={presenterKind}
              label="剪辑预览"
              outline={accent}
            />
          </div>
          <div
            style={{marginTop: 28, color: palette.muted, fontSize: 24}}
          >
            成片 {outputDuration}
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 360,
          right: 360,
          bottom: 86,
          height: 84,
          display: 'flex',
          alignItems: 'center',
          opacity: arrow,
        }}
      >
        <div
          style={{
            padding: '14px 24px',
            borderRadius: 14,
            background: accent,
            color: palette.ink,
            fontSize: 28,
            fontWeight: 900,
          }}
        >
          素材 {sourceDuration}
        </div>
        <div
          style={{
            flex: 1,
            height: 4,
            background: accent,
            scale: `${arrow} 1`,
            transformOrigin: 'left center',
          }}
        />
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: '11px solid transparent',
            borderBottom: '11px solid transparent',
            borderLeft: `18px solid ${accent}`,
          }}
        />
        <div
          style={{
            marginLeft: 18,
            padding: '14px 24px',
            borderRadius: 14,
            background: palette.white,
            color: palette.ink,
            fontSize: 28,
            fontWeight: 900,
          }}
        >
          成片 {outputDuration}
        </div>
      </div>
    </Stage>
  );
};

export type ProcessPillBuilderProps = {
  title: string;
  prompt: string;
  steps: string[];
  accent: string;
};

export const WideProcessPillBuilder: React.FC<ProcessPillBuilderProps> = ({
  title,
  prompt,
  steps,
  accent,
}) => {
  const frame = useCurrentFrame();
  const promptWidth = interpolate(frame, [5, 34], [24, 100], {
    ...clamp,
    easing: ease,
  });
  const shell = interpolate(frame, [62, 88], [0, 1], {
    ...clamp,
    easing: ease,
  });
  return (
    <Stage light padding={88}>
      <div
        style={{
          position: 'relative',
          fontSize: 66,
          lineHeight: 1,
          fontWeight: 930,
          letterSpacing: -3,
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: 'relative',
          width: `${promptWidth}%`,
          height: 66,
          marginTop: 72,
          borderRadius: 999,
          border: `3px solid ${palette.ink}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          fontWeight: 750,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {prompt}
        <div
          style={{
            position: 'absolute',
            right: 12,
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: accent,
            display: 'grid',
            placeItems: 'center',
            fontWeight: 950,
          }}
        >
          ↗
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          marginTop: 92,
          padding: 56,
          minHeight: 560,
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 30,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: `4px solid ${accent}`,
            opacity: shell,
            scale: interpolate(frame, [62, 90], [0.92, 1], {
              ...clamp,
              easing: ease,
            }),
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -34,
            padding: '0 30px',
            background: palette.paper,
            color: accent,
            translate: '-50% 0',
            fontSize: 52,
            fontWeight: 950,
            opacity: shell,
          }}
        >
          全流程
        </div>
        {steps.slice(0, 6).map((step, index) => {
          const start = 20 + index * 7;
          return (
            <div
              key={step}
              style={{
                minHeight: 174,
                border: `4px dashed ${accent}`,
                borderRadius: 26,
                display: 'grid',
                placeItems: 'center',
                fontSize: 38,
                fontWeight: 900,
                opacity: interpolate(
                  frame,
                  [start, start + 10],
                  [0, 1],
                  clamp,
                ),
                translate: `0 ${interpolate(
                  frame,
                  [start, start + 22],
                  [90, 0],
                  {...clamp, easing: snap},
                )}px`,
                scale: interpolate(
                  frame,
                  [start, start + 22],
                  [0.78, 1],
                  {...clamp, easing: snap},
                ),
              }}
            >
              {step}
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

export type HudChapterTitleProps = {
  chapterNumber: string;
  title: string;
  subtitle: string;
  accent: string;
};

export const WideHudChapterTitle: React.FC<HudChapterTitleProps> = ({
  chapterNumber,
  title,
  subtitle,
  accent,
}) => {
  const frame = useCurrentFrame();
  const numberScale = interpolate(frame, [4, 30], [0.35, 1], {
    ...clamp,
    easing: snap,
  });
  const line = interpolate(frame, [34, 76], [0, 1], {
    ...clamp,
    easing: ease,
  });
  return (
    <Stage>
      <div
        style={{
          position: 'absolute',
          inset: 52,
          border: '1px solid rgba(168,255,71,.12)',
        }}
      />
      {[
        {left: 60, top: 60, borderLeft: `5px solid ${accent}`, borderTop: `5px solid ${accent}`},
        {right: 60, top: 60, borderRight: `5px solid ${accent}`, borderTop: `5px solid ${accent}`},
        {left: 60, bottom: 60, borderLeft: `5px solid ${accent}`, borderBottom: `5px solid ${accent}`},
        {right: 60, bottom: 60, borderRight: `5px solid ${accent}`, borderBottom: `5px solid ${accent}`},
      ].map((style, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            width: 92,
            height: 92,
            ...style,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 46,
        }}
      >
        <div
          style={{
            color: accent,
            fontSize: 190,
            fontWeight: 980,
            fontStyle: 'italic',
            letterSpacing: -12,
            scale: numberScale,
            opacity: interpolate(frame, [4, 18], [0, 1], clamp),
            textShadow: `0 0 36px ${accent}66`,
          }}
        >
          {chapterNumber}
        </div>
        <div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 940,
              letterSpacing: -4,
              opacity: interpolate(frame, [18, 36], [0, 1], clamp),
              translate: `${interpolate(frame, [18, 44], [140, 0], {
                ...clamp,
                easing: ease,
              })}px 0`,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 35,
              color: palette.muted,
              marginTop: 18,
              opacity: interpolate(frame, [34, 52], [0, 1], clamp),
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 360,
          right: 360,
          bottom: 190,
          height: 4,
          background: 'rgba(255,255,255,.14)',
        }}
      >
        <div
          style={{
            width: `${line * 100}%`,
            height: '100%',
            background: accent,
            boxShadow: `0 0 20px ${accent}`,
          }}
        />
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${20 + index * 28}%`,
              top: -7,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: index === 2 ? accent : palette.surface2,
              border: `3px solid ${accent}`,
            }}
          />
        ))}
      </div>
    </Stage>
  );
};

export type ExplodedWorkflowBoardProps = {
  title: string;
  cards: string[];
  accent: string;
};

export const WideExplodedWorkflowBoard: React.FC<
  ExplodedWorkflowBoardProps
> = ({title, cards, accent}) => {
  const frame = useCurrentFrame();
  const positions = [
    {left: 80, top: 110, rotate: -5},
    {left: 610, top: 70, rotate: 3},
    {right: 80, top: 120, rotate: 5},
    {left: 140, bottom: 92, rotate: 4},
    {left: 680, bottom: 58, rotate: -3},
    {right: 70, bottom: 100, rotate: -5},
  ];
  const camera = interpolate(frame, [0, 119], [0.96, 1.04], clamp);
  return (
    <Stage>
      <div style={{position: 'absolute', inset: -30, scale: camera}}>
        {cards.slice(0, 6).map((card, index) => {
          const start = 8 + index * 8;
          const position = positions[index];
          return (
            <div
              key={card}
              style={{
                position: 'absolute',
                width: 430,
                height: 280,
                borderRadius: 26,
                padding: 28,
                background: palette.surface,
                border: '2px solid rgba(255,255,255,.12)',
                boxShadow: '0 28px 60px rgba(0,0,0,.42)',
                opacity: interpolate(
                  frame,
                  [start, start + 12],
                  [0, 1],
                  clamp,
                ),
                translate: `${interpolate(
                  frame,
                  [start, start + 28],
                  [index % 2 ? 130 : -130, 0],
                  {...clamp, easing: ease},
                )}px ${interpolate(
                  frame,
                  [start, start + 28],
                  [80, 0],
                  {...clamp, easing: ease},
                )}px`,
                rotate: `${position.rotate}deg`,
                ...position,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: 112,
                  borderRadius: 16,
                  background:
                    index % 2
                      ? 'linear-gradient(135deg,#55695a,#171d18)'
                      : 'linear-gradient(135deg,#3d566d,#161d24)',
                }}
              />
              <div
                style={{
                  marginTop: 22,
                  fontSize: 30,
                  fontWeight: 900,
                }}
              >
                {card}
              </div>
              <div
                style={{
                  width: `${48 + index * 7}%`,
                  height: 8,
                  borderRadius: 999,
                  background: accent,
                  marginTop: 18,
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            maxWidth: 980,
            textAlign: 'center',
            fontSize: 76,
            lineHeight: 1.03,
            fontWeight: 960,
            color: accent,
            letterSpacing: -4,
            textShadow: '0 10px 40px rgba(0,0,0,.9)',
            opacity: interpolate(frame, [48, 68], [0, 1], clamp),
            scale: interpolate(frame, [48, 80], [0.72, 1], {
              ...clamp,
              easing: snap,
            }),
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 54,
          bottom: 54,
          width: 150,
          height: 150,
          borderRadius: '50%',
          overflow: 'hidden',
          border: `5px solid ${accent}`,
        }}
      >
        <Presenter label="讲解者" outline={accent} />
      </div>
    </Stage>
  );
};

const MockDashboard: React.FC<{accent: string}> = ({accent}) => (
  <AbsoluteFill
    style={{
      background: '#0c110d',
      padding: 48,
      display: 'grid',
      gridTemplateColumns: '210px 1fr 360px',
      gap: 22,
    }}
  >
    <div
      style={{
        borderRadius: 22,
        background: '#141b15',
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      {[70, 46, 62, 52, 76, 40].map((width, index) => (
        <div
          key={`${width}-${index}`}
          style={{
            width: `${width}%`,
            height: 16,
            borderRadius: 999,
            background: index === 1 ? accent : '#4d584e',
          }}
        />
      ))}
    </div>
    <div
      style={{
        borderRadius: 22,
        background: '#111712',
        padding: 26,
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 18,
        alignContent: 'start',
      }}
    >
      {Array.from({length: 12}, (_, index) => (
        <div
          key={index}
          style={{
            height: 148,
            borderRadius: 18,
            background:
              index % 3 === 0
                ? 'linear-gradient(145deg,#375440,#1b241d)'
                : '#202820',
            border: '1px solid rgba(255,255,255,.08)',
          }}
        />
      ))}
    </div>
    <div
      style={{
        borderRadius: 22,
        background: '#151b16',
        padding: 26,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      {[92, 76, 88, 54, 68, 96, 61].map((width, index) => (
        <div
          key={`${width}-${index}`}
          style={{
            width: `${width}%`,
            height: index === 0 ? 26 : 14,
            borderRadius: 999,
            background: index === 0 ? palette.white : '#566057',
          }}
        />
      ))}
    </div>
  </AbsoluteFill>
);

export type TutorialSpotlightProps = {
  title: string;
  callout: string;
  accent: string;
};

export const WideTutorialSpotlight: React.FC<TutorialSpotlightProps> = ({
  title,
  callout,
  accent,
}) => {
  const frame = useCurrentFrame();
  const spotlightScale = interpolate(frame, [14, 42], [0.75, 1], {
    ...clamp,
    easing: snap,
  });
  const presenterX = interpolate(frame, [38, 68], [360, 0], {
    ...clamp,
    easing: ease,
  });
  return (
    <Stage>
      <MockDashboard accent={accent} />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg,rgba(3,5,3,.12),rgba(3,5,3,.52))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 370,
          top: 132,
          width: 930,
          height: 455,
          borderRadius: 26,
          border: `5px dashed ${palette.red}`,
          boxShadow: '0 0 0 2000px rgba(0,0,0,.68)',
          scale: spotlightScale,
          opacity: interpolate(frame, [8, 24], [0, 1], clamp),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 430,
          top: 650,
          padding: '22px 30px',
          borderRadius: 20,
          background: accent,
          color: palette.ink,
          fontSize: 34,
          fontWeight: 920,
          opacity: interpolate(frame, [26, 42], [0, 1], clamp),
          translate: `0 ${interpolate(frame, [26, 50], [70, 0], {
            ...clamp,
            easing: ease,
          })}px`,
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 430,
          top: 730,
          width: 690,
          color: palette.white,
          fontSize: 30,
          lineHeight: 1.35,
          opacity: interpolate(frame, [38, 54], [0, 1], clamp),
        }}
      >
        {callout}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 58,
          bottom: -26,
          width: 360,
          height: 560,
          overflow: 'hidden',
          borderRadius: '48% 48% 0 0',
          border: `5px dashed ${accent}`,
          translate: `${presenterX}px 0`,
          opacity: interpolate(frame, [38, 52], [0, 1], clamp),
        }}
      >
        <Presenter label="讲解者" outline={accent} />
      </div>
    </Stage>
  );
};

export type PresenterMediaCardsProps = {
  title: string;
  cards: string[];
  accent: string;
  presenterSrc?: string;
  presenterKind?: MediaKind;
};

export const WidePresenterMediaCards: React.FC<PresenterMediaCardsProps> = ({
  title,
  cards,
  accent,
  presenterSrc,
  presenterKind,
}) => {
  const frame = useCurrentFrame();
  const positions = [
    {left: 90, top: 130},
    {right: 92, top: 130},
    {left: 110, bottom: 138},
    {right: 110, bottom: 138},
  ];
  return (
    <Stage>
      <MediaFill />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 45%,transparent 20%,rgba(4,6,4,.72) 78%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 110,
          width: 610,
          height: 850,
          translate: '-50% 0',
          borderRadius: '46% 46% 8% 8%',
          overflow: 'hidden',
          border: `5px solid ${accent}`,
        }}
      >
        <Presenter
          src={presenterSrc}
          kind={presenterKind}
          label="主持人"
          outline={accent}
        />
      </div>
      {cards.slice(0, 4).map((card, index) => {
        const start = 10 + index * 12;
        const position = positions[index];
        return (
          <div
            key={card}
            style={{
              position: 'absolute',
              width: 420,
              height: 260,
              borderRadius: 28,
              padding: 18,
              background: '#111711',
              border: '3px solid rgba(255,255,255,.24)',
              boxShadow: '0 30px 70px rgba(0,0,0,.5)',
              opacity: interpolate(frame, [start, start + 10], [0, 1], clamp),
              translate: `${interpolate(
                frame,
                [start, start + 26],
                [index % 2 ? 140 : -140, 0],
                {...clamp, easing: ease},
              )}px 0`,
              ...position,
            }}
          >
            <div
              style={{
                height: 165,
                borderRadius: 18,
                background:
                  index % 2
                    ? 'linear-gradient(145deg,#6b4e84,#222031)'
                    : 'linear-gradient(145deg,#2e6972,#162326)',
              }}
            />
            <div
              style={{
                marginTop: 14,
                textAlign: 'center',
                fontSize: 29,
                fontWeight: 900,
              }}
            >
              {card}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 58,
          translate: '-50% 0',
          padding: '14px 26px',
          borderRadius: 999,
          background: accent,
          color: palette.ink,
          fontSize: 30,
          fontWeight: 920,
          opacity: interpolate(frame, [58, 74], [0, 1], clamp),
        }}
      >
        {title}
      </div>
    </Stage>
  );
};

export type CausalTagMapProps = {
  pairs: Array<{from: string; to: string}>;
  outcome: string;
  accent: string;
};

export const WideCausalTagMap: React.FC<CausalTagMapProps> = ({
  pairs,
  outcome,
  accent,
}) => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <MediaFill />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(90deg,rgba(5,8,6,.62),transparent 34%,transparent 66%,rgba(5,8,6,.66))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 74,
          width: 690,
          height: 900,
          translate: '-50% 0',
          borderRadius: '46% 46% 8% 8%',
          overflow: 'hidden',
        }}
      >
        <Presenter label="观点主体" outline={accent} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 220,
          display: 'flex',
          flexDirection: 'column',
          gap: 36,
        }}
      >
        {pairs.slice(0, 3).map((pair, index) => {
          const start = 8 + index * 14;
          return (
            <div
              key={`${pair.from}-${pair.to}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 15,
                opacity: interpolate(
                  frame,
                  [start, start + 12],
                  [0, 1],
                  clamp,
                ),
                translate: `${interpolate(
                  frame,
                  [start, start + 24],
                  [-130, 0],
                  {...clamp, easing: ease},
                )}px 0`,
              }}
            >
              <div
                style={{
                  minWidth: 150,
                  padding: '17px 22px',
                  borderRadius: 16,
                  border: `3px dashed ${accent}`,
                  background: 'rgba(20,27,21,.88)',
                  fontSize: 31,
                  fontWeight: 860,
                  textAlign: 'center',
                }}
              >
                {pair.from}
              </div>
              <div style={{width: 92, height: 4, background: accent}} />
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '9px solid transparent',
                  borderBottom: '9px solid transparent',
                  borderLeft: `15px solid ${accent}`,
                }}
              />
              <div
                style={{
                  minWidth: 150,
                  padding: '17px 22px',
                  borderRadius: 16,
                  background: accent,
                  color: palette.ink,
                  fontSize: 31,
                  fontWeight: 920,
                  textAlign: 'center',
                }}
              >
                {pair.to}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 74,
          top: 382,
          width: 330,
          padding: '28px 34px',
          borderRadius: 18,
          background: '#d7a66b',
          color: palette.ink,
          border: '3px dashed rgba(32,37,31,.55)',
          fontSize: 38,
          lineHeight: 1.12,
          fontWeight: 930,
          textAlign: 'center',
          opacity: interpolate(frame, [54, 68], [0, 1], clamp),
          translate: `${interpolate(frame, [54, 80], [150, 0], {
            ...clamp,
            easing: snap,
          })}px 0`,
          rotate: `${interpolate(frame, [54, 80], [6, -2], {
            ...clamp,
            easing: snap,
          })}deg`,
        }}
      >
        {outcome}
      </div>
    </Stage>
  );
};

export type GiantKeywordBackdropProps = {
  keyword: string;
  kicker: string;
  accent: string;
};

export const WideGiantKeywordBackdrop: React.FC<
  GiantKeywordBackdropProps
> = ({keyword, kicker, accent}) => {
  const frame = useCurrentFrame();
  const keywordX = interpolate(frame, [8, 34], [-300, 0], {
    ...clamp,
    easing: ease,
  });
  return (
    <Stage>
      <MockDashboard accent={accent} />
      <AbsoluteFill style={{background: 'rgba(3,5,3,.44)'}} />
      <div
        style={{
          position: 'absolute',
          left: 62,
          right: 62,
          top: 160,
          color: accent,
          fontSize: 190,
          lineHeight: 0.9,
          fontWeight: 980,
          letterSpacing: -12,
          opacity: interpolate(frame, [8, 22], [0, 1], clamp),
          translate: `${keywordX}px 0`,
          textShadow: '0 18px 50px rgba(0,0,0,.72)',
        }}
      >
        {keyword}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: -34,
          width: 560,
          height: 780,
          translate: '-50% 0',
          borderRadius: '48% 48% 0 0',
          overflow: 'hidden',
          border: `5px dashed ${palette.white}`,
          opacity: interpolate(frame, [20, 36], [0, 1], clamp),
          scale: interpolate(frame, [20, 46], [0.82, 1], {
            ...clamp,
            easing: snap,
          }),
        }}
      >
        <Presenter label="人物独立层" outline={accent} />
      </div>
      <div
        style={{
          position: 'absolute',
          right: 86,
          bottom: 88,
          padding: '16px 24px',
          borderRadius: 14,
          background: palette.white,
          color: palette.ink,
          fontSize: 32,
          fontWeight: 920,
          opacity: interpolate(frame, [48, 64], [0, 1], clamp),
        }}
      >
        {kicker}
      </div>
    </Stage>
  );
};
