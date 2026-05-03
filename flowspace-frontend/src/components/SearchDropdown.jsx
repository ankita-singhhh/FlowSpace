import { useState, useEffect, useRef } from 'react';
import { Search, FileText, Calendar, Target, Users, Settings, BarChart3, Clock, Tag, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const mockSearchData = {
  tasks: [
    { id: 1, title: 'Complete project proposal', type: 'task', priority: 'High', category: 'Work', dueDate: '2026-05-04', status: 'In Progress' },
    { id: 2, title: 'Review quarterly report', type: 'task', priority: 'Medium', category: 'Finance', dueDate: '2026-05-05', status: 'Todo' },
    { id: 3, title: 'Team standup meeting', type: 'task', priority: 'High', category: 'Work', dueDate: '2026-05-03', status: 'Completed' },
  ],
  reminders: [
    { id: 1, title: 'Team Standup Meeting', type: 'reminder', date: '2026-05-04', time: '10:00', category: 'meeting' },
    { id: 2, title: 'Project Deadline', type: 'reminder', date: '2026-05-05', time: '17:00', category: 'deadline' },
    { id: 3, title: 'Doctor Appointment', type: 'reminder', date: '2026-05-06', time: '14:30', category: 'appointment' },
  ],
  notes: [
    { id: 1, title: 'Meeting Notes - Q4 Planning', type: 'note', category: 'Work', created: '2026-05-01', preview: 'Discussed project timeline and resource allocation...' },
    { id: 2, title: 'Product Ideas', type: 'note', category: 'Personal', created: '2026-05-02', preview: 'New feature suggestions for the mobile app...' },
    { id: 3, title: 'Learning Resources', type: 'note', category: 'Learning', created: '2026-04-30', preview: 'React 19 documentation links and tutorials...' },
  ],
  habits: [
    { id: 1, title: 'Morning Meditation', type: 'habit', category: 'Health', streak: 12, completed: true },
    { id: 2, title: 'Exercise', type: 'habit', category: 'Health', streak: 8, completed: false },
    { id: 3, title: 'Read for 30 mins', type: 'habit', category: 'Learning', streak: 15, completed: true },
  ],
  events: [
    { id: 1, title: 'Team Standup', type: 'event', date: '2026-05-04', time: '10:00', location: 'Conference Room A' },
    { id: 2, title: 'Project Review', type: 'event', date: '2026-05-04', time: '14:00', location: 'Virtual' },
    { id: 3, title: 'Lunch with Client', type: 'event', date: '2026-05-05', time: '12:30', location: 'Italian Restaurant' },
  ]
};

export default function SearchDropdown({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        const results = performSearch(searchQuery);
        setSearchResults(results);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = (query) => {
    const lowercaseQuery = query.toLowerCase();
    const results = [];

    // Search tasks
    mockSearchData.tasks.forEach(task => {
      if (task.title.toLowerCase().includes(lowercaseQuery) || 
          task.category.toLowerCase().includes(lowercaseQuery)) {
        results.push(task);
      }
    });

    // Search reminders
    mockSearchData.reminders.forEach(reminder => {
      if (reminder.title.toLowerCase().includes(lowercaseQuery) || 
          reminder.category.toLowerCase().includes(lowercaseQuery)) {
        results.push(reminder);
      }
    });

    // Search notes
    mockSearchData.notes.forEach(note => {
      if (note.title.toLowerCase().includes(lowercaseQuery) || 
          note.preview.toLowerCase().includes(lowercaseQuery) ||
          note.category.toLowerCase().includes(lowercaseQuery)) {
        results.push(note);
      }
    });

    // Search habits
    mockSearchData.habits.forEach(habit => {
      if (habit.title.toLowerCase().includes(lowercaseQuery) || 
          habit.category.toLowerCase().includes(lowercaseQuery)) {
        results.push(habit);
      }
    });

    // Search events
    mockSearchData.events.forEach(event => {
      if (event.title.toLowerCase().includes(lowercaseQuery) || 
          event.location?.toLowerCase().includes(lowercaseQuery)) {
        results.push(event);
      }
    });

    return results.slice(0, 8); // Limit to 8 results
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsDropdownOpen(true);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleItemClick = (item) => {
    // Navigate to the appropriate page based on item type
    switch (item.type) {
      case 'task':
        navigate('/tasks');
        break;
      case 'reminder':
        navigate('/reminders');
        break;
      case 'note':
        navigate('/notes');
        break;
      case 'habit':
        navigate('/habits');
        break;
      case 'event':
        navigate('/planner');
        break;
      default:
        navigate('/dashboard');
    }
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'task':
        return <FileText size={16} className="text-gray-400" />;
      case 'reminder':
        return <Calendar size={16} className="text-gray-400" />;
      case 'note':
        return <FileText size={16} className="text-gray-400" />;
      case 'habit':
        return <Target size={16} className="text-gray-400" />;
      case 'event':
        return <Calendar size={16} className="text-gray-400" />;
      default:
        return <Search size={16} className="text-gray-400" />;
    }
  };

  const getItemBadge = (item) => {
    switch (item.type) {
      case 'task':
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            item.priority === 'High' ? 'bg-red-100 text-red-700' :
            item.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
            'bg-green-100 text-green-700'
          }`}>
            {item.priority}
          </span>
        );
      case 'reminder':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            {item.category}
          </span>
        );
      case 'note':
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
            {item.category}
          </span>
        );
      case 'habit':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
            {item.streak} day streak
          </span>
        );
      case 'event':
        return (
          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
            {item.time}
          </span>
        );
      default:
        return null;
    }
  };

  const getItemMetadata = (item) => {
    switch (item.type) {
      case 'task':
        return (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {item.dueDate && <span>{new Date(item.dueDate).toLocaleDateString()}</span>}
            {item.status && <span className={`px-1 py-0.5 rounded text-xs ${
              item.status === 'Completed' ? 'bg-green-100 text-green-700' :
              item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>{item.status}</span>}
          </div>
        );
      case 'reminder':
        return (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{new Date(item.date).toLocaleDateString()}</span>
            <span>{item.time}</span>
          </div>
        );
      case 'note':
        return (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{new Date(item.created).toLocaleDateString()}</span>
          </div>
        );
      case 'habit':
        return (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{item.category}</span>
            {item.completed && <CheckCircle2 size={12} className="text-green-500" />}
          </div>
        );
      case 'event':
        return (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{new Date(item.date).toLocaleDateString()}</span>
            <span>{item.time}</span>
            {item.location && <span>{item.location}</span>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
        <input
          type="text"
          placeholder="Search tasks, notes, reminders..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsDropdownOpen(true)}
          className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />
      </div>

      {isDropdownOpen && (searchQuery.trim() || isLoading) && (
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } border`}>
          {isLoading ? (
            <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto mb-2"></div>
              Searching...
            </div>
          ) : searchResults.length === 0 ? (
            <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Search size={48} className={`${isDark ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-2`} />
              <p>No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="py-2">
              {searchResults.map((item, index) => (
                <button
                  key={`${item.type}-${item.id}-${index}`}
                  onClick={() => handleItemClick(item)}
                  className={`w-full px-4 py-3 transition-colors text-left ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getItemIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-medium truncate ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {item.title}
                        </h4>
                        {getItemBadge(item)}
                      </div>
                      {item.preview && (
                        <p className={`text-xs mb-1 truncate ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>{item.preview}</p>
                      )}
                      {getItemMetadata(item)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
