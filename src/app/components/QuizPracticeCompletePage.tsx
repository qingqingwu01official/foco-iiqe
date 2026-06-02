import { useNavigate, useLocation, useParams } from 'react-router';
import { FocoOwlLogo } from './FocoAssets';
import type { ErrorReviewQuizTarget } from '../utils/errorBookFocus';

type PracticeStats = {
  correct: number;
  wrong: number;
  total: number;
};

type CompleteLocationState = {
  mode?: string;
  fromErrors?: boolean;
  practiceStats?: PracticeStats;
  headerTitle?: string;
  headerSubtitle?: string;
  returnPath?: string;
  returnState?: Record<string, unknown>;
  errorReviewTarget?: ErrorReviewQuizTarget | null;
  sectionName?: string;
  libraryName?: string;
  chapterName?: string;
};

export default function QuizPracticeCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode: modeParam, id: routeId } = useParams<{ mode: string; id: string }>();

  const state = (location.state as CompleteLocationState | null) ?? {};
  const mode = state.mode ?? modeParam ?? 'basic';
  const stats = state.practiceStats ?? { correct: 0, wrong: 0, total: 0 };
  const accuracy =
    stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const hasWrong = stats.wrong > 0;

  const returnPath =
    state.returnPath ??
    (state.fromErrors ? '/errors' : mode === 'sprint' ? '/sprint/libraries' : '/basic/chapters');

  const subtitle = state.headerSubtitle ?? '';
  const title = state.headerTitle ?? (mode === 'sprint' ? '分重点练习' : '章节练习');

  const handleFinish = () => {
    navigate(returnPath, { state: state.returnState, replace: true });
  };

  const handleReviewErrors = () => {
    if (!hasWrong || !state.errorReviewTarget) return;
    const target = state.errorReviewTarget;
    const completeReturnPath =
      routeId && mode ? `/quiz/${mode}/${routeId}/complete` : location.pathname;

    navigate(`/quiz/${target.mode}/${target.sectionId}`, {
      state: {
        fromErrors: true,
        mode: target.mode,
        sectionName: target.sectionName,
        chapterName: target.chapterName ?? state.chapterName,
        libraryName: target.libraryName ?? state.libraryName,
        questionIndex: 0,
        displayTotalQ: target.displayTotalQ ?? 20,
        returnPath: completeReturnPath,
        returnState: location.state,
      },
    });
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          height: 'var(--foco-header-height)',
          padding: 'var(--foco-header-pt) var(--foco-header-px) var(--foco-header-pb)',
          borderBottom: '0.653px solid rgba(0,0,0,0.06)',
        }}
      >
        {subtitle ? (
          <p
            style={{
              margin: 0,
              fontSize: 11,
              lineHeight: '16.5px',
              color: '#8E98A8',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            {subtitle}
          </p>
        ) : null}
        <p
          style={{
            margin: 0,
            fontSize: 15,
            lineHeight: '20px',
            color: '#003459',
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          {title}
        </p>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 28px 16px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            background: 'linear-gradient(180deg, rgba(0,167,225,0.08) 0%, rgba(0,52,89,0.04) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <FocoOwlLogo size={96} />
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: '#003459',
            letterSpacing: '0.02em',
          }}
        >
          练习已完成
        </h1>

        <p
          style={{
            margin: '10px 0 0',
            fontSize: 14,
            lineHeight: 1.5,
            color: '#8E98A8',
            maxWidth: 280,
          }}
        >
          {hasWrong
            ? '本节题目已全部做完，可进入错题刷题巩固薄弱点。'
            : '本节题目已全部做完，全部答对，继续保持！'}
        </p>

        <div
          style={{
            marginTop: 28,
            width: '100%',
            maxWidth: 320,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
          }}
        >
          {[
            { label: '答对', value: String(stats.correct), accent: '#00A7E1' },
            { label: '答错', value: String(stats.wrong), accent: stats.wrong > 0 ? '#FF6B4A' : '#8E98A8' },
            { label: '正确率', value: `${accuracy}%`, accent: '#003459' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                borderRadius: 16,
                background: '#F5F8FA',
                padding: '14px 8px',
              }}
            >
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: item.accent }}>{item.value}</p>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#8E98A8' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: '8px 20px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {hasWrong ? (
          <button
            type="button"
            onClick={handleReviewErrors}
            style={{
              width: '100%',
              height: 54,
              borderRadius: 999,
              background: '#fff',
              color: '#003459',
              border: '1.5px solid rgba(0,52,89,0.28)',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,52,89,0.06)',
            }}
          >
            错题回看
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleFinish}
          style={{
            width: '100%',
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
          完成
        </button>
        <div style={{ height: 'max(24px, env(safe-area-inset-bottom))', minHeight: 24 }} />
      </div>
    </div>
  );
}
