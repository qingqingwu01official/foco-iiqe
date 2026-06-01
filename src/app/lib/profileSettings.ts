export type StudyDuration = '30' | '60' | '90' | '120';

export interface IiqeVolume {
  id: string;
  label: string;
  subjectName: string;
}

export const IIQE_VOLUMES: IiqeVolume[] = [
  { id: '卷一', label: '卷一', subjectName: '保险原理及实务' },
  { id: '卷二', label: '卷二', subjectName: '一般保险' },
  { id: '卷三', label: '卷三', subjectName: '长期保险' },
  { id: '卷四', label: '卷四', subjectName: '强制性公积金' },
  { id: '卷五', label: '卷五', subjectName: '投资相连长期保险' },
];

export const STUDY_DURATION_OPTIONS: { value: StudyDuration; label: string }[] = [
  { value: '30', label: '30 分钟' },
  { value: '60', label: '1 小时' },
  { value: '90', label: '1.5 小时' },
  { value: '120', label: '2 小时+' },
];

const EXAM_DATE_KEY = 'iiqe_exam_date';
const STUDY_DURATION_KEY = 'iiqe_study_duration';

function defaultExamDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function getExamDateIso(): string {
  const stored = localStorage.getItem(EXAM_DATE_KEY);
  if (stored && !Number.isNaN(Date.parse(stored))) return stored;
  const fallback = defaultExamDate();
  localStorage.setItem(EXAM_DATE_KEY, fallback);
  return fallback;
}

export function setExamDateIso(iso: string) {
  localStorage.setItem(EXAM_DATE_KEY, iso);
}

export function getDaysUntilExam(from = new Date()): number {
  const exam = new Date(getExamDateIso());
  exam.setHours(0, 0, 0, 0);
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function formatExamDate(iso: string): { main: string; weekday: string } {
  const d = new Date(iso);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return {
    main: `${y}年${m}月${day}日`,
    weekday: weekdays[d.getDay()],
  };
}

export function getStudyDuration(): StudyDuration {
  const v = localStorage.getItem(STUDY_DURATION_KEY) as StudyDuration | null;
  if (v && STUDY_DURATION_OPTIONS.some((o) => o.value === v)) return v;
  return '60';
}

export function setStudyDuration(value: StudyDuration) {
  localStorage.setItem(STUDY_DURATION_KEY, value);
}

export function computeDailyPlan(duration: StudyDuration) {
  const minutes = Number(duration);
  const total = Math.round((minutes / 60) * 45);
  const errorDigest = Math.min(127, Math.round(total * 0.6));
  const consolidate = Math.max(0, total - errorDigest);
  return { total, consolidate, errorDigest };
}

export function getCurrentVolumeId(): string {
  const raw = localStorage.getItem('iiqe_subject') || '卷一';
  const match = raw.match(/卷[一二三四五]/);
  return match?.[0] ?? '卷一';
}

export function setCurrentVolumeId(id: string) {
  const vol = IIQE_VOLUMES.find((v) => v.id === id);
  if (vol) {
    localStorage.setItem('iiqe_subject', `${vol.id} · ${vol.subjectName}`);
  }
}

export function getVolumeById(id: string): IiqeVolume {
  return IIQE_VOLUMES.find((v) => v.id === id) ?? IIQE_VOLUMES[0];
}
