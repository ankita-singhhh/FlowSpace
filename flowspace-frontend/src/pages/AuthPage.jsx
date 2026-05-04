import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Zap, Shield, Sparkles, ArrowRight, Star } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 8 + 4,
  delay: Math.random() * 5,
}));

const FEATURES = [
  { icon: CheckCircle2, text: 'Smart task management', sub: 'AI-powered priorities' },
  { icon: Zap, text: 'Habit tracking & analytics', sub: 'Visual progress reports' },
  { icon: Shield, text: 'End-to-end encrypted', sub: 'Your data, always safe' },
];

const STATS = [
  { value: '2.4M+', label: 'Active users' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '4.9★', label: 'App rating' },
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [hoveredStat, setHoveredStat] = useState(null);
  const canvasRef = useRef(null);

  // Debug toggle functionality
  useEffect(() => {
    console.log('AuthPage isLogin:', isLogin);
  }, [isLogin]);

  // Test toggle function
  const handleToggle = () => {
    console.log('handleToggle called, current isLogin:', isLogin);
    setIsLogin(prev => {
      console.log('setIsLogin called, prev:', prev, 'new:', !prev);
      return !prev;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;

    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', resize);

    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > W) d.vx *= -1;
        if (d.y < 0 || d.y > H) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6,182,212,0.35)';
        ctx.fill();
      });
      dots.forEach((a, i) => {
        dots.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99,102,241,${0.18 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId); };
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: '#060811',
      fontFamily: "'Syne', 'Segoe UI', sans-serif", overflow: 'hidden', position: 'relative',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes orbit { from { transform: rotate(0deg) translateX(140px) rotate(0deg); } to { transform: rotate(360deg) translateX(140px) rotate(-360deg); } }
        @keyframes orbit2 { from { transform: rotate(180deg) translateX(200px) rotate(-180deg); } to { transform: rotate(540deg) translateX(200px) rotate(-540deg); } }
        @keyframes pulse-ring { 0%,100%{ opacity:0.15; transform: scale(1); } 50%{ opacity:0.3; transform: scale(1.05); } }
        @keyframes float { 0%,100%{ transform: translateY(0px); } 50%{ transform: translateY(-8px); } }
        .stat-chip:hover { background: rgba(6,182,212,0.12) !important; border-color: rgba(6,182,212,0.4) !important; }
        .feature-row:hover { background: rgba(255,255,255,0.04) !important; }
        .toggle-btn:hover { background: rgba(6,182,212,0.15) !important; }
      `}</style>

      {/* Left Panel */}
      <div style={{
        display: 'none', flex: '0 0 50%', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #0d1020 0%, #0a0f1e 50%, #080c18 100%)',
      }}
        className="hidden lg:flex lg:flex-col"
      >
        {/* Animated canvas */}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6 }} />

        {/* Glowing orbs */}
        <div style={{
          position: 'absolute', top: '20%', left: '15%',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%)',
          animation: 'pulse-ring 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '25%', right: '10%',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)',
          animation: 'pulse-ring 8s ease-in-out infinite 2s',
        }} />

        {/* Orbit rings */}
        <div style={{
          position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 280, height: 280, borderRadius: '50%',
          border: '1px solid rgba(6,182,212,0.08)',
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%', background: '#06b6d4',
            boxShadow: '0 0 12px rgba(6,182,212,0.8)',
            animation: 'orbit 12s linear infinite',
          }} />
        </div>
        <div style={{
          position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, height: 400, borderRadius: '50%',
          border: '1px solid rgba(99,102,241,0.06)',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%', background: '#6366f1',
            boxShadow: '0 0 10px rgba(99,102,241,0.8)',
            animation: 'orbit2 18s linear infinite',
          }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '3rem 3.5rem' }}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '3rem' }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(6,182,212,0.4)',
              animation: 'float 4s ease-in-out infinite',
            }}>
              <Sparkles size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.03em' }}>FlowSpace</div>
              <div style={{ fontSize: 10, color: '#475569', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>WORKSPACE · v2.4</div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ marginBottom: '2rem' }}
          >
            <h1 style={{
              fontSize: 44, fontWeight: 800, lineHeight: 1.1,
              letterSpacing: '-0.04em', margin: 0, marginBottom: 12,
              color: '#f1f5f9',
            }}>
              Master your time.{' '}
              <span style={{
                background: 'linear-gradient(90deg, #06b6d4, #818cf8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Elevate your life.</span>
            </h1>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, margin: 0, maxWidth: 380 }}>
              The ultimate productivity platform — organize tasks, track habits, and achieve goals with intelligent automation.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ marginBottom: '2.5rem' }}
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                className="feature-row"
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 6,
                  transition: 'background 0.2s', cursor: 'default',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(6,182,212,0.1)',
                  border: '1px solid rgba(6,182,212,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <f.icon size={16} color="#06b6d4" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{f.text}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{f.sub}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            style={{ display: 'flex', gap: 12 }}
          >
            {STATS.map((s, i) => (
              <div
                key={i}
                className="stat-chip"
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                style={{
                  flex: 1, padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  transition: 'all 0.2s', cursor: 'default',
                  transform: hoveredStat === i ? 'translateY(-2px)' : 'none',
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 700, color: '#06b6d4', letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'rgba(6,8,17,0.6)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)',
        }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: 460 }}
        >
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 30, rotateY: -8 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -30, rotateY: 8 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
              >
                <LoginForm onSwitch={() => setIsLogin(false)} />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 30, rotateY: -8 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -30, rotateY: 8 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
              >
                <RegisterForm onSwitch={() => setIsLogin(true)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ marginTop: 28, textAlign: 'center' }}
          >
            <span style={{ fontSize: 14, color: '#475569' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={handleToggle}
              className="toggle-btn"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, color: '#06b6d4',
                fontFamily: 'inherit', padding: '4px 8px', borderRadius: 6,
                transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              {isLogin ? 'Create account' : 'Sign in'}
              <ArrowRight size={13} />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}