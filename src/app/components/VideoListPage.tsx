import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Play } from 'lucide-react';

type WatchStatus = 'watched' | 'progress' | 'unwatched';

interface Video {
  id: string;
  title: string;
  duration: string;
  status: WatchStatus;
  progress?: number;
}

interface Chapter {
  id: number;
  name: string;
  videos: Video[];
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    name: '第1章 风险的概念',
    videos: [
      { id: 'v1-1', title: '风险与不确定性辨析', duration: '08:24', status: 'watched' },
      { id: 'v1-2', title: 'VaR 计算方法入门', duration: '12:05', status: 'progress', progress: 45 },
      { id: 'v1-3', title: '蒙特卡洛模拟原理', duration: '09:50', status: 'unwatched' },
    ],
  },
  {
    id: 2,
    name: '第2章 法律规则',
    videos: [
      { id: 'v2-1', title: '监管框架总览', duration: '15:32', status: 'unwatched' },
      { id: 'v2-2', title: '合规要点精讲', duration: '09:18', status: 'unwatched' },
    ],
  },
  {
    id: 3,
    name: '第3章 概率分布',
    videos: [
      { id: 'v3-1', title: '正态分布在风控中的应用', duration: '11:40', status: 'watched' },
      { id: 'v3-2', title: '厚尾风险与极端情景', duration: '10:06', status: 'unwatched' },
    ],
  },
];

const FILTER_OPTIONS = ['按章节', '未看完'] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

const STATUS_STYLE: Record<WatchStatus, { bg: string; text: string; label: string }> = {
  watched: { bg: '#E0F2E8', text: '#218C5C', label: '已看完' },
  progress: { bg: '#E5F0FA', text: '#003459', label: '观看中' },
  unwatched: { bg: '#EDF0F2', text: '#8E98A8', label: '未观看' },
};

function VideoCard({ video }: { video: Video }) {
  const style = STATUS_STYLE[video.status];
  const label =
    video.status === 'progress' && video.progress != null
      ? `观看中 · ${video.progress}%`
      : style.label;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        gap: 12,
        padding: '10px 12px 10px 10px',
        borderRadius: 12,
        background: 'rgba(0,0,0,0.03)',
        border: '1px solid rgba(0,0,0,0.04)',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 112,
          height: 63,
          borderRadius: 8,
          background: '#141A24',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Play size={16} color="rgba(255,255,255,0.88)" fill="rgba(255,255,255,0.88)" strokeWidth={0} />
        </div>
        <div
          style={{
            position: 'absolute',
            right: 4,
            bottom: 4,
            padding: '2px 4px',
            borderRadius: 4,
            background: 'rgba(0,0,0,0.55)',
            fontSize: 10,
            color: '#fff',
            fontWeight: 500,
            lineHeight: 'normal',
          }}
        >
          {video.duration}
        </div>
        {video.status === 'progress' && video.progress != null && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 3,
              background: 'rgba(255,255,255,0.25)',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${video.progress}%`,
                background: '#33A6FF',
                borderRadius: 999,
              }}
            />
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 500,
            color: '#003459',
            lineHeight: 'normal',
          }}
        >
          {video.title}
        </p>
      </div>

      <span
        style={{
          position: 'absolute',
          right: 12,
          bottom: 10,
          padding: '3px 8px',
          borderRadius: 999,
          background: style.bg,
          color: style.text,
          fontSize: 11,
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function VideoListPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterOption>('按章节');
  const [filterOpen, setFilterOpen] = useState(false);

  const displayChapters = useMemo(() => {
    if (filter === '未看完') {
      return CHAPTERS.map((chapter) => ({
        ...chapter,
        videos: chapter.videos.filter((video) => video.status !== 'watched'),
      })).filter((chapter) => chapter.videos.length > 0);
    }
    return CHAPTERS;
  }, [filter]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        overflow: 'hidden',
        position: 'relative',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "PingFang SC", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          height: 'var(--foco-header-height)',
          padding: 'var(--foco-header-pt) var(--foco-header-px) var(--foco-header-pb)',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          position: 'relative',
          zIndex: 20,
        }}
      >
        <button
          type="button"
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
          难点集解
        </div>

        <div style={{ flex: 1 }} />

        <button
          type="button"
          onClick={() => setFilterOpen((open) => !open)}
          style={{
            height: 32,
            minWidth: 119,
            padding: '0 14px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(255,255,255,0.12)',
            color: 'rgba(0,52,89,0.92)',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {filter} ▾
        </button>
      </div>

      {filterOpen && (
        <>
          <div
            onClick={() => setFilterOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.05)', zIndex: 30 }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'var(--foco-header-height)',
              right: 16,
              zIndex: 40,
              minWidth: 140,
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              overflow: 'hidden',
            }}
          >
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setFilter(option);
                  setFilterOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '11px 16px',
                  fontSize: 14,
                  color: option === filter ? '#003459' : '#5A6472',
                  fontWeight: option === filter ? 600 : 400,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 16px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {displayChapters.map((chapter, chapterIndex) => (
          <div key={chapter.id}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingTop: 8,
                paddingBottom: 4,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#003459',
                  flexShrink: 0,
                }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#003459',
                  lineHeight: 'normal',
                }}
              >
                {chapter.name}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {chapter.videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            {chapterIndex < displayChapters.length - 1 && <div style={{ height: 4 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
