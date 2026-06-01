import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { FocoOwlLogo } from './FocoAssets';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/role-select', { replace: true }), 3000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div
      className="size-full flex flex-col items-center justify-center"
      style={{
        background: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Brand logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.72 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.34, 1.26, 0.64, 1] }}
        style={{ marginBottom: 28 }}
      >
        <FocoOwlLogo size={96} />
      </motion.div>

      {/* FOCO备考 */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.45, ease: 'easeOut' }}
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: '#003459',
          letterSpacing: '0.01em',
          marginBottom: 10,
        }}
      >
        FOCO备考
      </motion.p>

      {/* 您的时间很珍贵 */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95, duration: 0.45, ease: 'easeOut' }}
        style={{
          fontSize: 15,
          fontWeight: 400,
          color: 'rgba(0,52,89,0.4)',
          letterSpacing: '0.06em',
        }}
      >
        您的时间非常宝贵
      </motion.p>
    </div>
  );
}
