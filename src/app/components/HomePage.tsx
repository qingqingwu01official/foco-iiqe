import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FocoAvatarButtonImage } from './FocoAssets';
import { getDaysUntilExam } from '../lib/profileSettings';

type Mode = 'basic' | 'sprint';

const MODE_CONFIG: Record<Mode, { label: string; desc: string; errorHint: string; quizLabel: string }> = {
  basic: {
    label: '打基础',
    desc: '适合备考时间还剩3天以上的考生\n系统串学各章内容，按章节推进掌握考点。',
    errorHint: '剩余错题数',
    quizLabel: '章节刷题',
  },
  sprint: {
    label: '考前冲刺',
    desc: '备考仅剩1-3天时间\n适合临考强化，优先高频考点与错题消灭',
    errorHint: '剩余错题数',
    quizLabel: '分重点刷题',
  },
};

const ICON_BUTTON_STYLE: React.CSSProperties = {
  width: 28,
  height: 28,
  padding: 0,
  border: 'none',
  background: 'none',
  color: '#A8ABB3',
  opacity: 0.92,
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
  transition: 'transform 0.18s ease, opacity 0.18s ease',
};

function pressIn(el: HTMLButtonElement, scale = 0.98) {
  el.style.transform = `scale(${scale})`;
  el.style.opacity = '1';
}

function pressOut(el: HTMLButtonElement, opacity = 1) {
  el.style.transform = 'scale(1)';
  el.style.opacity = `${opacity}`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const saved = localStorage.getItem('iiqe_mode') as Mode | null;
  const [mode, setMode] = useState<Mode>(saved ?? 'basic');
  const [daysLeft, setDaysLeft] = useState(getDaysUntilExam);

  useEffect(() => {
    localStorage.setItem('iiqe_mode', mode);
  }, [mode]);

  useEffect(() => {
    const refresh = () => setDaysLeft(getDaysUntilExam());
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const cfg = MODE_CONFIG[mode];

  const handleQuiz = () => {
    if (mode === 'basic') {
      navigate('/basic/chapters', { state: { mode } });
    } else {
      navigate('/sprint/libraries', { state: { mode } });
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F7FAFF 38%, #E5F0FC 72%, #D1E5FA 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* 背景光斑 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: -90,
          top: -60,
          width: 360,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(68% 68% at 30% 35%, rgba(255,255,255,0.95) 0%, rgba(214,231,248,0.38) 65%, rgba(214,231,248,0) 100%)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 60,
          top: 380,
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(64% 64% at 50% 50%, rgba(255,255,255,0.7) 0%, rgba(180,212,241,0.38) 62%, rgba(180,212,241,0) 100%)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: -120,
          top: 520,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(65% 65% at 50% 50%, rgba(255,255,255,0.65) 0%, rgba(178,210,238,0.36) 62%, rgba(178,210,238,0) 100%)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(255,255,255,0.12)',
        }}
      />

      {/* 顶部头像 */}
      <button
        onClick={() => navigate('/profile')}
        aria-label="FOCO 头像"
        style={{
          position: 'absolute',
          left: 12,
          top: 15,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: 'rgba(255,255,255,0.62)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '2px solid #00A7E1',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          boxShadow: '0 2px 10px rgba(0,52,89,0.12)',
        }}
        onPointerDown={(e) => {
          pressIn(e.currentTarget, 0.94);
        }}
        onPointerUp={(e) => {
          pressOut(e.currentTarget);
        }}
        onPointerCancel={(e) => {
          pressOut(e.currentTarget);
        }}
        onPointerLeave={(e) => {
          pressOut(e.currentTarget);
        }}
      >
        <FocoAvatarButtonImage size={44} />
      </button>

      {/* 倒计时卡片 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 119,
          transform: 'translateX(-50%)',
          width: 280,
          height: 271,
          borderRadius: 22,
          border: '1px solid rgba(199,219,242,0.55)',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.85), 0 10px 28px -2px rgba(107,143,189,0.16), 0 -1px 0 rgba(255,255,255,0.65)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: '18px 20px 16px',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: '#8E98A8',
          }}
        >
          距 IIQE 考试
        </p>

        <p style={{ margin: 0, lineHeight: 1 }}>
          <span
            style={{
              color: '#003459',
              fontSize: 64,
              fontWeight: 790,
              letterSpacing: '-0.02em',
              fontFamily: '"SF Compact Rounded", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
            }}
          >
            {daysLeft}
          </span>
          <span
            style={{
              marginLeft: 2,
              color: '#8F8F94',
              fontSize: 22,
              fontWeight: 500,
            }}
          >
            天
          </span>
        </p>

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
          }}
        >
          {(['basic', 'sprint'] as Mode[]).map((value) => {
            const active = mode === value;
            const label = MODE_CONFIG[value].label;
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
                  transition: 'background 0.2s ease, color 0.2s ease, transform 0.18s ease',
                  boxShadow: active ? '0 4px 10px rgba(0,52,89,0.18)' : 'none',
                  whiteSpace: 'nowrap',
                }}
                onPointerDown={(e) => {
                  if (!active) pressIn(e.currentTarget, 0.96);
                }}
                onPointerUp={(e) => {
                  pressOut(e.currentTarget);
                }}
                onPointerCancel={(e) => {
                  pressOut(e.currentTarget);
                }}
                onPointerLeave={(e) => {
                  pressOut(e.currentTarget);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <p
          style={{
            margin: 0,
            marginTop: 10,
            width: 300,
            textAlign: 'center',
            whiteSpace: 'pre-line',
            lineHeight: 1.5,
            color: '#8E98A8',
            fontSize: 11,
          }}
        >
          {cfg.desc}
        </p>
      </div>

      {/* 主操作区 */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 'max(119px, calc(env(safe-area-inset-bottom) + 99px))',
          display: 'flex',
          alignItems: 'center',
          gap: 13,
        }}
      >
        <button
          onClick={handleQuiz}
          aria-label={cfg.quizLabel}
          style={{
            flex: 1,
            height: 110,
            borderRadius: 18,
            border: '1px solid rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(78,123,170,0.08)',
            padding: '14px 12px 14px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 3,
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            overflow: 'hidden',
          }}
          onPointerDown={(e) => {
            pressIn(e.currentTarget, 0.985);
          }}
          onPointerUp={(e) => {
            pressOut(e.currentTarget);
          }}
          onPointerCancel={(e) => {
            pressOut(e.currentTarget);
          }}
          onPointerLeave={(e) => {
            pressOut(e.currentTarget);
          }}
        >
          <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1A1F24' }}>{cfg.quizLabel}</p>
          <p style={{ margin: 0, lineHeight: 1.05 }}>
            <span
              style={{
                fontSize: 26,
                fontWeight: 790,
                color: '#F5A623',
                fontFamily: '"SF Compact Rounded", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
              }}
            >
              81
            </span>
            <span style={{ fontSize: 26, color: '#F5A623', fontWeight: 790 }}>/867</span>
          </p>
          <p style={{ margin: 0, fontSize: 10, color: '#8E98A8' }}>已练习题量/总题量</p>
        </button>

        <button
          onClick={() => navigate('/errors', { state: { mode } })}
          style={{
            flex: 1,
            height: 110,
            borderRadius: 18,
            border: '1px solid rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(78,123,170,0.08)',
            padding: '14px 12px 14px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 3,
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            overflow: 'hidden',
          }}
          onPointerDown={(e) => {
            pressIn(e.currentTarget, 0.985);
          }}
          onPointerUp={(e) => {
            pressOut(e.currentTarget);
          }}
          onPointerCancel={(e) => {
            pressOut(e.currentTarget);
          }}
          onPointerLeave={(e) => {
            pressOut(e.currentTarget);
          }}
        >
          <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1A1F24' }}>错题重做</p>
          <p
            style={{
              margin: 0,
              lineHeight: 1.05,
              fontSize: 30,
              fontWeight: 790,
              color: '#FF3B30',
              fontFamily: '"SF Compact Rounded", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
            }}
          >
            127
          </p>
          <p style={{ margin: 0, fontSize: 10, color: '#8E98A8' }}>{cfg.errorHint}</p>
        </button>
      </div>

      {/* 次级操作区 */}
      <div
        style={{
          position: 'absolute',
          left: 19,
          right: 20,
          bottom: 'max(40px, calc(env(safe-area-inset-bottom) + 20px))',
          height: 40,
          padding: '0 46px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => navigate('/videos', { state: { mode } })}
          aria-label="难点视频"
          style={ICON_BUTTON_STYLE}
          onPointerDown={(e) => {
            pressIn(e.currentTarget, 0.92);
          }}
          onPointerUp={(e) => {
            pressOut(e.currentTarget, 0.92);
          }}
          onPointerCancel={(e) => {
            pressOut(e.currentTarget, 0.92);
          }}
          onPointerLeave={(e) => {
            pressOut(e.currentTarget, 0.92);
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="2.2" y="4.8" width="19.6" height="14.4" rx="4" fill="currentColor" />
            <path d="M10.1 8.7L16.1 12L10.1 15.3V8.7Z" fill="#FFFFFF" />
          </svg>
        </button>

        <button
          onClick={() => navigate('/stats', { state: { mode } })}
          aria-label="数据台"
          style={ICON_BUTTON_STYLE}
          onPointerDown={(e) => {
            pressIn(e.currentTarget, 0.92);
          }}
          onPointerUp={(e) => {
            pressOut(e.currentTarget, 0.92);
          }}
          onPointerCancel={(e) => {
            pressOut(e.currentTarget, 0.92);
          }}
          onPointerLeave={(e) => {
            pressOut(e.currentTarget, 0.92);
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3.5" y="5.5" width="17.5" height="17.5" rx="4" fill="#A8ABB3" />
            <path
              d="M7.5 16.5L11 12.5L14 14L17.5 10.5L20.5 12"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          aria-label="笔记"
          onClick={() => navigate('/notes', { state: { mode } })}
          style={ICON_BUTTON_STYLE}
          onPointerDown={(e) => {
            pressIn(e.currentTarget, 0.92);
          }}
          onPointerUp={(e) => {
            pressOut(e.currentTarget, 0.92);
          }}
          onPointerCancel={(e) => {
            pressOut(e.currentTarget, 0.92);
          }}
          onPointerLeave={(e) => {
            pressOut(e.currentTarget, 0.92);
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M16.5 4.2L19.8 7.5L10.1 17.2L5.1 18.9L6.8 13.9L16.5 4.2Z"
              stroke="currentColor"
              strokeWidth="1.8"
              fill="none"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

    </div>
  );
}
