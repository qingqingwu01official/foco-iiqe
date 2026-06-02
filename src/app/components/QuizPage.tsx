import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import QuizInlineAnalysis from './QuizInlineAnalysis';
import QuizAddNoteSheet from './QuizAddNoteSheet';
import QuizNotUnderstandFlow from './QuizNotUnderstandFlow';
import {
  QuizAnswerStatsBar,
  QuizReferenceOptionRow,
  optionLetter,
  referenceOptionVisual,
  stripOptionPrefix,
} from './QuizReferenceOption';
import { QUESTIONS, QUESTIONS_BY_CHAPTER, type QuizQuestion } from '../data/quizQuestions';
import { buildErrorReviewQuizTarget } from '../utils/errorBookFocus';
import {
  archiveErrorBookItem,
  filterQuizQuestionsForErrorBookList,
  getErrorBookItemState,
  recordErrorBookAnswer,
  type ErrorBookListFilter,
  type ErrorBookMode,
} from '../lib/errorBookArchive';

const DEFAULT_BOTTOM_BAR_H = 100;
const QUIZ_PROGRESS_STORAGE_KEY = 'iiqe-quiz-progress-v1';

export type { QuizQuestion };
export { QUESTIONS };

const MASTERY_CARD_RADIUS = 14;
const MASTERY_CARD_BG = '#F5F8FA';
const MASTERY_CARD_BORDER = '1px solid rgba(0,52,89,0.08)';
const MASTERY_TITLE_COLOR = '#003459';

const QUIZ_DIALOG_SIDE_PADDING = 16;

/** 居中对话框：相对刷题页根容器 absolute，避免 fixed 相对视口宽于 393px 壳层而溢出 */
function QuizCenterDialog({
  zIndexBackdrop,
  zIndexPanel,
  onBackdropClick,
  children,
}: {
  zIndexBackdrop: number;
  zIndexPanel: number;
  onBackdropClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        onClick={onBackdropClick}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.28)',
          zIndex: zIndexBackdrop,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `max(24px, env(safe-area-inset-top)) ${QUIZ_DIALOG_SIDE_PADDING}px max(24px, env(safe-area-inset-bottom))`,
          boxSizing: 'border-box',
          zIndex: zIndexPanel,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
            borderRadius: 18,
            background: '#fff',
            padding: 16,
            boxShadow: '0 14px 34px rgba(0,0,0,0.16)',
            maxHeight: '100%',
            overflowY: 'auto',
            pointerEvents: 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

function CenterStatusToast({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding:
          'max(24px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom))',
        boxSizing: 'border-box',
        zIndex: 74,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          padding: '12px 14px',
          borderRadius: 14,
          background: 'rgba(0,52,89,0.92)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          boxShadow: '0 10px 26px rgba(0,52,89,0.22)',
          maxWidth: 320,
          textAlign: 'center',
        }}
      >
        {message}
      </div>
    </div>
  );
}

/** 与掌握进度块共用中间描边，下段独立圆底（14px，与上框一致）— 可归档 */
function ArchiveToMasteredFooterBar({
  pending,
  onClick,
  connectBelow = false,
}: {
  pending: boolean;
  onClick: () => void;
  /** 下方还有反复错条时去掉本条底圆角 */
  connectBelow?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      aria-label={pending ? '归档中' : '点击可归档至已掌握'}
      style={{
        position: 'relative',
        zIndex: 1,
        marginTop: -MASTERY_CARD_RADIUS,
        width: '100%',
        height: 44,
        padding: 0,
        border: 'none',
        cursor: pending ? 'wait' : 'pointer',
        opacity: pending ? 0.65 : 1,
        background:
          'linear-gradient(180deg, rgba(232,255,240,0.98) 0%, rgba(214,245,228,0.98) 100%)',
        borderRadius: connectBelow
          ? 0
          : `0 0 ${MASTERY_CARD_RADIUS}px ${MASTERY_CARD_RADIUS}px`,
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: MASTERY_CARD_RADIUS,
          height: `calc(100% - ${MASTERY_CARD_RADIUS}px)`,
          padding: '0 14px',
          width: '100%',
          boxSizing: 'border-box',
          fontSize: 12,
          lineHeight: 1.2,
          fontWeight: 600,
          color: '#15803D',
          letterSpacing: '0.01em',
          textAlign: 'center',
        }}
      >
        {pending ? '归档中...' : '点击可归档至已掌握'}
      </span>
    </button>
  );
}

/** 与掌握进度块共用中间描边，下段独立圆底（14px，与上框一致） */
function RepeatedWrongFooterBar() {
  return (
    <div
      role="note"
      style={{
        position: 'relative',
        zIndex: 1,
        marginTop: -MASTERY_CARD_RADIUS,
        height: 44,
        background: 'linear-gradient(180deg, rgba(255,235,232,0.98) 0%, rgba(255,220,214,0.98) 100%)',
        border: 'none',
        borderRadius: `0 0 ${MASTERY_CARD_RADIUS}px ${MASTERY_CARD_RADIUS}px`,
      }}
    >
      {/* 上方会被掌握进度圆底覆盖 14px，这里对“可见区域”做垂直居中 */}
      <div
        style={{
          marginTop: MASTERY_CARD_RADIUS,
          height: `calc(100% - ${MASTERY_CARD_RADIUS}px)`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            lineHeight: 1.2,
            fontWeight: 600,
            color: '#B82E18',
            letterSpacing: '0.01em',
          }}
        >
          反复错，建议深入看解析/找老师答疑
        </p>
      </div>
    </div>
  );
}

function MasteryDots({
  progress,
  size = 9,
  gap = 6,
}: {
  progress: number;
  size?: number;
  gap?: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap }}>
      {[0, 1, 2].map((dot) => {
        const active = dot < progress;
        return (
          <span
            key={dot}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: active ? '#31C869' : '#D8E0E9',
              transform: active ? 'scale(1)' : 'scale(0.92)',
              opacity: active ? 1 : 0.92,
              transition: 'all 160ms ease',
              display: 'inline-block',
            }}
          />
        );
      })}
    </div>
  );
}

type QuizPageProps = {
  questions?: QuizQuestion[];
  headerTitle?: string;
  headerSubtitle?: string;
  displayTotalQ?: number;
  /** reference = 圆点选项 + 答后数据板块（全局默认）；default = 旧胶囊选项 */
  optionLayout?: 'default' | 'reference';
  /** 参考布局试刷时固定展示进度（如 7/91 中的 7） */
  initialProgressIndex?: number;
  /** 开启解析区「不懂笔记」入口（默认全部刷题页开启） */
  enableQuizNote?: boolean;
};

// ── Main Component ─────────────────────────────────────────────────────────

export default function QuizPage({
  questions: questionsProp,
  headerTitle: headerTitleProp,
  headerSubtitle: headerSubtitleProp,
  displayTotalQ: displayTotalProp,
  optionLayout = 'reference',
  initialProgressIndex,
  enableQuizNote: enableQuizNoteProp,
}: QuizPageProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const mode = (location.state as any)?.mode || 'basic';
  const subject = (location.state as any)?.subject || '卷一 · 一般保险';
  const startIndex = (location.state as any)?.questionIndex ?? 0;
  const fromErrors =
    (location.state as any)?.fromErrors ?? ((location.state as any)?.returnPath === '/errors' ? true : false);
  const returnPath = (location.state as any)?.returnPath as string | undefined;
  const errorBookReturnState = (location.state as { returnState?: Record<string, unknown> } | undefined)
    ?.returnState;
  const errorBookListFilterRaw =
    (location.state as { errorBookListFilter?: ErrorBookListFilter } | undefined)?.errorBookListFilter ??
    (errorBookReturnState?.bucketFilter as ErrorBookListFilter | undefined);
  const errorBookListFilter: ErrorBookListFilter | undefined =
    errorBookListFilterRaw === 'mastered' || errorBookListFilterRaw === 'pending'
      ? errorBookListFilterRaw
      : undefined;
  const errorBookMode: ErrorBookMode = mode === 'sprint' ? 'sprint' : 'basic';
  const errorBookSectionId = fromErrors ? id ?? '' : '';
  const errorBookEnabled = fromErrors && errorBookSectionId.length > 0;

  const sourceQuestions = questionsProp ?? (id && QUESTIONS_BY_CHAPTER[id]) ?? QUESTIONS;
  const questions = useMemo(() => {
    if (!errorBookEnabled || !errorBookListFilter) return sourceQuestions;
    return filterQuizQuestionsForErrorBookList({
      mode: errorBookMode,
      sectionId: errorBookSectionId,
      questions: sourceQuestions,
      listFilter: errorBookListFilter,
    });
  }, [sourceQuestions, errorBookEnabled, errorBookListFilter, errorBookMode, errorBookSectionId]);

  const CHAPTER_NAMES: Record<string, string> = {
    '1': '第一章 · 风险与保险基础',
    '2': '第二章 · 保险合约',
    '3': '第三章 · 一般保险',
    '4': '第四章 · 责任保险',
    '5': '第五章 · 汽车保险',
    '6': '第六章 · 员工补偿保险',
    '7': '第七章 · 再保险',
  };
  const chapterName = id ? (CHAPTER_NAMES[id] ?? `第 ${id} 章`) : null;
  const sectionName = (location.state as any)?.sectionName as string | undefined;
  const libraryName = (location.state as any)?.libraryName as string | undefined;
  const resumeProgressKey = `${mode}:${fromErrors ? 'errors' : 'normal'}:${errorBookListFilter ?? 'all'}:${id ?? ''}:${sectionName ?? ''}:${libraryName ?? ''}`;

  const SECTION_CHAPTER_LABEL: Record<string, string> = {
    '第1章 风险的概念': '第一章 · 风险与保险基础',
    '第2章 法律规则': '第二章 · 法律原则',
    '第3章 保险原则': '第三章 · 保险原则',
  };

  const SPRINT_SECTION_TOTALS: Record<string, number> = {
    '第1章 风险的概念': 20,
    '第2章 法律规则': 40,
    '第3章 保险原则': 50,
  };

  const SECTION_TOTALS: Record<string, number> = {
    'A. 风险的概念': 20,
    'B. 风险的管理': 91,
    'A. 基础法律原则': 40,
    'B. 合同法要点': 28,
    'A. 可保利益': 30,
    'B. 最大诚信': 25,
    'A. 再保险机制': 42,
    'A. 监管框架': 38,
    'A. 市场行为守则': 44,
    'A. 条款解读': 36,
  };
  const CHAPTER_TOTALS: Record<string, number> = {
    '1': 111,
    '2': 68,
    '3': 55,
    '4': 42,
    '5': 38,
    '6': 44,
    '7': 36,
  };

  // Top label text
  const topLabel = fromErrors
    ? '错题本'
    : mode === 'sprint'
    ? '分重点练习'
    : '章节练习';

  const [qIndex, setQIndex] = useState(startIndex);
  const [resumePromptOpen, setResumePromptOpen] = useState(false);
  const [resumeDetectedIndex, setResumeDetectedIndex] = useState<number>(0);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealedAnalysis, setRevealedAnalysis] = useState<Record<number, boolean>>({});
  const [autoJumpingToAnalysis, setAutoJumpingToAnalysis] = useState(false);
  const wrongJumpTimerRef = useRef<number | null>(null);
  const pendingWrongQuestionRef = useRef<number | null>(null);
  const reviveExitTimerRef = useRef<number | null>(null);

  const [notUnderstandOpen, setNotUnderstandOpen] = useState(false);
  const [flowBusy, setFlowBusy] = useState(false);
  const [quizNoteOpen, setQuizNoteOpen] = useState(false);
  const [quizNoteHighlightText, setQuizNoteHighlightText] = useState('');
  const [quizNoteTargetIndex, setQuizNoteTargetIndex] = useState(0);
  const [noteSavedToast, setNoteSavedToast] = useState(false);
  const [errorBookToast, setErrorBookToast] = useState<string | null>(null);
  const [centerStatusToast, setCenterStatusToast] = useState<string | null>(null);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveTargetQuestionId, setArchiveTargetQuestionId] = useState<number | null>(null);
  const [archiveToastOpen, setArchiveToastOpen] = useState(false);
  const [archiveToastNextIndex, setArchiveToastNextIndex] = useState<number | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const mainAreaRef = useRef<HTMLDivElement | null>(null);
  const pageRootRef = useRef<HTMLDivElement | null>(null);
  const [bottomBarHeight, setBottomBarHeight] = useState(DEFAULT_BOTTOM_BAR_H);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    startIndex,
  });

  const initialStoredProgress = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = window.localStorage.getItem(QUIZ_PROGRESS_STORAGE_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw) as Record<string, number>;
      const value = parsed?.[resumeProgressKey];
      return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    } catch {
      return 0;
    }
  }, [resumeProgressKey]);

  const resumePromptCheckedRef = useRef(false);
  const skipResumePrompt =
    startIndex !== 0 ||
    initialStoredProgress <= 0 ||
    initialStoredProgress >= questions.length;
  const [canPersistProgress, setCanPersistProgress] = useState(skipResumePrompt);

  const readStoredProgressIndex = useCallback((): number => {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = window.localStorage.getItem(QUIZ_PROGRESS_STORAGE_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw) as Record<string, number>;
      const value = parsed?.[resumeProgressKey];
      return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    } catch {
      return 0;
    }
  }, [resumeProgressKey]);

  const writeStoredProgressIndex = useCallback(
    (index: number) => {
      if (typeof window === 'undefined') return;
      try {
        const raw = window.localStorage.getItem(QUIZ_PROGRESS_STORAGE_KEY);
        const parsed = (raw ? (JSON.parse(raw) as Record<string, number>) : {}) ?? {};
        parsed[resumeProgressKey] = index;
        window.localStorage.setItem(QUIZ_PROGRESS_STORAGE_KEY, JSON.stringify(parsed));
      } catch {
        // ignore localStorage errors in prototype mode
      }
    },
    [resumeProgressKey],
  );

  const clearStoredProgressIndex = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(QUIZ_PROGRESS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, number>;
      if (!parsed || typeof parsed !== 'object') return;
      delete parsed[resumeProgressKey];
      window.localStorage.setItem(QUIZ_PROGRESS_STORAGE_KEY, JSON.stringify(parsed));
    } catch {
      // ignore localStorage errors in prototype mode
    }
  }, [resumeProgressKey]);

  const clearWrongJumpTimer = useCallback(() => {
    if (wrongJumpTimerRef.current !== null) {
      window.clearTimeout(wrongJumpTimerRef.current);
      wrongJumpTimerRef.current = null;
    }
    pendingWrongQuestionRef.current = null;
    setAutoJumpingToAnalysis(false);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setQIndex(emblaApi.selectedScrollSnap());
      clearWrongJumpTimer();
      setNotUnderstandOpen(false);
    };
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [clearWrongJumpTimer, emblaApi]);

  // 仅在本页首次进入时根据「进入前」已存进度决定是否弹出答题记录（避免练到一半再次弹出）
  useEffect(() => {
    if (!emblaApi) return;
    if (resumePromptCheckedRef.current) return;
    resumePromptCheckedRef.current = true;

    if (startIndex !== 0) {
      setCanPersistProgress(true);
      return;
    }
    if (returnPath && returnPath !== '/errors' && fromErrors) {
      setCanPersistProgress(true);
      return;
    }

    const stored = initialStoredProgress;
    if (stored <= 0 || stored >= questions.length) {
      setCanPersistProgress(true);
      return;
    }

    setResumeDetectedIndex(stored);
    setResumePromptOpen(true);
  }, [emblaApi, fromErrors, initialStoredProgress, questions.length, returnPath, startIndex]);

  // 用户处理完答题记录（或无需弹窗）后，才写入本次练习进度
  useEffect(() => {
    if (!emblaApi || !canPersistProgress) return;
    if (resumePromptOpen) return;
    writeStoredProgressIndex(qIndex);
  }, [canPersistProgress, emblaApi, qIndex, resumePromptOpen, writeStoredProgressIndex]);

  const displayTotalFromState = (location.state as { displayTotalQ?: number } | undefined)?.displayTotalQ;
  const totalForDisplay =
    displayTotalProp ??
    displayTotalFromState ??
    (mode === 'sprint' && sectionName && SPRINT_SECTION_TOTALS[sectionName]
      ? SPRINT_SECTION_TOTALS[sectionName]
      : (sectionName && SECTION_TOTALS[sectionName]) ||
        (id && CHAPTER_TOTALS[id]) ||
        questions.length);

  const stateChapterName = (location.state as { chapterName?: string } | undefined)?.chapterName;

  const headerSubtitle =
    headerSubtitleProp ??
    (fromErrors
      ? mode === 'sprint'
        ? SECTION_CHAPTER_LABEL[sectionName ?? ''] ?? sectionName ?? subject
        : stateChapterName ?? chapterName ?? subject
      : mode === 'sprint'
        ? SECTION_CHAPTER_LABEL[sectionName ?? ''] ?? sectionName ?? subject
        : chapterName ?? subject);
  const headerTitle =
    headerTitleProp ?? (fromErrors ? '错题本' : mode === 'sprint' ? libraryName ?? topLabel : topLabel);

  const progressCurrent = initialProgressIndex ?? qIndex + 1;
  const isReferenceLayout = optionLayout !== 'default';
  const enableQuizNote = enableQuizNoteProp ?? true;
  const currentErrorBookState =
    errorBookEnabled && questions[qIndex]
      ? getErrorBookItemState({
          mode: errorBookMode,
          sectionId: errorBookSectionId,
          questionId: questions[qIndex].id,
        })
      : null;
  const quizReturnPath = id
    ? `/quiz/${mode}/${id}`
    : location.pathname.startsWith('/demo/')
      ? location.pathname
      : '/quiz';

  const revealAnalysis = (questionIndex: number) => {
    setRevealedAnalysis((prev) => ({ ...prev, [questionIndex]: true }));
    setAutoJumpingToAnalysis(false);
    pendingWrongQuestionRef.current = null;
  };

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (answers[questionIndex] !== undefined) return;
    if (autoJumpingToAnalysis && questionIndex === qIndex) return;

    const question = questions[questionIndex];
    const answerIsCorrect = optionIndex === question.correct;
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));

    if (errorBookEnabled) {
      const result = recordErrorBookAnswer({
        mode: errorBookMode,
        sectionId: errorBookSectionId,
        questionId: question.id,
        isCorrect: answerIsCorrect,
      });
      if (result.revivedFromMastered) {
        setCenterStatusToast('该题已复活回错题本');
        if (errorBookListFilter === 'mastered' && returnPath === '/errors') {
          if (reviveExitTimerRef.current !== null) {
            window.clearTimeout(reviveExitTimerRef.current);
          }
          reviveExitTimerRef.current = window.setTimeout(() => {
            reviveExitTimerRef.current = null;
            navigate('/errors', {
              replace: true,
              state: {
                ...(errorBookReturnState ?? {}),
                mode,
                bucketFilter: 'pending',
                focusSectionId: errorBookSectionId,
              },
            });
          }, 1200);
        }
      }
    }

    if (answerIsCorrect) {
      revealAnalysis(questionIndex);
    } else {
      setAutoJumpingToAnalysis(true);
      pendingWrongQuestionRef.current = questionIndex;
      wrongJumpTimerRef.current = window.setTimeout(() => {
        if (pendingWrongQuestionRef.current === questionIndex) {
          revealAnalysis(questionIndex);
        }
      }, 240);
    }
  };

  const handleNext = () => {
    clearWrongJumpTimer();
    setNotUnderstandOpen(false);
    if (qIndex < questions.length - 1) {
      emblaApi?.scrollTo(qIndex + 1);
    } else {
      clearStoredProgressIndex();
      let correct = 0;
      let wrong = 0;
      for (let i = 0; i < questions.length; i++) {
        const picked = answers[i];
        if (picked === undefined) continue;
        if (picked === questions[i].correct) correct += 1;
        else wrong += 1;
      }
      const routeId = id ?? '';
      const returnPath = fromErrors
        ? ((location.state as { returnPath?: string } | undefined)?.returnPath ?? '/errors')
        : mode === 'sprint'
          ? '/sprint/libraries'
          : '/basic/chapters';
      const returnState = (location.state as { returnState?: Record<string, unknown> } | undefined)
        ?.returnState;

      navigate(`/quiz/${mode}/${routeId}/complete`, {
        replace: true,
        state: {
          mode,
          fromErrors,
          practiceStats: { correct, wrong, total: questions.length },
          headerTitle,
          headerSubtitle,
          returnPath,
          returnState,
          sectionName,
          libraryName,
          chapterName: stateChapterName ?? chapterName ?? undefined,
          errorReviewTarget: buildErrorReviewQuizTarget({
            mode,
            routeId,
            sectionName,
            chapterName: stateChapterName ?? chapterName ?? undefined,
            libraryName,
          }),
        },
      });
    }
  };

  const handleLeftAction = () => {
    setNotUnderstandOpen(true);
  };

  const leftButtonActive = flowBusy || notUnderstandOpen;

  const currentAnalysisVisible = revealedAnalysis[qIndex] === true;

  useEffect(() => {
    const el = footerRef.current;
    if (!el || !currentAnalysisVisible) return;
    const update = () => setBottomBarHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [currentAnalysisVisible, notUnderstandOpen, flowBusy]);

  useEffect(() => {
    return () => {
      clearWrongJumpTimer();
      if (reviveExitTimerRef.current !== null) {
        window.clearTimeout(reviveExitTimerRef.current);
        reviveExitTimerRef.current = null;
      }
    };
  }, [clearWrongJumpTimer]);

  useEffect(() => {
    if (!noteSavedToast) return;
    const timer = window.setTimeout(() => setNoteSavedToast(false), 2200);
    return () => window.clearTimeout(timer);
  }, [noteSavedToast]);

  useEffect(() => {
    if (!errorBookToast) return;
    const timer = window.setTimeout(() => setErrorBookToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [errorBookToast]);

  useEffect(() => {
    if (!centerStatusToast) return;
    const timer = window.setTimeout(() => setCenterStatusToast(null), 1200);
    return () => window.clearTimeout(timer);
  }, [centerStatusToast]);

  useEffect(() => {
    if (!archiveToastOpen) return;
    const timer = window.setTimeout(() => {
      setArchiveToastOpen(false);
      if (archiveToastNextIndex !== null) {
        emblaApi?.scrollTo(archiveToastNextIndex);
      }
      setArchiveToastNextIndex(null);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [archiveToastNextIndex, archiveToastOpen, emblaApi]);

  const handleConfirmArchive = async () => {
    if (!errorBookEnabled || archiveTargetQuestionId === null || archivePending) return;
    setArchivePending(true);
    try {
      archiveErrorBookItem({
        mode: errorBookMode,
        sectionId: errorBookSectionId,
        questionId: archiveTargetQuestionId,
      });
      setArchiveConfirmOpen(false);
      setArchiveTargetQuestionId(null);
      // 归档成功：在“本题”居中轻提示，关闭后再跳下一题，避免串到下一题题干下
      setArchiveToastNextIndex(qIndex < questions.length - 1 ? qIndex + 1 : null);
      setArchiveToastOpen(true);
    } catch {
      setErrorBookToast('归档失败，请重试');
    } finally {
      setArchivePending(false);
    }
  };

  return (
    <div
      ref={pageRootRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          height: 'var(--foco-header-height)',
          padding: 'var(--foco-header-pt) var(--foco-header-px) var(--foco-header-pb)',
          borderBottom: '0.653px solid rgba(0,0,0,0.06)',
        }}
      >
        <button
          onClick={() => {
            if (returnPath) {
              setExitConfirmOpen(true);
            } else {
              navigate(-1);
            }
          }}
          style={{
            width: 31.997,
            height: 31.997,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '50%',
            flexShrink: 0,
            padding: 0,
          }}
        >
          <ChevronLeft style={{ width: 20, height: 20, color: '#003459', strokeWidth: 2.4 }} />
        </button>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              lineHeight: '16.5px',
              letterSpacing: '0.0645px',
              color: '#8E98A8',
              fontWeight: 500,
              maxWidth: fromErrors ? 180 : undefined,
              overflow: fromErrors ? 'hidden' : undefined,
              textOverflow: fromErrors ? 'ellipsis' : undefined,
              whiteSpace: fromErrors ? 'nowrap' : undefined,
            }}
          >
            {headerSubtitle}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: '21px',
              letterSpacing: '-0.1504px',
              fontWeight: 600,
              color: '#1A1F24',
            }}
          >
            {fromErrors ? '错题本' : headerTitle}
          </p>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: '#8E98A8',
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {progressCurrent} / {totalForDisplay}
        </p>
      </div>

      {exitConfirmOpen && (
        <QuizCenterDialog
          zIndexBackdrop={72}
          zIndexPanel={73}
          onBackdropClick={() => setExitConfirmOpen(false)}
        >
          <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1A1F24' }}>退出提示</p>
          <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.45, color: '#667280' }}>
            是否确认退出答题？
          </p>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, minWidth: 0 }}>
            <button
              type="button"
              onClick={() => setExitConfirmOpen(false)}
              style={{
                flex: 1,
                minWidth: 0,
                height: 44,
                borderRadius: 999,
                border: '1px solid rgba(0,52,89,0.18)',
                background: '#fff',
                color: '#003459',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => {
                setExitConfirmOpen(false);
                navigate(returnPath, { state: (location.state as any)?.returnState ?? undefined });
              }}
              style={{
                flex: 1,
                minWidth: 0,
                height: 44,
                borderRadius: 999,
                border: 'none',
                background: '#003459',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              退出
            </button>
          </div>
        </QuizCenterDialog>
      )}

      {resumePromptOpen && (
        <QuizCenterDialog
          zIndexBackdrop={70}
          zIndexPanel={71}
          onBackdropClick={() => {
            setResumePromptOpen(false);
            setCanPersistProgress(true);
            setQIndex(resumeDetectedIndex);
            emblaApi?.scrollTo(resumeDetectedIndex);
          }}
        >
          <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1A1F24' }}>答题记录</p>
          <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.45, color: '#667280' }}>
            检测到上次练习到第{resumeDetectedIndex + 1}题，是否继续？
          </p>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, minWidth: 0 }}>
            <button
              type="button"
              onClick={() => {
                clearStoredProgressIndex();
                setResumePromptOpen(false);
                setCanPersistProgress(true);
                setQIndex(0);
                emblaApi?.scrollTo(0);
              }}
              style={{
                flex: 1,
                minWidth: 0,
                height: 44,
                borderRadius: 999,
                border: '1px solid rgba(0,52,89,0.18)',
                background: '#fff',
                color: '#003459',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              重做
            </button>
            <button
              type="button"
              onClick={() => {
                setResumePromptOpen(false);
                setCanPersistProgress(true);
                setQIndex(resumeDetectedIndex);
                emblaApi?.scrollTo(resumeDetectedIndex);
              }}
              style={{
                flex: 1,
                minWidth: 0,
                height: 44,
                borderRadius: 999,
                border: 'none',
                background: '#003459',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              继续
            </button>
          </div>
        </QuizCenterDialog>
      )}

      {archiveToastOpen && <CenterStatusToast message="已归档至已掌握" />}
      {centerStatusToast && <CenterStatusToast message={centerStatusToast} />}

      {/* ── Main area ── */}
      <div
        ref={mainAreaRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
          position: 'relative',
        }}
      >
        <div
          ref={emblaRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            touchAction: 'pan-y pinch-zoom',
            cursor: questions.length > 1 ? 'grab' : 'default',
          }}
        >
          <div style={{ display: 'flex', height: '100%' }}>
            {questions.map((question, slideIndex) => {
              const slideSelected = answers[slideIndex] ?? null;
              const slideAnswered = slideSelected !== null;
              const slideIsCorrect = slideAnswered && slideSelected === question.correct;
              const slideAnalysisVisible = revealedAnalysis[slideIndex] === true;
              const slideAutoJumping =
                autoJumpingToAnalysis && pendingWrongQuestionRef.current === slideIndex;
              const showBottomBarPadding = slideIndex === qIndex && slideAnalysisVisible;
              const defaultOptionBg = 'rgba(0, 0, 0, 0.04)';
              const hoverOptionBg = 'rgba(0, 0, 0, 0.06)';

              return (
                <div
                  key={question.id}
                  style={{
                    flex: '0 0 100%',
                    minWidth: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: fromErrors ? '22px 20px 12px' : '20px 20px 12px',
                      paddingBottom: showBottomBarPadding ? bottomBarHeight + 12 : 12,
                    }}
                  >
                    <p
                      style={{
                        fontSize: isReferenceLayout ? 16 : fromErrors ? 18 : 17,
                        fontWeight: isReferenceLayout ? 400 : 600,
                        color: isReferenceLayout ? '#1C2B39' : fromErrors ? 'rgba(28,43,58,0.95)' : '#1A1F24',
                        lineHeight: isReferenceLayout ? '26px' : fromErrors ? 'normal' : '28.05px',
                        letterSpacing: isReferenceLayout ? undefined : fromErrors ? undefined : '-0.4316px',
                        marginBottom: isReferenceLayout ? 18 : 24,
                        paddingLeft: fromErrors && !isReferenceLayout ? 7 : 0,
                      }}
                    >
                      {question.question}
                    </p>

                    {isReferenceLayout ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {question.options.map((opt, optionIndex) => {
                          const visual = referenceOptionVisual(
                            slideAnswered,
                            slideSelected === optionIndex,
                            optionIndex === question.correct,
                            slideIsCorrect,
                          );
                          return (
                            <QuizReferenceOptionRow
                              key={optionIndex}
                              letter={optionLetter(optionIndex)}
                              text={stripOptionPrefix(opt)}
                              visual={visual}
                              disabled={slideAnswered || slideAutoJumping}
                              onClick={() => handleSelect(slideIndex, optionIndex)}
                            />
                          );
                        })}
                      </div>
                    ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {question.options.map((opt, optionIndex) => {
                        const isSelected = slideSelected === optionIndex;
                        const isCorrectOption = optionIndex === question.correct;
                        const showWrongFlowState = slideAnswered && !slideIsCorrect;

                        let bg = defaultOptionBg;
                        let border = '1px solid rgba(0,0,0,0)';
                        let color = fromErrors ? 'rgba(28,43,58,0.92)' : '#1A1F24';
                        let minHeight = fromErrors ? 56 : 57.107;
                        let fontSize = fromErrors ? 14 : 15;
                        let padding = fromErrors ? '0 14px' : '16.2637px 17.3046px';
                        let borderRadius = 16;

                        if (slideAnswered && slideIsCorrect && isSelected) {
                          bg = 'rgba(52,199,89,0.14)';
                          border = '1px solid #34C759';
                          color = '#1F7A41';
                        } else if (showWrongFlowState && isSelected) {
                          bg = 'rgba(255,59,48,0.12)';
                          border = '1px solid #FF3B30';
                          color = '#B42318';
                        } else if (showWrongFlowState && isCorrectOption) {
                          bg = 'rgba(52,199,89,0.12)';
                          border = '1px solid #34C759';
                          color = '#1F7A41';
                        }

                        return (
                          <button
                            key={optionIndex}
                            type="button"
                            onClick={() => handleSelect(slideIndex, optionIndex)}
                            disabled={slideAnswered || slideAutoJumping}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding,
                              borderRadius,
                              border,
                              background: bg,
                              fontSize,
                              color,
                              lineHeight: fromErrors ? 'normal' : '22.5px',
                              letterSpacing: fromErrors ? undefined : '-0.2344px',
                              minHeight,
                              display: 'flex',
                              alignItems: 'center',
                              cursor: slideAnswered ? 'default' : 'pointer',
                              transition: 'background 0.12s, border-color 0.12s',
                            }}
                            onMouseEnter={(e) => {
                              if (!slideAnswered) {
                                (e.currentTarget as HTMLButtonElement).style.background = hoverOptionBg;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!slideAnswered) {
                                (e.currentTarget as HTMLButtonElement).style.background = defaultOptionBg;
                              }
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    )}

                    {isReferenceLayout && slideAnswered && slideSelected !== null && (
                      <QuizAnswerStatsBar
                        correctIndex={question.correct}
                        selectedIndex={slideSelected}
                        siteAttempts={question.siteAttempts ?? 7580}
                        siteAccuracy={question.siteAccuracy ?? 73.2}
                      />
                    )}

                    {errorBookEnabled && slideAnswered && (() => {
                      const status = getErrorBookItemState({
                        mode: errorBookMode,
                        sectionId: errorBookSectionId,
                        questionId: question.id,
                      });
                      const remain = Math.max(0, 3 - status.masteryProgress);
                      const helperText = status.archived
                        ? '已归档到已掌握'
                        : status.canArchive
                          ? '你已连续答对三次，可归档至已掌握'
                          : `再答对 ${remain} 次即可归档至已掌握`;

                      const hasRepeatedWrongBar = status.repeatedWrong;
                      const showArchiveFooterBar =
                        status.canArchive && !status.archived && slideIndex === qIndex;

                      return (
                        <div
                          style={{
                            marginTop: 14,
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <div
                            style={{
                              padding: '12px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 10,
                              background: MASTERY_CARD_BG,
                              border: MASTERY_CARD_BORDER,
                              borderRadius: MASTERY_CARD_RADIUS,
                              position: 'relative',
                              zIndex: 2,
                              overflow: 'hidden',
                              ...(showArchiveFooterBar || hasRepeatedWrongBar
                                ? {
                                    borderBottomLeftRadius: 0,
                                    borderBottomRightRadius: 0,
                                  }
                                : {}),
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: MASTERY_TITLE_COLOR,
                                }}
                              >
                                掌握进度
                              </p>
                              <MasteryDots progress={status.masteryProgress} size={9} gap={6} />
                            </div>
                            <p style={{ margin: 0, fontSize: 13, color: '#5F6B78' }}>{helperText}</p>
                          </div>
                          {showArchiveFooterBar && (
                            <ArchiveToMasteredFooterBar
                              pending={archivePending}
                              connectBelow={hasRepeatedWrongBar}
                              onClick={() => {
                                setArchiveTargetQuestionId(question.id);
                                setArchiveConfirmOpen(true);
                              }}
                            />
                          )}
                          {hasRepeatedWrongBar && <RepeatedWrongFooterBar />}
                        </div>
                      );
                    })()}

                    {slideAnalysisVisible && (
                      <QuizInlineAnalysis
                        key={question.id}
                        question={question}
                        onOpenQuizNote={
                          enableQuizNote && slideIndex === qIndex
                            ? (highlightedText) => {
                                setQuizNoteHighlightText(highlightedText);
                                setQuizNoteTargetIndex(slideIndex);
                                setQuizNoteOpen(true);
                              }
                            : undefined
                        }
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {enableQuizNote && (
          <QuizAddNoteSheet
            open={quizNoteOpen}
            onOpenChange={setQuizNoteOpen}
            overlayContainerRef={mainAreaRef}
            question={questions[quizNoteTargetIndex] ?? questions[qIndex]}
            questionIndex={quizNoteTargetIndex}
            returnPath={quizReturnPath}
            mode={mode === 'sprint' ? 'sprint' : 'basic'}
            chapterName={stateChapterName ?? chapterName ?? undefined}
            sectionName={sectionName}
            highlightedSnippet={quizNoteHighlightText}
            onSaved={() => setNoteSavedToast(true)}
          />
        )}

        {noteSavedToast && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 12,
              transform: 'translateX(-50%)',
              zIndex: 50,
              padding: '10px 16px',
              borderRadius: 999,
              background: 'rgba(0,52,89,0.92)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,52,89,0.2)',
              pointerEvents: 'none',
            }}
          >
            已保存到刷题笔记
          </div>
        )}

        {errorBookToast && !fromErrors && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: noteSavedToast ? 56 : 12,
              transform: 'translateX(-50%)',
              zIndex: 55,
              padding: '10px 16px',
              borderRadius: 999,
              background: 'rgba(0,52,89,0.92)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,52,89,0.2)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {errorBookToast}
          </div>
        )}

        {archiveConfirmOpen && (
          <>
            <div
              onClick={() => {
                if (!archivePending) {
                  setArchiveConfirmOpen(false);
                  setArchiveTargetQuestionId(null);
                }
              }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.28)',
                zIndex: 58,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 16,
                right: 16,
                bottom: 24,
                borderRadius: 18,
                background: '#fff',
                zIndex: 59,
                padding: 16,
                boxShadow: '0 14px 34px rgba(0,0,0,0.16)',
              }}
            >
              <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1A1F24' }}>归档这道题？</p>
              <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.45, color: '#667280' }}>
                归档后将移动到“已掌握”，后续答错会自动复活。
              </p>
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  disabled={archivePending}
                  onClick={() => {
                    setArchiveConfirmOpen(false);
                    setArchiveTargetQuestionId(null);
                  }}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 999,
                    border: '1px solid rgba(0,52,89,0.18)',
                    background: '#fff',
                    color: '#003459',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: archivePending ? 'not-allowed' : 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={archivePending}
                  onClick={handleConfirmArchive}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 999,
                    border: 'none',
                    background: archivePending ? 'rgba(0,52,89,0.45)' : '#003459',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: archivePending ? 'wait' : 'pointer',
                  }}
                >
                  {archivePending ? '处理中...' : '确认归档'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {currentAnalysisVisible && (
        <QuizNotUnderstandFlow
          ref={footerRef}
          overlayContainerRef={mainAreaRef}
          flowOverlayContainerRef={pageRootRef}
          mode={mode}
          open={notUnderstandOpen}
          onOpenChange={setNotUnderstandOpen}
          onBusyChange={setFlowBusy}
          questionContext={{
            questionText: questions[qIndex]?.question ?? '',
            options: questions[qIndex]?.options ?? [],
            topic: questions[qIndex]?.topic,
            selectedAnswerIndex: answers[qIndex] ?? null,
          }}
        >
          <div
            style={{
              padding: notUnderstandOpen ? '8px 20px 0' : '11px 20px 0',
              display: 'flex',
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={handleLeftAction}
              style={{
                width: 85,
                height: 54,
                borderRadius: 999,
                background: leftButtonActive ? 'rgba(0,167,225,0.12)' : '#00A7E1',
                color: leftButtonActive ? '#00A7E1' : '#fff',
                border: leftButtonActive ? '1.5px solid rgba(0,167,225,0.4)' : 'none',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0,52,89,0.08), 0 10px 22px rgba(0,52,89,0.18)',
              }}
            >
              不懂
            </button>

            <button
              type="button"
              onClick={handleNext}
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
                boxShadow: '0 2px 6px rgba(0,52,89,0.08), 0 10px 22px rgba(0,52,89,0.18)',
              }}
            >
              {qIndex < questions.length - 1 ? '懂了，下一题' : '懂了，完成本节'}
            </button>
          </div>
          <div style={{ height: 'max(24px, env(safe-area-inset-bottom))', minHeight: 24 }} />
        </QuizNotUnderstandFlow>
      )}
    </div>
  );
}
