const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export function optionLetter(index: number) {
  return OPTION_LETTERS[index] ?? String.fromCharCode(65 + index);
}

/** 去掉选项文案前的 "A. " 前缀，圆圈里单独展示字母 */
export function stripOptionPrefix(label: string) {
  return label.replace(/^[A-D][.、．]\s*/, '').trim();
}

export type ReferenceOptionVisual =
  | 'idle'
  | 'correct'
  | 'wrong'
  | 'correct-reveal';

export function referenceOptionVisual(
  answered: boolean,
  isSelected: boolean,
  isCorrectOption: boolean,
  answerIsCorrect: boolean,
): ReferenceOptionVisual {
  if (!answered) return 'idle';
  if (isSelected && answerIsCorrect) return 'correct';
  if (isSelected && !answerIsCorrect) return 'wrong';
  if (!answerIsCorrect && isCorrectOption) return 'correct-reveal';
  return 'idle';
}

type OptionRowProps = {
  letter: string;
  text: string;
  visual: ReferenceOptionVisual;
  disabled?: boolean;
  onClick?: () => void;
};

const CIRCLE = 26;

export function QuizReferenceOptionRow({ letter, text, visual, disabled, onClick }: OptionRowProps) {
  let circleBg = '#FFFFFF';
  let circleBorder = '1px solid #D8DCE2';
  let circleColor = '#A8ABB3';
  let textColor = '#1C2B39';

  if (visual === 'correct' || visual === 'correct-reveal') {
    circleBg = '#34C759';
    circleBorder = '1px solid #34C759';
    circleColor = '#FFFFFF';
    textColor = '#34C759';
  } else if (visual === 'wrong') {
    circleBg = '#FF3B30';
    circleBorder = '1px solid #FF3B30';
    circleColor = '#FFFFFF';
    textColor = '#FF3B30';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        border: 'none',
        background: 'transparent',
        padding: 0,
        minHeight: 36,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: disabled ? 'default' : 'pointer',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          width: CIRCLE,
          height: CIRCLE,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1,
          background: circleBg,
          border: circleBorder,
          color: circleColor,
        }}
      >
        {letter}
      </span>
      <span
        style={{
          flex: 1,
          fontSize: 15,
          lineHeight: '22px',
          color: textColor,
          fontWeight: visual === 'idle' ? 400 : 500,
        }}
      >
        {text}
      </span>
    </button>
  );
}

export function QuizAnswerStatsBar({
  correctIndex,
  selectedIndex,
  siteAttempts,
  siteAccuracy,
}: {
  correctIndex: number;
  selectedIndex: number;
  siteAttempts: number;
  siteAccuracy: number;
}) {
  const items = [
    {
      label: '正确答案',
      value: optionLetter(correctIndex),
      color: '#34C759',
    },
    {
      label: '你的答案',
      value: optionLetter(selectedIndex),
      color: selectedIndex === correctIndex ? '#34C759' : '#FF3B30',
    },
    {
      label: '全站作答',
      value: `${siteAttempts.toLocaleString()}次`,
      color: '#1C2B39',
    },
    {
      label: '全站正确率',
      value: `${siteAccuracy.toFixed(1)}%`,
      color: '#1C2B39',
    },
  ];

  return (
    <div
      style={{
        marginTop: 20,
        marginBottom: 4,
        borderRadius: 10,
        background: '#F2F4F6',
        padding: '14px 8px 12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 4,
      }}
    >
      {items.map((item) => (
        <div key={item.label} style={{ textAlign: 'center', minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              lineHeight: '15px',
              color: '#8E98A8',
              fontWeight: 400,
            }}
          >
            {item.label}
          </p>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 15,
              lineHeight: '20px',
              fontWeight: 600,
              color: item.color,
            }}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
