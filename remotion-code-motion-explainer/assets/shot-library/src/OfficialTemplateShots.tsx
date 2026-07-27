import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

const ink = '#111310';
const paper = '#f5f1e8';
const lime = '#c9f36a';
const orange = '#ff7658';
const blue = '#86b7ff';
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const Stage: React.FC<React.PropsWithChildren<{dark?: boolean}>> = ({children, dark = true}) => (
  <AbsoluteFill style={{backgroundColor: dark ? ink : paper, color: dark ? paper : ink, fontFamily: '-apple-system, BlinkMacSystemFont, PingFang SC, sans-serif', overflow: 'hidden', padding: 76}}>
    {children}
  </AbsoluteFill>
);

export const OfficialWordCascade: React.FC<{words: string[]; accent: string}> = ({words, accent}) => {
  const frame = useCurrentFrame();
  return <Stage>
    <div style={{fontSize: 28, letterSpacing: 5, color: '#92998e', marginTop: 120}}>SEQUENCED TITLE</div>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 18, alignContent: 'center', minHeight: 1250}}>
      {words.map((word, index) => {
        const start = 7 + index * 7;
        return <span key={`${word}-${index}`} style={{fontSize: 112, lineHeight: 1.05, fontWeight: 930, letterSpacing: -6, color: index === 1 ? accent : paper, opacity: interpolate(frame, [start, start + 8], [0, 1], clamp), scale: interpolate(frame, [start, start + 18], [.55, 1], {...clamp, easing: ease}), translate: `0 ${interpolate(frame, [start, start + 18], [100, 0], {...clamp, easing: ease})}px`}}>{word}</span>;
      })}
    </div>
    <div style={{height: 10, width: `${interpolate(frame, [35, 70], [0, 72], {...clamp, easing: ease})}%`, background: accent, borderRadius: 999}} />
  </Stage>;
};

export const OfficialAudiogramCard: React.FC<{title: string; words: string[]; accent: string}> = ({title, words, accent}) => {
  const frame = useCurrentFrame();
  return <Stage>
    <div style={{display: 'grid', gridTemplateColumns: '250px 1fr', gap: 34, alignItems: 'center', marginTop: 90}}>
      <div style={{height: 250, borderRadius: 34, background: `linear-gradient(145deg, ${accent}, #30412a)`, display: 'grid', placeItems: 'center', fontSize: 96, fontWeight: 900}}>B</div>
      <div><div style={{fontSize: 28, color: '#9da398'}}>PODCAST · EP.08</div><div style={{fontSize: 62, lineHeight: 1.05, fontWeight: 900, marginTop: 16}}>{title}</div></div>
    </div>
    <div style={{height: 500, display: 'flex', alignItems: 'center', gap: 9, marginTop: 110}}>
      {Array.from({length: 34}, (_, index) => <div key={index} style={{flex: 1, height: `${18 + Math.abs(Math.sin(frame * .16 + index * .58)) * (40 + (index % 7) * 7)}%`, borderRadius: 99, background: index % 6 === 0 ? accent : '#eef0e9', scale: interpolate(frame, [0, 22], [.1, 1], {...clamp, easing: ease})}} />)}
    </div>
    <div style={{fontSize: 64, lineHeight: 1.28, fontWeight: 850, marginTop: 90, display: 'flex', flexWrap: 'wrap', gap: '14px 18px'}}>
      {words.map((word, index) => <span key={`${word}-${index}`} style={{color: frame >= 12 + index * 10 ? (index === Math.min(words.length - 1, Math.floor((frame - 12) / 10)) ? accent : paper) : '#63685f'}}>{word}</span>)}
    </div>
  </Stage>;
};

export const OfficialMusicVisualizer: React.FC<{song: string; artist: string; accent: string}> = ({song, artist, accent}) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.abs(Math.sin(frame * .18)) * .045;
  return <Stage>
    <div style={{position: 'absolute', width: 980, height: 980, borderRadius: '50%', background: accent, opacity: .14, filter: 'blur(80px)', left: 50, top: 130, scale: pulse}} />
    <div style={{position: 'relative', width: 690, height: 690, borderRadius: 56, margin: '140px auto 0', background: `linear-gradient(145deg, ${accent}, #1d241c)`, boxShadow: `0 42px 120px ${accent}44`, rotate: `${interpolate(frame, [0, 90], [-4, 4], clamp)}deg`, scale: pulse}}>
      <div style={{position: 'absolute', inset: 130, border: '12px solid rgba(255,255,255,.7)', borderRadius: '50%'}} />
      <div style={{position: 'absolute', width: 70, height: 70, borderRadius: '50%', background: paper, left: '50%', top: '50%', translate: '-50% -50%'}} />
    </div>
    <div style={{fontSize: 90, fontWeight: 930, letterSpacing: -5, marginTop: 100}}>{song}</div>
    <div style={{fontSize: 34, color: '#aeb4aa', marginTop: 18}}>{artist}</div>
    <div style={{height: 310, display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 70}}>{Array.from({length: 30}, (_, index) => <div key={index} style={{flex: 1, height: `${15 + Math.abs(Math.sin(frame * .13 + index * .5)) * 85}%`, background: index % 5 === 0 ? accent : paper, borderRadius: '12px 12px 3px 3px'}} />)}</div>
  </Stage>;
};

export const OfficialOverlaySticker: React.FC<{title: string; note: string; accent: string}> = ({title, note, accent}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{backgroundColor: '#2d342c', overflow: 'hidden', fontFamily: '-apple-system, PingFang SC, sans-serif'}}>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(145deg,#536354,#151915)'}} />
    <div style={{position: 'absolute', left: 70, right: 70, top: 130, height: 1330, borderRadius: 60, border: '2px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.06)'}} />
    <div style={{position: 'absolute', right: 76, top: 170, width: 700, background: paper, color: ink, borderRadius: 42, padding: 42, boxShadow: '0 28px 80px rgba(0,0,0,.28)', opacity: interpolate(frame, [5, 16, 76, 88], [0, 1, 1, 0], clamp), scale: interpolate(frame, [5, 24, 76, 88], [.55, 1, 1, .8], {...clamp, easing: ease}), translate: `0 ${interpolate(frame, [5, 24, 76, 88], [-120, 0, 0, -260], {...clamp, easing: ease})}px`, rotate: `${interpolate(frame, [5, 24, 76, 88], [7, -2, -2, -10], clamp)}deg`}}>
      <div style={{width: 86, height: 14, borderRadius: 99, background: accent, marginBottom: 26}} />
      <div style={{fontSize: 72, lineHeight: 1.02, fontWeight: 930}}>{title}</div>
      <div style={{fontSize: 32, lineHeight: 1.5, color: '#555c52', marginTop: 24}}>{note}</div>
    </div>
    <div style={{position: 'absolute', left: 86, bottom: 130, color: paper, fontSize: 36}}>透明叠加层 · 可覆盖真人或产品画面</div>
  </AbsoluteFill>;
};

const codeBefore = ['const views = 100000;', 'const leads = 0;', '', 'return views;'];
const codeAfter = ['const views = 100000;', 'const leads = 36;', 'const conversion = leads / views;', 'return conversion;'];
export const OfficialCodeWalkthrough: React.FC<{title: string; accent: string}> = ({title, accent}) => {
  const frame = useCurrentFrame();
  const switched = frame >= 42;
  const lines = switched ? codeAfter : codeBefore;
  return <Stage>
    <div style={{fontSize: 30, color: '#969d91', marginTop: 90}}>CODE WALKTHROUGH</div>
    <div style={{fontSize: 88, lineHeight: 1.02, fontWeight: 930, letterSpacing: -5, marginTop: 24}}>{title}</div>
    <div style={{marginTop: 100, borderRadius: 42, overflow: 'hidden', background: '#20241f', border: '2px solid #353a34', boxShadow: '0 36px 80px rgba(0,0,0,.3)'}}>
      <div style={{height: 74, background: '#2b302a', display: 'flex', alignItems: 'center', gap: 14, padding: '0 28px'}}>{[orange, '#ffd464', lime].map(color => <div key={color} style={{width: 18, height: 18, borderRadius: '50%', background: color}} />)}</div>
      <div style={{padding: '40px 34px 52px', fontFamily: 'SFMono-Regular, Menlo, monospace', fontSize: 32, lineHeight: 2}}>
        {lines.map((line, index) => <div key={`${line}-${index}`} style={{display: 'grid', gridTemplateColumns: '52px 1fr', borderRadius: 12, padding: '0 10px', background: switched && index === 2 ? `${accent}22` : 'transparent', color: switched && index === 2 ? accent : '#e9ede7', opacity: interpolate(frame, [8 + index * 6, 18 + index * 6], [0, 1], clamp), translate: `${interpolate(frame, [8 + index * 6, 22 + index * 6], [-50, 0], {...clamp, easing: ease})}px 0`}}><span style={{color: '#687066'}}>{index + 1}</span><span>{line || ' '}</span></div>)}
      </div>
    </div>
    <div style={{fontSize: 32, color: switched ? accent : '#92998e', marginTop: 48}}>{switched ? '✓ 从播放量切换到转化指标' : '正在定位问题…'}</div>
  </Stage>;
};

export const OfficialMilestoneStream: React.FC<{title: string; target: number; accent: string}> = ({title, target, accent}) => {
  const frame = useCurrentFrame();
  const progress = Math.round(interpolate(frame, [5, 78], [0, target], {...clamp, easing: ease}));
  const people = ['李想','Ada','王晨','Mia','Evan','林一'];
  return <Stage dark={false}>
    <div style={{marginTop: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}><div><div style={{fontSize: 30, color: '#73786f'}}>MILESTONE</div><div style={{fontSize: 76, fontWeight: 930, marginTop: 16}}>{title}</div></div><div style={{fontSize: 96, fontWeight: 950, color: accent}}>{progress}</div></div>
    <div style={{position: 'relative', height: 1260, marginTop: 90}}>{people.map((person, index) => {
      const start = 8 + index * 10;
      return <div key={person} style={{position: 'absolute', left: 0, right: 0, top: index * 190, minHeight: 160, borderRadius: 34, background: index === 0 ? ink : 'white', color: index === 0 ? paper : ink, border: '2px solid #d9ddd5', display: 'grid', gridTemplateColumns: '88px 1fr auto', gap: 24, alignItems: 'center', padding: 28, boxShadow: '0 18px 50px rgba(20,24,18,.09)', opacity: interpolate(frame, [start, start + 10], [0, 1], clamp), translate: `0 ${interpolate(frame, [start, start + 22], [220, 0], {...clamp, easing: ease})}px`}}><div style={{width: 82, height: 82, borderRadius: '50%', background: [lime, orange, blue][index % 3], display: 'grid', placeItems: 'center', fontSize: 34, fontWeight: 900}}>{person.slice(0,1)}</div><div><div style={{fontSize: 38, fontWeight: 850}}>{person}</div><div style={{fontSize: 25, opacity: .58, marginTop: 6}}>完成了第 {index + 1} 个里程碑</div></div><div style={{fontSize: 34, color: index === 0 ? lime : '#70766d'}}>★ {target - index}</div></div>;
    })}</div>
  </Stage>;
};

export const OfficialCaptionFocus: React.FC<{words: string[]; accent: string}> = ({words, accent}) => {
  const frame = useCurrentFrame();
  const active = Math.min(words.length - 1, Math.max(0, Math.floor((frame - 8) / 11)));
  return <AbsoluteFill style={{background: 'linear-gradient(145deg,#2e382e,#111410)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80, fontFamily: '-apple-system, PingFang SC, sans-serif'}}>
    <div style={{position: 'absolute', inset: '150px 80px 310px', borderRadius: 64, background: 'linear-gradient(160deg,#667b67,#263026)', opacity: .75}} />
    <div style={{position: 'absolute', left: 70, right: 70, bottom: 320, minHeight: 270, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '12px 18px', color: 'white', fontSize: 86, lineHeight: 1.08, fontWeight: 950, textAlign: 'center', WebkitTextStroke: '12px #111', paintOrder: 'stroke'}}>
      {words.map((word, index) => <span key={`${word}-${index}`} style={{color: index === active ? accent : 'white', scale: index === active ? 1.08 : 1, opacity: interpolate(frame, [2, 12], [0, 1], clamp)}}>{word}</span>)}
    </div>
  </AbsoluteFill>;
};

export const OfficialPromptStory: React.FC<{title: string; scenes: string[]; accent: string}> = ({title, scenes, accent}) => {
  const frame = useCurrentFrame();
  const active = Math.min(scenes.length - 1, Math.floor(frame / Math.max(1, 90 / scenes.length)));
  return <Stage>
    <div style={{fontSize: 28, color: '#959c91', marginTop: 60}}>PROMPT → STORY</div>
    <div style={{fontSize: 88, lineHeight: 1.02, fontWeight: 930, letterSpacing: -5, marginTop: 24}}>{title}</div>
    <div style={{position: 'relative', height: 970, marginTop: 80}}>{scenes.map((scene, index) => {
      const start = index * 18;
      return <div key={scene} style={{position: 'absolute', inset: 0, borderRadius: 56, overflow: 'hidden', background: `linear-gradient(${135 + index * 25}deg, ${[accent, orange, blue][index % 3]}, #172019)`, opacity: active === index ? 1 : 0, scale: interpolate(frame - start, [0, 30], [1.12, 1], {...clamp, easing: ease})}}><div style={{position: 'absolute', width: 680, height: 680, borderRadius: '50%', background: 'rgba(255,255,255,.15)', top: 80, right: -180}} /><div style={{position: 'absolute', left: 50, right: 50, bottom: 48, padding: 34, borderRadius: 30, background: 'rgba(12,15,12,.72)', color: 'white', fontSize: 44, lineHeight: 1.3, fontWeight: 800}}>{scene}</div></div>;
    })}</div>
    <div style={{display: 'flex', gap: 12, marginTop: 42}}>{scenes.map((_, index) => <div key={index} style={{height: 10, flex: 1, borderRadius: 99, background: index <= active ? accent : '#3f453d'}} />)}</div>
  </Stage>;
};

export const OfficialDeviceShowcase: React.FC<{title: string; accent: string}> = ({title, accent}) => {
  const frame = useCurrentFrame();
  return <Stage dark={false}>
    <div style={{fontSize: 30, color: '#747a70', marginTop: 70}}>3D PRODUCT SHOWCASE</div>
    <div style={{fontSize: 90, lineHeight: 1.02, fontWeight: 930, letterSpacing: -5, marginTop: 24}}>{title}</div>
    <div style={{height: 1180, display: 'grid', placeItems: 'center', perspective: 1500}}>
      <div style={{position: 'relative', width: 620, height: 980, borderRadius: 86, background: ink, padding: 24, boxShadow: '70px 90px 100px rgba(20,25,18,.28)', rotate: `${interpolate(frame, [0, 90], [-8, 8], clamp)}deg`, transform: `rotateY(${interpolate(frame, [0, 90], [-24, 18], clamp)}deg) rotateX(${interpolate(frame, [0, 90], [8, -5], clamp)}deg)`, translate: `0 ${interpolate(frame, [0, 45, 90], [55, 0, 35], clamp)}px`}}>
        <div style={{height: '100%', borderRadius: 66, overflow: 'hidden', background: `linear-gradient(155deg, ${accent}, #1e2b1e)`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 48, color: paper}}><div style={{width: 180, height: 44, borderRadius: 99, background: ink, alignSelf: 'center'}} /><div style={{fontSize: 72, lineHeight: 1, fontWeight: 930}}>你的内容<br/>随时生成</div><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18}}>{['文案','素材','动画','成片'].map(label => <div key={label} style={{padding: '24px 18px', borderRadius: 24, background: 'rgba(255,255,255,.16)', fontSize: 28}}>{label}</div>)}</div></div>
      </div>
    </div>
  </Stage>;
};
