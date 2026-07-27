import React from 'react';
import {Audio} from '@remotion/media';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  staticFile,
  useCurrentFrame,
} from 'remotion';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
const overshoot = Easing.bezier(0.34, 1.56, 0.64, 1);

const phase = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = easeOut,
) =>
  interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing,
  });

const windowOpacity = (
  frame: number,
  start: number,
  enterEnd: number,
  exitStart: number,
  end: number,
) =>
  interpolate(frame, [start, enterEnd, exitStart, end], [0, 1, 1, 0], {
    ...clamp,
  });

const FONT =
  '"Helvetica Neue", Helvetica, Arial, "SF Pro Display", sans-serif';

const Glow: React.FC<{
  x: number;
  y: number;
  width: number;
  height?: number;
  color: string;
  opacity?: number;
  blur?: number;
  rotate?: number;
}> = ({
  x,
  y,
  width,
  height = width,
  color,
  opacity = 0.8,
  blur = 42,
  rotate = 0,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      borderRadius: '50%',
      background: color,
      opacity,
      filter: `blur(${blur}px)`,
      mixBlendMode: 'screen',
      translate: '-50% -50%',
      rotate: `${rotate}deg`,
    }}
  />
);

const Dot: React.FC<{
  x: number;
  y: number;
  size?: number;
  glow?: string;
  opacity?: number;
}> = ({x, y, size = 18, glow, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: glow
        ? `0 0 ${size * 0.7}px ${size * 0.22}px #fff, 0 0 ${size * 2.5}px ${size * 0.8}px ${glow}`
        : undefined,
      opacity,
      translate: '-50% -50%',
    }}
  />
);

const FourPointStar: React.FC<{
  size: number;
  opacity?: number;
  glow?: number;
  rotate?: number;
  stretched?: number;
}> = ({size, opacity = 1, glow = 0, rotate = 0, stretched = 1}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{
      opacity,
      overflow: 'visible',
      rotate: `${rotate}deg`,
      scale: `${stretched} 1`,
      filter: glow
        ? `drop-shadow(0 0 ${glow * 0.45}px #1725ff) drop-shadow(0 0 ${glow}px #24e7ff)`
        : undefined,
    }}
  >
    <defs>
      <linearGradient id="replica-star-gradient" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#1200ff" />
        <stop offset=".48" stopColor="#7934ff" />
        <stop offset="1" stopColor="#28f6d2" />
      </linearGradient>
    </defs>
    <path
      d="M50 3 C54 36 64 46 97 50 C64 54 54 64 50 97 C46 64 36 54 3 50 C36 46 46 36 50 3Z"
      fill="#050507"
      stroke="url(#replica-star-gradient)"
      strokeWidth="3"
    />
    <path
      d="M50 18 C53 39 61 47 82 50 C61 53 53 61 50 82 C47 61 39 53 18 50 C39 47 47 39 50 18Z"
      fill="rgba(112,66,255,.12)"
      stroke="rgba(148,87,255,.55)"
      strokeWidth="1.2"
    />
  </svg>
);

const Footer: React.FC<{background: 'black' | 'white'; opacity?: number}> = ({
  background,
  opacity = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      bottom: 180,
      width: '100%',
      textAlign: 'center',
      color: background === 'white' ? '#111' : '#fff',
      fontFamily: FONT,
      fontSize: 38,
      fontWeight: 320,
      letterSpacing: '-0.025em',
      opacity,
    }}
  >
    Project File In Description
  </div>
);

const DiscoveryScene: React.FC<{frame: number}> = ({frame}) => {
  const introOut = phase(frame, 82, 118, easeIn);
  const pathDraw = phase(frame, 0, 66, easeInOut);
  const orbitIn = phase(frame, 100, 152, easeOut);
  const orbitToDiamond = phase(frame, 208, 258, easeInOut);
  const collapse = phase(frame, 260, 306, easeInOut);
  const finding = phase(frame, 303, 333, easeOut);
  const starToPill = phase(frame, 352, 406, overshoot);
  const cardExit = phase(frame, 455, 508, easeIn);

  const topGlowY = interpolate(frame, [0, 40, 74, 108], [1110, 760, 820, 520], {
    ...clamp,
    easing: easeInOut,
  });
  const bottomGlowY = interpolate(frame, [0, 64, 108], [1710, 1450, 1100], {
    ...clamp,
    easing: easeOut,
  });
  const pathOffset = 1 - pathDraw;

  const radius = interpolate(collapse, [0, 1], [325, 24], clamp);
  const diamondRadius = interpolate(orbitToDiamond, [0, 1], [radius, radius * 0.83], clamp);
  const orbitRotate = interpolate(orbitToDiamond, [0, 1], [0, 38], clamp);
  const control = interpolate(orbitToDiamond, [0, 1], [0.552, 0.12], clamp);
  const orbitCenterY = interpolate(frame, [90, 160, 260, 305], [960, 900, 930, 860], clamp);
  const rx = diamondRadius;
  const ry = diamondRadius * interpolate(orbitToDiamond, [0, 1], [1, 0.78], clamp);
  const kx = rx * control;
  const ky = ry * control;
  const orbitPath = `M 540 ${orbitCenterY - ry}
    C ${540 + kx} ${orbitCenterY - ry}, ${540 + rx} ${orbitCenterY - ky}, ${540 + rx} ${orbitCenterY}
    C ${540 + rx} ${orbitCenterY + ky}, ${540 + kx} ${orbitCenterY + ry}, 540 ${orbitCenterY + ry}
    C ${540 - kx} ${orbitCenterY + ry}, ${540 - rx} ${orbitCenterY + ky}, ${540 - rx} ${orbitCenterY}
    C ${540 - rx} ${orbitCenterY - ky}, ${540 - kx} ${orbitCenterY - ry}, 540 ${orbitCenterY - ry}`;

  const pillWidth = interpolate(starToPill, [0, 1], [68, 690], clamp);
  const pillHeight = interpolate(starToPill, [0, 1], [68, 184], clamp);
  const cardX = interpolate(cardExit, [0, 1], [540, 1260], clamp);
  const labelOpacity = phase(frame, 389, 424, easeOut) * (1 - cardExit);
  const starScale = interpolate(starToPill, [0, 1], [1.12, 0.78], clamp);

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{opacity: 1 - introOut}}>
        <svg
          width={1080}
          height={1920}
          viewBox="0 0 1080 1920"
          style={{position: 'absolute', inset: 0}}
        >
          <path
            d="M 304 1920 C 520 1760 644 1640 600 1456 C 552 1270 384 1202 432 1028 C 468 900 560 884 570 720"
            fill="none"
            stroke="rgba(255,255,255,.52)"
            strokeWidth="2"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={pathOffset}
          />
          <path
            d="M 421 1250 C 420 1088 416 928 420 744"
            fill="none"
            stroke="rgba(255,255,255,.6)"
            strokeWidth="2"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={pathOffset}
          />
          <path
            d="M 468 720 C 508 670 526 640 500 612 C 484 596 462 604 454 634"
            fill="none"
            stroke="rgba(255,255,255,.75)"
            strokeWidth="2"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={pathOffset}
          />
        </svg>
        <Glow
          x={430}
          y={topGlowY}
          width={460}
          height={104}
          color="linear-gradient(90deg,#1114ff,#20eeff,#2226ff)"
          opacity={0.88 * pathDraw}
          blur={40}
        />
        <Glow
          x={455}
          y={bottomGlowY}
          width={580}
          height={145}
          color="linear-gradient(90deg,#2513ff,#2df7ff,#0d12ff)"
          opacity={0.66 * pathDraw}
          blur={54}
        />
        <Dot x={420} y={interpolate(pathDraw, [0, 1], [1660, 770])} size={18} />
        <Dot x={450} y={interpolate(pathDraw, [0, 1], [1180, 698])} size={14} />
        <Dot x={490} y={interpolate(pathDraw, [0, 1], [830, 665])} size={15} />
        <div
          style={{
            position: 'absolute',
            top: 466,
            left: 0,
            width: '100%',
            textAlign: 'center',
            fontFamily: FONT,
            fontSize: 49,
            fontWeight: 350,
            color: '#eee',
            letterSpacing: '-0.035em',
            opacity: phase(frame, 22, 50) * (1 - phase(frame, 76, 104, easeIn)),
          }}
        >
          Let&apos;s begin
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: orbitIn * (1 - collapse),
          rotate: `${orbitRotate}deg`,
          filter: `blur(${interpolate(frame, [118, 150, 166], [8, 0, 0], clamp)}px)`,
        }}
      >
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <defs>
            <linearGradient id="replica-orbit" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#1a12ff" />
              <stop offset=".28" stopColor="#27f5d6" />
              <stop offset=".53" stopColor="#050505" />
              <stop offset=".78" stopColor="#1400ff" />
              <stop offset="1" stopColor="#36f2c4" />
            </linearGradient>
            <filter id="replica-orbit-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="16" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={orbitPath}
            fill="none"
            stroke="url(#replica-orbit)"
            strokeWidth={interpolate(orbitToDiamond, [0, 1], [22, 32], clamp)}
            strokeLinecap="round"
            filter="url(#replica-orbit-glow)"
            pathLength="1"
            strokeDasharray="0.18 0.08 0.15 0.11 0.22 0.09"
            strokeDashoffset={interpolate(frame, [105, 250], [1, -0.3], clamp)}
          />
          <path
            d={orbitPath}
            fill="none"
            stroke="rgba(255,255,255,.32)"
            strokeWidth="1.6"
          />
        </svg>
        {[0, 1, 2, 3].map((index) => {
          const angle = (-Math.PI / 2 + index * Math.PI * 0.5) + (orbitRotate * Math.PI) / 180;
          return (
            <Dot
              key={index}
              x={540 + Math.cos(angle) * rx}
              y={orbitCenterY + Math.sin(angle) * ry}
              size={24}
            />
          );
        })}
        <div
          style={{
            position: 'absolute',
            top: orbitCenterY - 40,
            width: '100%',
            textAlign: 'center',
            color: '#eee',
            fontFamily: FONT,
            fontSize: 47,
            fontWeight: 350,
            letterSpacing: '-0.035em',
            opacity: phase(frame, 128, 160) * (1 - phase(frame, 254, 286, easeIn)),
            scale: `${interpolate(frame, [126, 144, 166], [0.84, 1.06, 1], clamp)} 1`,
            filter: `blur(${interpolate(frame, [128, 145, 162], [7, 1, 0], clamp)}px)`,
          }}
        >
          With a system
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 865,
          width: 160,
          height: 160,
          translate: '-50% -50%',
          opacity: collapse * (1 - starToPill * 0.75),
          scale: `${interpolate(collapse, [0, 1], [0.5, 1], clamp)}`,
        }}
      >
        <FourPointStar
          size={160}
          glow={22}
          rotate={interpolate(frame, [270, 350], [28, 0], clamp)}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1018,
          width: '100%',
          textAlign: 'center',
          fontFamily: FONT,
          fontSize: 47,
          fontWeight: 350,
          color: '#e9e9e9',
          letterSpacing: '-0.035em',
          opacity: finding * (1 - starToPill),
        }}
      >
        Finding form
      </div>

      <div
        style={{
          position: 'absolute',
          left: cardX,
          top: 900,
          width: pillWidth,
          height: pillHeight,
          translate: '-50% -50%',
          borderRadius: interpolate(starToPill, [0, 1], [34, 44], clamp),
          background:
            'linear-gradient(104deg,#eee9ff 0%,#aaa7ff 21%,#1916fb 45%,#01eeea 100%)',
          overflow: 'hidden',
          boxShadow:
            '0 0 34px rgba(36,39,255,.38), 0 0 48px rgba(17,238,228,.17)',
          opacity: starToPill * (1 - cardExit),
        }}
      >
        <Glow
          x={pillWidth * 0.78}
          y={pillHeight * 0.44}
          width={pillWidth * 0.65}
          height={pillHeight * 1.05}
          color="#7ffff4"
          opacity={0.75}
          blur={34}
        />
        <div
          style={{
            position: 'absolute',
            left: 76,
            top: '50%',
            translate: '0 -50%',
            scale: `${starScale}`,
          }}
        >
          <FourPointStar size={92} glow={12} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 190,
            top: '50%',
            translate: '0 -50%',
            fontFamily: FONT,
            color: '#f7f7fb',
            opacity: labelOpacity,
          }}
        >
          <div
            style={{
              fontSize: 57,
              fontWeight: 350,
              letterSpacing: '-0.035em',
            }}
          >
            Form
          </div>
          <div
            style={{
              marginTop: 2,
              fontSize: 35,
              fontWeight: 300,
              color: 'rgba(247,247,251,.55)',
              letterSpacing: '-0.025em',
            }}
          >
            Defines focus
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FocusScene: React.FC<{frame: number}> = ({frame}) => {
  const local = frame - 495;
  const labelIn = phase(local, 56, 86);
  const diagonal = phase(local, 222, 330, easeInOut);
  const finalCollapse = phase(local, 330, 382, easeInOut);
  const nodes = [
    {x: 132, y: 720, delay: 0},
    {x: 310, y: 720, delay: 14},
    {x: 489, y: 720, delay: 28},
    {x: 670, y: 720, delay: 42},
    {x: 850, y: 720, delay: 56},
  ];

  return (
    <AbsoluteFill
      style={{
        background: '#000',
        opacity: windowOpacity(frame, 492, 515, 858, 878),
        overflow: 'hidden',
      }}
    >
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0}}
      >
        <defs>
          <linearGradient id="replica-node-arc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1515ff" />
            <stop offset=".5" stopColor="#8a33ff" />
            <stop offset="1" stopColor="#29efd5" />
          </linearGradient>
          <filter id="replica-node-arc-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="11" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {nodes.slice(0, 4).map((node, index) => {
          const next = nodes[index + 1];
          const arc = phase(local, 94 + index * 25, 132 + index * 25, easeInOut);
          const y1 = node.y + interpolate(diagonal, [0, 1], [0, 200 - index * 80], clamp);
          const y2 = next.y + interpolate(diagonal, [0, 1], [0, 120 - index * 80], clamp);
          const midX = (node.x + next.x) / 2;
          return (
            <path
              key={index}
              d={`M ${node.x} ${y1} Q ${midX} ${Math.min(y1, y2) - 105} ${next.x} ${y2}`}
              fill="none"
              stroke="url(#replica-node-arc)"
              strokeWidth="12"
              strokeLinecap="round"
              filter="url(#replica-node-arc-glow)"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - arc}
              opacity={1 - finalCollapse}
            />
          );
        })}
        {nodes.map((node, index) => {
          const stem = phase(local, 165 + index * 16, 205 + index * 16, easeOut);
          const nodeY = node.y + interpolate(diagonal, [0, 1], [0, 200 - index * 80], clamp);
          return (
            <path
              key={`stem-${index}`}
              d={`M ${node.x} ${nodeY + 8} L ${node.x} ${nodeY + 250}`}
              fill="none"
              stroke="rgba(255,255,255,.52)"
              strokeWidth="2"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - stem}
              opacity={1 - finalCollapse}
            />
          );
        })}
      </svg>
      {nodes.map((node, index) => {
        const enter = phase(local, 28 + index * 18, 50 + index * 18, easeOut);
        const nodeY = node.y + interpolate(diagonal, [0, 1], [0, 200 - index * 80], clamp);
        const gatherX = interpolate(finalCollapse, [0, 1], [node.x, 540], clamp);
        const gatherY = interpolate(finalCollapse, [0, 1], [nodeY, 830], clamp);
        const leader = index === 4;
        return (
          <Dot
            key={node.x}
            x={gatherX}
            y={gatherY}
            size={interpolate(finalCollapse, [0, 1], [leader ? 23 : 15, leader ? 48 : 0], clamp)}
            glow={leader ? '#1c2cff' : index % 2 ? '#14ebdf' : '#4820ff'}
            opacity={enter * interpolate(finalCollapse, [0, 0.75, 1], [1, leader ? 1 : 0, leader ? 1 : 0], clamp)}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          top: 880,
          width: '100%',
          textAlign: 'center',
          color: '#eee',
          fontFamily: FONT,
          fontSize: 39,
          fontWeight: 350,
          letterSpacing: '-0.025em',
          opacity: labelIn * (1 - finalCollapse),
        }}
      >
        Focus organizes motion
      </div>
    </AbsoluteFill>
  );
};

const PillIcon: React.FC<{kind: 0 | 1 | 2}> = ({kind}) => (
  <div
    style={{
      width: 56,
      height: 56,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {kind === 1 ? (
      <div
        style={{
          width: 7,
          height: 48,
          borderRadius: 9,
          background: 'linear-gradient(#27e8ff,#3122ff,#9c40ff)',
          boxShadow: '0 0 18px #3321ff',
        }}
      />
    ) : (
      <FourPointStar size={kind === 0 ? 54 : 48} glow={8} />
    )}
  </div>
);

const SemanticPill: React.FC<{
  frame: number;
  label: string;
  kind: 0 | 1 | 2;
  centerX: number;
  centerY: number;
  start: number;
  end: number;
  lineVariant: 0 | 1 | 2;
}> = ({frame, label, kind, centerX, centerY, start, end, lineVariant}) => {
  const local = frame - start;
  const enter = phase(local, 0, 34, overshoot);
  const exit = phase(frame, end - 26, end, easeIn);
  const visible = enter * (1 - exit);
  const lineDraw = phase(local, 38, 88, easeInOut);
  const width = label === 'Build structure' ? 640 : label === 'Create rhythm' ? 690 : 650;
  const path =
    lineVariant === 0
      ? `M ${centerX + width / 2 - 6} ${centerY}
        C ${centerX + width / 2 + 108} ${centerY - 4},
          ${centerX + width / 2 + 150} ${centerY + 76},
          ${centerX + width / 2 + 158} ${centerY + 170}`
      : lineVariant === 1
        ? `M ${centerX - 72} ${centerY - 78}
          C ${centerX - 192} ${centerY - 310},
            ${centerX - 330} ${centerY - 344},
            ${centerX - 356} ${centerY - 142}
          C ${centerX - 380} ${centerY + 82},
            ${centerX - 258} ${centerY + 268},
            ${centerX - 114} ${centerY + 366}`
        : `M ${centerX + 18} ${centerY + 70}
          C ${centerX + 10} ${centerY + 198},
            ${centerX - 120} ${centerY + 286},
            ${centerX - 240} ${centerY + 400}`;
  const endDot =
    lineVariant === 0
      ? {x: centerX + width / 2 + 158, y: centerY + 170}
      : lineVariant === 1
        ? {x: centerX - 114, y: centerY + 366}
        : {x: centerX - 240, y: centerY + 400};

  return (
    <>
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0, opacity: visible}}
      >
        <path
          d={path}
          fill="none"
          stroke="rgba(15,15,15,.56)"
          strokeWidth="2"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - lineDraw}
        />
      </svg>
      <Dot x={endDot.x} y={endDot.y} size={19} opacity={lineDraw * visible} />
      <div
        style={{
          position: 'absolute',
          left: centerX,
          top: centerY,
          width,
          height: 148,
          borderRadius: 999,
          background:
            kind === 0
              ? 'radial-gradient(circle at 10% 50%,rgba(75,12,255,.36),transparent 30%), radial-gradient(circle at 92% 50%,rgba(15,219,178,.2),transparent 28%), #020202'
              : '#020202',
          border: '1px solid rgba(255,255,255,.12)',
          boxShadow: '0 5px 20px rgba(0,0,0,.14), inset 0 1px rgba(255,255,255,.08)',
          translate: '-50% -50%',
          scale: `${interpolate(enter, [0, 0.7, 1], [0.55, 1.035, 1], clamp)}`,
          opacity: visible,
          display: 'flex',
          alignItems: 'center',
          padding: '0 42px',
          gap: 24,
          overflow: 'hidden',
        }}
      >
        <PillIcon kind={kind} />
        <div
          style={{
            color: 'rgba(255,255,255,.68)',
            fontFamily: FONT,
            fontSize: 58,
            fontWeight: 300,
            letterSpacing: '-0.035em',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      </div>
    </>
  );
};

const WhitePillScene: React.FC<{frame: number}> = ({frame}) => {
  const local = frame - 870;
  const whiteIn = phase(local, 0, 18, easeOut);
  const wipeOut = phase(frame, 1290, 1352, easeInOut);
  const blueWidth = interpolate(wipeOut, [0, 1], [0, 1230], clamp);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: '#fafafa',
          opacity: whiteIn,
        }}
      >
        <SemanticPill
          frame={frame}
          label="Build structure"
          kind={0}
          centerX={540}
          centerY={890}
          start={870}
          end={1062}
          lineVariant={0}
        />
        <SemanticPill
          frame={frame}
          label="Create rhythm"
          kind={1}
          centerX={486}
          centerY={920}
          start={1018}
          end={1200}
          lineVariant={1}
        />
        <SemanticPill
          frame={frame}
          label="Shape meaning"
          kind={2}
          centerX={500}
          centerY={920}
          start={1148}
          end={1332}
          lineVariant={2}
        />
        <Footer background="white" opacity={phase(frame, 888, 920)} />
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: blueWidth,
          height: '100%',
          background:
            'linear-gradient(90deg,rgba(7,0,255,.04),#0b00ff 20%,#040037 52%,#000 88%)',
          boxShadow: '-80px 0 110px rgba(28,8,255,.72)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: interpolate(wipeOut, [0, 1], [1040, -120], clamp),
          top: 930,
          width: 430,
          height: 3,
          background: 'linear-gradient(90deg,#2a17ff,#2bedff,transparent)',
          opacity: wipeOut,
          boxShadow: '0 0 20px #3024ff',
        }}
      />
      <Dot
        x={interpolate(wipeOut, [0, 1], [1040, 310], clamp)}
        y={930}
        size={14}
        opacity={wipeOut}
      />
    </AbsoluteFill>
  );
};

const ConnectedScene: React.FC<{frame: number}> = ({frame}) => {
  const local = frame - 1330;
  const outlineDraw = phase(local, 10, 72, easeInOut);
  const connectedIn = phase(local, 50, 88, easeOut);
  const split = phase(local, 150, 220, easeInOut);
  const glowWords = phase(local, 185, 270, easeOut);
  const thoughtHold = phase(local, 255, 305, easeOut);
  const resolve = phase(local, 330, 440, easeInOut);
  const sceneOut = phase(local, 442, 472, easeIn);
  const pillPath =
    'M 245 850 C 178 850 145 888 145 950 C 145 1012 178 1050 245 1050 L 835 1050';
  const textBlur = interpolate(split, [0, 0.45, 1], [0, 2, 18], clamp);
  const textScaleX = interpolate(split, [0, 1], [1, 1.55], clamp);

  return (
    <AbsoluteFill
      style={{
        background: '#000',
        overflow: 'hidden',
        opacity: 1 - sceneOut,
      }}
    >
      <Glow
        x={interpolate(split, [0, 1], [280, 415], clamp)}
        y={950}
        width={520}
        height={120}
        color="linear-gradient(90deg,#2200ff,#163bff,#1ff0d4)"
        opacity={(0.3 + outlineDraw * 0.45) * (1 - split)}
        blur={40}
      />
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0}}
      >
        <defs>
          <linearGradient id="replica-connected-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3213ff" />
            <stop offset=".65" stopColor="#221dff" />
            <stop offset="1" stopColor="#29f0d3" />
          </linearGradient>
          <filter id="replica-connected-glow" x="-50%" y="-200%" width="200%" height="500%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={pillPath}
          fill="none"
          stroke="url(#replica-connected-line)"
          strokeWidth="5"
          strokeLinecap="round"
          filter="url(#replica-connected-glow)"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - outlineDraw}
          opacity={1 - split}
        />
        {[0, 1, 2, 3, 4].map((index) => {
          const y = 865 + index * 38;
          const bar = phase(local, 145 + index * 7, 190 + index * 7, easeInOut);
          return (
            <path
              key={index}
              d={`M ${290 - index * 8} ${y} C 470 ${y - 22}, 650 ${y + 20}, 824 ${y - 2}`}
              fill="none"
              stroke={index % 2 ? '#2110ff' : 'rgba(65,40,255,.72)'}
              strokeWidth={index === 2 ? 7 : 4}
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - bar}
              opacity={split * (1 - glowWords)}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 902,
          width: '100%',
          textAlign: 'center',
          color: '#e9e9e9',
          fontFamily: FONT,
          fontSize: 64,
          fontWeight: 300,
          letterSpacing: '-0.035em',
          opacity: connectedIn * (1 - split),
          scale: `${textScaleX} 1`,
          filter: `blur(${textBlur}px)`,
        }}
      >
        Connected
      </div>

      <Glow
        x={interpolate(resolve, [0, 1], [420, 470], clamp)}
        y={interpolate(resolve, [0, 1], [930, 910], clamp)}
        width={interpolate(resolve, [0, 1], [330, 260], clamp)}
        height={interpolate(resolve, [0, 1], [160, 240], clamp)}
        color="#3c0cff"
        opacity={0.64 * glowWords}
        blur={55}
        rotate={-18}
      />
      <Glow
        x={interpolate(resolve, [0, 1], [650, 610], clamp)}
        y={interpolate(resolve, [0, 1], [970, 910], clamp)}
        width={interpolate(resolve, [0, 1], [360, 230], clamp)}
        height={interpolate(resolve, [0, 1], [200, 270], clamp)}
        color="#0a9dff"
        opacity={0.72 * glowWords}
        blur={52}
        rotate={22}
      />
      <Glow
        x={interpolate(resolve, [0, 1], [585, 570], clamp)}
        y={interpolate(resolve, [0, 1], [1015, 900], clamp)}
        width={interpolate(resolve, [0, 1], [270, 190], clamp)}
        height={interpolate(resolve, [0, 1], [125, 220], clamp)}
        color="#ff1fc7"
        opacity={0.6 * glowWords}
        blur={48}
        rotate={8}
      />
      <div
        style={{
          position: 'absolute',
          top: 892,
          width: '100%',
          textAlign: 'center',
          color: '#f6f6f6',
          fontFamily: FONT,
          fontSize: 56,
          fontWeight: 330,
          letterSpacing: '-0.04em',
          opacity:
            phase(local, 205, 244, easeOut) *
            interpolate(resolve, [0, 0.72, 1], [1, 0.5, 0], clamp),
          filter: `blur(${interpolate(glowWords, [0, 0.35, 1], [7, 0, 0], clamp)}px)`,
        }}
      >
        Thought in{' '}
        <span
          style={{
            fontWeight: 430,
            opacity: phase(local, 298, 330, easeOut),
          }}
        >
          motion
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 930,
          width: 210,
          height: 210,
          translate: '-50% -50%',
          opacity: interpolate(resolve, [0, 0.55, 1], [0, 0.45, 1], clamp),
          scale: `${interpolate(resolve, [0, 0.72, 1], [0.35, 1.18, 1], clamp)}`,
          filter: `blur(${interpolate(resolve, [0, 0.65, 1], [16, 5, 0], clamp)}px)`,
        }}
      >
        <YouMotionMark color="rgba(111,250,255,.82)" />
      </div>
      <Footer background="black" opacity={phase(local, 8, 35)} />
      <div style={{opacity: thoughtHold * 0}} />
    </AbsoluteFill>
  );
};

const YouMotionMark: React.FC<{color?: string}> = ({color = '#fff'}) => (
  <svg width="100%" height="100%" viewBox="0 0 160 120">
    <path
      d="M20 26 C20 18 29 16 35 23 L61 51 C69 60 77 64 80 64 C83 64 91 60 99 51 L125 23 C131 16 140 18 140 26 L140 88 C140 96 134 101 126 101 L34 101 C26 101 20 96 20 88 Z"
      fill={color}
    />
  </svg>
);

const BrandScene: React.FC<{frame: number}> = ({frame}) => {
  const local = frame - 1764;
  const enter = phase(local, 0, 36, easeOut);
  const settle = phase(local, 30, 70, easeInOut);
  return (
    <AbsoluteFill
      style={{
        background: '#000',
        overflow: 'hidden',
        opacity: enter,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 925,
          width: 150,
          height: 112,
          translate: '-50% -50%',
          scale: `${interpolate(settle, [0, 1], [1.12, 1], clamp)}`,
          filter: `blur(${interpolate(enter, [0, 1], [7, 0], clamp)}px)`,
        }}
      >
        <YouMotionMark />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1012,
          width: '100%',
          textAlign: 'center',
          color: 'rgba(255,255,255,.82)',
          fontFamily: FONT,
          fontSize: 29,
          fontWeight: 300,
          letterSpacing: '-0.02em',
          opacity: phase(local, 24, 54, easeOut),
        }}
      >
        youmotion.com
      </div>
      <Footer background="black" opacity={1} />
    </AbsoluteFill>
  );
};

export type UiAeNeonPathReplicaProps = {
  includeReferenceAudio?: boolean;
};

/**
 * High-fidelity, code-driven reconstruction of:
 * 01e9fca4e82b51df010370019e02e5be8b_115.mp4
 *
 * The source MP4 remains a read-only visual reference. All visible layers here
 * are rebuilt as editable React/SVG/CSS components on the original 60fps
 * timeline.
 */
export const UiAeNeonPathReplica: React.FC<UiAeNeonPathReplicaProps> = ({
  includeReferenceAudio = true,
}) => {
  const frame = useCurrentFrame();
  const seamFlash = phase(frame, 865, 880, easeOut) * (1 - phase(frame, 890, 905, easeIn));

  return (
    <AbsoluteFill
      style={{
        background: interpolateColors(frame, [0, 870, 1328], ['#000', '#000', '#000']),
        fontFamily: FONT,
        overflow: 'hidden',
      }}
    >
      {frame < 520 ? <DiscoveryScene frame={frame} /> : null}
      {frame >= 492 && frame < 900 ? <FocusScene frame={frame} /> : null}
      {frame >= 865 && frame < 1360 ? <WhitePillScene frame={frame} /> : null}
      {frame >= 1322 && frame < 1810 ? <ConnectedScene frame={frame} /> : null}
      {frame >= 1775 ? <BrandScene frame={frame} /> : null}
      <AbsoluteFill
        style={{
          background: '#fff',
          opacity: seamFlash,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
      {includeReferenceAudio ? (
        <Audio src={staticFile('audio/ui-ae-neon-reference.m4a')} volume={1} />
      ) : null}
    </AbsoluteFill>
  );
};
