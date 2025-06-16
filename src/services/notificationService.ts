import axios from 'axios';
import { 
  NotificationResponseDto, 
  NotificationListResponse, 
  NotificationFilters, 
  NotificationDto,
  WebSocketMessage
} from '../types/notification';

// Use same API configuration as videoService
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://video.openlearnhub.io.vn/api/v1';

// Create axios instance with same config as videoService
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'db': 'video_management'
  },
});

// Add request interceptor for auth token (similar to videoService)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class NotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private messageHandlers: ((message: NotificationDto) => void)[] = [];
  private statusHandlers: ((connected: boolean) => void)[] = [];
  private currentUsername: string | null = null;

  // REST API methods
  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationListResponse> {
    const params = new URLSearchParams();
    
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);
    if (filters.isRead !== undefined) params.append('isRead', filters.isRead.toString());

    const response = await apiClient.get(`/notifications?${params.toString()}`);
    return response.data;
  }

  async getNotification(id: number): Promise<NotificationResponseDto> {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  }

  async markAsRead(id: number): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.put(`/notifications/mark-all-read`);
  }

  async deleteNotification(id: number): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get(`/notifications/unread-count`);
    return response.data.count || response.data;
  }

  async getRecentNotifications(limit: number = 10): Promise<NotificationResponseDto[]> {
    const response = await apiClient.get(`/notifications/recent?limit=${limit}`);
    return response.data;
  }

  async getVideoNotifications(videoId: number): Promise<NotificationResponseDto[]> {
    const response = await apiClient.get(`/notifications/video/${videoId}`);
    return response.data;
  }

  // WebSocket methods
  connect(username: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.currentUsername = username;
        
        // Use native WebSocket with dynamic base URL
        const baseUrl = API_BASE_URL.replace(/^https?:\/\//, '').replace('/api/v1', '');
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${baseUrl}/ws?token=${encodeURIComponent(token)}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.notifyStatusHandlers(true);
          
          // Subscribe to user-specific notifications
          this.sendMessage({
            type: 'SUBSCRIBE',
            destination: `/user/${username}/notifications`
          });
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.notifyStatusHandlers(false);
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.currentUsername = null;
    this.reconnectAttempts = 0;
  }

  private sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'NOTIFICATION':
        this.notifyMessageHandlers(message.data as NotificationDto);
        break;
      case 'CONNECTION_STATUS':
        console.log('Connection status:', message.data);
        break;
      case 'ERROR':
        console.error('WebSocket error message:', message.data);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.currentUsername) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        // Get fresh token and reconnect
        const token = localStorage.getItem('token') || '';
        this.connect(this.currentUsername!, token).catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectInterval * this.reconnectAttempts);
    }
  }

  // Event handlers
  onMessage(handler: (message: NotificationDto) => void): () => void {
    this.messageHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onStatusChange(handler: (connected: boolean) => void): () => void {
    this.statusHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.statusHandlers.indexOf(handler);
      if (index > -1) {
        this.statusHandlers.splice(index, 1);
      }
    };
  }

  private notifyMessageHandlers(message: NotificationDto): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  private notifyStatusHandlers(connected: boolean): void {
    this.statusHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in status handler:', error);
      }
    });
  }

  // Utility methods
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionStatus(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  // Test method for development
  async sendTestNotification(username: string, message: string): Promise<void> {
    await apiClient.get(`/notifications/test`, {
      params: { username, message }
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;