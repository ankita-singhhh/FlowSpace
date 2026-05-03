import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const InstallPrompt = () => {
  const { isDark } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('installPromptDismissed');
    const visitCount = parseInt(localStorage.getItem('visitCount') || '0');
    
    localStorage.setItem('visitCount', (visitCount + 1).toString());
    
    // Show prompt after 3rd visit if not dismissed
    if (visitCount >= 2 && !dismissed) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden ${
      isDark ? 'bg-gray-900 border-t border-gray-800' : 'bg-white border-t border-gray-200'
    }`}>
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isDark ? 'bg-blue-900/30' : 'bg-blue-100'
          }`}>
            <Download className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Install FlowSpace
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Add to home screen for better experience
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
