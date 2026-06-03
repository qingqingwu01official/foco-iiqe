export type ErrorBookMode = 'basic' | 'sprint';
/** 单题归档状态（刷题页仍可出现「可归档」） */
export type ErrorBookBucket = 'pending' | 'archivable' | 'mastered';
/** 错题本列表页分段（无「可归档」Tab：未点归档的达标题仍在待复习） */
export type ErrorBookListFilter = 'pending' | 'mastered';
export type MasteryProgress = 0 | 1 | 2 | 3;

/** 累计答错超过此次数 →「反复错」 */
export const REPEATED_WRONG_THRESHOLD = 5;

type PersistedItemState = {
  masteryProgress: MasteryProgress;
  archived: boolean;
  /** 累计答错次数（跨章节/分重点/错题本统一累计） */
  wrongCount: number;
  /** 已掌握后再次答错 →「复活题」（与反复错独立，不因 wrongCount>5 自动置 true） */
  revived?: boolean;
};

type PersistedStore = Record<string, PersistedItemState>;

export type ErrorBookItemState = PersistedItemState & {
  canArchive: boolean;
  bucket: ErrorBookBucket;
  /** wrongCount > REPEATED_WRONG_THRESHOLD */
  repeatedWrong: boolean;
  /** 已掌握后答错复活（刷题页标题行右侧「复活题」角标） */
  revived: boolean;
};

const STORAGE_KEY = 'iiqe-error-book-archive-v2';
const LEGACY_STORAGE_KEY = 'iiqe-error-book-archive-v1';
const DEMO_SEED_KEY = 'iiqe-error-book-list-demo-v3';

function clampProgress(value: number): MasteryProgress {
  if (value <= 0) return 0;
  if (value === 1) return 1;
  if (value === 2) return 2;
  return 3;
}

/** 按题目 ID 全局唯一（不区分章节/分重点/错题本入口） */
function questionKey(questionId: number) {
  return `q:${questionId}`;
}

function isRepeatedWrong(wrongCount: number): boolean {
  return wrongCount > REPEATED_WRONG_THRESHOLD;
}

function sanitize(item?: Partial<PersistedItemState>): PersistedItemState {
  if (!item) {
    return { masteryProgress: 0, archived: false, wrongCount: 0, revived: false };
  }
  const wrongCount = Math.max(0, Math.floor(Number(item.wrongCount) || 0));
  return {
    masteryProgress: clampProgress(item.masteryProgress ?? 0),
    archived: Boolean(item.archived),
    wrongCount,
    revived: Boolean(item.revived),
  };
}

function mergePersisted(a: PersistedItemState, b: PersistedItemState): PersistedItemState {
  const merged = sanitize({
    masteryProgress: Math.max(a.masteryProgress, b.masteryProgress) as MasteryProgress,
    archived: a.archived && b.archived,
    wrongCount: Math.max(a.wrongCount, b.wrongCount),
    revived: a.revived || b.revived,
  });
  if (!merged.archived && (a.archived !== b.archived)) {
    merged.archived = false;
  }
  return merged;
}

function migrateLegacyStore(legacy: PersistedStore): PersistedStore {
  const next: PersistedStore = {};
  for (const [key, raw] of Object.entries(legacy)) {
    const parts = key.split(':');
    const qid = Number(parts[parts.length - 1]);
    if (!Number.isFinite(qid)) continue;
    const nk = questionKey(qid);
    const item = sanitize({
      masteryProgress: raw.masteryProgress,
      archived: raw.archived,
      wrongCount: (raw as { wrongCount?: number }).wrongCount ?? 0,
      revived: Boolean((raw as { revived?: boolean }).revived),
    });
    if (isRepeatedWrong(item.wrongCount) || (raw as { repeatedWrong?: boolean }).repeatedWrong) {
      item.wrongCount = Math.max(item.wrongCount, REPEATED_WRONG_THRESHOLD + 1);
    }
    if (next[nk]) {
      next[nk] = mergePersisted(next[nk], item);
    } else {
      next[nk] = item;
    }
  }
  return next;
}

function readStore(): PersistedStore {
  if (typeof window === 'undefined') return {};
  try {
    const rawV2 = window.localStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as PersistedStore;
      if (parsed && typeof parsed === 'object') return parsed;
    }
    const rawV1 = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!rawV1) return {};
    const legacy = JSON.parse(rawV1) as PersistedStore;
    const migrated = migrateLegacyStore(legacy);
    writeStore(migrated);
    return migrated;
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

function toBucket(item: PersistedItemState): ErrorBookBucket {
  if (item.archived) return 'mastered';
  if (item.masteryProgress >= 3) return 'archivable';
  return 'pending';
}

function withComputed(item: PersistedItemState): ErrorBookItemState {
  const safe = sanitize(item);
  return {
    ...safe,
    revived: Boolean(safe.revived),
    repeatedWrong: isRepeatedWrong(safe.wrongCount),
    canArchive: !safe.archived && safe.masteryProgress >= 3,
    bucket: toBucket(safe),
  };
}

/** 该题是否已有错题本跟踪记录（任意入口刷过并写入） */
export function isQuestionTracked(questionId: number): boolean {
  const store = readStore();
  return questionKey(questionId) in store;
}

export function getErrorBookItemState(params: {
  mode?: ErrorBookMode;
  sectionId?: string;
  questionId: number;
}): ErrorBookItemState {
  const { questionId } = params;
  const store = readStore();
  const item = sanitize(store[questionKey(questionId)]);
  return withComputed(item);
}

export function recordErrorBookAnswer(params: {
  mode?: ErrorBookMode;
  sectionId?: string;
  questionId: number;
  isCorrect: boolean;
}): { state: ErrorBookItemState; revivedFromMastered: boolean } {
  const { questionId, isCorrect } = params;
  const store = readStore();
  const itemKey = questionKey(questionId);
  const current = sanitize(store[itemKey]);

  const revivedFromMastered = !isCorrect && current.archived;
  let next: PersistedItemState;

  if (isCorrect) {
    if (current.archived) {
      next = current;
    } else if (!isQuestionTracked(questionId) && current.wrongCount === 0) {
      return { state: withComputed(current), revivedFromMastered: false };
    } else {
      next = {
        ...current,
        masteryProgress: clampProgress(current.masteryProgress + 1),
        archived: false,
      };
    }
  } else {
    const wrongCount = (store[itemKey] ? current.wrongCount : 0) + 1;
    next = {
      masteryProgress: 0,
      archived: false,
      wrongCount,
      revived: revivedFromMastered ? true : Boolean(current.revived),
    };
  }

  store[itemKey] = next;
  writeStore(store);

  return { state: withComputed(next), revivedFromMastered };
}

export function archiveErrorBookItem(params: {
  mode?: ErrorBookMode;
  sectionId?: string;
  questionId: number;
}): ErrorBookItemState {
  const { questionId } = params;
  const store = readStore();
  const itemKey = questionKey(questionId);
  const prev = sanitize(store[itemKey]);
  const next: PersistedItemState = {
    masteryProgress: 3,
    archived: true,
    wrongCount: prev.wrongCount,
    revived: false,
  };
  store[itemKey] = next;
  writeStore(store);
  return withComputed(next);
}

export function getErrorBookItemListFilter(state: ErrorBookItemState): ErrorBookListFilter {
  return state.archived ? 'mastered' : 'pending';
}

/** 错题本刷题：按列表分段（待复习 / 已掌握）筛选题目 */
export function filterQuizQuestionsForErrorBookList<T extends { id: number }>(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questions: T[];
  listFilter: ErrorBookListFilter;
}): T[] {
  const { questions, listFilter } = params;
  return questions.filter((q) => {
    if (!isQuestionTracked(q.id)) return false;
    const state = getErrorBookItemState({ questionId: q.id });
    return getErrorBookItemListFilter(state) === listFilter;
  });
}

export function getErrorBookSectionListBucket(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questionIds: number[];
}): ErrorBookListFilter {
  const { questionIds } = params;
  if (questionIds.length === 0) return 'pending';

  for (const questionId of questionIds) {
    if (!isQuestionTracked(questionId)) continue;
    const state = getErrorBookItemState({ questionId });
    if (getErrorBookItemListFilter(state) === 'pending') {
      return 'pending';
    }
  }
  return 'mastered';
}

export function sectionHasQuestionsInListFilter(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questionIds: number[];
  listFilter: ErrorBookListFilter;
}): boolean {
  const { questionIds, listFilter } = params;
  for (const questionId of questionIds) {
    if (!isQuestionTracked(questionId)) continue;
    const state = getErrorBookItemState({ questionId });
    if (getErrorBookItemListFilter(state) === listFilter) {
      return true;
    }
  }
  return false;
}

export function remainingCorrectToArchive(progress: MasteryProgress, archived: boolean) {
  if (archived) return 0;
  return Math.max(0, 3 - progress);
}

export function countSectionQuestionsByRemainingCorrect(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questionIds: number[];
  listFilter: ErrorBookListFilter;
  remainingCorrect: 1 | 2 | 3;
}): number {
  const { questionIds, listFilter, remainingCorrect } = params;
  let count = 0;
  for (const questionId of questionIds) {
    if (!isQuestionTracked(questionId)) continue;
    const state = getErrorBookItemState({ questionId });
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
  needThreeMore: number;
  needTwoMore: number;
  needOneMore: number;
  masterySum: number;
  repeatedWrong: number;
};

export function summarizeSectionMasteryInListFilter(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questionIds: number[];
  listFilter: ErrorBookListFilter;
}): SectionMasterySummary {
  const { questionIds, listFilter } = params;
  let totalInFilter = 0;
  let needThreeMore = 0;
  let needTwoMore = 0;
  let needOneMore = 0;
  let masterySum = 0;
  let repeatedWrong = 0;

  for (const questionId of questionIds) {
    if (!isQuestionTracked(questionId)) continue;
    const state = getErrorBookItemState({ questionId });
    if (getErrorBookItemListFilter(state) !== listFilter) continue;
    totalInFilter += 1;
    if (state.archived) continue;
    if (state.repeatedWrong) repeatedWrong += 1;
    const remain = remainingCorrectToArchive(state.masteryProgress, state.archived);
    masterySum += state.masteryProgress;
    if (remain === 3) needThreeMore += 1;
    else if (remain === 2) needTwoMore += 1;
    else if (remain === 1) needOneMore += 1;
  }

  return { totalInFilter, needThreeMore, needTwoMore, needOneMore, masterySum, repeatedWrong };
}

export function countSectionQuestionsInListFilter(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questionIds: number[];
  listFilter: ErrorBookListFilter;
}): number {
  const { questionIds, listFilter } = params;
  let count = 0;
  for (const questionId of questionIds) {
    if (!isQuestionTracked(questionId)) continue;
    const state = getErrorBookItemState({ questionId });
    if (getErrorBookItemListFilter(state) === listFilter) {
      count += 1;
    }
  }
  return count;
}

export function ensureErrorBookListDemoSeed() {
  if (typeof window === 'undefined') return;

  if (!window.localStorage.getItem(DEMO_SEED_KEY)) {
    const store = readStore();
    const archived = (questionId: number) => {
      store[questionKey(questionId)] = {
        masteryProgress: 3,
        archived: true,
        wrongCount: 0,
        revived: false,
      };
    };

    archived(1);
    archived(2);
    archived(3);
    writeStore(store);
    window.localStorage.setItem(DEMO_SEED_KEY, '1');
  }

  ensureRevivalDemoQuestion();
}

/** 演示复活题：题目 id=2，标题行「复活题」角标（未达反复错阈值） */
export function ensureRevivalDemoQuestion() {
  if (typeof window === 'undefined') return;
  const store = readStore();
  const revivalKey = questionKey(2);
  const existing = store[revivalKey];
  if (existing?.archived) return;
  if (existing && existing.wrongCount > REPEATED_WRONG_THRESHOLD) return;
  if (existing && !existing.revived && existing.masteryProgress > 1) return;
  store[revivalKey] = {
    masteryProgress: existing?.masteryProgress ?? 1,
    archived: false,
    wrongCount: existing?.wrongCount ?? 2,
    revived: true,
  };
  writeStore(store);
}

export function countErrorBookQuestionsByListFilter(params: {
  mode: ErrorBookMode;
  sections: Array<{ sectionId: string; questionIds: number[] }>;
  listFilter: ErrorBookListFilter;
}): number {
  const { sections, listFilter } = params;
  let count = 0;
  for (const { questionIds } of sections) {
    for (const questionId of questionIds) {
      if (!isQuestionTracked(questionId)) continue;
      const state = getErrorBookItemState({ questionId });
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
  const { questionIds } = params;
  for (const questionId of questionIds) {
    const state = getErrorBookItemState({ questionId });
    if (state.bucket === 'archivable') return 'archivable';
  }
  return 'pending';
}
