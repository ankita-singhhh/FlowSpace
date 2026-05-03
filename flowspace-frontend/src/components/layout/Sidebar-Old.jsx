import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Bell, 
  Calendar, 
  Target, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { id: 'reminders', label: 'Reminders', icon: Bell, path: '/reminders' },
  { id: 'planner', label: 'Planner', icon: Calendar, path: '/planner' },
  { id: 'habits', label: 'Habits', icon: Target, path: '/habits' },
  { id: 'notes', label: 'Notes', icon: BookOpen, path: '/notes' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ isCollapsed, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <div className={`bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 relative z-100 ${isCollapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo Section */}
      <div className="flex items-center p-6 border-b border-gray-200">
        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
          FS
        </div>
        {!isCollapsed && <span className="ml-3 text-lg font-semibold text-gray-900">FlowSpace</span>}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative ${isActive ? 'bg-cyan-50 text-cyan-600 border-l-3 border-cyan-500' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              onClick={() => handleNavigation(item.path)}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <button 
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-gray-900">{user?.name || 'User'}</span>
            </div>
          )}
        </button>

        {/* User Dropdown Menu */}
        {!isCollapsed && showUserMenu && (
          <div className="absolute bottom-20 left-4 bg-white border border-gray-200 rounded-lg shadow-lg min-w-48 z-50">
            <button 
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => handleNavigation('/settings')}
            >
              <Settings size={16} />
              <span>Profile</span>
            </button>
            <button 
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button 
        className="absolute top-6 right-2 p-1 rounded hover:bg-gray-200 transition-colors duration-200"
        onClick={onToggle}
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <Menu size={20} /> : <X size={20} />}
      </button>
    </div>
  );
}
