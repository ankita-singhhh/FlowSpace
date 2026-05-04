import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Flame, 
  ListTodo, 
  Bell, 
  Target, 
  Calendar,
  Search,
  Eye,
  Moon,
  TrendingUp,
  Clock,
  Users,
  BarChart3,
  Activity,
  Menu,
  X,
  Sun
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const motivationalQuotes = [
  "The secret of getting ahead is getting started.",
  "Success is a sum of small efforts repeated day in and day out.",
  "Your limitation—it's only your imagination.",
  "The only way to do great work is to love what you do.",
  "Don't watch the clock; do what it does. Keep going.",
  "Believe you can and you're halfway there.",
  "Progress is impossible without change.",
  "The future depends on what you do today.",
  "Small steps every day lead to big changes over time.",
  "You don't have to be great to start, but you have to start to be great.",
  "Excellence is not a skill, it's an attitude.",
  "Focus on being productive instead of being busy.",
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');
  const [weeklyProgress, setWeeklyProgress] = useState(75);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [stats, setStats] = useState({
    tasksDueToday: 0,
    tasksCompletedThisWeek: 0,
    activeHabits: 0,
    upcomingReminders: 0
  });

  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [todayHabits, setTodayHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    let greetingText = 'Good evening';
    if (hour < 12) greetingText = 'Good morning';
    else if (hour < 18) greetingText = 'Good afternoon';
    
    setGreeting(greetingText);

    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.log('Dashboard: No user found');
        return;
      }
      
      try {
        setLoading(true);
        console.log('Dashboard: Fetching data for user:', user._id);
        
        // Fetch real stats from analytics endpoint
        const statsResponse = await api.get('/analytics/stats');
        console.log('Dashboard: Stats response:', statsResponse.data);
        const realStats = statsResponse.data.data || {};
        
        // Fetch user's tasks
        const tasksResponse = await api.get('/tasks');
        console.log('Dashboard: Tasks response:', tasksResponse.data);
        const tasks = tasksResponse.data.data || [];
        
        // Fetch user's habits
        const habitsResponse = await api.get('/habits');
        console.log('Dashboard: Habits response:', habitsResponse.data);
        const habits = habitsResponse.data.data || [];
        
        // Fetch user's reminders
        const remindersResponse = await api.get('/reminders');
        console.log('Dashboard: Reminders response:', remindersResponse.data);
        const reminders = remindersResponse.data.data || [];

        // Use real stats from API
        setStats({
          tasksDueToday: realStats.tasksDueToday || 0,
          tasksCompletedThisWeek: realStats.tasksCompleted || 0,
          activeHabits: realStats.activeGoals || habits.length,
          upcomingReminders: reminders.length
        });

        // Update weekly progress with real data
        setWeeklyProgress(realStats.weeklyProgress || 75);

        // Calculate today's tasks
        const today = new Date().toISOString().split('T')[0];
        const todayTasksList = tasks.filter(task => task.dueDate === today);

        setTodayTasks(todayTasksList.slice(0, 5));
        setUpcomingReminders(reminders.slice(0, 3));
        setTodayHabits(habits.slice(0, 5));

      } catch (error) {
        console.error('Dashboard: Error fetching user data:', error);
        console.error('Dashboard: Error details:', error.response?.data || error.message);
        // Keep empty states for new users
        setStats({
          tasksDueToday: 0,
          tasksCompletedThisWeek: 0,
          activeHabits: 0,
          upcomingReminders: 0
        });
        setTodayTasks([]);
        setUpcomingReminders([]);
        setTodayHabits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
  };

  if (loading) {
    return (
      <div className={`space-y-4 md:space-y-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading your data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1,2,3,4].map(i => (
            <div key={`skeleton-${i}`} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 md:p-6 rounded-xl border shadow-sm animate-pulse`}>
              <div className="w-10 h-10 bg-gray-300 rounded-lg mb-4"></div>
              <div className="h-8 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 md:space-y-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Welcome back to FlowSpace</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'} border rounded-lg transition-colors`}
            onClick={toggleTheme}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span className="hidden sm:inline text-sm font-medium">{isDark ? 'Light' : 'Dark'}</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'} border rounded-lg transition-colors`}
            onClick={toggleFocusMode}
            title={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
          >
            {isFocusMode ? <Eye size={20} /> : <Moon size={20} />}
            <span className="hidden sm:inline text-sm font-medium">{isFocusMode ? 'Exit Focus' : 'Focus Mode'}</span>
          </button>
        </div>
      </div>

      {!isFocusMode && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 md:p-6 rounded-xl border shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ListTodo size={20} className="text-blue-600" />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={16} className="text-green-500" />
                  <span className="text-sm text-green-500">+12%</span>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold">{stats.tasksDueToday}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tasks Due Today</p>
            </div>

            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 md:p-6 rounded-xl border shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-green-600" />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={16} className="text-green-500" />
                  <span className="text-sm text-green-500">+8%</span>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold">{stats.tasksCompletedThisWeek}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Completed This Week</p>
            </div>

            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 md:p-6 rounded-xl border shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Target size={20} className="text-amber-600" />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={16} className="text-green-500" />
                  <span className="text-sm text-green-500">+2</span>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold">{stats.activeHabits}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Habits</p>
            </div>

            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 md:p-6 rounded-xl border shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bell size={20} className="text-purple-600" />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={16} className="text-red-500" />
                  <span className="text-sm text-red-500">-1</span>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold">{stats.upcomingReminders}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Upcoming Reminders</p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Weekly Progress */}
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 md:p-6 rounded-xl border shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Weekly Progress</h3>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>75% complete</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke={isDark ? '#374151' : '#e5e7eb'}
                    strokeWidth="8"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - 0.75)}`}
                    className="transition-all duration-500"
                    strokeLinecap="round"
                  />
                  <text x="32" y="32" textAnchor="middle" dominantBaseline="middle" className={`text-lg font-bold ${isDark ? 'fill-white' : 'fill-gray-900'}`}>
                    75%
                  </text>
                </svg>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Great progress this week!</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Keep up the momentum</p>
                </div>
              </div>
            </div>

            {/* Today's Priority Tasks */}
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 md:p-6 rounded-xl border shadow-sm lg:col-span-2`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Today's Priority Tasks</h3>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{todayTasks.length} tasks</span>
              </div>
              <div className="space-y-3">
                {todayTasks.slice(0, isMobile ? 2 : 3).map(task => (
                  <div key={`task-${task.id}`} className={`flex items-center gap-3 p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`} />
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className={`px-2 py-1 ${isDark ? 'bg-gray-600' : 'bg-gray-100'} rounded`}>{task.category}</span>
                        <span>{task.dueTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Upcoming Reminders */}
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 md:p-6 rounded-xl border shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upcoming</h3>
                <Bell size={20} className={isDark ? 'text-gray-400' : 'text-gray-400'} />
              </div>
              <div className="space-y-3">
                {upcomingReminders.map(reminder => (
                  <div key={`reminder-${reminder.id}`} className={`flex items-center gap-3 p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Bell size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{reminder.title}</h4>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{reminder.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Habit Check-ins */}
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 md:p-6 rounded-xl border shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Daily Habits</h3>
                <Target size={20} className={isDark ? 'text-gray-400' : 'text-gray-400'} />
              </div>
              <div className="space-y-3">
                {todayHabits.map(habit => (
                  <div key={`habit-${habit.id}`} className={`flex items-center gap-3 p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <span className="text-lg">{habit.icon}</span>
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{habit.title}</h4>
                    </div>
                    <div className={`w-5 h-5 rounded-full ${habit.completed ? 'bg-green-500' : isDark ? 'bg-gray-600' : 'bg-gray-200'}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 md:p-6 rounded-xl border shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Quick Stats</h3>
                <BarChart3 size={20} className={isDark ? 'text-gray-400' : 'text-gray-400'} />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Productivity</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>85%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Focus Time</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>6.5h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Tasks Completed</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>23/30</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Streak</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>12 days</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Focus Mode */}
      {isFocusMode && (
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 md:p-8 rounded-xl border shadow-sm`}>
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Focus Mode</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-lg mx-auto mb-6`}>Only today's priority tasks are visible. Minimize distractions and maximize productivity.</p>
            <button 
              className={`flex items-center gap-2 px-6 py-3 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} border rounded-lg font-medium mx-auto`}
              onClick={toggleFocusMode}
            >
              <Eye size={20} />
              Exit Focus Mode
            </button>
          </div>
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-6 text-center">Today's Priority Tasks</h3>
            <div className="space-y-4">
              {todayTasks.map(task => (
                <div key={`dashboard-task-${task.id}`} className={`flex items-start gap-4 p-6 ${isDark ? 'bg-gray-700' : 'bg-white'} border rounded-xl shadow-sm ${task.priority === 'High' ? 'border-l-4 border-l-red-500' : task.priority === 'Medium' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-green-500'}`}>
                  <div className="mt-1">
                    <div className={`w-5 h-5 border-2 rounded-full ${task.priority === 'High' ? 'border-red-500' : task.priority === 'Medium' ? 'border-amber-500' : 'border-green-500'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${task.priority === 'High' ? 'bg-red-100 text-red-700' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {task.priority}
                      </span>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{task.dueTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
