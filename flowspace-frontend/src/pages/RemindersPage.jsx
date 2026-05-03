import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Bell, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Edit, 
  Trash2, 
  X,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useWebSocket } from '../context/WebSocketContext';

const colorOptions = [
  '#ef4444', // red
  '#f97316', // orange  
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#a855f7', // purple
];

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function RemindersPage() {
  const { user } = useAuth();
  // Simple fallback for isDark to prevent reference errors
  const isDark = false;
  // Temporarily disable WebSocket to isolate issues
  // const { sendMessage, isConnected } = useWebSocket();
  const [reminders, setReminders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    today: 0,
    snoozed: 0,
    doneThisWeek: 0
  });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    color: colorOptions[0],
    repeat: 'once',
    weekDays: [],
    monthlyDay: 1,
    repeatEndDate: '',
    linkedTask: ''
  });

  // Real-time countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Request notification permission on first visit
  useEffect(() => {
    if (Notification.permission === 'default' && !showNotificationModal) {
      setShowNotificationModal(true);
    }
    setNotificationPermission(Notification.permission);
  }, []);

  // Request notification permission
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      setShowNotificationModal(false);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled! You\'ll receive reminders at the right time.');
      } else {
        toast('Notifications disabled. You\'ll see in-app reminders instead.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setShowNotificationModal(false);
    }
  };

  // Fetch reminders and tasks
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [remindersResponse, tasksResponse] = await Promise.all([
          api.get('/reminders'),
          api.get('/tasks')
        ]);
        
        setReminders(remindersResponse.data.data || []);
        setTasks(tasksResponse.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setReminders([]);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Check for due reminders every 30 seconds
  useEffect(() => {
    if (!user || notificationPermission !== 'granted') return;

    const interval = setInterval(async () => {
      const now = new Date();
      
      for (const reminder of reminders) {
        if (reminder.notificationSent || reminder.status === 'done') continue;
        
        // Validate reminder has proper date and time
        if (!reminder.date) continue;
        
        const reminderTime = new Date(`${reminder.date}T${reminder.time || '00:00'}`);
        if (isNaN(reminderTime.getTime())) continue;
        
        if (reminderTime <= now) {
          // Send browser notification
          try {
            const notificationBody = reminder.description 
              ? `${reminder.description} - ${reminder.time || 'All day'}`
              : `Reminder due at ${reminder.time || 'All day'} - Click to open FlowSpace`;
            
            const notification = new Notification(`🔔 ${reminder.title}`, {
              body: notificationBody,
              icon: '/favicon.ico',
              tag: reminder._id,
              requireInteraction: true
            });
            
            notification.onclick = () => {
              window.focus();
              notification.close();
            };
            
            // Mark as sent
            await api.patch(`/reminders/${reminder._id}`, {
              notificationSent: true
            });
            
            // Handle recurring reminders
            if (reminder.repeat !== 'once') {
              await createNextOccurrence(reminder);
            }
            
          } catch (error) {
            console.error('Error sending notification:', error);
            // Show in-app toast as fallback with reminder details
            toast.error(`${reminder.title} - ${reminder.description || 'Reminder due now!'}`, {
              icon: '🔔',
              duration: 5000
            });
          }
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [reminders, notificationPermission, user]);

  // Calculate stats
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const todayReminders = reminders.filter(r => r.date === today && r.status !== 'done');
    const snoozedReminders = reminders.filter(r => r.status === 'snoozed');
    const doneThisWeek = reminders.filter(r => 
      r.status === 'done' && new Date(r.completedAt) >= weekAgo
    );
    
    setStats({
      today: todayReminders.length,
      snoozed: snoozedReminders.length,
      doneThisWeek: doneThisWeek.length
    });
  }, [reminders]);

  // Create next occurrence of recurring reminder
  const createNextOccurrence = async (reminder) => {
    let nextDate = new Date(reminder.date);
    
    switch (reminder.repeat) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        const currentDay = nextDate.getDay();
        const nextDayIndex = reminder.weekDays.findIndex(day => 
          weekDays[day] === weekDays[currentDay]
        );
        if (nextDayIndex !== -1) {
          const daysToAdd = (nextDayIndex - currentDay + 7) % 7 || 7;
          nextDate.setDate(nextDate.getDate() + daysToAdd);
        }
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        nextDate.setDate(Math.min(reminder.monthlyDay, new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()));
        break;
    }
    
    // Check if we've passed the repeat end date
    if (reminder.repeatEndDate && nextDate > new Date(reminder.repeatEndDate)) {
      return;
    }
    
    try {
      await api.post('/reminders', {
        ...reminder,
        date: nextDate.toISOString().split('T')[0],
        notificationSent: false,
        status: 'pending'
      });
    } catch (error) {
      console.error('Error creating next occurrence:', error);
    }
  };

  // Filter reminders based on tab
  const getFilteredReminders = () => {
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Helper function to safely create Date object
    const safeCreateDate = (date, time = '00:00') => {
      try {
        if (!date) return null;
        
        // Handle various date formats
        let parsedDate = date;
        if (typeof date === 'string') {
          // Remove any time component if present in date
          parsedDate = date.split('T')[0];
        }
        
        const dateObj = new Date(`${parsedDate}T${time}`);
        
        if (isNaN(dateObj.getTime())) {
          // Try alternative date parsing
          const fallbackTime = new Date(parsedDate);
          if (isNaN(fallbackTime.getTime())) {
            return null;
          }
          return fallbackTime;
        }
        
        return dateObj;
      } catch {
        return null;
      }
    };
    
    switch (activeTab) {
      case 'today':
        return reminders.filter(r => {
          if (r.status === 'done') return false;
          if (!r.date) return false;
          const reminderDateTime = safeCreateDate(r.date, r.time);
          if (!reminderDateTime) return false;
          const reminderDate = reminderDateTime.toISOString().split('T')[0];
          return reminderDate === today;
        });
      case 'done':
        return reminders.filter(r => r.status === 'done');
      case 'upcoming':
        return reminders.filter(r => {
          if (r.status === 'done') return false;
          if (!r.date) return false;
          const reminderDateTime = safeCreateDate(r.date, r.time);
          if (!reminderDateTime) return false;
          return reminderDateTime > now;
        });
      case 'all':
        return reminders;
      default:
        return reminders;
    }
  };

  // Calculate countdown with real-time updates
  const getCountdown = (date, time) => {
    try {
      if (!date) return 'No date set';
      
      // Handle various date formats
      let parsedDate = date;
      if (typeof date === 'string') {
        // Remove any time component if present in date
        parsedDate = date.split('T')[0];
      }
      
      const reminderTime = new Date(`${parsedDate}T${time || '00:00'}`);
      
      if (isNaN(reminderTime.getTime())) {
        // Try alternative date parsing
        const fallbackTime = new Date(parsedDate);
        if (isNaN(fallbackTime.getTime())) {
          return 'Invalid date';
        }
        reminderTime.setTime(fallbackTime.getTime());
      }
      
      const diff = reminderTime - currentTime;
      
      // Add a small buffer to account for timezone differences
      const buffer = 60000; // 1 minute buffer
      if (diff < -buffer) return 'Overdue';
      
      // If it's within the buffer, show "Now"
      if (diff < buffer) return 'Now';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
      if (hours > 0) return `in ${hours}h ${minutes}m`;
      if (minutes > 0) return `in ${minutes}m ${seconds}s`;
      if (seconds > 0) return `in ${seconds}s`;
      return 'Now';
    } catch {
      return 'Invalid date';
    }
  };

  // Get urgency color
  const getUrgencyColor = (date, time) => {
    try {
      if (!date) return 'border-gray-500';
      
      // Handle various date formats
      let parsedDate = date;
      if (typeof date === 'string') {
        // Remove any time component if present in date
        parsedDate = date.split('T')[0];
      }
      
      const now = new Date();
      const reminderTime = new Date(`${parsedDate}T${time || '00:00'}`);
      
      if (isNaN(reminderTime.getTime())) {
        // Try alternative date parsing
        const fallbackTime = new Date(parsedDate);
        if (isNaN(fallbackTime.getTime())) {
          return 'border-gray-500';
        }
        reminderTime.setTime(fallbackTime.getTime());
      }
      
      const diff = reminderTime - now;
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      // Add a small buffer to account for timezone differences
      const buffer = 60000; // 1 minute buffer
      if (parsedDate < today) return 'border-red-500';
      if (parsedDate === today) {
        if (diff < -buffer) return 'border-red-500';
        return 'border-yellow-500';
      }
      if (parsedDate === tomorrowStr) return 'border-orange-500';
      return 'border-green-500';
    } catch {
      return 'border-gray-500';
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const reminderData = {
        ...formData,
        status: 'pending',
        notificationSent: false
      };
      
      if (editingReminder) {
        await api.put(`/reminders/${editingReminder._id}`, reminderData);
        toast.success('Reminder updated successfully!');
      } else {
        await api.post('/reminders', reminderData);
        toast.success('Reminder created successfully!');
      }
      
      // Refresh reminders
      const response = await api.get('/reminders');
      setReminders(response.data.data || []);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        color: colorOptions[0],
        repeat: 'once',
        weekDays: [],
        monthlyDay: 1,
        repeatEndDate: '',
        linkedTask: ''
      });
      setEditingReminder(null);
      setShowAddPanel(false);
      
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast.error('Failed to save reminder');
    }
  };

  // Handle reminder actions
  const handleSnooze = async (reminderId, duration) => {
    try {
      // Validate reminder ID
      if (!reminderId || reminderId === 'undefined') {
        toast.error('Invalid reminder ID');
        return;
      }
      
      const reminder = reminders.find(r => r.id === reminderId);
      if (!reminder) {
        toast.error('Reminder not found');
        return;
      }
      
      let newDate = new Date();
      
      switch (duration) {
        case '30min':
          newDate.setMinutes(newDate.getMinutes() + 30);
          break;
        case '1hour':
          newDate.setHours(newDate.getHours() + 1);
          break;
        case '1day':
          newDate.setDate(newDate.getDate() + 1);
          break;
        case '1week':
          newDate.setDate(newDate.getDate() + 7);
          break;
      }
      
      await api.patch(`/reminders/${reminderId}`, {
        date: newDate.toISOString().split('T')[0],
        time: newDate.toTimeString().slice(0, 5),
        status: 'snoozed',
        notificationSent: false
      });
      
      const response = await api.get('/reminders');
      setReminders(response.data.data || []);
      toast.success('Reminder snoozed!');
      
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      toast.error('Failed to snooze reminder');
    }
  };

  const handleDone = async (reminderId) => {
    try {
      // Validate reminder ID
      if (!reminderId || reminderId === 'undefined') {
        toast.error('Invalid reminder ID');
        return;
      }
      
      const reminder = reminders.find(r => r.id === reminderId);
      if (!reminder) {
        toast.error('Reminder not found');
        return;
      }
      
      await api.patch(`/reminders/${reminderId}`, {
        status: 'done',
        completedAt: new Date().toISOString()
      });
      
      const response = await api.get('/reminders');
      setReminders(response.data.data || []);
      toast.success('Reminder marked as done!');
      
    } catch (error) {
      console.error('Error marking reminder as done:', error);
      toast.error('Failed to mark reminder as done');
    }
  };

  const handleDelete = async (reminderId) => {
    try {
      // Validate reminder ID
      if (!reminderId || reminderId === 'undefined') {
        toast.error('Invalid reminder ID');
        return;
      }
      
      // Convert MongoDB ObjectID to string if needed
      const idString = reminderId.toString ? reminderId.toString() : reminderId;
      
      const reminder = reminders.find(r => r._id.toString() === idString);
      if (!reminder) {
        toast.error('Reminder not found');
        return;
      }
      
      await api.delete(`/reminders/${idString}`);
      
      const response = await api.get('/reminders');
      setReminders(response.data.data || []);
      toast.success('Reminder deleted!');
      
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
    }
  };

  const filteredReminders = getFilteredReminders().filter(reminder =>
    reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reminder.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`space-y-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reminders</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading your reminders...</p>
        </div>
        <div className="grid gap-4">
          {[1,2,3].map(i => (
            <div key={`skeleton-${i}`} className={`p-4 rounded-xl border shadow-sm animate-pulse ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isDark ? 'text-white' : 'text-gray-900'} pb-20`}>
      {/* Stats Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Today</p>
              <p className="text-2xl font-bold">{stats.today}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDark ? 'bg-cyan-500/20' : 'bg-cyan-500/10'
            }`}>
              <Calendar className={`w-6 h-6 ${isDark ? 'text-cyan-400' : 'text-cyan-500'}`} />
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Snoozed</p>
              <p className="text-2xl font-bold">{stats.snoozed}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDark ? 'bg-yellow-500/20' : 'bg-yellow-500/10'
            }`}>
              <Clock className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Done This Week</p>
              <p className="text-2xl font-bold">{stats.doneThisWeek}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDark ? 'bg-green-500/20' : 'bg-green-500/10'
            }`}>
              <CheckCircle2 className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reminders</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {filteredReminders.length} {filteredReminders.length === 1 ? 'reminder' : 'reminders'} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search reminders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
            />
          </div>
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setFormData({
                title: '',
                description: '',
                date: today,
                time: '09:00',
                color: colorOptions[0],
                repeat: 'once',
                weekDays: [],
                monthlyDay: 1,
                repeatEndDate: '',
                linkedTask: ''
              });
              setShowAddPanel(true);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                : 'bg-cyan-500 hover:bg-cyan-600 text-white'
            }`}
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New Reminder</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {['upcoming', 'today', 'done', 'all'].map(tab => (
          <button
            key={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors capitalize ${
              activeTab === tab
                ? isDark 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30' 
                  : 'bg-cyan-500/20 text-cyan-600 border border-cyan-400/30'
                : isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <Bell size={32} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
            </div>
            <h3 className="text-lg font-medium mb-2">No reminders found</h3>
            <p className="text-sm">
              {searchQuery ? 'Try adjusting your search' : 'Create your first reminder to get started'}
            </p>
          </div>
        ) : (
          filteredReminders.map((reminder, index) => (
            <motion.div
              key={`reminder-${reminder._id || `fallback-${index}`}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-xl border transition-all hover:shadow-lg border-l-4 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              style={{ borderLeftColor: reminder.color }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {reminder.title}
                      </h3>
                      {reminder.description && (
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {reminder.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {reminder.repeat !== 'once' && (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          <Repeat size={12} className="inline mr-1" />
                          {reminder.repeat}
                        </span>
                      )}
                      {reminder.linkedTask && (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                        }`}>
                          <Link size={12} className="inline mr-1" />
                          {tasks.find(t => t.id === reminder.linkedTask)?.title || 'Task'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Calendar size={14} />
                      {reminder.date}
                    </span>
                    <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Clock size={14} />
                      {reminder.time}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      getCountdown(reminder.date, reminder.time) === 'Overdue'
                        ? 'bg-red-100 text-red-700'
                        : isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-700'
                    }`}>
                      {getCountdown(reminder.date, reminder.time)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="relative group">
                    <button className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                      <Clock size={16} />
                    </button>
                    <div className={`absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <button
                        onClick={() => reminder._id && handleSnooze(reminder._id.toString(), '30min')}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 first:rounded-t-lg ${
                          isDark ? 'hover:bg-gray-700' : ''
                        }`}
                      >
                        +30 minutes
                      </button>
                      <button
                        onClick={() => reminder._id && handleSnooze(reminder._id.toString(), '1hour')}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                          isDark ? 'hover:bg-gray-700' : ''
                        }`}
                      >
                        +1 hour
                      </button>
                      <button
                        onClick={() => reminder._id && handleSnooze(reminder._id.toString(), '1day')}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                          isDark ? 'hover:bg-gray-700' : ''
                        }`}
                      >
                        +1 day
                      </button>
                      <button
                        onClick={() => reminder._id && handleSnooze(reminder._id.toString(), '1week')}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 last:rounded-b-lg ${
                          isDark ? 'hover:bg-gray-700' : ''
                        }`}
                      >
                        +1 week
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => reminder._id && handleDone(reminder._id.toString())}
                    className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <CheckCircle2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingReminder(reminder);
                      setFormData({
                        title: reminder.title,
                        description: reminder.description || '',
                        date: reminder.date,
                        time: reminder.time,
                        color: reminder.color,
                        repeat: reminder.repeat,
                        weekDays: reminder.weekDays || [],
                        monthlyDay: reminder.monthlyDay || 1,
                        repeatEndDate: reminder.repeatEndDate || '',
                        linkedTask: reminder.linkedTask || ''
                      });
                      setShowAddPanel(true);
                    }}
                    className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => reminder._id && handleDelete(reminder._id.toString())}
                    className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Reminder Panel */}
      <AnimatePresence>
        {showNotificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNotificationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md p-6 rounded-xl border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Enable Notifications
                </h3>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X size={20} />
                </button>
              </div>
              <div className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <p className="mb-2">Stay on top of your reminders with browser notifications!</p>
                <ul className="text-sm space-y-1">
                  <li>• Get notified exactly when reminders are due</li>
                  <li>• Never miss important tasks or events</li>
                  <li>• Works even when FlowSpace is in background</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={requestNotificationPermission}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark 
                      ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                      : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  }`}
                >
                  Enable Notifications
                </button>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddPanel && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className={`fixed right-0 top-0 h-full w-full max-w-md border-l z-40 overflow-y-auto ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {editingReminder ? 'Edit Reminder' : 'New Reminder'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddPanel(false);
                        setEditingReminder(null);
                        setFormData({
                          title: '',
                          description: '',
                          date: '',
                          time: '',
                          color: colorOptions[0],
                          repeat: 'once',
                          weekDays: [],
                          monthlyDay: 1,
                          repeatEndDate: '',
                          linkedTask: ''
                        });
                      }}
                      className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                        placeholder="Enter reminder title"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                        placeholder="Enter description (optional)"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border cursor-pointer ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Time *
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border cursor-pointer ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Color
                      </label>
                      <div className="flex gap-2">
                        {colorOptions.map((color, index) => (
                          <button
                            key={`color-${index}`}
                            type="button"
                            onClick={() => setFormData({ ...formData, color })}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              formData.color === color 
                                ? 'border-white scale-110' 
                                : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Repeat
                      </label>
                      <select
                        value={formData.repeat}
                        onChange={(e) => setFormData({ ...formData, repeat: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                      >
                        <option value="once">Once</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    {formData.repeat === 'weekly' && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Days of Week
                        </label>
                        <div className="flex gap-2">
                          {weekDays.map((day, index) => (
                            <button
                              key={`weekday-${index}`}
                              type="button"
                              onClick={() => {
                                const newWeekDays = formData.weekDays.includes(index)
                                  ? formData.weekDays.filter(d => d !== index)
                                  : [...formData.weekDays, index];
                                setFormData({ ...formData, weekDays: newWeekDays });
                              }}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                formData.weekDays.includes(index)
                                  ? isDark ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30' : 'bg-cyan-100/50 text-cyan-700 border border-cyan-400/30'
                                  : isDark ? 'bg-gray-700/50 text-gray-400 border border-gray-600/30' : 'bg-gray-200/50 text-gray-600 border border-gray-300/30'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {formData.repeat === 'monthly' && (
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Day of Month
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={formData.monthlyDay}
                          onChange={(e) => setFormData({ ...formData, monthlyDay: parseInt(e.target.value) })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                        />
                      </div>
                    )}
                    
                    {formData.repeat !== 'once' && (
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Repeat End Date
                        </label>
                        <input
                          type="date"
                          value={formData.repeatEndDate}
                          onChange={(e) => setFormData({ ...formData, repeatEndDate: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border cursor-pointer ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Link to Task
                      </label>
                      <select
                        value={formData.linkedTask}
                        onChange={(e) => setFormData({ ...formData, linkedTask: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                      >
                        <option value="">No task linked</option>
                        {tasks.map(task => (
                          <option key={`task-${task.id}`} value={task.id}>
                            {task.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <button
                        type="submit"
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isDark 
                            ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                            : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                        }`}
                      >
                        {editingReminder ? 'Update' : 'Create'} Reminder
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddPanel(false);
                          setEditingReminder(null);
                          setFormData({
                            title: '',
                            description: '',
                            date: '',
                            time: '',
                            color: colorOptions[0],
                            repeat: 'once',
                            weekDays: [],
                            monthlyDay: 1,
                            repeatEndDate: '',
                            linkedTask: ''
                          });
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isDark 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
      </AnimatePresence>
    </div>
  );
}
