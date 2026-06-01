import { forwardRef, useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { FocoOwlLogo } from './FocoAssets';
import { optionLetter, stripOptionPrefix } from './QuizReferenceOption';
import {
  buildConfusionUserMessage,
  buildTeacherFollowUpReply,
  buildTeacherOpening,
  DEFAULT_QA_AI_NOTE_BODY,
  labelsFromFeedbackIds,
  type QaQuestionContext,
} from '../lib/qaFlowContext';

const FEEDBACK_OPTS = [
  { id: 'a', label: 'A不懂' },
  { id: 'b', label: 'B不懂' },
  { id: 'c', label: 'C不懂' },
  { id: 'd', label: 'D不懂' },
  { id: 'knowledge', label: '不理解知识' },
  { id: 'question', label: '看不懂题目' },
] as const;

type ModalState = 'hidden' | 'feedback' | 'recorded';
type FlowStage = 'none' | 'chat' | 'aiPreview' | 'noteAdded';

type ChatSnapshot = {
  question: QaQuestionContext;
  confusionLabels: string[];
};

type ChatFollowUpMessage = {
  id: string;
  role: 'user' | 'teacher';
  text: string;
};

const FEEDBACK_MASK_STYLE = {
  background: 'rgba(0,0,0,0.34)',
} as const;

const FLOW_MASK_STYLE = {
  background: 'rgba(0,0,0,0.52)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
} as const;

const DEFAULT_AI_NOTE_BODY = DEFAULT_QA_AI_NOTE_BODY;

function useKeyboardInset(active: boolean) {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (!active) {
      setInset(0);
      return;
    }
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      setInset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    };

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      setInset(0);
    };
  }, [active]);

  return inset;
}

function renderAiNoteBlocks(body: string) {
  return body
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
    ));
}

const PANEL_INSET = 12;

type Props = {
  mode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  /** 不懂反馈面板遮罩范围（通常为题目区） */
  overlayContainerRef: RefObject<HTMLElement | null>;
  /** 答疑后续流程全屏遮罩（含顶栏/底栏），默认同 overlayContainerRef */
  flowOverlayContainerRef?: RefObject<HTMLElement | null>;
  questionContext?: QaQuestionContext;
  children: ReactNode;
};

const QuizNotUnderstandFlow = forwardRef<HTMLDivElement, Props>(function QuizNotUnderstandFlow(
  {
    mode,
    open,
    onOpenChange,
    onBusyChange,
    overlayContainerRef,
    flowOverlayContainerRef,
    questionContext,
    children,
  },
  ref,
) {
  const navigate = useNavigate();
  const [modalState, setModalState] = useState<ModalState>('hidden');
  const [flowStage, setFlowStage] = useState<FlowStage>('none');
  const [feedbacks, setFeedbacks] = useState<Set<string>>(new Set());
  const [chatSnapshot, setChatSnapshot] = useState<ChatSnapshot | null>(null);
  const [followUpDraft, setFollowUpDraft] = useState('');
  const [followUpMessages, setFollowUpMessages] = useState<ChatFollowUpMessage[]>([]);
  const [followUpFocused, setFollowUpFocused] = useState(false);
  const [aiNoteBody, setAiNoteBody] = useState(DEFAULT_AI_NOTE_BODY);
  const [aiNoteEditing, setAiNoteEditing] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);
  const [overlayHostEl, setOverlayHostEl] = useState<HTMLElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const followUpInputRef = useRef<HTMLTextAreaElement>(null);
  const aiNoteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const keyboardInset = useKeyboardInset(flowStage === 'chat');

  const isBusy = modalState !== 'hidden' || flowStage !== 'none';
  const showFeedbackPanel = open && modalState === 'feedback';

  useEffect(() => {
    setOverlayHostEl(overlayContainerRef.current);
  }, [overlayContainerRef, showFeedbackPanel, flowStage]);

  useEffect(() => {
    onBusyChange?.(isBusy);
  }, [isBusy, onBusyChange]);

  useEffect(() => {
    if (!open) {
      setModalState('hidden');
      setFlowStage('none');
      setFeedbacks(new Set());
      setChatSnapshot(null);
      setFollowUpDraft('');
      setFollowUpMessages([]);
      setFollowUpFocused(false);
      setAiNoteBody(DEFAULT_AI_NOTE_BODY);
      setAiNoteEditing(false);
      return;
    }
    if (modalState === 'hidden' && flowStage === 'none') {
      setFeedbacks(new Set());
      setModalState('feedback');
    }
  }, [open, modalState, flowStage]);

  useEffect(() => {
    const el = typeof ref === 'function' ? null : ref?.current;
    if (!el) return;
    const update = () => setFooterHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, showFeedbackPanel, flowStage]);

  const closeAll = () => {
    setModalState('hidden');
    setFlowStage('none');
    setFeedbacks(new Set());
    setChatSnapshot(null);
    setFollowUpDraft('');
    setFollowUpMessages([]);
    setFollowUpFocused(false);
    setAiNoteBody(DEFAULT_AI_NOTE_BODY);
    setAiNoteEditing(false);
    onOpenChange(false);
  };

  const adjustFollowUpHeight = useCallback(() => {
    const el = followUpInputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, []);

  const scrollChatToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const sendFollowUp = useCallback(() => {
    const text = followUpDraft.trim();
    if (!text) return;
    const ts = Date.now();
    setFollowUpMessages((prev) => [
      ...prev,
      { id: `u-${ts}`, role: 'user', text },
      { id: `t-${ts + 1}`, role: 'teacher', text: buildTeacherFollowUpReply(text) },
    ]);
    setFollowUpDraft('');
    requestAnimationFrame(adjustFollowUpHeight);
  }, [followUpDraft, adjustFollowUpHeight]);

  useEffect(() => {
    if (flowStage !== 'chat') return;
    scrollChatToBottom(followUpMessages.length > 0 ? 'smooth' : 'auto');
  }, [flowStage, followUpMessages, chatSnapshot, keyboardInset, scrollChatToBottom]);

  useEffect(() => {
    if (flowStage !== 'aiPreview') setAiNoteEditing(false);
  }, [flowStage]);

  useEffect(() => {
    if (!aiNoteEditing) return;
    const timer = window.setTimeout(() => aiNoteTextareaRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [aiNoteEditing]);

  const handleCloseModal = () => {
    setModalState('hidden');
    onOpenChange(false);
  };

  const handleFindTeacher = () => {
    if (questionContext) {
      setChatSnapshot({
        question: questionContext,
        confusionLabels: labelsFromFeedbackIds(FEEDBACK_OPTS, feedbacks),
      });
    }
    setModalState('hidden');
    setFlowStage('chat');
  };

  const toggleFeedback = (fid: string) => {
    setFeedbacks((prev) => {
      const next = new Set(prev);
      if (next.has(fid)) next.delete(fid);
      else next.add(fid);
      return next;
    });
  };

  const panelStyle = {
    position: 'absolute' as const,
    left: PANEL_INSET,
    right: PANEL_INSET,
    top: PANEL_INSET,
    bottom: PANEL_INSET,
    zIndex: 43,
    borderRadius: 24,
    background: '#FFFFFF',
    overflow: 'hidden' as const,
  };

  const overlayHost = overlayContainerRef.current ?? overlayHostEl;
  const flowOverlayHost =
    flowOverlayContainerRef?.current ?? overlayContainerRef.current ?? overlayHostEl;

  const userConfusionMessage = chatSnapshot
    ? buildConfusionUserMessage(chatSnapshot.confusionLabels)
    : '';
  const teacherOpening = chatSnapshot
    ? buildTeacherOpening(chatSnapshot.confusionLabels)
    : '你卡在 B/C 选项理解上，我先用对比法拆解。';

  function QuestionContextCard({ snapshot }: { snapshot: ChatSnapshot }) {
    const { question, confusionLabels } = snapshot;
    return (
      <div
        style={{
          borderRadius: 12,
          background: '#F2F4F6',
          padding: '12px 14px',
          marginBottom: 4,
        }}
      >
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#8E98A8' }}>本题</p>
        {question.topic && (
          <p style={{ margin: '4px 0 0', fontSize: 12, lineHeight: '18px', color: '#00A7E1', fontWeight: 500 }}>
            {question.topic}
          </p>
        )}
        <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: '20px', color: '#1C2B39' }}>{question.questionText}</p>
        {question.options.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {question.options.slice(0, 4).map((opt, index) => {
              const isSelected = question.selectedAnswerIndex === index;
              return (
                <div key={`${index}-${opt}`} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: '18px',
                      color: isSelected ? '#003459' : '#8E98A8',
                    }}
                  >
                    {optionLetter(index)}.
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      lineHeight: '18px',
                      color: isSelected ? '#003459' : '#1C2B39',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {stripOptionPrefix(opt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {confusionLabels.length > 0 && (
          <p style={{ margin: '10px 0 0', fontSize: 12, lineHeight: '18px', color: '#8E98A8' }}>
            不懂项：{confusionLabels.join('、')}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      {overlayHost &&
        showFeedbackPanel &&
        createPortal(
          <motion.div
            key="feedback-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleCloseModal}
            style={{
              position: 'absolute',
              inset: 0,
              ...FEEDBACK_MASK_STYLE,
              zIndex: 20,
            }}
          />,
          overlayHost,
        )}

      {flowOverlayHost && flowStage !== 'none' &&
        createPortal(
          <>
            <motion.div
              key="flow-mask"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeAll}
              style={{
                position: 'absolute',
                inset: 0,
                ...FLOW_MASK_STYLE,
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
                  ...panelStyle,
                  bottom: PANEL_INSET + keyboardInset,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ height: 73, borderBottom: '1px solid #F2F4F6', padding: '18px 18px 0', position: 'relative', flexShrink: 0 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      background: '#00A7E1',
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    赵
                  </div>
                  <p style={{ margin: 0, position: 'absolute', left: 66, top: 22, fontSize: 16, fontWeight: 600, color: '#1C2B39' }}>
                    赵老师 · 一对一答疑
                  </p>
                  <p style={{ margin: 0, position: 'absolute', left: 66, top: 46, fontSize: 12, color: '#8E98A8' }}>
                    已接入答疑会话，可转 AI 笔记
                  </p>
                </div>

                <div
                  ref={chatScrollRef}
                  onClick={() => followUpInputRef.current?.blur()}
                  style={{
                    flex: 1,
                    minHeight: 0,
                    padding: '16px 16px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    background: '#F7F8FA',
                  }}
                >
                  {chatSnapshot && <QuestionContextCard snapshot={chatSnapshot} />}

                  {chatSnapshot && (
                    <div
                      style={{
                        alignSelf: 'flex-end',
                        width: '78%',
                        borderRadius: 14,
                        background: '#003459',
                        padding: '16px 14px',
                        fontSize: 13,
                        lineHeight: '19px',
                        color: '#FFFFFF',
                      }}
                    >
                      {userConfusionMessage}
                    </div>
                  )}

                  <div style={{ width: '72%', borderRadius: 14, background: '#E8F3FA', padding: '18px 14px', fontSize: 13, lineHeight: '19px', color: '#1C2B39' }}>
                    {teacherOpening}
                  </div>
                  {!chatSnapshot && (
                    <div style={{ alignSelf: 'flex-end', width: '70%', borderRadius: 14, background: '#003459', padding: '16px 14px', fontSize: 13, lineHeight: '19px', color: '#FFFFFF' }}>
                      明白了，我总把「风险投机」当成管理步骤。
                    </div>
                  )}
                  <div style={{ width: '78%', borderRadius: 14, background: '#E8F3FA', padding: '16px 14px', fontSize: 13, lineHeight: '19px', color: '#1C2B39' }}>
                    <p style={{ margin: 0 }}>记忆口诀：识别-评估-应对-监控。</p>
                    <p style={{ margin: 0 }}>聊完可点下方按钮，AI 会整理成笔记。</p>
                  </div>

                  {followUpMessages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        width: msg.role === 'user' ? '78%' : '78%',
                        borderRadius: 14,
                        background: msg.role === 'user' ? '#003459' : '#E8F3FA',
                        padding: '16px 14px',
                        fontSize: 13,
                        lineHeight: '19px',
                        color: msg.role === 'user' ? '#FFFFFF' : '#1C2B39',
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    flexShrink: 0,
                    borderTop: '1px solid #E5E7EB',
                    background: '#FFFFFF',
                    padding: '8px 12px calc(8px + env(safe-area-inset-bottom, 0px))',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <textarea
                      ref={followUpInputRef}
                      rows={1}
                      value={followUpDraft}
                      onChange={(e) => {
                        setFollowUpDraft(e.target.value);
                        adjustFollowUpHeight();
                      }}
                      onFocus={() => {
                        setFollowUpFocused(true);
                        requestAnimationFrame(() => scrollChatToBottom('smooth'));
                      }}
                      onBlur={() => setFollowUpFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendFollowUp();
                        }
                      }}
                      placeholder="输入你的追问…"
                      aria-label="输入你的追问"
                      style={{
                        flex: 1,
                        minHeight: 40,
                        maxHeight: 96,
                        borderRadius: 8,
                        border: 'none',
                        background: '#F2F4F6',
                        boxShadow: followUpFocused ? 'inset 0 0 0 1.5px #00A7E1' : 'none',
                        padding: '10px 12px',
                        fontSize: 15,
                        lineHeight: '20px',
                        color: '#1C2B39',
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      type="button"
                      onClick={sendFollowUp}
                      disabled={!followUpDraft.trim()}
                      style={{
                        flexShrink: 0,
                        minWidth: 56,
                        height: 40,
                        padding: '0 12px',
                        border: 'none',
                        borderRadius: 8,
                        background: followUpDraft.trim() ? '#00A7E1' : '#E8EDF2',
                        color: followUpDraft.trim() ? '#FFFFFF' : '#8E98A8',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: followUpDraft.trim() ? 'pointer' : 'default',
                      }}
                    >
                      发送
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFlowStage('aiPreview')}
                    style={{
                      width: '100%',
                      height: 40,
                      marginTop: 8,
                      border: 'none',
                      borderRadius: 8,
                      background: '#003459',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    AI整理答疑笔记
                  </button>
                </div>
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
                  ...panelStyle,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '28px 24px 20px',
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: 20, lineHeight: '28px', fontWeight: 600, color: '#1C2B39' }}>AI 已整理本次答疑笔记</p>
                  <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: '18px', color: '#8E98A8' }}>建议保存到「风险管理-易错点」目录</p>
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
                    renderAiNoteBlocks(aiNoteBody)
                  )}
                </div>

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
                    onClick={() => {
                      setAiNoteEditing(false);
                      setFlowStage('noteAdded');
                    }}
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
                  ...panelStyle,
                  padding: '24px 24px 20px',
                }}
              >
                <div style={{ height: 46, borderRadius: 12, background: 'rgba(33,159,94,0.14)', display: 'flex', alignItems: 'center', paddingLeft: 18, fontSize: 13, fontWeight: 600, color: '#219F5E' }}>
                  ✓ 已添加进笔记（可在列表中复习）
                </div>
                <p style={{ margin: '18px 0 0', fontSize: 18, lineHeight: '24px', fontWeight: 600, color: '#1C2B39' }}>笔记列表 · 风险管理</p>

                <div style={{ marginTop: 14, borderRadius: 14, background: 'rgba(232,243,250,0.85)', padding: '16px 14px' }}>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: '19px', fontWeight: 600, color: '#1C2B39' }}>【新】风险投机 vs 风险管理（赵老师答疑）</p>
                  <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: '18px', color: '#8E98A8' }}>来源：刷题页 · 不懂反馈</p>
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
                  onClick={closeAll}
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
          </>,
          flowOverlayHost,
        )}

      <div
        ref={ref}
        style={{
          flexShrink: 0,
          background: '#fff',
          boxShadow: showFeedbackPanel ? '0 -4px 24px rgba(0,0,0,0.10)' : '0 -3px 4px rgba(0,13,38,0.08)',
          zIndex: 30,
        }}
      >
        <AnimatePresence initial={false}>
          {showFeedbackPanel && (
            <motion.div
              key="feedback-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 32, stiffness: 340 }}
              style={{ overflow: 'hidden' }}
            >
              <div
                style={{
                  padding: '16px 20px 12px',
                  borderRadius: '20px 20px 0 0',
                  background: '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1C2B3A' }}>哪里不明白？</p>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.07)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 16,
                      color: '#8E98A8',
                    }}
                  >
                    ×
                  </button>
                </div>

                <p style={{ margin: '0 0 12px', fontSize: 13, color: '#8E98A8' }}>选择后找老师答疑（可多选）</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {FEEDBACK_OPTS.slice(0, 4).map((fb) => {
                    const on = feedbacks.has(fb.id);
                    return (
                      <button
                        key={fb.id}
                        type="button"
                        onClick={() => toggleFeedback(fb.id)}
                        style={{
                          padding: '10px 4px',
                          borderRadius: 10,
                          border: on ? '1.5px solid #00A7E1' : '1.5px solid transparent',
                          background: on ? 'rgba(0,167,225,0.12)' : 'rgba(0,0,0,0.05)',
                          color: on ? '#003459' : '#8E98A8',
                          fontSize: 12,
                          fontWeight: on ? 600 : 400,
                          lineHeight: 1.3,
                          textAlign: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        {fb.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 8 }}>
                  {FEEDBACK_OPTS.slice(4).map((fb) => {
                    const on = feedbacks.has(fb.id);
                    return (
                      <button
                        key={fb.id}
                        type="button"
                        onClick={() => toggleFeedback(fb.id)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 10,
                          border: on ? '1.5px solid #00A7E1' : '1.5px solid transparent',
                          background: on ? 'rgba(0,167,225,0.12)' : 'rgba(0,0,0,0.05)',
                          color: on ? '#003459' : '#8E98A8',
                          fontSize: 12,
                          fontWeight: on ? 600 : 400,
                          lineHeight: 1.3,
                          textAlign: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        {fb.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleFindTeacher}
                  style={{
                    width: '100%',
                    height: 48,
                    marginTop: 12,
                    borderRadius: 999,
                    background: '#00A7E1',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  找老师
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {children}
      </div>

      {overlayHost &&
        modalState === 'recorded' &&
        createPortal(
          <>
            <motion.div
              key="recorded-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(240,245,255,0.72)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                zIndex: 21,
                pointerEvents: 'none',
              }}
            />
            <motion.div
              key="recorded-mascot"
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280, delay: 0.05 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                zIndex: 22,
                pointerEvents: 'none',
              }}
            >
              <FocoOwlLogo size={120} />
              <p style={{ fontSize: 22, fontWeight: 800, color: '#1C2B3A', letterSpacing: '0.01em' }}>get！加入改进清单！</p>
              <p style={{ fontSize: 14, color: '#8E98A8' }}>已记录你的反馈，谢谢～</p>
            </motion.div>
          </>,
          overlayHost,
        )}
    </>
  );
});

export default QuizNotUnderstandFlow;
