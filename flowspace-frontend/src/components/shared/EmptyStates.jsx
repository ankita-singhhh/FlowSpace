import { useTheme } from '../context/ThemeContext';

export const EmptyTasks = () => {
  const { isDark } = useTheme();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <svg 
        className="w-24 h-24 mb-4 opacity-50" 
        fill="none" 
        stroke={isDark ? '#9CA3AF' : '#6B7280'} 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
        />
      </svg>
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        No tasks yet
      </h3>
      <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Let's get organized! Create your first task to get started.
      </p>
    </div>
  );
};

export const EmptyReminders = () => {
  const { isDark } = useTheme();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <svg 
        className="w-24 h-24 mb-4 opacity-50" 
        fill="none" 
        stroke={isDark ? '#9CA3AF' : '#6B7280'} 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
        />
      </svg>
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        No reminders set
      </h3>
      <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Stay on top of things! Set a reminder to never miss important events.
      </p>
    </div>
  );
};

export const EmptyHabits = () => {
  const { isDark } = useTheme();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <svg 
        className="w-24 h-24 mb-4 opacity-50" 
        fill="none" 
        stroke={isDark ? '#9CA3AF' : '#6B7280'} 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" 
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" 
        />
      </svg>
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        No habits tracked
      </h3>
      <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Start building one! Create a habit to track your daily progress.
      </p>
    </div>
  );
};

export const EmptyNotes = () => {
  const { isDark } = useTheme();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <svg 
        className="w-24 h-24 mb-4 opacity-50" 
        fill="none" 
        stroke={isDark ? '#9CA3AF' : '#6B7280'} 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
        />
      </svg>
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Your notes are empty
      </h3>
      <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Capture an idea! Create your first note to get started.
      </p>
    </div>
  );
};

export const EmptyAnalytics = () => {
  const { isDark } = useTheme();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <svg 
        className="w-24 h-24 mb-4 opacity-50" 
        fill="none" 
        stroke={isDark ? '#9CA3AF' : '#6B7280'} 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
        />
      </svg>
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        No analytics data
      </h3>
      <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Start tracking! Complete tasks and habits to see your progress.
      </p>
    </div>
  );
};
