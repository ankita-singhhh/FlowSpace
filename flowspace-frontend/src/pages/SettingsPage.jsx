import { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database, 
  HelpCircle, 
  LogOut,
  Moon,
  Sun,
  Download,
  Upload,
  AlertTriangle,
  Mail,
  Clock,
  Calendar,
  Smartphone,
  Monitor,
  Eye,
  EyeOff,
  Key,
  Trash2,
  RefreshCw,
  Info,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

const TIMEZONES = [
  'UTC', 'EST', 'EDT', 'CST', 'CDT', 'MST', 'MDT', 'PST', 'PDT',
  'GMT', 'BST', 'CET', 'CEST', 'EET', 'EEST', 'JST', 'AEST', 'AEDT'
];

const WEEK_START_OPTIONS = [
  { value: 'monday', label: 'Monday' },
  { value: 'sunday', label: 'Sunday' }
];

const REMINDER_TIMES = [
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' }
];

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 
  'bg-pink-500', 'bg-red-500', 'bg-cyan-500', 'bg-indigo-500'
];

export default function SettingsPage() {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Profile Settings
  const [profileSettings, setProfileSettings] = useState({
    displayName: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    avatarColor: AVATAR_COLORS[0],
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    sessions: [
      {
        id: 1,
        device: 'Chrome on Windows',
        location: 'New York, US',
        lastActive: '2 minutes ago',
        isCurrent: true
      },
      {
        id: 2,
        device: 'Safari on iPhone',
        location: 'Los Angeles, US',
        lastActive: '2 hours ago',
        isCurrent: false
      }
    ]
  });

  // Preferences Settings
  const [preferencesSettings, setPreferencesSettings] = useState({
    defaultReminderTime: 15,
    weekStartsOn: 'monday',
    timezone: 'UTC',
    theme: 'system',
    defaultTaskCategory: 'Work'
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    browserNotifications: true,
    dailyDigestEmail: false,
    reminderAdvanceNotice: 15
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      // Show success message
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (profileSettings.newPassword !== profileSettings.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfileSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (confirm('Are you sure you want to log out from all other devices?')) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSecuritySettings(prev => ({
          ...prev,
          sessions: prev.sessions.filter(session => session.isCurrent)
        }));
      } catch (error) {
        console.error('Failed to logout devices:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExportData = async (format) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock data
      const data = {
        tasks: [],
        reminders: [],
        habits: [],
        notes: [],
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flowspace-export.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      // Process imported data
      console.log('Imported data:', data);
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Invalid file format');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'about', label: 'About', icon: HelpCircle },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage your account and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button 
              onClick={handleSaveSettings}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isLoading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-cyan-500 text-white hover:bg-cyan-600'
              }`}
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-cyan-50 text-cyan-600 border-l-4 border-cyan-500' 
                    : `${isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button 
              onClick={logout}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-red-400 hover:bg-red-900 hover:bg-opacity-20' 
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Section */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Profile Information
                </h2>
                
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${profileSettings.avatarColor}`}>
                      {profileSettings.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Avatar Color</div>
                      <div className="flex gap-2">
                        {AVATAR_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => {
                              setProfileSettings(prev => ({ ...prev, avatarColor: color }));
                              setHasChanges(true);
                            }}
                            className={`w-8 h-8 rounded-full ${color} ${
                              profileSettings.avatarColor === color ? 'ring-2 ring-offset-2 ring-cyan-500' : ''
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profileSettings.displayName}
                        onChange={(e) => {
                          setProfileSettings(prev => ({ ...prev, displayName: e.target.value }));
                          setHasChanges(true);
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileSettings.email}
                        onChange={(e) => {
                          setProfileSettings(prev => ({ ...prev, email: e.target.value }));
                          setHasChanges(true);
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                      />
                    </div>
                  </div>

                  {/* Password Change */}
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={profileSettings.currentPassword}
                          onChange={(e) => setProfileSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            New Password
                          </label>
                          <input
                            type="password"
                            value={profileSettings.newPassword}
                            onChange={(e) => setProfileSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark 
                                ? 'bg-gray-600 border-gray-500 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={profileSettings.confirmPassword}
                            onChange={(e) => setProfileSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark 
                                ? 'bg-gray-600 border-gray-500 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                          />
                        </div>
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        disabled={isLoading || !profileSettings.currentPassword || !profileSettings.newPassword}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isLoading || !profileSettings.currentPassword || !profileSettings.newPassword
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-cyan-500 text-white hover:bg-cyan-600'
                        }`}
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Active Sessions
                </h2>
                
                <div className="space-y-4">
                  {securitySettings.sessions.map(session => (
                    <div key={session.id} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                            {session.device.includes('iPhone') ? (
                              <Smartphone size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                            ) : (
                              <Monitor size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                            )}
                          </div>
                          <div>
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {session.device}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {session.location} • {session.lastActive}
                            </div>
                          </div>
                        </div>
                        {session.isCurrent && (
                          <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-cyan-900 text-cyan-300' : 'bg-cyan-100 text-cyan-700'}`}>
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleLogoutAllDevices}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isLoading 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    Log out all other devices
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Preferences
                </h2>
                
                <div className="space-y-6">
                  {/* Default Reminder Time */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Default Reminder Time
                    </label>
                    <select
                      value={preferencesSettings.defaultReminderTime}
                      onChange={(e) => {
                        setPreferencesSettings(prev => ({ ...prev, defaultReminderTime: parseInt(e.target.value) }));
                        setHasChanges(true);
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                    >
                      {REMINDER_TIMES.map(time => (
                        <option key={time.value} value={time.value}>{time.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Week Start */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Week starts on
                    </label>
                    <div className="flex gap-4">
                      {WEEK_START_OPTIONS.map(option => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="weekStart"
                            value={option.value}
                            checked={preferencesSettings.weekStartsOn === option.value}
                            onChange={(e) => {
                              setPreferencesSettings(prev => ({ ...prev, weekStartsOn: e.target.value }));
                              setHasChanges(true);
                            }}
                            className="text-cyan-500 focus:ring-cyan-500"
                          />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Timezone
                    </label>
                    <select
                      value={preferencesSettings.timezone}
                      onChange={(e) => {
                        setPreferencesSettings(prev => ({ ...prev, timezone: e.target.value }));
                        setHasChanges(true);
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                    >
                      {TIMEZONES.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Theme
                    </label>
                    <div className="flex gap-3">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Monitor },
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => {
                            setPreferencesSettings(prev => ({ ...prev, theme: value }));
                            setHasChanges(true);
                          }}
                          className={`flex flex-col items-center gap-2 p-3 border rounded-lg transition-colors ${
                            preferencesSettings.theme === value 
                              ? 'border-cyan-500 bg-cyan-50' 
                              : `${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`
                          }`}
                        >
                          <Icon size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Default Task Category */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Default Task Category
                    </label>
                    <select
                      value={preferencesSettings.defaultTaskCategory}
                      onChange={(e) => {
                        setPreferencesSettings(prev => ({ ...prev, defaultTaskCategory: e.target.value }));
                        setHasChanges(true);
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                    >
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Health">Health</option>
                      <option value="Finance">Finance</option>
                      <option value="Learning">Learning</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Notification Settings
                </h2>
                
                <div className="space-y-4">
                  {/* Browser Notifications */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Browser Notifications
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Receive notifications in your browser
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setNotificationSettings(prev => ({ ...prev, browserNotifications: !prev.browserNotifications }));
                        setHasChanges(true);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings.browserNotifications ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.browserNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Daily Digest Email */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Daily Digest Email
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span className="inline-flex items-center gap-1">
                          Coming soon
                          <span className={`px-2 py-1 text-xs rounded ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                            UI only
                          </span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setNotificationSettings(prev => ({ ...prev, dailyDigestEmail: !prev.dailyDigestEmail }));
                        setHasChanges(true);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings.dailyDigestEmail ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.dailyDigestEmail ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Reminder Advance Notice */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Reminder Advance Notice
                    </label>
                    <select
                      value={notificationSettings.reminderAdvanceNotice}
                      onChange={(e) => {
                        setNotificationSettings(prev => ({ ...prev, reminderAdvanceNotice: parseInt(e.target.value) }));
                        setHasChanges(true);
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                    >
                      {REMINDER_TIMES.map(time => (
                        <option key={time.value} value={time.value}>{time.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Section */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Data Management
                </h2>
                
                <div className="space-y-6">
                  {/* Export Options */}
                  <div>
                    <h3 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Export Data
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleExportData('json')}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isLoading 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-cyan-500 text-white hover:bg-cyan-600'
                        }`}
                      >
                        <Download size={16} />
                        Export as JSON
                      </button>
                      <button
                        onClick={() => handleExportData('csv')}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isLoading 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-cyan-500 text-white hover:bg-cyan-600'
                        }`}
                      >
                        <Download size={16} />
                        Export Tasks as CSV
                      </button>
                    </div>
                  </div>

                  {/* Import Options */}
                  <div>
                    <h3 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Import Data
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => document.getElementById('csv-template').click()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isDark 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <Download size={16} />
                        Download CSV Template
                      </button>
                      <div>
                        <label className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                          isDark 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}>
                          <Upload size={16} />
                          Import Tasks from CSV
                          <input
                            id="csv-import"
                            type="file"
                            accept=".csv,.json"
                            onChange={handleImportData}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className={`p-4 rounded-lg border-l-4 ${
                    isDark 
                      ? 'bg-red-900 bg-opacity-20 border-red-500' 
                      : 'bg-red-50 border-red-500'
                  }`}>
                    <h3 className={`font-medium mb-2 flex items-center gap-2 ${
                      isDark ? 'text-red-400' : 'text-red-700'
                    }`}>
                      <AlertTriangle size={18} />
                      Danger Zone
                    </h3>
                    <p className={`text-sm mb-4 ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                      These actions cannot be undone
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
                            // Handle delete all tasks
                          }
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isDark 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        Delete All Tasks
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete all reminders? This cannot be undone.')) {
                            // Handle delete all reminders
                          }
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isDark 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        Delete All Reminders
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isLoading 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About Section */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  About FlowSpace
                </h2>
                
                <div className="space-y-6">
                  {/* App Info */}
                  <div>
                    <div className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <p>Version: <span className={isDark ? 'text-white' : 'text-gray-900'}>1.0.0</span></p>
                      <p>Build Date: <span className={isDark ? 'text-white' : 'text-gray-900'}>May 3, 2026</span></p>
                      <p>© 2026 FlowSpace. All rights reserved.</p>
                    </div>
                  </div>

                  {/* What's New */}
                  <div>
                    <button className={`flex items-center gap-2 text-cyan-500 hover:text-cyan-600 transition-colors`}>
                      <ExternalLink size={16} />
                      What's New
                    </button>
                  </div>

                  {/* Feedback */}
                  <div>
                    <a
                      href="mailto:feedback@flowspace.app?subject=FlowSpace%20Feedback"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isDark 
                          ? 'bg-cyan-600 text-white hover:bg-cyan-700' 
                          : 'bg-cyan-500 text-white hover:bg-cyan-600'
                      }`}
                    >
                      <Mail size={16} />
                      Send Feedback
                    </a>
                  </div>

                  {/* Help */}
                  <div>
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}>
                      <HelpCircle size={16} />
                      Help Center
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
