import { FocoOwlLogo, FocoOwlAvatar } from './FocoAssets';
import { ChevronLeft, ChevronRight, BookMarked, Grid3x3, Zap, BookOpen, Check, Flame, Target, RotateCcw } from 'lucide-react';

/* ─────────────────────────────────────────────
   Design token definitions (sidebar)
───────────────────────────────────────────── */
const COLORS = [
  { name: 'Navy / Primary',     hex: '#003459', usage: '导航栏、标题、按钮' },
  { name: 'Blue / Accent',      hex: '#00A7E1', usage: '进度条、CTA、选中态' },
  { name: 'Red / Error',        hex: '#FF3B30', usage: '错题、待消灭红格子' },
  { name: 'Green / Done',       hex: '#34C759', usage: '已完成、掌握' },
  { name: 'Orange / Star',      hex: '#FF9500', usage: '重点星级、beak装饰' },
  { name: 'Background',         hex: '#F0F2F5', usage: '页面底色' },
  { name: 'Surface',            hex: '#FFFFFF', usage: '卡片、面板' },
  { name: 'Text Primary',       hex: '#1C2B3A', usage: '正文标题' },
  { name: 'Text Secondary',     hex: '#8E98A8', usage: '副文本、说明' },
];

const TYPOGRAPHY = [
  { role: 'Display',   size: 72, weight: 800, sample: '87' },
  { role: 'H1',        size: 26, weight: 700, sample: 'FOCO备考' },
  { role: 'H2',        size: 20, weight: 700, sample: '选择章节' },
  { role: 'H3',        size: 17, weight: 600, sample: '打基础模式' },
  { role: 'Body 1',    size: 16, weight: 400, sample: '保险合约基础知识' },
  { role: 'Body 2',    size: 14, weight: 400, sample: '按章节顺序练习' },
  { role: 'Caption',   size: 12, weight: 400, sample: '0 / 78 题' },
  { role: 'Label',     size: 11, weight: 600, sample: 'IIQE 保险中介人' },
];

/* ─────────────────────────────────────────────
   iPhone frame wrapper
───────────────────────────────────────────── */
function PhoneFrame({ label, annotation, children }: {
  label: string;
  annotation?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      {/* Label */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#8E98A8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </span>
        {annotation && (
          <span style={{ fontSize: 11, color: '#B0B8C4' }}>{annotation}</span>
        )}
      </div>

      {/* Device + bezel */}
      <div style={{
        position: 'relative',
        width: 390,
        height: 844,
        borderRadius: 52,
        boxShadow: '0 0 0 2px #D1D5DB, 0 20px 60px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        background: '#ffffff',
        flexShrink: 0,
      }}>
        {/* Dynamic island */}
        <div style={{
          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
          width: 126, height: 37, background: '#000000', borderRadius: 20, zIndex: 99,
        }} />
        {/* Screen content */}
        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Screen 1 — Splash
───────────────────────────────────────────── */
function SplashMockup() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <FocoOwlLogo size={96} />
      <p style={{ fontSize: 26, fontWeight: 700, color: '#003459', marginTop: 28, marginBottom: 10, letterSpacing: '0.01em' }}>FOCO备考</p>
      <p style={{ fontSize: 15, color: 'rgba(0,52,89,0.4)', letterSpacing: '0.06em' }}>您的时间很珍贵</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Screen 2 — Role Select
───────────────────────────────────────────── */
function RoleSelectMockup() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', fontFamily: 'system-ui', boxSizing: 'border-box' }}>
      <FocoOwlLogo size={64} />
      <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 40 }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: '#003459', marginBottom: 6 }}>你好，欢迎回来</p>
        <p style={{ fontSize: 14, color: '#8E98A8' }}>请选择你的使用情况</p>
      </div>
      {[
        { icon: '✨', title: '初次使用', desc: '第一次接触，让 FOCO 带你上手' },
        { icon: '📖', title: '已开始学习', desc: '继续我的备考进度' },
      ].map((r) => (
        <div key={r.title} style={{ width: '100%', background: '#F2F4F7', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, background: '#003459', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{r.icon}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#1C2B3A', margin: 0 }}>{r.title}</p>
            <p style={{ fontSize: 13, color: '#8E98A8', margin: '2px 0 0' }}>{r.desc}</p>
          </div>
          <ChevronRight style={{ width: 16, height: 16, color: '#C8CDD5' }} />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Screen 3 — Welcome / Onboarding
───────────────────────────────────────────── */
function WelcomeMockup() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#003459', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '56px 24px 20px' }}>
        <FocoOwlLogo size={44} />
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: '0.1em' }}>FOCO</span>
      </div>
      {/* Chat */}
      <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { s: 'mascot', t: '你好！我是 FOCO 👋' },
          { s: 'mascot', t: '我是你的备考专家，选对考试才能事半功倍。先告诉我你要备考什么项目？' },
          { s: 'user', t: 'IIQE' },
          { s: 'mascot', t: '好的，IIQE！请继续选择科目 👇' },
        ].map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.s === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
            {m.s === 'mascot' && <div style={{ flexShrink: 0 }}><FocoOwlAvatar size={28} /></div>}
            <div style={{ maxWidth: '70%', background: m.s === 'user' ? '#00A7E1' : 'rgba(255,255,255,0.13)', borderRadius: m.s === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px', padding: '10px 14px' }}>
              <p style={{ color: '#fff', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{m.t}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Panel */}
      <div style={{ background: '#fff', borderRadius: '22px 22px 0 0', padding: '16px 16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: '#003459', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>IIQE</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1C2B3A' }}>选择科目</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: 'rgba(0,52,89,0.06)', borderRadius: 20 }}>
            <RotateCcw style={{ width: 11, height: 11, color: '#8E98A8' }} />
            <span style={{ fontSize: 11, color: '#8E98A8' }}>切换考试</span>
          </div>
        </div>
        {['卷一 · 一般保险', '卷二 · 长期保险', '卷三 · 强积金'].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F7F8FA', borderRadius: 14, padding: '12px 14px', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1C2B3A' }}>{s}</span>
            <ChevronRight style={{ width: 14, height: 14, color: '#C8CDD5' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Screen 4 — Mode Select
───────────────────────────────────────────── */
function ModeSelectMockup() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#003459', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '56px 20px 16px', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft style={{ width: 18, height: 18, color: '#fff' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>卷一 · 一般保险</p>
          <p style={{ color: '#fff', fontSize: 17, fontWeight: 600, margin: 0 }}>选择学习模式</p>
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Mascot */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <FocoOwlAvatar size={48} />
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: '14px 14px 14px 2px', padding: '12px 16px' }}>
            <p style={{ color: '#fff', fontSize: 13, margin: 0, lineHeight: 1.5 }}>最后一步！根据你目前的备考阶段，选择最适合的学习模式。</p>
          </div>
        </div>

        {/* Mode cards */}
        {[
          { icon: <BookOpen style={{ width: 26, height: 26, color: '#fff' }} />, title: '打基础模式', badge: '初次备考推荐', desc: '按教材章节顺序练习，循序渐进建立完整知识体系。', selected: true },
          { icon: <Zap style={{ width: 26, height: 26, color: '#fff' }} />, title: '考前冲刺模式', badge: '有基础者推荐', desc: '按重难点四色分类，集中攻克高频考点与易错题。', selected: false },
        ].map((m) => (
          <div key={m.title} style={{ background: m.selected ? 'rgba(0,167,225,0.18)' : 'rgba(255,255,255,0.08)', border: `2px solid ${m.selected ? '#00A7E1' : 'rgba(255,255,255,0.12)'}`, borderRadius: 16, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ width: 46, height: 46, background: m.selected ? '#00A7E1' : 'rgba(255,255,255,0.12)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{m.icon}</div>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: m.selected ? '#00A7E1' : 'transparent', border: m.selected ? 'none' : '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {m.selected && <Check style={{ width: 12, height: 12, color: '#fff' }} />}
              </div>
            </div>
            <p style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>{m.title}</p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{m.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 20px 40px' }}>
        <div style={{ background: '#00A7E1', borderRadius: 16, padding: '16px', textAlign: 'center' }}>
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>以「打基础模式」开始学习</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Screen 5 — Chapter List (Basic Home)
───────────────────────────────────────────── */
function ChapterListMockup() {
  const chapters = [
    { n: '01', name: '风险与保险基础', done: 32, total: 78, active: true },
    { n: '02', name: '保险合约',       done: 0,  total: 95  },
    { n: '03', name: '一般保险',       done: 0,  total: 112 },
    { n: '04', name: '责任保险',       done: 0,  total: 89  },
    { n: '05', name: '汽车保险',       done: 0,  total: 134 },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: '#F0F2F5', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui', position: 'relative' }}>
      {/* Header card */}
      <div style={{ margin: '12px 12px 0', background: '#003459', borderRadius: '28px 28px 0 0', padding: '52px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, margin: 0, fontWeight: 500 }}>打基础模式</p>
            <p style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>选择章节</p>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Grid3x3 style={{ width: 15, height: 15, color: '#fff' }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>总体进度</span>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>32 / 620 题 · 5%</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: '5%', height: '100%', background: '#00A7E1', borderRadius: 4 }} />
        </div>
      </div>

      {/* Chapter list */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '12px 12px 80px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {chapters.map((ch) => (
          <div key={ch.n} style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 38, height: 38, background: 'rgba(0,52,89,0.07)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#8E98A8' }}>{ch.n}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: ch.active ? '5px solid #00A7E1' : '2px solid #C8CDD5', background: '#fff', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1C2B3A', margin: 0 }}>{ch.name}</p>
                <span style={{ fontSize: 12, color: '#8E98A8' }}>{ch.done} / {ch.total} 题</span>
              </div>
            </div>
            <ChevronRight style={{ width: 15, height: 15, color: '#C8CDD5', flexShrink: 0 }} />
          </div>
        ))}
      </div>

      {/* Fixed bottom error book */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 12px 28px', background: 'linear-gradient(to bottom, transparent, #F0F2F5 28%)' }}>
        <div style={{ background: '#003459', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 20px rgba(0,52,89,0.35)' }}>
          <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookMarked style={{ width: 15, height: 15, color: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>错题本</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: 0 }}>27 道错题待消灭</p>
          </div>
          <ChevronRight style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.35)' }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Screen 6 — Library Select (Sprint Home)
───────────────────────────────────────────── */
function LibrarySelectMockup() {
  const libs = [
    { n: '01', name: '重中之重', accent: '#FF3B30', bg: 'rgba(255,59,48,0.08)', red: 12, total: 85, priority: true },
    { n: '02', name: '次重点',   accent: '#FF9500', bg: 'rgba(255,149,0,0.08)', red: 28, total: 156 },
    { n: '03', name: '一般考点', accent: '#00A7E1', bg: 'rgba(0,167,225,0.08)', red: 35, total: 234 },
    { n: '04', name: '补充考点', accent: '#8E98A8', bg: 'rgba(142,152,168,0.08)', red: 12, total: 98 },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: '#F0F2F5', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui', position: 'relative' }}>
      {/* Header */}
      <div style={{ margin: '12px 12px 0', background: '#003459', borderRadius: '28px 28px 0 0', padding: '52px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, margin: 0 }}>考前冲刺 · 卷一</p>
            <p style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>选择题库</p>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Grid3x3 style={{ width: 15, height: 15, color: '#fff' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          {[{ l: '总题数', v: '573' }, { l: '已掌握', v: '486' }, { l: '掌握率', v: '85%' }].map(s => (
            <div key={s.l} style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>{s.v}</p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, margin: 0 }}>{s.l}</p>
            </div>
          ))}
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: '85%', height: '100%', background: '#00A7E1', borderRadius: 4 }} />
        </div>
      </div>

      {/* Library cards */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '12px 12px 80px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {libs.map((lib) => (
          <div key={lib.n} style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, border: lib.priority ? `1.5px solid ${lib.accent}` : '1.5px solid transparent', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 38, height: 38, background: lib.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: lib.accent }}>{lib.n}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#1C2B3A', margin: 0 }}>{lib.name}</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#8E98A8' }}>{lib.total} 题</span>
                <span style={{ fontSize: 12, color: '#FF3B30', fontWeight: 600 }}>{lib.red} 红</span>
              </div>
            </div>
            <ChevronRight style={{ width: 15, height: 15, color: '#C8CDD5' }} />
          </div>
        ))}
      </div>

      {/* Fixed error book */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 12px 28px', background: 'linear-gradient(to bottom, transparent, #F0F2F5 28%)' }}>
        <div style={{ background: '#003459', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 20px rgba(0,52,89,0.35)' }}>
          <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookMarked style={{ width: 15, height: 15, color: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>错题本</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: 0 }}>87 道错题待消灭</p>
          </div>
          <ChevronRight style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.35)' }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Screen 7 — Quiz Page
───────────────────────────────────────────── */
function QuizMockup() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#ffffff', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui', position: 'relative' }}>
      {/* Header */}
      <div style={{ background: '#003459', padding: '52px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ChevronLeft style={{ width: 18, height: 18, color: '#fff' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: 0 }}>第一章 · 风险与保险基础</p>
          <p style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: 0 }}>第 3 / 78 题</p>
        </div>
        <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: '4%', height: '100%', background: '#00A7E1' }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ padding: '24px 20px 16px' }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#1C2B3A', lineHeight: 1.6, margin: 0 }}>
          根据《保险公司条例》，以下哪项陈述关于保险人的义务是正确的？
        </p>
      </div>

      {/* Options */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'A', text: '保险人须于收到索偿申请后 7 个工作天内回复', correct: false },
          { label: 'B', text: '保险人须如实披露所有可能影响风险的重要事实', correct: true },
          { label: 'C', text: '保险人无须提供书面保单，口头协议即有效', correct: false },
          { label: 'D', text: '保险人可单方面更改已签订保单的条款', correct: false },
        ].map((opt) => (
          <div key={opt.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 14, background: opt.correct ? 'rgba(52,199,89,0.1)' : '#F7F8FA', border: `1.5px solid ${opt.correct ? '#34C759' : 'transparent'}` }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: opt.correct ? '#34C759' : '#E8ECF0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: opt.correct ? '#fff' : '#8E98A8' }}>{opt.label}</span>
            </div>
            <p style={{ fontSize: 14, color: opt.correct ? '#1C7A3A' : '#1C2B3A', lineHeight: 1.5, margin: 0 }}>{opt.text}</p>
          </div>
        ))}
      </div>

      {/* Bookmark strip */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 52, background: '#003459', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12 }}>
        <BookMarked style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.6)' }} />
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>书签</span>
        <div style={{ flex: 1 }} />
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>已标记 3 题</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Screen 8 — Grid Overview
───────────────────────────────────────────── */
function GridMockup() {
  const groups = [
    { name: '第一章', cells: Array.from({ length: 18 }, (_, i) => ({ c: i < 15 ? 'g' : 'r' })) },
    { name: '第二章', cells: Array.from({ length: 20 }, (_, i) => ({ c: i < 8 ? 'g' : 'r' })) },
    { name: '第三章', cells: Array.from({ length: 16 }, () => ({ c: 'n' })) },
  ];
  const colorMap: Record<string, string> = { g: '#34C759', r: '#FF3B30', n: '#E8ECF0' };
  return (
    <div style={{ width: '100%', height: '100%', background: '#003459', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '52px 20px 16px', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft style={{ width: 18, height: 18, color: '#fff' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>格子总览</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>打基础模式</p>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, padding: '0 20px 16px' }}>
        {[{ c: '#34C759', l: '已掌握' }, { c: '#FF3B30', l: '待消灭' }, { c: '#E8ECF0', l: '未练习' }].map(item => (
          <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: item.c }} />
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{item.l}</span>
          </div>
        ))}
      </div>

      {/* Grid groups */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {groups.map((g) => (
          <div key={g.name}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, margin: '0 0 8px' }}>{g.name}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {g.cells.map((cell, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: 6, background: colorMap[cell.c] }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '12px 20px 40px' }}>
        <div style={{ background: '#FF3B30', borderRadius: 16, padding: 16, textAlign: 'center' }}>
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>开始消灭红格子 →</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Screen 9 — Error Book
───────────────────────────────────────────── */
function ErrorBookMockup() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#F2F4F7', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ background: '#003459', padding: '52px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 2 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, margin: 0 }}>打基础模式</p>
            <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>错题本</p>
          </div>
          <div style={{ background: 'rgba(255,59,48,0.18)', borderRadius: 20, padding: '4px 12px' }}>
            <span style={{ color: '#FF6B60', fontSize: 13, fontWeight: 700 }}>待消灭 5</span>
          </div>
        </div>
      </div>

      {/* Sort tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '8px 12px', display: 'flex', gap: 6 }}>
        {['按章节', '按错误次数'].map((tab, i) => (
          <div key={tab} style={{ padding: '6px 14px', borderRadius: 20, background: i === 0 ? '#003459' : 'transparent', fontSize: 13, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? '#fff' : '#8E98A8' }}>{tab}</div>
        ))}
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflow: 'hidden', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#003459', margin: '0 0 6px' }}>第一章</p>
        {[
          { topic: '风险管理的三种含义', errors: 3, done: 0, total: 3, level: '重中之重' },
          { topic: '保险的基本原则',     errors: 2, done: 1, total: 3, level: '重中之重' },
          { topic: '一般保险的定义',     errors: 1, done: 2, total: 3, level: '次重点' },
        ].map((q) => (
          <div key={q.topic} style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', borderLeft: '3px solid #FF3B30', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ background: 'rgba(0,52,89,0.07)', color: '#003459', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>第一章</span>
              <span style={{ color: '#8E98A8', fontSize: 11 }}>{q.level}</span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1C2B3A', margin: '0 0 8px' }}>{q.topic}</p>
            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#8E98A8' }}>错误 <span style={{ color: '#FF3B30', fontWeight: 700 }}>{q.errors}</span> 次</span>
              <span style={{ fontSize: 12, color: '#8E98A8' }}>消灭 {q.done}/{q.total}</span>
            </div>
            <div style={{ height: 3, background: 'rgba(0,0,0,0.06)', borderRadius: 4, marginBottom: 10 }}>
              <div style={{ width: `${(q.done / q.total) * 100}%`, height: '100%', background: '#34C759', borderRadius: 4 }} />
            </div>
            <div style={{ background: '#003459', borderRadius: 10, padding: '8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Target style={{ width: 12, height: 12, color: '#fff' }} />
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>练习这道题</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Design Spec Page
───────────────────────────────────────────── */
const SCREENS = [
  { id: 'S1', label: '01 · 启动页',     note: '品牌加载 · 3s 后自动跳转',     component: <SplashMockup /> },
  { id: 'S2', label: '02 · 角色选择',   note: '初次使用 → 欢迎页 | 已学习 → 模式选择',  component: <RoleSelectMockup /> },
  { id: 'S3', label: '03 · 欢迎 / 考试选择', note: '对话式引导 · sessionStorage 保留记录', component: <WelcomeMockup /> },
  { id: 'S4', label: '04 · 学习模式选择', note: '打基础 / 考前冲刺',            component: <ModeSelectMockup /> },
  { id: 'S5', label: '05 · 打基础主页',  note: '章节列表 · 错题本固定底栏',    component: <ChapterListMockup /> },
  { id: 'S6', label: '06 · 考前冲刺主页', note: '四色题库 · 错题本固定底栏',   component: <LibrarySelectMockup /> },
  { id: 'S7', label: '07 · 刷题页',     note: '题目 + 选项 + 底部书签栏',     component: <QuizMockup /> },
  { id: 'S8', label: '08 · 格子总览',   note: '绿 = 已掌握 · 红 = 待消灭',    component: <GridMockup /> },
  { id: 'S9', label: '09 · 错题本',     note: '按章节/错误次数筛选',           component: <ErrorBookMockup /> },
];

export default function DesignSpecPage() {
  return (
    <div
      style={{
        minHeight: '100%',
        background: '#F5F5F7',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        overflowY: 'auto',
      }}
    >
      {/* ── Cover ── */}
      <div style={{ background: '#003459', padding: '60px 48px 48px' }}>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px' }}>
          FOCO 备考 · UI Prototype
        </p>
        <h1 style={{ color: '#ffffff', fontSize: 40, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          设计原型规格文档
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, margin: '0 0 32px' }}>
          Mobile App · 9 Screens · 390 × 844 pt · 2026
        </p>
        {/* Route hint */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 16px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>实时预览路径：</span>
          <code style={{ color: '#00A7E1', fontSize: 13, fontWeight: 600 }}>/design</code>
        </div>
      </div>

      <div style={{ padding: '40px 48px', maxWidth: 1600, margin: '0 auto' }}>

        {/* ── Design Tokens ── */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1C2B3A', margin: '0 0 24px' }}>Design Tokens</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {/* Colors */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#8E98A8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px' }}>Color Palette</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {COLORS.map((c) => (
                  <div key={c.hex} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 12, padding: '10px 14px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: c.hex, flexShrink: 0, border: '1px solid rgba(0,0,0,0.06)' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1C2B3A', margin: 0 }}>{c.name}</p>
                      <p style={{ fontSize: 12, color: '#8E98A8', margin: '1px 0 0' }}>{c.usage}</p>
                    </div>
                    <code style={{ fontSize: 12, color: '#8E98A8', background: '#F2F4F7', padding: '3px 8px', borderRadius: 6 }}>{c.hex}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#8E98A8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px' }}>Typography Scale</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {TYPOGRAPHY.map((t) => (
                  <div key={t.role} style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 100, flexShrink: 0 }}>
                      <p style={{ fontSize: 11, color: '#8E98A8', margin: 0, fontWeight: 600 }}>{t.role}</p>
                      <p style={{ fontSize: 11, color: '#B0B8C4', margin: 0 }}>{t.size}px / {t.weight}</p>
                    </div>
                    <p style={{ fontSize: t.size > 26 ? 26 : t.size, fontWeight: t.weight, color: '#1C2B3A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.sample}
                    </p>
                  </div>
                ))}
              </div>

              {/* Spacing */}
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#8E98A8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '24px 0 16px' }}>Spacing & Radius</h3>
              <div style={{ background: '#fff', borderRadius: 12, padding: '16px' }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                  {[4, 8, 12, 16, 20, 24].map((s) => (
                    <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: s * 2, height: s * 2, background: '#003459', borderRadius: 4 }} />
                      <span style={{ fontSize: 11, color: '#8E98A8' }}>{s}px</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {[{ r: 10, l: 'Tag' }, { r: 14, l: 'Card sm' }, { r: 16, l: 'Card' }, { r: 20, l: 'Panel' }, { r: 28, l: 'Header' }].map(item => (
                    <div key={item.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 40, height: 40, background: '#F2F4F7', border: '1.5px solid #D1D5DB', borderRadius: item.r }} />
                      <span style={{ fontSize: 11, color: '#8E98A8', textAlign: 'center' }}>{item.r}px<br />{item.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Screens grid ── */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1C2B3A', margin: '0 0 8px' }}>Screens</h2>
          <p style={{ fontSize: 14, color: '#8E98A8', margin: '0 0 32px' }}>每帧 390 × 844 pt · 按 Cmd+S 截图后导入 Figma</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 390px)', gap: 48 }}>
            {SCREENS.map((screen) => (
              <PhoneFrame key={screen.id} label={screen.label} annotation={screen.note}>
                {screen.component}
              </PhoneFrame>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: '#B0B8C4', margin: 0 }}>FOCO 备考 · Design Spec v1.0</p>
          <p style={{ fontSize: 13, color: '#B0B8C4', margin: 0 }}>390 × 844 · SF Pro Display · Tailwind CSS v4</p>
        </div>
      </div>
    </div>
  );
}
