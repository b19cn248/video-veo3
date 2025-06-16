import axios from 'axios';
import { AuthService } from './authService';
import { 
  NotificationResponseDto, 
  NotificationPaginationResponse, 
  NotificationListResponse, 
  NotificationCountResponse, 
  NotificationUpdateResponse,
  NotificationFilters 
} from '../types/notification.types';

// Cấu hình base URL cho API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://video.openlearnhub.io.vn/api/v1';

// Tạo axios instance riêng cho notification API
const notificationApiClient = axios.create({
  baseURL: `${API_BASE_URL}/notifications`,
  headers: {
    'Content-Type': 'application/json',
    'db': 'video_management'
  },
});

// Request interceptor để tự động thêm Bearer token
notificationApiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AuthService.ensureTokenValid();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers.db = 'video_management';
    } catch (error) {
      console.error('Failed to get valid token for notification request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
notificationApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Notification API error:', error);
    
    if (error.response?.status === 401) {
      console.error('Unauthorized access to notifications');
      AuthService.login();
    }
    
    return Promise.reject(error);
  }
);

export class NotificationService {
  
  /**
   * Lấy danh sách notifications với phân trang
   */
  static async getNotifications(filters: NotificationFilters = {}): Promise<NotificationPaginationResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page !== undefined) params.append('page', filters.page.toString());
      if (filters.size !== undefined) params.append('size', filters.size.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);
      if (filters.isRead !== undefined) params.append('isRead', filters.isRead.toString());

      const response = await notificationApiClient.get(`?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Lấy danh sách notifications gần đây (không phân trang)
   */
  static async getRecentNotifications(limit: number = 10): Promise<NotificationListResponse> {
    try {
      const response = await notificationApiClient.get(`/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      throw new Error('Failed to fetch recent notifications');
    }
  }

  /**
   * Lấy số lượng notifications chưa đọc
   */
  static async getUnreadCount(): Promise<NotificationCountResponse> {
    try {
      const response = await notificationApiClient.get('/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw new Error('Failed to fetch unread count');
    }
  }

  /**
   * Lấy chi tiết một notification
   */
  static async getNotificationById(id: number): Promise<NotificationUpdateResponse> {
    try {
      const response = await notificationApiClient.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notification ${id}:`, error);
      throw new Error(`Failed to fetch notification ${id}`);
    }
  }

  /**
   * Lấy notifications cho một video cụ thể
   */
  static async getNotificationsByVideoId(videoId: number): Promise<NotificationListResponse> {
    try {
      const response = await notificationApiClient.get(`/video/${videoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notifications for video ${videoId}:`, error);
      throw new Error(`Failed to fetch notifications for video ${videoId}`);
    }
  }

  /**
   * Đánh dấu một notification là đã đọc
   */
  static async markAsRead(id: number): Promise<NotificationUpdateResponse> {
    try {
      const response = await notificationApiClient.put(`/${id}/read`);
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw new Error(`Failed to mark notification ${id} as read`);
    }
  }

  /**
   * Đánh dấu tất cả notifications là đã đọc
   */
  static async markAllAsRead(): Promise<{ success: boolean; message: string; timestamp: number }> {
    try {
      const response = await notificationApiClient.put('/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  /**
   * Xóa một notification (soft delete)
   */
  static async deleteNotification(id: number): Promise<{ success: boolean; message: string; timestamp: number }> {
    try {
      const response = await notificationApiClient.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting notification ${id}:`, error);
      throw new Error(`Failed to delete notification ${id}`);
    }
  }

  /**
   * Kiểm tra trạng thái hệ thống WebSocket
   */
  static async getWebSocketStatus(): Promise<{ success: boolean; message: string; data: any; timestamp: number }> {
    try {
      const response = await notificationApiClient.get('/status');
      return response.data;
    } catch (error) {
      console.error('Error checking WebSocket status:', error);
      throw new Error('Failed to check WebSocket status');
    }
  }

  /**
   * Gửi test notification (chỉ dùng trong development)
   */
  static async sendTestNotification(username: string, message: string): Promise<{ success: boolean; message: string; timestamp: number }> {
    try {
      const response = await notificationApiClient.get(`/test?username=${encodeURIComponent(username)}&message=${encodeURIComponent(message)}`);
      return response.data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw new Error('Failed to send test notification');
    }
  }
}

export default NotificationService;