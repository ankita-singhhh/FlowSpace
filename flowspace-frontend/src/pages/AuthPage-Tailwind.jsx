import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Zap, Shield } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 relative overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-xl animate-pulse delay-500"></div>

        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center text-white font-bold text-xl border border-white/30">
              FS
            </div>
            <span className="text-2xl font-bold">FlowSpace</span>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-center">
            Master your time.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-200">
              Elevate your life.
            </span>
          </h1>

          <p className="text-white/80 text-center mb-8 max-w-md">
            The ultimate productivity platform that helps you organize tasks, track habits, and achieve your goals with intelligent automation and beautiful design.
          </p>

          <div className="space-y-4 w-full max-w-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-cyan-200" />
              <span className="text-white/90">Smart task management</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-cyan-200" />
              <span className="text-white/90">Habit tracking & analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-cyan-200" />
              <span className="text-white/90">Secure & private</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <LoginForm />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <RegisterForm />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle between Login/Register */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="mt-2 text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
