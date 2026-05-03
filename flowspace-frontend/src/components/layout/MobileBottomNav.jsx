import { useLocation, useNavigate } from 'react-router-dom';
import { Home, CheckSquare, Bell, Flame, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/reminders', icon: Bell, label: 'Reminders' },
    { path: '/habits', icon: Flame, label: 'Habits' },
    { path: '/settings', icon: Menu, label: 'Menu' }
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 md:hidden border-t ${
      isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? isDark
                    ? 'text-blue-400 bg-blue-900/20'
                    : 'text-blue-600 bg-blue-50'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
