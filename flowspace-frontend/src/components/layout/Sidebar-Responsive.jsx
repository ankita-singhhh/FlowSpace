import { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Target, 
  FileText, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  Home,
  Bell,
  Search,
  User,
  Moon,
  Sun
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, current: true },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, current: false },
  { name: 'Reminders', href: '/reminders', icon: Bell, current: false },
  { name: 'Planner', href: '/planner', icon: Calendar, current: false },
  { name: 'Habits', href: '/habits', icon: Target, current: false },
  { name: 'Notes', href: '/notes', icon: FileText, current: false },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, current: false },
  { name: 'Settings', href: '/settings', icon: Settings, current: false },
];

export default function Sidebar({ isCollapsed, onToggle, isMobile, onCloseMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleNavigation = (href) => {
    navigate(href);
    if (isMobile) {
      onCloseMobile();
    }
  };

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Logo/Brand */}
      <div className={`flex items-center justify-between p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            FS
          </div>
          {!isCollapsed && (
            <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>FlowSpace</span>
          )}
        </div>
        <button
          onClick={() => isMobile ? onCloseMobile() : onToggle()}
          className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          {isMobile ? <X size={20} /> : (isCollapsed ? <Menu size={20} /> : <X size={20} />)}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <button
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? isDark 
                        ? 'bg-cyan-900 text-cyan-400 border-l-4 border-cyan-500'
                        : 'bg-cyan-50 text-cyan-600 border-l-4 border-cyan-500'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme Toggle & User Section */}
      <div className={`p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-t space-y-4`}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isDark
              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          {isDark ? <Moon size={20} /> : <Sun size={20} />}
          {!isCollapsed && <span className="font-medium">{isDark ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>

        {/* User Section */}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
            <User size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>John Doe</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>john@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
