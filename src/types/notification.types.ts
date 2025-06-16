export enum NotificationType {
  VIDEO_NEEDS_URGENT_FIX = 'VIDEO_NEEDS_URGENT_FIX',
  VIDEO_FIXED_COMPLETED = 'VIDEO_FIXED_COMPLETED'
}

export interface NotificationDto {
  videoId: number;
  type: NotificationType;
  title: string;
  message: string;
  customerName: string;
  sender: string;
  recipient: string;
  timestamp: string;
  newStatus: string;
  oldStatus: string;
}

export interface NotificationResponseDto {
  id: number;
  videoId: number;
  type: NotificationType;
  title: string;
  message: string;
  customerName: string;
  sender: string;
  recipient: string;
  newStatus: string;
  oldStatus: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  tenantId: string;
}

export interface NotificationPaginationResponse {
  success: boolean;
  message: string;
  data: NotificationResponseDto[];
  timestamp: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
    isFirst: boolean;
    isLast: boolean;
  };
}

export interface NotificationListResponse {
  success: boolean;
  message: string;
  data: NotificationResponseDto[];
  timestamp: number;
}

export interface NotificationCountResponse {
  success: boolean;
  message: string;
  data: number;
  timestamp: number;
}

export interface NotificationUpdateResponse {
  success: boolean;
  message: string;
  data: NotificationResponseDto;
  timestamp: number;
}

export interface WebSocketConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  lastConnected?: Date;
  reconnectAttempts: number;
}

export interface NotificationState {
  notifications: NotificationResponseDto[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  connectionStatus: WebSocketConnectionStatus;
}

export interface NotificationFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  isRead?: boolean;
}