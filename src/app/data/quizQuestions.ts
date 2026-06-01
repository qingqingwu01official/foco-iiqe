import type { AnalysisSegment } from '../types/analysis';
import type { ExamMethod } from '../types/analysis';
import { SCENARIO_DEMO_QUESTIONS } from './demoScenarioQuiz';
import { CALCULATION_DEMO_QUESTIONS } from './demoCalculationQuiz';

export type QuizQuestion = {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correct: number;
  analysis: string;
  analysisSegments?: AnalysisSegment[];
  examMethod?: ExamMethod;
  isHard?: boolean;
  isEasyMistake?: boolean;
  /** 题型标签，参考布局下展示为「(单选题)」等 */
  questionType?: string;
  /** 全站作答次数（答题后数据板块） */
  siteAttempts?: number;
  /** 全站正确率 0–100 */
  siteAccuracy?: number;
};

/** 章节刷题默认题库（常规考察方式） */
export const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    topic: '风险管理的三种含义',
    isHard: true,
    isEasyMistake: false,
    question: '下列哪一项不属于风险管理的核心内容？',
    options: ['A. 风险识别', 'B. 风险评估', 'C. 风险投机', 'D. 风险应对'],
    correct: 2,
    analysis:
      '风险管理的核心内容包括：风险识别、风险评估、风险应对和风险监控四个主要环节。\n\n风险投机是指通过承担风险来获取收益的行为，这不属于风险管理的范畴。',
    analysisSegments: [
      {
        id: 's1',
        field: '解题',
        content:
          '「风险投机」是典型干扰项：题干问「不属于」，易误选看似与「风险」相关、实则属收益导向的表述。',
      },
      {
        id: 's2',
        field: '知识块',
        content:
          '风险管理的核心包括：风险识别、风险评估、风险应对、风险监控。风险投机是通过承担风险博取收益，不属于管理流程。',
      },
      { id: 's3', field: '选项分析', optionKey: 'A', content: 'A「风险识别」属于风险管理第一步。' },
      { id: 's4', field: '选项分析', optionKey: 'B', content: 'B「风险评估」是核心环节之一。' },
      {
        id: 's5',
        field: '选项分析',
        optionKey: 'C',
        content: 'C「风险投机」是本题干扰项，易与「风险承担」混淆。',
      },
      { id: 's6', field: '选项分析', optionKey: 'D', content: 'D「风险应对」属于标准风险管理流程。' },
    ],
  },
  {
    id: 2,
    topic: '最大诚信原则',
    isHard: false,
    isEasyMistake: true,
    question: '根据最大诚信原则，投保人对保险公司负有以下哪项主要义务？',
    options: ['A. 支付保费', 'B. 如实告知', 'C. 选择最优计划', 'D. 提交年度报告'],
    correct: 1,
    analysis:
      '最大诚信原则要求投保人主动、如实披露所有重要事实。若有隐瞒或虚报，保险公司有权撤销合同。',
    analysisSegments: [
      {
        id: 's1',
        field: '知识块',
        content:
          '最大诚信（Utmost Good Faith）下，投保人须主动、如实告知重要事实（Material Facts），包括健康、职业、既往病史等。',
      },
      { id: 's2', field: '选项分析', optionKey: 'A', content: 'A「支付保费」是合同义务，但不是最大诚信的核心。' },
      { id: 's3', field: '选项分析', optionKey: 'B', content: 'B「如实告知」为正确答案。' },
      { id: 's4', field: '选项分析', optionKey: 'C', content: 'C「选择最优计划」与诚信原则无关。' },
      { id: 's5', field: '选项分析', optionKey: 'D', content: 'D「提交年度报告」非告知义务。' },
    ],
  },
  {
    id: 3,
    topic: '可保利益原则',
    isHard: true,
    isEasyMistake: false,
    question: '下列哪种情况下，投保人对被保险人具有可保利益？',
    options: [
      'A. 投保人与被保险人是邻居',
      'B. 投保人是被保险人的配偶',
      'C. 投保人曾是被保险人的雇主',
      'D. 投保人认识被保险人超过十年',
    ],
    correct: 1,
    analysis: '可保利益要求合法的经济利益关系。配偶之间天然具有可保利益。',
    analysisSegments: [
      {
        id: 's1',
        field: '知识块',
        content: '可保利益（Insurable Interest）指对标的的生命或财产具有合法经济利益。配偶关系通常天然成立。',
      },
      { id: 's2', field: '选项分析', optionKey: 'A', content: 'A「邻居」通常不构成可保利益。' },
      { id: 's3', field: '选项分析', optionKey: 'B', content: 'B「配偶」关系满足可保利益。' },
      { id: 's4', field: '选项分析', optionKey: 'C', content: 'C「前雇主」需证明具体经济依存才成立。' },
      { id: 's5', field: '选项分析', optionKey: 'D', content: 'D「认识十年」不等于可保利益。' },
    ],
  },
  {
    id: 4,
    topic: '代位追偿原则',
    isHard: false,
    isEasyMistake: false,
    question: '代位追偿原则适用于以下哪种类型的保险？',
    options: ['A. 人寿保险', 'B. 财产保险', 'C. 以上均适用', 'D. 以上均不适用'],
    correct: 1,
    analysis: '代位追偿主要适用于财产保险，不适用于人寿保险。',
    analysisSegments: [
      {
        id: 's1',
        field: '知识块',
        content: '代位追偿（Subrogation）：保险人赔付后，取得向第三方追偿的权利，避免被保险人双重获益。',
      },
      { id: 's2', field: '选项分析', optionKey: 'A', content: 'A「人寿保险」不适用代位追偿。' },
      { id: 's3', field: '选项分析', optionKey: 'B', content: 'B「财产保险」为正确选项。' },
      { id: 's4', field: '选项分析', optionKey: 'C', content: 'C「以上均适用」错误。' },
      { id: 's5', field: '选项分析', optionKey: 'D', content: 'D「以上均不适用」错误。' },
    ],
  },
  {
    id: 5,
    topic: '保险合同的基本要素',
    isHard: false,
    isEasyMistake: false,
    question: '在保险合同中，以下哪项不属于合同的基本要素？',
    options: ['A. 要约与承诺', 'B. 对价（Consideration）', 'C. 可保利益', 'D. 保险费率'],
    correct: 3,
    analysis: '保险费率属商业定价条款，不是合同生效的法律必要条件。',
    analysisSegments: [
      {
        id: 's1',
        field: '知识块',
        content: '基本法律要素：要约与承诺、对价、行为能力、可保利益。保险费率是商业条款，非生效必要条件。',
      },
      { id: 's2', field: '选项分析', optionKey: 'A', content: 'A「要约与承诺」是基本要素。' },
      { id: 's3', field: '选项分析', optionKey: 'B', content: 'B「对价」是基本要素。' },
      { id: 's4', field: '选项分析', optionKey: 'C', content: 'C「可保利益」是基本要素。' },
      {
        id: 's5',
        field: '选项分析',
        optionKey: 'D',
        content: 'D「保险费率」属商业条款，不是合同生效的法律必要条件。',
      },
    ],
  },
];

/** 第一章完整刷题序列：常规 5 题 + 情境应用 + 计算应用例题 */
export const CHAPTER_1_QUESTIONS: QuizQuestion[] = [
  ...QUESTIONS,
  ...SCENARIO_DEMO_QUESTIONS,
  ...CALCULATION_DEMO_QUESTIONS,
];

/** 按章节 id 选用题库（未配置章节仍用默认 QUESTIONS） */
export const QUESTIONS_BY_CHAPTER: Record<string, QuizQuestion[]> = {
  '1': CHAPTER_1_QUESTIONS,
};
