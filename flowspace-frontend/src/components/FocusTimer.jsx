import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

export default function FocusTimer({ taskId, taskTitle, onComplete, onClose }) {
  const { isDark } = useTheme();
  
  // Timer state
  const [mode, setMode] = useState('FOCUS'); // FOCUS or BREAK
  const [remaining, setRemaining] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalSessions] = useState(2);
  
  // Refs for timer management
  const intervalRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);
  
  // Constants
  const WORK_DURATION = 25 * 60; // 25 minutes
  const BREAK_DURATION = 5 * 60; // 5 minutes
  const RADIUS = 90;
  const STROKE_WIDTH = 8;
  
  // Load timer state from localStorage on mount
  useEffect(() => {
    const savedTimer = localStorage.getItem('fs_timer_state');
    if (savedTimer) {
      try {
        const timerState = JSON.parse(savedTimer);
        if (timerState.taskId === taskId) {
          setMode(timerState.mode || 'FOCUS');
          setSessionCount(timerState.sessionCount || 0);
          
          // Calculate elapsed time
          if (timerState.startTime && !timerState.isPaused) {
            const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
            const duration = timerState.mode === 'FOCUS' ? WORK_DURATION : BREAK_DURATION;
            const newRemaining = Math.max(0, duration - elapsed);
            setRemaining(newRemaining);
            
            if (newRemaining > 0 && !timerState.isPaused) {
              setIsRunning(true);
              startTimeRef.current = timerState.startTime;
            } else if (newRemaining <= 0) {
              handleSessionComplete();
            }
          } else {
            setRemaining(timerState.remaining || (timerState.mode === 'FOCUS' ? WORK_DURATION : BREAK_DURATION));
          }
        }
      } catch (error) {
        console.error('Error loading timer state:', error);
        clearTimerState();
      }
    }
  }, [taskId]);
  
  // Save timer state to localStorage
  const saveTimerState = useCallback(() => {
    const timerState = {
      taskId,
      mode,
      remaining,
      sessionCount,
      isRunning,
      startTime: startTimeRef.current,
      isPaused: !isRunning,
      savedAt: Date.now()
    };
    localStorage.setItem('fs_timer_state', JSON.stringify(timerState));
  }, [taskId, mode, remaining, sessionCount, isRunning]);
  
  // Clear timer state from localStorage
  const clearTimerState = useCallback(() => {
    localStorage.removeItem('fs_timer_state');
    localStorage.removeItem('fs_timer_start');
    localStorage.removeItem('fs_timer_end');
  }, []);
  
  // Save timer state whenever it changes
  useEffect(() => {
    saveTimerState();
  }, [saveTimerState]);
  
  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Save current state when tab becomes hidden
        saveTimerState();
      } else {
        // When tab becomes visible, recalculate elapsed time
        const savedTimer = localStorage.getItem('fs_timer_state');
        if (savedTimer && isRunning) {
          try {
            const timerState = JSON.parse(savedTimer);
            if (timerState.taskId === taskId && timerState.startTime && !timerState.isPaused) {
              const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
              const duration = mode === 'FOCUS' ? WORK_DURATION : BREAK_DURATION;
              const newRemaining = Math.max(0, duration - elapsed);
              setRemaining(newRemaining);
              
              if (newRemaining <= 0) {
                handleSessionComplete();
              }
            }
          } catch (error) {
            console.error('Error handling visibility change:', error);
          }
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [taskId, isRunning, mode, saveTimerState]);
  
  // Play beep sound using Web Audio API
  const playBeep = useCallback((frequency = 800, count = 3, interval = 200) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = frequency;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
        }, i * interval);
      }
    } catch (error) {
      console.error('Error playing beep:', error);
    }
  }, []);
  
  // Show browser notification
  const showNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'focus-timer'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: 'focus-timer'
          });
        }
      });
    }
  }, []);
  
  // Handle session completion
  const handleSessionComplete = useCallback(async () => {
    setIsRunning(false);
    clearTimerState();
    
    if (mode === 'FOCUS') {
      // Work session completed
      playBeep(800, 3, 200);
      showNotification('Break time!', `Great focus session on: ${taskTitle}`);
      
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      
      try {
        const response = await api.post(`/tasks/${taskId}/session`, {
          durationMinutes: 25,
          sessionType: 'focus_timer'
        });
        
        if (response.data.success && response.data.data.autoCompleted) {
          toast.success('Task auto-completed after 2 sessions! 🎉');
          onComplete();
          onClose();
          return;
        }
      } catch (error) {
        console.error('Error logging session:', error);
      }
      
      // Start break timer
      setTimeout(() => {
        setMode('BREAK');
        setRemaining(BREAK_DURATION);
        setIsRunning(true);
        startTimeRef.current = Date.now();
      }, 1000);
      
    } else {
      // Break completed
      playBeep(500, 2, 200);
      showNotification('Break over', 'Ready for another session?');
      
      // Start next work session
      setTimeout(() => {
        setMode('FOCUS');
        setRemaining(WORK_DURATION);
        setIsRunning(true);
        startTimeRef.current = Date.now();
      }, 1000);
    }
  }, [mode, sessionCount, taskId, taskTitle, playBeep, showNotification, onComplete, onClose, clearTimerState]);
  
  // Timer animation loop
  useEffect(() => {
    if (isRunning) {
      const animate = () => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const duration = mode === 'FOCUS' ? WORK_DURATION : BREAK_DURATION;
        const newRemaining = Math.max(0, duration - elapsed);
        
        setRemaining(newRemaining);
        
        if (newRemaining <= 0) {
          handleSessionComplete();
        } else {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, mode, handleSessionComplete]);
  
  // Start timer
  const handleStart = () => {
    setIsRunning(true);
    startTimeRef.current = Date.now();
  };
  
  // Pause timer
  const handlePause = () => {
    setIsRunning(false);
    pausedTimeRef.current += Date.now() - startTimeRef.current;
  };
  
  // Stop timer
  const handleStop = () => {
    setIsRunning(false);
    clearTimerState();
    onClose();
  };
  
  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate SVG progress
  const circumference = 2 * Math.PI * RADIUS;
  const progress = mode === 'FOCUS' 
    ? ((WORK_DURATION - remaining) / WORK_DURATION) 
    : ((BREAK_DURATION - remaining) / BREAK_DURATION);
  const strokeDashoffset = circumference - (progress * circumference);
  
  const strokeColor = mode === 'FOCUS' ? '#00d4ff' : '#10b981';
  
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`}>
      <div className={`w-full max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Focus Timer
          </h2>
          <button
            onClick={handleStop}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Task Title */}
        <div className={`text-center mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {taskTitle}
        </div>
        
        {/* SVG Progress Ring */}
        <div className="flex justify-center mb-6">
          <svg width="200" height="200" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              stroke={isDark ? '#374151' : '#e5e7eb'}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              stroke={strokeColor}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.3s ease-in-out'
              }}
            />
            {/* Time text */}
            <text
              x="100"
              y="100"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-3xl font-bold fill-current ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
              transform="rotate(90)"
            >
              {formatTime(remaining)}
            </text>
          </svg>
        </div>
        
        {/* Mode Label */}
        <div className="text-center mb-4">
          <span className={`text-lg font-medium ${
            mode === 'FOCUS' ? 'text-cyan-400' : 'text-green-500'
          }`}>
            {mode}
          </span>
        </div>
        
        {/* Session Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[...Array(totalSessions)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < sessionCount ? 'bg-cyan-400' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
        
        {/* Session Count */}
        <div className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Session {sessionCount + 1} of {totalSessions}
        </div>
        
        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          )}
          <button
            onClick={handleStop}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
