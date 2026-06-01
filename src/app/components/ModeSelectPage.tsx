import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { BookOpen, Zap, ChevronDown, ChevronLeft, Check } from 'lucide-react';

import { FocoOwlAvatar } from './FocoAssets';

type Mode = 'basic' | 'sprint';

interface LocationState {
  subject?: string;
}

export default function ModeSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const subject = state.subject || '卷一 保险原理及实务';

  const [selected, setSelected] = useState<Mode | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const handleStart = () => {
    if (!selected) return;
    localStorage.setItem('iiqe_mode', selected);
    localStorage.setItem('iiqe_subject', subject);
    // 首次设定模式后落到首页，由首页次入口进入各流程
    navigate('/home', { state: { mode: selected, subject }, replace: true });
  };

  return (
    <div
      className="size-full flex flex-col overflow-hidden"
      style={{
        background: '#003459',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* ── Header ── */}
      <div className="flex-none flex items-center px-5 pt-11 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors active:scale-95"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-white text-sm" style={{ opacity: 0.5, fontSize: 12, marginBottom: 2 }}>
            {subject}
          </span>
          <span className="text-white" style={{ fontWeight: 600, fontSize: 17 }}>
            选择学习模式
          </span>
        </div>
        {/* step indicator */}
        <div className="flex items-center gap-1.5 w-9 justify-end">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="rounded-full"
              style={{
                width: i === 2 ? 16 : 6,
                height: 6,
                background: i === 2 ? '#00A7E1' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4 min-h-0">

        {/* Subject summary */}
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.1)', animation: 'fadeSlideUp 0.35s ease-out' }}
        >
          <FocoOwlAvatar size={32} />
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs" style={{ opacity: 0.55 }}>
              当前备考科目
            </p>
            <p className="text-white text-sm" style={{ fontWeight: 600 }}>
              IIQE · {subject}
            </p>
          </div>
        </div>

        {/* ── Mode cards ── */}
        <ModeCard
          mode="basic"
          selected={selected === 'basic'}
          onSelect={() => setSelected('basic')}
          icon={<BookOpen className="w-7 h-7" />}
          title="打基础模式"
          badge="初次备考推荐"
          description="按教材章节顺序练习，循序渐进建立完整知识体系，不打乱学习节奏。"
          highlights={['章节顺序练题', '知识全面覆盖', '适合零基础起步']}
        />

        <ModeCard
          mode="sprint"
          selected={selected === 'sprint'}
          onSelect={() => setSelected('sprint')}
          icon={<Zap className="w-7 h-7" />}
          title="考前冲刺模式"
          badge="有基础者推荐"
          description="按重难点四色分类，集中攻克高频考点与易错题，高效利用备考时间。"
          highlights={['重点优先', '四色题库分级', '快速提升胜率']}
        />

        {/* ── Collapsible guide ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <button
            className="w-full flex items-center gap-3 px-4 py-4 active:opacity-70 transition-opacity"
            onClick={() => setGuideOpen((v) => !v)}
          >
            <div className="flex-shrink-0">
              <FocoOwlAvatar size={32} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm" style={{ fontWeight: 500 }}>
                不确定选哪个？
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                点击查看两种模式的适用场景
              </p>
            </div>
            <ChevronDown
              className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
              style={{
                color: 'rgba(255,255,255,0.5)',
                transform: guideOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {/* Expanded content */}
          <div
            className="overflow-hidden transition-all duration-400"
            style={{ maxHeight: guideOpen ? 600 : 0 }}
          >
            <div className="px-4 pb-5 space-y-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <p className="text-xs pt-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                根据你的情况选择 →
              </p>

              <GuideScenario
                mode="basic"
                icon={<BookOpen className="w-4 h-4" />}
                title="选打基础模式，如果你…"
                scenarios={[
                  '还没看过教材，对内容比较陌生',
                  '想第一次把所有知识点过一遍',
                  '距离考试还有充足时间',
                  '喜欢按顺序、系统地学习',
                ]}
              />

              <GuideScenario
                mode="sprint"
                icon={<Zap className="w-4 h-4" />}
                title="选考前冲刺模式，如果你…"
                scenarios={[
                  '已有一定基础，看过部分教材',
                  '距离考试只剩 1–4 周',
                  '想集中突破重点和高频考点',
                  '有错题需要针对性消灭',
                ]}
              />
            </div>
          </div>
        </div>

      </div>

      {/* ── CTA button ── */}
      <div className="flex-none px-5 pb-10 pt-3">
        <button
          onClick={handleStart}
          disabled={!selected}
          className="w-full py-4 rounded-2xl transition-all duration-200 active:scale-95"
          style={{
            background: selected ? '#00A7E1' : 'rgba(255,255,255,0.12)',
            color: selected ? '#ffffff' : 'rgba(255,255,255,0.35)',
            fontWeight: 600,
            fontSize: 16,
            cursor: selected ? 'pointer' : 'not-allowed',
          }}
        >
          {selected
            ? `以「${selected === 'basic' ? '打基础' : '考前冲刺'}模式」开始学习`
            : '请先选择一种学习模式'}
        </button>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ── Mode Card ── */
function ModeCard({
  mode,
  selected,
  onSelect,
  icon,
  title,
  badge,
  description,
  highlights,
}: {
  mode: Mode;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  badge: string;
  description: string;
  highlights: string[];
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-2xl p-5 transition-all duration-200 active:scale-[0.98]"
      style={{
        background: selected ? 'rgba(0,167,225,0.18)' : 'rgba(255,255,255,0.08)',
        border: selected ? '2px solid #00A7E1' : '2px solid rgba(255,255,255,0.12)',
        animation: 'fadeSlideUp 0.4s ease-out',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Icon circle */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: selected ? '#00A7E1' : 'rgba(255,255,255,0.12)', color: '#ffffff' }}
        >
          {icon}
        </div>

        {/* Checkmark */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
          style={{
            background: selected ? '#00A7E1' : 'rgba(255,255,255,0.1)',
            border: selected ? 'none' : '2px solid rgba(255,255,255,0.2)',
          }}
        >
          {selected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-white" style={{ fontWeight: 600, fontSize: 17 }}>{title}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: selected ? 'rgba(0,167,225,0.35)' : 'rgba(255,255,255,0.1)',
              color: selected ? '#ffffff' : 'rgba(255,255,255,0.6)',
            }}
          >
            {badge}
          </span>
        </div>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          {highlights.map((h) => (
            <span
              key={h}
              className="text-xs rounded-full inline-flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.65)',
                padding: '5px 10px',
                minHeight: 24,
                textAlign: 'center',
              }}
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

/* ── Guide Scenario ── */
function GuideScenario({
  icon,
  title,
  scenarios,
}: {
  mode: Mode;
  icon: React.ReactNode;
  title: string;
  scenarios: string[];
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(0,167,225,0.3)', color: '#00A7E1' }}
        >
          {icon}
        </div>
        <span className="text-sm text-white" style={{ fontWeight: 500 }}>{title}</span>
      </div>
      <ul className="space-y-2">
        {scenarios.map((s) => (
          <li key={s} className="flex items-start gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
              style={{ background: '#00A7E1' }}
            />
            <span className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {s}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
