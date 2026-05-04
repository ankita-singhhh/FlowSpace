import { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, User, Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const REQUIREMENTS = [
  { test: (p) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p) => /[0-9]/.test(p), label: 'One number' },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
];

const fieldVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

export default function RegisterForm({ onSwitch }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState({});
  const [toast, setToast] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const strength = (() => {
    const p = formData.password;
    if (!p) return { score: 0, label: '', color: 'transparent', width: '0%' };
    const score = REQUIREMENTS.filter(r => r.test(p)).length;
    if (score <= 1) return { score, label: 'Weak', color: '#ef4444', width: '25%' };
    if (score === 2) return { score, label: 'Fair', color: '#f59e0b', width: '50%' };
    if (score === 3) return { score, label: 'Good', color: '#06b6d4', width: '75%' };
    return { score, label: 'Strong', color: '#10b981', width: '100%' };
  })();

  const validate = () => {
    const e = {};
    if (!formData.name.trim() || formData.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!formData.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email address';
    if (formData.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(formData.password)) e.password = 'Must contain an uppercase letter';
    else if (!/[0-9]/.test(formData.password)) e.password = 'Must contain a number';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!termsAccepted) e.terms = 'You must accept the terms';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setIsLoading(false);
    setSubmitted(true);
    showToast('Account created successfully!', 'success');
  };

  const borderColor = (f) => {
    if (errors[f]) return '#ef4444';
    if (focused[f]) return '#06b6d4';
    return 'rgba(255,255,255,0.07)';
  };

  const glowColor = (f) => {
    if (errors[f]) return '0 0 0 3px rgba(239,68,68,0.15)';
    if (focused[f]) return '0 0 0 3px rgba(6,182,212,0.15)';
    return 'none';
  };

  const inputStyle = (field, extra = {}) => ({
    width: '100%', padding: '11px 16px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.03)',
    border: `1px solid ${borderColor(field)}`,
    borderRadius: 10, color: '#f1f5f9', fontSize: 14,
    fontFamily: "'Syne', sans-serif", outline: 'none',
    boxShadow: glowColor(field),
    transition: 'border-color 0.2s, box-shadow 0.2s',
    ...extra,
  });

  const labelStyle = {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, fontWeight: 600, color: '#94a3b8',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8,
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', padding: '3rem 2rem' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(16,185,129,0.1)',
            border: '2px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <CheckCircle2 size={32} color="#10b981" />
        </motion.div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          You're all set!
        </h2>
        <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 28px' }}>
          Welcome to FlowSpace, {formData.name.split(' ')[0]}. Let's get productive.
        </p>
        <button
          onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', password: '', confirmPassword: '' }); }}
          style={{
            padding: '11px 28px',
            background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
            border: 'none', borderRadius: 10, color: 'white',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'Syne', sans-serif",
          }}
        >
          Continue to dashboard →
        </button>
      </motion.div>
    );
  }

  return (
    <div style={{ fontFamily: "'Syne', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
        @keyframes toastIn { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
        .reg-inp:hover { background: rgba(255,255,255,0.04) !important; }
        .reg-submit:not(:disabled):hover { transform: translateY(-1px) !important; box-shadow: 0 8px 30px rgba(6,182,212,0.4) !important; }
        .req-item { transition: all 0.2s; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10,
          background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.25)',
          color: '#34d399', fontSize: 14, fontWeight: 500,
          backdropFilter: 'blur(12px)',
          animation: 'toastIn 0.3s ease',
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#6366f1',
            boxShadow: '0 0 8px rgba(99,102,241,0.6)',
          }} />
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#06b6d4',
            boxShadow: '0 0 8px rgba(6,182,212,0.6)',
          }} />
          <span style={{ fontSize: 12, color: '#475569', fontFamily: "'JetBrains Mono'", letterSpacing: '0.06em' }}>
            NEW ACCOUNT
          </span>
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', margin: '0 0 6px' }}>
          Create account
        </h2>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Join FlowSpace and start organizing your life</p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          background: '#111318',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20, padding: '2rem',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          height: 2, width: 80, borderRadius: '0 0 4px 4px',
          background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
        }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Name */}
          <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
            <label style={labelStyle}><User size={11} color="#06b6d4" />Full name</label>
            <input
              name="name" type="text" placeholder="John Doe"
              value={formData.name} onChange={handleChange}
              onFocus={() => setFocused(p => ({ ...p, name: true }))}
              onBlur={() => setFocused(p => ({ ...p, name: false }))}
              className="reg-inp"
              style={{ ...inputStyle('name'), animation: errors.name ? 'shake 0.4s ease' : 'none' }}
            />
            <AnimatedError msg={errors.name} />
          </motion.div>

          {/* Email */}
          <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
            <label style={labelStyle}><Mail size={11} color="#06b6d4" />Email address</label>
            <input
              name="email" type="email" placeholder="name@example.com"
              value={formData.email} onChange={handleChange}
              onFocus={() => setFocused(p => ({ ...p, email: true }))}
              onBlur={() => setFocused(p => ({ ...p, email: false }))}
              className="reg-inp"
              style={{ ...inputStyle('email'), animation: errors.email ? 'shake 0.4s ease' : 'none' }}
            />
            <AnimatedError msg={errors.email} />
          </motion.div>

          {/* Password */}
          <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
            <label style={labelStyle}><Lock size={11} color="#06b6d4" />Password</label>
            <div style={{ position: 'relative' }}>
              <input
                name="password" type={showPwd ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={formData.password} onChange={handleChange}
                onFocus={() => setFocused(p => ({ ...p, password: true }))}
                onBlur={() => setFocused(p => ({ ...p, password: false }))}
                autoComplete="new-password"
                className="reg-inp"
                style={{ ...inputStyle('password'), paddingRight: 44, animation: errors.password ? 'shake 0.4s ease' : 'none' }}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#3d4258',
                display: 'flex', transition: 'color 0.2s', padding: 4,
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                onMouseLeave={e => e.currentTarget.style.color = '#3d4258'}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Strength bar */}
            {formData.password && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: strength.score >= n ? strength.color : 'rgba(255,255,255,0.07)',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
                    {REQUIREMENTS.map((req, i) => (
                      <span key={i} className="req-item" style={{
                        fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
                        color: req.test(formData.password) ? '#10b981' : '#475569',
                      }}>
                        <span style={{
                          width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                          background: req.test(formData.password) ? '#10b981' : '#334155',
                          transition: 'background 0.2s',
                        }} />
                        {req.label}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: strength.color, flexShrink: 0, marginLeft: 8 }}>
                    {strength.label}
                  </span>
                </div>
              </motion.div>
            )}
            <AnimatedError msg={errors.password} />
          </motion.div>

          {/* Confirm Password */}
          <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
            <label style={labelStyle}><ShieldCheck size={11} color="#06b6d4" />Confirm password</label>
            <div style={{ position: 'relative' }}>
              <input
                name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword} onChange={handleChange}
                onFocus={() => setFocused(p => ({ ...p, confirmPassword: true }))}
                onBlur={() => setFocused(p => ({ ...p, confirmPassword: false }))}
                autoComplete="new-password"
                className="reg-inp"
                style={{ ...inputStyle('confirmPassword'), paddingRight: 44, animation: errors.confirmPassword ? 'shake 0.4s ease' : 'none' }}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#3d4258',
                display: 'flex', transition: 'color 0.2s', padding: 4,
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                onMouseLeave={e => e.currentTarget.style.color = '#3d4258'}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>

              {/* Match indicator */}
              {formData.confirmPassword && (
                <div style={{
                  position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 11, fontWeight: 600, transition: 'color 0.2s',
                  color: formData.password === formData.confirmPassword ? '#10b981' : '#ef4444',
                }}>
                  {formData.password === formData.confirmPassword ? '✓' : '✗'}
                </div>
              )}
            </div>
            <AnimatedError msg={errors.confirmPassword} />
          </motion.div>

          {/* Terms */}
          <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <div
                onClick={() => { setTermsAccepted(!termsAccepted); setErrors(p => ({ ...p, terms: null })); }}
                style={{
                  width: 18, height: 18, borderRadius: 5, marginTop: 1,
                  border: `1.5px solid ${errors.terms ? '#ef4444' : termsAccepted ? '#06b6d4' : 'rgba(255,255,255,0.15)'}`,
                  background: termsAccepted ? 'rgba(6,182,212,0.15)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                {termsAccepted && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
              </div>
              <span style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                I agree to the{' '}
                <span style={{ color: '#06b6d4', cursor: 'pointer', fontWeight: 500 }}>Terms of Service</span>
                {' '}and{' '}
                <span style={{ color: '#06b6d4', cursor: 'pointer', fontWeight: 500 }}>Privacy Policy</span>
              </span>
            </label>
            <AnimatedError msg={errors.terms} />
          </motion.div>

          {/* Submit */}
          <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
            <button
              type="submit" disabled={isLoading}
              className="reg-submit"
              style={{
                width: '100%', padding: '13px',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                border: 'none', borderRadius: 10, color: 'white',
                fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(99,102,241,0.25)',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                  Creating your account...
                </>
              ) : (
                <>Create account <ArrowRight size={15} /></>
              )}
            </button>
          </motion.div>

        </form>
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