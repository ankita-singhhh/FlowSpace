import { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Edit,
  Trash2,
  X,
  Calendar,
  Sparkles,
  Copy,
  Download,
  Grid3X3,
  List,
  Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

const categoryColors = {
  'Work': 'bg-blue-500',
  'Personal': 'bg-green-500',
  'Health': 'bg-red-500',
  'Finance': 'bg-yellow-500',
  'Learning': 'bg-purple-500',
  'Other': 'bg-gray-500'
};

const priorityColors = {
  'High': 'bg-red-400',
  'Medium': 'bg-yellow-400',
  'Low': 'bg-green-400'
};

export default function PlannerPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [unscheduledTasks, setUnscheduledTasks] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState({});
  const [isTimeBlockingMode, setIsTimeBlockingMode] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const dragCounter = useRef(0);
  
  // Get week dates
  const getWeekDates = () => {
    const week = [];
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  // Format week range
  const getWeekRange = () => {
    const week = getWeekDates();
    const start = week[0];
    const end = week[6];
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`;
  };

  // Navigate weeks
  const navigateWeek = (direction) => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
      return newDate;
    });
  };

  // Fetch tasks data
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      
      try {
        const response = await api.get('/tasks');
        const allTasks = response.data.data || [];
        
        // Filter unscheduled tasks (tasks without dueDate or dueDate not in current week)
        const weekDates = getWeekDates();
        const weekDateStrings = weekDates.map(date => date.toISOString().split('T')[0]);
        
        const unscheduled = allTasks.filter(task => 
          !task.dueDate || !weekDateStrings.includes(task.dueDate)
        );
        
        setTasks(allTasks);
        setUnscheduledTasks(unscheduled);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user, currentWeek]);

  // Drag and drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(task));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, cellKey) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverCell(cellKey);
  };

  const handleDragLeave = (e) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverCell(null);
    }
  };

  const handleDrop = (e, cellKey) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOverCell(null);
    
    if (!draggedTask) return;
    
    // Update task with new dueDate
    const [dayIndex, timeSlot] = cellKey.split('-');
    const weekDates = getWeekDates();
    const targetDate = weekDates[parseInt(dayIndex)];
    const dueDate = targetDate.toISOString().split('T')[0];
    
    // Update task in backend
    const updateTask = async () => {
      try {
        await api.put(`/tasks/${draggedTask._id}`, { 
          dueDate,
          dueTime: isTimeBlockingMode ? `${timeSlot}:00` : null 
        });
        
        // Update local state
        setTasks(prev => prev.map(task => 
          task._id === draggedTask._id 
            ? { ...task, dueDate, dueTime: isTimeBlockingMode ? `${timeSlot}:00` : null }
            : task
        ));
        
        // Update unscheduled tasks
        setUnscheduledTasks(prev => prev.filter(task => task._id !== draggedTask._id));
        
        toast.success(`"${draggedTask.title}" scheduled for ${targetDate.toLocaleDateString()}`);
      } catch (error) {
        console.error('Error scheduling task:', error);
        toast.error('Failed to schedule task');
      }
    };
    
    updateTask();
    setDraggedTask(null);
  };

  // Context menu handlers
  const handleContextMenu = (e, task, cellKey) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, task, cellKey });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const removeTaskFromSchedule = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}`, { dueDate: null, dueTime: null });
      
      setTasks(prev => prev.map(task => 
        task._id === taskId 
          ? { ...task, dueDate: null, dueTime: null }
          : task
      ));
      
      // Add back to unscheduled
      const task = tasks.find(t => t._id === taskId);
      if (task) {
        setUnscheduledTasks(prev => [...prev, { ...task, dueDate: null, dueTime: null }]);
      }
      
      toast.success('Task removed from schedule');
      closeContextMenu();
    } catch (error) {
      console.error('Error removing task:', error);
      toast.error('Failed to remove task');
    }
  };

  // Control functions
  const handleAIPlanWeek = () => {
    toast.success('AI planning feature coming soon!');
  };

  const handleClearWeek = () => {
    if (window.confirm('Are you sure you want to clear this week\'s schedule?')) {
      // Clear all tasks for this week
      const weekDates = getWeekDates();
      const weekDateStrings = weekDates.map(date => date.toISOString().split('T')[0]);
      
      tasks.forEach(task => {
        if (task.dueDate && weekDateStrings.includes(task.dueDate)) {
          removeTaskFromSchedule(task._id);
        }
      });
    }
  };

  const handleCopyLastWeek = () => {
    toast.success('Copy last week feature coming soon!');
  };

  const handleExportSummary = () => {
    const weekDates = getWeekDates();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = isTimeBlockingMode 
      ? Array.from({ length: 15 }, (_, i) => i + 7) // 7AM to 9PM
      : ['Morning', 'Afternoon', 'Evening'];
    
    let summary = `FlowSpace Week of ${getWeekRange()}\n\n`;
    
    weekDates.forEach((date, dayIndex) => {
      const dayName = dayNames[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = tasks.filter(task => task.dueDate === dateStr);
      
      if (dayTasks.length > 0) {
        summary += `${dayName}:\n`;
        dayTasks.forEach(task => {
          summary += `  - ${task.title}`;
          if (task.dueTime) summary += ` (${task.dueTime})`;
          summary += '\n';
        });
        summary += '\n';
      }
    });
    
    navigator.clipboard.writeText(summary);
    toast.success('Week summary copied to clipboard!');
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center`}>
        <div className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading planner...</div>
      </div>
    );
  }

  const weekDates = getWeekDates();
  const today = new Date();
  const todayIndex = weekDates.findIndex(date => 
    date.toDateString() === today.toDateString()
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Weekly Planner</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimeBlockingMode(!isTimeBlockingMode)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isTimeBlockingMode 
                  ? 'bg-cyan-500 text-white' 
                  : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isTimeBlockingMode ? <Grid3X3 size={16} /> : <List size={16} />}
              {isTimeBlockingMode ? 'Time Blocks' : 'Time Slots'}
            </button>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAIPlanWeek}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Sparkles size={16} />
            AI Plan Week
          </button>
          <button
            onClick={handleCopyLastWeek}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Copy size={16} />
            Copy Last Week
          </button>
          <button
            onClick={handleExportSummary}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={handleClearWeek}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-red-900 text-red-300 hover:bg-red-800' 
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            <Trash2 size={16} />
            Clear Week
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigateWeek('prev')}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
        >
          <ChevronLeft size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
        </button>
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Week of {getWeekRange()}
        </h2>
        <button 
          onClick={() => navigateWeek('next')}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
        >
          <ChevronRight size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex gap-6">
        {/* Left Panel - Unscheduled Tasks */}
        <div className={`w-64 ${isDark ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700' : 'bg-white/70 backdrop-blur-sm border-gray-200'} rounded-xl border p-4`}>
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Unscheduled Tasks</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {unscheduledTasks.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center py-4`}>
                No unscheduled tasks
              </p>
            ) : (
              unscheduledTasks.map(task => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className={`p-3 rounded-lg border cursor-move transition-all ${
                    isDark 
                      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1 ${priorityColors[task.priority] || 'bg-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          categoryColors[task.category] || 'bg-gray-500'
                        } text-white`}>
                          {task.category}
                        </span>
                        {task.priority && (
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Grid Area */}
        <div className="flex-1">
          {/* Week Grid */}
          <div className={`rounded-xl border ${isDark ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700' : 'bg-white/70 backdrop-blur-sm border-gray-200'} p-4`}>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDates.map((date, index) => (
                <div
                  key={index}
                  className={`text-center p-2 rounded-lg ${
                    todayIndex === index
                      ? 'bg-cyan-500/20 border-2 border-cyan-400'
                      : isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {date.getDate()}
                  </div>
                  {todayIndex === index && (
                    <div className="text-xs text-cyan-400 font-medium">Today</div>
                  )}
                </div>
              ))}
            </div>

            {/* Time Slot Grid */}
            <div className="space-y-2">
              {(isTimeBlockingMode ? Array.from({ length: 15 }, (_, i) => i + 7) : ['Morning', 'Afternoon', 'Evening']).map((timeSlot, slotIndex) => (
                <div key={slotIndex} className="grid grid-cols-7 gap-2">
                  {weekDates.map((date, dayIndex) => {
                    const cellKey = `${dayIndex}-${timeSlot}`;
                    const dateStr = date.toISOString().split('T')[0];
                    const cellTasks = tasks.filter(task => 
                      task.dueDate === dateStr && (
                        isTimeBlockingMode 
                          ? parseInt(task.dueTime?.split(':')[0]) === timeSlot
                          : task.dueTime === null
                      )
                    );
                    
                    return (
                      <div
                        key={cellKey}
                        className={`min-h-[80px] p-2 rounded-lg border transition-all ${
                          dragOverCell === cellKey
                            ? 'border-2 border-dashed border-cyan-400 bg-cyan-500/10'
                            : isDark 
                              ? 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50' 
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, cellKey)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, cellKey)}
                        onContextMenu={(e) => {
                          if (cellTasks.length > 0) {
                            handleContextMenu(e, cellTasks[0], cellKey);
                          }
                        }}
                      >
                        <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {isTimeBlockingMode ? `${timeSlot}:00` : timeSlot}
                        </div>
                        <div className="space-y-1">
                          {cellTasks.slice(0, 3).map(task => (
                            <div
                              key={task._id}
                              className={`p-1 rounded text-xs cursor-pointer group ${
                                isDark 
                                  ? 'bg-gray-600/50 hover:bg-gray-600' 
                                  : 'bg-white hover:bg-gray-50'
                              } border ${isDark ? 'border-gray-500' : 'border-gray-200'}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task)}
                              onContextMenu={(e) => {
                                e.stopPropagation();
                                handleContextMenu(e, task, cellKey);
                              }}
                            >
                              <div className="flex items-start gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0 ${
                                  priorityColors[task.priority] || 'bg-gray-400'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className={`truncate font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {task.title}
                                  </p>
                                  {task.dueTime && (
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {task.dueTime}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeTaskFromSchedule(task._id);
                                  }}
                                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded ${
                                    isDark ? 'hover:bg-red-900/50' : 'hover:bg-red-100'
                                  }`}
                                >
                                  <X size={10} className="text-red-400" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {cellTasks.length > 3 && (
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              +{cellTasks.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className={`fixed z-50 rounded-lg shadow-lg border py-1 min-w-[150px] ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={closeContextMenu}
        >
          <button
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            View Details
          </button>
          <button
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Move
          </button>
          <button
            onClick={() => removeTaskFromSchedule(contextMenu.task._id)}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              isDark 
                ? 'hover:bg-red-900/50 text-red-400' 
                : 'hover:bg-red-100 text-red-600'
            }`}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
