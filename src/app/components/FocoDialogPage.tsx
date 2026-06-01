import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { FocoOwlAvatar, FocoOwlLogo } from './FocoAssets';

type Message = { id: number; text: string; sender: 'mascot' | 'user' };

interface LocationState {
  subjectLabel?: string;
  exam?: string;
}

const WELCOME_STORAGE_KEY = 'foco_welcome_state';

export default function FocoDialogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const subjectLabel = state.subjectLabel || '卷一 保险原理及实务';

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1000);
  const planSentRef = useRef(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(WELCOME_STORAGE_KEY);
    let base: Message[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        base = parsed.messages ?? [];
        idRef.current = Math.max(idRef.current, parsed.nextId ?? 1000);
      } catch {
        /* ignore */
      }
    }

    const vol = subjectLabel.split(' ')[0];
    const withSubject = base.some((m) => m.sender === 'user' && m.text.startsWith(vol));
    const initial = withSubject
      ? base
      : [...base, { id: ++idRef.current, text: subjectLabel, sender: 'user' as const }];
    setMessages(initial);

    if (planSentRef.current || initial.some((m) => m.text.includes('备考计划'))) {
      setShowCta(true);
      return;
    }
    planSentRef.current = true;

    let cancelled = false;
    (async () => {
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled) return;
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, 900));
      if (cancelled) return;
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: ++idRef.current,
          text: `太好了，「IIQE ${vol}」已选定 ✅\n接下来为你制定备考计划～`,
          sender: 'mascot',
        },
      ]);
      setShowCta(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [subjectLabel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleContinue = () => {
    navigate('/mode-select', {
      state: { subject: subjectLabel, exam: state.exam ?? 'IIQE' },
    });
  };

  return (
    <div
      className="size-full flex flex-col overflow-hidden"
      style={{
        background: '#003459',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div className="flex-none flex items-center justify-center gap-3 pt-11 pb-4 px-6">
        <FocoOwlLogo size={44} />
        <span style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, letterSpacing: '0.1em' }}>
          FOCO
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3 min-h-0">
        {messages.map((msg) =>
          msg.sender === 'mascot' ? (
            <MascotBubble key={msg.id} text={msg.text} />
          ) : (
            <UserBubble key={msg.id} text={msg.text} />
          ),
        )}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {showCta && (
        <div className="flex-none px-5 pb-10 pt-2">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-4 rounded-2xl transition-all active:scale-[0.98]"
            style={{ background: '#00A7E1', color: '#fff', fontWeight: 600, fontSize: 16 }}
          >
            继续选择学习模式 →
          </button>
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
        className="max-w-[78%] rounded-2xl rounded-bl-sm px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(8px)' }}
      >
        <p className="text-white text-sm leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
          {text}
        </p>
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
        className="max-w-[78%] rounded-2xl rounded-br-sm px-4 py-3"
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
