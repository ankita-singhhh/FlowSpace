import { useTheme } from '../context/ThemeContext';

export const TaskSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} animate-pulse`}>
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded bg-gray-300 mt-0.5"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export const ReminderSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} animate-pulse`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          <div className="h-3 bg-gray-300 rounded w-1/3"></div>
        </div>
        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
};

export const HabitSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} animate-pulse`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

export const NoteSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} animate-pulse`}>
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded w-full"></div>
          <div className="h-3 bg-gray-300 rounded w-5/6"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
};

export const StatCardSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`p-4 md:p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} animate-pulse`}>
      <div className="w-10 h-10 bg-gray-300 rounded-lg mb-4"></div>
      <div className="h-8 bg-gray-300 rounded mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
    </div>
  );
};

export const ChartSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`p-4 md:p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} animate-pulse`}>
      <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
      <div className="h-48 bg-gray-300 rounded"></div>
    </div>
  );
};
