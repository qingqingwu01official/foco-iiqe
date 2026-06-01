import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AnalysisConfusionTabs from './AnalysisConfusionTabs';
import {
  resolveAnalysisTabs,
  segmentMatchesTabs,
  type AnalysisSegment,
  type ConfusionTabId,
} from '../types/analysis';
import { FocoOwlLogo } from './FocoAssets';
import { DEFAULT_QA_AI_NOTE_BODY } from '../lib/qaFlowContext';

// ── Constants ─────────────────────────────────────────────────────────────

const OPT_LETTERS = ['A', 'B', 'C', 'D'];

const FEEDBACK_OPTS = [
  { id: 'teacher',  label: '赵老师答疑'   },
  { id: 'a',        label: 'A 选项\n不懂' },
  { id: 'b',        label: 'B 选项\n不懂' },
  { id: 'c',        label: 'C 选项\n不懂' },
  { id: 'd',        label: 'D 选项\n不懂' },
  { id: 'mistake',  label: '误选了'       },
  { id: 'careless', label: '粗心\n大意'   },
  { id: 'other',    label: '其他\n原因'   },
];

// Height of the fixed bottom button bar (padding-top 14 + btn 54 + padding-bottom 36 = 104)
const BOTTOM_BAR_H = 104;
const DESIGN_WIDTH = 393;
const DESIGN_HEIGHT = 853;

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

type ModalState = 'hidden' | 'feedback' | 'recorded';
type ExtendSheetType = 'none' | 'deep' | 'easyMistake';
type FlowStage = 'none' | 'chat' | 'aiPreview' | 'noteAdded';

// ── Main Component ─────────────────────────────────────────────────────────

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) ?? {};

  const {
    question: q,
    selected,
    isCorrect,
    mode,
    subject,
    qIndex = 0,
    totalQ = 5,
    chapterName,
    topLabel,
    returnPath,
    returnState,
    displayTotalQ,
    sequenceTotalQ,
    extendMode: stateExtendMode,
  } = state;

  const [confusionTabs, setConfusionTabs] = useState<Set<ConfusionTabId>>(new Set(['知识块']));
  const [modalState, setModalState] = useState<ModalState>('hidden');
  const [extendSheetType, setExtendSheetType] = useState<ExtendSheetType>('none');
  const [flowStage, setFlowStage] = useState<FlowStage>('none');
  const [feedbacks, setFeedbacks] = useState<Set<string>>(new Set());
  const [aiNoteBody, setAiNoteBody] = useState(DEFAULT_QA_AI_NOTE_BODY);
  const [aiNoteEditing, setAiNoteEditing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const aiNoteTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (flowStage !== 'aiPreview') setAiNoteEditing(false);
  }, [flowStage]);

  useEffect(() => {
    if (!aiNoteEditing) return;
    const timer = window.setTimeout(() => aiNoteTextareaRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [aiNoteEditing]);

  // ── No question fallback ──
  if (!q) {
    return (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        }}
      >
        <p style={{ color: '#8E98A8', marginBottom: 16 }}>没有找到题目数据</p>
        <button
          onClick={() => navigate(-1)}
          style={{ padding: '10px 24px', background: '#003459', color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
        >
          ← 返回刷题
        </button>
      </div>
    );
  }

  const segments: AnalysisSegment[] =
    q.analysisSegments?.length
      ? q.analysisSegments
      : [{ id: 'fallback', field: '知识块' as const, content: q.analysis }];

  const analysisTabs = resolveAnalysisTabs(segments, q.examMethod ?? '常规');

  const toggleFeedback = (fid: string) => {
    setFeedbacks((prev) => {
      const next = new Set(prev);
      next.has(fid) ? next.delete(fid) : next.add(fid);
      return next;
    });
  };

  const sectionNameFromReturn = (returnState as { sectionName?: string } | undefined)?.sectionName;
  const chapterIdFromReturnPath =
    typeof returnPath === 'string' ? returnPath.match(/\/quiz\/[^/]+\/(\d+)/)?.[1] : undefined;
  const derivedDisplayTotal =
    (sectionNameFromReturn && SECTION_TOTALS[sectionNameFromReturn]) ||
    (chapterIdFromReturnPath && CHAPTER_TOTALS[chapterIdFromReturnPath]) ||
    undefined;

  const displayTotal = displayTotalQ ?? derivedDisplayTotal ?? totalQ;
  const sequenceTotal = sequenceTotalQ ?? totalQ;

  const goNext = () => {
    const nextIndex = qIndex + 1;
    if (returnPath && nextIndex < sequenceTotal) {
      navigate(returnPath, { state: { ...(returnState ?? {}), questionIndex: nextIndex } });
    } else if (returnPath) {
      navigate(returnPath, { state: { ...(returnState ?? {}), questionIndex: 0 } });
    } else {
      navigate(-1);
    }
  };

  const handleNotUnderstand = () => {
    setExtendSheetType('none');
    setFlowStage('none');
    setFeedbacks(new Set());
    setModalState('feedback');
  };

  const handleFindTeacher = () => {
    setModalState('hidden');
    setFlowStage('chat');
  };

  const handleCloseModal = () => setModalState('hidden');
  const handleOpenExtendSheet = (sheetType: Exclude<ExtendSheetType, 'none'>) => {
    setModalState('hidden');
    setFlowStage('none');
    setExtendSheetType(sheetType);
  };
  const handleCloseExtendSheet = () => setExtendSheetType('none');
  const handleOpenTeacherChat = () => {
    setModalState('hidden');
    setFlowStage('chat');
  };
  const handleOpenAiPreview = () => setFlowStage('aiPreview');
  const handleAddNoteToList = () => {
    setAiNoteEditing(false);
    setFlowStage('noteAdded');
  };
  /** 回到发起「不懂找老师」时的同一张解析页，不跳下一题、不离开解析路由 */
  const handleReturnToAnalysis = () => {
    setFlowStage('none');
    setModalState('hidden');
    setExtendSheetType('none');
    setAiNoteBody(DEFAULT_QA_AI_NOTE_BODY);
    setAiNoteEditing(false);
  };

  const _navLabel = topLabel ?? (mode === 'sprint' ? '分重点练习' : '章节练习');
  const resolvedExtendMode = stateExtendMode ?? (q.isHard ? 'deep' : q.isEasyMistake ? 'easyMistake' : 'none');
  const extendMode: 'none' | 'deep' | 'easyMistake' =
    resolvedExtendMode === 'deep'
      ? 'deep'
      : resolvedExtendMode === 'errorProne' || resolvedExtendMode === 'easyMistake'
      ? 'easyMistake'
      : 'none';
  const progressFillWidth =
    displayTotal > 0
      ? Math.max(80, Math.min(DESIGN_WIDTH, ((qIndex + 1) / displayTotal) * DESIGN_WIDTH))
      : 80;
  const viewportWidth = typeof window === 'undefined' ? DESIGN_WIDTH : window.innerWidth;
  const viewportHeight = typeof window === 'undefined' ? DESIGN_HEIGHT : window.innerHeight;
  const scale = Math.min(1, viewportWidth / DESIGN_WIDTH, viewportHeight / DESIGN_HEIGHT);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#F2F4F6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: DESIGN_WIDTH,
            height: 86,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            zIndex: 2,
          }}
        >
          <div
            style={{
              height: 83,
              display: 'flex',
              alignItems: 'center',
              padding: 'var(--foco-header-pt) var(--foco-header-px) 0',
            }}
          >
            <button
              onClick={() => navigate(-1)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                border: 'none',
                background: '#F2F4F6',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <ChevronLeft style={{ width: 18, height: 18, color: '#003459', strokeWidth: 2.8 }} />
            </button>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 600,
                  color: '#1C2B39',
                }}
              >
                解析
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
              {qIndex + 1} / {displayTotal}
            </p>
          </div>

          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 3,
              background: '#EAEEF3',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: progressFillWidth,
              height: 3,
              background: '#003459',
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            top: 94,
            left: 20,
            width: 353,
            height: 199,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 4px 20px rgba(0,26,64,0.12)',
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
        <div style={{ display: 'flex', gap: 8, padding: '10px 14px 0' }}>
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: '#003459',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            Q
          </span>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              lineHeight: '19px',
              color: '#1C2B39',
            }}
          >
            {q.question}
          </p>
        </div>
        <div style={{ height: 1, background: '#EAEEF3', margin: '5px 14px 0' }} />

        <div style={{ marginTop: 0 }}>
          {q.options.map((opt: string, i: number) => {
            const isCorrectOption = i === q.correct;
            const isWrongSelected = selected === i && !isCorrectOption;
            const optText = opt.replace(/^[A-D]\.\s*/, '');
            const neutral = !isCorrectOption && !isWrongSelected;
            return (
              <div
                key={i}
                style={{
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  paddingLeft: 14,
                  paddingRight: 14,
                  borderTop: i > 0 ? '1px solid #EAEEF3' : 'none',
                  borderLeft: isCorrectOption ? '3px solid #003459' : isWrongSelected ? '3px solid #C0614D' : '3px solid transparent',
                  background: isWrongSelected ? 'rgba(192,97,77,0.10)' : '#FFFFFF',
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    background: isCorrectOption ? '#003459' : isWrongSelected ? '#C0614D' : '#000000',
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {OPT_LETTERS[i]}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    lineHeight: 'normal',
                    color: isCorrectOption ? '#003459' : isWrongSelected ? '#C0614D' : '#B0B8C1',
                    fontWeight: neutral ? 400 : 600,
                  }}
                >
                  {optText}
                </span>
              </div>
            );
          })}
        </div>
        </div>

        <div
          style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', minHeight: 0 }}
        />

        <div
          style={{
            position: 'absolute',
            top: 315,
            left: 20,
            width: 353,
            height: 452,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 4px 20px rgba(0,26,64,0.12)',
            overflow: 'hidden',
          }}
        >
        <div style={{ padding: '12px 16px 8px' }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1C2B39' }}>解析</p>
        </div>

        <AnalysisConfusionTabs
          tabs={analysisTabs}
          activeTabs={confusionTabs}
          onChange={setConfusionTabs}
          style={{ padding: '0 16px 8px', marginBottom: 0 }}
        />

        <div
          ref={scrollRef}
          style={{
            height: 352,
            overflowY: 'auto',
            padding: '0 16px 16px',
          }}
        >
          <p style={{ margin: 0, fontSize: 14, color: '#1C2B39', lineHeight: '24.5px', whiteSpace: 'pre-wrap' }}>
            {segments.map((seg, i) => {
              const highlighted = segmentMatchesTabs(seg, confusionTabs);
              return (
                <span key={seg.id}>
                  {i > 0 ? '\n\n' : null}
                  <mark
                    style={
                      highlighted
                        ? {
                            background: 'rgba(0,167,225,0.3)',
                            color: 'inherit',
                            boxDecorationBreak: 'clone',
                            WebkitBoxDecorationBreak: 'clone' as const,
                            padding: '0 2px',
                            borderRadius: 2,
                          }
                        : { background: 'transparent', color: 'inherit', padding: 0 }
                    }
                  >
                    {seg.content}
                  </mark>
                </span>
              );
            })}
          </p>

          {extendMode === 'deep' && (
            <div
              onClick={() => handleOpenExtendSheet('deep')}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: '0.653px solid rgba(0,52,89,0.12)',
                marginTop: 16,
                width: '100%',
                height: 194,
                background: '#003459',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  height: 44.649,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 16px 12.653px',
                  borderBottom: '0.653px solid rgba(0,52,89,0.08)',
                  background: '#003459',
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    lineHeight: '16px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                  }}
                >
                  深度解析
                </span>
                <span
                  style={{
                    fontSize: 12,
                    lineHeight: '18px',
                    fontWeight: 400,
                    color: '#8E98A8',
                    whiteSpace: 'nowrap',
                  }}
                >
                  重难点专项视频
                </span>
              </div>

              <div
                style={{
                  height: 149.351,
                  background: '#001E3C',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 47.996,
                    height: 47.996,
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '1.306px solid rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: 4,
                  }}
                >
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: '8.489px solid transparent',
                      borderBottom: '8.489px solid transparent',
                      borderLeft: '15.672px solid rgba(255,255,255,0.9)',
                    }}
                  />
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    lineHeight: '18px',
                    fontWeight: 400,
                    color: '#FFFFFF',
                  }}
                >
                  视频待上传
                </p>
              </div>
            </div>
          )}

          {extendMode === 'easyMistake' && (
            <div
              onClick={() => handleOpenExtendSheet('easyMistake')}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: '0.653px solid rgba(0,52,89,0.12)',
                marginTop: 16,
                width: '100%',
                height: 194,
                background: '#003459',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  height: 44.649,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 16px 12.653px',
                  borderBottom: '0.653px solid rgba(0,52,89,0.08)',
                  background: '#003459',
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    lineHeight: '16px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                  }}
                >
                  深度解析
                </span>
                <span
                  style={{
                    fontSize: 12,
                    lineHeight: '18px',
                    fontWeight: 400,
                    color: '#8E98A8',
                    whiteSpace: 'nowrap',
                  }}
                >
                  易错提醒
                </span>
              </div>

              <div
                style={{
                  height: 149.351,
                  background: '#001E3C',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 47.996,
                    height: 47.996,
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '1.306px solid rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: 4,
                  }}
                >
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: '8.489px solid transparent',
                      borderBottom: '8.489px solid transparent',
                      borderLeft: '15.672px solid rgba(255,255,255,0.9)',
                    }}
                  />
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    lineHeight: '18px',
                    fontWeight: 400,
                    color: '#FFFFFF',
                  }}
                >
                  视频待上传
                </p>
              </div>
            </div>
          )}
        </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 20,
            top: 772,
            width: 353,
            height: 76,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 0 12px',
            zIndex: 3,
          }}
        >
        <button
          onClick={handleNotUnderstand}
          style={{
            width: 85,
            height: 54,
            borderRadius: 999,
            background: modalState !== 'hidden' || flowStage !== 'none' ? 'rgba(0,167,225,0.12)' : '#00A7E1',
            color: modalState !== 'hidden' || flowStage !== 'none' ? '#00A7E1' : '#fff',
            border: modalState !== 'hidden' || flowStage !== 'none' ? '1.5px solid rgba(0,167,225,0.4)' : 'none',
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '-0.2344px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,52,89,0.08), 0 10px 22px rgba(0,52,89,0.18)',
          }}
        >
          不懂
        </button>
        <button
          onClick={goNext}
          style={{
            width: 256,
            height: 54,
            borderRadius: 999,
            background: '#003459',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '-0.2344px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,52,89,0.08), 0 10px 22px rgba(0,52,89,0.18)',
          }}
        >
          {qIndex < sequenceTotal - 1 ? '懂了，下一题' : '懂了，完成本节'}
        </button>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 72,
            boxShadow: '0 -3px 4px rgba(0,13,38,0.08)',
          }}
        />

        <AnimatePresence>
          {extendSheetType !== 'none' && (
            <>
              <motion.div
                key="extend-sheet-mask"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={handleCloseExtendSheet}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.28)',
                  zIndex: 34,
                }}
              />

              <motion.div
                key={`extend-sheet-panel-${extendSheetType}`}
                initial={{ y: 32, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 32, opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  left: 20,
                  top: 272,
                  width: 353,
                  height: 560,
                  borderRadius: 20,
                  background: '#FFFFFF',
                  overflow: 'hidden',
                  zIndex: 35,
                }}
              >
                <div
                  style={{
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 4,
                      borderRadius: 999,
                      background: 'rgba(0,0,0,0.12)',
                    }}
                  />
                </div>

                <div
                  style={{
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px 12px 16px',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#1C2B3A' }}>
                    {extendSheetType === 'deep' ? '深度解析' : '易错提醒'}
                  </p>
                  <button
                    onClick={handleCloseExtendSheet}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      border: 'none',
                      background: 'rgba(0,0,0,0.05)',
                      color: '#8E98A8',
                      fontSize: 16,
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />

                <div
                  style={{
                    height: 483,
                    padding: '14px 16px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 321,
                      height: 420,
                      borderRadius: 16,
                      background: '#000000',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,30,60,0.82)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 999,
                          background: 'rgba(255,255,255,0.15)',
                          border: '1.5px solid rgba(255,255,255,0.25)',
                        }}
                      />
                      <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                        {extendSheetType === 'deep' ? '竖屏视频待上传' : '示意图 · 易混点对比'}
                      </p>
                    </div>
                  </div>

                  {extendSheetType === 'deep' ? (
                    <p style={{ margin: 0, fontSize: 12, color: '#8E98A8' }}>支持拖动进度、倍速与字幕（示意）</p>
                  ) : (
                    <div style={{ fontSize: 12, color: '#8E98A8', lineHeight: 1.4 }}>
                      <p style={{ margin: 0 }}>很多考生会把概念 A 与概念 B 混为一谈。建议用「目的」与「手段」来区分：</p>
                      <p style={{ margin: 0 }}>- 目的：……</p>
                      <p style={{ margin: 0 }}>- 手段：……</p>
                      <p style={{ margin: 0 }}>&nbsp;</p>
                      <p style={{ margin: 0 }}>记忆点：先问“要控制什么”，再问“用什么方法”。</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {flowStage !== 'none' && (
            <>
              <motion.div
                key="flow-mask"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleReturnToAnalysis}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(246,251,255,0.72)',
                  zIndex: 42,
                }}
              />

              {flowStage === 'chat' && (
                <motion.div
                  key="flow-chat"
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 24, opacity: 0 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    left: 20,
                    top: 126,
                    width: 353,
                    height: 642,
                    borderRadius: 24,
                    background: '#FFFFFF',
                    overflow: 'hidden',
                    zIndex: 43,
                  }}
                >
                  <div style={{ height: 73, borderBottom: '1px solid #F2F4F6', padding: '18px 18px 0', position: 'relative' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 18, background: '#00A7E1', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 700 }}>赵</div>
                    <p style={{ margin: 0, position: 'absolute', left: 66, top: 22, fontSize: 16, fontWeight: 600, color: '#1C2B39' }}>赵老师 · 一对一答疑</p>
                    <p style={{ margin: 0, position: 'absolute', left: 66, top: 46, fontSize: 12, color: '#8E98A8' }}>已接入答疑会话，可转 AI 笔记</p>
                  </div>

                  <div style={{ padding: '22px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ width: 254, borderRadius: 14, background: '#E8F3FA', padding: '18px 14px', fontSize: 13, lineHeight: '19px', color: '#1C2B39' }}>
                      你卡在 B/C 选项理解上，我先用对比法拆解。
                    </div>
                    <div style={{ alignSelf: 'flex-end', width: 245, borderRadius: 14, background: '#003459', padding: '16px 14px', fontSize: 13, lineHeight: '19px', color: '#FFFFFF' }}>
                      明白了，我总把“风险投机”当成管理步骤。
                    </div>
                    <div style={{ width: 276, borderRadius: 14, background: '#E8F3FA', padding: '16px 14px', fontSize: 13, lineHeight: '19px', color: '#1C2B39' }}>
                      <p style={{ margin: 0 }}>记忆口诀：识别-评估-应对-监控。</p>
                      <p style={{ margin: 0 }}>聊完可点下方按钮，AI 会整理成笔记。</p>
                    </div>
                    <div style={{ width: 321, borderRadius: 12, background: 'rgba(232,243,250,0.65)', padding: '11px 16px', fontSize: 12, fontWeight: 500, color: '#003459' }}>
                      本次答疑内容可一键整理并加入笔记列表
                    </div>
                  </div>

                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 141, height: 1, background: '#F2F4F6' }} />
                  <div style={{ position: 'absolute', left: 16, right: 16, bottom: 74, height: 48, borderRadius: 12, background: '#F2F4F6', display: 'flex', alignItems: 'center', paddingLeft: 14, fontSize: 13, color: '#8E98A8' }}>
                    输入你的追问…
                  </div>
                  <button
                    onClick={handleOpenAiPreview}
                    style={{
                      position: 'absolute',
                      left: 16,
                      right: 16,
                      bottom: 18,
                      height: 44,
                      border: 'none',
                      borderRadius: 12,
                      background: '#003459',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    AI整理答疑笔记
                  </button>
                </motion.div>
              )}

              {flowStage === 'aiPreview' && (
                <motion.div
                  key="flow-ai-preview"
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 24, opacity: 0 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    left: 20,
                    top: 178,
                    width: 353,
                    height: 520,
                    borderRadius: 24,
                    background: '#FFFFFF',
                    overflow: 'hidden',
                    zIndex: 43,
                    padding: '28px 24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: 20, lineHeight: '28px', fontWeight: 600, color: '#1C2B39' }}>AI 已整理本次答疑笔记</p>
                    <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: '18px', color: '#8E98A8' }}>建议保存到“风险管理-易错点”目录</p>
                  </div>

                  <div style={{ flex: 1, minHeight: 0, marginTop: 22, overflowY: 'auto' }}>
                    {aiNoteEditing ? (
                      <textarea
                        ref={aiNoteTextareaRef}
                        value={aiNoteBody}
                        onChange={(e) => setAiNoteBody(e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: 220,
                          height: '100%',
                          borderRadius: 12,
                          border: '1.5px solid #00A7E1',
                          background: '#FFFFFF',
                          padding: '16px 14px',
                          fontSize: 13,
                          lineHeight: '20px',
                          color: '#1C2B39',
                          outline: 'none',
                          resize: 'none',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box',
                        }}
                      />
                    ) : (
                      aiNoteBody
                        .split(/\n\s*\n/)
                        .filter((block) => block.trim())
                        .map((block, index) => (
                          <div
                            key={`${index}-${block.slice(0, 12)}`}
                            style={{
                              marginTop: index === 0 ? 0 : 12,
                              borderRadius: 12,
                              background: 'rgba(232,243,250,0.75)',
                              padding: '16px 14px',
                              fontSize: 13,
                              lineHeight: '20px',
                              color: '#1C2B39',
                            }}
                          >
                            {block.split('\n').map((line) => (
                              <p key={line} style={{ margin: 0 }}>
                                {line}
                              </p>
                            ))}
                          </div>
                        ))
                    )}
                  </div>

                  {!aiNoteEditing && (
                    <div style={{ flexShrink: 0, marginTop: 16, width: 160, height: 30, borderRadius: 15, background: 'rgba(0,52,89,0.08)', display: 'flex', alignItems: 'center', paddingLeft: 12, fontSize: 12, fontWeight: 500, color: '#003459' }}>
                      #答疑 #易错题 #风险管理
                    </div>
                  )}

                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                    <button
                      type="button"
                      onClick={() => setAiNoteEditing((prev) => !prev)}
                      style={{
                        height: 40,
                        border: 'none',
                        borderRadius: 12,
                        background: aiNoteEditing ? 'rgba(0,167,225,0.12)' : '#F2F4F6',
                        color: aiNoteEditing ? '#00A7E1' : '#8E98A8',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {aiNoteEditing ? '完成编辑' : '编辑AI笔记'}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNoteToList}
                      style={{
                        height: 44,
                        border: 'none',
                        borderRadius: 12,
                        background: '#003459',
                        color: '#FFFFFF',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      添加进笔记列表
                    </button>
                  </div>
                </motion.div>
              )}

              {flowStage === 'noteAdded' && (
                <motion.div
                  key="flow-note-added"
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 24, opacity: 0 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    left: 20,
                    top: 146,
                    width: 353,
                    height: 560,
                    borderRadius: 24,
                    background: '#FFFFFF',
                    overflow: 'hidden',
                    zIndex: 43,
                    padding: '24px 24px 20px',
                  }}
                >
                  <div style={{ height: 46, borderRadius: 12, background: 'rgba(33,159,94,0.14)', display: 'flex', alignItems: 'center', paddingLeft: 18, fontSize: 13, fontWeight: 600, color: '#219F5E' }}>
                    ✓ 已添加进笔记（可在列表中复习）
                  </div>
                  <p style={{ margin: '18px 0 0', fontSize: 18, lineHeight: '24px', fontWeight: 600, color: '#1C2B39' }}>笔记列表 · 风险管理</p>

                  <div style={{ marginTop: 14, borderRadius: 14, background: 'rgba(232,243,250,0.85)', padding: '16px 14px' }}>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: '19px', fontWeight: 600, color: '#1C2B39' }}>【新】风险投机 vs 风险管理（赵老师答疑）</p>
                    <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: '18px', color: '#8E98A8' }}>来源：3.4 解析页 · 不懂反馈弹窗</p>
                    <p style={{ margin: 0, fontSize: 12, lineHeight: '18px', color: '#8E98A8' }}>标签：易错点 / IIQE / 选项辨析</p>
                  </div>
                  <div style={{ marginTop: 10, height: 72, borderRadius: 12, background: 'rgba(242,244,246,0.7)', display: 'flex', alignItems: 'center', paddingLeft: 14, fontSize: 13, color: '#1C2B39', fontWeight: 500 }}>
                    高频错因：概念边界混淆
                  </div>
                  <div style={{ marginTop: 8, height: 72, borderRadius: 12, background: 'rgba(242,244,246,0.7)', display: 'flex', alignItems: 'center', paddingLeft: 14, fontSize: 13, color: '#1C2B39', fontWeight: 500 }}>
                    投连险产品要点速记
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/notes', { state: { mode } })}
                    style={{
                      position: 'absolute',
                      left: 24,
                      right: 24,
                      bottom: 74,
                      height: 40,
                      border: 'none',
                      borderRadius: 12,
                      background: '#F2F4F6',
                      color: '#8E98A8',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    查看完整笔记列表
                  </button>
                  <button
                    type="button"
                    onClick={handleReturnToAnalysis}
                    style={{
                      position: 'absolute',
                      left: 24,
                      right: 24,
                      bottom: 20,
                      height: 44,
                      border: 'none',
                      borderRadius: 12,
                      background: '#003459',
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    继续练习
                  </button>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

      {/* ═══════════════════════════════════════════════
          MODAL — 3.4 不懂反馈弹窗
          Overlay covers content above bottom bar
         ═══════════════════════════════════════════════ */}
        <AnimatePresence>
          {modalState !== 'hidden' && (
            <>
            {/* ── Overlay (dims content, not bottom bar) ── */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                bottom: BOTTOM_BAR_H,
                background: modalState === 'recorded'
                  ? 'rgba(240,245,255,0.72)'
                  : 'rgba(0,0,0,0.22)',
                backdropFilter: modalState === 'recorded' ? 'blur(14px)' : 'none',
                WebkitBackdropFilter: modalState === 'recorded' ? 'blur(14px)' : 'none',
                zIndex: 20,
                pointerEvents: 'none',
              }}
            />

            {/* ── 3.5: FOCO mascot + get! (shows in overlay area) ── */}
            <AnimatePresence>
              {modalState === 'recorded' && (
                <motion.div
                  key="mascot"
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 280, delay: 0.05 }}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    bottom: BOTTOM_BAR_H,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    zIndex: 21,
                    pointerEvents: 'none',
                  }}
                >
                  <FocoOwlLogo size={120} />
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#1C2B3A', letterSpacing: '0.01em' }}>
                    get！加入改进清单！
                  </p>
                  <p style={{ fontSize: 14, color: '#8E98A8' }}>已记录你的反馈，谢谢～</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Bottom sheet (slides up above bottom bar) ── */}
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 340 }}
              style={{
                position: 'absolute',
                bottom: BOTTOM_BAR_H,
                left: 0, right: 0,
                background: '#ffffff',
                borderRadius: '20px 20px 0 0',
                padding: '20px 20px 20px',
                zIndex: 30,
                boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
              }}
            >
              {/* Sheet header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1C2B3A' }}>
                  这道题哪里不明白？
                </p>
                <button
                  onClick={handleCloseModal}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.07)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, fontSize: 16, color: '#8E98A8',
                  }}
                >
                  ×
                </button>
              </div>

              {/* Sheet subtitle */}
              <p style={{ fontSize: 13, color: '#8E98A8', marginBottom: 16 }}>
                选择后找老师答疑（可多选）
              </p>

              {/* Feedback chips 4×2 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
                {FEEDBACK_OPTS.map((fb) => {
                  const on = feedbacks.has(fb.id);
                  return (
                    <button
                      key={fb.id}
                      onClick={() => {
                        if (fb.id === 'teacher') {
                          handleOpenTeacherChat();
                          return;
                        }
                        toggleFeedback(fb.id);
                      }}
                      style={{
                        padding: '10px 4px',
                        borderRadius: 10,
                        border: on ? '1.5px solid #00A7E1' : '1.5px solid transparent',
                        background: on ? 'rgba(0,167,225,0.12)' : 'rgba(0,0,0,0.05)',
                        color: on ? '#003459' : '#8E98A8',
                        fontSize: 11,
                        fontWeight: on ? 600 : 400,
                        lineHeight: 1.4,
                        whiteSpace: 'pre-line',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      {fb.label}
                    </button>
                  );
                })}
              </div>

              {/* CTA button */}
              <button
                onClick={handleFindTeacher}
                style={{
                  width: '100%', height: 52, borderRadius: 999,
                  background: '#00A7E1', color: '#fff',
                  fontSize: 16, fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                }}
              >
                找老师
              </button>
            </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
