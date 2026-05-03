import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Zap, Shield } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      {/* Left Panel - Branding */}
      <div className="auth-left">
        {/* Animated Orbs */}
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <div className="branding-content">
          <div className="logo-container">
            <div className="logo-monogram">FS</div>
            <span className="logo-text">FlowSpace</span>
          </div>

          <h1 className="tagline">
            Master your time.<br />
            <span className="text-gradient">Elevate your life.</span>
          </h1>

          <p className="description">
            The smart personal productivity app designed to help you achieve more with less stress.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon"><CheckCircle2 size={20} /></div>
              <span>Smart Task Management</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Zap size={20} /></div>
              <span>Habit & Streak Tracking</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Shield size={20} /></div>
              <span>End-to-end encrypted notes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-right">
        <div className="auth-card glass">
          <div className="auth-header">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>
              {isLogin 
                ? 'Enter your credentials to access your workspace' 
                : 'Join FlowSpace and start organizing your life'}
            </p>
          </div>

          <div className="auth-tabs">
            <button 
              className={`tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Log In
            </button>
            <button 
              className={`tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <div className="form-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {isLogin ? <LoginForm /> : <RegisterForm />}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                className="toggle-mode-btn"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
