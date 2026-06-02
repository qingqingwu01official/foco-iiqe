import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { QUESTIONS } from '../data/quizQuestions';
import {
  getErrorBookSectionBucket,
  type ErrorBookBucket,
  type ErrorBookMode,
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
const BUCKET_OPTIONS: Array<{ id: ErrorBookBucket; label: string }> = [
  { id: 'pending', label: '待复习' },
  { id: 'archivable', label: '可归档' },
  { id: 'mastered', label: '已掌握' },
];
const ERROR_BOOK_QUESTION_IDS = QUESTIONS.map((q) => q.id);

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

function CheckOutlineBox() {
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
          background: 'transparent',
        }}
      />
    </div>
  );
}

function ListMeta({ done, total }: { done: number; total: number }) {
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
      <p style={{ margin: 0, fontSize: 13, color: 'rgba(158,166,176,0.85)' }}>
        {done}/{total}
      </p>
      <CheckOutlineBox />
    </div>
  );
}

function ProgressBlock({ done, total, accuracy }: { done: number; total: number; accuracy: number }) {
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
        <div style={{ width: getRailFillWidth(done, total), height: 2, background: '#6B7580' }} />
      </div>
      <p style={{ margin: 0, marginTop: 7, fontSize: 11, color: 'rgba(158,166,176,0.92)' }}>
        正确率：{accuracy}%
      </p>
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
      bucketFilter?: ErrorBookBucket;
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
  const [bucketFilter, setBucketFilter] = useState<ErrorBookBucket>(() => {
    if (state.bucketFilter === 'pending' || state.bucketFilter === 'archivable' || state.bucketFilter === 'mastered') {
      return state.bucketFilter;
    }
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

  const getSectionBucket = (sectionId: string): ErrorBookBucket =>
    getErrorBookSectionBucket({
      mode: archiveMode,
      sectionId,
      questionIds: ERROR_BOOK_QUESTION_IDS,
    });

  const inBucket = (sectionId: string) => getSectionBucket(sectionId) === bucketFilter;

  const hasAnyBasicSection = BASIC_CHAPTERS.some((chapter) =>
    chapter.sections.some((section) => inBucket(section.id)),
  );
  const hasAnySprintSection = SPRINT_LIBRARIES.some((library) =>
    library.subsections.some((section) => inBucket(section.id)),
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
        questionIndex: 0,
        displayTotalQ: payload.displayTotal ?? 20,
        returnPath: '/errors',
        returnState: listReturnState,
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
    <div style={{ padding: '4px 20px 10px 20px', display: 'flex', gap: 8, flexShrink: 0 }}>
      {BUCKET_OPTIONS.map((item) => {
        const active = bucketFilter === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setBucketFilter(item.id)}
            style={{
              flex: 1,
              height: 34,
              borderRadius: 999,
              border: active ? 'none' : '1px solid rgba(0,52,89,0.12)',
              background: active ? '#003459' : '#fff',
              color: active ? '#fff' : 'rgba(0,52,89,0.75)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );

  const renderChapterList = () => (
    <div style={{ flex: 1, overflowY: 'auto', padding: '6px 20px 40px 20px' }}>
      {BASIC_CHAPTERS.map((chapter, index) => {
        const visibleSections = chapter.sections.filter((section) => inBucket(section.id));
        if (visibleSections.length === 0) return null;
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
                <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#1A1F24' }}>{chapter.name}</p>
                <ProgressBlock done={chapter.done} total={chapter.total} accuracy={chapter.accuracy} />
              </div>
              <ListMeta done={chapter.done} total={chapter.total} />
            </div>

            {isExpanded &&
              visibleSections.map((section) => {
                const isFocused = focusSectionId === section.id;
                return (
                <div
                  key={section.id}
                  onClick={() =>
                    goQuiz({
                      sectionId: section.id,
                      sectionName: section.name,
                      chapterName: chapter.name,
                      displayTotal: section.total,
                    })
                  }
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    paddingLeft: 22,
                    paddingTop: 10,
                    paddingBottom: 10,
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
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#1A1F24' }}>{section.name}</p>
                    <ProgressBlock done={section.done} total={section.total} accuracy={section.accuracy} />
                  </div>
                  <ListMeta done={section.done} total={section.total} />
                </div>
              );
              })}
          </div>
        );
      })}
      {!hasAnyBasicSection && (
        <div
          style={{
            paddingTop: 46,
            textAlign: 'center',
            color: '#8E98A8',
            fontSize: 13,
          }}
        >
          当前分段暂无题目
        </div>
      )}
    </div>
  );

  const renderLibraryList = () => (
    <div style={{ flex: 1, overflowY: 'auto', padding: '6px 20px 40px 20px' }}>
      {SPRINT_LIBRARIES.map((library, index) => {
        const visibleSubsections = library.subsections.filter((section) => inBucket(section.id));
        if (visibleSubsections.length === 0) return null;
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
                <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#1A1F24' }}>{library.name}</p>
                <ProgressBlock done={library.done} total={library.total} accuracy={library.accuracy} />
              </div>
              <ListMeta done={library.done} total={library.total} />
            </div>

            {isExpanded &&
              visibleSubsections.map((section) => {
                const isFocused = focusSectionId === section.id;
                return (
                <div
                  key={section.id}
                  onClick={() =>
                    goQuiz({
                      sectionId: section.id,
                      sectionName: section.name,
                      libraryName: library.name,
                      displayTotal: section.total,
                    })
                  }
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    paddingLeft: 22,
                    paddingTop: 10,
                    paddingBottom: 10,
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
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#1A1F24' }}>{section.name}</p>
                    <ProgressBlock done={section.done} total={section.total} accuracy={section.accuracy} />
                  </div>
                  <ListMeta done={section.done} total={section.total} />
                </div>
              );
              })}
          </div>
        );
      })}
      {!hasAnySprintSection && (
        <div
          style={{
            paddingTop: 46,
            textAlign: 'center',
            color: '#8E98A8',
            fontSize: 13,
          }}
        >
          当前分段暂无题目
        </div>
      )}
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
          onClick={() => navigate(-1)}
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
      {renderBucketTabs()}

      {sortMode === '按重要性' ? renderLibraryList() : renderChapterList()}
    </div>
  );
}
