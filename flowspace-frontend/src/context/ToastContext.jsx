import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastVariants = {
  initial: { opacity: 0, x: 100, scale: 0.9 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 100, scale: 0.9 }
};

const Toast = ({ toast, onRemove }) => {
  const { isDark } = useTheme();
  
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-cyan-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />
  };

  const bgColors = {
    success: isDark ? 'bg-green-900/50 border-green-700' : 'bg-green-50 border-green-200',
    error: isDark ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200',
    info: isDark ? 'bg-cyan-900/50 border-cyan-700' : 'bg-cyan-50 border-cyan-200',
    warning: isDark ? 'bg-amber-900/50 border-amber-700' : 'bg-amber-50 border-amber-200'
  };

  return (
    <motion.div
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-sm ${bgColors[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1">
        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{toast.title}</p>
        {toast.message && (
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className={`p-1 rounded hover:bg-black/10 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now();
    const newToast = { id, ...toast };
    
    setToasts(prev => {
      const filtered = prev.filter(t => t.id !== id);
      return [newToast, ...filtered].slice(0, 3);
    });

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const success = (title, message) => addToast({ type: 'success', title, message });
  const error = (title, message) => addToast({ type: 'error', title, message });
  const info = (title, message) => addToast({ type: 'info', title, message });
  const warning = (title, message) => addToast({ type: 'warning', title, message });

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};
