import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { FocoOwlLogo, FocoOwlAvatar } from './FocoAssets';

const EXAMS = [
  {
    value: 'IIQE',
    label: 'IIQE',
    fullName: '保险中介人资格考试',
    sub: '香港 · 保险业监管局',
    subjects: [
      { value: '卷一', label: '卷一', subjectName: '保险原理及实务' },
      { value: '卷二', label: '卷二', subjectName: '一般保险' },
      { value: '卷三', label: '卷三', subjectName: '长期保险' },
      { value: '卷四', label: '卷四', subjectName: '强制性公积金' },
      { value: '卷五', label: '卷五', subjectName: '投资相连长期保险' },
    ],
  },
  {
    value: 'HKSI',
    label: 'HKSI LE',
    fullName: '香港证券学会执照考试',
    sub: '香港 · 证监会认可',
    subjects: [
      { value: 'LE1', label: 'LE Paper 1', sub: '证券知识基础' },
      { value: 'LE2', label: 'LE Paper 2', sub: '证券法规与监管' },
      { value: 'LE3', label: 'LE Paper 3', sub: '衍生产品' },
      { value: 'LE6', label: 'LE Paper 6', sub: '企业融资' },
    ],
  },
  {
    value: 'CFA',
    label: 'CFA',
    fullName: 'Chartered Financial Analyst',
    sub: 'CFA Institute 认证',
    subjects: [
      { value: 'CFA_L1', label: 'Level 1', sub: '投资工具与组合管理入门' },
      { value: 'CFA_L2', label: 'Level 2', sub: '资产估值与分析' },
      { value: 'CFA_L3', label: 'Level 3', sub: '财富管理与投资组合' },
    ],
  },
  {
    value: 'CFA_ESG',
    label: 'CFA ESG',
    fullName: 'CFA ESG Investing Certificate',
    sub: 'CFA Institute 认证',
    subjects: [
      { value: 'ESG', label: 'ESG Certificate', sub: '环境、社会及管治投资策略' },
    ],
  },
  {
    value: 'CIA',
    label: 'CIA',
    fullName: 'Certified Internal Auditor',
    sub: 'IIA · 国际内部审计师协会',
    subjects: [
      { value: 'CIA_P1', label: 'Part 1', sub: '内部审计基础' },
      { value: 'CIA_P2', label: 'Part 2', sub: '内部审计实务' },
      { value: 'CIA_P3', label: 'Part 3', sub: '商业知识' },
    ],
  },
];

type Message = { id: number; text: string; sender: 'mascot' | 'user' };
type PanelMode = 'exam' | 'subject';

interface SavedState {
  messages: Message[];
  panelMode: PanelMode;
  selectedExam: string | null;
  nextId: number;
}

const STORAGE_KEY = 'foco_welcome_state';

export default function WelcomePage() {
  const navigate = useNavigate();
  const [initialized, setInitialized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [panelMode, setPanelMode] = useState<PanelMode>('exam');
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  const nextId = () => ++idRef.current;

  /* ── Persist to sessionStorage ── */
  useEffect(() => {
    if (!initialized || navigating) return;
    const state: SavedState = { messages, panelMode, selectedExam, nextId: idRef.current };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [messages, panelMode, selectedExam, initialized, navigating]);

  /* ── Init: restore or fresh start ── */
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state: SavedState = JSON.parse(saved);
        setMessages(state.messages);
        setPanelMode(state.panelMode);
        setSelectedExam(state.selectedExam);
        idRef.current = state.nextId;
        setInitialized(true);
        return;
      } catch {}
    }
    setInitialized(true);
    runGreeting();
  }, []);

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* ── Chat helpers ── */
  const sendMascot = (text: string, preDelay = 0, duration = 900) =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, { id: nextId(), text, sender: 'mascot' }]);
          resolve();
        }, duration);
      }, preDelay);
    });

  const sendUser = (text: string) =>
    setMessages((prev) => [...prev, { id: nextId(), text, sender: 'user' }]);

  const runGreeting = async () => {
    await sendMascot('你好！欢迎来到FOCO～ 👋', 600, 800);
    await sendMascot('您在准备什么考试呢？\n可在下方选择对应的考试哦👇', 300, 1000);
  };

  /* ── Handlers ── */
  const handleExamSelect = async (exam: typeof EXAMS[0]) => {
    if (panelMode === 'subject' && selectedExam === exam.value) return;
    sendUser(exam.label);
    setSelectedExam(exam.value);
    setPanelMode('subject');
    await sendMascot(
      `好的，${exam.label}！请继续选择科目 👇`,
      200,
      700,
    );
  };

  const handleSubjectSelect = (
    exam: typeof EXAMS[0],
    subj: typeof EXAMS[0]['subjects'][0],
  ) => {
    const subjectLabel =
      'subjectName' in subj && subj.subjectName
        ? `${subj.label} ${subj.subjectName}`
        : subj.label;
    sendUser(subjectLabel);
    setNavigating(true);
    setTimeout(
      () =>
        navigate('/foco-dialog', {
          state: { subjectLabel, exam: exam.value },
        }),
      300,
    );
  };

  const handleSwitchExam = async () => {
    sendUser('我想切换考试');
    setPanelMode('exam');
    setSelectedExam(null);
    await sendMascot('没问题，请重新选择你的备考项目。', 200, 600);
  };

  const currentExam = EXAMS.find((e) => e.value === selectedExam) ?? null;

  return (
    <div
      className="size-full flex flex-col overflow-hidden"
      style={{
        background: '#003459',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* ── Header ── */}
      <div className="flex-none flex items-center justify-center gap-3 pt-11 pb-4 px-6">
        <FocoOwlLogo size={44} />
        <span style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, letterSpacing: '0.1em' }}>
          FOCO
        </span>
      </div>

      {/* ── Chat ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3 min-h-0">
        {messages.map((msg) => {
          return msg.sender === 'mascot' ? (
            <MascotBubble key={msg.id} text={msg.text} />
          ) : (
            <UserBubble key={msg.id} text={msg.text} />
          );
        })}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Selection panel ── */}
      {!navigating && initialized && (
        <div
          className="flex-none"
          style={{
            background: '#ffffff',
            borderRadius: '22px 22px 0 0',
            boxShadow: '0 -6px 32px rgba(0,0,0,0.22)',
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-5 pt-4 pb-3"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
          >
            {panelMode === 'exam' ? (
              <p style={{ fontSize: 14, fontWeight: 700, color: '#003459' }}>选择备考项目</p>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded-full"
                  style={{ background: '#003459', color: '#ffffff', fontSize: 12, fontWeight: 700 }}
                >
                  {currentExam?.label}
                </span>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1C2B3A' }}>选择科目</p>
              </div>
            )}
            {panelMode === 'subject' && (
              <button
                onClick={handleSwitchExam}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full active:opacity-60 transition-opacity"
                style={{ background: 'rgba(0,52,89,0.06)' }}
              >
                <RefreshCw className="w-3 h-3" style={{ color: '#003459' }} />
                <span style={{ fontSize: 12, color: '#003459', fontWeight: 500 }}>切换考试</span>
              </button>
            )}
          </div>

          {/* Options */}
          <div
            className="px-4 py-3 space-y-2"
            style={{ maxHeight: 280, overflowY: 'auto', paddingBottom: 32 }}
          >
            {panelMode === 'exam'
              ? EXAMS.map((exam) => (
                  <button
                    key={exam.value}
                    onClick={() => handleExamSelect(exam)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl active:scale-[0.99] transition-transform"
                    style={{
                      background: selectedExam === exam.value ? 'rgba(0,52,89,0.07)' : '#F7F8FA',
                      border:
                        selectedExam === exam.value
                          ? '1.5px solid #003459'
                          : '1.5px solid transparent',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1C2B3A' }}>
                          {exam.label}
                        </span>
                        <span style={{ fontSize: 13, color: '#8E98A8' }}>{exam.fullName}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#B0B8C4', marginTop: 1 }}>{exam.sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#C8CDD5' }} />
                  </button>
                ))
              : currentExam?.subjects.map((subj) => {
                  const line =
                    'subjectName' in subj && subj.subjectName
                      ? `${subj.label} ${subj.subjectName}`
                      : subj.label;
                  return (
                    <button
                      key={subj.value}
                      onClick={() => currentExam && handleSubjectSelect(currentExam, subj)}
                      className="w-full text-left flex items-center gap-2.5 px-4 rounded-2xl active:scale-[0.99] transition-transform"
                      style={{
                        background: '#F7F8FA',
                        border: '1.5px solid transparent',
                        minHeight: 52,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = 'rgba(0,52,89,0.18)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = 'transparent')
                      }
                    >
                      <span
                        className="flex-shrink-0 rounded-full"
                        style={{
                          width: 6,
                          height: 6,
                          background: '#003459',
                          marginLeft: 12,
                        }}
                      />
                      <span
                        className="flex-1 min-w-0"
                        style={{ fontSize: 15, fontWeight: 700, color: '#1C2B3A' }}
                      >
                        {line}
                      </span>
                      <ChevronRight
                        className="w-4 h-4 flex-shrink-0 mr-1"
                        style={{ color: '#C8CDD5' }}
                      />
                    </button>
                  );
                })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function MascotBubble({ text }: { text: string }) {
  return (
    <div
      className="flex items-end gap-2"
      style={{ animation: 'fadeSlideUp 0.3s ease-out', paddingLeft: 12 }}
    >
      <div className="flex-shrink-0" style={{ marginBottom: 2 }}>
        <FocoOwlAvatar size={32} />
      </div>
      <div
        className="max-w-[72%] rounded-2xl rounded-bl-sm px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(8px)' }}
      >
        <p className="text-white text-sm leading-relaxed" style={{ whiteSpace: 'pre-line' }}>{text}</p>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div
      className="flex justify-end"
      style={{ animation: 'fadeSlideUp 0.25s ease-out', paddingRight: 12 }}
    >
      <div
        className="max-w-[72%] rounded-2xl rounded-br-sm px-4 py-3"
        style={{ background: '#00A7E1' }}
      >
        <p className="text-white text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2" style={{ paddingLeft: 12 }}>
      <div className="flex-shrink-0" style={{ marginBottom: 2 }}>
        <FocoOwlAvatar size={32} />
      </div>
      <div
        className="rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1"
        style={{ background: 'rgba(255,255,255,0.13)' }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-1.5 h-1.5 rounded-full bg-white"
            style={{ animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}
