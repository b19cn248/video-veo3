import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  NotificationResponseDto, 
  NotificationDto, 
  NotificationType 
} from '../types/notification';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationState {
  notifications: NotificationResponseDto[];
  unreadCount: number;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  recentNotifications: NotificationResponseDto[];
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: NotificationResponseDto[] }
  | { type: 'SET_RECENT_NOTIFICATIONS'; payload: NotificationResponseDto[] }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationResponseDto }
  | { type: 'MARK_AS_READ'; payload: number }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: number }
  | { type: 'RESET' };

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  loading: false,
  error: null,
  recentNotifications: []
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload, loading: false };
    
    case 'SET_RECENT_NOTIFICATIONS':
      return { ...state, recentNotifications: action.payload };
    
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    
    case 'ADD_NOTIFICATION': {
      const newNotification = action.payload;
      const updatedRecent = [newNotification, ...state.recentNotifications].slice(0, 10);
      const updatedNotifications = [newNotification, ...state.notifications];
      const newUnreadCount = newNotification.isRead ? state.unreadCount : state.unreadCount + 1;
      
      return {
        ...state,
        notifications: updatedNotifications,
        recentNotifications: updatedRecent,
        unreadCount: newUnreadCount
      };
    }
    
    case 'MARK_AS_READ': {
      const notificationId = action.payload;
      const updatedNotifications = state.notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      );
      const updatedRecent = state.recentNotifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      );
      
      // Decrease unread count if notification was unread
      const notification = state.notifications.find(n => n.id === notificationId);
      const newUnreadCount = notification && !notification.isRead ? 
        Math.max(0, state.unreadCount - 1) : state.unreadCount;
      
      return {
        ...state,
        notifications: updatedNotifications,
        recentNotifications: updatedRecent,
        unreadCount: newUnreadCount
      };
    }
    
    case 'MARK_ALL_AS_READ': {
      const updatedNotifications = state.notifications.map(n => ({ 
        ...n, 
        isRead: true, 
        readAt: new Date().toISOString() 
      }));
      const updatedRecent = state.recentNotifications.map(n => ({ 
        ...n, 
        isRead: true, 
        readAt: new Date().toISOString() 
      }));
      
      return {
        ...state,
        notifications: updatedNotifications,
        recentNotifications: updatedRecent,
        unreadCount: 0
      };
    }
    
    case 'REMOVE_NOTIFICATION': {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      const newUnreadCount = notification && !notification.isRead ? 
        Math.max(0, state.unreadCount - 1) : state.unreadCount;
      
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== notificationId),
        recentNotifications: state.recentNotifications.filter(n => n.id !== notificationId),
        unreadCount: newUnreadCount
      };
    }
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

interface NotificationContextValue {
  state: NotificationState;
  actions: {
    loadNotifications: () => Promise<void>;
    loadRecentNotifications: () => Promise<void>;
    loadUnreadCount: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;
    connect: () => Promise<void>;
    disconnect: () => void;
    playNotificationSound: (type: NotificationType) => void;
    showBrowserNotification: (notification: NotificationDto) => void;
  };
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user } = useAuth();

  // Load initial data when user is authenticated
  useEffect(() => {
    if (user?.username) {
      loadInitialData();
      connectWebSocket();
    }
    
    return () => {
      notificationService.disconnect();
    };
  }, [user?.username]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadRecentNotifications(),
        loadUnreadCount()
      ]);
    } catch (error) {
      console.error('Error loading initial notification data:', error);
    }
  };

  const connectWebSocket = async () => {
    const token = localStorage.getItem('token');
    if (!user?.username || !token) return;

    try {
      // Set up event handlers
      const unsubscribeMessage = notificationService.onMessage(handleNewNotification);
      const unsubscribeStatus = notificationService.onStatusChange(handleConnectionStatusChange);

      // Connect
      await notificationService.connect(user.username, token);

      // Cleanup function
      return () => {
        unsubscribeMessage();
        unsubscribeStatus();
      };
    } catch (error) {
      console.error('Error connecting to notification service:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to notification service' });
    }
  };

  const handleNewNotification = (notificationDto: NotificationDto) => {
    // Convert DTO to ResponseDto format
    const notification: NotificationResponseDto = {
      id: Date.now(), // Temporary ID, will be replaced when syncing with server
      videoId: notificationDto.videoId,
      type: notificationDto.type,
      title: notificationDto.title,
      message: notificationDto.message,
      customerName: notificationDto.customerName,
      sender: notificationDto.sender,
      recipient: notificationDto.recipient,
      newStatus: notificationDto.newStatus,
      oldStatus: notificationDto.oldStatus,
      isRead: false,
      createdAt: notificationDto.timestamp,
      tenantId: 'video_management' // Use default tenant ID
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    
    // Show browser notification and play sound
    showBrowserNotification(notificationDto);
    playNotificationSound(notificationDto.type);
    
    // Refresh data from server to get correct IDs
    setTimeout(() => {
      loadRecentNotifications();
      loadUnreadCount();
    }, 1000);
  };

  const handleConnectionStatusChange = (connected: boolean) => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: connected });
    
    if (connected) {
      dispatch({ type: 'SET_ERROR', payload: null });
      // Sync data when reconnected
      loadRecentNotifications();
      loadUnreadCount();
    }
  };

  const loadNotifications = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await notificationService.getNotifications({ size: 50 });
      dispatch({ type: 'SET_NOTIFICATIONS', payload: response.content });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load notifications' });
      console.error('Error loading notifications:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadRecentNotifications = async () => {
    try {
      const notifications = await notificationService.getRecentNotifications(10);
      dispatch({ type: 'SET_RECENT_NOTIFICATIONS', payload: notifications });
    } catch (error) {
      console.error('Error loading recent notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      dispatch({ type: 'SET_UNREAD_COUNT', payload: count });
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      dispatch({ type: 'MARK_AS_READ', payload: id });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark notification as read' });
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark all notifications as read' });
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    } catch (error) {
      console.error('Error deleting notification:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete notification' });
    }
  };

  const connect = async () => {
    const token = localStorage.getItem('token');
    if (user?.username && token) {
      await connectWebSocket();
    }
  };

  const disconnect = () => {
    notificationService.disconnect();
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
  };

  const playNotificationSound = (type: NotificationType) => {
    // Simple beep sound for urgent notifications
    if (type === NotificationType.VIDEO_NEEDS_URGENT_FIX) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  const showBrowserNotification = (notification: NotificationDto) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: `notification-${notification.videoId}`,
        requireInteraction: notification.type === NotificationType.VIDEO_NEEDS_URGENT_FIX
      });
    } else if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showBrowserNotification(notification);
        }
      });
    }
  };

  const contextValue: NotificationContextValue = {
    state,
    actions: {
      loadNotifications,
      loadRecentNotifications,
      loadUnreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      connect,
      disconnect,
      playNotificationSound,
      showBrowserNotification
    }
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}