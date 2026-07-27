import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

const colors = {
  ink: '#151713',
  paper: '#f5f1e8',
  lime: '#c9f36a',
  orange: '#ff7658',
  blue: '#8bb7ff',
  violet: '#aa91ff',
};
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const ShotStage: React.FC<React.PropsWithChildren<{dark?: boolean; padding?: number}>> = ({children, dark = false, padding = 80}) => (
  <AbsoluteFill
    style={{
      backgroundColor: dark ? colors.ink : colors.paper,
      color: dark ? colors.paper : colors.ink,
      fontFamily: '-apple-system, BlinkMacSystemFont, PingFang SC, sans-serif',
      overflow: 'hidden',
      padding,
    }}
  >
    {children}
  </AbsoluteFill>
);

const DemoMedia: React.FC<{accent: string; label?: string}> = ({accent, label = 'MEDIA'}) => (
  <div style={{position: 'absolute', inset: 0, background: `linear-gradient(145deg, ${accent}, #172019)`}}>
    <div style={{position: 'absolute', width: 620, height: 620, borderRadius: '50%', background: 'rgba(255,255,255,.22)', top: 150, left: 210}} />
    <div style={{position: 'absolute', width: 510, height: 740, borderRadius: '48% 48% 14% 14%', background: 'rgba(10,12,10,.55)', bottom: -90, left: 285}} />
    <div style={{position: 'absolute', left: 44, bottom: 40, padding: '14px 20px', borderRadius: 999, background: 'rgba(0,0,0,.58)', color: 'white', fontSize: 24, fontWeight: 800, letterSpacing: 3}}>{label}</div>
  </div>
);

export type MaskedMediaRevealProps = {eyebrow: string; title: string; accent: string};
export const MaskedMediaReveal: React.FC<MaskedMediaRevealProps> = ({eyebrow, title, accent}) => {
  const frame = useCurrentFrame();
  return <ShotStage dark padding={0}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        clipPath: `circle(${interpolate(frame, [4, 42], [4, 78], {...clamp, easing: ease})}% at 62% 44%)`,
        scale: interpolate(frame, [4, 70], [1.16, 1], {...clamp, easing: ease}),
      }}
    >
      <DemoMedia accent={accent} label="蒙版中的视频或图片" />
    </div>
    <div style={{position: 'absolute', inset: 'auto 78px 104px 78px', display: 'flex', flexDirection: 'column', gap: 18}}>
      <div style={{fontSize: 28, letterSpacing: 5, fontWeight: 800, color: accent, opacity: interpolate(frame, [22, 36], [0, 1], clamp), translate: `${interpolate(frame, [22, 42], [-70, 0], {...clamp, easing: ease})}px 0`}}>{eyebrow}</div>
      <div style={{fontSize: 94, lineHeight: 1.02, fontWeight: 920, letterSpacing: -5, opacity: interpolate(frame, [28, 45], [0, 1], clamp), translate: `0 ${interpolate(frame, [28, 48], [80, 0], {...clamp, easing: ease})}px`}}>{title}</div>
      <div style={{height: 12, width: `${interpolate(frame, [42, 70], [0, 100], {...clamp, easing: ease})}%`, background: accent, borderRadius: 999}} />
    </div>
  </ShotStage>;
};

export type KaraokeCaptionProps = {words: string[]; activeColor: string; context: string};
export const KaraokeCaption: React.FC<KaraokeCaptionProps> = ({words, activeColor, context}) => {
  const frame = useCurrentFrame();
  const active = Math.min(words.length - 1, Math.max(0, Math.floor((frame - 8) / 12)));
  return <ShotStage dark>
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 68}}>
      <div style={{fontSize: 34, color: '#9ca395', letterSpacing: 3}}>{context}</div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '22px 18px', alignItems: 'center'}}>
        {words.map((word, index) => {
          const local = frame - (8 + index * 12);
          return <span
            key={`${word}-${index}`}
            style={{
              display: 'inline-block',
              padding: index === active ? '10px 18px 14px' : '10px 0 14px',
              borderRadius: 18,
              background: index === active ? activeColor : 'transparent',
              color: index === active ? colors.ink : index < active ? colors.paper : '#6c7168',
              fontSize: 82,
              lineHeight: 1.08,
              fontWeight: 900,
              scale: interpolate(local, [0, 7, 12], [0.82, 1.08, 1], clamp),
              opacity: interpolate(local, [-4, 2], [0.35, 1], clamp),
            }}
          >{word}</span>;
        })}
      </div>
      <div style={{fontSize: 30, color: '#9ca395'}}>逐词时间可直接映射 captions.json</div>
    </div>
  </ShotStage>;
};

export type BeforeAfterWipeProps = {beforeLabel: string; afterLabel: string; accent: string};
export const BeforeAfterWipe: React.FC<BeforeAfterWipeProps> = ({beforeLabel, afterLabel, accent}) => {
  const frame = useCurrentFrame();
  const split = interpolate(frame, [12, 70], [8, 92], {...clamp, easing: ease});
  const panelStyle: React.CSSProperties = {position: 'absolute', inset: 0, padding: 54, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'};
  return <ShotStage>
    <div style={{fontSize: 82, fontWeight: 920, letterSpacing: -4, marginTop: 55}}>同一内容<br/>前后差多少</div>
    <div style={{position: 'relative', height: 1060, marginTop: 90, borderRadius: 50, overflow: 'hidden', border: `8px solid ${colors.ink}`, boxShadow: '0 34px 70px rgba(20,23,18,.16)'}}>
      <div style={{...panelStyle, background: '#cbc9c1'}}>
        <strong style={{fontSize: 40}}>{beforeLabel}</strong>
        <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>{[42, 78, 54, 31].map((v) => <div key={v} style={{height: 56, width: `${v}%`, background: '#777a73', borderRadius: 999}} />)}</div>
        <div style={{fontSize: 110, fontWeight: 900, color: '#666a61'}}>42%</div>
      </div>
      <div style={{...panelStyle, background: accent, clipPath: `inset(0 0 0 ${split}%)`}}>
        <strong style={{fontSize: 40, textAlign: 'right'}}>{afterLabel}</strong>
        <div style={{display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'flex-end'}}>{[82, 91, 74, 88].map((v) => <div key={v} style={{height: 56, width: `${v}%`, background: colors.ink, borderRadius: 999}} />)}</div>
        <div style={{fontSize: 110, fontWeight: 900, textAlign: 'right'}}>91%</div>
      </div>
      <div style={{position: 'absolute', top: 0, bottom: 0, left: `${split}%`, width: 8, background: colors.paper, translate: '-4px 0'}}>
        <div style={{position: 'absolute', width: 84, height: 84, borderRadius: '50%', background: colors.ink, color: 'white', display: 'grid', placeItems: 'center', fontSize: 30, left: -38, top: '50%', translate: '0 -50%'}}>↔</div>
      </div>
    </div>
  </ShotStage>;
};

export type WhipPanTransitionProps = {fromTitle: string; toTitle: string; accent: string};
export const WhipPanTransition: React.FC<WhipPanTransitionProps> = ({fromTitle, toTitle, accent}) => {
  const frame = useCurrentFrame();
  const fromX = interpolate(frame, [24, 50], [0, -1180], {...clamp, easing: Easing.bezier(.7, 0, .3, 1)});
  const toX = interpolate(frame, [24, 50], [1180, 0], {...clamp, easing: Easing.bezier(.7, 0, .3, 1)});
  const blur = interpolate(frame, [24, 36, 50], [0, 28, 0], clamp);
  const scene: React.CSSProperties = {position: 'absolute', inset: 0, padding: 90, display: 'flex', flexDirection: 'column', justifyContent: 'center'};
  return <ShotStage dark padding={0}>
    <div style={{...scene, background: '#252923', translate: `${fromX}px 0`, filter: `blur(${blur}px)`}}>
      <div style={{fontSize: 34, color: '#a8aea3'}}>镜头 A</div><div style={{fontSize: 124, lineHeight: 1, fontWeight: 920, marginTop: 28}}>{fromTitle}</div>
      <div style={{width: 620, height: 620, borderRadius: 60, background: colors.orange, marginTop: 90, rotate: '-6deg'}} />
    </div>
    <div style={{...scene, background: accent, color: colors.ink, translate: `${toX}px 0`, filter: `blur(${blur}px)`}}>
      <div style={{fontSize: 34}}>镜头 B</div><div style={{fontSize: 124, lineHeight: 1, fontWeight: 920, marginTop: 28}}>{toTitle}</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 90}}>{[1,2,3,4].map((n) => <div key={n} style={{height: 280, background: colors.ink, borderRadius: 42, opacity: .82}} />)}</div>
    </div>
    {[0,1,2,3,4].map((n) => <div key={n} style={{position: 'absolute', top: 170 + n * 330, left: 0, height: 10 + n * 3, width: '100%', background: 'rgba(255,255,255,.7)', opacity: interpolate(frame, [24, 34, 50], [0, .8, 0], clamp), translate: `${interpolate(frame, [24, 50], [700, -700], clamp)}px 0`}} />)}
  </ShotStage>;
};

export type AudioPulseProps = {title: string; accent: string};
export const AudioPulse: React.FC<AudioPulseProps> = ({title, accent}) => {
  const frame = useCurrentFrame();
  const bars = Array.from({length: 24}, (_, index) => index);
  return <ShotStage dark>
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      <div style={{fontSize: 32, color: '#9ea499', letterSpacing: 4}}>AUDIO REACTIVE</div>
      <div style={{fontSize: 94, lineHeight: 1.04, fontWeight: 920, marginTop: 26}}>{title}</div>
      <div style={{height: 620, display: 'flex', alignItems: 'center', gap: 12, marginTop: 80}}>
        {bars.map((index) => {
          const wave = Math.abs(Math.sin(frame * .17 + index * .54));
          const envelope = .28 + .72 * Math.abs(Math.sin(frame * .055 + index * .13));
          return <div key={index} style={{flex: 1, height: `${16 + wave * envelope * 84}%`, borderRadius: 999, background: index % 5 === 0 ? accent : colors.paper, scale: interpolate(frame, [0, 18], [0.1, 1], {...clamp, easing: ease})}} />;
        })}
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 46, color: '#9ea499', fontSize: 28}}><span>00:12</span><span>01:08</span></div>
    </div>
  </ShotStage>;
};

export type MetricRecapProps = {title: string; metrics: Array<{label: string; value: number; suffix: string}>};
export const MetricRecap: React.FC<MetricRecapProps> = ({title, metrics}) => {
  const frame = useCurrentFrame();
  return <ShotStage>
    <div style={{fontSize: 34, color: '#70756b'}}>BUSINESS RECAP</div>
    <div style={{fontSize: 92, lineHeight: 1.02, fontWeight: 920, letterSpacing: -5, marginTop: 28}}>{title}</div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 24, marginTop: 100}}>
      {metrics.map((metric, index) => {
        const start = 10 + index * 12;
        const shown = Math.round(interpolate(frame, [start, start + 38], [0, metric.value], {...clamp, easing: ease}));
        return <div key={metric.label} style={{minHeight: 300, borderRadius: 42, padding: '40px 44px', background: index === 0 ? colors.ink : index === 1 ? colors.lime : colors.orange, color: index === 0 ? 'white' : colors.ink, opacity: interpolate(frame, [start, start + 10], [0, 1], clamp), translate: `${interpolate(frame, [start, start + 24], [160, 0], {...clamp, easing: ease})}px 0`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
          <div style={{fontSize: 34, opacity: .72}}>{metric.label}</div>
          <div style={{fontSize: 118, fontWeight: 920, letterSpacing: -6}}>{shown.toLocaleString()}{metric.suffix}</div>
        </div>;
      })}
    </div>
  </ShotStage>;
};

export type NotificationStackProps = {title: string; notifications: string[]};
export const NotificationStack: React.FC<NotificationStackProps> = ({title, notifications}) => {
  const frame = useCurrentFrame();
  return <ShotStage dark>
    <div style={{fontSize: 92, lineHeight: 1.02, fontWeight: 920, letterSpacing: -5, marginTop: 90}}>{title}</div>
    <div style={{position: 'relative', height: 1080, marginTop: 90}}>
      {notifications.map((notification, index) => {
        const start = 8 + index * 13;
        return <div key={notification} style={{position: 'absolute', left: 0, right: 0, top: index * 220, minHeight: 190, borderRadius: 40, padding: 34, background: index === notifications.length - 1 ? colors.lime : '#2b3029', color: index === notifications.length - 1 ? colors.ink : 'white', border: '2px solid rgba(255,255,255,.08)', boxShadow: '0 28px 60px rgba(0,0,0,.28)', display: 'grid', gridTemplateColumns: '86px 1fr', alignItems: 'center', gap: 28, opacity: interpolate(frame, [start, start + 10], [0, 1], clamp), translate: `0 ${interpolate(frame, [start, start + 24], [260, 0], {...clamp, easing: ease})}px`, scale: interpolate(frame, [start, start + 24], [.92, 1], {...clamp, easing: ease})}}>
          <div style={{width: 86, height: 86, borderRadius: 26, background: index === notifications.length - 1 ? colors.ink : colors.orange, color: 'white', display: 'grid', placeItems: 'center', fontSize: 34, fontWeight: 900}}>{index + 1}</div>
          <div><div style={{fontSize: 27, opacity: .65}}>智能任务已完成</div><div style={{fontSize: 38, fontWeight: 800, marginTop: 8}}>{notification}</div></div>
        </div>;
      })}
    </div>
  </ShotStage>;
};

export type LowerThirdProps = {name: string; role: string; accent: string};
export const LowerThird: React.FC<LowerThirdProps> = ({name, role, accent}) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [8, 32], [0, 1], {...clamp, easing: ease});
  return <ShotStage dark padding={0}>
    <DemoMedia accent="#566354" label="真人口播画面" />
    <div style={{position: 'absolute', left: 64, right: 64, bottom: 150, display: 'flex', alignItems: 'stretch'}}>
      <div style={{width: 18, background: accent, scale: `${enter} 1`, transformOrigin: 'left center'}} />
      <div style={{background: 'rgba(18,20,17,.9)', backdropFilter: 'blur(20px)', padding: '30px 38px 34px', minWidth: 680, opacity: interpolate(frame, [10, 24], [0, 1], clamp), translate: `${interpolate(frame, [8, 34], [-180, 0], {...clamp, easing: ease})}px 0`}}>
        <div style={{fontSize: 52, fontWeight: 900}}>{name}</div>
        <div style={{fontSize: 28, color: accent, marginTop: 8}}>{role}</div>
      </div>
    </div>
  </ShotStage>;
};

export type BrandHoldEndCardProps = {brand: string; slogan: string; accent: string};
export const BrandHoldEndCard: React.FC<BrandHoldEndCardProps> = ({brand, slogan, accent}) => {
  const frame = useCurrentFrame();
  return <ShotStage dark>
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
      <div style={{width: 220, height: 220, borderRadius: 66, background: accent, color: colors.ink, display: 'grid', placeItems: 'center', fontSize: 96, fontWeight: 950, opacity: interpolate(frame, [6, 24], [0, 1], clamp), scale: interpolate(frame, [6, 34], [.62, 1], {...clamp, easing: ease}), filter: `blur(${interpolate(frame, [6, 28], [24, 0], clamp)}px)`}}>{brand.slice(0, 1)}</div>
      <div style={{fontSize: 116, fontWeight: 950, letterSpacing: -6, marginTop: 56, opacity: interpolate(frame, [18, 38], [0, 1], clamp), translate: `0 ${interpolate(frame, [18, 42], [80, 0], {...clamp, easing: ease})}px`}}>{brand}</div>
      <div style={{fontSize: 38, color: '#aeb4a9', marginTop: 22, opacity: interpolate(frame, [28, 48], [0, 1], clamp)}}>{slogan}</div>
      <div style={{width: `${interpolate(frame, [38, 66], [0, 68], {...clamp, easing: ease})}%`, height: 10, background: accent, borderRadius: 999, marginTop: 58}} />
      <div style={{marginTop: 100, padding: '22px 36px', borderRadius: 999, background: colors.paper, color: colors.ink, fontSize: 34, fontWeight: 850, opacity: interpolate(frame, [48, 68], [0, 1], clamp)}}>关注 · 获得下一条方法</div>
    </div>
  </ShotStage>;
};
