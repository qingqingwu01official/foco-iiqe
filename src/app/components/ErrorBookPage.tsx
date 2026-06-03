import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { QUESTIONS } from '../data/quizQuestions';
import {
  countErrorBookQuestionsByListFilter,
  ensureErrorBookListDemoSeed,
  ensureRevivalDemoQuestion,
  sectionHasQuestionsInListFilter,
  summarizeSectionMasteryInListFilter,
  type ErrorBookListFilter,
  type ErrorBookMode,
  type SectionMasterySummary,
} from '../lib/errorBookArchive';

type SortMode = '按章节' | '按重要性';

interface SectionRow {
  id: string;
  name: string;
  done: number;
  total: number;
  accuracy: number;
  errorCount?: number;
}

interface ChapterGroup {
  id: number;
  name: string;
  done: number;
  total: number;
  accuracy: number;
  sections: SectionRow[];
}

interface LibraryGroup {
  id: string;
  name: string;
  done: number;
  total: number;
  accuracy: number;
  subsections: SectionRow[];
}

const SORT_OPTIONS: SortMode[] = ['按章节', '按重要性'];
const BUCKET_OPTIONS: Array<{ id: ErrorBookListFilter; label: string }> = [
  { id: 'pending', label: '待复习' },
  { id: 'mastered', label: '已掌握错题' },
];

function questionIdsForSection(section: SectionRow): number[] {
  const n = section.errorCount;
  if (n === undefined || n <= 0) return [];
  return QUESTIONS.slice(0, Math.min(n, QUESTIONS.length)).map((q) => q.id);
}

const REVIVAL_DEMO_SECTION_ID = '1a';
const REVIVAL_DEMO_QUESTION_INDEX = 1;

function mergeMasterySummaries(summaries: SectionMasterySummary[]): SectionMasterySummary {
  return summaries.reduce(
    (acc, item) => ({
      totalInFilter: acc.totalInFilter + item.totalInFilter,
      needThreeMore: acc.needThreeMore + item.needThreeMore,
      needTwoMore: acc.needTwoMore + item.needTwoMore,
      needOneMore: acc.needOneMore + item.needOneMore,
      masterySum: acc.masterySum + item.masterySum,
      repeatedWrong: acc.repeatedWrong + item.repeatedWrong,
    }),
    {
      totalInFilter: 0,
      needThreeMore: 0,
      needTwoMore: 0,
      needOneMore: 0,
      masterySum: 0,
      repeatedWrong: 0,
    },
  );
}

const BASIC_CHAPTERS: ChapterGroup[] = [
  {
    id: 1,
    name: '第一章：风险及保险',
    done: 1,
    total: 111,
    accuracy: 100,
    sections: [
      { id: '1a', name: 'A. 风险的概念', done: 1, total: 20, accuracy: 100, errorCount: 3 },
      { id: '1b', name: 'B. 风险的管理', done: 0, total: 91, accuracy: 0, errorCount: 12 },
    ],
  },
  {
    id: 2,
    name: '第二章：法律原则',
    done: 0,
    total: 68,
    accuracy: 0,
    sections: [
      { id: '2a', name: 'A. 基础法律原则', done: 0, total: 40, accuracy: 0, errorCount: 8 },
      { id: '2b', name: 'B. 合同法要点', done: 0, total: 28, accuracy: 0, errorCount: 5 },
    ],
  },
  {
    id: 3,
    name: '第三章：保险原则',
    done: 0,
    total: 55,
    accuracy: 0,
    sections: [
      { id: '3a', name: 'A. 可保利益', done: 0, total: 30, accuracy: 0, errorCount: 4 },
      { id: '3b', name: 'B. 最大诚信', done: 0, total: 25, accuracy: 0, errorCount: 2 },
    ],
  },
  { id: 4, name: '第四章：再保险', done: 0, total: 42, accuracy: 0, sections: [{ id: '4a', name: 'A. 再保险机制', done: 0, total: 42, accuracy: 0, errorCount: 1 }] },
  { id: 5, name: '第五章：保险监管', done: 0, total: 38, accuracy: 0, sections: [{ id: '5a', name: 'A. 监管框架', done: 0, total: 38, accuracy: 0, errorCount: 0 }] },
  { id: 6, name: '第六章：市场行为', done: 0, total: 44, accuracy: 0, sections: [{ id: '6a', name: 'A. 市场行为守则', done: 0, total: 44, accuracy: 0, errorCount: 0 }] },
  { id: 7, name: '第七章：保单条款', done: 0, total: 36, accuracy: 0, sections: [{ id: '7a', name: 'A. 条款解读', done: 0, total: 36, accuracy: 0, errorCount: 0 }] },
];

const SPRINT_LIBRARIES: LibraryGroup[] = [
  {
    id: 'critical',
    name: '重中之重',
    done: 12,
    total: 85,
    accuracy: 86,
    subsections: [
      { id: 'c-ch1', name: '第1章 风险的概念', done: 8, total: 45, accuracy: 88, errorCount: 6 },
      { id: 'c-ch2', name: '第2章 法律规则', done: 4, total: 40, accuracy: 82, errorCount: 4 },
    ],
  },
  {
    id: 'important',
    name: '次重点',
    done: 5,
    total: 156,
    accuracy: 72,
    subsections: [
      { id: 'i-ch1', name: '第1章 风险的概念', done: 5, total: 50, accuracy: 72, errorCount: 9 },
      { id: 'i-ch2', name: '第2章 法律规则', done: 0, total: 50, accuracy: 0, errorCount: 7 },
      { id: 'i-ch3', name: '第3章 保险原则', done: 0, total: 56, accuracy: 0, errorCount: 3 },
    ],
  },
  {
    id: 'normal',
    name: '一般考点',
    done: 0,
    total: 234,
    accuracy: 0,
    subsections: [
      { id: 'n-ch1', name: '第1章 风险的概念', done: 0, total: 80, accuracy: 0, errorCount: 2 },
      { id: 'n-ch2', name: '第2章 法律规则', done: 0, total: 80, accuracy: 0, errorCount: 1 },
    ],
  },
  {
    id: 'extra',
    name: '补充考点',
    done: 0,
    total: 98,
    accuracy: 0,
    subsections: [
      { id: 'e-ch1', name: '第1章 风险的概念', done: 0, total: 50, accuracy: 0, errorCount: 0 },
      { id: 'e-ch2', name: '第2章 法律规则', done: 0, total: 48, accuracy: 0, errorCount: 0 },
    ],
  },
];

function getRailFillWidth(done: number, total: number) {
  if (total <= 0) return '1.4%';
  const ratio = Math.max(0.014, Math.min(1, done / total));
  return `${ratio * 100}%`;
}

function pressIn(el: HTMLDivElement) {
  el.style.transform = 'scale(0.992)';
}

function pressOut(el: HTMLDivElement) {
  el.style.transform = 'scale(1)';
}

function CheckOutlineBox({ checked }: { checked: boolean }) {
  return (
    <div style={{ width: 20, height: 20, position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          left: 2,
          top: 2,
          width: 16,
          height: 16,
          borderRadius: 2,
          border: '1.4px solid #003459',
          background: checked ? '#003459' : 'transparent',
        }}
      />
      {checked && (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width={14}
          height={14}
          style={{ position: 'absolute', left: 3, top: 3, color: '#fff' }}
        >
          <path
            fill="currentColor"
            d="M9.0 16.2 4.8 12.0 3.4 13.4 9.0 19.0 21.0 7.0 19.6 5.6z"
          />
        </svg>
      )}
    </div>
  );
}

function ErrorCountMeta({ total, showCheck }: { total: number; showCheck: boolean }) {
  return (
    <div
      style={{
        paddingTop: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        gap: 14,
        flexShrink: 0,
      }}
    >
      <p style={{ margin: 0, fontSize: 13, color: 'rgba(158,166,176,0.85)' }}>共{total}题</p>
      {showCheck ? <CheckOutlineBox checked={total === 0} /> : <div style={{ width: 20, height: 20 }} />}
    </div>
  );
}

function MasteryHintBlock({
  summary,
  listFilter,
}: {
  summary: SectionMasterySummary;
  listFilter: ErrorBookListFilter;
}) {
  const { needThreeMore, needTwoMore, needOneMore, repeatedWrong } = summary;
  const gray = 'rgba(158,166,176,0.92)';

  const renderCountPhrase = (count: number, label: string) => (
    <span
      style={{
        fontSize: 10,
        color: gray,
        lineHeight: 1.25,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontWeight: 700, color: gray }}>{count}题</span>
      {label}
    </span>
  );

  return (
    <>
      <div
        style={{
          marginTop: 7,
          width: '100%',
          height: 2,
          borderRadius: 1,
          background: '#E5EBF0',
          overflow: 'hidden',
        }}
      >
        {/* 装饰线：设计不变，但不表达具体进度 */}
        <div style={{ width: '18%', height: 2, background: '#6B7580' }} />
      </div>
      {listFilter === 'pending' && (
        <div
          style={{
            marginTop: 7,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            columnGap: 8,
            rowGap: 4,
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
          }}
        >
          {renderCountPhrase(needThreeMore, '需做对3次')}
          {renderCountPhrase(needTwoMore, '需做对2次')}
          {renderCountPhrase(needOneMore, '需做对1次')}
          {renderCountPhrase(repeatedWrong, '反复错')}
        </div>
      )}
    </>
  );
}

export default function ErrorBookPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state =
    (location.state as {
      mode?: string;
      sortMode?: SortMode;
      bucketFilter?: ErrorBookListFilter | 'archivable';
      focusChapterId?: number;
      focusLibraryId?: string;
      focusSectionId?: string;
      fromPracticeComplete?: boolean;
    } | null) ?? {};

  const mode =
    state.mode === 'sprint'
      ? 'sprint'
      : localStorage.getItem('iiqe_mode') === 'sprint'
      ? 'sprint'
      : 'basic';
  const archiveMode: ErrorBookMode = mode === 'sprint' ? 'sprint' : 'basic';

  const [sortMode, setSortMode] = useState<SortMode>(() => {
    if (state.sortMode === '按重要性' || state.sortMode === '按章节') {
      return state.sortMode;
    }
    return mode === 'sprint' ? '按重要性' : '按章节';
  });
  const [bucketFilter, setBucketFilter] = useState<ErrorBookListFilter>(() => {
    if (state.bucketFilter === 'mastered') return 'mastered';
    return 'pending';
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedChapterId, setExpandedChapterId] = useState<number>(() =>
    typeof state.focusChapterId === 'number' ? state.focusChapterId : -1,
  );
  const [expandedLibraryId, setExpandedLibraryId] = useState<string>(() =>
    state.focusLibraryId ?? '',
  );
  const focusSectionId = state.focusSectionId;
  const [archiveRevision, setArchiveRevision] = useState(0);

  useEffect(() => {
    ensureErrorBookListDemoSeed();
    ensureRevivalDemoQuestion();
    setArchiveRevision((n) => n + 1);
  }, []);

  useEffect(() => {
    const next = state.bucketFilter;
    if (next === 'mastered' || next === 'pending') {
      setBucketFilter(next);
      setArchiveRevision((n) => n + 1);
    }
  }, [location.key, state.bucketFilter]);

  const sectionRows = useMemo((): SectionRow[] => {
    if (sortMode === '按重要性') {
      return SPRINT_LIBRARIES.flatMap((library) => library.subsections);
    }
    return BASIC_CHAPTERS.flatMap((chapter) => chapter.sections);
  }, [sortMode]);

  const sectionQuestionSets = useMemo(
    () =>
      sectionRows
        .map((section) => ({
          sectionId: section.id,
          questionIds: questionIdsForSection(section),
        }))
        .filter((entry) => entry.questionIds.length > 0),
    [sectionRows],
  );

  const sectionQuestionIds = (section: SectionRow) => questionIdsForSection(section);

  const sectionInListBucket = (section: SectionRow) => {
    const questionIds = sectionQuestionIds(section);
    if (questionIds.length === 0) return false;
    return sectionHasQuestionsInListFilter({
      mode: archiveMode,
      sectionId: section.id,
      questionIds,
      listFilter: bucketFilter,
    });
  };

  const sectionMasterySummary = (section: SectionRow) =>
    summarizeSectionMasteryInListFilter({
      mode: archiveMode,
      sectionId: section.id,
      questionIds: sectionQuestionIds(section),
      listFilter: bucketFilter,
    });

  const chapterMasterySummary = (sections: SectionRow[]) =>
    mergeMasterySummaries(sections.map((section) => sectionMasterySummary(section)));

  const bucketCounts = useMemo(
    () => ({
      pending: countErrorBookQuestionsByListFilter({
        mode: archiveMode,
        sections: sectionQuestionSets,
        listFilter: 'pending',
      }),
      mastered: countErrorBookQuestionsByListFilter({
        mode: archiveMode,
        sections: sectionQuestionSets,
        listFilter: 'mastered',
      }),
    }),
    [archiveMode, sectionQuestionSets, archiveRevision],
  );

  const listReturnState = { mode, sortMode, bucketFilter };

  const goQuiz = (payload: {
    sectionId: string;
    sectionName: string;
    chapterName?: string;
    libraryName?: string;
    displayTotal?: number;
  }) => {
    navigate(`/quiz/${mode}/${payload.sectionId}`, {
      state: {
        fromErrors: true,
        mode,
        sectionName: payload.sectionName,
        chapterName: payload.chapterName,
        libraryName: payload.libraryName,
        errorBookListFilter: bucketFilter,
        questionIndex:
          payload.sectionId === REVIVAL_DEMO_SECTION_ID && bucketFilter === 'pending'
            ? REVIVAL_DEMO_QUESTION_INDEX
            : 0,
        displayTotalQ: payload.displayTotal ?? 20,
        returnPath: '/errors',
        returnState: { ...listReturnState, focusSectionId: payload.sectionId },
      },
    });
  };

  const renderFilterPanel = () => {
    if (!filterOpen) return null;

    return (
      <>
        <div
          onClick={() => setFilterOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.05)',
            zIndex: 40,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 'var(--foco-header-height)',
            left: 16,
            right: 16,
            zIndex: 50,
            background: 'rgba(255,255,255,0.68)',
            backdropFilter: 'blur(9px)',
            WebkitBackdropFilter: 'blur(9px)',
            border: '1px solid rgba(230,244,255,0.72)',
            borderRadius: 20,
            boxShadow: '0 4px 12px rgba(0,52,89,0.04), 0 16px 40px rgba(0,52,89,0.08)',
            padding: 15,
          }}
        >
          {SORT_OPTIONS.map((opt) => {
            const active = sortMode === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setSortMode(opt)}
                style={{
                  width: '100%',
                  height: 52,
                  marginBottom: opt === SORT_OPTIONS[SORT_OPTIONS.length - 1] ? 0 : 8,
                  border: 'none',
                  borderRadius: 14,
                  background: active ? 'rgba(0,167,225,0.12)' : 'rgba(0,0,0,0.03)',
                  color: 'rgba(0,52,89,0.95)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </>
    );
  };

  const renderBucketTabs = () => (
    <div
      style={{
        flexShrink: 0,
        padding: '12px 20px calc(12px + env(safe-area-inset-bottom, 0px))',
        background: 'transparent',
        borderTop: 'none',
        boxShadow: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          gap: 8,
          background: 'transparent',
          borderRadius: 0,
          padding: 0,
          boxShadow: 'none',
        }}
      >
        {BUCKET_OPTIONS.map((item) => {
          const active = bucketFilter === item.id;
          const count = bucketCounts[item.id];
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => setBucketFilter(item.id)}
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                borderRadius: 14,
                background: active ? 'rgba(0,167,225,0.1)' : 'transparent',
                padding: '10px 6px 8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'background 0.18s ease, transform 0.12s ease',
              }}
              onPointerDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onPointerUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onPointerCancel={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onPointerLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span
                style={{
                  margin: 0,
                  fontSize: 28,
                  lineHeight: '32px',
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  color: active ? '#003459' : '#1A1F24',
                }}
              >
                {count}
              </span>
              <span
                style={{
                  margin: 0,
                  fontSize: 12,
                  lineHeight: '16px',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#003459' : '#8E98A8',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderChapterList = () => (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px 20px 16px 20px' }}>
      {BASIC_CHAPTERS.map((chapter, index) => {
        const visibleSections = chapter.sections.filter((section) => sectionInListBucket(section));
        const chapterSummary = chapterMasterySummary(chapter.sections);
        const isExpanded = chapter.id === expandedChapterId;
        return (
          <div key={chapter.id}>
            <div
              onClick={() => setExpandedChapterId((prev) => (prev === chapter.id ? -1 : chapter.id))}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                paddingTop: index === 0 ? 14 : index === 1 ? 20 : 14,
                paddingBottom: 14,
                cursor: 'pointer',
                transition: 'transform 0.16s ease',
              }}
              onPointerDown={(e) => pressIn(e.currentTarget)}
              onPointerUp={(e) => pressOut(e.currentTarget)}
              onPointerCancel={(e) => pressOut(e.currentTarget)}
              onPointerLeave={(e) => pressOut(e.currentTarget)}
            >
              <div style={{ width: 24, height: 50, position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 1,
                    left: 2,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    background: '#003D69',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {isExpanded ? '−' : '+'}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 500,
                    color: '#1A1F24',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {chapter.name}
                </p>
                <MasteryHintBlock summary={chapterSummary} listFilter={bucketFilter} />
              </div>
              <ErrorCountMeta total={chapterSummary.totalInFilter} showCheck={bucketFilter === 'pending'} />
            </div>

            {isExpanded &&
              (visibleSections.length > 0 ? (
              visibleSections.map((section) => {
                const isFocused = focusSectionId === section.id;
                const sectionSummary = sectionMasterySummary(section);
                return (
                <div
                  key={section.id}
                  onClick={() =>
                    goQuiz({
                      sectionId: section.id,
                      sectionName: section.name,
                      chapterName: chapter.name,
                      displayTotal: sectionSummary.totalInFilter,
                    })
                  }
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    paddingLeft: 22,
                    paddingTop: 8,
                    paddingBottom: 8,
                    cursor: 'pointer',
                    transition: 'transform 0.16s ease',
                    borderRadius: 12,
                    background: isFocused ? 'rgba(0,167,225,0.08)' : 'transparent',
                    outline: isFocused ? '1.5px solid rgba(0,167,225,0.35)' : 'none',
                  }}
                  onPointerDown={(e) => pressIn(e.currentTarget)}
                  onPointerUp={(e) => pressOut(e.currentTarget)}
                  onPointerCancel={(e) => pressOut(e.currentTarget)}
                  onPointerLeave={(e) => pressOut(e.currentTarget)}
                >
                  <div style={{ width: 24, height: 50, position: 'relative', flexShrink: 0 }}>
                    <div
                      style={{
                        position: 'absolute',
                        top: 7,
                        left: 8,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        background: '#13A3DF',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#1A1F24',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {section.name}
                    </p>
                    <MasteryHintBlock summary={sectionSummary} listFilter={bucketFilter} />
                  </div>
                  <ErrorCountMeta total={sectionSummary.totalInFilter} showCheck={bucketFilter === 'pending'} />
                </div>
              );
              })
              ) : (
                <p
                  style={{
                    margin: 0,
                    padding: '8px 22px 12px',
                    fontSize: 13,
                    color: '#8E98A8',
                  }}
                >
                  本章在当前分段暂无错题
                </p>
              ))}
          </div>
        );
      })}
    </div>
  );

  const renderLibraryList = () => (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px 20px 16px 20px' }}>
      {SPRINT_LIBRARIES.map((library, index) => {
        const visibleSubsections = library.subsections.filter((section) => sectionInListBucket(section));
        const librarySummary = chapterMasterySummary(library.subsections);
        const isExpanded = library.id === expandedLibraryId;
        return (
          <div key={library.id}>
            <div
              onClick={() => setExpandedLibraryId((prev) => (prev === library.id ? '' : library.id))}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                paddingTop: index === 0 ? 14 : index === 1 ? 20 : 14,
                paddingBottom: 14,
                cursor: 'pointer',
                transition: 'transform 0.16s ease',
              }}
              onPointerDown={(e) => pressIn(e.currentTarget)}
              onPointerUp={(e) => pressOut(e.currentTarget)}
              onPointerCancel={(e) => pressOut(e.currentTarget)}
              onPointerLeave={(e) => pressOut(e.currentTarget)}
            >
              <div style={{ width: 24, height: 50, position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 1,
                    left: 2,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    background: '#003D69',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {isExpanded ? '−' : '+'}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 500,
                    color: '#1A1F24',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {library.name}
                </p>
                <MasteryHintBlock summary={librarySummary} listFilter={bucketFilter} />
              </div>
              <ErrorCountMeta total={librarySummary.totalInFilter} showCheck={bucketFilter === 'pending'} />
            </div>

            {isExpanded &&
              (visibleSubsections.length > 0 ? (
              visibleSubsections.map((section) => {
                const isFocused = focusSectionId === section.id;
                const sectionSummary = sectionMasterySummary(section);
                return (
                <div
                  key={section.id}
                  onClick={() =>
                    goQuiz({
                      sectionId: section.id,
                      sectionName: section.name,
                      libraryName: library.name,
                      displayTotal: sectionSummary.totalInFilter,
                    })
                  }
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    paddingLeft: 22,
                    paddingTop: 8,
                    paddingBottom: 8,
                    cursor: 'pointer',
                    transition: 'transform 0.16s ease',
                    borderRadius: 12,
                    background: isFocused ? 'rgba(0,167,225,0.08)' : 'transparent',
                    outline: isFocused ? '1.5px solid rgba(0,167,225,0.35)' : 'none',
                  }}
                  onPointerDown={(e) => pressIn(e.currentTarget)}
                  onPointerUp={(e) => pressOut(e.currentTarget)}
                  onPointerCancel={(e) => pressOut(e.currentTarget)}
                  onPointerLeave={(e) => pressOut(e.currentTarget)}
                >
                  <div style={{ width: 24, height: 50, position: 'relative', flexShrink: 0 }}>
                    <div
                      style={{
                        position: 'absolute',
                        top: 7,
                        left: 8,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        background: '#13A3DF',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#1A1F24',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {section.name}
                    </p>
                    <MasteryHintBlock summary={sectionSummary} listFilter={bucketFilter} />
                  </div>
                  <ErrorCountMeta total={sectionSummary.totalInFilter} showCheck={bucketFilter === 'pending'} />
                </div>
              );
              })
              ) : (
                <p
                  style={{
                    margin: 0,
                    padding: '8px 22px 12px',
                    fontSize: 13,
                    color: '#8E98A8',
                  }}
                >
                  本库在当前分段暂无错题
                </p>
              ))}
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "PingFang SC", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        style={{
          height: 'var(--foco-header-height)',
          padding: 'var(--foco-header-pt) var(--foco-header-px-wide) var(--foco-header-pb)',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          flexShrink: 0,
          position: 'relative',
          zIndex: 30,
        }}
      >
        <button
          onClick={() => navigate('/home', { state: { mode } })}
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
            flexShrink: 0,
          }}
        >
          错题本
        </div>

        <div style={{ flex: 1 }} />

        <button
          type="button"
          onClick={() => setFilterOpen((o) => !o)}
          style={{
            height: 32,
            minWidth: 119,
            padding: '0 14px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(255,255,255,0.12)',
            color: 'rgba(0,52,89,0.92)',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {sortMode} ▾
        </button>
      </div>

      {renderFilterPanel()}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {sortMode === '按重要性' ? renderLibraryList() : renderChapterList()}
      </div>

      {renderBucketTabs()}
    </div>
  );
}
