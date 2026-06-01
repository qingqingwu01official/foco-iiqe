import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'motion/react';
import type { Chapter, GridCell } from '../lib/gridErrorMechanism';
import { GRID_COLS } from '../lib/gridErrorMechanism';

const NAVY = '#003459';

type SlideTween = { scale: number; opacity: number; y: number };

function cellStyle(c: GridCell): { bg: string; color: string; label: string } {
  if (c.state === 'done') return { bg: '#12C75A', color: '#fff', label: '✓' };
  if (c.state === 'active') {
    const map: Record<number, string> = { 1: '#00A7E1', 2: '#FF8C00', 3: '#C03B30' };
    return { bg: map[c.killsLeft] ?? '#C03B30', color: '#fff', label: String(c.killsLeft) };
  }
  return { bg: '#E2E8EE', color: '#94A3B8', label: '' };
}

function GridOnCard({
  cells,
  killFilter,
  onCellClick,
}: {
  cells: GridCell[];
  killFilter: number;
  onCellClick: (id: string) => void;
}) {
  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
    >
      {cells.map((cell) => {
        const dimmed =
          killFilter > 0 && !(cell.state === 'active' && cell.killsLeft === killFilter);
        const s = cellStyle(cell);
        return (
          <button
            key={cell.id}
            type="button"
            onClick={() => onCellClick(cell.id)}
            className="aspect-square rounded-lg flex items-center justify-center transition-transform active:scale-95"
            style={{
              background: s.bg,
              opacity: dimmed ? 0.25 : 1,
              fontSize: 11,
              fontWeight: 700,
              color: s.color,
            }}
            title={cell.topic}
          />
        );
      })}
    </div>
  );
}

function ChapterGridCard({
  chapter,
  cells,
  killFilter,
  onCellClick,
  tween,
}: {
  chapter: Chapter;
  cells: GridCell[];
  killFilter: number;
  onCellClick: (id: string) => void;
  tween: SlideTween;
}) {
  const isCenter = tween.scale > 0.98;
  return (
    <div
      className="mx-auto rounded-[26px] p-4 shadow-lg w-full"
      style={{
        background: '#fff',
        maxWidth: 320,
        transform: `translateY(${tween.y}px) scale(${tween.scale}) rotate(${isCenter ? -2.5 : 0}deg)`,
        opacity: tween.opacity,
        transformOrigin: 'center bottom',
        willChange: 'transform, opacity',
      }}
    >
      <p
        className="text-center text-xs font-semibold mb-2 px-3 py-1 rounded-full mx-auto w-fit"
        style={{ background: '#F0F9FF', color: NAVY }}
      >
        {chapter.name} · {chapter.label}
      </p>
      <p className="text-center text-[10px] mb-2" style={{ color: '#94A3B8' }}>
        灰=未写 · 数字=待消灭
      </p>
      <GridOnCard cells={cells} killFilter={killFilter} onCellClick={onCellClick} />
    </div>
  );
}

function StackPeek({ chapter, depth }: { chapter: Chapter; depth: number }) {
  const top = 6 + (depth - 1) * 12;
  const scale = 1 - depth * 0.04;
  return (
    <motion.div
      className="absolute left-1/2 rounded-[20px] pointer-events-none"
      style={{
        top,
        width: 280,
        height: 24,
        marginLeft: -140,
        background: '#fff',
        boxShadow: '0 2px 10px rgba(0,52,89,0.07)',
        zIndex: 4 - depth,
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
      }}
      layout
      initial={false}
      animate={{ opacity: 0.5 - depth * 0.1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <p className="text-center text-[10px] font-medium truncate px-3 pt-1" style={{ color: '#94A3B8' }}>
        {chapter.name}
      </p>
    </motion.div>
  );
}

function defaultTweens(count: number, active: number): SlideTween[] {
  return Array.from({ length: count }, (_, i) =>
    i === active ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.9, opacity: 0.45, y: 14 },
  );
}

export default function ChapterCardCarousel({
  chapters,
  cells,
  activeChapterId,
  killFilter,
  onChapterChange,
  onCellClick,
}: {
  chapters: Chapter[];
  cells: GridCell[];
  activeChapterId: string;
  killFilter: number;
  onChapterChange: (chapterId: string) => void;
  onCellClick: (cellId: string) => void;
}) {
  const startIndex = Math.max(0, chapters.findIndex((c) => c.id === activeChapterId));

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false,
    startIndex,
  });

  const [selectedIndex, setSelectedIndex] = useState(startIndex);
  const [tweens, setTweens] = useState<SlideTween[]>(() => defaultTweens(chapters.length, startIndex));

  const tweenSlides = useCallback(() => {
    if (!emblaApi) return;
    const snaps = emblaApi.scrollSnapList();
    const progress = emblaApi.scrollProgress();
    if (snaps.length <= 1) {
      setTweens(defaultTweens(chapters.length, 0));
      return;
    }
    const step = snaps[1] - snaps[0] || 1;
    setTweens(
      snaps.map((snap) => {
        const dist = Math.abs(snap - progress) / step;
        const t = Math.min(dist, 1);
        return {
          scale: 1 - t * 0.1,
          opacity: 1 - t * 0.5,
          y: t * 16,
        };
      }),
    );
  }, [emblaApi, chapters.length]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const i = emblaApi.selectedScrollSnap();
    setSelectedIndex(i);
    onChapterChange(chapters[i].id);
    tweenSlides();
  }, [emblaApi, chapters, onChapterChange, tweenSlides]);

  useEffect(() => {
    if (!emblaApi) return;
    tweenSlides();
    onSelect();
    emblaApi.on('scroll', tweenSlides);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', tweenSlides);
    return () => {
      emblaApi.off('scroll', tweenSlides);
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', tweenSlides);
    };
  }, [emblaApi, onSelect, tweenSlides]);

  useEffect(() => {
    const i = chapters.findIndex((c) => c.id === activeChapterId);
    if (i >= 0 && emblaApi && emblaApi.selectedScrollSnap() !== i) {
      emblaApi.scrollTo(i);
    }
  }, [activeChapterId, emblaApi, chapters]);

  const cellsForChapter = (chapterId: string) =>
    cells.filter((c) => c.chapterId === chapterId);

  return (
    <div className="relative select-none" style={{ minHeight: 400 }}>
      <div className="absolute inset-x-0 top-0 h-[48px] pointer-events-none z-[1]">
        {selectedIndex > 0 && (
          <StackPeek chapter={chapters[selectedIndex - 1]} depth={1} />
        )}
        {selectedIndex > 1 && (
          <StackPeek chapter={chapters[selectedIndex - 2]} depth={2} />
        )}
      </div>

      <p
        className="text-center text-xs font-medium mb-2 px-3 py-1 rounded-full mx-auto w-fit relative z-[2]"
        style={{
          background: 'rgba(255,255,255,0.8)',
          color: NAVY,
          marginTop: selectedIndex > 0 ? 32 : 4,
        }}
      >
        左右滑动选章 · 点格子练题
      </p>

      <div ref={emblaRef} className="overflow-hidden cursor-grab active:cursor-grabbing z-[3]">
        <div className="flex items-end touch-pan-y">
          {chapters.map((chapter, i) => (
            <div
              key={chapter.id}
              className="flex-[0_0_88%] min-w-0 px-2"
              style={{ zIndex: Math.round((1 - Math.abs(i - selectedIndex)) * 10) }}
            >
              <ChapterGridCard
                chapter={chapter}
                cells={cellsForChapter(chapter.id)}
                killFilter={killFilter}
                onCellClick={onCellClick}
                tween={tweens[i] ?? { scale: 0.9, opacity: 0.5, y: 14 }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-4 relative z-[2]">
        {chapters.map((ch, i) => (
          <button
            key={ch.id}
            type="button"
            onClick={() => emblaApi?.scrollTo(i)}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              background: i === selectedIndex ? NAVY : 'rgba(0,0,0,0.15)',
              width: i === selectedIndex ? 20 : 8,
            }}
            aria-label={`切换到${ch.name}`}
          />
        ))}
      </div>
    </div>
  );
}
