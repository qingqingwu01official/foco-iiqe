import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft, Lock, Check } from 'lucide-react';

// ── Data definitions ──────────────────────────────────────────
const chapterGroups = [
  { id: 'ch1', name: '第一章', label: '风险与保险基础', count: 78,  redRatio: 0.14 },
  { id: 'ch2', name: '第二章', label: '保险合约',       count: 95,  redRatio: 0.18 },
  { id: 'ch3', name: '第三章', label: '一般保险',       count: 112, redRatio: 0.15 },
  { id: 'ch4', name: '第四章', label: '责任保险',       count: 89,  redRatio: 0.13 },
  { id: 'ch5', name: '第五章', label: '汽车保险',       count: 134, redRatio: 0.16 },
  { id: 'ch6', name: '第六章', label: '员工补偿保险',   count: 67,  redRatio: 0.12 },
  { id: 'ch7', name: '第七章', label: '再保险',         count: 45,  redRatio: 0.10 },
];

const libraryGroups = [
  { id: 'lib1', name: '重中之重', stars: 2, count: 85,  redRatio: 0.14 },
  { id: 'lib2', name: '次重点',   stars: 1, count: 156, redRatio: 0.18 },
  { id: 'lib3', name: '一般考点', stars: 0, count: 234, redRatio: 0.15 },
  { id: 'lib4', name: '补充考点', stars: 0, count: 98,  redRatio: 0.12 },
];

// ── Types ─────────────────────────────────────────────────────
type CellStatus = 'gray' | 'red' | 'green';
interface Cell  { id: string; questionIndex: number; status: CellStatus; killsLeft: number }
interface Group { id: string; name: string; label?: string; stars?: number; items: Cell[] }

function buildGroups(defs: typeof chapterGroups | typeof libraryGroups): Group[] {
  return defs.map((def) => ({
    id: def.id,
    name: def.name,
    label: (def as any).label,
    stars: (def as any).stars,
    items: Array.from({ length: def.count }, (_, i) => {
      const r = Math.random();
      const status: CellStatus = r < 0.3 ? 'gray' : r < 0.3 + def.redRatio ? 'red' : 'green';
      return {
        id: `${def.id}-${i}`,
        questionIndex: i,
        status,
        killsLeft: status === 'red' ? Math.floor(Math.random() * 3) + 1 : 0,
      };
    }),
  }));
}

// ── Sub-components ────────────────────────────────────────────
function GridCell({ item, groupId, mode, onPress }: { item: Cell; groupId: string; mode: string; onPress: () => void }) {
  const bg =
    item.status === 'gray'  ? '#D1D5DB' :
    item.status === 'red'   ? '#FF3B30' : '#34C759';

  return (
    <button
      onClick={onPress}
      className="relative flex items-center justify-center rounded-md active:opacity-70 transition-opacity"
      style={{ aspectRatio: '1/1', background: bg }}
    >
      {item.status === 'gray'  && <Lock  className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
      {item.status === 'green' && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      {item.status === 'red'   && (
        <span style={{ color: '#ffffff', fontSize: 10, fontWeight: 700, lineHeight: 1 }}>
          {item.killsLeft}
        </span>
      )}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function GridOverviewPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const mode      = (location.state as any)?.mode === 'sprint' ? 'sprint' : 'basic';
  const isBasic   = mode === 'basic';

  const tabs = isBasic ? chapterGroups : libraryGroups;
  const [activeTab, setActiveTab] = useState('all');

  const allGroups: Group[] = useMemo(
    () => buildGroups(isBasic ? chapterGroups : libraryGroups),
    [isBasic]
  );

  const visibleGroups = activeTab === 'all'
    ? allGroups
    : allGroups.filter((g) => g.id === activeTab);

  const totalAll   = allGroups.reduce((s, g) => s + g.items.length, 0);
  const totalGreen = allGroups.reduce((s, g) => s + g.items.filter(i => i.status === 'green').length, 0);
  const totalRed   = allGroups.reduce((s, g) => s + g.items.filter(i => i.status === 'red').length, 0);
  const masterPct  = Math.round((totalGreen / totalAll) * 100);

  return (
    <div
      className="size-full flex flex-col overflow-hidden"
      style={{
        background: '#F2F4F7',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* ── Header ── */}
      <div className="flex-none" style={{ background: '#003459' }}>
        <div className="flex items-center gap-3 px-4 pt-11 pb-2.5">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full active:opacity-60 transition-opacity"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 500, letterSpacing: '0.04em' }}>
              {isBasic ? '打基础模式' : '考前冲刺模式'}
            </p>
            <p style={{ color: '#ffffff', fontSize: 16, fontWeight: 700 }}>格子总览</p>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,59,48,0.18)' }}
          >
            <span style={{ color: '#FF6B60', fontSize: 13, fontWeight: 700 }}>{totalRed} 红</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex px-4 pb-4 gap-4">
          {[
            { label: '总题数',  value: totalAll },
            { label: '已掌握',  value: totalGreen },
            { label: '掌握率',  value: `${masterPct}%` },
          ].map((s) => (
            <div key={s.label} className="flex-1 text-center">
              <p style={{ color: '#ffffff', fontSize: 18, fontWeight: 700 }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        className="flex-none overflow-x-auto"
        style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.07)' }}
      >
        <div className="flex px-3 py-2 gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('all')}
            className="flex-none px-4 py-1.5 rounded-full transition-all active:opacity-70"
            style={{
              fontSize: 13,
              fontWeight: activeTab === 'all' ? 600 : 400,
              color: activeTab === 'all' ? '#ffffff' : '#8E98A8',
              background: activeTab === 'all' ? '#003459' : 'transparent',
            }}
          >
            全部
          </button>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-none px-4 py-1.5 rounded-full transition-all active:opacity-70"
                style={{
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#ffffff' : '#8E98A8',
                  background: active ? '#003459' : 'transparent',
                }}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Grid groups ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {visibleGroups.map((group) => {
          const redCount   = group.items.filter(i => i.status === 'red').length;
          const greenCount = group.items.filter(i => i.status === 'green').length;
          const pct        = Math.round((greenCount / group.items.length) * 100);

          return (
            <div
              key={group.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  {group.stars != null && group.stars > 0 && (
                    <span style={{ color: '#F5A623', fontSize: 11 }}>{'★'.repeat(group.stars)}</span>
                  )}
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1C2B3A' }}>{group.name}</p>
                  {group.label && (
                    <p style={{ fontSize: 12, color: '#8E98A8' }}>{group.label}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {redCount > 0 && (
                    <span style={{ fontSize: 12, color: '#FF3B30', fontWeight: 600 }}>{redCount} 红</span>
                  )}
                  <span style={{ fontSize: 12, color: '#34C759', fontWeight: 600 }}>{pct}%</span>
                </div>
              </div>

              <div className="mx-4 mb-3 rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(0,0,0,0.06)' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#34C759' }} />
              </div>

              <div className="px-4 pb-4 grid gap-1.5" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
                {group.items.map((item) => {
                  const groupId = group.id.replace('ch', '').replace('lib', '');
                  const quizPath = `/quiz/${mode}/${groupId}`;
                  return (
                    <GridCell
                      key={item.id}
                      item={item}
                      groupId={group.id}
                      mode={mode}
                      onPress={() => navigate(quizPath, {
                        state: { mode, questionIndex: item.questionIndex }
                      })}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 py-2">
          {[
            { color: '#D1D5DB', content: <Lock  className="w-2.5 h-2.5 text-white" />, label: '未做' },
            { color: '#FF3B30', content: <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>2</span>, label: '需消灭次数' },
            { color: '#34C759', content: <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />, label: '已掌握' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="flex items-center justify-center rounded" style={{ width: 18, height: 18, background: l.color }}>
                {l.content}
              </div>
              <span style={{ fontSize: 12, color: '#8E98A8' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div
        className="flex-none px-4 pb-8 pt-3"
        style={{ background: '#ffffff', borderTop: '1px solid rgba(0,0,0,0.07)' }}
      >
        <button
          onClick={() => navigate('/errors', { state: { mode } })}
          className="w-full py-4 rounded-2xl active:opacity-80 transition-opacity"
          style={{ background: '#FF3B30' }}
        >
          <span style={{ color: '#ffffff', fontSize: 16, fontWeight: 700 }}>
            开始消灭 {totalRed} 个红格子
          </span>
        </button>
      </div>
    </div>
  );
}
