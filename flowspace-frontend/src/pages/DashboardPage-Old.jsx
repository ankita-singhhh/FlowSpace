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
  Moon
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
  "The time is always right to do what is right.",
  "Dream big. Start small. Act now.",
  "Success doesn't find you, you find it.",
  "Make each day your masterpiece.",
  "Done is better than perfect.",
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');
  const [weeklyProgress, setWeeklyProgress] = useState(75);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getTaskCountForDay = (date) => {
    return Math.floor(Math.random() * 8) + 1;
  };

  const formatDay = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    return {
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday,
      taskCount: getTaskCountForDay(date)
    };
  };

  return (
    <div className={`p-8 bg-white min-h-screen ${isFocusMode ? 'focus-mode' : ''}`}>
      {/* Greeting Banner */}
      <div className="flex justify-between items-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-8 rounded-2xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-4">
          <h1 className="text-3xl font-bold leading-tight">
            {greeting}, <span className="text-cyan-200">{user?.name?.split(' ')[0]}</span>!
          </h1>
          <div className="max-w-md">
            <p className="text-lg italic opacity-90">"{quote}"</p>
          </div>
        </div>
        <button 
          className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200 font-medium"
          onClick={toggleFocusMode}
          title={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
        >
          {isFocusMode ? <Eye size={20} /> : <Moon size={20} />}
          <span>{isFocusMode ? 'Exit Focus' : 'Focus Mode'}</span>
        </button>
      </div>

      {!isFocusMode && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 hover:opacity-10 transition-opacity duration-500" />
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ListTodo size={24} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{stats.tasksDueToday}</h3>
                <p className="text-sm text-gray-600">Tasks Due Today</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-0 hover:opacity-10 transition-opacity duration-500" />
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{stats.tasksCompletedThisWeek}</h3>
                <p className="text-sm text-gray-600">Completed This Week</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 hover:opacity-10 transition-opacity duration-500" />
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Target size={24} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{stats.activeHabits}</h3>
                <p className="text-sm text-gray-600">Active Habits</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 hover:opacity-10 transition-opacity duration-500" />
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{stats.upcomingReminders}</h3>
                <p className="text-sm text-gray-600">Upcoming Reminders</p>
              </div>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="flex items-center gap-8 bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - weeklyProgress / 100)}`}
                  className="transition-all duration-500"
                  strokeLinecap="round"
                />
                <text x="64" y="64" textAnchor="middle" dominantBaseline="middle" className="text-xl font-bold fill-gray-900">
                  {weeklyProgress}%
                </text>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Weekly Progress</h3>
              <p className="text-gray-600">Keep up the great work!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Priority Tasks */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Today's Priority Tasks</h2>
              </div>
              <div className="space-y-4">
                {todayTasks.slice(0, 5).map(task => (
                  <div key={task.id} className={`flex items-start gap-3 p-4 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors ${task.priority === 'High' ? 'border-l-4 border-l-red-500' : task.priority === 'Medium' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-green-500'}`}>
                    <div className="mt-1">
                      <input type="checkbox" className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer hover:border-cyan-500 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${task.priority === 'High' ? 'bg-red-500 text-white' : task.priority === 'Medium' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}`}>
                          {task.priority}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{task.category}</span>
                        <span className="text-gray-500">{task.dueTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Week Calendar */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">This Week</h2>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {getWeekDays().map((day, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col items-center p-3 bg-gray-50 border rounded-lg cursor-pointer hover:bg-gray-100 transition-all hover:-translate-y-1 ${day.isToday ? 'bg-cyan-500 text-white border-cyan-500' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-xs font-medium mb-1">{day.dayName}</div>
                    <div className="text-lg font-bold">{day.dayNumber}</div>
                    {day.taskCount > 0 && (
                      <div className="flex gap-1 mt-1">
                        {[...Array(Math.min(day.taskCount, 3))].map((_, i) => (
                          <div key={i} className="w-1 h-1 bg-cyan-500 rounded-full" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Reminders */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Reminders</h2>
              </div>
              <div className="space-y-4">
                {upcomingReminders.map(reminder => (
                  <div key={reminder.id} className="flex items-center gap-3 p-4 bg-gray-50 border rounded-lg hover:bg-gray-100 hover:translate-x-1 transition-all">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${reminder.type === 'deadline' ? 'bg-red-100' : reminder.type === 'meeting' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                      <Bell size={16} className={reminder.type === 'deadline' ? 'text-red-600' : reminder.type === 'meeting' ? 'text-blue-600' : 'text-amber-600'} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                      <p className="text-sm text-gray-500">{reminder.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Habit Check-in Strip */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Today's Habits</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {todayHabits.map(habit => (
                  <button 
                    key={habit.id} 
                    className={`flex flex-col items-center gap-2 p-3 bg-gray-50 border rounded-lg cursor-pointer hover:bg-gray-100 hover:-translate-y-1 transition-all min-w-[120px] ${habit.completed ? 'bg-green-500 text-white border-green-500' : ''}`}
                  >
                    <span className="text-xl">{habit.icon}</span>
                    <span className="text-xs font-medium text-center">{habit.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Focus Mode Content */}
      {isFocusMode && (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Focus Mode</h2>
            <p className="text-gray-600 max-w-lg mx-auto mb-6">Only today's priority tasks are visible. Minimize distractions and maximize productivity.</p>
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium mx-auto"
              onClick={toggleFocusMode}
            >
              <Eye size={20} />
              Exit Focus Mode
            </button>
          </div>
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Today's Priority Tasks</h3>
            <div className="space-y-4">
              {todayTasks.slice(0, 5).map(task => (
                <div key={task.id} className={`flex items-start gap-4 p-6 bg-white border rounded-xl shadow-sm ${task.priority === 'High' ? 'border-l-4 border-l-red-500' : task.priority === 'Medium' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-green-500'}`}>
                  <div className="mt-1">
                    <input type="checkbox" className="w-6 h-6 border-2 border-gray-300 rounded cursor-pointer hover:border-cyan-500 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${task.priority === 'High' ? 'bg-red-500 text-white' : task.priority === 'Medium' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}`}>
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
