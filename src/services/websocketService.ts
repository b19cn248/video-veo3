import { Client, Frame, StompConfig, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthService } from './authService';
import { NotificationDto, WebSocketConnectionStatus } from '../types/notification.types';

export class WebSocketService {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;
  private connectionStatus: WebSocketConnectionStatus = {
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0
  };
  private onNotificationReceived?: (notification: NotificationDto) => void;
  private onConnectionStatusChanged?: (status: WebSocketConnectionStatus) => void;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds

  constructor() {
    this.setupClient();
  }

  private setupClient(): void {
    const config: StompConfig = {
      webSocketFactory: () => {
        // Use SockJS for better compatibility - use backend URL from environment
        const backendUrl = process.env.REACT_APP_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8080';
        return new SockJS(`${backendUrl}/ws`) as any;
      },
      
      connectHeaders: {
        Authorization: `Bearer ${AuthService.getToken()}`
      },
      
      debug: (str: string) => {
        console.log('STOMP Debug:', str);
      },
      
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: (frame: Frame) => {
        console.log('WebSocket connected:', frame);
        this.connectionStatus = {
          isConnected: true,
          isConnecting: false,
          lastConnected: new Date(),
          reconnectAttempts: 0
        };
        this.notifyConnectionStatusChange();
        this.subscribeToNotifications();
      },
      
      onStompError: (frame: Frame) => {
        console.error('STOMP error:', frame);
        this.connectionStatus = {
          ...this.connectionStatus,
          isConnected: false,
          isConnecting: false
        };
        this.notifyConnectionStatusChange();
      },
      
      onWebSocketClose: (event: CloseEvent) => {
        console.log('WebSocket connection closed:', event);
        this.connectionStatus = {
          ...this.connectionStatus,
          isConnected: false,
          isConnecting: false
        };
        this.notifyConnectionStatusChange();
        this.scheduleReconnect();
      },
      
      onWebSocketError: (event: Event) => {
        console.error('WebSocket error:', event);
        this.connectionStatus = {
          ...this.connectionStatus,
          isConnected: false,
          isConnecting: false
        };
        this.notifyConnectionStatusChange();
      }
    };

    this.client = new Client(config);
  }

  public connect(): void {
    if (this.connectionStatus.isConnected || this.connectionStatus.isConnecting) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    if (!AuthService.isAuthenticated()) {
      console.error('Cannot connect WebSocket: User not authenticated');
      return;
    }

    console.log('Connecting to WebSocket...');
    this.connectionStatus = {
      ...this.connectionStatus,
      isConnecting: true
    };
    this.notifyConnectionStatusChange();

    // Update authorization header with fresh token
    if (this.client) {
      this.client.configure({
        connectHeaders: {
          Authorization: `Bearer ${AuthService.getToken()}`
        }
      });
      this.client.activate();
    }
  }

  public disconnect(): void {
    console.log('Disconnecting WebSocket...');
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.client) {
      this.client.deactivate();
    }

    this.connectionStatus = {
      isConnected: false,
      isConnecting: false,
      reconnectAttempts: 0
    };
    this.notifyConnectionStatusChange();
  }

  private subscribeToNotifications(): void {
    if (!this.client || !this.client.connected) {
      console.error('Cannot subscribe: WebSocket not connected');
      return;
    }

    const username = AuthService.isAuthenticated() ? 
      (AuthService as any).loadUserProfile()?.then((user: any) => user?.username) : 
      null;

    if (!username) {
      console.error('Cannot subscribe: Username not available');
      return;
    }

    username.then((usernameStr: string) => {
      if (!usernameStr || !this.client) return;

      // Subscribe to user-specific notification channel
      this.subscription = this.client.subscribe(
        `/user/${usernameStr}/notifications`,
        (message) => {
          try {
            const notification: NotificationDto = JSON.parse(message.body);
            console.log('Notification received:', notification);
            
            // Acknowledge receipt
            this.acknowledgeNotification(notification);
            
            // Notify listeners
            if (this.onNotificationReceived) {
              this.onNotificationReceived(notification);
            }
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        }
      );

      console.log(`Subscribed to notifications for user: ${usernameStr}`);
    }).catch((error: any) => {
      console.error('Error getting username for subscription:', error);
    });
  }

  private acknowledgeNotification(notification: NotificationDto): void {
    if (!this.client || !this.client.connected) {
      return;
    }

    try {
      this.client.publish({
        destination: '/app/notification-received',
        body: JSON.stringify({
          videoId: notification.videoId,
          type: notification.type,
          timestamp: notification.timestamp
        })
      });
    } catch (error) {
      console.error('Error acknowledging notification:', error);
    }
  }

  private scheduleReconnect(): void {
    if (this.connectionStatus.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = this.reconnectDelay * Math.pow(2, this.connectionStatus.reconnectAttempts); // Exponential backoff
    
    console.log(`Scheduling reconnection attempt ${this.connectionStatus.reconnectAttempts + 1} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connectionStatus = {
        ...this.connectionStatus,
        reconnectAttempts: this.connectionStatus.reconnectAttempts + 1
      };
      this.connect();
    }, delay);
  }

  private notifyConnectionStatusChange(): void {
    if (this.onConnectionStatusChanged) {
      this.onConnectionStatusChanged({ ...this.connectionStatus });
    }
  }

  // Event handlers
  public setOnNotificationReceived(callback: (notification: NotificationDto) => void): void {
    this.onNotificationReceived = callback;
  }

  public setOnConnectionStatusChanged(callback: (status: WebSocketConnectionStatus) => void): void {
    this.onConnectionStatusChanged = callback;
  }

  public getConnectionStatus(): WebSocketConnectionStatus {
    return { ...this.connectionStatus };
  }

  public isConnected(): boolean {
    return this.connectionStatus.isConnected;
  }

  // Test method to send a test notification
  public sendTestNotification(username: string, message: string): void {
    if (!this.client || !this.client.connected) {
      console.error('Cannot send test notification: WebSocket not connected');
      return;
    }

    try {
      this.client.publish({
        destination: '/app/test-notification',
        body: JSON.stringify({
          username,
          message,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();