import React from 'react';
import {Video} from '@remotion/media';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';

const colors = {
  ink: '#11120f',
  paper: '#f4f1e9',
  lime: '#c9f36a',
  orange: '#ff7658',
  blue: '#8bb7ff',
  white: '#fffdf7',
};

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};
const ease = Easing.bezier(0.16, 1, 0.3, 1);

type MediaKind = 'video' | 'image';

type MediaLayerProps = {
  src?: string;
  kind?: MediaKind;
  label: string;
  objectPosition?: string;
  muted?: boolean;
};

const mediaSource = (src: string) =>
  /^(https?:|data:|blob:)/.test(src) ? src : staticFile(src);

const PlaceholderPerson: React.FC<{side?: 'left' | 'center' | 'right'}> = ({
  side = 'center',
}) => {
  const x = side === 'left' ? '30%' : side === 'right' ? '70%' : '50%';
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: '20%',
          width: 245,
          height: 245,
          borderRadius: '50%',
          background: '#9ca294',
          translate: '-50% 0',
          boxShadow: '0 22px 60px rgba(0,0,0,.2)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x,
          bottom: '-8%',
          width: 570,
          height: 600,
          borderRadius: '48% 48% 10% 10%',
          background: '#4b5048',
          translate: '-50% 0',
        }}
      />
    </>
  );
};

const MediaLayer: React.FC<MediaLayerProps> = ({
  src,
  kind = 'video',
  label,
  objectPosition = '50% 38%',
  muted = true,
}) => {
  if (src) {
    const style: React.CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition,
    };
    return kind === 'image' ? (
      <Img src={mediaSource(src)} style={style} />
    ) : (
      <Video src={mediaSource(src)} style={style} muted={muted} />
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: 'linear-gradient(135deg,#d9ddd4 0%,#a4aa9f 100%)',
      }}
    >
      <PlaceholderPerson />
      <div
        style={{
          position: 'absolute',
          left: 42,
          top: 34,
          padding: '11px 18px',
          borderRadius: 999,
          color: colors.white,
          background: 'rgba(17,18,15,.68)',
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const Stage: React.FC<React.PropsWithChildren<{background?: string}>> = ({
  children,
  background = colors.ink,
}) => (
  <AbsoluteFill
    style={{
      background,
      color: colors.white,
      fontFamily: '-apple-system, BlinkMacSystemFont, PingFang SC, sans-serif',
      overflow: 'hidden',
    }}
  >
    {children}
  </AbsoluteFill>
);

const Caption: React.FC<{text: string; dark?: boolean; maxWidth?: number}> = ({
  text,
  dark = true,
  maxWidth = 1180,
}) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [8, 24], [38, 0], {...clamp, easing: ease});
  const opacity = interpolate(frame, [8, 20], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 104,
        maxWidth,
        padding: '18px 30px 20px',
        borderRadius: 18,
        background: dark ? 'rgba(12,13,11,.84)' : 'rgba(255,253,247,.92)',
        color: dark ? colors.white : colors.ink,
        fontSize: 44,
        lineHeight: 1.25,
        fontWeight: 800,
        textAlign: 'center',
        opacity,
        translate: `-50% ${y}px`,
        boxShadow: '0 18px 55px rgba(0,0,0,.18)',
        zIndex: 30,
      }}
    >
      {text}
    </div>
  );
};

export type ArollProps = {
  aRollSrc?: string;
  aRollKind?: MediaKind;
  caption?: string;
  name?: string;
  role?: string;
  keyword?: string;
};

export const WideArollClean: React.FC<ArollProps> = ({
  aRollSrc,
  aRollKind,
  caption = '先用真人建立信任 再用素材证明观点',
  name = 'Creator',
  role = 'Motion Designer',
}) => {
  const frame = useCurrentFrame();
  const lowerX = interpolate(frame, [10, 30], [-260, 0], {...clamp, easing: ease});
  return (
    <Stage>
      <MediaLayer src={aRollSrc} kind={aRollKind} label="A-ROLL 主画面" />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(90deg,rgba(10,11,9,.42),transparent 42%),linear-gradient(0deg,rgba(10,11,9,.68),transparent 48%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 90,
          borderLeft: `9px solid ${colors.lime}`,
          paddingLeft: 22,
          translate: `${lowerX}px 0`,
        }}
      >
        <div style={{fontSize: 48, fontWeight: 900}}>{name}</div>
        <div style={{fontSize: 27, marginTop: 8, color: '#e1e5db'}}>{role}</div>
      </div>
      <Caption text={caption} />
    </Stage>
  );
};

export const WideArollPunchIn: React.FC<ArollProps> = ({
  aRollSrc,
  aRollKind,
  caption = '当说到核心结论时 镜头应该靠近人物',
  keyword = '核心结论',
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [8, 66], [1, 1.11], {...clamp, easing: Easing.inOut(ease)});
  const keywordX = interpolate(frame, [28, 48], [160, 0], {...clamp, easing: ease});
  const keywordOpacity = interpolate(frame, [28, 42], [0, 1], clamp);
  return (
    <Stage>
      <div style={{position: 'absolute', inset: -30, scale}}>
        <MediaLayer src={aRollSrc} kind={aRollKind} label="A-ROLL 丝滑推近" />
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(90deg,transparent 45%,rgba(8,9,8,.68))'}} />
      <div
        style={{
          position: 'absolute',
          right: 110,
          top: 270,
          width: 560,
          opacity: keywordOpacity,
          translate: `${keywordX}px 0`,
        }}
      >
        <div style={{fontSize: 28, color: colors.lime, fontWeight: 850, letterSpacing: 4}}>
          EMPHASIS
        </div>
        <div style={{fontSize: 104, lineHeight: 1.02, fontWeight: 950, marginTop: 22}}>
          {keyword}
        </div>
        <div style={{width: 190, height: 13, background: colors.orange, marginTop: 34}} />
      </div>
      <Caption text={caption} maxWidth={1040} />
    </Stage>
  );
};

export type BrollProps = ArollProps & {
  bRollSrc?: string;
  bRollKind?: MediaKind;
  bRollTitle?: string;
  sourceLabel?: string;
};

export const WideBrollFullCover: React.FC<BrollProps> = ({
  aRollSrc,
  aRollKind,
  bRollSrc,
  bRollKind,
  caption = '解说继续 画面用 B-roll 提供具体证据',
  bRollTitle = '与解说严格对应的真实画面',
  sourceLabel = 'B-ROLL 证据素材',
}) => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [12, 36], [0, 100], {...clamp, easing: ease});
  const titleY = interpolate(frame, [32, 54], [50, 0], {...clamp, easing: ease});
  return (
    <Stage>
      <MediaLayer src={aRollSrc} kind={aRollKind} label="A-ROLL 持续发声" />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(0 ${100 - reveal}% 0 0)`,
        }}
      >
        <MediaLayer src={bRollSrc} kind={bRollKind} label={sourceLabel} objectPosition="50% 50%" />
        <AbsoluteFill style={{background: 'linear-gradient(0deg,rgba(5,6,5,.66),transparent 58%)'}} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 100,
          bottom: 245,
          width: 920,
          fontSize: 66,
          lineHeight: 1.08,
          fontWeight: 920,
          translate: `0 ${titleY}px`,
          opacity: interpolate(frame, [32, 48], [0, 1], clamp),
        }}
      >
        {bRollTitle}
      </div>
      <Caption text={caption} maxWidth={1280} />
    </Stage>
  );
};

export const WideBrollPictureInPicture: React.FC<BrollProps> = ({
  aRollSrc,
  aRollKind,
  bRollSrc,
  bRollKind,
  caption = '人物不消失 证据素材在另一侧完成说服',
  bRollTitle = '案例画面 / 数据来源',
}) => {
  const frame = useCurrentFrame();
  const cardX = interpolate(frame, [10, 34], [680, 0], {...clamp, easing: ease});
  const cardRotate = interpolate(frame, [10, 34], [5, 0], {...clamp, easing: ease});
  return (
    <Stage background="#22251f">
      <div style={{position: 'absolute', inset: 0, opacity: 0.48, filter: 'blur(8px)', scale: 1.04}}>
        <MediaLayer src={aRollSrc} kind={aRollKind} label="A-ROLL 背景" />
      </div>
      <div style={{position: 'absolute', left: 86, top: 86, width: 610, height: 780, overflow: 'hidden', borderRadius: 34}}>
        <MediaLayer src={aRollSrc} kind={aRollKind} label="A-ROLL 人物" objectPosition="50% 35%" />
      </div>
      <div
        style={{
          position: 'absolute',
          right: 90,
          top: 118,
          width: 1020,
          height: 620,
          padding: 18,
          borderRadius: 36,
          background: colors.paper,
          boxShadow: '0 35px 90px rgba(0,0,0,.38)',
          translate: `${cardX}px 0`,
          rotate: `${cardRotate}deg`,
        }}
      >
        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 24, overflow: 'hidden'}}>
          <MediaLayer src={bRollSrc} kind={bRollKind} label="B-ROLL 画中画" objectPosition="50% 50%" />
        </div>
        <div style={{position: 'absolute', left: 42, bottom: -60, color: colors.ink, fontSize: 30, fontWeight: 850}}>
          {bRollTitle}
        </div>
      </div>
      <Caption text={caption} maxWidth={1250} />
    </Stage>
  );
};

export type EvidenceStackProps = ArollProps & {
  evidence?: string[];
};

export const WideEvidenceStack: React.FC<EvidenceStackProps> = ({
  aRollSrc,
  aRollKind,
  caption = '一个观点 至少配一组可见的证据',
  evidence = ['用户截图', '公开数据', '真实案例'],
}) => {
  const frame = useCurrentFrame();
  return (
    <Stage background={colors.paper}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 820, height: 1080, overflow: 'hidden'}}>
        <MediaLayer src={aRollSrc} kind={aRollKind} label="A-ROLL 人物常驻" objectPosition="50% 35%" />
      </div>
      <div style={{position: 'absolute', left: 760, top: 0, width: 1160, height: 1080, background: colors.paper}}>
        <div style={{position: 'absolute', left: 110, top: 95, color: colors.ink, fontSize: 54, fontWeight: 950}}>
          证据不是装饰
        </div>
        {evidence.slice(0, 3).map((item, index) => {
          const delay = 8 + index * 12;
          const x = interpolate(frame, [delay, delay + 24], [620, 0], {...clamp, easing: ease});
          const rotate = interpolate(frame, [delay, delay + 24], [8, (index - 1) * 2.5], {...clamp, easing: ease});
          return (
            <div
              key={`${item}-${index}`}
              style={{
                position: 'absolute',
                left: 115 + index * 70,
                top: 205 + index * 190,
                width: 760,
                height: 300,
                padding: 22,
                borderRadius: 28,
                background: index === 1 ? colors.lime : colors.white,
                border: `5px solid ${colors.ink}`,
                boxShadow: '0 24px 50px rgba(15,17,13,.16)',
                translate: `${x}px 0`,
                rotate: `${rotate}deg`,
              }}
            >
              <div style={{height: 190, borderRadius: 18, background: index === 1 ? '#e8f9ba' : '#d9ddd4'}} />
              <div style={{color: colors.ink, fontSize: 31, fontWeight: 880, marginTop: 19}}>{item}</div>
            </div>
          );
        })}
      </div>
      <Caption text={caption} maxWidth={1180} />
    </Stage>
  );
};

export type ScreenDemoProps = ArollProps & {
  steps?: string[];
};

export const WideScreenDemo: React.FC<ScreenDemoProps> = ({
  aRollSrc,
  aRollKind,
  caption = '展示网站时 镜头要告诉观众正在看哪里',
  steps = ['打开工作台', '选择任务', '生成结果'],
}) => {
  const frame = useCurrentFrame();
  const browserY = interpolate(frame, [0, 24], [90, 0], {...clamp, easing: ease});
  const cursorX = interpolate(frame, [28, 90], [590, 1230], {...clamp, easing: Easing.inOut(ease)});
  const cursorY = interpolate(frame, [28, 90], [350, 610], {...clamp, easing: Easing.inOut(ease)});
  return (
    <Stage background="#e8e9e4">
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 70,
          width: 1500,
          height: 810,
          borderRadius: 30,
          background: colors.white,
          boxShadow: '0 35px 90px rgba(20,22,18,.2)',
          overflow: 'hidden',
          translate: `0 ${browserY}px`,
        }}
      >
        <div style={{height: 62, background: '#dfe1da', display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 24}}>
          {[colors.orange, '#f1c95d', colors.lime].map((color) => <div key={color} style={{width: 17, height: 17, borderRadius: '50%', background: color}} />)}
          <div style={{width: 760, height: 30, borderRadius: 12, background: colors.white, marginLeft: 42}} />
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '300px 1fr', height: 748}}>
          <div style={{background: colors.ink, padding: '48px 34px'}}>
            <div style={{fontSize: 31, fontWeight: 900, marginBottom: 48}}>PRODUCT UI</div>
            {steps.map((step, index) => <div key={step} style={{padding: '18px 20px', marginBottom: 13, borderRadius: 14, color: index === 1 ? colors.ink : colors.white, background: index === 1 ? colors.lime : '#292c27', fontSize: 25, fontWeight: 760}}>{step}</div>)}
          </div>
          <div style={{padding: 52, color: colors.ink}}>
            <div style={{fontSize: 52, fontWeight: 950}}>屏幕演示的主任务</div>
            <div style={{display: 'grid', gridTemplateColumns: '1.15fr .85fr', gap: 28, marginTop: 38}}>
              <div style={{height: 510, borderRadius: 24, background: '#e7e9e3'}} />
              <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
                {[1, 2, 3].map((n) => <div key={n} style={{height: 148, borderRadius: 22, background: n === 2 ? '#dff5a4' : '#eef0eb'}} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: cursorX, top: cursorY, width: 42, height: 58, background: colors.orange, clipPath: 'polygon(0 0, 100% 62%, 58% 70%, 42% 100%)', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,.25))'}} />
      <div style={{position: 'absolute', right: 80, bottom: 72, width: 300, height: 300, borderRadius: '50%', border: `11px solid ${colors.white}`, overflow: 'hidden', boxShadow: '0 20px 55px rgba(0,0,0,.3)'}}>
        <MediaLayer src={aRollSrc} kind={aRollKind} label="A-ROLL 小窗" objectPosition="50% 32%" />
      </div>
      <Caption text={caption} maxWidth={1060} dark />
    </Stage>
  );
};

export type DataSidebarProps = ArollProps & {
  metrics?: Array<{label: string; value: string}>;
};

export const WideDataSidebar: React.FC<DataSidebarProps> = ({
  aRollSrc,
  aRollKind,
  caption = '数据只在被说到的时候出现',
  metrics = [
    {label: '内容播放', value: '10万'},
    {label: '有效咨询', value: '36'},
    {label: '成交转化', value: '18%'},
  ],
}) => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1220, height: 1080, overflow: 'hidden'}}>
        <MediaLayer src={aRollSrc} kind={aRollKind} label="A-ROLL 主体 65%" objectPosition="48% 35%" />
      </div>
      <div style={{position: 'absolute', right: 0, top: 0, width: 700, height: 1080, padding: '90px 78px', background: colors.ink}}>
        <div style={{fontSize: 30, color: colors.lime, fontWeight: 850, letterSpacing: 4}}>核心数据</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 22, marginTop: 55}}>
          {metrics.slice(0, 3).map((metric, index) => {
            const delay = 8 + index * 12;
            const x = interpolate(frame, [delay, delay + 22], [260, 0], {...clamp, easing: ease});
            const opacity = interpolate(frame, [delay, delay + 14], [0, 1], clamp);
            return <div key={`${metric.label}-${index}`} style={{padding: '30px 34px', borderRadius: 25, background: index === 1 ? colors.lime : '#262923', color: index === 1 ? colors.ink : colors.white, opacity, translate: `${x}px 0`}}>
              <div style={{fontSize: 26, opacity: .72}}>{metric.label}</div>
              <div style={{fontSize: 76, fontWeight: 950, marginTop: 5}}>{metric.value}</div>
            </div>;
          })}
        </div>
      </div>
      <Caption text={caption} maxWidth={880} />
    </Stage>
  );
};

export type ChapterTransitionProps = {
  fromTitle?: string;
  toTitle?: string;
  chapter?: string;
};

export const WideChapterTransition: React.FC<ChapterTransitionProps> = ({
  fromTitle = '问题是什么',
  toTitle = '真正的解法',
  chapter = 'PART 02',
}) => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [16, 48], [0, 100], {...clamp, easing: ease});
  const reveal = interpolate(frame, [44, 72], [70, 0], {...clamp, easing: ease});
  return (
    <Stage background={colors.paper}>
      <div style={{position: 'absolute', inset: 0, padding: '130px 120px', color: colors.ink, display: 'flex', alignItems: 'center'}}>
        <div style={{fontSize: 104, lineHeight: 1.02, fontWeight: 950, opacity: interpolate(frame, [0, 22], [1, .2], clamp)}}>{fromTitle}</div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: `${wipe}%`, height: '100%', background: colors.orange}} />
      <div style={{position: 'absolute', right: 0, top: 0, width: `${Math.max(0, wipe - 28)}%`, height: '100%', background: colors.ink}} />
      <div style={{position: 'absolute', inset: 0, color: colors.white, display: 'flex', alignItems: 'center', padding: '130px 120px', opacity: interpolate(frame, [44, 58], [0, 1], clamp), translate: `${reveal}px 0`}}>
        <div>
          <div style={{fontSize: 28, color: colors.lime, letterSpacing: 5, fontWeight: 850}}>{chapter}</div>
          <div style={{fontSize: 118, lineHeight: 1.02, fontWeight: 950, marginTop: 24}}>{toTitle}</div>
          <div style={{width: 260, height: 14, background: colors.orange, marginTop: 46}} />
        </div>
      </div>
    </Stage>
  );
};

type CompanyNode = {
  name: string;
  subtitle?: string;
  color?: string;
};

const defaultCompanies: CompanyNode[] = [
  {name: 'Microsoft', subtitle: '云服务', color: colors.blue},
  {name: 'OpenAI', subtitle: '大模型', color: colors.white},
  {name: 'Google', subtitle: '云 + 模型', color: '#dce8ff'},
  {name: 'Amazon', subtitle: '云服务', color: '#fff0c6'},
  {name: 'Anthropic', subtitle: '大模型', color: '#f4dfbd'},
  {name: 'NVIDIA', subtitle: '芯片', color: colors.lime},
  {name: 'Oracle', subtitle: '云服务', color: '#ffd9d2'},
  {name: 'AMD', subtitle: '芯片', color: '#d9f3df'},
];

const CompanyCard: React.FC<{
  node: CompanyNode;
  width?: number;
  height?: number;
  active?: boolean;
}> = ({node, width = 230, height = 150, active = false}) => (
  <div
    style={{
      width,
      height,
      borderRadius: 22,
      padding: '25px 25px 20px',
      color: colors.ink,
      background: node.color || colors.white,
      border: active ? `7px solid ${colors.orange}` : '3px solid rgba(255,255,255,.4)',
      boxShadow: active
        ? '0 0 0 10px rgba(255,118,88,.15),0 24px 60px rgba(0,0,0,.38)'
        : '0 18px 45px rgba(0,0,0,.28)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <div style={{fontSize: 30, lineHeight: 1, fontWeight: 950}}>{node.name}</div>
    <div style={{fontSize: 20, opacity: 0.58, fontWeight: 760}}>{node.subtitle}</div>
  </div>
);

export type CompanyOrbitProps = ArollProps & {
  companies?: CompanyNode[];
  title?: string;
};

export const WideCompanyOrbit: React.FC<CompanyOrbitProps> = ({
  aRollSrc,
  aRollKind,
  caption = '先选出主要玩家 再讲他们之间的关系',
  companies = defaultCompanies,
  title = '这些是故事里的主要玩家',
}) => {
  const frame = useCurrentFrame();
  const slots = [
    {left: 95, top: 105},
    {left: 95, top: 340},
    {left: 95, top: 575},
    {left: 360, top: 210},
    {right: 95, top: 105},
    {right: 95, top: 340},
    {right: 95, top: 575},
    {right: 360, top: 210},
  ];
  return (
    <Stage background="#0f110f">
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 42%,rgba(201,243,106,.14),transparent 45%),linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)', backgroundSize: 'auto,48px 48px,48px 48px'}} />
      <div style={{position: 'absolute', left: 650, top: 70, width: 620, height: 820, overflow: 'hidden', borderRadius: 34, border: '6px solid rgba(255,255,255,.86)', boxShadow: '0 32px 90px rgba(0,0,0,.45)'}}>
        <MediaLayer src={aRollSrc} kind={aRollKind} label="A-ROLL 中心人物" objectPosition="50% 34%" />
      </div>
      {companies.slice(0, 8).map((node, index) => {
        const delay = 8 + index * 6;
        const side = index < 4 ? -1 : 1;
        const x = interpolate(frame, [delay, delay + 20], [side * 260, 0], {...clamp, easing: ease});
        const opacity = interpolate(frame, [delay, delay + 13], [0, 1], clamp);
        return <div key={`${node.name}-${index}`} style={{position: 'absolute', ...slots[index], opacity, translate: `${x}px 0`, scale: interpolate(frame, [delay, delay + 20], [.84, 1], {...clamp, easing: ease})}}><CompanyCard node={node} /></div>;
      })}
      <div style={{position: 'absolute', left: 650, top: 22, width: 620, textAlign: 'center', fontSize: 28, fontWeight: 850, color: colors.lime}}>{title}</div>
      <Caption text={caption} maxWidth={1170} />
    </Stage>
  );
};

export type IndustryMapProps = ArollProps & {
  title?: string;
  nodes?: CompanyNode[];
};

export const WideIndustryMap: React.FC<IndustryMapProps> = ({
  aRollSrc,
  aRollKind,
  caption = '一张图不是展板 而是可以被摄影机漫游的空间',
  title = 'AI 产业关系墙',
  nodes = defaultCompanies,
}) => {
  const frame = useCurrentFrame();
  const mapScale = interpolate(frame, [0, 100], [.94, 1.035], {...clamp, easing: Easing.inOut(ease)});
  const rows = [
    {label: '应用层', items: nodes.slice(0, 3), y: 110},
    {label: '模型层', items: nodes.slice(3, 6), y: 385},
    {label: '芯片层', items: nodes.slice(5, 8), y: 660},
  ];
  const lineProgress = interpolate(frame, [12, 80], [0, 1], clamp);
  return (
    <Stage background="#10120f">
      <div style={{position: 'absolute', inset: -30, scale: mapScale, background: 'radial-gradient(circle at 50% 45%,#292d26 0%,#0c0d0b 67%)'}}>
        <svg width="1980" height="1140" viewBox="0 0 1980 1140" style={{position: 'absolute', inset: 0, opacity: .8}}>
          {[
            'M530 280 C650 340 650 390 770 445',
            'M990 280 C990 350 990 385 990 445',
            'M1450 280 C1320 340 1320 390 1200 445',
            'M770 590 C760 660 700 690 620 750',
            'M990 590 C990 650 990 690 990 750',
            'M1200 590 C1230 650 1320 690 1380 750',
          ].map((d, index) => <path key={d} d={d} fill="none" stroke={index % 2 ? colors.orange : colors.lime} strokeWidth="9" strokeLinecap="round" strokeDasharray="280" strokeDashoffset={280 * (1 - lineProgress)} opacity={.72} />)}
        </svg>
        {rows.map((row, rowIndex) => <React.Fragment key={row.label}>
          <div style={{position: 'absolute', left: 82, top: row.y + 75, width: 170, fontSize: 28, color: '#a9afa4', fontWeight: 850, letterSpacing: 3}}>{row.label}</div>
          <div style={{position: 'absolute', left: 340, right: 220, top: row.y, display: 'flex', justifyContent: 'center', gap: 48}}>
            {row.items.map((node, index) => {
              const delay = 5 + rowIndex * 8 + index * 5;
              return <div key={`${row.label}-${node.name}-${index}`} style={{opacity: interpolate(frame, [delay, delay + 14], [0, 1], clamp), translate: `0 ${interpolate(frame, [delay, delay + 20], [60, 0], {...clamp, easing: ease})}px`}}><CompanyCard node={node} width={300} height={185} /></div>;
            })}
          </div>
        </React.Fragment>)}
      </div>
      <div style={{position: 'absolute', left: 82, top: 50, fontSize: 52, fontWeight: 950}}>{title}</div>
      <div style={{position: 'absolute', right: 72, bottom: 60, width: 270, height: 270, overflow: 'hidden', borderRadius: '50%', border: `10px solid ${colors.lime}`, boxShadow: '0 24px 70px rgba(0,0,0,.5)', zIndex: 20}}>
        <MediaLayer src={aRollSrc} kind={aRollKind} label="主持人" objectPosition="50% 32%" />
      </div>
      <Caption text={caption} maxWidth={1220} />
    </Stage>
  );
};

export type RelationshipFocusProps = ArollProps & {
  focusNodes?: CompanyNode[];
  dealLabel?: string;
};

export const WideRelationshipFocus: React.FC<RelationshipFocusProps> = ({
  aRollSrc,
  aRollKind,
  caption = '全局不消失 只让当前关系抬高发亮',
  focusNodes = [defaultCompanies[1], defaultCompanies[4], defaultCompanies[5]],
  dealLabel = '$30B 战略合作意向书',
}) => {
  const frame = useCurrentFrame();
  const focus = interpolate(frame, [8, 34], [0, 1], {...clamp, easing: ease});
  const arrow = interpolate(frame, [36, 76], [0, 1], clamp);
  return (
    <Stage background="#0d0f0c">
      <div style={{position: 'absolute', inset: 0, opacity: .2, filter: 'blur(3px)', display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 25, padding: 70}}>
        {[...defaultCompanies, ...defaultCompanies].slice(0, 18).map((node, index) => <CompanyCard key={`${node.name}-${index}`} node={node} width={245} height={140} />)}
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <path d="M640 495 C800 365 1050 365 1210 495" fill="none" stroke={colors.orange} strokeWidth="14" strokeLinecap="round" strokeDasharray="700" strokeDashoffset={700 * (1 - arrow)} />
        <path d="M1210 535 C1060 700 820 700 640 535" fill="none" stroke={colors.lime} strokeWidth="14" strokeLinecap="round" strokeDasharray="700" strokeDashoffset={700 * (1 - arrow)} />
      </svg>
      <div style={{position: 'absolute', left: 350, right: 350, top: 320, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {focusNodes.slice(0, 3).map((node, index) => <div key={node.name} style={{scale: .75 + focus * (index === 1 ? .36 : .25), translate: `0 ${(1 - focus) * 90}px`, opacity: .3 + focus * .7}}><CompanyCard node={node} width={340} height={225} active={index < 2} /></div>)}
      </div>
      <div style={{position: 'absolute', left: 690, top: 660, padding: '22px 34px', borderRadius: 18, background: '#201c2b', borderLeft: `9px solid ${colors.orange}`, fontSize: 38, fontWeight: 900, opacity: interpolate(frame, [48, 62], [0, 1], clamp), translate: `0 ${interpolate(frame, [48, 68], [35, 0], {...clamp, easing: ease})}px`}}>{dealLabel}</div>
      <div style={{position: 'absolute', left: 72, top: 60, width: 235, height: 235, overflow: 'hidden', borderRadius: '50%', border: `9px solid ${colors.lime}`}}><MediaLayer src={aRollSrc} kind={aRollKind} label="主持人" objectPosition="50% 32%" /></div>
      <Caption text={caption} maxWidth={1200} />
    </Stage>
  );
};

export type SourceDocumentProps = ArollProps & {
  documentSrc?: string;
  documentKind?: MediaKind;
  sourceTitle?: string;
  highlight?: string;
  metricLabel?: string;
  metricValue?: string;
};

export const WideSourceDocument: React.FC<SourceDocumentProps> = ({
  documentSrc,
  documentKind = 'image',
  caption = '原文负责可信 高亮和大数字负责快速理解',
  sourceTitle = 'OFFICIAL ANNOUNCEMENT / SOURCE DOCUMENT',
  highlight = '该公司的年化收入在最新披露中再次提升',
  metricLabel = 'ARR',
  metricValue = '$470亿',
}) => {
  const frame = useCurrentFrame();
  const markWidth = interpolate(frame, [18, 58], [0, 100], {...clamp, easing: ease});
  const stickerX = interpolate(frame, [34, 64], [260, 0], {...clamp, easing: ease});
  return (
    <Stage background="#f1ecdf">
      {documentSrc ? <MediaLayer src={documentSrc} kind={documentKind} label="原始文档" objectPosition="50% 50%" /> : <div style={{position: 'absolute', left: 170, top: 70, width: 1240, height: 900, padding: '70px 80px', color: '#39372f', background: colors.white, boxShadow: '0 30px 90px rgba(44,38,28,.18)', rotate: '-1.4deg'}}>
        <div style={{fontSize: 28, fontWeight: 900, letterSpacing: 2}}>{sourceTitle}</div>
        <div style={{height: 2, background: '#aaa69a', margin: '28px 0 35px'}} />
        {[92, 100, 83, 96, 88, 72, 98, 78, 92, 66].map((width, index) => <div key={`${width}-${index}`} style={{height: 16, width: `${width}%`, marginBottom: 20, background: index >= 3 && index <= 5 ? '#c7c2b5' : '#d9d5ca', opacity: .86}} />)}
      </div>}
      <div style={{position: 'absolute', left: 260, top: 415, width: 930, padding: '21px 28px', color: colors.ink, fontSize: 35, lineHeight: 1.35, fontWeight: 850, background: `linear-gradient(90deg,rgba(255,220,105,.88) ${markWidth}%,transparent ${markWidth}%)`}}>{highlight}</div>
      <div style={{position: 'absolute', right: 150, top: 260, width: 330, height: 350, padding: '45px 35px', color: colors.ink, background: '#ffd8d2', border: '5px solid rgba(121,54,45,.25)', boxShadow: '0 28px 70px rgba(93,52,43,.25)', rotate: '3deg', translate: `${stickerX}px 0`}}>
        <div style={{fontSize: 45, fontWeight: 950}}>{metricLabel}</div>
        <div style={{fontSize: 92, fontWeight: 950, marginTop: 75, lineHeight: 1}}>{metricValue}</div>
      </div>
      <Caption text={caption} dark={false} maxWidth={1280} />
    </Stage>
  );
};

export type EvidenceSource = {
  label: string;
  src?: string;
  kind?: MediaKind;
  color?: string;
};

export type EvidenceBridgeProps = ArollProps & {
  sources?: EvidenceSource[];
};

export const WideEvidenceBridge: React.FC<EvidenceBridgeProps> = ({
  aRollSrc,
  aRollKind,
  caption = '同一句解说可以用多类来源构成完整证据链',
  sources = [
    {label: '事件现场 / 新闻视频', color: '#8bb7ff'},
    {label: '媒体报道 / 文章截图', color: '#ffd8d2'},
    {label: '官方公告 / 公司页面', color: '#c9f36a'},
  ],
}) => {
  const frame = useCurrentFrame();
  const slots = [
    {start: 24, end: 53},
    {start: 50, end: 82},
    {start: 79, end: 120},
  ];
  return (
    <Stage>
      <Sequence from={0} durationInFrames={30}>
        <MediaLayer src={aRollSrc} kind={aRollKind} label="A-ROLL 提出事实" />
      </Sequence>
      {sources.slice(0, 3).map((source, index) => {
        const slot = slots[index];
        const opacity = interpolate(frame, [slot.start, slot.start + 5, slot.end - 5, slot.end], [0, 1, 1, index === 2 ? 1 : 0], clamp);
        const x = interpolate(frame, [slot.start, slot.start + 12], [110, 0], {...clamp, easing: ease});
        return <div key={`${source.label}-${index}`} style={{position: 'absolute', inset: 0, opacity, translate: `${x}px 0`, background: source.color || colors.paper}}>
          {source.src ? <MediaLayer src={source.src} kind={source.kind} label={source.label} objectPosition="50% 50%" /> : <div style={{position: 'absolute', inset: 0, padding: '100px 120px', color: colors.ink, background: `linear-gradient(135deg,${source.color || colors.paper},#f7f4ec)`}}>
            <div style={{fontSize: 28, fontWeight: 900, letterSpacing: 4}}>EVIDENCE {index + 1}</div>
            <div style={{fontSize: 92, lineHeight: 1.04, fontWeight: 950, maxWidth: 1180, marginTop: 55}}>{source.label}</div>
            <div style={{height: 360, borderRadius: 32, background: 'rgba(255,255,255,.64)', marginTop: 62, border: '5px solid rgba(17,18,15,.15)'}} />
          </div>}
        </div>;
      })}
      <Caption text={caption} dark maxWidth={1280} />
    </Stage>
  );
};

export const WidePresenterPipEvidence: React.FC<BrollProps> = ({
  aRollSrc,
  aRollKind,
  bRollSrc,
  bRollKind,
  caption = '主画面交给证据 主持人小窗保留反应和声音归属',
  bRollTitle = '真实视频 / 采访 / 故事重演',
  sourceLabel = 'B-ROLL 主画面',
}) => {
  const frame = useCurrentFrame();
  const pipScale = interpolate(frame, [14, 36], [.62, 1], {...clamp, easing: ease});
  const pipOpacity = interpolate(frame, [14, 28], [0, 1], clamp);
  return (
    <Stage>
      <MediaLayer src={bRollSrc} kind={bRollKind} label={sourceLabel} objectPosition="50% 50%" />
      <AbsoluteFill style={{background: 'linear-gradient(0deg,rgba(6,7,6,.62),transparent 48%)'}} />
      <div style={{position: 'absolute', left: 92, top: 78, padding: '15px 22px', borderRadius: 999, background: 'rgba(13,14,12,.76)', fontSize: 29, fontWeight: 850}}>{bRollTitle}</div>
      <div style={{position: 'absolute', right: 78, bottom: 78, width: 300, height: 300, overflow: 'hidden', borderRadius: '50%', border: `11px solid ${colors.lime}`, background: '#a4aa9f', boxShadow: '0 28px 75px rgba(0,0,0,.46)', scale: pipScale, opacity: pipOpacity}}>
        <MediaLayer src={aRollSrc} kind={aRollKind} label="主持人小窗" objectPosition="50% 32%" />
      </div>
      <Caption text={caption} maxWidth={1260} />
    </Stage>
  );
};
