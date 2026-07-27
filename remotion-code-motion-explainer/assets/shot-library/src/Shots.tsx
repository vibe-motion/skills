import React from 'react';
import {AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame} from 'remotion';

const palette = {ink: '#161814', paper: '#f4f1ea', lime: '#c9f36a', orange: '#ff805d', blue: '#8ab4ff'};
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const Stage: React.FC<React.PropsWithChildren<{dark?: boolean}>> = ({children, dark}) => (
  <AbsoluteFill style={{backgroundColor: dark ? palette.ink : palette.paper, color: dark ? palette.paper : palette.ink, fontFamily: '-apple-system, BlinkMacSystemFont, PingFang SC, sans-serif', padding: '120px 82px', overflow: 'hidden'}}>
    {children}
  </AbsoluteFill>
);

export const TalkingHeadCallout: React.FC = () => {
  const frame = useCurrentFrame();
  const personScale = interpolate(frame, [0, 20], [0.82, 1], {...clamp, easing: ease});
  const personY = interpolate(frame, [0, 20], [160, 0], {...clamp, easing: ease});
  return <Stage dark>
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', gap: 62}}>
      <div style={{fontSize: 42, color: '#aeb4a8'}}>真人口播 · 观点增强</div>
      <div style={{height: 920, borderRadius: 48, background: 'linear-gradient(145deg,#d8ded1,#919a8c)', position: 'relative', overflow: 'hidden', scale: personScale, translate: `0 ${personY}px`}}>
        <div style={{position: 'absolute', left: 220, top: 150, width: 470, height: 470, borderRadius: '50%', background: '#6f786b'}} />
        <div style={{position: 'absolute', left: 105, bottom: -110, width: 700, height: 540, borderRadius: '48% 48% 0 0', background: '#444b42'}} />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
        {['一句核心判断', '一个真实案例', '一个行动建议'].map((text, index) => {
          const x = interpolate(frame, [14 + index * 9, 34 + index * 9], [180, 0], {...clamp, easing: ease});
          const opacity = interpolate(frame, [14 + index * 9, 28 + index * 9], [0, 1], clamp);
          return <div key={text} style={{background: index === 0 ? palette.lime : '#2b2e28', color: index === 0 ? palette.ink : palette.paper, borderRadius: 22, padding: '25px 30px', fontSize: 42, fontWeight: 750, opacity, translate: `${x}px 0`}}>{text}</div>;
        })}
      </div>
    </div>
  </Stage>;
};

export const DataCounter: React.FC = () => {
  const frame = useCurrentFrame();
  const value = Math.round(interpolate(frame, [8, 66], [0, 100000], {...clamp, easing: ease}));
  return <Stage>
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', gap: 74}}>
      <div style={{fontSize: 44, color: '#70746b'}}>数据不等于结果</div>
      <div style={{fontSize: 176, lineHeight: 0.9, fontWeight: 900, letterSpacing: -10}}>{value.toLocaleString()}</div>
      <div style={{fontSize: 72, fontWeight: 780}}>播放量</div>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 22, height: 500}}>
        {[0.28, 0.44, 0.63, 0.9, 0.38].map((height, index) => {
          const grow = interpolate(frame, [18 + index * 6, 48 + index * 6], [0, height], {...clamp, easing: ease});
          return <div key={index} style={{flex: 1, height: `${grow * 100}%`, borderRadius: '28px 28px 8px 8px', background: index === 3 ? palette.orange : palette.ink}} />;
        })}
      </div>
      <div style={{background: palette.lime, borderRadius: 28, padding: '30px 34px', fontSize: 48, fontWeight: 800}}>咨询数：0</div>
    </div>
  </Stage>;
};

export const KineticStatement: React.FC = () => {
  const frame = useCurrentFrame();
  const words = ['爆款', '不等于', '个人IP'];
  return <Stage dark>
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28}}>
      {words.map((word, index) => {
        const y = interpolate(frame, [index * 14, index * 14 + 22], [130, 0], {...clamp, easing: ease});
        const opacity = interpolate(frame, [index * 14, index * 14 + 12], [0, 1], clamp);
        const scale = interpolate(frame, [index * 14, index * 14 + 22], [0.78, 1], {...clamp, easing: ease});
        return <div key={word} style={{fontSize: index === 2 ? 142 : 122, fontWeight: 900, lineHeight: 1, color: index === 2 ? palette.lime : palette.paper, opacity, translate: `0 ${y}px`, scale}}>{word}</div>;
      })}
      <div style={{height: 20, marginTop: 36, background: palette.orange, width: `${interpolate(frame, [42, 72], [0, 100], {...clamp, easing: ease})}%`}} />
    </div>
  </Stage>;
};

export const ReferenceCardStack: React.FC = () => {
  const frame = useCurrentFrame();
  const cards = [palette.blue, palette.orange, palette.lime];
  return <Stage>
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 70}}>
      <div style={{fontSize: 84, fontWeight: 880, letterSpacing: -4}}>案例不是收藏<br/>是可复用结构</div>
      <div style={{height: 920, position: 'relative'}}>
        {cards.map((color, index) => {
          const delay = index * 11;
          const x = interpolate(frame, [delay, delay + 26], [620, index * 40], {...clamp, easing: ease});
          const rotate = interpolate(frame, [delay, delay + 26], [12, (index - 1) * 4], {...clamp, easing: ease});
          return <div key={color} style={{position: 'absolute', inset: `${index * 70}px ${80 - index * 40}px auto ${index * 20}px`, height: 650, borderRadius: 44, background: color, border: `8px solid ${palette.ink}`, translate: `${x}px 0`, rotate: `${rotate}deg`, padding: 45}}>
            <div style={{fontSize: 38, fontWeight: 800}}>参考案例 {index + 1}</div>
            <div style={{height: 310, marginTop: 30, borderRadius: 28, background: 'rgba(255,255,255,.55)'}} />
            <div style={{fontSize: 32, marginTop: 28}}>钩子 · 节奏 · 转场</div>
          </div>;
        })}
      </div>
    </div>
  </Stage>;
};

export const SplitComparison: React.FC = () => {
  const frame = useCurrentFrame();
  const split = interpolate(frame, [6, 34], [50, 0], {...clamp, easing: ease});
  return <Stage dark>
    <div style={{height: '100%', display: 'grid', gridTemplateRows: '1fr 1fr', gap: 24}}>
      <div style={{background: '#30342e', borderRadius: 44, padding: 55, display: 'flex', flexDirection: 'column', justifyContent: 'center', translate: `${-split}px 0`}}>
        <div style={{fontSize: 38, color: '#a9afa5'}}>只有流量</div><div style={{fontSize: 100, fontWeight: 900, marginTop: 22}}>10万播放</div><div style={{fontSize: 54, color: palette.orange, marginTop: 24}}>0 个客户</div>
      </div>
      <div style={{background: palette.lime, color: palette.ink, borderRadius: 44, padding: 55, display: 'flex', flexDirection: 'column', justifyContent: 'center', translate: `${split}px 0`}}>
        <div style={{fontSize: 38, color: '#4f583f'}}>建立信任</div><div style={{fontSize: 100, fontWeight: 900, marginTop: 22}}>3000播放</div><div style={{fontSize: 54, marginTop: 24}}>12 个有效咨询</div>
      </div>
    </div>
  </Stage>;
};

export const StoryTimeline: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [8, 72], [0, 1], {...clamp, easing: ease});
  const labels = ['提出问题', '拆解原因', '给出方法', '建立期待'];
  return <Stage>
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      <div style={{fontSize: 88, fontWeight: 900, marginBottom: 110}}>一条内容的<br/>完整叙事路径</div>
      <div style={{position: 'relative', paddingLeft: 96, display: 'flex', flexDirection: 'column', gap: 100}}>
        <div style={{position: 'absolute', left: 28, top: 28, bottom: 28, width: 12, borderRadius: 9, background: '#d3d5ce'}} />
        <div style={{position: 'absolute', left: 28, top: 28, width: 12, height: `${progress * 88}%`, borderRadius: 9, background: palette.orange}} />
        {labels.map((label, index) => {
          const active = interpolate(frame, [10 + index * 15, 24 + index * 15], [0, 1], clamp);
          return <Sequence key={label} from={0} layout="none"><div style={{position: 'relative', opacity: 0.35 + active * 0.65, translate: `${(1 - active) * 70}px 0`}}><div style={{position: 'absolute', left: -86, top: 7, width: 34, height: 34, borderRadius: '50%', background: active > .5 ? palette.orange : '#c7cac2', border: `8px solid ${palette.paper}`}} /><div style={{fontSize: 56, fontWeight: 820}}>{label}</div><div style={{fontSize: 30, color: '#767970', marginTop: 10}}>第 {index + 1} 个叙事节点</div></div></Sequence>;
        })}
      </div>
    </div>
  </Stage>;
};
