import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft } from 'lucide-react';

type Mode = 'basic' | 'sprint';

const FONT =
  '-apple-system, BlinkMacSystemFont, "PingFang SC", "SF Pro Display", "Helvetica Neue", Arial, sans-serif';

const CHAPTER_PROGRESS = [
  { name: '第一章 · 风险及保险', pct: 68, color: '#00A7E1' },
  { name: '第二章 · 法律原则', pct: 52, color: '#00A7E1' },
  { name: '第三章 · 保险原则', pct: 42, color: '#F5A623' },
  { name: '第四章 · 再保险', pct: 35, color: '#F5A623' },
  { name: '第五章 · 保险监管', pct: 31, color: '#FF3B30' },
  { name: '第六章 · 市场行为', pct: 24, color: '#FF3B30' },
  { name: '第七章 · 保单条款', pct: 18, color: '#FF3B30' },
];

const IMPORTANCE_PROGRESS = [
  { name: '重中之重', pct: 58, color: '#FF3B30' },
  { name: '次重点', pct: 41, color: '#FF9500' },
  { name: '一般考点', pct: 27, color: '#00A7E1' },
  { name: '补充考点', pct: 15, color: '#8E98A8' },
];

const WEAK_POINTS = [
  { rank: 1, title: '风险投机 vs 风险管理', sub: '近7日错 4 次' },
  { rank: 2, title: '最大诚信 · 如实告知', sub: '近7日错 3 次' },
];

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

function StatsTopBar({ onBack }: { onBack: () => void }) {
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
        数据
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
        学习概览
      </div>
    </div>
  );
}

function TrendChart() {
  return (
    <div
      style={{
        borderRadius: 12,
        background: '#F2F4F6',
        padding: '12px 8px 8px',
        position: 'relative',
        height: 150,
      }}
    >
      <svg
        viewBox="0 0 321 150"
        width="100%"
        height="130"
        aria-hidden
        style={{ display: 'block' }}
      >
        <line x1="20" y1="110" x2="300" y2="110" stroke="rgba(142,152,168,0.25)" strokeWidth="1" />
        <path
          d="M 24 98 L 68 82 L 112 88 L 156 62 L 200 70 L 244 48 L 288 54 L 288 120 L 24 120 Z"
          fill="rgba(0,167,225,0.12)"
        />
        <path
          d="M 24 98 L 68 82 L 112 88 L 156 62 L 200 70 L 244 48 L 288 54"
          fill="none"
          stroke="#00A7E1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 10px',
          marginTop: -4,
        }}
      >
        {WEEK_LABELS.map((label) => (
          <span key={label} style={{ fontSize: 10, fontWeight: 500, color: '#8E98A8' }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const saved = localStorage.getItem('iiqe_mode') as Mode | null;
  const initialMode = (location.state as { mode?: Mode } | null)?.mode ?? saved ?? 'basic';
  const [mode, setMode] = useState<Mode>(initialMode);

  useEffect(() => {
    localStorage.setItem('iiqe_mode', mode);
  }, [mode]);

  const masteryTitle = mode === 'sprint' ? '重点掌握度' : '章节掌握度';
  const masteryRows = mode === 'sprint' ? IMPORTANCE_PROGRESS : CHAPTER_PROGRESS;

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
      }}
    >
      <StatsTopBar onBack={() => navigate('/home')} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>
        <div
          role="tablist"
          aria-label="学习模式"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 30,
            padding: 2,
            borderRadius: 999,
            background: 'rgba(0,52,89,0.08)',
            gap: 2,
            marginTop: 14,
          }}
        >
          {(['basic', 'sprint'] as Mode[]).map((value) => {
            const active = mode === value;
            const label = value === 'basic' ? '打基础' : '考前冲刺';
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(value)}
                style={{
                  height: 26,
                  padding: '0 12px',
                  borderRadius: 999,
                  border: 'none',
                  background: active ? '#003459' : 'transparent',
                  color: active ? '#FFFFFF' : '#8E98A8',
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 12,
            borderRadius: 16,
            background: '#fff',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex' }}>
            {[
              { label: '已练题量', value: '81' },
              { label: '正确率', value: '76%' },
              { label: '刷题轮次', value: '2轮' },
            ].map((item) => (
              <div key={item.label} style={{ flex: 1, textAlign: 'center' }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#003459',
                    fontFamily: '"SF Compact Rounded", "SF Pro Display", sans-serif',
                  }}
                >
                  {item.value}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 500, color: '#8E98A8' }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            borderRadius: 18,
            background: '#fff',
            padding: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1C2B38' }}>近7日练题趋势</p>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#003459',
                background: 'rgba(0,52,89,0.08)',
                borderRadius: 999,
                padding: '4px 10px',
              }}
            >
              近7天
            </span>
          </div>
          <TrendChart />
        </div>

        <div
          style={{
            marginTop: 12,
            borderRadius: 18,
            background: '#fff',
            padding: '16px',
          }}
        >
          <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#1C2B38' }}>{masteryTitle}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {masteryRows.map((row) => (
              <div key={row.name}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#1C2B38' }}>{row.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: row.color }}>{row.pct}%</span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 999,
                    background: '#F2F4F6',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${row.pct}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: row.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            borderRadius: 18,
            background: '#fff',
            padding: '16px',
          }}
        >
          <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#1C2B38' }}>
            薄弱知识点 TOP3
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {WEAK_POINTS.map((item) => (
              <div
                key={item.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  borderRadius: 10,
                  background: '#F2F4F6',
                  padding: '8px 12px',
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    background: 'rgba(0,52,89,0.1)',
                    color: '#003459',
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.rank}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#1C2B38' }}>{item.title}</p>
                  <p style={{ margin: 0, fontSize: 10, color: '#8E98A8' }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
