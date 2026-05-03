import { useState, useEffect } from 'react';
import { 
  Target, 
  Calendar, 
  Clock, 
  Flame, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  Archive,
  ChevronRight,
  Loader2,
  Plus
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

export default function GoalsDashboard({ goals, onGoalUpdated }) {
  const { isDark } = useTheme();
  const [activeGoal, setActiveGoal] = useState(null);
  const [goalStats, setGoalStats] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goals.length > 0) {
      setActiveGoal(goals[0]);
    }
  }, [goals]);

  useEffect(() => {
    if (activeGoal) {
      fetchGoalStats();
      fetchTodayTasks();
    }
  }, [activeGoal]);

  const fetchGoalStats = async () => {
    if (!activeGoal) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/goals/${activeGoal._id}/stats`);
      if (response.data.success) {
        setGoalStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching goal stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayTasks = async () => {
    if (!activeGoal) return;
    
    try {
      const response = await api.get(`/goals/${activeGoal._id}`);
      if (response.data.success) {
        const allTasks = response.data.data.tasksByDay;
        const today = new Date().toISOString().split('T')[0];
        const todayDayNumber = Math.ceil((new Date() - new Date(activeGoal.createdAt)) / (24 * 60 * 60 * 1000));
        
        const todayTasksList = allTasks[todayDayNumber] || [];
        setTodayTasks(todayTasksList);
      }
    } catch (error) {
      console.error('Error fetching today tasks:', error);
    }
  };

  const handleTaskToggle = async (taskId) => {
    try {
      const task = todayTasks.find(t => t._id === taskId);
      const newStatus = task.status === 'completed' ? 'todo' : 'completed';
      
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      
      // Update local state
      setTodayTasks(prev => prev.map(t => 
        t._id === taskId ? { ...t, status: newStatus } : t
      ));
      
      fetchGoalStats(); // Refresh stats
      onGoalUpdated(); // Refresh goals list
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/goals/${activeGoal._id}/status`, { status: newStatus });
      onGoalUpdated();
    } catch (error) {
      console.error('Error updating goal status:', error);
      toast.error('Failed to update goal status');
    }
  };

  const CircularProgress = ({ percentage, size = 120 }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDark ? '#374151' : '#E5E7EB'}
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#3B82F6"
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    );
  };

  if (!activeGoal) {
    return (
      <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No active goals yet</p>
      </div>
    );
  }

  if (loading && !goalStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-white' : 'text-gray-900'}`} />
      </div>
    );
  }

  const currentDay = Math.ceil((new Date() - new Date(activeGoal.createdAt)) / (24 * 60 * 60 * 1000));
  const daysBehind = goalStats?.daysBehind || 0;

  return (
    <div className="space-y-6">
      {/* Active Goal Card */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur-lg border border-gray-700' : 'bg-white/50 backdrop-blur-lg border border-gray-200'}`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {activeGoal.title}
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              {activeGoal.description}
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Day {currentDay} of {activeGoal.totalDays}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {goalStats?.streak || 0} day streak
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-green-500" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  ETA: {goalStats?.etaDate ? new Date(goalStats.etaDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <CircularProgress percentage={goalStats?.completionPct || 0} />
          </div>
        </div>

        {/* Warning if behind */}
        {daysBehind > 0 && (
          <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${
            isDark ? 'bg-amber-900/20 border border-amber-700/50' : 'bg-amber-50 border border-amber-200'
          }`}>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              Behind by {daysBehind} days
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {activeGoal.status === 'active' && (
            <button
              onClick={() => handleStatusChange('paused')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Pause className="w-3 h-3" />
              Pause
            </button>
          )}
          {activeGoal.status === 'paused' && (
            <button
              onClick={() => handleStatusChange('active')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="w-3 h-3" />
              Resume
            </button>
          )}
          <button
            onClick={() => handleStatusChange('archived')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Archive className="w-3 h-3" />
            Archive
          </button>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur-lg border border-gray-700' : 'bg-white/50 backdrop-blur-lg border border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Today's Tasks
        </h3>
        
        {todayTasks.length > 0 ? (
          <div className="space-y-2">
            {todayTasks.map(task => (
              <div
                key={task._id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  isDark ? 'bg-gray-700/30' : 'bg-gray-50'
                } ${task.status === 'completed' ? 'opacity-60' : ''}`}
              >
                <button
                  onClick={() => handleTaskToggle(task._id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.status === 'completed'
                      ? 'bg-green-600 border-green-600'
                      : isDark 
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {task.status === 'completed' && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </button>
                <div className="flex-1">
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} ${
                    task.status === 'completed' ? 'line-through' : ''
                  }`}>
                    {task.title}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {task.estimatedMinutes} min • {task.taskType}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No tasks for today
          </p>
        )}
      </div>

      {/* Weekly Progress */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur-lg border border-gray-700' : 'bg-white/50 backdrop-blur-lg border border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Weekly Progress
        </h3>
        
        <div className="flex items-end justify-between h-32 gap-2">
          {(goalStats?.weeklyProgress || Array(8).fill(0)).map((count, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  isDark ? 'bg-blue-600' : 'bg-blue-500'
                }`}
                style={{ height: `${Math.max(10, (count / 10) * 100)}%` }}
              />
              <span className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                W{index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* New Goal Button */}
      <button
        onClick={() => window.location.reload()}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Another Goal
      </button>
    </div>
  );
}
