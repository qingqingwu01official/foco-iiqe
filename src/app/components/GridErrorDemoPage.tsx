import { useSyncExternalStore, useMemo } from 'react';
import { Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import ChapterCardCarousel from './ChapterCardCarousel';
import {
  CHAPTERS,
  subscribe,
  getState,
  setChapter,
  setKillFilter,
  openPractice,
  closePractice,
  answerCorrect,
  answerWrong,
  nextRedCellId,
  stats,
  resetDemo,
  type GridCell,
} from '../lib/gridErrorMechanism';

const NAVY = '#003459';
const BLUE = '#00A7E1';
const BG = '#F6FAFD';

function useDemoState() {
  return useSyncExternalStore(subscribe, getState, getState);
}

function cellStyle(c: GridCell): { bg: string; color: string; label: string } {
  if (c.state === 'done') return { bg: '#12C75A', color: '#fff', label: '✓' };
  if (c.state === 'active') {
    const map: Record<number, string> = { 1: BLUE, 2: '#FF8C00', 3: '#C03B30' };
    return { bg: map[c.killsLeft] ?? '#C03B30', color: '#fff', label: String(c.killsLeft) };
  }
  return { bg: '#E2E8EE', color: '#94A3B8', label: '' };
}

function PracticeSheet({
  cell,
  onCorrect,
  onWrong,
  onClose,
}: {
  cell: GridCell;
  onCorrect: () => void;
  onWrong: () => void;
  onClose: () => void;
}) {
  const s = cellStyle(cell);
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,30,60,0.35)' }}>
      <div
        className="rounded-t-3xl px-5 pt-5 pb-10"
        style={{ background: '#fff', maxHeight: '85vh' }}
      >
        <div className="flex items-center justify-between mb-4">
          <p style={{ fontSize: 13, color: '#64748B' }}>错题本 · 练题</p>
          <button type="button" onClick={onClose} style={{ fontSize: 14, color: NAVY }}>
            关闭
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>{cell.topic}</p>
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: BG, border: `1px solid ${s.bg}33` }}
        >
          <p style={{ fontSize: 15, fontWeight: 600, color: NAVY, lineHeight: 1.5 }}>
            （演示题）请判断：保险的基本原则包括最大诚信原则。
          </p>
        </div>
        <div className="flex items-center gap-2 mb-5">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ background: s.bg }}
          >
            {s.label || '·'}
          </span>
          <p style={{ fontSize: 12, color: '#64748B' }}>
            {cell.state === 'empty' && '灰色=未写 · 答对直接掌握，答错进入错题池'}
            {cell.state === 'active' && `还需答对 ${cell.killsLeft} 次可消灭`}
            {cell.state === 'done' && '已掌握 · 答错会重新回到错题池'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onWrong}
            className="flex-1 py-3.5 rounded-2xl font-semibold"
            style={{ background: '#FFF', border: `1.5px solid ${BLUE}`, color: NAVY }}
          >
            答错了
          </button>
          <button
            type="button"
            onClick={onCorrect}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-white"
            style={{ background: NAVY }}
          >
            答对了
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GridErrorDemoPage() {
  const demo = useDemoState();
  const { cells, killFilter, activeChapterId, practicingId } = demo;

  const st = useMemo(() => stats(cells), [cells]);
  const practicingCell = practicingId ? cells.find((c) => c.id === practicingId) : null;

  return (
    <div
      className="size-full flex flex-col overflow-hidden"
      style={{
        background: BG,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        maxWidth: 393,
        margin: '0 auto',
      }}
    >
      {/* 顶栏 · 同错题本 */}
      <header className="flex-none bg-white px-4 pt-11 pb-2.5 border-b border-black/5">
        <div className="flex items-center gap-3">
          <Link
            to="/demo"
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.04)' }}
          >
            <ChevronLeft size={18} color={NAVY} />
          </Link>
          <div
            className="px-4 py-1.5 rounded-full"
            style={{ background: NAVY }}
          >
            <span className="text-white text-sm font-semibold">格子总览</span>
          </div>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => resetDemo()}
            className="text-xs px-2 py-1 rounded-lg"
            style={{ color: BLUE }}
          >
            重置
          </button>
        </div>
      </header>

      {/* 滑动关卡区 · 章节卡片轮播 */}
      <section className="flex-none px-2 pt-3 pb-2 flex-1 min-h-0 overflow-hidden">
        <div
          className="rounded-[28px] px-2 pt-3 pb-4 relative h-full"
          style={{ background: 'rgba(0,0,0,0.05)' }}
        >
          <ChapterCardCarousel
            chapters={CHAPTERS}
            cells={cells}
            activeChapterId={activeChapterId}
            killFilter={killFilter}
            onChapterChange={setChapter}
            onCellClick={openPractice}
          />
        </div>
      </section>

      {/* 数据台 */}
      <footer
        className="flex-none mt-auto rounded-t-[26px] px-4 pt-4 pb-8 shadow-[0_-8px_32px_rgba(0,52,89,0.06)]"
        style={{ background: '#fff' }}
      >
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: '总格子', value: st.total },
            { label: '已掌握', value: st.done },
            { label: '待消灭', value: st.red },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-2xl py-2.5 px-2 text-center"
              style={{ background: BG, border: '1px solid #E6F4FF' }}
            >
              <p style={{ fontSize: 20, fontWeight: 700, color: NAVY }}>{m.value}</p>
              <p style={{ fontSize: 11, color: '#64748B' }}>{m.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <select
            value={killFilter}
            onChange={(e) => setKillFilter(Number(e.target.value) as 0 | 1 | 2 | 3)}
            className="rounded-2xl px-3 py-3 text-sm font-semibold flex-none"
            style={{ border: `1px solid ${BLUE}`, color: NAVY, minWidth: 120 }}
          >
            <option value={0}>消灭次数 ▾</option>
            <option value={1}>仅 1 次</option>
            <option value={2}>仅 2 次</option>
            <option value={3}>仅 3 次</option>
          </select>
          <button
            type="button"
            onClick={() => {
              const id = nextRedCellId(activeChapterId);
              if (id) openPractice(id);
            }}
            disabled={st.red === 0}
            className="flex-1 py-3 rounded-2xl text-white font-semibold disabled:opacity-40"
            style={{ background: BLUE }}
          >
            开始
          </button>
        </div>

        <p className="text-center text-[11px]" style={{ color: '#94A3B8' }}>
          错题本 = 点格子后的练题页 · 状态会同步回格子
        </p>
      </footer>

      {practicingCell && (
        <PracticeSheet
          cell={practicingCell}
          onClose={closePractice}
          onCorrect={() => answerCorrect(practicingCell.id)}
          onWrong={() => answerWrong(practicingCell.id)}
        />
      )}
    </div>
  );
}
