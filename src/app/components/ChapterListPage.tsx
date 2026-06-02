import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft } from 'lucide-react';

interface Section {
  id: string;
  name: string;
  done: number;
  total: number;
  accuracy: number;
}

interface Chapter {
  id: number;
  name: string;
  done: number;
  total: number;
  accuracy: number;
  sections: Section[];
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    name: '第一章：风险及保险',
    done: 1,
    total: 111,
    accuracy: 100,
    sections: [
      { id: '1a', name: 'A. 风险的概念', done: 1, total: 20, accuracy: 100 },
      { id: '1b', name: 'B. 风险的管理', done: 0, total: 91, accuracy: 0 },
    ],
  },
  {
    id: 2,
    name: '第二章：法律原则',
    done: 0,
    total: 68,
    accuracy: 0,
    sections: [
      { id: '2a', name: 'A. 基础法律原则', done: 0, total: 40, accuracy: 0 },
      { id: '2b', name: 'B. 合同法要点', done: 0, total: 28, accuracy: 0 },
    ],
  },
  {
    id: 3,
    name: '第三章：保险原则',
    done: 0,
    total: 55,
    accuracy: 0,
    sections: [
      { id: '3a', name: 'A. 可保利益', done: 0, total: 30, accuracy: 0 },
      { id: '3b', name: 'B. 最大诚信', done: 0, total: 25, accuracy: 0 },
    ],
  },
  {
    id: 4,
    name: '第四章：再保险',
    done: 0,
    total: 42,
    accuracy: 0,
    sections: [{ id: '4a', name: 'A. 再保险机制', done: 0, total: 42, accuracy: 0 }],
  },
  {
    id: 5,
    name: '第五章：保险监管',
    done: 0,
    total: 38,
    accuracy: 0,
    sections: [{ id: '5a', name: 'A. 监管框架', done: 0, total: 38, accuracy: 0 }],
  },
  {
    id: 6,
    name: '第六章：市场行为',
    done: 0,
    total: 44,
    accuracy: 0,
    sections: [{ id: '6a', name: 'A. 市场行为守则', done: 0, total: 44, accuracy: 0 }],
  },
  {
    id: 7,
    name: '第七章：保单条款',
    done: 0,
    total: 36,
    accuracy: 0,
    sections: [{ id: '7a', name: 'A. 条款解读', done: 0, total: 36, accuracy: 0 }],
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

export default function ChapterListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = ((location.state as { mode?: string } | null)?.mode ?? 'basic') as 'basic' | 'sprint';
  const [expandedId, setExpandedId] = useState<number>(-1);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        style={{
          height: 'var(--foco-header-height-compact)',
          padding: 'var(--foco-header-pt) var(--foco-header-px-wide) var(--foco-header-pb-compact)',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          flexShrink: 0,
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
          }}
        >
          <ChevronLeft size={20} color="#4E5A67" strokeWidth={2.4} />
        </button>

        <div
          style={{
            width: 72,
            height: 30,
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
          章节刷题
        </div>

        <div style={{ flex: 1 }} />

        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 500,
            color: 'rgba(158,166,176,0.9)',
            lineHeight: 1.2,
          }}
        >
          1/81
        </p>
      </div>

      <div
        style={{
          flex: 1,
          marginTop: 26,
          marginLeft: 0,
          width: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '6px 20px 40px 20px',
        }}
      >
        {CHAPTERS.map((chapter, index) => {
          const isExpanded = chapter.id === expandedId;

          return (
            <div key={chapter.id}>
              <div
                onClick={() => {
                  setExpandedId((prev) => (prev === chapter.id ? -1 : chapter.id));
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  paddingTop: index === 1 ? 20 : 14,
                  paddingBottom: 14,
                  cursor: 'pointer',
                  transformOrigin: 'left center',
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
                      lineHeight: 1,
                    }}
                  >
                    {isExpanded ? '−' : '+'}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#1A1F24', lineHeight: 1.25 }}>
                    {chapter.name}
                  </p>
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
                    <div
                      style={{
                        width: getRailFillWidth(chapter.done, chapter.total),
                        height: 2,
                        background: '#6B7580',
                      }}
                    />
                  </div>
                  <p style={{ margin: 0, marginTop: 7, fontSize: 11, color: 'rgba(158,166,176,0.92)' }}>
                    正确率：{chapter.accuracy}%
                  </p>
                </div>

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
                    {chapter.done}/{chapter.total}
                  </p>
                  <CheckOutlineBox checked={chapter.total > 0 && chapter.done >= chapter.total} />
                </div>
              </div>

              {isExpanded &&
                chapter.sections.map((section) => (
                  <div
                    key={section.id}
                    onClick={() =>
                      navigate(`/quiz/basic/${chapter.id}`, {
                        state: { mode, chapterName: chapter.name, sectionName: section.name },
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
                      transformOrigin: 'left center',
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
                        <div
                          style={{
                            width: getRailFillWidth(section.done, section.total),
                            height: 2,
                            background: '#6B7580',
                          }}
                        />
                      </div>
                      <p style={{ margin: 0, marginTop: 7, fontSize: 11, color: 'rgba(158,166,176,0.92)' }}>
                        正确率：{section.accuracy}%
                      </p>
                    </div>

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
                        {section.done}/{section.total}
                      </p>
                      <CheckOutlineBox checked={section.total > 0 && section.done >= section.total} />
                    </div>
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
