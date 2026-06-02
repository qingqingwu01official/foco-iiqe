export type ErrorBookMode = 'basic' | 'sprint';
/** 单题归档状态（刷题页仍可出现「可归档」） */
export type ErrorBookBucket = 'pending' | 'archivable' | 'mastered';
/** 错题本列表页分段（无「可归档」Tab：未点归档的达标题仍在待复习） */
export type ErrorBookListFilter = 'pending' | 'mastered';
export type MasteryProgress = 0 | 1 | 2 | 3;

type PersistedItemState = {
  masteryProgress: MasteryProgress;
  archived: boolean;
  /** 自「已掌握」答错复活，刷题页展示「反复错」 */
  repeatedWrong?: boolean;
};

type PersistedStore = Record<string, PersistedItemState>;

export type ErrorBookItemState = PersistedItemState & {
  canArchive: boolean;
  bucket: ErrorBookBucket;
  repeatedWrong: boolean;
};

const STORAGE_KEY = 'iiqe-error-book-archive-v1';
const DEMO_SEED_KEY = 'iiqe-error-book-list-demo-v3';

function clampProgress(value: number): MasteryProgress {
  if (value <= 0) return 0;
  if (value === 1) return 1;
  if (value === 2) return 2;
  return 3;
}

function keyOf(mode: ErrorBookMode, sectionId: string, questionId: number) {
  return `${mode}:${sectionId}:${questionId}`;
}

function readStore(): PersistedStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersistedStore;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeStore(store: PersistedStore) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore localStorage errors in prototype mode
  }
}

function sanitize(item?: PersistedItemState): PersistedItemState {
  if (!item) {
    return { masteryProgress: 0, archived: false, repeatedWrong: false };
  }
  return {
    masteryProgress: clampProgress(item.masteryProgress),
    archived: Boolean(item.archived),
    repeatedWrong: Boolean(item.repeatedWrong),
  };
}

function toBucket(item: PersistedItemState): ErrorBookBucket {
  if (item.archived) return 'mastered';
  if (item.masteryProgress >= 3) return 'archivable';
  return 'pending';
}

function withComputed(item: PersistedItemState): ErrorBookItemState {
  const safe = sanitize(item);
  return {
    ...safe,
    repeatedWrong: Boolean(safe.repeatedWrong),
    canArchive: !safe.archived && safe.masteryProgress >= 3,
    bucket: toBucket(safe),
  };
}

export function getErrorBookItemState(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questionId: number;
}): ErrorBookItemState {
  const { mode, sectionId, questionId } = params;
  const store = readStore();
  const item = sanitize(store[keyOf(mode, sectionId, questionId)]);
  return withComputed(item);
}

export function recordErrorBookAnswer(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questionId: number;
  isCorrect: boolean;
}): { state: ErrorBookItemState; revivedFromMastered: boolean } {
  const { mode, sectionId, questionId, isCorrect } = params;
  const store = readStore();
  const itemKey = keyOf(mode, sectionId, questionId);
  const current = sanitize(store[itemKey]);

  const revivedFromMastered = !isCorrect && current.archived;
  let next: PersistedItemState;

  if (isCorrect) {
    if (current.archived) {
      next = current;
    } else {
      next = {
        masteryProgress: clampProgress(current.masteryProgress + 1),
        archived: false,
      };
    }
  } else {
    next = {
      masteryProgress: 0,
      archived: false,
      repeatedWrong: revivedFromMastered ? true : Boolean(current.repeatedWrong),
    };
  }

  store[itemKey] = next;
  writeStore(store);

  return { state: withComputed(next), revivedFromMastered };
}

export function archiveErrorBookItem(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questionId: number;
}): ErrorBookItemState {
  const { mode, sectionId, questionId } = params;
  const store = readStore();
  const itemKey = keyOf(mode, sectionId, questionId);
  const next: PersistedItemState = {
    masteryProgress: 3,
    archived: true,
    repeatedWrong: false,
  };
  store[itemKey] = next;
  writeStore(store);
  return withComputed(next);
}

export function getErrorBookItemListFilter(state: ErrorBookItemState): ErrorBookListFilter {
  // 列表分段以 archived 为准：已归档 → 已掌握错题；否则 → 待复习（含 archivable）
  return state.archived ? 'mastered' : 'pending';
}

/** 错题本刷题：按列表分段（待复习 / 已掌握）筛选题目 */
export function filterQuizQuestionsForErrorBookList<T extends { id: number }>(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questions: T[];
  listFilter: ErrorBookListFilter;
}): T[] {
  const { mode, sectionId, questions, listFilter } = params;
  return questions.filter((q) => {
    const state = getErrorBookItemState({ mode, sectionId, questionId: q.id });
    return getErrorBookItemListFilter(state) === listFilter;
  });
}

/** 列表分段：达标未归档（archivable）与待复习合并为 pending */
export function getErrorBookSectionListBucket(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questionIds: number[];
}): ErrorBookListFilter {
  const { mode, sectionId, questionIds } = params;
  if (questionIds.length === 0) return 'pending';

  for (const questionId of questionIds) {
    const state = getErrorBookItemState({ mode, sectionId, questionId });
    if (getErrorBookItemListFilter(state) === 'pending') {
      return 'pending';
    }
  }
  return 'mastered';
}

/** 该节是否含有当前分段下的错题（支持一节内待复习/已掌握并存） */
export function sectionHasQuestionsInListFilter(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questionIds: number[];
  listFilter: ErrorBookListFilter;
}): boolean {
  const { mode, sectionId, questionIds, listFilter } = params;
  for (const questionId of questionIds) {
    const state = getErrorBookItemState({ mode, sectionId, questionId });
    if (getErrorBookItemListFilter(state) === listFilter) {
      return true;
    }
  }
  return false;
}

/** 距归档还需答对的次数（3 - masteryProgress） */
export function remainingCorrectToArchive(progress: MasteryProgress, archived: boolean) {
  if (archived) return 0;
  return Math.max(0, 3 - progress);
}

export function countSectionQuestionsByRemainingCorrect(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questionIds: number[];
  listFilter: ErrorBookListFilter;
  /** 1 = 再做对 1 次；2 = 再做对 2 次 */
  remainingCorrect: 1 | 2;
}): number {
  const { mode, sectionId, questionIds, listFilter, remainingCorrect } = params;
  let count = 0;
  for (const questionId of questionIds) {
    const state = getErrorBookItemState({ mode, sectionId, questionId });
    if (getErrorBookItemListFilter(state) !== listFilter) continue;
    if (state.archived) continue;
    if (remainingCorrectToArchive(state.masteryProgress, state.archived) === remainingCorrect) {
      count += 1;
    }
  }
  return count;
}

export type SectionMasterySummary = {
  totalInFilter: number;
  needOneMore: number;
  needTwoMore: number;
  masterySum: number;
  repeatedWrong: number;
};

export function summarizeSectionMasteryInListFilter(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questionIds: number[];
  listFilter: ErrorBookListFilter;
}): SectionMasterySummary {
  const { mode, sectionId, questionIds, listFilter } = params;
  let totalInFilter = 0;
  let needOneMore = 0;
  let needTwoMore = 0;
  let masterySum = 0;
  let repeatedWrong = 0;

  for (const questionId of questionIds) {
    const state = getErrorBookItemState({ mode, sectionId, questionId });
    if (getErrorBookItemListFilter(state) !== listFilter) continue;
    totalInFilter += 1;
    if (state.archived) continue;
    if (state.repeatedWrong) repeatedWrong += 1;
    const remain = remainingCorrectToArchive(state.masteryProgress, state.archived);
    masterySum += state.masteryProgress;
    if (remain === 1) needOneMore += 1;
    else if (remain === 2) needTwoMore += 1;
  }

  return { totalInFilter, needOneMore, needTwoMore, masterySum, repeatedWrong };
}

export function countSectionQuestionsInListFilter(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questionIds: number[];
  listFilter: ErrorBookListFilter;
}): number {
  const { mode, sectionId, questionIds, listFilter } = params;
  let count = 0;
  for (const questionId of questionIds) {
    const state = getErrorBookItemState({ mode, sectionId, questionId });
    if (getErrorBookItemListFilter(state) === listFilter) {
      count += 1;
    }
  }
  return count;
}

/** 原型演示：写入部分已掌握错题，便于「已掌握」列表非空 */
export function ensureErrorBookListDemoSeed() {
  if (typeof window === 'undefined') return;

  if (!window.localStorage.getItem(DEMO_SEED_KEY)) {
    const store = readStore();
    const archived = (mode: ErrorBookMode, sectionId: string, questionId: number) => {
      store[keyOf(mode, sectionId, questionId)] = {
        masteryProgress: 3,
        archived: true,
      };
    };

    archived('basic', '1a', 1);
    archived('basic', '2a', 2);
    archived('basic', '3b', 3);
    archived('sprint', 'c-ch1', 1);
    archived('sprint', 'i-ch1', 2);

    writeStore(store);
    window.localStorage.setItem(DEMO_SEED_KEY, '1');
  }

  ensureRevivalDemoQuestion();
}

/** 演示复活题：basic · 1a · 第 2 题（未归档时写入，不覆盖用户已练进度） */
export function ensureRevivalDemoQuestion() {
  if (typeof window === 'undefined') return;
  const store = readStore();
  const revivalKey = keyOf('basic', '1a', 2);
  const existing = store[revivalKey];
  if (existing?.archived) return;
  if (existing && !existing.repeatedWrong && existing.masteryProgress > 1) return;
  store[revivalKey] = {
    masteryProgress: existing?.masteryProgress ?? 1,
    archived: false,
    repeatedWrong: true,
  };
  writeStore(store);
}

export function countErrorBookQuestionsByListFilter(params: {
  mode: ErrorBookMode;
  sections: Array<{ sectionId: string; questionIds: number[] }>;
  listFilter: ErrorBookListFilter;
}): number {
  const { mode, sections, listFilter } = params;
  let count = 0;
  for (const { sectionId, questionIds } of sections) {
    for (const questionId of questionIds) {
      const state = getErrorBookItemState({ mode, sectionId, questionId });
      if (getErrorBookItemListFilter(state) === listFilter) {
        count += 1;
      }
    }
  }
  return count;
}

/** @deprecated 列表请用 getErrorBookSectionListBucket */
export function getErrorBookSectionBucket(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questionIds: number[];
}): ErrorBookBucket {
  const list = getErrorBookSectionListBucket(params);
  if (list === 'mastered') return 'mastered';
  const { mode, sectionId, questionIds } = params;
  for (const questionId of questionIds) {
    const state = getErrorBookItemState({ mode, sectionId, questionId });
    if (state.bucket === 'archivable') return 'archivable';
  }
  return 'pending';
}
