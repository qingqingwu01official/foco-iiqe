export type QuizNoteRecord = {
  id: string;
  category: 'quiz';
  title: string;
  summary: string;
  body: string;
  meta: string;
  tags: string[];
  questionId: number;
  questionText: string;
  options: string[];
  topic?: string;
  returnPath: string;
  questionIndex: number;
  mode: 'basic' | 'sprint';
  chapterName?: string;
  sectionName?: string;
  createdAt: string;
};

const STORAGE_KEY = 'iiqe_quiz_notes';

export function loadQuizNotes(): QuizNoteRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QuizNoteRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveQuizNote(note: QuizNoteRecord) {
  const existing = loadQuizNotes();
  const next = [note, ...existing.filter((item) => item.id !== note.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return note;
}

export function createQuizNoteId() {
  return `qn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatQuizNoteMeta(createdAt: string, chapterName?: string) {
  const date = new Date(createdAt);
  const timeLabel = Number.isNaN(date.getTime())
    ? '刚刚'
    : date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return chapterName ? `${timeLabel} · 来自刷题 · ${chapterName}` : `${timeLabel} · 来自刷题页`;
}
