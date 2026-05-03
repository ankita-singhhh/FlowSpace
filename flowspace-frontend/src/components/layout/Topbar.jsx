import { useState, useEffect } from 'react';
import { Bell, User, Settings, LogOut, Check, X, AlertCircle, CheckCircle2, Info, Search, Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import SearchDropdown from '../SearchDropdown';

export default function Topbar({ onSearch, onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { notifications, markAsRead, markAllAsRead, removeNotification, getUnreadCount } = useNotifications();
  const { isDark, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = getUnreadCount();

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setShowNotifications(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'warning':
        return <AlertCircle size={16} className="text-amber-500" />;
      case 'error':
        return <X size={16} className="text-red-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
      setShowUserDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Mobile Menu Toggle */}
      <button
        onClick={onToggleSidebar}
        className={`p-2 rounded-lg transition-colors md:hidden ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
      >
        <Menu size={20} />
      </button>

      {/* Search - Hidden on mobile */}
      <div className="hidden md:flex flex-1 max-w-2xl">
        <SearchDropdown onSearch={onSearch} />
      </div>

      {/* Right Side - Notifications & User */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle - Hidden on mobile */}
        <button
          onClick={toggleTheme}
          className={`hidden md:flex p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          {isDark ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            className={`relative p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(!showNotifications);
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div 
              className={`absolute top-full right-0 mt-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg min-w-[300px] md:min-w-[350px] z-50 max-h-[80vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`flex items-center justify-between p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <span className="bg-cyan-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center">
                    <Bell size={48} className={isDark ? 'text-gray-600 mx-auto mb-2' : 'text-gray-300 mx-auto mb-2'} />
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No notifications</p>
                  </div>
                ) : (
                  <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors cursor-pointer ${!notification.read ? (isDark ? 'bg-cyan-900' : 'bg-cyan-50') : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className={`text-gray-400 hover:${isDark ? 'text-gray-200' : 'text-gray-600'}`}
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {notification.action && (
                                <button className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">
                                  {notification.action.label}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button 
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowUserDropdown(!showUserDropdown);
            }}
          >
            <div className={`w-8 h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
              <User size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            </div>
            <span className="hidden md:block text-sm font-medium">{user?.name || 'User'}</span>
          </button>

          {showUserDropdown && (
            <div 
              className={`absolute top-full right-0 mt-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg min-w-[200px] z-50`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-2">
                <button className={`w-full px-4 py-2 text-left text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors flex items-center gap-2`}>
                  <User size={16} />
                  Profile
                </button>
                <button className={`w-full px-4 py-2 text-left text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors flex items-center gap-2`}>
                  <Settings size={16} />
                  Settings
                </button>
                <div className={`my-2 ${isDark ? 'border-gray-700' : 'border-gray-100'} border-t`}></div>
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
