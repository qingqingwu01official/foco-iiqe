import { useEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Highlighter } from 'lucide-react';
import type { QuizQuestion } from '../data/quizQuestions';
import {
  createQuizNoteId,
  formatQuizNoteMeta,
  saveQuizNote,
  type QuizNoteRecord,
} from '../lib/quizNotes';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overlayContainerRef: RefObject<HTMLElement | null>;
  question: QuizQuestion;
  questionIndex: number;
  returnPath: string;
  mode: 'basic' | 'sprint';
  chapterName?: string;
  sectionName?: string;
  highlightedSnippet?: string;
  onSaved?: (note: QuizNoteRecord) => void;
};

export default function QuizAddNoteSheet({
  open,
  onOpenChange,
  overlayContainerRef,
  question,
  questionIndex,
  returnPath,
  mode,
  chapterName,
  sectionName,
  highlightedSnippet = '',
  onSaved,
}: Props) {
  const [body, setBody] = useState('');
  const [overlayHost, setOverlayHost] = useState<HTMLElement | null>(null);
  const hasHighlight = highlightedSnippet.trim().length > 0;
  const highlightSegmentCount = (highlightedSnippet.match(/【/g) ?? []).length;

  useEffect(() => {
    setOverlayHost(overlayContainerRef.current);
  }, [overlayContainerRef, open]);

  useEffect(() => {
    if (open) setBody('');
  }, [open, question.id]);

  const handleClose = () => onOpenChange(false);

  const handleCopyHighlight = () => {
    const snippet = highlightedSnippet.trim();
    if (!snippet) return;
    setBody((prev) => {
      if (!prev.trim()) return snippet;
      return `${prev.trim()}\n\n${snippet}`;
    });
  };

  const handleSave = () => {
    const trimmed = body.trim();
    if (!trimmed) return;

    const createdAt = new Date().toISOString();
    const note: QuizNoteRecord = {
      id: createQuizNoteId(),
      category: 'quiz',
      title: question.topic ? `${question.topic} · 刷题笔记` : '刷题笔记',
      summary: trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed,
      body: trimmed,
      meta: formatQuizNoteMeta(createdAt, chapterName),
      tags: ['#刷题笔记'],
      questionId: question.id,
      questionText: question.question,
      options: question.options,
      topic: question.topic,
      returnPath,
      questionIndex,
      mode,
      chapterName,
      sectionName,
      createdAt,
    };

    saveQuizNote(note);
    onSaved?.(note);
    onOpenChange(false);
  };

  if (!overlayHost) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="quiz-note-mask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.28)',
              zIndex: 44,
            }}
          />
          <motion.div
            key="quiz-note-sheet"
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 28, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 16,
              zIndex: 45,
              borderRadius: 20,
              background: '#FFFFFF',
              boxShadow: '0 12px 40px rgba(0,52,89,0.18)',
              padding: '18px 18px 16px',
              maxHeight: 'min(72vh, 520px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1C2B39' }}>添加刷题笔记</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8E98A8' }}>保存后可在「刷题笔记」中查看</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="关闭"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(0,0,0,0.06)',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} color="#8E98A8" />
              </button>
            </div>

            <div
              style={{
                borderRadius: 12,
                background: '#F2F4F6',
                padding: '12px 14px',
                marginBottom: 12,
                maxHeight: 120,
                overflowY: 'auto',
              }}
            >
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#8E98A8' }}>题目</p>
              <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: '20px', color: '#1C2B39' }}>{question.question}</p>
            </div>

            <button
              type="button"
              onClick={handleCopyHighlight}
              disabled={!hasHighlight}
              style={{
                width: '100%',
                height: 42,
                marginBottom: 10,
                border: hasHighlight ? '1.5px solid rgba(0,167,225,0.35)' : '1.5px solid rgba(0,52,89,0.08)',
                borderRadius: 12,
                background: hasHighlight ? 'rgba(0,167,225,0.08)' : '#F8FAFB',
                color: hasHighlight ? '#003459' : '#B0B8C4',
                fontSize: 14,
                fontWeight: 600,
                cursor: hasHighlight ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Highlighter size={16} color={hasHighlight ? '#00A7E1' : '#B0B8C4'} />
              {hasHighlight
                ? `复制高亮块${highlightSegmentCount > 0 ? `（${highlightSegmentCount} 段）` : ''}`
                : '复制高亮块'}
            </button>
            {!hasHighlight && (
              <p style={{ margin: '0 0 10px', fontSize: 11, lineHeight: '16px', color: '#8E98A8' }}>
                请先在解析区选中需要记录的 Tab，高亮内容将写入笔记
              </p>
            )}

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="写下你的理解、错因或需要记住的要点…"
              style={{
                width: '100%',
                minHeight: 120,
                flex: 1,
                resize: 'none',
                border: '1px solid rgba(0,52,89,0.1)',
                borderRadius: 12,
                padding: '12px 14px',
                fontSize: 14,
                lineHeight: '22px',
                color: '#1C2B39',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <button
              type="button"
              onClick={handleSave}
              disabled={!body.trim()}
              style={{
                marginTop: 12,
                width: '100%',
                height: 48,
                border: 'none',
                borderRadius: 999,
                background: body.trim() ? '#003459' : 'rgba(0,52,89,0.2)',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                cursor: body.trim() ? 'pointer' : 'default',
              }}
            >
              保存到刷题笔记
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    overlayHost,
  );
}
