import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { loadQuizNotes, type QuizNoteRecord } from '../lib/quizNotes';
import { QUESTIONS } from '../data/quizQuestions';

type Stage = 'list' | 'detail' | 'edit' | 'chat' | 'preview' | 'added';
type FilterTab = '全部' | '刷题笔记' | '答疑笔记' | '不懂';
type NoteCategory = 'qa' | 'quiz';
type UnderstandingStatus = 'confused' | 'understood';

interface QuizNoteLink {
  questionText: string;
  options: string[];
  topic?: string;
  returnPath: string;
  questionIndex: number;
  mode: 'basic' | 'sprint';
  chapterName?: string;
  sectionName?: string;
}

interface NoteItem {
  id: string;
  title: string;
  summary: string;
  meta?: string;
  source?: string;
  tagLine?: string;
  tags?: string[];
  category: NoteCategory;
  body?: string;
  quizLink?: QuizNoteLink;
}

const FILTER_TABS: FilterTab[] = ['全部', '刷题笔记', '答疑笔记', '不懂'];
const UNDERSTANDING_STORAGE_KEY = 'iiqe_note_understanding';

const CATEGORY_LABEL: Record<NoteCategory, string> = {
  quiz: '刷题笔记',
  qa: '答疑笔记',
};

function loadUnderstanding(): Record<string, UnderstandingStatus> {
  try {
    const raw = localStorage.getItem(UNDERSTANDING_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, UnderstandingStatus>;
  } catch {
    return {};
  }
}

function notesForTab(tab: FilterTab, understanding: Record<string, UnderstandingStatus>, notes: NoteItem[]): NoteItem[] {
  switch (tab) {
    case '刷题笔记':
      return notes.filter((note) => note.category === 'quiz');
    case '答疑笔记':
      return notes.filter((note) => note.category === 'qa');
    case '不懂':
      return notes.filter((note) => understanding[note.id] === 'confused');
    default:
      return notes;
  }
}

function supportsUnderstanding(note: NoteItem) {
  return note.category === 'quiz' || note.category === 'qa';
}

const STAGE_CONTEXT: Record<Stage, string> = {
  list: '笔记列表',
  detail: '笔记详情',
  edit: '笔记编辑',
  chat: '答疑',
  preview: '整理预览',
  added: '已添加进笔记',
};

function questionLinkFromId(
  questionId: number,
  questionIndex: number,
  opts?: { returnPath?: string; chapterName?: string; mode?: 'basic' | 'sprint' },
): QuizNoteLink {
  const q = QUESTIONS.find((item) => item.id === questionId) ?? QUESTIONS[0];
  return {
    questionText: q.question,
    options: q.options,
    topic: q.topic,
    returnPath: opts?.returnPath ?? '/quiz/basic/1',
    questionIndex,
    mode: opts?.mode ?? 'basic',
    chapterName: opts?.chapterName ?? '第一章 · 风险与保险基础',
  };
}

const SEED_NOTES: NoteItem[] = [
  {
    id: 'n1',
    title: '风险投机 vs 风险管理（赵老师答疑）',
    summary: '识别-评估-应对-监控；管理是控风险，不是搏收益。',
    meta: '刚刚更新 · 来自 3.4 解析页',
    source: '答疑流',
    tagLine: '易错题 / 选项辨析 / 风险管理',
    tags: ['#答疑', '#易错题', '#风险管理'],
    category: 'qa',
    body: '• 风险投机不是风险管理核心步骤\n• 正确链路：识别→评估→应对→监控\n• 误选来源：把「收益导向」误当成管理导向',
    quizLink: questionLinkFromId(1, 0),
  },
  {
    id: 'n2',
    title: '高频错因：概念边界混淆',
    summary: '回顾：定义题优先排除收益导向选项。',
    meta: '来自章节刷题 · 第一章',
    tags: ['#刷题', '#易错题'],
    category: 'quiz',
    body: '• 定义题优先排除收益导向选项\n• 先判断是否属于「控风险」动作',
    quizLink: questionLinkFromId(1, 0),
  },
  {
    id: 'n3',
    title: '投连险产品要点速记',
    summary: '关键词：账户价值、投资风险自担。',
    meta: '来自 2.1 刷题页 · 答错整理',
    tags: ['#刷题', '#产品要点'],
    category: 'quiz',
    body: '• 关键词：账户价值、投资风险自担\n• 区分传统寿险与投连账户价值波动',
    quizLink: questionLinkFromId(2, 1),
  },
  {
    id: 'n4',
    title: '代位追偿 vs 重复保险（赵老师答疑）',
    summary: '代位追偿防双重获益；重复保险按比例分摊，不可重复全额赔付。',
    meta: '昨天 · 来自刷题页 · 不懂反馈',
    source: '答疑流',
    tagLine: '财产保险 / 追偿权 / 分摊原则',
    tags: ['#答疑', '#代位追偿', '#财产保险'],
    category: 'qa',
    body: '• 代位追偿防止被保险人双重获益\n• 重复保险按保额比例分摊，不可重复全额赔付',
    quizLink: questionLinkFromId(4, 3),
  },
  {
    id: 'n5',
    title: '可保利益 · 人身与财产差异（赵老师答疑）',
    summary: '人身险可保利益以关系为据；财产险须对标的具经济权益，邻居通常不构成。',
    meta: '3 天前 · 来自章节刷题 · 第三章',
    source: '答疑流',
    tagLine: '保险原则 / 可保利益 / 关系认定',
    tags: ['#答疑', '#可保利益', '#保险原则'],
    category: 'qa',
    body: '• 人身险可保利益常以亲属/雇佣等关系为据\n• 财产险须对标的具有合法经济利益\n• 邻居关系通常不构成可保利益',
    quizLink: questionLinkFromId(3, 2, {
      returnPath: '/quiz/basic/3',
      chapterName: '第三章 · 一般保险',
    }),
  },
];

function quizRecordToNoteItem(record: QuizNoteRecord): NoteItem {
  return {
    id: record.id,
    title: record.title,
    summary: record.summary,
    meta: record.meta,
    tags: record.tags,
    category: 'quiz',
    body: record.body,
    quizLink: {
      questionText: record.questionText,
      options: record.options,
      topic: record.topic,
      returnPath: record.returnPath,
      questionIndex: record.questionIndex,
      mode: record.mode,
      chapterName: record.chapterName,
      sectionName: record.sectionName,
    },
  };
}

function mergeNotes(): NoteItem[] {
  const saved = loadQuizNotes().map(quizRecordToNoteItem);
  const savedIds = new Set(saved.map((note) => note.id));
  return [...saved, ...SEED_NOTES.filter((note) => !savedIds.has(note.id))];
}

const DETAIL_BLOCKS = [
  { title: '核心结论', lines: ['• 风险投机不属于风险管理流程', '• 流程：识别→评估→应对→监控'] },
  { title: '错因复盘', lines: ['• 误把收益导向当成管理导向', '• 解题时先判断是否“控风险”'] },
  { title: '行动建议', lines: ['做题时遇到流程类题，先排除“投机/收益”词项。'] },
];

const PREVIEW_BLOCKS = [
  { title: '结论', lines: ['• 风险投机不属于风险管理流程', '• 管理目标是降低损失暴露'] },
  { title: '辨析', lines: ['• 关键词“收益导向”通常不是管理步骤', '• 优先找“控风险动作”选项'] },
  { title: '记忆法', lines: ['识别→评估→应对→监控（四步闭环）'] },
];

const FONT =
  '-apple-system, BlinkMacSystemFont, "PingFang SC", "SF Pro Display", "Helvetica Neue", Arial, sans-serif';

/** 笔记详情卡片与页面四边统一间距（与答疑弹窗一致） */
const NOTE_INSET = 12;

function NotesTopBar({
  contextLabel,
  onBack,
}: {
  contextLabel: string;
  onBack: () => void;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        height: 'var(--foco-header-height)',
        padding: 'var(--foco-header-pt) var(--foco-header-px) var(--foco-header-pb)',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        background: '#fff',
        position: 'relative',
        zIndex: 20,
      }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="返回"
        style={{
          width: 30,
          height: 30,
          borderRadius: 999,
          border: 'none',
          background: 'rgba(0,0,0,0.03)',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
        }}
      >
        <ChevronLeft size={20} color="#4E5A67" strokeWidth={2.4} />
      </button>

      <div
        style={{
          minWidth: 96,
          height: 30,
          padding: '0 14px',
          borderRadius: 999,
          background: '#003459',
          color: '#fff',
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '-0.31px',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        不懂笔记
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          height: 32,
          minWidth: 134,
          padding: '0 14px',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.14)',
          background: 'rgba(255,255,255,0.12)',
          color: 'rgba(0,52,89,0.92)',
          fontSize: 12,
          fontWeight: 500,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        {contextLabel}
      </div>
    </div>
  );
}

function PrimaryButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        height: 48,
        border: 'none',
        borderRadius: 12,
        background: '#003459',
        color: '#fff',
        fontSize: 14,
        fontWeight: 600,
        lineHeight: '18px',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function SecondaryButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        height: 48,
        border: 'none',
        borderRadius: 12,
        background: '#fff',
        color: '#8E98A8',
        fontSize: 14,
        fontWeight: 600,
        lineHeight: '18px',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function NotesQaFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="答疑"
      style={{
        position: 'absolute',
        right: 20,
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        width: 56,
        height: 56,
        borderRadius: '50%',
        border: 'none',
        background: '#003459',
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '-0.2px',
        cursor: 'pointer',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 4px 16px rgba(0,52,89,0.28), 0 2px 6px rgba(0,52,89,0.12)',
        zIndex: 25,
      }}
    >
      答疑
    </button>
  );
}

function NoteUnderstandingFooter({
  onConfused,
  onUnderstood,
}: {
  onConfused: () => void;
  onUnderstood: () => void;
}) {
  const buttonShadow = '0 2px 6px rgba(0,52,89,0.08), 0 10px 22px rgba(0,52,89,0.18)';

  return (
    <div
      style={{
        flexShrink: 0,
        background: '#fff',
        boxShadow: '0 -3px 4px rgba(0,13,38,0.08)',
      }}
    >
      <div
        style={{
          padding: `11px ${NOTE_INSET}px 0`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: '#fff',
        }}
      >
        <button
          type="button"
          onClick={onConfused}
          style={{
            width: 85,
            height: 54,
            borderRadius: 999,
            background: '#00A7E1',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: buttonShadow,
          }}
        >
          不懂
        </button>
        <button
          type="button"
          onClick={onUnderstood}
          style={{
            flex: 1,
            height: 54,
            borderRadius: 999,
            background: '#003459',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: buttonShadow,
          }}
        >
          懂了
        </button>
      </div>
      <div style={{ height: 'max(24px, env(safe-area-inset-bottom))', minHeight: 24 }} />
    </div>
  );
}

function ContentBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div
      style={{
        borderRadius: 12,
        background: '#F2F4F6',
        padding: '16px 14px',
        fontSize: 13,
        lineHeight: '19px',
        color: '#1C2B38',
      }}
    >
      <p style={{ margin: 0, fontWeight: 500 }}>{title}</p>
      {lines.map((line) => (
        <p key={line} style={{ margin: 0 }}>
          {line}
        </p>
      ))}
    </div>
  );
}

function LinkedQuestionCard({ link }: { link: QuizNoteLink }) {
  return (
    <div
      style={{
        borderRadius: 12,
        background: '#F2F4F6',
        padding: '14px',
      }}
    >
      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#8E98A8' }}>关联题目</p>
      {link.topic && (
        <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: '18px', color: '#00A7E1', fontWeight: 500 }}>
          {link.topic}
        </p>
      )}
      <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: '22px', color: '#1C2B38' }}>{link.questionText}</p>
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {link.options.slice(0, 4).map((opt) => (
          <p key={opt} style={{ margin: 0, fontSize: 12, lineHeight: '18px', color: '#8E98A8' }}>
            {opt}
          </p>
        ))}
      </div>
    </div>
  );
}

function NoteContentSection({ note }: { note: NoteItem }) {
  const contentTitle = note.category === 'qa' ? '答疑内容' : '我的笔记';

  if (note.body) {
    return (
      <ContentBlock title={contentTitle} lines={note.body.split('\n').filter(Boolean)} />
    );
  }

  return (
    <>
      {DETAIL_BLOCKS.map((block) => (
        <ContentBlock key={block.title} title={block.title} lines={block.lines} />
      ))}
    </>
  );
}

function DetailCard({
  note,
  editing,
  onDoubleClick,
  understandingStatus,
  tween,
  onReturnToQuiz,
}: {
  note: NoteItem;
  editing: boolean;
  onDoubleClick: () => void;
  understandingStatus?: UnderstandingStatus;
  tween?: { scale: number; opacity: number; x: number };
  onReturnToQuiz?: (link: QuizNoteLink) => void;
}) {
  const t = tween ?? { scale: 1, opacity: 1, x: 0 };

  return (
    <div
      style={{
        transform: `translateX(${t.x}px) scale(${t.scale})`,
        opacity: t.opacity,
        transformOrigin: 'center center',
        willChange: 'transform, opacity',
      }}
    >
    <div
      onDoubleClick={onDoubleClick}
      style={{
        borderRadius: 16,
        background: '#fff',
        padding: '20px 16px 18px',
        border: editing ? '1px solid rgba(0,167,225,0.35)' : 'none',
        position: 'relative',
        cursor: editing ? 'text' : 'default',
        userSelect: editing ? 'text' : 'none',
        boxShadow: '0 4px 20px rgba(0,52,89,0.06)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#003459',
            background: 'rgba(0,52,89,0.08)',
            borderRadius: 999,
            padding: '3px 10px',
          }}
        >
          {CATEGORY_LABEL[note.category]}
        </span>
        {understandingStatus === 'confused' && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#FF3B30',
              background: 'rgba(255,59,48,0.1)',
              borderRadius: 999,
              padding: '3px 10px',
            }}
          >
            不懂
          </span>
        )}
        {understandingStatus === 'understood' && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#219F5E',
              background: 'rgba(33,159,94,0.12)',
              borderRadius: 999,
              padding: '3px 10px',
            }}
          >
            懂了
          </span>
        )}
      </div>
      <p style={{ margin: '10px 0 0', fontSize: 18, lineHeight: '26px', fontWeight: 600, color: '#1C2B38' }}>
        {note.title}
      </p>
      <p style={{ margin: '8px 0 0', fontSize: 12, lineHeight: '16px', fontWeight: 500, color: '#00A7E1' }}>
        {note.tags?.join(' ') ?? '#答疑 #易错题 #风险管理'}
      </p>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <NoteContentSection note={note} />
      </div>

      {note.quizLink && (
        <div style={{ marginTop: 16 }}>
          <LinkedQuestionCard link={note.quizLink} />
        </div>
      )}

      {note.quizLink && onReturnToQuiz && (
        <button
          type="button"
          onClick={() => onReturnToQuiz(note.quizLink!)}
          style={{
            marginTop: 14,
            width: '100%',
            height: 44,
            border: 'none',
            borderRadius: 12,
            background: '#00A7E1',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          回到此题
        </button>
      )}
    </div>
    </div>
  );
}

type SlideTween = { scale: number; opacity: number; x: number };

function defaultTweens(count: number, active: number): SlideTween[] {
  return Array.from({ length: count }, (_, i) =>
    i === active ? { scale: 1, opacity: 1, x: 0 } : { scale: 0.94, opacity: 0.42, x: 0 },
  );
}

function NoteDetailCarousel({
  notes,
  activeNoteId,
  editing,
  onNoteChange,
  onEditToggle,
  understanding,
  onCarouselReady,
  onReturnToQuiz,
}: {
  notes: NoteItem[];
  activeNoteId: string;
  editing: boolean;
  onNoteChange: (noteId: string) => void;
  onEditToggle: () => void;
  understanding: Record<string, UnderstandingStatus>;
  onCarouselReady?: (api: { goNext: () => boolean }) => void;
  onReturnToQuiz?: (link: QuizNoteLink) => void;
}) {
  const startIndex = Math.max(0, notes.findIndex((note) => note.id === activeNoteId));

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    duration: 48,
    startIndex,
  });

  const [selectedIndex, setSelectedIndex] = useState(startIndex);
  const [tweens, setTweens] = useState<SlideTween[]>(() => defaultTweens(notes.length, startIndex));

  const tweenSlides = useCallback(() => {
    if (!emblaApi) return;
    const selected = emblaApi.selectedScrollSnap();
    const snaps = emblaApi.scrollSnapList();
    const progress = emblaApi.scrollProgress();
    if (snaps.length <= 1) {
      setTweens(defaultTweens(notes.length, selected));
      return;
    }
    const step = snaps[1] - snaps[0] || 1;
    setTweens(
      snaps.map((snap, index) => {
        if (index === selected) {
          return { scale: 1, opacity: 1, x: 0 };
        }
        const dist = Math.abs(snap - progress) / step;
        const t = Math.min(dist, 1);
        const direction = snap > progress ? 1 : snap < progress ? -1 : 0;
        return {
          scale: 1 - t * 0.08,
          opacity: 1 - t * 0.52,
          x: direction * t * 18,
        };
      }),
    );
  }, [emblaApi, notes.length]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    const note = notes[index];
    if (note && note.id !== activeNoteId) {
      onNoteChange(note.id);
    }
    tweenSlides();
  }, [activeNoteId, emblaApi, notes, onNoteChange, tweenSlides]);

  useEffect(() => {
    if (!emblaApi) return;
    tweenSlides();
    onSelect();
    emblaApi.on('scroll', tweenSlides);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', tweenSlides);
    return () => {
      emblaApi.off('scroll', tweenSlides);
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', tweenSlides);
    };
  }, [emblaApi, onSelect, tweenSlides]);

  useEffect(() => {
    if (!emblaApi) return;
    onCarouselReady?.({
      goNext: () => {
        const current = emblaApi.selectedScrollSnap();
        if (current >= notes.length - 1) return false;
        emblaApi.scrollTo(current + 1);
        return true;
      },
    });
  }, [emblaApi, notes.length, onCarouselReady]);

  useEffect(() => {
    const index = notes.findIndex((note) => note.id === activeNoteId);
    if (index >= 0 && emblaApi && emblaApi.selectedScrollSnap() !== index) {
      emblaApi.scrollTo(index);
      setSelectedIndex(index);
    }
  }, [activeNoteId, emblaApi, notes]);

  const canSwipe = notes.length > 1;

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: `${NOTE_INSET}px ${NOTE_INSET}px 0`,
      }}
    >
      <div
        ref={emblaRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          cursor: canSwipe ? 'grab' : 'default',
          touchAction: 'pan-y pinch-zoom',
        }}
      >
        <div style={{ display: 'flex', height: '100%', alignItems: 'stretch' }}>
          {notes.map((note, slideIndex) => (
            <div
              key={note.id}
              style={{
                flex: '0 0 100%',
                minWidth: 0,
                height: '100%',
                overflowY: 'auto',
                paddingBottom: 8,
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <DetailCard
                note={note}
                editing={editing && note.id === activeNoteId}
                onDoubleClick={() => {
                  if (note.id === activeNoteId) {
                    onEditToggle();
                  }
                }}
                understandingStatus={understanding[note.id]}
                tween={tweens[slideIndex]}
                onReturnToQuiz={onReturnToQuiz}
              />
              <p
                style={{
                  margin: '8px 0 0',
                  textAlign: 'center',
                  fontSize: 12,
                  lineHeight: '16px',
                  fontWeight: 500,
                  color: 'rgba(142, 152, 168, 0.38)',
                }}
              >
                {canSwipe ? '左右滑动切换笔记 · 双击编辑笔记卡片' : '双击编辑笔记卡片'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {canSwipe && (
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            padding: '8px 0 4px',
          }}
        >
          {notes.map((note, index) => (
            <button
              key={note.id}
              type="button"
              aria-label={`切换到第 ${index + 1} 条笔记`}
              onClick={() => emblaApi?.scrollTo(index)}
              style={{
                width: index === selectedIndex ? 20 : 8,
                height: 8,
                border: 'none',
                borderRadius: 999,
                padding: 0,
                background: index === selectedIndex ? '#003459' : 'rgba(0,52,89,0.16)',
                cursor: 'pointer',
                transition: 'width 0.45s ease, background 0.45s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = (location.state as { mode?: 'basic' | 'sprint' } | null)?.mode ?? 'basic';

  const [stage, setStage] = useState<Stage>('list');
  const [filter, setFilter] = useState<FilterTab>('全部');
  const [allNotes, setAllNotes] = useState<NoteItem[]>(() => mergeNotes());
  const [activeNoteId, setActiveNoteId] = useState(allNotes[0]?.id ?? SEED_NOTES[0].id);
  const [understanding, setUnderstanding] = useState<Record<string, UnderstandingStatus>>(loadUnderstanding);
  const carouselApiRef = useRef<{ goNext: () => boolean } | null>(null);

  useEffect(() => {
    localStorage.setItem(UNDERSTANDING_STORAGE_KEY, JSON.stringify(understanding));
  }, [understanding]);

  useEffect(() => {
    const refresh = () => setAllNotes(mergeNotes());
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const activeNote = useMemo(
    () => allNotes.find((note) => note.id === activeNoteId) ?? allNotes[0] ?? SEED_NOTES[0],
    [activeNoteId, allNotes],
  );

  const filteredNotes = useMemo(() => notesForTab(filter, understanding, allNotes), [filter, understanding, allNotes]);

  const handleCarouselReady = useCallback((api: { goNext: () => boolean }) => {
    carouselApiRef.current = api;
  }, []);

  const markConfused = (noteId: string) => {
    setUnderstanding((prev) => ({ ...prev, [noteId]: 'confused' }));
  };

  const markUnderstoodAndNext = (noteId: string) => {
    setUnderstanding((prev) => ({ ...prev, [noteId]: 'understood' }));
    carouselApiRef.current?.goNext();
  };

  const goQuiz = () => {
    if (mode === 'sprint') {
      navigate('/sprint/libraries');
    } else {
      navigate('/basic/chapters');
    }
  };

  const handleReturnToQuiz = (link: QuizNoteLink) => {
    navigate(link.returnPath, {
      state: {
        mode: link.mode,
        questionIndex: link.questionIndex,
        chapterName: link.chapterName,
        sectionName: link.sectionName,
      },
    });
  };

  const handleBack = () => {
    switch (stage) {
      case 'list':
        navigate(-1);
        break;
      case 'detail':
        setStage('list');
        break;
      case 'edit':
        setStage('detail');
        break;
      case 'chat':
        setStage(activeNote.category === 'qa' ? 'detail' : 'list');
        break;
      case 'preview':
        setStage('chat');
        break;
      case 'added':
        setStage('list');
        break;
      default:
        navigate(-1);
    }
  };

  const openDetail = (noteId: string) => {
    setActiveNoteId(noteId);
    setStage('detail');
  };

  const handleDetailNoteChange = (noteId: string) => {
    setActiveNoteId(noteId);
    if (stage === 'edit') {
      setStage('detail');
    }
  };

  const handleEditToggle = () => {
    setStage(stage === 'edit' ? 'detail' : 'edit');
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#F2F4F6',
        overflow: 'hidden',
        fontFamily: FONT,
        position: 'relative',
      }}
    >
      <NotesTopBar contextLabel={STAGE_CONTEXT[stage]} onBack={handleBack} />

      {stage === 'list' && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${NOTE_INSET}px 88px` }}>
            <div
              style={{
                marginTop: NOTE_INSET,
                height: 40,
                borderRadius: 12,
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                padding: '0 14px',
              }}
            >
              <span style={{ fontSize: 13, lineHeight: '18px', color: '#8E98A8' }}>
                搜索：风险管理 / 赵老师 / 易错题
              </span>
            </div>

            <div
              style={{
                marginTop: 12,
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {FILTER_TABS.map((tab) => {
                const active = filter === tab;
                const count = notesForTab(tab, understanding, allNotes).length;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilter(tab)}
                    style={{
                      height: 30,
                      padding: '0 14px',
                      border: 'none',
                      borderRadius: 15,
                      background: active ? '#003459' : '#fff',
                      color: active ? '#fff' : '#8E98A8',
                      fontSize: 12,
                      fontWeight: 500,
                      lineHeight: '14px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {tab}（{count}）
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => openDetail(note.id)}
                  style={{
                    width: '100%',
                    border: 'none',
                    borderRadius: 16,
                    background: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: note.meta ? '20px 16px' : '20px 16px 18px',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: note.meta ? 15 : 14,
                      lineHeight: note.meta ? '22px' : '20px',
                      fontWeight: note.meta ? 600 : 500,
                      color: '#1C2B38',
                    }}
                  >
                    {note.title}
                    {understanding[note.id] === 'confused' && (
                      <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: '#FF3B30' }}>
                        · 不懂
                      </span>
                    )}
                  </p>
                  <p
                    style={{
                      margin: '8px 0 0',
                      fontSize: note.meta ? 13 : 12,
                      lineHeight: note.meta ? '18px' : '17px',
                      color: '#8E98A8',
                    }}
                  >
                    {note.summary}
                  </p>
                  {note.meta && (
                    <p style={{ margin: '12px 0 0', fontSize: 12, lineHeight: '16px', color: '#00A7E1' }}>
                      {note.meta}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {(stage === 'detail' || stage === 'edit') && (
        <>
          <NoteDetailCarousel
            notes={filteredNotes}
            activeNoteId={activeNote.id}
            editing={stage === 'edit'}
            onNoteChange={handleDetailNoteChange}
            onEditToggle={handleEditToggle}
            understanding={understanding}
            onCarouselReady={handleCarouselReady}
            onReturnToQuiz={handleReturnToQuiz}
          />
          {stage === 'detail' && supportsUnderstanding(activeNote) && (
            <NoteUnderstandingFooter
              onConfused={() => markConfused(activeNote.id)}
              onUnderstood={() => markUnderstoodAndNext(activeNote.id)}
            />
          )}
        </>
      )}

      {stage === 'chat' && (
        <>
          <div style={{ flex: 1, overflow: 'hidden', padding: '0 20px 24px', display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                marginTop: 14,
                flex: 1,
                borderRadius: 18,
                background: '#fff',
                padding: '18px 14px 16px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: '#00A7E1',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  赵
                </div>
                <div
                  style={{
                    maxWidth: 240,
                    borderRadius: 12,
                    background: '#F2F4F6',
                    padding: '14px 14px',
                    fontSize: 13,
                    lineHeight: '19px',
                    color: '#1C2B38',
                  }}
                >
                  你想重点区分哪些概念？我给你做对比。
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <div
                  style={{
                    maxWidth: 245,
                    borderRadius: 12,
                    background: '#003459',
                    padding: '14px 14px',
                    fontSize: 13,
                    lineHeight: '19px',
                    color: '#fff',
                  }}
                >
                  我总把风险投机当成风险管理步骤。
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 32, flexShrink: 0 }} />
                <div
                  style={{
                    maxWidth: 250,
                    borderRadius: 12,
                    background: '#F2F4F6',
                    padding: '14px 14px',
                    fontSize: 13,
                    lineHeight: '19px',
                    color: '#1C2B38',
                  }}
                >
                  <p style={{ margin: 0 }}>记口诀：识别-评估-应对-监控。</p>
                  <p style={{ margin: 0 }}>投机是博收益，不是控风险。</p>
                </div>
              </div>

              <div style={{ flex: 1 }} />

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div
                  style={{
                    flex: 1,
                    height: 42,
                    borderRadius: 12,
                    background: '#F2F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 14px',
                    fontSize: 12,
                    color: '#8E98A8',
                  }}
                >
                  继续追问…
                </div>
                <div
                  style={{
                    width: 40,
                    height: 42,
                    borderRadius: 12,
                    background: '#00A7E1',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  ↑
                </div>
              </div>
            </div>
          </div>
          <div style={{ flexShrink: 0, padding: '0 20px max(24px, env(safe-area-inset-bottom))' }}>
            <PrimaryButton label="AI整理为笔记" onClick={() => setStage('preview')} />
          </div>
        </>
      )}

      {stage === 'preview' && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>
            <div
              style={{
                marginTop: 14,
                borderRadius: 18,
                background: '#fff',
                padding: '24px 16px',
              }}
            >
              <p style={{ margin: 0, fontSize: 18, lineHeight: '24px', fontWeight: 600, color: '#1C2B38' }}>
                AI整理结果（本次答疑）
              </p>
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PREVIEW_BLOCKS.map((block) => (
                  <ContentBlock key={block.title} title={block.title} lines={block.lines} />
                ))}
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 32,
                  padding: '0 16px',
                  borderRadius: 16,
                  background: 'rgba(0,52,89,0.08)',
                }}
              >
                <span style={{ fontSize: 12, lineHeight: '15px', fontWeight: 500, color: '#003459' }}>
                  #答疑 #风险管理 #IIQE
                </span>
              </div>
            </div>
          </div>
          <div style={{ flexShrink: 0, padding: '0 20px max(24px, env(safe-area-inset-bottom))' }}>
            <PrimaryButton label="添加进笔记列表" onClick={() => setStage('added')} />
          </div>
        </>
      )}

      {stage === 'added' && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>
            <div
              style={{
                marginTop: 14,
                height: 52,
                borderRadius: 12,
                background: 'rgba(33,159,94,0.14)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 18px',
              }}
            >
              <p style={{ margin: 0, fontSize: 13, lineHeight: '18px', fontWeight: 600, color: '#219F5E' }}>
                ✓ 已添加进笔记列表：风险投机 vs 风险管理
              </p>
            </div>

            <div
              style={{
                marginTop: 12,
                borderRadius: 18,
                background: '#fff',
                padding: '24px 16px',
              }}
            >
              <div
                style={{
                  borderRadius: 12,
                  background: 'rgba(0,167,225,0.1)',
                  padding: '22px 14px',
                }}
              >
                <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', fontWeight: 600, color: '#1C2B38' }}>
                  【新】风险投机 vs 风险管理（赵老师答疑）
                </p>
                <p style={{ margin: '7px 0 0', fontSize: 12, lineHeight: '17px', color: '#8E98A8' }}>
                  来源：答疑流
                </p>
                <p style={{ margin: 0, fontSize: 12, lineHeight: '17px', color: '#8E98A8' }}>
                  标签：易错题 / 选项辨析 / 风险管理
                </p>
              </div>

              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {allNotes.slice(1, 4).map((note) => (
                  <div
                    key={note.id}
                    style={{
                      borderRadius: 12,
                      background: '#F2F4F6',
                      padding: '27px 14px',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 13, lineHeight: '18px', fontWeight: 500, color: '#1C2B38' }}>
                      {note.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            style={{
              flexShrink: 0,
              padding: '0 20px max(24px, env(safe-area-inset-bottom))',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <SecondaryButton label="返回笔记主页" onClick={() => setStage('list')} />
            <PrimaryButton label="继续刷题" onClick={goQuiz} />
          </div>
        </>
      )}

      {stage === 'list' && <NotesQaFab onClick={() => setStage('chat')} />}
    </div>
  );
}
