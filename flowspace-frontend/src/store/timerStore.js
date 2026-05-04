import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useTimerStore = create(
  persist(
    (set, get) => ({
      activeTimer: null,
      
      // Set active timer
      setActiveTimer: (timer) => {
        set({ activeTimer: timer });
        
        // Also save to localStorage for backup
        if (timer) {
          localStorage.setItem('fs_timer_active', JSON.stringify(timer));
        } else {
          localStorage.removeItem('fs_timer_active');
        }
      },
      
      // Clear active timer
      clearActiveTimer: () => {
        set({ activeTimer: null });
        localStorage.removeItem('fs_timer_active');
      },
      
      // Update timer state
      updateTimerState: (updates) => {
        const currentTimer = get().activeTimer;
        if (currentTimer) {
          const updatedTimer = { ...currentTimer, ...updates };
          set({ activeTimer: updatedTimer });
          localStorage.setItem('fs_timer_active', JSON.stringify(updatedTimer));
        }
      },
      
      // Get timer for specific task
      getTimerForTask: (taskId) => {
        const activeTimer = get().activeTimer;
        return activeTimer && activeTimer.taskId === taskId ? activeTimer : null;
      }
    }),
    {
      name: 'timer-storage', // name in sessionStorage
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        }
      }
    }
  )
);

export default useTimerStore;
