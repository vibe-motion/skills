import React from 'react';
import {glow} from '@remotion/effects/glow';
import {lightTrail} from '@remotion/effects/light-trail';
import {noiseDisplacement} from '@remotion/effects/noise-displacement';
import {wave} from '@remotion/effects/wave';
import {Audio} from '@remotion/media';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {
  AbsoluteFill,
  Easing,
  HtmlInCanvas,
  interpolate,
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
const snapOut = Easing.bezier(0.22, 1, 0.36, 1);
const elastic = Easing.bezier(0.34, 1.42, 0.64, 1);
const FONT =
  '"Arial Nova", "Helvetica Neue", Helvetica, Arial, "SF Pro Display", sans-serif';

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

const Footer: React.FC<{dark: boolean; opacity?: number}> = ({
  dark,
  opacity = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      top: 1660,
      width: '100%',
      textAlign: 'center',
      color: dark ? '#121212' : '#f4f4f4',
      fontFamily: FONT,
      fontSize: 39,
      fontWeight: 330,
      letterSpacing: '-0.035em',
      opacity,
    }}
  >
    Project File In Description
  </div>
);

const Dot: React.FC<{
  x: number;
  y: number;
  size?: number;
  opacity?: number;
  glowColor?: string;
  blur?: number;
}> = ({
  x,
  y,
  size = 18,
  opacity = 1,
  glowColor = 'transparent',
  blur = 0,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      translate: '-50% -50%',
      borderRadius: '50%',
      background: '#fff',
      opacity,
      filter: blur > 0 ? `blur(${blur}px)` : undefined,
      boxShadow:
        glowColor === 'transparent'
          ? undefined
          : `0 0 ${size * 0.55}px #fff, 0 0 ${size * 2.2}px ${size * 0.6}px ${glowColor}`,
    }}
  />
);

const EnergyDisc: React.FC<{
  x: number;
  y: number;
  width: number;
  opacity: number;
  color?: string;
}> = ({x, y, width, opacity, color = '#13e8ff'}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height: width * 0.105,
        translate: '-50% -50%',
        borderRadius: '50%',
        background: `radial-gradient(ellipse at center,#e9ffff 0%,${color} 18%,#1720ff 42%,rgba(17,20,255,0) 76%)`,
        opacity,
        filter: `blur(${Math.max(2, width * 0.015)}px)`,
        mixBlendMode: 'screen',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + width * 0.08,
        width: width * 0.78,
        height: width * 0.26,
        translate: '-50% -50%',
        borderRadius: '50%',
        background: `radial-gradient(ellipse at center,${color} 0%,#1717ff 32%,transparent 72%)`,
        opacity: opacity * 0.64,
        filter: `blur(${width * 0.09}px)`,
        mixBlendMode: 'screen',
      }}
    />
  </>
);

const FourPointMark: React.FC<{
  size: number;
  opacity?: number;
  rotate?: number;
  fill?: boolean;
  transparentFill?: boolean;
}> = ({
  size,
  opacity = 1,
  rotate = 0,
  fill = false,
  transparentFill = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{
      opacity,
      overflow: 'visible',
      rotate: `${rotate}deg`,
      filter:
        'drop-shadow(0 0 6px #2421ff) drop-shadow(0 0 12px rgba(29,235,255,.78))',
    }}
  >
    <defs>
      <linearGradient id="v3-star-gradient" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#1a00ff" />
        <stop offset=".48" stopColor="#7431ff" />
        <stop offset="1" stopColor="#2df1d2" />
      </linearGradient>
    </defs>
    <path
      d="M50 3 C54 35 65 46 97 50 C65 54 54 65 50 97 C46 65 35 54 3 50 C35 46 46 35 50 3Z"
      fill={
        transparentFill
          ? 'rgba(3,3,5,.12)'
          : fill
            ? 'rgba(250,250,255,.95)'
            : '#030305'
      }
      stroke="url(#v3-star-gradient)"
      strokeWidth={fill ? 2.2 : 3}
    />
    <path
      d="M50 19 C53 39 61 47 81 50 C61 53 53 61 50 81 C47 61 39 53 19 50 C39 47 47 39 50 19Z"
      fill="rgba(91,63,255,.12)"
      stroke="rgba(126,91,255,.52)"
      strokeWidth="1.3"
    />
  </svg>
);

const openingPath =
  'M 540 1920 C 445 1818 448 1736 540 1654 C 664 1544 670 1470 540 1355 C 402 1232 416 1090 540 970';

const OpeningPathScene: React.FC<{frame: number}> = ({frame}) => {
  const draw = progress(frame, 6, 82, easeInOut);
  const fade = 1 - progress(frame, 90, 120, easeIn);
  const text = progress(frame, 16, 35) * (1 - progress(frame, 76, 98, easeIn));
  const discOne = progress(frame, 9, 34);
  const discTwo = progress(frame, 28, 58);
  const discThree = progress(frame, 48, 84);

  return (
    <AbsoluteFill style={{opacity: fade}}>
      <div
        style={{
          position: 'absolute',
          left: -180,
          top: 720,
          width: 1440,
          height: 1320,
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse at 50% 68%,#1af4da 0%,#12cddf 17%,#2031ff 42%,rgba(18,11,255,.1) 72%,transparent 82%)',
          opacity:
            progress(frame, 90, 105, easeIn) *
            (1 - progress(frame, 106, 120, easeOut)),
          filter: `blur(${interpolate(frame, [90, 105, 120], [46, 10, 68], clamp)}px)`,
          scale: `${interpolate(frame, [90, 105, 120], [0.62, 1.22, 1.46], clamp)}`,
          mixBlendMode: 'screen',
        }}
      />
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0}}
      >
        <path
          d={openingPath}
          fill="none"
          stroke="rgba(255,255,255,.7)"
          strokeWidth="1.8"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - draw}
        />
        <path
          d="M 540 1920 L 540 970"
          fill="none"
          stroke="rgba(255,255,255,.7)"
          strokeWidth="1.7"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - progress(frame, 18, 65, easeInOut)}
        />
        <path
          d="M 540 1355 C 716 1456 702 1544 540 1654 C 420 1736 420 1840 540 1920"
          fill="none"
          stroke="rgba(255,255,255,.56)"
          strokeWidth="1.6"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - progress(frame, 38, 72, easeInOut)}
        />
      </svg>
      <EnergyDisc
        x={interpolate(discOne, [0, 1], [440, 540], clamp)}
        y={interpolate(discOne, [0, 1], [1260, 970], clamp)}
        width={interpolate(discOne, [0, 1], [120, 270], clamp)}
        opacity={discOne * (1 - progress(frame, 78, 104, easeIn))}
      />
      <EnergyDisc
        x={interpolate(discTwo, [0, 1], [500, 540], clamp)}
        y={interpolate(discTwo, [0, 1], [1600, 1290], clamp)}
        width={interpolate(discTwo, [0, 1], [180, 720], clamp)}
        opacity={discTwo * (1 - progress(frame, 86, 112, easeIn))}
      />
      <EnergyDisc
        x={interpolate(discThree, [0, 1], [540, 540], clamp)}
        y={interpolate(discThree, [0, 1], [2050, 1718], clamp)}
        width={interpolate(discThree, [0, 1], [240, 1040], clamp)}
        opacity={discThree * (1 - progress(frame, 92, 118, easeIn))}
      />
      <Dot
        x={interpolate(discOne, [0, 1], [440, 540], clamp)}
        y={interpolate(discOne, [0, 1], [1260, 970], clamp)}
        size={27}
        opacity={discOne}
      />
      <Dot
        x={interpolate(discTwo, [0, 1], [500, 540], clamp)}
        y={interpolate(discTwo, [0, 1], [1600, 1355], clamp)}
        size={25}
        opacity={discTwo}
      />
      <Dot
        x={540}
        y={interpolate(discThree, [0, 1], [2050, 1805], clamp)}
        size={27}
        opacity={discThree}
      />
      <div
        style={{
          position: 'absolute',
          top: 605,
          width: '100%',
          color: '#eee',
          textAlign: 'center',
          fontFamily: FONT,
          fontSize: 70,
          fontWeight: 330,
          letterSpacing: '-0.042em',
          opacity: text,
          scale: `${interpolate(text, [0, 1], [0.9, 1], clamp)} 1`,
        }}
      >
        Let&apos;s begin
      </div>
    </AbsoluteFill>
  );
};

const wrapAngle = (angle: number) => {
  const twoPi = Math.PI * 2;
  return ((angle % twoPi) + twoPi) % twoPi;
};

const starPolygonRadius = (
  theta: number,
  outerRadius: number,
  innerRatio: number,
  rotation: number,
) => {
  const sector = Math.PI / 4;
  const local = wrapAngle(theta - rotation);
  const index = Math.floor(local / sector);
  const a = index * sector;
  const b = a + sector;
  const radiusA = index % 2 === 0 ? outerRadius : outerRadius * innerRatio;
  const radiusB = index % 2 === 0 ? outerRadius * innerRatio : outerRadius;
  const denominator =
    radiusB * Math.sin(b - local) + radiusA * Math.sin(local - a);
  return (
    (radiusA * radiusB * Math.sin(sector)) /
    Math.max(0.0001, denominator)
  );
};

const ringRadiusAt = (
  theta: number,
  radius: number,
  polygonBlend: number,
  innerRatio: number,
  rotationDeg: number,
) => {
  const rotation = (rotationDeg * Math.PI) / 180;
  const fourPointWave =
    (1 - Math.cos((theta - rotation) * 4)) * 0.5;
  const sculpted =
    radius *
    (1 - polygonBlend * (1 - innerRatio) * fourPointWave);
  const organic = 1 - 0.008 * Math.sin(theta * 3 + rotation * 0.7);
  return sculpted * organic;
};

const ringPath = (
  cx: number,
  cy: number,
  radius: number,
  polygonBlend: number,
  innerRatio: number,
  rotationDeg: number,
  points = 96,
) => {
  const rows: string[] = [];
  for (let index = 0; index <= points; index++) {
    const theta = (index / points) * Math.PI * 2;
    const shapedRadius = ringRadiusAt(
      theta,
      radius,
      polygonBlend,
      innerRatio,
      rotationDeg,
    );
    const x = cx + Math.cos(theta) * shapedRadius;
    const y = cy + Math.sin(theta) * shapedRadius;
    rows.push(`${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  rows.push('Z');
  return rows.join(' ');
};

const WebGlMorphScene: React.FC<{frame: number}> = ({frame}) => {
  const appear = progress(frame, 140, 170, snapOut);
  const circle = progress(frame, 165, 210, easeInOut);
  const diamond = progress(frame, 220, 246, easeInOut);
  const concave = progress(frame, 238, 270, easeInOut);
  const collapse = progress(frame, 266, 304, easeInOut);
  const stageOpacity = windowOpacity(frame, 132, 145, 292, 312);
  const radius = interpolate(
    frame,
    [140, 170, 210, 245, 270, 304],
    [185, 350, 395, 385, 330, 46],
    clamp,
  );
  const polygonBlend = interpolate(
    frame,
    [140, 218, 232, 246, 304],
    [0, 0.02, 0.42, 1, 1],
    clamp,
  );
  const innerRatio = interpolate(
    frame,
    [140, 218, 236, 252, 276, 304],
    [0.98, 0.96, 0.72, 0.56, 0.34, 0.42],
    clamp,
  );
  const rotation = interpolate(
    frame,
    [140, 220, 260, 286, 304],
    [-8, 0, 0, 128, 180],
    clamp,
  );
  const centerY = interpolate(frame, [140, 220, 275, 304], [945, 958, 938, 886], clamp);
  const lineWidth = interpolate(collapse, [0, 1], [22, 4], clamp);
  const distortion =
    interpolate(concave, [0, 0.55, 1], [5, 34, 11], clamp) *
    interpolate(collapse, [0, 0.76, 1], [1, 1.4, 0.2], clamp);
  const trail = interpolate(
    frame,
    [140, 180, 220, 252, 286, 304],
    [12, 28, 12, 54, 82, 8],
    clamp,
  );
  const labelOpacity =
    progress(frame, 156, 182, easeOut) * (1 - progress(frame, 265, 292, easeIn));
  const dotOpacity = appear * (1 - progress(frame, 254, 282, easeIn));
  const path = ringPath(
    540,
    centerY,
    radius,
    polygonBlend,
    innerRatio,
    rotation,
  );

  return (
    <AbsoluteFill style={{opacity: stageOpacity}}>
      <HtmlInCanvas
        width={1080}
        height={1920}
        pixelDensity={1}
        effects={[
          wave({
            amplitude: interpolate(diamond, [0, 0.55, 1], [1, 12, 3], clamp),
            wavelength: 330,
            phase: frame * 0.085,
            direction: 'vertical',
          }),
          noiseDisplacement({
            center: [0.5, centerY / 1920],
            radius: 0.44,
            strength: distortion,
            grainSize: 26,
            seed: 41,
            passes: 7,
            blur: 2.4,
            feather: 0.42,
            biasDirection: rotation,
            biasAmount: 0.22,
          }),
          lightTrail({
            direction: 180 + rotation,
            distance: trail,
            intensity: 0.84,
            decay: 0.87,
            threshold: 0.04,
            samples: 22,
            color: '#1ff5d4',
          }),
          glow({
            radius: interpolate(circle, [0, 1], [12, 26], clamp),
            intensity: 1.25,
            threshold: 0.02,
            color: '#2632ff',
          }),
        ]}
      >
        <AbsoluteFill>
          <svg width={1080} height={1920} viewBox="0 0 1080 1920">
            <defs>
              <linearGradient id="v3-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#1c10ff" />
                <stop offset=".18" stopColor="#30efd4" />
                <stop offset=".38" stopColor="#1017ff" />
                <stop offset=".58" stopColor="#3420ff" />
                <stop offset=".78" stopColor="#1119ff" />
                <stop offset="1" stopColor="#32f1c9" />
              </linearGradient>
              <filter id="v3-ring-soft-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={path}
              fill="none"
              stroke="url(#v3-ring-gradient)"
              strokeWidth={lineWidth + 4}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#v3-ring-soft-glow)"
              pathLength="1"
              strokeDasharray={circle < 0.55 ? '0.16 0.075 0.13 0.09 0.2 0.07' : '1'}
              strokeDashoffset={interpolate(frame, [140, 220], [1, -0.25], clamp)}
            />
            <path
              d={path}
              fill="none"
              stroke="rgba(255,255,255,.38)"
              strokeWidth={interpolate(collapse, [0, 1], [1.4, 0.7], clamp)}
              opacity={0.75}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              top: centerY - 38,
              width: '100%',
              textAlign: 'center',
              color: '#eee',
              fontFamily: FONT,
              fontSize: 58,
              fontWeight: 330,
              letterSpacing: '-0.04em',
              opacity: labelOpacity,
              filter: `blur(${interpolate(frame, [156, 178, 270, 294], [12, 0, 0, 14], clamp)}px)`,
            }}
          >
            With a system
          </div>
        </AbsoluteFill>
      </HtmlInCanvas>
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
      >
        <defs>
          <linearGradient id="v3-ring-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#29f0d7" />
            <stop offset=".36" stopColor="#2518ff" />
            <stop offset=".68" stopColor="#281aff" />
            <stop offset="1" stopColor="#2cf0d5" />
          </linearGradient>
        </defs>
        <path
          d={path}
          fill="none"
          stroke="url(#v3-ring-edge)"
          strokeWidth={2.4}
          strokeLinecap="round"
          opacity={0.88 * stageOpacity}
        />
      </svg>
      {[0, 1, 2, 3].map((index) => {
        const theta =
          -Math.PI / 2 +
          index * (Math.PI / 2) +
          (rotation * Math.PI) / 180;
        const dotRadius = ringRadiusAt(
          theta,
          radius,
          polygonBlend,
          innerRatio,
          rotation,
        );
        return (
          <Dot
            key={index}
            x={540 + Math.cos(theta) * dotRadius}
            y={centerY + Math.sin(theta) * dotRadius}
            size={interpolate(frame, [140, 220, 260, 292], [22, 28, 42, 28], clamp)}
            opacity={dotOpacity}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const FormScene: React.FC<{frame: number}> = ({frame}) => {
  const enter = progress(frame, 296, 326, elastic);
  const pulse = progress(frame, 318, 350, easeInOut);
  const morph = progress(frame, 382, 438, elastic);
  const details = progress(frame, 464, 500, easeOut);
  const starY = interpolate(frame, [296, 326, 360, 405, 445], [886, 702, 730, 940, 944], clamp);
  const starSize = interpolate(morph, [0, 0.4, 1], [150, 72, 92], clamp);
  const pillWidth = interpolate(
    frame,
    [382, 398, 410, 435, 450, 468, 505],
    [78, 168, 820, 1260, 1500, 980, 790],
    clamp,
  );
  const pillHeight = interpolate(
    frame,
    [382, 400, 410, 435, 450, 468, 505],
    [78, 106, 202, 270, 330, 250, 210],
    clamp,
  );
  const delayedExit = progress(frame, 510, 552, easeInOut);
  const pillX = interpolate(delayedExit, [0, 1], [540, 1110], clamp);
  const iconDock = progress(frame, 448, 492, easeInOut);
  const innerIconX = interpolate(
    iconDock,
    [0, 1],
    [pillWidth / 2 - 48, 76],
    clamp,
  );
  const opacity = windowOpacity(frame, 292, 305, 548, 584);

  return (
    <AbsoluteFill style={{opacity}}>
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: starY,
          width: starSize,
          height: starSize,
          translate: '-50% -50%',
          opacity: enter * (1 - morph * 0.8),
          rotate: `${interpolate(frame, [296, 350, 410], [170, 354, 420], clamp)}deg`,
          scale: `${interpolate(pulse, [0, 0.45, 1], [0.78, 1.12, 1], clamp)}`,
        }}
      >
        <FourPointMark size={starSize} fill={pulse > 0.42 && pulse < 0.7} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 905,
          width: '100%',
          color: '#eee',
          textAlign: 'center',
          fontFamily: FONT,
          fontSize: 50,
          fontWeight: 330,
          letterSpacing: '-0.04em',
          opacity:
            progress(frame, 322, 348, easeOut) * (1 - progress(frame, 386, 421, easeIn)),
        }}
      >
        Finding form
      </div>
      <div
        style={{
          position: 'absolute',
          left: pillX,
          top: 946,
          width: pillWidth,
          height: pillHeight,
          translate: '-50% -50%',
          borderRadius: interpolate(morph, [0, 0.42, 1], [999, 82, 46], clamp),
          background:
            'linear-gradient(104deg,#f4f1ff 0%,#d7d4ff 17%,#4c36fc 46%,#08f1e4 100%)',
          backgroundPosition: `${interpolate(
            frame,
            [405, 450, 486],
            [0, 58, 100],
            clamp,
          )}% 50%`,
          backgroundSize: '240% 100%',
          boxShadow:
            '0 0 28px rgba(55,51,255,.42), 0 0 46px rgba(23,239,223,.26)',
          overflow: 'hidden',
          opacity: morph * (1 - delayedExit * 0.82),
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 18% 48%,rgba(255,255,255,.76),transparent 28%), radial-gradient(circle at 88% 50%,rgba(89,255,235,.76),transparent 35%)',
            opacity: interpolate(frame, [392, 432, 470], [0.95, 0.22, 0.55], clamp),
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#fff',
            opacity: 1 - progress(frame, 420, 448, easeInOut),
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: innerIconX,
            top: '50%',
            translate: '0 -50%',
            width: 96,
            height: 96,
            opacity: progress(frame, 397, 432),
          }}
        >
          <FourPointMark size={96} transparentFill />
        </div>
        <div
          style={{
            position: 'absolute',
            left: innerIconX + 122,
            top: '50%',
            translate: '0 -50%',
            opacity: details,
            fontFamily: FONT,
            color: '#f8f8fc',
          }}
        >
          <div style={{fontSize: 57, fontWeight: 330, letterSpacing: '-0.04em'}}>Form</div>
          <div
            style={{
              marginTop: 2,
              fontSize: 35,
              fontWeight: 300,
              letterSpacing: '-0.025em',
              color: 'rgba(248,248,252,.62)',
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
  const local = frame - 520;
  const sceneOpacity = windowOpacity(frame, 515, 528, 850, 878);
  const arcTravel = progress(local, 50, 142, easeInOut);
  const stemDraw = progress(local, 145, 245, easeInOut);
  const diagonal = progress(local, 246, 306, easeInOut);
  const collapse = progress(local, 306, 344, easeInOut);
  const xs = [140, 340, 540, 740, 940];
  const diagonalYs = [1520, 1385, 1250, 1115, 980];
  const arcCenterX = interpolate(arcTravel, [0, 1], [900, 190], clamp);
  const arcRadius = interpolate(arcTravel, [0, 1], [190, 72], clamp);
  const arcCenterY = interpolate(arcTravel, [0, 1], [900, 920], clamp);
  const arcPath = `M ${arcCenterX - arcRadius} ${arcCenterY}
    C ${arcCenterX - arcRadius * 0.72} ${arcCenterY - arcRadius * 1.15},
      ${arcCenterX + arcRadius * 0.72} ${arcCenterY - arcRadius * 1.15},
      ${arcCenterX + arcRadius} ${arcCenterY}`;

  return (
    <AbsoluteFill style={{opacity: sceneOpacity}}>
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0}}
      >
        <defs>
          <linearGradient id="v3-focus-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1a0fff" />
            <stop offset=".5" stopColor="#943cff" />
            <stop offset="1" stopColor="#2bedcf" />
          </linearGradient>
          <filter id="v3-focus-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={arcPath}
          fill="none"
          stroke="url(#v3-focus-gradient)"
          strokeWidth={interpolate(arcTravel, [0, 1], [16, 9], clamp)}
          strokeLinecap="round"
          filter="url(#v3-focus-glow)"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - progress(local, 42, 78, easeInOut)}
          opacity={(1 - progress(local, 142, 157, easeIn)) * (1 - diagonal)}
        />
        {xs.map((x, index) => {
          const dotEnter = progress(local, 73 + (4 - index) * 13, 89 + (4 - index) * 13);
          const y = interpolate(diagonal, [0, 1], [930, diagonalYs[index]], clamp);
          const stemBottom = interpolate(stemDraw, [0, 1], [930, 1222], clamp);
          const gatherX = interpolate(collapse, [0, 1], [x, 900], clamp);
          const gatherY = interpolate(collapse, [0, 1], [y, 825], clamp);
          return (
            <React.Fragment key={x}>
              <path
                d={`M ${gatherX} ${gatherY + 8} L ${gatherX} ${interpolate(
                  diagonal,
                  [0, 1],
                  [stemBottom, diagonalYs[index] + 270],
                  clamp,
                )}`}
                fill="none"
                stroke="rgba(255,255,255,.48)"
                strokeWidth="1.8"
                opacity={dotEnter * stemDraw * (1 - collapse)}
              />
            </React.Fragment>
          );
        })}
      </svg>
      {xs.map((x, index) => {
        const dotEnter = progress(local, 73 + (4 - index) * 13, 89 + (4 - index) * 13);
        const y = interpolate(diagonal, [0, 1], [930, diagonalYs[index]], clamp);
        const gatherX = interpolate(collapse, [0, 1], [x, 900], clamp);
        const gatherY = interpolate(collapse, [0, 1], [y, 825], clamp);
        const leader = index === 4;
        return (
          <Dot
            key={x}
            x={gatherX}
            y={gatherY}
            size={interpolate(collapse, [0, 1], [leader ? 30 : 25, leader ? 44 : 0], clamp)}
            opacity={
              dotEnter *
              interpolate(collapse, [0, 0.72, 1], [1, leader ? 1 : 0, leader ? 1 : 0], clamp)
            }
            glowColor={leader ? '#2935ff' : index % 2 ? '#21efd2' : '#4c24ff'}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          top: 1128,
          width: '100%',
          textAlign: 'center',
          color: '#eee',
          fontFamily: FONT,
          fontSize: 57,
          fontWeight: 330,
          letterSpacing: '-0.03em',
          opacity:
            progress(local, 74, 100) *
            (1 - progress(local, 285, 318, easeIn)) *
            (1 - collapse),
        }}
      >
        Focus organizes motion
      </div>
    </AbsoluteFill>
  );
};

type PillSpec = {
  label: string;
  start: number;
  center: number;
  exit: number;
  entryX: number;
  centerX: number;
  exitX: number;
  entryY: number;
  centerY: number;
  icon: 'star' | 'bar';
};

const MovingPill: React.FC<{frame: number; spec: PillSpec}> = ({frame, spec}) => {
  const enter = progress(frame, spec.start, spec.center, elastic);
  const enterY = progress(frame, spec.start, spec.center, easeInOut);
  const leave = progress(frame, spec.center + 34, spec.exit, easeInOut);
  const x =
    frame <= spec.center
      ? interpolate(enter, [0, 1], [spec.entryX, spec.centerX], clamp)
      : interpolate(leave, [0, 1], [spec.centerX, spec.exitX], clamp);
  const y = interpolate(enterY, [0, 1], [spec.entryY, spec.centerY], clamp);
  const width = spec.label === 'Create rhythm' ? 790 : 760;
  const opacity =
    enter * interpolate(frame, [spec.exit - 16, spec.exit], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height: 176,
        translate: '-50% -50%',
        borderRadius: 999,
        background:
          'radial-gradient(circle at 12% 50%,rgba(28,17,255,.35),transparent 28%), radial-gradient(circle at 88% 50%,rgba(27,238,215,.15),transparent 30%), #030303',
        border: '1px solid rgba(255,255,255,.14)',
        boxShadow:
          '0 6px 18px rgba(0,0,0,.16), inset 0 1px rgba(255,255,255,.08)',
        opacity,
        scale: `${interpolate(
          enter,
          [0, 0.68, 1],
          spec.label === 'Build structure' ? [0.3, 1.055, 1] : [0.88, 1.025, 1],
          clamp,
        )} ${interpolate(
          enter,
          [0, 0.5, 1],
          spec.label === 'Build structure' ? [0.55, 0.88, 1] : [0.94, 1.01, 1],
          clamp,
        )}`,
        filter: `blur(${interpolate(
          enter,
          [0, 0.45, 1],
          spec.label === 'Build structure' ? [18, 3, 0] : [5, 1, 0],
          clamp,
        )}px)`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 42px',
        gap: 26,
        overflow: 'hidden',
      }}
    >
      <div style={{width: 66, height: 66, display: 'grid', placeItems: 'center'}}>
        {spec.icon === 'bar' ? (
          <div
            style={{
              width: 7,
              height: 58,
              borderRadius: 8,
              background: 'linear-gradient(#2ff0db,#241bff,#9c3aff)',
              boxShadow: '0 0 15px #3126ff',
            }}
          />
        ) : (
          <FourPointMark size={62} />
        )}
      </div>
      <div
        style={{
          color: 'rgba(255,255,255,.7)',
          fontFamily: FONT,
          fontSize: 64,
          fontWeight: 300,
          letterSpacing: '-0.04em',
          whiteSpace: 'nowrap',
        }}
      >
        {spec.label}
      </div>
    </div>
  );
};

const WhiteJourneyScene: React.FC<{frame: number}> = ({frame}) => {
  const whiteIn = progress(frame, 868, 875, easeOut);
  const wipe = progress(frame, 1330, 1353, easeInOut);
  const specs: PillSpec[] = [
    {
      label: 'Build structure',
      start: 885,
      center: 930,
      exit: 1068,
      entryX: 540,
      centerX: 540,
      exitX: -420,
      entryY: 965,
      centerY: 965,
      icon: 'star',
    },
    {
      label: 'Create rhythm',
      start: 1036,
      center: 1100,
      exit: 1224,
      entryX: 1240,
      centerX: 540,
      exitX: -440,
      entryY: 990,
      centerY: 990,
      icon: 'bar',
    },
    {
      label: 'Shape meaning',
      start: 1195,
      center: 1280,
      exit: 1342,
      entryX: 1240,
      centerX: 540,
      exitX: 520,
      entryY: 360,
      centerY: 952,
      icon: 'star',
    },
  ];
  const pathShift = interpolate(frame, [900, 1060, 1160, 1295], [0, -310, 250, -40], clamp);
  const dotX = interpolate(
    frame,
    [890, 960, 1025, 1095, 1175, 1245, 1310],
    [760, 1000, 535, 742, 320, 914, 780],
    clamp,
  );
  const dotY = interpolate(
    frame,
    [890, 960, 1025, 1095, 1175, 1245, 1310],
    [1640, 1470, 1160, 610, 820, 1310, 1050],
    clamp,
  );

  return (
    <AbsoluteFill style={{background: '#fbfbfb', opacity: whiteIn, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: -120,
          background:
            'radial-gradient(ellipse at 50% -2%,rgba(109,37,255,.78),transparent 22%), radial-gradient(ellipse at 12% 98%,rgba(9,243,225,.9),transparent 24%), radial-gradient(ellipse at 98% 96%,rgba(40,24,255,.58),transparent 26%)',
          opacity:
            progress(frame, 868, 875) * (1 - progress(frame, 892, 920, easeIn)),
          filter: 'blur(24px)',
        }}
      />
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0}}
      >
        <path
          d={`M ${760 + pathShift} 1910
            C ${680 + pathShift} 1650, ${1030 + pathShift} 1560, ${dotX} ${dotY}
            C ${dotX - 120} ${dotY - 250}, ${dotX + 190} ${dotY - 380}, ${
              dotX + 95
            } ${dotY - 560}`}
          fill="none"
          stroke="rgba(10,10,10,.55)"
          strokeWidth="1.8"
          opacity={1 - wipe}
        />
      </svg>
      <Dot x={dotX} y={dotY} size={18} opacity={1 - wipe} glowColor="transparent" />
      {specs.map((spec) => (
        <MovingPill key={spec.label} frame={frame} spec={spec} />
      ))}
      <Footer dark opacity={progress(frame, 884, 912) * (1 - wipe)} />
      <div
        style={{
          position: 'absolute',
          inset: -120,
          background:
            'linear-gradient(108deg,#fff 0%,#fff 25%,#11eee5 42%,#1300ff 61%,#000 80%)',
          translate: `${interpolate(wipe, [0, 1], [1150, -120], clamp)}px 0`,
          rotate: '-5deg',
          filter: 'blur(20px)',
          opacity: wipe,
        }}
      />
    </AbsoluteFill>
  );
};

const ThoughtLights: React.FC<{
  frame: number;
  opacity: number;
  resolve: number;
}> = ({frame, opacity, resolve}) => {
  const pulse = Math.sin(frame * 0.12) * (1 - resolve);
  const lights = [
    {x: 420, y: 980, color: '#4310ff', delay: 0, size: 360},
    {x: 655, y: 1010, color: '#06c7ff', delay: 9, size: 330},
    {x: 560, y: 1100, color: '#ff1dce', delay: 18, size: 290},
  ];
  const resolved = [
    {x: 480, y: 920},
    {x: 610, y: 980},
    {x: 540, y: 1050},
  ];
  return (
    <>
      {lights.map((light, index) => {
        const x = interpolate(
          resolve,
          [0, 1],
          [
            light.x + Math.sin((frame + light.delay) * 0.045) * 65,
            resolved[index].x,
          ],
          clamp,
        );
        const y = interpolate(
          resolve,
          [0, 1],
          [
            light.y + Math.cos((frame + light.delay) * 0.054) * 48,
            resolved[index].y,
          ],
          clamp,
        );
        return (
          <div
            key={light.color}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: interpolate(resolve, [0, 1], [light.size + pulse * 12, 180], clamp),
              height: interpolate(resolve, [0, 1], [light.size * 0.64 - pulse * 8, 165], clamp),
              translate: '-50% -50%',
              borderRadius: '50%',
              background: light.color,
              filter: `blur(${interpolate(resolve, [0, 1], [46, 22], clamp)}px)`,
              opacity: opacity * (index === 2 ? 0.74 : 0.82),
              mixBlendMode: 'screen',
              rotate: `${index * 32 - 20}deg`,
            }}
          />
        );
      })}
    </>
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

const ConnectedThoughtScene: React.FC<{frame: number}> = ({frame}) => {
  const sceneIn = progress(frame, 1354, 1364, easeOut);
  const outline = progress(frame, 1362, 1435, easeInOut);
  const connectedIn = progress(frame, 1405, 1450, easeOut);
  const travel = progress(frame, 1480, 1540, easeInOut);
  const thoughtIn = progress(frame, 1524, 1580, easeOut);
  const phrase = progress(frame, 1580, 1660, easeOut);
  const release = progress(frame, 1660, 1720, easeInOut);
  const resolve = progress(frame, 1760, 1810, easeInOut);
  const fade = 1 - progress(frame, 1792, 1815, easeIn);
  const lineFade = 1 - progress(frame, 1542, 1572, easeIn);
  const outlineX = interpolate(travel, [0, 1], [0, -680], clamp);
  const pillPath =
    'M 1080 825 L 410 825 C 325 825 285 868 285 950 C 285 1032 325 1075 410 1075 L 1100 1075';

  return (
    <AbsoluteFill
      style={{
        background: '#000',
        opacity: sceneIn * fade,
        overflow: 'hidden',
      }}
    >
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{
          position: 'absolute',
          inset: 0,
          translate: `${outlineX}px 0`,
          opacity: 1 - progress(frame, 1535, 1570, easeIn),
        }}
      >
        <defs>
          <linearGradient id="v3-connected-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2ef0d2" />
            <stop offset=".4" stopColor="#1713ff" />
            <stop offset=".78" stopColor="#5518ff" />
            <stop offset="1" stopColor="#2df0d3" />
          </linearGradient>
          <filter id="v3-connected-glow" x="-100%" y="-100%" width="300%" height="300%">
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
          stroke="url(#v3-connected-gradient)"
          strokeWidth="5"
          strokeLinecap="round"
          filter="url(#v3-connected-glow)"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - outline}
        />
        {[0, 1, 2].map((index) => (
          <path
            key={index}
            d={`M 700 ${900 + index * 54} C 860 ${870 + index * 44}, 1030 ${
              920 + index * 30
            }, 1220 ${895 + index * 42}`}
            fill="none"
            stroke={index === 1 ? '#2515ff' : 'rgba(52,32,255,.6)'}
            strokeWidth={index === 1 ? 7 : 4}
            strokeLinecap="round"
            opacity={travel * lineFade}
          />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 520 + outlineX,
          top: 904,
          color: '#eee',
          fontFamily: FONT,
          fontSize: 64,
          fontWeight: 310,
          letterSpacing: '-0.045em',
          opacity: connectedIn * (1 - travel),
          filter: `blur(${interpolate(connectedIn, [0, 0.4, 1], [12, 2, 0], clamp)}px)`,
        }}
      >
        Connected
      </div>
      <Dot
        x={interpolate(outline, [0, 1], [588, 1040], clamp) + outlineX}
        y={interpolate(outline, [0, 1], [934, 825], clamp)}
        size={15}
        opacity={(1 - travel) * outline}
      />
      <ThoughtLights frame={frame} opacity={thoughtIn} resolve={resolve} />
      <div
        style={{
          position: 'absolute',
          top: 952,
          width: '100%',
          textAlign: 'center',
          color: '#f4f4f4',
          fontFamily: FONT,
          fontSize: 72,
          fontWeight: 320,
          letterSpacing: '-0.04em',
          opacity:
            thoughtIn *
            interpolate(release, [0, 0.55, 1], [1, 0.55, 0], clamp) *
            (1 - resolve),
          translate: `${interpolate(release, [0, 1], [120, -290], clamp)}px 0`,
          filter: `blur(${interpolate(thoughtIn, [0, 0.45, 1], [9, 1, 0], clamp)}px)`,
        }}
      >
        Thought{' '}
        <span style={{opacity: phrase}}>
          in <span style={{opacity: progress(frame, 1635, 1690)}}>motion</span>
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 930,
          width: 170,
          height: 128,
          translate: '-50% -50%',
          opacity: resolve,
          scale: `${interpolate(resolve, [0, 0.72, 1], [0.35, 1.08, 1], clamp)}`,
          filter: `blur(${interpolate(resolve, [0, 0.6, 1], [18, 5, 0], clamp)}px)`,
        }}
      >
        <YouMotionMark color="rgba(132,247,255,.9)" />
      </div>
      <Footer dark={false} opacity={progress(frame, 1354, 1380)} />
    </AbsoluteFill>
  );
};

const BrandScene: React.FC<{frame: number}> = ({frame}) => {
  const enter = progress(frame, 1782, 1815, easeOut);
  const settle = progress(frame, 1808, 1852, easeInOut);
  return (
    <AbsoluteFill style={{background: '#000', opacity: enter}}>
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 930,
          width: 210,
          height: 158,
          translate: '-50% -50%',
          scale: `${interpolate(settle, [0, 0.6, 1], [1.18, 0.96, 1], clamp)}`,
          filter: `blur(${interpolate(enter, [0, 1], [8, 0], clamp)}px)`,
        }}
      >
        <YouMotionMark />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1023,
          width: '100%',
          textAlign: 'center',
          color: 'rgba(255,255,255,.8)',
          fontFamily: FONT,
          fontSize: 29,
          fontWeight: 300,
          letterSpacing: '-0.025em',
          opacity: progress(frame, 1810, 1844),
        }}
      >
        youmotion.com
      </div>
      <Footer dark={false} />
    </AbsoluteFill>
  );
};

const ReplicaVisuals: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      {frame < 130 ? <OpeningPathScene frame={frame} /> : null}
      {frame >= 128 && frame < 320 ? <WebGlMorphScene frame={frame} /> : null}
      {frame >= 286 && frame < 570 ? <FormScene frame={frame} /> : null}
      {frame >= 510 && frame < 890 ? <FocusScene frame={frame} /> : null}
      {frame >= 850 && frame < 1352 ? <WhiteJourneyScene frame={frame} /> : null}
      {frame >= 1325 && frame < 1820 ? <ConnectedThoughtScene frame={frame} /> : null}
      {frame >= 1778 ? <BrandScene frame={frame} /> : null}
    </AbsoluteFill>
  );
};

export type UiAeNeonPathReplicaV3Props = {
  includeReferenceAudio?: boolean;
  motionBlurSamples?: number;
  shutterAngle?: number;
};

/**
 * V3 high-fidelity motion-system reconstruction.
 *
 * The source MP4 is used only as read-only timing and geometry evidence.
 * The ring/diamond/star handoff is rebuilt as editable geometry and passed
 * through deterministic WebGL displacement, trail and glow effects.
 */
export const UiAeNeonPathReplicaV3: React.FC<UiAeNeonPathReplicaV3Props> = ({
  includeReferenceAudio = true,
  motionBlurSamples = 6,
  shutterAngle = 150,
}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <CameraMotionBlur samples={motionBlurSamples} shutterAngle={shutterAngle}>
      <ReplicaVisuals />
    </CameraMotionBlur>
    {includeReferenceAudio ? (
      <Audio src={staticFile('audio/ui-ae-neon-reference.m4a')} volume={1} />
    ) : null}
  </AbsoluteFill>
);
