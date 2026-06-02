import { useCallback, useEffect, useRef, useState } from 'react';
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
  getErrorBookItemState,
  recordErrorBookAnswer,
  type ErrorBookMode,
} from '../lib/errorBookArchive';

const DEFAULT_BOTTOM_BAR_H = 100;

export type { QuizQuestion };
export { QUESTIONS };

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
  const fromErrors = (location.state as any)?.fromErrors ?? false;

  const questions = questionsProp ?? (id && QUESTIONS_BY_CHAPTER[id]) ?? QUESTIONS;

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
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealedAnalysis, setRevealedAnalysis] = useState<Record<number, boolean>>({});
  const [autoJumpingToAnalysis, setAutoJumpingToAnalysis] = useState(false);
  const wrongJumpTimerRef = useRef<number | null>(null);
  const pendingWrongQuestionRef = useRef<number | null>(null);

  const [notUnderstandOpen, setNotUnderstandOpen] = useState(false);
  const [flowBusy, setFlowBusy] = useState(false);
  const [quizNoteOpen, setQuizNoteOpen] = useState(false);
  const [quizNoteHighlightText, setQuizNoteHighlightText] = useState('');
  const [quizNoteTargetIndex, setQuizNoteTargetIndex] = useState(0);
  const [noteSavedToast, setNoteSavedToast] = useState(false);
  const [errorBookToast, setErrorBookToast] = useState<string | null>(null);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveTargetQuestionId, setArchiveTargetQuestionId] = useState<number | null>(null);
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
  const errorBookMode: ErrorBookMode = mode === 'sprint' ? 'sprint' : 'basic';
  const errorBookSectionId = fromErrors ? id ?? '' : '';
  const errorBookEnabled = fromErrors && errorBookSectionId.length > 0;
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
        setErrorBookToast('该题已复活回错题本');
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
      setErrorBookToast('已归档到已掌握');
      if (qIndex < questions.length - 1) {
        emblaApi?.scrollTo(qIndex + 1);
      }
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
          onClick={() => navigate(-1)}
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

        {fromErrors ? (
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                lineHeight: '16.5px',
                letterSpacing: '0.0645px',
                color: '#8E98A8',
                fontWeight: 500,
                maxWidth: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {headerSubtitle}
            </p>
            <div
              style={{
                height: 30,
                padding: '0 18px',
                borderRadius: 999,
                background: '#003459',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '-0.31px',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {headerTitle}
            </div>
            <div style={{ marginTop: 2 }}>
              <MasteryDots progress={currentErrorBookState?.masteryProgress ?? 0} size={8} gap={6} />
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                lineHeight: '16.5px',
                letterSpacing: '0.0645px',
                color: '#8E98A8',
                fontWeight: 500,
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
              {headerTitle}
            </p>
          </div>
        )}

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

                    {errorBookEnabled && slideAnswered && (
                      <div
                        style={{
                          marginTop: 14,
                          borderRadius: 14,
                          background: '#F5F8FA',
                          border: '1px solid rgba(0,52,89,0.08)',
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 13,
                              fontWeight: 600,
                              color: '#003459',
                            }}
                          >
                            掌握进度
                          </p>
                          <MasteryDots
                            progress={
                              getErrorBookItemState({
                                mode: errorBookMode,
                                sectionId: errorBookSectionId,
                                questionId: question.id,
                              }).masteryProgress
                            }
                            size={9}
                            gap={6}
                          />
                        </div>

                        {(() => {
                          const status = getErrorBookItemState({
                            mode: errorBookMode,
                            sectionId: errorBookSectionId,
                            questionId: question.id,
                          });
                          const remain = Math.max(0, 3 - status.masteryProgress);
                          const helperText = status.archived
                            ? '已归档到已掌握'
                            : status.canArchive
                              ? '已满足归档条件'
                              : `再答对 ${remain} 次即可归档`;
                          return (
                            <>
                              <p style={{ margin: 0, fontSize: 13, color: '#5F6B78' }}>{helperText}</p>
                              {status.canArchive && !status.archived && slideIndex === qIndex && (
                                <button
                                  type="button"
                                  disabled={archivePending}
                                  onClick={() => {
                                    setArchiveTargetQuestionId(question.id);
                                    setArchiveConfirmOpen(true);
                                  }}
                                  style={{
                                    width: '100%',
                                    height: 42,
                                    borderRadius: 999,
                                    border: 'none',
                                    background: archivePending ? 'rgba(0,52,89,0.45)' : '#003459',
                                    color: '#fff',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: archivePending ? 'wait' : 'pointer',
                                  }}
                                >
                                  {archivePending ? '归档中...' : '归档到已掌握'}
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}

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

        {errorBookToast && (
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
