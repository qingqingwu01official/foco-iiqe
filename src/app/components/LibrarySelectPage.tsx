import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft } from 'lucide-react';

interface SubSection {
  id: string;
  name: string;
  done: number;
  total: number;
  accuracy: number;
}

interface Library {
  id: string;
  name: string;
  done: number;
  total: number;
  accuracy: number;
  subsections: SubSection[];
}

const LIBRARIES: Library[] = [
  {
    id: 'critical',
    name: '重中之重',
    done: 12,
    total: 85,
    accuracy: 86,
    subsections: [
      { id: 'c-ch1', name: '第1章 风险的概念', done: 8, total: 45, accuracy: 88 },
      { id: 'c-ch2', name: '第2章 法律规则', done: 4, total: 40, accuracy: 82 },
    ],
  },
  {
    id: 'important',
    name: '次重点',
    done: 5,
    total: 156,
    accuracy: 72,
    subsections: [
      { id: 'i-ch1', name: '第1章 风险的概念', done: 5, total: 50, accuracy: 72 },
      { id: 'i-ch2', name: '第2章 法律规则', done: 0, total: 50, accuracy: 0 },
      { id: 'i-ch3', name: '第3章 保险原则', done: 0, total: 56, accuracy: 0 },
    ],
  },
  {
    id: 'normal',
    name: '一般考点',
    done: 0,
    total: 234,
    accuracy: 0,
    subsections: [
      { id: 'n-ch1', name: '第1章 风险的概念', done: 0, total: 80, accuracy: 0 },
      { id: 'n-ch2', name: '第2章 法律规则', done: 0, total: 80, accuracy: 0 },
      { id: 'n-ch3', name: '第3章 保险原则', done: 0, total: 74, accuracy: 0 },
    ],
  },
  {
    id: 'extra',
    name: '补充考点',
    done: 0,
    total: 98,
    accuracy: 0,
    subsections: [
      { id: 'e-ch1', name: '第1章 风险的概念', done: 0, total: 50, accuracy: 0 },
      { id: 'e-ch2', name: '第2章 法律规则', done: 0, total: 48, accuracy: 0 },
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

export default function LibrarySelectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = ((location.state as { mode?: string } | null)?.mode ?? 'sprint') as 'basic' | 'sprint';
  const [expandedId, setExpandedId] = useState<string>('');

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "PingFang SC", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
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
            width: 88,
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
          分重点刷题
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
        {LIBRARIES.map((lib, index) => {
          const isExpanded = lib.id === expandedId;

          return (
            <div key={lib.id}>
              <div
                onClick={() => setExpandedId((prev) => (prev === lib.id ? '' : lib.id))}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  paddingTop: index === 1 ? 20 : 14,
                  paddingBottom: isExpanded ? 14 : index === 0 ? 14 : 14,
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
                    {lib.name}
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
                        width: getRailFillWidth(lib.done, lib.total),
                        height: 2,
                        background: '#6B7580',
                      }}
                    />
                  </div>
                  <p style={{ margin: 0, marginTop: 7, fontSize: 11, color: 'rgba(158,166,176,0.92)' }}>
                    正确率：{lib.accuracy}%
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
                    {lib.done}/{lib.total}
                  </p>
                  <CheckOutlineBox checked={lib.total > 0 && lib.done >= lib.total} />
                </div>
              </div>

              {isExpanded &&
                lib.subsections.map((sec) => (
                  <div
                    key={sec.id}
                    onClick={() =>
                      navigate(`/quiz/sprint/${lib.id}`, {
                        state: {
                          mode,
                          libraryId: lib.id,
                          libraryName: lib.name,
                          sectionName: sec.name,
                          topLabel: '分重点刷题',
                        },
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
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#1A1F24' }}>{sec.name}</p>
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
                            width: getRailFillWidth(sec.done, sec.total),
                            height: 2,
                            background: '#6B7580',
                          }}
                        />
                      </div>
                      <p style={{ margin: 0, marginTop: 7, fontSize: 11, color: 'rgba(158,166,176,0.92)' }}>
                        正确率：{sec.accuracy}%
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
                        {sec.done}/{sec.total}
                      </p>
                      <CheckOutlineBox checked={sec.total > 0 && sec.done >= sec.total} />
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
