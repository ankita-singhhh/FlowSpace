import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  CheckCircle2, 
  Calendar,
  Download,
  RefreshCw,
  Brain,
  Activity,
  Award,
  Clock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
  purple: '#8b5cf6',
  cyan: '#06b6d4'
};

export default function AnalyticsPage() {
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState('30days');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/analytics?timeRange=${timeRange}`);
        setAnalyticsData(response.data);
        
        // Fetch AI insights
        const insightsResponse = await api.get('/analytics/insights');
        setInsights(insightsResponse.data.insights || []);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        // Set empty data for new users
        setAnalyticsData({
          summary: {
            totalTasksCompleted: 0,
            averageTasksPerDay: 0,
            longestStreak: 0,
            mostProductiveDay: 'N/A'
          },
          tasksCompleted: [],
          categoryBreakdown: [],
          priorityDistribution: [],
          completionRateByDay: [],
          habitConsistency: []
        });
        setInsights([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  const handleRefreshInsights = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.post('/analytics/insights/refresh');
      setInsights(response.data.insights || []);
    } catch (error) {
      console.error('Failed to refresh insights:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportCSV = () => {
    if (!analyticsData || !analyticsData.tasksCompleted) return;
    
    // Create CSV content
    const csvContent = "Date,Tasks Completed\n" + 
      analyticsData.tasksCompleted.map(item => `${item.date},${item.count}`).join("\n");
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Analytics</h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Track your productivity and performance</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="3months">Last 3 months</option>
            <option value="all">All time</option>
          </select>
          <button
            onClick={handleExportCSV}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              isDark 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'bg-white text-gray-900 hover:bg-gray-50'
            } border ${isDark ? 'border-gray-700' : 'border-gray-300'}`}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-cyan-900' : 'bg-cyan-100'
            }`}>
              <CheckCircle2 size={24} className={isDark ? 'text-cyan-400' : 'text-cyan-600'} />
            </div>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {analyticsData.summary.totalTasksCompleted}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total tasks completed</p>
        </div>

        <div className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-blue-900' : 'bg-blue-100'
            }`}>
              <Target size={24} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <Activity size={16} className="text-gray-500" />
          </div>
          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {analyticsData.summary.avgTasksPerDay}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg tasks per day</p>
        </div>

        <div className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-purple-900' : 'bg-purple-100'
            }`}>
              <Award size={24} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
            </div>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {analyticsData.summary.longestStreak}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Longest streak (days)</p>
        </div>

        <div className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-green-900' : 'bg-green-100'
            }`}>
              <Calendar size={24} className={isDark ? 'text-green-400' : 'text-green-600'} />
            </div>
            <Activity size={16} className="text-gray-500" />
          </div>
          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {analyticsData.summary.mostProductiveDay}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Most productive day</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Tasks Completed Chart */}
        <div className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Tasks Completed
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.tasksCompleted}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="date" 
                stroke={isDark ? '#9ca3af' : '#6b7280'}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={COLORS.cyan} 
                strokeWidth={2}
                dot={{ fill: COLORS.cyan, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Category Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Priority Distribution */}
        <div className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Priority Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.priorityDistribution} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis type="number" stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <YAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <Tooltip />
              <Bar dataKey="count" fill={COLORS.cyan}>
                {analyticsData.priorityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Completion Rate by Day */}
        <div className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Completion Rate by Day of Week
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.completionRateByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="day" stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <Tooltip />
              <Bar dataKey="rate" fill={COLORS.green} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Habit Consistency */}
      <div className={`p-6 rounded-xl ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border mb-8`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Habit Consistency
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.habitConsistency}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="week" stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill={COLORS.green} name="Completed" />
            <Bar dataKey="missed" stackId="a" fill={COLORS.red} name="Missed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights Panel */}
      <div className={`p-6 rounded-xl ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            AI Insights
          </h2>
          <button
            onClick={handleRefreshInsights}
            disabled={isRefreshing}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              isDark 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Analyzing...' : 'Get AI Analysis'}
          </button>
        </div>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              } border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
            >
              <div className="flex items-start gap-3">
                <Brain size={20} className={isDark ? 'text-cyan-400' : 'text-cyan-600'} />
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{insight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
