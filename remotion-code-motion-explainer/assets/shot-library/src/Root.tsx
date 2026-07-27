import React from 'react';
import {Composition, Folder} from 'remotion';
import {
  TalkingHeadCallout,
  DataCounter,
  KineticStatement,
  ReferenceCardStack,
  SplitComparison,
  StoryTimeline,
} from './Shots';
import {
  AudioPulse,
  BeforeAfterWipe,
  BrandHoldEndCard,
  KaraokeCaption,
  LowerThird,
  MaskedMediaReveal,
  MetricRecap,
  NotificationStack,
  WhipPanTransition,
} from './GithubInspiredShots';
import {
  OfficialAudiogramCard,
  OfficialCaptionFocus,
  OfficialCodeWalkthrough,
  OfficialDeviceShowcase,
  OfficialMilestoneStream,
  OfficialMusicVisualizer,
  OfficialOverlaySticker,
  OfficialPromptStory,
  OfficialWordCascade,
} from './OfficialTemplateShots';
import {
  WideArollClean,
  WideArollPunchIn,
  WideBrollFullCover,
  WideBrollPictureInPicture,
  WideChapterTransition,
  WideCompanyOrbit,
  WideDataSidebar,
  WideEvidenceBridge,
  WideEvidenceStack,
  WideIndustryMap,
  WidePresenterPipEvidence,
  WideRelationshipFocus,
  WideScreenDemo,
  WideSourceDocument,
} from './ArollBrollShots';
import {
  KnowledgeWorld,
  SrtDrivenVideo,
  SrtDrivenVideoSchema,
  defaultKnowledgeGraph,
  type SrtDrivenStudioProps,
  type SrtTimeline,
} from './ProductionSystem';
import srtTimelineData from '../public/data/srt-timeline.json';
import {
  WideElasticKeyPoint,
  WideEvidenceTicker,
  WideRulerChapterProgress,
  WideSpotlightReveal,
} from './VibeMotionShots';
import {
  WideCausalTagMap,
  WideExplodedWorkflowBoard,
  WideGiantKeywordBackdrop,
  WideHudChapterTitle,
  WidePresenterMediaCards,
  WideProcessPillBuilder,
  WideTimelinePreviewCompare,
  WideTutorialSpotlight,
} from './VibeCutReferenceShots';
import {
  UiAeCardSwarmTimeline,
  UiAeNeonMessageJourney,
  UiAeNeonPathSystem,
  UiAeProductGridWorld,
  UiAePromptAgentFlow,
  UiAeVoicePersonaFlow,
} from './UiAeReferenceShots';
import {UiAeNeonPathReplica} from './UiAeNeonPathReplica';
import {UiAeNeonPathReplicaV3} from './UiAeNeonPathReplicaV3';
import {
  AeGlassDashboard,
  AeOrganicGradientField,
  AeSaasKineticType,
  AeWebsitePerspectiveShowcase,
} from './AeProjectReferenceShots';

const common = {durationInFrames: 90, fps: 30, width: 1080, height: 1920};
const wide = {durationInFrames: 120, fps: 30, width: 1920, height: 1080};
const srtTimeline = srtTimelineData as SrtTimeline;
const SrtDrivenStudio: React.FC<SrtDrivenStudioProps> = (props) => (
  <SrtDrivenVideo
    {...props}
    timeline={srtTimeline}
    graph={defaultKnowledgeGraph}
  />
);

export const ShotLibraryRoot: React.FC = () => (
  <Folder name="Code-Motion-Shots">
    <Composition id="TalkingHeadCallout" component={TalkingHeadCallout} {...common} />
    <Composition id="DataCounter" component={DataCounter} {...common} />
    <Composition id="KineticStatement" component={KineticStatement} {...common} />
    <Composition id="ReferenceCardStack" component={ReferenceCardStack} {...common} />
    <Composition id="SplitComparison" component={SplitComparison} {...common} />
    <Composition id="StoryTimeline" component={StoryTimeline} {...common} />
    <Composition id="MaskedMediaReveal" component={MaskedMediaReveal} {...common} defaultProps={{eyebrow: 'MASK REVEAL', title: '素材与文字\n各自运动', accent: '#c9f36a'}} />
    <Composition id="KaraokeCaption" component={KaraokeCaption} {...common} defaultProps={{words: ['不是','每个爆款','都能变成','长期IP'], activeColor: '#c9f36a', context: '逐词高亮字幕'}} />
    <Composition id="BeforeAfterWipe" component={BeforeAfterWipe} {...common} defaultProps={{beforeLabel: '优化前', afterLabel: '优化后', accent: '#c9f36a'}} />
    <Composition id="WhipPanTransition" component={WhipPanTransition} {...common} defaultProps={{fromTitle: '提出问题', toTitle: '给出答案', accent: '#c9f36a'}} />
    <Composition id="AudioPulse" component={AudioPulse} {...common} defaultProps={{title: '让声音\n也参与叙事', accent: '#ff7658'}} />
    <Composition id="MetricRecap" component={MetricRecap} {...common} defaultProps={{title: '本周内容增长', metrics: [{label: '有效播放', value: 128400, suffix: ''}, {label: '新增咨询', value: 36, suffix: '人'}, {label: '成交转化', value: 18, suffix: '%'}]}} />
    <Composition id="NotificationStack" component={NotificationStack} {...common} defaultProps={{title: '任务不是回答\n而是完成', notifications: ['机票价格已更新', '投递记录已生成', '内容定时发布成功', '本周数据报告已完成']}} />
    <Composition id="LowerThird" component={LowerThird} {...common} defaultProps={{name: 'Creator', role: 'Motion Designer', accent: '#c9f36a'}} />
    <Composition id="BrandHoldEndCard" component={BrandHoldEndCard} {...common} defaultProps={{brand: 'Code Motion', slogan: 'Turn every production into a reusable system', accent: '#c9f36a'}} />
    <Composition id="OfficialWordCascade" component={OfficialWordCascade} {...common} defaultProps={{words: ['让','每一个','关键词','按节奏出现'], accent: '#c9f36a'}} />
    <Composition id="OfficialAudiogramCard" component={OfficialAudiogramCard} {...common} defaultProps={{title: '一段值得被看见的声音', words: ['内容资产','不是文件堆积','而是可以复用的能力'], accent: '#c9f36a'}} />
    <Composition id="OfficialMusicVisualizer" component={OfficialMusicVisualizer} {...common} defaultProps={{song: 'Build the Momentum', artist: 'Motion Sound System', accent: '#ff7658'}} />
    <Composition id="OfficialOverlaySticker" component={OfficialOverlaySticker} {...common} defaultProps={{title: '这里是重点', note: '作为透明包装层独立出现，不和底层视频绑定', accent: '#c9f36a'}} />
    <Composition id="OfficialCodeWalkthrough" component={OfficialCodeWalkthrough} {...common} defaultProps={{title: '把逻辑讲清楚', accent: '#c9f36a'}} />
    <Composition id="OfficialMilestoneStream" component={OfficialMilestoneStream} {...common} defaultProps={{title: '第 100 个客户', target: 100, accent: '#ff7658'}} />
    <Composition id="OfficialCaptionFocus" component={OfficialCaptionFocus} {...common} defaultProps={{words: ['播放量','不等于','客户'], accent: '#c9f36a'}} />
    <Composition id="OfficialPromptStory" component={OfficialPromptStory} {...common} defaultProps={{title: '一句提示词\n变成完整故事', scenes: ['先提出一个有冲突的问题','再用具体案例建立证据','最后给出可以行动的结论'], accent: '#c9f36a'}} />
    <Composition id="OfficialDeviceShowcase" component={OfficialDeviceShowcase} {...common} defaultProps={{title: '产品界面\n立体亮相', accent: '#8bb7ff'}} />
    <Composition id="WideArollClean" component={WideArollClean} {...wide} defaultProps={{caption: '先用真人建立信任 再用素材证明观点', name: 'Creator', role: 'Motion Designer'}} />
    <Composition id="WideArollPunchIn" component={WideArollPunchIn} {...wide} defaultProps={{caption: '当说到核心结论时 镜头应该靠近人物', keyword: '核心结论'}} />
    <Composition id="WideBrollFullCover" component={WideBrollFullCover} {...wide} defaultProps={{caption: '解说继续 画面用 B-roll 提供具体证据', bRollTitle: '与解说严格对应的真实画面', sourceLabel: 'B-ROLL 证据素材'}} />
    <Composition id="WideBrollPictureInPicture" component={WideBrollPictureInPicture} {...wide} defaultProps={{caption: '人物不消失 证据素材在另一侧完成说服', bRollTitle: '案例画面 / 数据来源'}} />
    <Composition id="WideEvidenceStack" component={WideEvidenceStack} {...wide} defaultProps={{caption: '一个观点 至少配一组可见的证据', evidence: ['用户截图', '公开数据', '真实案例']}} />
    <Composition id="WideScreenDemo" component={WideScreenDemo} {...wide} defaultProps={{caption: '展示网站时 镜头要告诉观众正在看哪里', steps: ['打开工作台', '选择任务', '生成结果']}} />
    <Composition id="WideDataSidebar" component={WideDataSidebar} {...wide} defaultProps={{caption: '数据只在被说到的时候出现', metrics: [{label: '内容播放', value: '10万'}, {label: '有效咨询', value: '36'}, {label: '成交转化', value: '18%'}]}} />
    <Composition id="WideChapterTransition" component={WideChapterTransition} {...wide} defaultProps={{fromTitle: '问题是什么', toTitle: '真正的解法', chapter: 'PART 02'}} />
    <Composition id="WideCompanyOrbit" component={WideCompanyOrbit} {...wide} defaultProps={{caption: '先选出主要玩家 再讲他们之间的关系', title: '这些是故事里的主要玩家'}} />
    <Composition id="WideIndustryMap" component={WideIndustryMap} {...wide} defaultProps={{caption: '一张图不是展板 而是可以被摄影机漫游的空间', title: 'AI 产业关系墙'}} />
    <Composition id="WideRelationshipFocus" component={WideRelationshipFocus} {...wide} defaultProps={{caption: '全局不消失 只让当前关系抬高发亮', dealLabel: '$30B 战略合作意向书'}} />
    <Composition id="WideSourceDocument" component={WideSourceDocument} {...wide} defaultProps={{caption: '原文负责可信 高亮和大数字负责快速理解', sourceTitle: 'OFFICIAL ANNOUNCEMENT / SOURCE DOCUMENT', highlight: '该公司的年化收入在最新披露中再次提升', metricLabel: 'ARR', metricValue: '$470亿'}} />
    <Composition id="WideEvidenceBridge" component={WideEvidenceBridge} {...wide} defaultProps={{caption: '同一句解说可以用多类来源构成完整证据链'}} />
    <Composition id="WidePresenterPipEvidence" component={WidePresenterPipEvidence} {...wide} defaultProps={{caption: '主画面交给证据 主持人小窗保留反应和声音归属', bRollTitle: '真实视频 / 采访 / 故事重演', sourceLabel: 'B-ROLL 主画面'}} />
    <Composition id="WideElasticKeyPoint" component={WideElasticKeyPoint} {...wide} defaultProps={{eyebrow: 'KEY POINT', title: '先拿客资 再做人设', detail: '重点卡先蓄力、再弹出、最后稳定停住；文字按语义错峰进入', accent: '#c9f36a'}} />
    <Composition id="WideRulerChapterProgress" component={WideRulerChapterProgress} {...wide} defaultProps={{title: '这一段讲到哪里了', chapters: ['提出问题', '拆解原因', '给出方法', '案例验证'], activeIndex: 2, accent: '#c9f36a'}} />
    <Composition id="WideEvidenceTicker" component={WideEvidenceTicker} {...wide} defaultProps={{title: '让素材成为持续流动的证据', labels: ['客户现场', '公开数据', '包装样品', '用户反馈', '项目结果'], accent: '#8bb7ff'}} />
    <Composition id="WideSpotlightReveal" component={WideSpotlightReveal} {...wide} defaultProps={{eyebrow: 'OPENING STATEMENT', title: '真正有价值的内容 必须带来结果', accent: '#c9f36a'}} />
    <Composition id="WideTimelinePreviewCompare" component={WideTimelinePreviewCompare} {...wide} defaultProps={{title: '时间线不等于观众看到的成片', timelineLabel: '时间线', previewLabel: '剪辑预览', sourceDuration: '30分钟', outputDuration: '3分钟', accent: '#a8ff47'}} />
    <Composition id="WideProcessPillBuilder" component={WideProcessPillBuilder} {...wide} defaultProps={{title: '一句需求建立完整剪辑流程', prompt: '把这些素材剪成一条节奏流畅的成片', steps: ['分镜拆解', '粗剪', '精剪', '音效', '背景音乐', '成片渲染'], accent: '#45b83f'}} />
    <Composition id="WideHudChapterTitle" component={WideHudChapterTitle} {...wide} defaultProps={{chapterNumber: '03', title: '分钟完成', subtitle: 'Vibe Cutting · 实战演示', accent: '#a8ff47'}} />
    <Composition id="WideExplodedWorkflowBoard" component={WideExplodedWorkflowBoard} {...wide} defaultProps={{title: '规划镜头时长与内容\n完成成片', cards: ['文案脚本', '粗剪视频', '背景音乐', '结构规划', '镜头素材', '最终渲染'], accent: '#ffe64f'}} />
    <Composition id="WideTutorialSpotlight" component={WideTutorialSpotlight} {...wide} defaultProps={{title: '只让观众看当前操作', callout: '界面整体降权，目标区域放大并描边；人物保留在安全区继续讲解', accent: '#a8ff47'}} />
    <Composition id="WidePresenterMediaCards" component={WidePresenterMediaCards} {...wide} defaultProps={{title: '同一个观点 用不同证据完成说服', cards: ['产品画面', '口播案例', '广告素材', '用户反馈'], accent: '#a8ff47'}} />
    <Composition id="WideCausalTagMap" component={WideCausalTagMap} {...wide} defaultProps={{pairs: [{from: '经验', to: 'Skill'}, {from: '流程', to: 'AI'}], outcome: '专注创意', accent: '#a8ff47'}} />
    <Composition id="WideGiantKeywordBackdrop" component={WideGiantKeywordBackdrop} {...wide} defaultProps={{keyword: '放大招', kicker: '人物、文字、界面各自动画', accent: '#ffe64f'}} />
    <Composition
      id="UiAeNeonPathPortrait"
      component={UiAeNeonPathSystem}
      durationInFrames={240}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        eyebrow: 'SYSTEM MOTION',
        title: 'Turn focus into flow',
        steps: ['Build structure', 'Create rhythm', 'Shape meaning'],
        accentA: '#725bff',
        accentB: '#27e7ff',
        accentC: '#ff3fb4',
      }}
    />
    <Composition
      id="UiAeNeonPathReplicaExact"
      component={UiAeNeonPathReplica}
      durationInFrames={1967}
      fps={60}
      width={1080}
      height={1920}
      defaultProps={{
        includeReferenceAudio: true,
      }}
    />
    <Composition
      id="UiAeNeonPathReplicaExactV3"
      component={UiAeNeonPathReplicaV3}
      durationInFrames={1967}
      fps={60}
      width={1080}
      height={1920}
      defaultProps={{
        includeReferenceAudio: true,
        motionBlurSamples: 8,
        shutterAngle: 180,
      }}
    />
    <Composition
      id="UiAeNeonMessageWide"
      component={UiAeNeonMessageJourney}
      durationInFrames={240}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        message: 'Your message',
        focusLabel: 'Focused',
        result: 'NATURAL RHYTHM',
        accentA: '#2de7ff',
        accentB: '#ff3aa7',
      }}
    />
    <Composition
      id="UiAeNeonMessagePortrait"
      component={UiAeNeonMessageJourney}
      durationInFrames={240}
      fps={30}
      width={1080}
      height={1440}
      defaultProps={{
        message: 'Your message',
        focusLabel: 'Focused',
        result: 'NATURAL RHYTHM',
        accentA: '#2de7ff',
        accentB: '#ff3aa7',
      }}
    />
    <Composition
      id="UiAePromptAgentFlow"
      component={UiAePromptAgentFlow}
      durationInFrames={240}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        prompt: 'Build a contract review agent that flags risky clauses.',
        agentName: 'Contract Review Agent',
        features: ['Create risk patterns', 'Import documents', 'Highlight risky clauses', 'Publish one-click workflow'],
        accent: '#26b9ee',
      }}
    />
    <Composition
      id="UiAeCardSwarmTimeline"
      component={UiAeCardSwarmTimeline}
      durationInFrames={240}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        brand: 'Motion Studio',
        title: 'Design moves',
        cardLabels: ['Type system', 'Mobile UI', 'Pitch deck', 'Brand film', 'Prototype', 'Campaign', 'Product', 'Story'],
        accent: '#45ee9b',
      }}
    />
    <Composition
      id="UiAeProductGridWorld"
      component={UiAeProductGridWorld}
      durationInFrames={240}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        brand: 'elyxir',
        statement: 'Make intelligence visible.',
        actions: ['Ask a question', 'Start a workflow', 'Generate an image', 'Analyze a document', 'Build an agent'],
        accent: '#4dff9b',
      }}
    />
    <Composition
      id="UiAeVoicePersonaFlow"
      component={UiAeVoicePersonaFlow}
      durationInFrames={240}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{
        title: 'Voice Library',
        persona: 'Aurora',
        clips: ['Confident intro', 'Warm explanation', 'Focused product demo'],
        accent: '#8fffea',
      }}
    />
    <Composition
      id="AeGlassDashboard"
      component={AeGlassDashboard}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{title: 'Financial overview', metric: '3,692', labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], accent: '#8c46ff'}}
    />
    <Composition
      id="AeOrganicGradientField"
      component={AeOrganicGradientField}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{title: 'Organic Motion', subtitle: 'PARAMETERIZED GRADIENT FIELD', colors: ['#54f0b4', '#646cff', '#ff4aa2'] as [string, string, string]}}
    />
    <Composition
      id="AeSaasKineticType"
      component={AeSaasKineticType}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{phrases: ['Meet the new way.', 'Build faster.', 'Ship clearly.', 'Scale together.'], kicker: 'SOFTWARE AS A SERVICE', accent: '#ff2cc3'}}
    />
    <Composition
      id="AeWebsitePerspectiveShowcase"
      component={AeWebsitePerspectiveShowcase}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{brand: 'Nova Studio', headline: 'Think better with an AI workspace.', features: ['Capture', 'Organize', 'Create'], accent: '#a75bff'}}
    />
    <Composition
      id="WideKnowledgeWorld"
      component={KnowledgeWorld}
      durationInFrames={srtTimeline.durationInFrames}
      fps={srtTimeline.fps}
      width={1920}
      height={1080}
      defaultProps={{
        timeline: srtTimeline,
        graph: defaultKnowledgeGraph,
        theme: 'studio' as const,
        showPresenter: true,
      }}
    />
    <Composition
      id="SrtDrivenVideo"
      component={SrtDrivenStudio}
      durationInFrames={srtTimeline.durationInFrames}
      fps={srtTimeline.fps}
      width={1920}
      height={1080}
      schema={SrtDrivenVideoSchema}
      defaultProps={{
        theme: 'studio' as const,
        title: 'SRT 驱动视频系统',
        captionBottom: 104,
        captionColor: '#fffdf7',
        showDebug: false,
      }}
    />
  </Folder>
);
