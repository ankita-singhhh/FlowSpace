import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Loader2, Zap, ArrowRight, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function LoginForm({ onSwitch }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState({});
  const [toast, setToast] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    console.log('LoginForm: submitting with email:', email, 'password:', password);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        showToast('Welcome back to FlowSpace!', 'success');
        console.log('LoginForm: login successful, redirecting to dashboard');
        // Redirect to dashboard after successful login
        navigate('/dashboard');
      } else {
        showToast(result.error || 'Login failed', 'error');
        console.log('LoginForm: login failed', result.error);
      }
    } catch (error) {
      showToast('Login failed. Please try again.', 'error');
      console.error('LoginForm: login error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const borderColor = (field) => {
    if (errors[field]) return '#ef4444';
    if (focused[field]) return '#06b6d4';
    return 'rgba(255,255,255,0.07)';
  };

  const glowColor = (field) => {
    if (errors[field]) return '0 0 0 3px rgba(239,68,68,0.15)';
    if (focused[field]) return '0 0 0 3px rgba(6,182,212,0.15)';
    return 'none';
  };

  return (
    <div style={{ fontFamily: "'Syne', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
        @keyframes toastIn { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes toastOut { from{opacity:1} to{opacity:0} }
        .inp { transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
        .inp:hover { background: rgba(255,255,255,0.04) !important; }
        .social-btn:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.15) !important; }
        .submit-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(6,182,212,0.4) !important; }
        .submit-btn:not(:disabled):active { transform: translateY(0); }
        .forgot-btn:hover { color: #67e8f9 !important; }
        .eye-btn:hover { color: #94a3b8 !important; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10,
          background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: toast.type === 'success' ? '#34d399' : '#f87171',
          fontSize: 14, fontWeight: 500,
          backdropFilter: 'blur(12px)',
          animation: 'toastIn 0.3s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 11,
            background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(6,182,212,0.35)',
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>FlowSpace</div>
            <div style={{ fontSize: 10, color: '#475569', fontFamily: "'JetBrains Mono'", letterSpacing: '0.08em' }}>WORKSPACE · v2.4</div>
          </div>
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', margin: '0 0 6px' }}>
          Welcome back
        </h2>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Sign in to your productivity workspace</p>
      </motion.div>

      {/* Card */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          background: '#111318',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20,
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Mouse spotlight */}
        <div style={{
          position: 'absolute', pointerEvents: 'none',
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 65%)',
          transform: `translate(${mousePos.x - 100}px, ${mousePos.y - 100}px)`,
          transition: 'transform 0.1s',
          zIndex: 0,
        }} />

        {/* Accent top bar */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          height: 2, width: 80, borderRadius: '0 0 4px 4px',
          background: 'linear-gradient(90deg, #06b6d4, #6366f1)',
        }} />

        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Email */}
          <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
            <label style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, color: '#94a3b8',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8,
            }}>
              <Mail size={11} color="#06b6d4" />
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email" value={email} placeholder="name@example.com"
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: null })); }}
                onFocus={() => setFocused(p => ({ ...p, email: true }))}
                onBlur={() => setFocused(p => ({ ...p, email: false }))}
                className="inp"
                style={{
                  width: '100%', padding: '11px 16px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${borderColor('email')}`,
                  borderRadius: 10, color: '#f1f5f9', fontSize: 14,
                  fontFamily: 'inherit', outline: 'none',
                  boxShadow: glowColor('email'),
                  animation: errors.email ? 'shake 0.4s ease' : 'none',
                }}
              />
            </div>
            <AnimatedError msg={errors.email} />
          </motion.div>

          {/* Password */}
          <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 600, color: '#94a3b8',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                <Lock size={11} color="#06b6d4" />
                Password
              </label>
              <button
                type="button"
                onClick={() => showToast('Password reset link sent! (Demo)', 'success')}
                className="forgot-btn"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontSize: 12, color: '#06b6d4', fontFamily: 'inherit', fontWeight: 500,
                  transition: 'color 0.2s',
                }}
              >
                Forgot?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password} placeholder="Enter your password"
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: null })); }}
                onFocus={() => setFocused(p => ({ ...p, password: true }))}
                onBlur={() => setFocused(p => ({ ...p, password: false }))}
                className="inp"
                style={{
                  width: '100%', padding: '11px 44px 11px 16px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${borderColor('password')}`,
                  borderRadius: 10, color: '#f1f5f9', fontSize: 14,
                  fontFamily: 'inherit', outline: 'none',
                  boxShadow: glowColor('password'),
                  animation: errors.password ? 'shake 0.4s ease' : 'none',
                }}
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="eye-btn"
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#3d4258', padding: 4, display: 'flex', transition: 'color 0.2s',
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <AnimatedError msg={errors.password} />
          </motion.div>

          {/* Remember */}
          <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div
                onClick={() => setRememberMe(!rememberMe)}
                style={{
                  width: 18, height: 18, borderRadius: 5,
                  border: `1.5px solid ${rememberMe ? '#06b6d4' : 'rgba(255,255,255,0.15)'}`,
                  background: rememberMe ? 'rgba(6,182,212,0.15)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                {rememberMe && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 13, color: '#64748b' }}>Keep me signed in</span>
            </label>
          </motion.div>

          {/* Submit */}
          <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
            <button
              type="submit" disabled={isLoading}
              className="submit-btn"
              style={{
                width: '100%', padding: '13px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
                border: 'none', borderRadius: 10, color: 'white',
                fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                letterSpacing: '0.01em', opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(6,182,212,0.25)',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                <>Sign in <ArrowRight size={15} /></>
              )}
            </button>
          </motion.div>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
          <span style={{ fontSize: 11, color: '#334155', letterSpacing: '0.06em', fontFamily: "'JetBrains Mono'" }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
        </div>

        {/* Social */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Google', icon: 'G', color: '#ea4335' },
            { label: 'GitHub', icon: '⌘', color: '#e2e8f0' },
          ].map(s => (
            <button
              key={s.label}
              type="button"
              onClick={() => showToast(`${s.label} OAuth coming soon`, 'success')}
              className="social-btn"
              style={{
                padding: '10px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10,
                color: '#94a3b8', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 15, color: s.color }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function AnimatedError({ msg }) {
  if (!msg) return null;
  return (
    <motion.p
      initial={{ opacity: 0, height: 0, y: -4 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      style={{ margin: '6px 0 0', fontSize: 12, color: '#f87171', display: 'flex', alignItems: 'center', gap: 5 }}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke="#f87171" strokeWidth="1.5" />
        <path d="M6 4v2.5M6 8h.01" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {msg}
    </motion.p>
  );
}