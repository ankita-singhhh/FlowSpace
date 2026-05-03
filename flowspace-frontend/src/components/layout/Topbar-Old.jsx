import { useState, useEffect } from 'react';
import { Bell, User, Settings, LogOut, Check, X, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import SearchDropdown from '../SearchDropdown';

export default function Topbar({ title, onSearch }) {
  const { user, logout } = useAuth();
  const { notifications, markAsRead, markAllAsRead, removeNotification, getUnreadCount } = useNotifications();
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
    <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 min-h-[72px]">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex-1 flex justify-center mx-8">
        <SearchDropdown onSearch={onSearch} />
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[350px] z-50">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
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
                  <div className="p-4 text-gray-600 text-sm text-center">
                    <Bell size={48} className="text-gray-300 mx-auto mb-2" />
                    No notifications
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-cyan-50' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
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
            className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-transparent hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-200"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </button>

          {showUserDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] z-50">
              <button 
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowUserDropdown(false)}
              >
                <User size={16} />
                <span>Profile</span>
              </button>
              <button 
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowUserDropdown(false)}
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <div className="h-px bg-gray-200 my-1" />
              <button 
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
