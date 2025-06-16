import React from 'react';
import { NotificationResponseDto, NotificationType } from '../../types/notification.types';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface NotificationItemProps {
  notification: NotificationResponseDto;
  onClose?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const { markAsRead, deleteNotification } = useNotifications();

  const handleClick = async () => {
    // Mark as read if not already read
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to video detail
    if (onClose) onClose();
    window.location.href = `/videos/${notification.videoId}`;
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAsRead(notification.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(notification.id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case NotificationType.VIDEO_NEEDS_URGENT_FIX:
        return '🚨';
      case NotificationType.VIDEO_FIXED_COMPLETED:
        return '✅';
      default:
        return '📢';
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case NotificationType.VIDEO_NEEDS_URGENT_FIX:
        return '#dc2626'; // Red
      case NotificationType.VIDEO_FIXED_COMPLETED:
        return '#059669'; // Green
      default:
        return '#3b82f6'; // Blue
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt));

  return (
    <div
      onClick={handleClick}
      style={{
        padding: '16px 20px',
        borderBottom: '1px solid #f3f4f6',
        cursor: 'pointer',
        background: notification.isRead ? 'white' : '#f0f9ff',
        transition: 'background-color 0.2s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = notification.isRead ? '#f9fafb' : '#e0f2fe';
        // Show actions on hover
        const actions = e.currentTarget.querySelector('.notification-actions') as HTMLElement;
        if (actions) {
          actions.style.opacity = '1';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = notification.isRead ? 'white' : '#f0f9ff';
        // Hide actions when not hovering
        const actions = e.currentTarget.querySelector('.notification-actions') as HTMLElement;
        if (actions) {
          actions.style.opacity = '0';
        }
      }}
    >
      {/* Unread Indicator */}
      {!notification.isRead && (
        <div
          style={{
            position: 'absolute',
            left: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: getNotificationColor()
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingLeft: notification.isRead ? '0' : '16px' }}>
        {/* Icon */}
        <div
          style={{
            fontSize: '20px',
            flexShrink: 0,
            marginTop: '2px'
          }}
        >
          {getNotificationIcon()}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <div
            style={{
              fontSize: '14px',
              fontWeight: notification.isRead ? '500' : '600',
              color: '#1f2937',
              marginBottom: '4px',
              lineHeight: '1.3'
            }}
          >
            {notification.title}
          </div>

          {/* Message */}
          <div
            style={{
              fontSize: '13px',
              color: '#6b7280',
              marginBottom: '6px',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {notification.message}
          </div>

          {/* Meta info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#9ca3af'
            }}
          >
            <span>👤 {notification.sender}</span>
            <span>•</span>
            <span>🎥 Video #{notification.videoId}</span>
            <span>•</span>
            <span>⏰ {timeAgo}</span>
          </div>

          {/* Status change info */}
          {notification.oldStatus && notification.newStatus && (
            <div
              style={{
                marginTop: '6px',
                fontSize: '12px',
                color: '#6b7280',
                background: '#f3f4f6',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block'
              }}
            >
              {notification.oldStatus} → {notification.newStatus}
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            opacity: 0,
            transition: 'opacity 0.2s ease'
          }}
          className="notification-actions"
        >
          {!notification.isRead && (
            <button
              onClick={handleMarkAsRead}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                color: '#6b7280',
                fontSize: '12px'
              }}
              title="Đánh dấu đã đọc"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            </button>
          )}

          <button
            onClick={handleDelete}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: '#ef4444',
              fontSize: '12px'
            }}
            title="Xóa thông báo"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
};

export default NotificationItem;