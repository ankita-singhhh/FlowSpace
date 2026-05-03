import { useState, useEffect } from 'react';
import { 
  Plus, 
  Target, 
  Calendar, 
  Clock, 
  Flame, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Archive,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import GoalInputForm from '../components/GoalInputForm';
import GoalsDashboard from '../components/GoalsDashboard';

export default function GoalsPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [goals, setGoals] = useState([]);
  const [activeGoals, setActiveGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/goals?status=active');
      if (response.data.success) {
        setActiveGoals(response.data.data);
      }

      const allGoalsResponse = await api.get('/goals');
      if (allGoalsResponse.success) {
        setGoals(allGoalsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalCreated = (newGoal) => {
    setActiveGoals(prev => [...prev, newGoal]);
    setShowGoalForm(false);
    toast.success('Goal created successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-white' : 'text-gray-900'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Goals
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Plan and track your learning journey
          </p>
        </div>
        <button
          onClick={() => setShowGoalForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {/* Main Content */}
      {activeGoals.length === 0 && !showGoalForm ? (
        <GoalInputForm onGoalCreated={handleGoalCreated} />
      ) : showGoalForm ? (
        <GoalInputForm onGoalCreated={handleGoalCreated} />
      ) : (
        <GoalsDashboard goals={activeGoals} onGoalUpdated={fetchGoals} />
      )}
    </div>
  );
}
