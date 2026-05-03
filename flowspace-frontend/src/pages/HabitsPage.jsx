import { useState, useEffect } from 'react';
import { 
  Plus, 
  Flame, 
  Check, 
  X, 
  Target, 
  Calendar,
  Trophy,
  TrendingUp,
  Heart,
  Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

// Emoji picker data
const commonEmojis = [
  '🔥', '💪', '🧘', '📚', '💧', '🏃', '🎯', '🌅', '🎨', '🎵', 
  '📝', '💻', '🌱', '🧠', '❤️', '⭐', '🌟', '✨', '🎪', '🎭',
  '🏆', '🏅', '🎯', '🎲', '🎮', '🎸', '🎺', '🥁', '🎹', '🎻'
];

// Color picker data
const habitColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#475569', '#1e293b'
];

export default function HabitsPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const [newHabit, setNewHabit] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    targetDays: [],
    icon: '🔥',
    color: '#3b82f6',
    goalNote: ''
  });

  // Fetch habits data
  useEffect(() => {
    const fetchHabits = async () => {
      if (!user) return;
      
      try {
        const response = await api.get('/habits');
        setHabits(response.data.data || []);
      } catch (error) {
        console.error('Error fetching habits:', error);
        // Set empty state for new users
        setHabits([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHabits();
  }, [user]);

  // Calculate today's completions
  const today = new Date().toISOString().split('T')[0];
  const todayCompleted = habits.filter(habit => 
    habit.completedDates && habit.completedDates.includes(today)
  ).length;
  
  // Calculate best streak
  const bestStreak = Math.max(...habits.map(habit => habit.bestStreak || 0), 0);
  
  // Motivational messages
  const getMotivationalMessage = () => {
    const completed = todayCompleted;
    const total = habits.length;
    
    if (completed === 0 && total > 0) return "Start your first habit today! 💪";
    if (completed === total && total > 0) return `Perfect! All ${total} habits completed today! 🎉`;
    if (completed >= total * 0.8) return `You're on fire! ${completed}/${total} habits completed today 🔥`;
    if (completed >= total * 0.5) return `Great progress! ${completed}/${total} habits done today ⭐`;
    return `Keep going! ${completed}/${total} habits completed today 🌱`;
  };

  // Habit management functions
  const handleCreateHabit = async () => {
    if (!newHabit.title.trim()) {
      toast.error('Please enter a habit title');
      return;
    }

    try {
      const response = await api.post('/habits', newHabit);
      setHabits(prev => [...prev, response.data.data]);
      setIsAddPanelOpen(false);
      setNewHabit({
        title: '',
        description: '',
        frequency: 'daily',
        targetDays: [],
        icon: '🔥',
        color: '#3b82f6',
        goalNote: ''
      });
      toast.success('Habit created successfully!');
    } catch (error) {
      console.error('Error creating habit:', error);
      toast.error('Failed to create habit');
    }
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      const response = await api.patch(`/habits/${habitId}/complete`);
      setHabits(prev => prev.map(habit => 
        habit._id === habitId ? response.data.data : habit
      ));
      
      // Trigger confetti animation (simple implementation)
      const habit = habits.find(h => h._id === habitId);
      toast.success(`Great job! "${habit.title}" completed! 🔥`);
      
      // Update today's completion count
      const newTodayCompleted = todayCompleted + 1;
      if (newTodayCompleted === habits.length) {
        setTimeout(() => {
          toast.success('🎉 Perfect day! All habits completed!');
        }, 1000);
      }
    } catch (error) {
      console.error('Error completing habit:', error);
      toast.error('Failed to complete habit');
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;
    
    try {
      await api.delete(`/habits/${habitId}`);
      setHabits(prev => prev.filter(habit => habit._id !== habitId));
      toast.success('Habit deleted successfully');
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Failed to delete habit');
    }
  };

  const calculateCompletionRate = (habit) => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const daysInPeriod = Math.ceil((today - thirtyDaysAgo) / (1000 * 60 * 60 * 24));
    
    return Math.round((habit.completedDates.length / daysInPeriod) * 100);
  };

  const generateHeatmapData = (habit) => {
    const data = [];
    const today = new Date();
    
    for (let i = 180; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const isCompleted = habit.completedDates && habit.completedDates.includes(dateStr);
      
      data.push({
        date: dateStr,
        completed: isCompleted,
        intensity: isCompleted ? 4 : 0
      });
    }
    
    return data;
  };

  if (isLoading) {
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center`}>
      <div className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading habits...</div>
    </div>
  );
}

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Habit Tracker</h1>
        <button
          onClick={() => setIsAddPanelOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isDark 
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
              : 'bg-cyan-500 hover:bg-cyan-600 text-white'
          }`}
        >
          <Plus size={20} />
          Add Habit
        </button>
      </div>

      {/* Summary Row */}
      <div className={`rounded-xl border p-4 mb-6 ${
        isDark 
          ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700' 
          : 'bg-white/70 backdrop-blur-sm border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active Habits</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {habits.length}
              </div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Done Today</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {todayCompleted}/{habits.length}
              </div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Best Streak</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {bestStreak} 🔥
              </div>
            </div>
          </div>
          <div className={`text-lg font-medium ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
            {getMotivationalMessage()}
          </div>
        </div>
      </div>

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border ${
          isDark 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white/70 border-gray-200'
        }`}>
          <div className="text-6xl mb-4">🎯</div>
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No habits yet
          </h3>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
            Start building better habits by adding your first one!
          </p>
          <button
            onClick={() => setIsAddPanelOpen(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                : 'bg-cyan-500 hover:bg-cyan-600 text-white'
            }`}
          >
            Add Your First Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map(habit => {
            const isCompletedToday = habit.completedDates && habit.completedDates.includes(today);
            const completionRate = calculateCompletionRate(habit);
            
            return (
              <div
                key={habit._id}
                className={`rounded-xl border p-4 cursor-pointer transition-all hover:scale-105 ${
                  isDark 
                    ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:bg-gray-700/50' 
                    : 'bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-gray-100'
                }`}
                style={{ borderTop: `4px solid ${habit.color}` }}
                onClick={() => setSelectedHabit(habit)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{habit.icon}</span>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {habit.title}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {habit.frequency}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHabit(habit._id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      isDark ? 'hover:bg-red-900/50' : 'hover:bg-red-100'
                    }`}
                  >
                    <X size={16} className="text-red-400" />
                  </button>
                </div>

                {/* Streak and Stats */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Flame size={16} className="text-orange-400" />
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {habit.currentStreak || 0}
                    </span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      day streak
                    </span>
                  </div>
                  {habit.bestStreak > 0 && (
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      Best: {habit.bestStreak}
                    </div>
                  )}
                </div>

                {/* This Week Mini Heatmap */}
                <div className="flex items-center gap-1 mb-3">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                    const date = new Date();
                    const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay() + index));
                    const dateStr = startOfWeek.toISOString().split('T')[0];
                    const isCompleted = habit.completedDates && habit.completedDates.includes(dateStr);
                    
                    return (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {isCompleted ? '✓' : day}
                      </div>
                    );
                  })}
                </div>

                {/* Completion Rate */}
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                  {completionRate}% this month
                </div>

                {/* Done Today Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompleteHabit(habit._id);
                  }}
                  disabled={isCompletedToday}
                  className={`w-full py-2 rounded-lg font-medium transition-all ${
                    isCompletedToday
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : isDark
                        ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                        : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  }`}
                >
                  {isCompletedToday ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check size={16} />
                      Done Today
                    </span>
                  ) : (
                    'Mark as Done'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Habit Panel */}
      {isAddPanelOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsAddPanelOpen(false)}>
          <div 
            className={`rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            } border`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add New Habit
              </h2>
              <button 
                onClick={() => setIsAddPanelOpen(false)}
                className={`p-1 rounded transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title *
                </label>
                <input
                  type="text"
                  value={newHabit.title}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter habit title"
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={newHabit.description}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your habit (optional)"
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                />
              </div>

              {/* Frequency */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Frequency
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['daily', 'weekly'].map(freq => (
                    <button
                      key={freq}
                      onClick={() => setNewHabit(prev => ({ ...prev, frequency: freq }))}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors capitalize ${
                        newHabit.frequency === freq
                          ? 'bg-cyan-500 text-white'
                          : isDark 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Days for Weekly */}
              {newHabit.frequency === 'weekly' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Target Days
                  </label>
                  <div className="grid grid-cols-7 gap-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const targetDays = newHabit.targetDays.includes(index)
                            ? newHabit.targetDays.filter(d => d !== index)
                            : [...newHabit.targetDays, index];
                          setNewHabit(prev => ({ ...prev, targetDays }));
                        }}
                        className={`p-2 rounded text-sm font-medium transition-colors ${
                          newHabit.targetDays.includes(index)
                            ? 'bg-cyan-500 text-white'
                            : isDark 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Icon Picker */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Icon
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                        : 'bg-white border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{newHabit.icon}</span>
                  </button>
                  {showEmojiPicker && (
                    <div className={`absolute z-10 p-2 rounded-lg border grid grid-cols-10 gap-1 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                    }`}>
                      {commonEmojis.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setNewHabit(prev => ({ ...prev, icon: emoji }));
                            setShowEmojiPicker(false);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className={`p-2 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                        : 'bg-white border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: newHabit.color }}
                    />
                  </button>
                  {showColorPicker && (
                    <div className={`absolute z-10 p-2 rounded-lg border grid grid-cols-10 gap-1 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                    }`}>
                      {habitColors.map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            setNewHabit(prev => ({ ...prev, color }));
                            setShowColorPicker(false);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: color }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Goal Note */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Why I want this habit
                </label>
                <textarea
                  value={newHabit.goalNote}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, goalNote: e.target.value }))}
                  placeholder="What's your motivation for this habit?"
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button 
                onClick={() => setIsAddPanelOpen(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateHabit}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
              >
                Create Habit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Habit History Modal */}
      {selectedHabit && showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowHistory(false)}>
          <div 
            className={`rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            } border`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedHabit.icon}</span>
                <div>
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedHabit.title}
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedHabit.frequency} • {calculateCompletionRate(selectedHabit)}% completion rate
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowHistory(false)}
                className={`p-1 rounded transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Current Streak</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedHabit.currentStreak || 0} 🔥
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Best Streak</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedHabit.bestStreak || 0} 🏆
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Completions</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedHabit.completedDates?.length || 0} ✅
                  </div>
                </div>
              </div>

              {/* GitHub-style Heatmap */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  6 Month Activity
                </h3>
                <div className="grid grid-cols-53 gap-1">
                  {generateHeatmapData(selectedHabit).map((day, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-sm ${
                        day.completed 
                          ? 'bg-green-500' 
                          : isDark ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                      title={`${day.date}: ${day.completed ? 'Completed' : 'Not completed'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
