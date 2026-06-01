import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import { FocoOwlLogo } from './FocoAssets';

const roles = [
  {
    id: 'new',
    icon: <Sparkles className="w-5 h-5" />,
    title: '初次使用',
    desc: '第一次接触，让 FOCO 带你上手',
  },
  {
    id: 'returning',
    icon: <BookOpen className="w-5 h-5" />,
    title: '已开始学习',
    desc: '继续我的备考进度',
  },
];

export default function RoleSelectPage() {
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    if (id === 'new') {
      navigate('/welcome');
    } else {
      // 已开始学习 → 跳过欢迎页，直接进模式选择
      const subject = localStorage.getItem('iiqe_subject') || '卷一';
      navigate('/mode-select', { state: { subject } });
    }
  };

  return (
    <div
      className="size-full flex flex-col items-center justify-center px-6"
      style={{
        background: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.34, 1.26, 0.64, 1] }}
        style={{ marginBottom: 20 }}
      >
        <FocoOwlLogo size={64} />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="text-center mb-10"
      >
        <p style={{ fontSize: 22, fontWeight: 700, color: '#003459', marginBottom: 6 }}>
          你好，欢迎回来
        </p>
        <p style={{ fontSize: 14, color: '#8E98A8' }}>请选择你的使用情况</p>
      </motion.div>

      {/* Role cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="w-full max-w-sm space-y-3"
      >
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => handleSelect(role.id)}
            className="w-full text-left active:scale-[0.98] transition-transform"
          >
            <div
              className="flex items-center gap-4 px-5 py-4 rounded-2xl"
              style={{
                background: '#F2F4F7',
                border: '1.5px solid transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00A7E1')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
            >
              <div
                className="flex-none flex items-center justify-center rounded-xl"
                style={{ width: 44, height: 44, background: '#003459', color: '#ffffff' }}
              >
                {role.icon}
              </div>
              <div className="flex-1">
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1C2B3A', marginBottom: 2 }}>
                  {role.title}
                </p>
                <p style={{ fontSize: 13, color: '#8E98A8' }}>{role.desc}</p>
              </div>
              <ChevronRight className="flex-none w-4 h-4" style={{ color: '#C8CDD5' }} />
            </div>
          </button>
        ))}
      </motion.div>
    </div>
  );
}
