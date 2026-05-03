import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = () => {
    if (!user) return;

    const wsUrl = `ws://localhost:5000/ws?userId=${user._id}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setSocket(ws);
      
      // Send initial connection message
      ws.send(JSON.stringify({
        type: 'connect',
        userId: user._id,
        timestamp: new Date().toISOString()
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      setSocket(null);
      
      // Attempt to reconnect if not a normal closure
      if (event.code !== 1000) {
        attemptReconnect();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return ws;
  };

  const attemptReconnect = () => {
    let attempts = 0;
    
    const reconnect = () => {
      if (attempts < maxReconnectAttempts) {
        attempts++;
        console.log(`WebSocket reconnection attempt ${attempts}/${maxReconnectAttempts}`);
        connect();
      } else {
        console.log('Max reconnection attempts reached');
      }
    };

    reconnectTimeoutRef.current = setTimeout(reconnect, reconnectDelay);
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'reminder_due':
        // Handle real-time reminder notification
        if (data.reminder) {
          showRealTimeNotification(data.reminder);
        }
        break;
      
      case 'reminder_updated':
        // Handle reminder updates from other devices
        if (window.location.pathname === '/reminders') {
          // Refresh reminders if on reminders page
          window.dispatchEvent(new CustomEvent('reminders-updated', { detail: data.reminder }));
        }
        break;
      
      case 'reminder_deleted':
        // Handle reminder deletion from other devices
        if (window.location.pathname === '/reminders') {
          window.dispatchEvent(new CustomEvent('reminder-deleted', { detail: data.reminderId }));
        }
        break;
      
      case 'ping':
        // Respond to server ping
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
        break;
      
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  const showRealTimeNotification = (reminder) => {
    // Show browser notification
    if (Notification.permission === 'granted') {
      const notification = new Notification(`🔔 ${reminder.title}`, {
        body: `${reminder.description || 'Reminder due now!'} - ${reminder.time || 'All day'}`,
        icon: '/favicon.ico',
        tag: reminder.id,
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }

    // Show in-app notification
    toast.error(`${reminder.title} - ${reminder.description || 'Reminder due now!'}`, {
      icon: '🔔',
      duration: 5000
    });
  };

  const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      socket.close(1000, 'Client disconnecting');
      setSocket(null);
      setIsConnected(false);
    }
  };

  // Connect when user is available
  useEffect(() => {
    if (user) {
      const ws = connect();
      return () => disconnect();
    }
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const value = {
    socket,
    isConnected,
    sendMessage,
    disconnect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
