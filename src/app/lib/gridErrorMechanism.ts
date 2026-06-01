/**
 * 极简错题格子机制 · 本地演示用
 *
 * 状态：
 * - empty  灰色 · 未写（未进入错题池）
 * - active 红色数字 · 待消灭，数字 = 还需答对次数
 * - done   绿色 · 已掌握
 */

export type CellState = 'empty' | 'active' | 'done';

export interface GridCell {
  id: string;
  chapterId: string;
  index: number;
  topic: string;
  state: CellState;
  /** 还需答对几次才变绿；仅 active 时有效 */
  killsLeft: number;
}

export interface Chapter {
  id: string;
  name: string;
  label: string;
}

export const CHAPTERS: Chapter[] = [
  { id: 'ch1', name: '第一章', label: '风险与保险基础' },
  { id: 'ch2', name: '第二章', label: '保险合约' },
  { id: 'ch3', name: '第三章', label: '一般保险' },
];

const STORAGE_KEY = 'iiqe-grid-error-demo-v1';
const ROWS = 5;
const COLS = 10;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildInitialCells(): GridCell[] {
  const cells: GridCell[] = [];
  CHAPTERS.forEach((ch, ci) => {
    const rnd = seededRandom(1000 + ci * 97);
    for (let i = 0; i < ROWS * COLS; i++) {
      const r = rnd();
      let state: CellState = 'empty';
      let killsLeft = 0;
      if (r < 0.45) {
        state = 'empty';
      } else if (r < 0.75) {
        state = 'active';
        killsLeft = 1 + Math.floor(rnd() * 3);
      } else {
        state = 'done';
      }
      cells.push({
        id: `${ch.id}-${i}`,
        chapterId: ch.id,
        index: i,
        topic: `${ch.name} · 题 ${i + 1}`,
        state,
        killsLeft,
      });
    }
  });
  return cells;
}

export interface DemoState {
  cells: GridCell[];
  /** 消灭次数筛选：0 = 全部 */
  killFilter: 0 | 1 | 2 | 3;
  activeChapterId: string;
  /** 当前练题中的格子 id */
  practicingId: string | null;
}

function load(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed.cells?.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return {
    cells: buildInitialCells(),
    killFilter: 0,
    activeChapterId: 'ch1',
    practicingId: null,
  };
}

let state = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState() {
  return state;
}

export function resetDemo() {
  state = {
    cells: buildInitialCells(),
    killFilter: 0,
    activeChapterId: 'ch1',
    practicingId: null,
  };
  emit();
}

export function setKillFilter(filter: 0 | 1 | 2 | 3) {
  state = { ...state, killFilter: filter };
  emit();
}

export function setChapter(chapterId: string) {
  state = { ...state, activeChapterId: chapterId };
  emit();
}

export function openPractice(cellId: string) {
  state = { ...state, practicingId: cellId };
  emit();
}

export function closePractice() {
  state = { ...state, practicingId: null };
  emit();
}

/** 答对：消灭次数 -1，到 0 变绿 */
export function answerCorrect(cellId: string) {
  const cells = state.cells.map((c) => {
    if (c.id !== cellId) return c;
    if (c.state === 'empty') {
      return { ...c, state: 'done' as const, killsLeft: 0 };
    }
    if (c.state === 'active') {
      const next = c.killsLeft - 1;
      if (next <= 0) return { ...c, state: 'done' as const, killsLeft: 0 };
      return { ...c, killsLeft: next };
    }
    return c;
  });
  state = { ...state, cells, practicingId: null };
  emit();
}

/** 答错：未写 → 进入错题池(1次)；已激活 → +1 最多 3 */
export function answerWrong(cellId: string) {
  const cells = state.cells.map((c) => {
    if (c.id !== cellId) return c;
    if (c.state === 'done') {
      return { ...c, state: 'active' as const, killsLeft: 1 };
    }
    if (c.state === 'empty') {
      return { ...c, state: 'active' as const, killsLeft: 1 };
    }
    return { ...c, killsLeft: Math.min(3, c.killsLeft + 1) };
  });
  state = { ...state, cells, practicingId: null };
  emit();
}

export function stats(cells = state.cells) {
  const total = cells.length;
  const done = cells.filter((c) => c.state === 'done').length;
  const active = cells.filter((c) => c.state === 'active');
  const red = active.length;
  return { total, done, red, masterPct: total ? Math.round((done / total) * 100) : 0 };
}

export function chapterCells(chapterId: string, filter = state.killFilter) {
  let list = state.cells.filter((c) => c.chapterId === chapterId);
  if (filter > 0) {
    list = list.filter((c) => c.state === 'active' && c.killsLeft === filter);
  }
  return list;
}

/** 按优先级取下一道待消灭题：3 → 2 → 1 */
export function nextRedCellId(chapterId?: string): string | null {
  const pool = state.cells.filter((c) => {
    if (c.state !== 'active') return false;
    if (chapterId && c.chapterId !== chapterId) return false;
    return true;
  });
  if (!pool.length) return null;
  pool.sort((a, b) => b.killsLeft - a.killsLeft || a.index - b.index);
  return pool[0].id;
}

export const GRID_ROWS = ROWS;
export const GRID_COLS = COLS;
