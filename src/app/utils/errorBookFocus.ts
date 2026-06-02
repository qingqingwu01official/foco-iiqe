/** 错题回看：完成页 → 错题刷题页（与错题本列表点节进入一致） */
export type ErrorReviewQuizTarget = {
  mode: 'basic' | 'sprint';
  sectionId: string;
  sectionName: string;
  chapterName?: string;
  libraryName?: string;
  displayTotalQ?: number;
};

const BASIC_SECTION_BY_NAME: Record<
  string,
  { id: string; chapterName: string; displayTotalQ: number }
> = {
  'A. 风险的概念': { id: '1a', chapterName: '第一章：风险及保险', displayTotalQ: 20 },
  'B. 风险的管理': { id: '1b', chapterName: '第一章：风险及保险', displayTotalQ: 91 },
  'A. 基础法律原则': { id: '2a', chapterName: '第二章：法律原则', displayTotalQ: 40 },
  'B. 合同法要点': { id: '2b', chapterName: '第二章：法律原则', displayTotalQ: 28 },
  'A. 可保利益': { id: '3a', chapterName: '第三章：保险原则', displayTotalQ: 30 },
  'B. 最大诚信': { id: '3b', chapterName: '第三章：保险原则', displayTotalQ: 25 },
  'A. 再保险机制': { id: '4a', chapterName: '第四章：再保险', displayTotalQ: 42 },
  'A. 监管框架': { id: '5a', chapterName: '第五章：保险监管', displayTotalQ: 38 },
  'A. 市场行为守则': { id: '6a', chapterName: '第六章：市场行为', displayTotalQ: 44 },
  'A. 条款解读': { id: '7a', chapterName: '第七章：保单条款', displayTotalQ: 36 },
};

const BASIC_CHAPTER_DEFAULT: Record<
  number,
  { sectionId: string; sectionName: string; chapterName: string; displayTotalQ: number }
> = {
  1: {
    sectionId: '1a',
    sectionName: 'A. 风险的概念',
    chapterName: '第一章：风险及保险',
    displayTotalQ: 20,
  },
  2: {
    sectionId: '2a',
    sectionName: 'A. 基础法律原则',
    chapterName: '第二章：法律原则',
    displayTotalQ: 40,
  },
  3: {
    sectionId: '3a',
    sectionName: 'A. 可保利益',
    chapterName: '第三章：保险原则',
    displayTotalQ: 30,
  },
  4: {
    sectionId: '4a',
    sectionName: 'A. 再保险机制',
    chapterName: '第四章：再保险',
    displayTotalQ: 42,
  },
  5: {
    sectionId: '5a',
    sectionName: 'A. 监管框架',
    chapterName: '第五章：保险监管',
    displayTotalQ: 38,
  },
  6: {
    sectionId: '6a',
    sectionName: 'A. 市场行为守则',
    chapterName: '第六章：市场行为',
    displayTotalQ: 44,
  },
  7: {
    sectionId: '7a',
    sectionName: 'A. 条款解读',
    chapterName: '第七章：保单条款',
    displayTotalQ: 36,
  },
};

const SPRINT_SECTION_LABEL: Record<string, string> = {
  'c-ch1': '第1章 风险的概念',
  'c-ch2': '第2章 法律规则',
  'i-ch1': '第1章 风险的概念',
  'i-ch2': '第2章 法律规则',
  'i-ch3': '第3章 保险原则',
  'n-ch1': '第1章 风险的概念',
  'n-ch2': '第2章 法律规则',
  'e-ch1': '第1章 风险的概念',
  'e-ch2': '第2章 法律规则',
};

const SPRINT_LIBRARY_PREFIX: Record<string, string> = {
  critical: 'c',
  important: 'i',
  normal: 'n',
  extra: 'e',
};

const SPRINT_LIBRARY_NAMES: Record<string, string> = {
  critical: '重中之重',
  important: '次重点',
  normal: '一般考点',
  extra: '补充考点',
};

const SPRINT_PREFIX_TO_LIBRARY: Record<string, string> = {
  c: 'critical',
  i: 'important',
  n: 'normal',
  e: 'extra',
};

const BASIC_SECTION_BY_ID: Record<
  string,
  { sectionName: string; chapterName: string; displayTotalQ: number }
> = Object.fromEntries(
  Object.entries(BASIC_SECTION_BY_NAME).map(([sectionName, meta]) => [
    meta.id,
    { sectionName, chapterName: meta.chapterName, displayTotalQ: meta.displayTotalQ },
  ]),
);

function sprintSubsectionId(libraryId: string, sectionName: string): string | undefined {
  const prefix = SPRINT_LIBRARY_PREFIX[libraryId];
  if (!prefix) return undefined;
  const match = sectionName.match(/第(\d+)章/);
  if (!match) return undefined;
  return `${prefix}-ch${match[1]}`;
}

function isBasicSectionId(routeId: string) {
  return /^\d[a-z]$/.test(routeId);
}

/** 根据刚完成的练习上下文，解析错题刷题页入口（sectionId + state） */
export function buildErrorReviewQuizTarget(params: {
  mode: string;
  routeId?: string;
  sectionName?: string;
  chapterName?: string;
  libraryName?: string;
}): ErrorReviewQuizTarget | null {
  const { mode, routeId, sectionName, chapterName, libraryName } = params;
  if (!routeId) return null;

  if (mode === 'basic') {
    if (sectionName && BASIC_SECTION_BY_NAME[sectionName]) {
      const hit = BASIC_SECTION_BY_NAME[sectionName];
      return {
        mode: 'basic',
        sectionId: hit.id,
        sectionName,
        chapterName: chapterName ?? hit.chapterName,
        displayTotalQ: hit.displayTotalQ,
      };
    }

    if (isBasicSectionId(routeId)) {
      const meta = BASIC_SECTION_BY_ID[routeId];
      return {
        mode: 'basic',
        sectionId: routeId,
        sectionName: sectionName ?? meta?.sectionName ?? routeId,
        chapterName: chapterName ?? meta?.chapterName,
        displayTotalQ: meta?.displayTotalQ ?? 20,
      };
    }

    const chapterNum = Number.parseInt(routeId, 10);
    if (!Number.isNaN(chapterNum) && BASIC_CHAPTER_DEFAULT[chapterNum]) {
      const d = BASIC_CHAPTER_DEFAULT[chapterNum];
      return {
        mode: 'basic',
        sectionId: d.sectionId,
        sectionName: sectionName ?? d.sectionName,
        chapterName: chapterName ?? d.chapterName,
        displayTotalQ: d.displayTotalQ,
      };
    }

    return null;
  }

  if (mode === 'sprint') {
    let sectionId = routeId;
    if (!routeId.includes('-ch')) {
      const mapped = sectionName ? sprintSubsectionId(routeId, sectionName) : undefined;
      if (!mapped) return null;
      sectionId = mapped;
    }

    const resolvedSectionName = sectionName ?? SPRINT_SECTION_LABEL[sectionId] ?? sectionId;
    const libKey =
      libraryName != null
        ? Object.entries(SPRINT_LIBRARY_NAMES).find(([, n]) => n === libraryName)?.[0]
        : routeId.includes('-ch')
          ? SPRINT_PREFIX_TO_LIBRARY[sectionId.split('-')[0]]
          : routeId;
    const resolvedLibraryName =
      libraryName ?? (libKey ? SPRINT_LIBRARY_NAMES[libKey] : undefined);

    return {
      mode: 'sprint',
      sectionId,
      sectionName: resolvedSectionName,
      libraryName: resolvedLibraryName,
      displayTotalQ: 20,
    };
  }

  return null;
}
