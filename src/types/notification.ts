export enum NotificationType {
  VIDEO_NEEDS_URGENT_FIX = 'VIDEO_NEEDS_URGENT_FIX',
  VIDEO_FIXED_COMPLETED = 'VIDEO_FIXED_COMPLETED'
}

export interface NotificationDto {
  videoId?: number;
  type: NotificationType;
  title: string;
  message: string;
  customerName?: string;
  sender: string;
  recipient: string;
  timestamp: string;
  newStatus?: string;
  oldStatus?: string;
}

export interface NotificationResponseDto {
  id: number;
  videoId?: number;
  type: NotificationType;
  title: string;
  message: string;
  customerName?: string;
  sender: string;
  recipient: string;
  newStatus?: string;
  oldStatus?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  tenantId: string;
}

export interface NotificationListResponse {
  content: NotificationResponseDto[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface WebSocketMessage {
  type: 'NOTIFICATION' | 'CONNECTION_STATUS' | 'ERROR';
  data: NotificationDto | any;
  timestamp: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export const NotificationTypeDisplayNames: Record<NotificationType, string> = {
  [NotificationType.VIDEO_NEEDS_URGENT_FIX]: 'Video cần sửa gấp',
  [NotificationType.VIDEO_FIXED_COMPLETED]: 'Video đã được sửa xong'
};

export const NotificationTypeColors: Record<NotificationType, string> = {
  [NotificationType.VIDEO_NEEDS_URGENT_FIX]: '#ff4444',
  [NotificationType.VIDEO_FIXED_COMPLETED]: '#4CAF50'
};

export const NotificationTypeIcons: Record<NotificationType, string> = {
  [NotificationType.VIDEO_NEEDS_URGENT_FIX]: '⚠️',
  [NotificationType.VIDEO_FIXED_COMPLETED]: '✅'
};