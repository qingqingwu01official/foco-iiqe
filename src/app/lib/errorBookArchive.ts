export type ErrorBookMode = 'basic' | 'sprint';
export type ErrorBookBucket = 'pending' | 'archivable' | 'mastered';
export type MasteryProgress = 0 | 1 | 2 | 3;

type PersistedItemState = {
  masteryProgress: MasteryProgress;
  archived: boolean;
};

type PersistedStore = Record<string, PersistedItemState>;

export type ErrorBookItemState = PersistedItemState & {
  canArchive: boolean;
  bucket: ErrorBookBucket;
};

const STORAGE_KEY = 'iiqe-error-book-archive-v1';

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
    return { masteryProgress: 0, archived: false };
  }
  return {
    masteryProgress: clampProgress(item.masteryProgress),
    archived: Boolean(item.archived),
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
  };
  store[itemKey] = next;
  writeStore(store);
  return withComputed(next);
}

export function getErrorBookSectionBucket(params: {
  mode: ErrorBookMode;
  sectionId: string;
  questionIds: number[];
}): ErrorBookBucket {
  const { mode, sectionId, questionIds } = params;
  if (questionIds.length === 0) return 'pending';

  let hasArchivable = false;
  let allMastered = true;

  for (const questionId of questionIds) {
    const state = getErrorBookItemState({ mode, sectionId, questionId });
    if (state.bucket !== 'mastered') {
      allMastered = false;
    }
    if (state.bucket === 'archivable') {
      hasArchivable = true;
    }
  }

  if (allMastered) return 'mastered';
  if (hasArchivable) return 'archivable';
  return 'pending';
}
