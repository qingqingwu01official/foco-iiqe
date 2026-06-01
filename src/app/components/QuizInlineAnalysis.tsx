import { useMemo, useState } from 'react';
import { NotebookPen } from 'lucide-react';
import AnalysisConfusionTabs from './AnalysisConfusionTabs';
import {
  collectHighlightedAnalysisText,
  defaultAnalysisTabId,
  resolveAnalysisTabs,
  segmentMatchesTabs,
  type AnalysisSegment,
  type ConfusionTabId,
  type ExamMethod,
} from '../types/analysis';

type QuizQuestion = {
  analysis: string;
  analysisSegments?: AnalysisSegment[];
  examMethod?: ExamMethod;
  isHard?: boolean;
  isEasyMistake?: boolean;
};

type Props = {
  question: QuizQuestion;
  onOpenQuizNote?: (highlightedText: string) => void;
};

export default function QuizInlineAnalysis({ question, onOpenQuizNote }: Props) {
  const segments: AnalysisSegment[] = useMemo(
    () =>
      question.analysisSegments?.length
        ? question.analysisSegments
        : [{ id: 'fallback', field: '知识块' as const, content: question.analysis }],
    [question.analysis, question.analysisSegments],
  );

  const tabs = useMemo(
    () => resolveAnalysisTabs(segments, question.examMethod ?? '常规'),
    [question.examMethod, segments],
  );

  const defaultTabId = useMemo(() => defaultAnalysisTabId(tabs), [tabs]);

  const [confusionTabs, setConfusionTabs] = useState<Set<ConfusionTabId>>(
    () => new Set([defaultTabId]),
  );

  const extendMode = question.isHard ? 'deep' : question.isEasyMistake ? 'easyMistake' : 'none';

  return (
    <div
      style={{
        marginTop: 28,
        paddingTop: 20,
        borderTop: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1C2B39' }}>解析</p>
        {onOpenQuizNote && (
          <button
            type="button"
            onClick={() => onOpenQuizNote(collectHighlightedAnalysisText(segments, confusionTabs))}
            aria-label="不懂笔记"
            title="不懂笔记"
            style={{
              border: 'none',
              background: 'rgba(0,167,225,0.1)',
              borderRadius: 10,
              width: 36,
              height: 36,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <NotebookPen size={18} color="#00A7E1" strokeWidth={2.2} />
          </button>
        )}
      </div>

      <AnalysisConfusionTabs tabs={tabs} activeTabs={confusionTabs} onChange={setConfusionTabs} />

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
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: '0.653px solid rgba(0,52,89,0.12)',
            marginTop: 16,
            background: '#003459',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              borderBottom: '0.653px solid rgba(0,52,89,0.08)',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF' }}>深度解析</span>
            <span style={{ fontSize: 12, color: '#8E98A8' }}>重难点专项视频</span>
          </div>
          <div
            style={{
              height: 120,
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
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingLeft: 3,
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '7px solid transparent',
                  borderBottom: '7px solid transparent',
                  borderLeft: '12px solid rgba(255,255,255,0.9)',
                }}
              />
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#FFFFFF' }}>视频待上传</p>
          </div>
        </div>
      )}

      {extendMode === 'easyMistake' && (
        <div
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: '0.653px solid rgba(0,52,89,0.12)',
            marginTop: 16,
            background: '#003459',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              borderBottom: '0.653px solid rgba(0,52,89,0.08)',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF' }}>深度解析</span>
            <span style={{ fontSize: 12, color: '#8E98A8' }}>易错提醒</span>
          </div>
          <div
            style={{
              padding: '16px',
              background: '#001E3C',
              fontSize: 13,
              lineHeight: '20px',
              color: '#FFFFFF',
            }}
          >
            本题属于易错题，注意区分相似概念与干扰选项。
          </div>
        </div>
      )}
    </div>
  );
}
