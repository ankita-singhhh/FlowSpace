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
  Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

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
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');
  const [weeklyProgress, setWeeklyProgress] = useState(75);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const stats = {
    tasksDueToday: 8,
    tasksCompletedThisWeek: 23,
    activeHabits: 5,
    upcomingReminders: 3
  };

  const todayTasks = [
    { id: 1, title: 'Complete project proposal', priority: 'High', dueTime: '14:00', category: 'Work' },
    { id: 2, title: 'Review quarterly report', priority: 'Medium', dueTime: '16:00', category: 'Work' },
    { id: 3, title: 'Team standup meeting', priority: 'High', dueTime: '10:00', category: 'Work' },
    { id: 4, title: 'Update documentation', priority: 'Low', dueTime: '18:00', category: 'Work' },
    { id: 5, title: 'Code review session', priority: 'Medium', dueTime: '15:00', category: 'Work' },
  ];

  const upcomingReminders = [
    { id: 1, title: 'Project deadline', time: '10:00 AM', type: 'deadline' },
    { id: 2, title: 'Team meeting', time: '2:00 PM', type: 'meeting' },
    { id: 3, title: 'Doctor appointment', time: '4:30 PM', type: 'appointment' },
  ];

  const todayHabits = [
    { id: 1, title: 'Morning Meditation', icon: '🧘', completed: true },
    { id: 2, title: 'Exercise', icon: '💪', completed: false },
    { id: 3, title: 'Read for 30 mins', icon: '📚', completed: false },
    { id: 4, title: 'Drink 8 glasses water', icon: '💧', completed: true },
    { id: 5, title: 'Journal', icon: '📝', completed: false },
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    let greetingText = 'Good evening';
    if (hour < 12) greetingText = 'Good morning';
    else if (hour < 18) greetingText = 'Good afternoon';
    
    setGreeting(greetingText);

    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
  }, []);

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back to FlowSpace</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={toggleFocusMode}
          title={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
        >
          {isFocusMode ? <Eye size={20} /> : <Moon size={20} />}
          <span className="text-sm font-medium">{isFocusMode ? 'Exit Focus' : 'Focus Mode'}</span>
        </button>
      </div>

      {!isFocusMode && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ListTodo size={24} className="text-blue-600" />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={16} className="text-green-500" />
                  <span className="text-sm text-green-500">+12%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.tasksDueToday}</h3>
              <p className="text-sm text-gray-600">Tasks Due Today</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-green-600" />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={16} className="text-green-500" />
                  <span className="text-sm text-green-500">+8%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.tasksCompletedThisWeek}</h3>
              <p className="text-sm text-gray-600">Completed This Week</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Target size={24} className="text-amber-600" />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={16} className="text-green-500" />
                  <span className="text-sm text-green-500">+2</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.activeHabits}</h3>
              <p className="text-sm text-gray-600">Active Habits</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bell size={24} className="text-purple-600" />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={16} className="text-red-500" />
                  <span className="text-sm text-red-500">-1</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.upcomingReminders}</h3>
              <p className="text-sm text-gray-600">Upcoming Reminders</p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Progress */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
                <span className="text-sm text-gray-500">75% complete</span>
              </div>
              <div className="flex items-center gap-4">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#e5e7eb"
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
                  <text x="32" y="32" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-gray-900">
                    75%
                  </text>
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Great progress this week!</p>
                  <p className="text-xs text-gray-500 mt-1">Keep up the momentum</p>
                </div>
              </div>
            </div>

            {/* Today's Priority Tasks */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Today's Priority Tasks</h3>
                <span className="text-sm text-gray-500">{todayTasks.length} tasks</span>
              </div>
              <div className="space-y-3">
                {todayTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`} />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">{task.category}</span>
                        <span>{task.dueTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Reminders */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming</h3>
                <Bell size={20} className="text-gray-400" />
              </div>
              <div className="space-y-3">
                {upcomingReminders.map(reminder => (
                  <div key={reminder.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Bell size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{reminder.title}</h4>
                      <p className="text-xs text-gray-500">{reminder.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Habit Check-ins */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Daily Habits</h3>
                <Target size={20} className="text-gray-400" />
              </div>
              <div className="space-y-3">
                {todayHabits.map(habit => (
                  <div key={habit.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg">{habit.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{habit.title}</h4>
                    </div>
                    <div className={`w-5 h-5 rounded-full ${habit.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
                <BarChart3 size={20} className="text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Productivity</span>
                  <span className="text-sm font-medium text-gray-900">85%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Focus Time</span>
                  <span className="text-sm font-medium text-gray-900">6.5h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tasks Completed</span>
                  <span className="text-sm font-medium text-gray-900">23/30</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Streak</span>
                  <span className="text-sm font-medium text-gray-900">12 days</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Focus Mode */}
      {isFocusMode && (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Focus Mode</h2>
            <p className="text-gray-600 max-w-lg mx-auto mb-6">Only today's priority tasks are visible. Minimize distractions and maximize productivity.</p>
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium mx-auto"
              onClick={toggleFocusMode}
            >
              <Eye size={20} />
              Exit Focus Mode
            </button>
          </div>
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Today's Priority Tasks</h3>
            <div className="space-y-4">
              {todayTasks.map(task => (
                <div key={task.id} className={`flex items-start gap-4 p-6 bg-white border rounded-xl shadow-sm ${task.priority === 'High' ? 'border-l-4 border-l-red-500' : task.priority === 'Medium' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-green-500'}`}>
                  <div className="mt-1">
                    <div className={`w-5 h-5 border-2 rounded-full ${task.priority === 'High' ? 'border-red-500' : task.priority === 'Medium' ? 'border-amber-500' : 'border-green-500'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${task.priority === 'High' ? 'bg-red-100 text-red-700' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {task.priority}
                      </span>
                      <span className="text-gray-500">{task.dueTime}</span>
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
