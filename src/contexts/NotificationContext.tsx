import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  NotificationResponseDto, 
  NotificationDto, 
  NotificationState, 
  WebSocketConnectionStatus 
} from '../types/notification.types';
import { webSocketService } from '../services/websocketService';
import { NotificationService } from '../services/notificationService';
import { AuthService } from '../services/authService';
import toast from 'react-hot-toast';

// Actions
type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: NotificationResponseDto[] }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationResponseDto }
  | { type: 'UPDATE_NOTIFICATION'; payload: NotificationResponseDto }
  | { type: 'REMOVE_NOTIFICATION'; payload: number }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'SET_CONNECTION_STATUS'; payload: WebSocketConnectionStatus }
  | { type: 'MARK_AS_READ'; payload: number }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'RESET' };

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  connectionStatus: {
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0
  }
};

// Reducer
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload, isLoading: false, error: null };
    
    case 'ADD_NOTIFICATION':
      // Add new notification to the beginning of the list
      const newNotifications = [action.payload, ...state.notifications];
      // Keep only the latest 50 notifications to prevent memory issues
      const limitedNotifications = newNotifications.slice(0, 50);
      
      return { 
        ...state, 
        notifications: limitedNotifications,
        unreadCount: action.payload.isRead ? state.unreadCount : state.unreadCount + 1
      };
    
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload.id ? action.payload : n
        )
      };
    
    case 'REMOVE_NOTIFICATION':
      const removedNotification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: removedNotification && !removedNotification.isRead 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount
      };
    
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
        unreadCount: 0
      };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

// Context
interface NotificationContextType {
  state: NotificationState;
  
  // Actions
  loadNotifications: () => Promise<void>;
  loadRecentNotifications: (limit?: number) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  
  // WebSocket methods
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  
  // Test methods
  sendTestNotification: (username: string, message: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // WebSocket event handlers
  const handleNotificationReceived = useCallback((notification: NotificationDto) => {
    console.log('Real-time notification received:', notification);
    
    // Convert WebSocket notification to API response format
    const notificationResponse: NotificationResponseDto = {
      id: Date.now(), // Temporary ID until we refresh from API
      videoId: notification.videoId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      customerName: notification.customerName,
      sender: notification.sender,
      recipient: notification.recipient,
      newStatus: notification.newStatus,
      oldStatus: notification.oldStatus,
      isRead: false,
      createdAt: notification.timestamp,
      tenantId: 'video_management' // Default tenant
    };

    // Add to state
    dispatch({ type: 'ADD_NOTIFICATION', payload: notificationResponse });
    
    // Show toast notification
    toast.success(notification.title, {
      duration: 6000,
      position: 'top-right',
      style: {
        background: '#4ade80',
        color: 'white',
      },
    });

    // Refresh full data from API to get correct IDs
    setTimeout(() => {
      loadRecentNotifications(10);
      refreshUnreadCount();
    }, 1000);
  }, []);

  const handleConnectionStatusChanged = useCallback((status: WebSocketConnectionStatus) => {
    console.log('WebSocket connection status changed:', status);
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
    
    if (status.isConnected) {
      toast.success('Kết nối thông báo thành công', {
        duration: 2000,
        position: 'bottom-right',
      });
    } else if (status.reconnectAttempts > 0) {
      toast.error('Mất kết nối thông báo, đang thử kết nối lại...', {
        duration: 3000,
        position: 'bottom-right',
      });
    }
  }, []);

  // Initialize WebSocket event handlers
  useEffect(() => {
    webSocketService.setOnNotificationReceived(handleNotificationReceived);
    webSocketService.setOnConnectionStatusChanged(handleConnectionStatusChanged);
  }, [handleNotificationReceived, handleConnectionStatusChanged]);

  // Auto-connect WebSocket when user is authenticated
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      connectWebSocket();
      loadRecentNotifications();
      refreshUnreadCount();
    }

    return () => {
      disconnectWebSocket();
    };
  }, []);

  // API methods
  const loadNotifications = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await NotificationService.getNotifications({ page: 0, size: 20 });
      
      if (response.success) {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to load notifications' });
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load notifications' });
    }
  }, []);

  const loadRecentNotifications = useCallback(async (limit: number = 10) => {
    try {
      const response = await NotificationService.getRecentNotifications(limit);
      
      if (response.success) {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: response.data });
      }
    } catch (error) {
      console.error('Error loading recent notifications:', error);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      const response = await NotificationService.markAsRead(id);
      
      if (response.success) {
        dispatch({ type: 'MARK_AS_READ', payload: id });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Không thể đánh dấu đã đọc');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await NotificationService.markAllAsRead();
      
      if (response.success) {
        dispatch({ type: 'MARK_ALL_AS_READ' });
        toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Không thể đánh dấu tất cả là đã đọc');
    }
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      const response = await NotificationService.deleteNotification(id);
      
      if (response.success) {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
        toast.success('Đã xóa thông báo');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Không thể xóa thông báo');
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await NotificationService.getUnreadCount();
      
      if (response.success) {
        dispatch({ type: 'SET_UNREAD_COUNT', payload: response.data });
      }
    } catch (error) {
      console.error('Error refreshing unread count:', error);
    }
  }, []);

  // WebSocket methods
  const connectWebSocket = useCallback(() => {
    if (AuthService.isAuthenticated()) {
      webSocketService.connect();
    }
  }, []);

  const disconnectWebSocket = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  // Test methods
  const sendTestNotification = useCallback(async (username: string, message: string) => {
    try {
      await NotificationService.sendTestNotification(username, message);
      toast.success('Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    }
  }, []);

  const contextValue: NotificationContextType = {
    state,
    loadNotifications,
    loadRecentNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount,
    connectWebSocket,
    disconnectWebSocket,
    sendTestNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;