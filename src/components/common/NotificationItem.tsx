import React from 'react';
import { 
  NotificationResponseDto, 
  NotificationTypeDisplayNames, 
  NotificationTypeColors, 
  NotificationTypeIcons,
  NotificationType 
} from '../../types/notification';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatTimeAgo } from '../../utils/dateUtils';
import './NotificationItem.css';

interface NotificationItemProps {
  notification: NotificationResponseDto;
  onClick?: () => void;
  showActions?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onClick,
  showActions = true 
}) => {
  const { actions } = useNotifications();

  const handleItemClick = async () => {
    if (!notification.isRead) {
      await actions.markAsRead(notification.id);
    }
    onClick?.();
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await actions.markAsRead(notification.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this notification?')) {
      await actions.deleteNotification(notification.id);
    }
  };

  const getNotificationIcon = () => {
    return NotificationTypeIcons[notification.type] || '📬';
  };

  const getNotificationColor = () => {
    return NotificationTypeColors[notification.type] || '#6c757d';
  };

  const getStatusBadge = () => {
    if (notification.newStatus) {
      return (
        <span className="status-badge">
          {notification.oldStatus && (
            <span className="old-status">{notification.oldStatus}</span>
          )}
          <span className="arrow">→</span>
          <span className="new-status">{notification.newStatus}</span>
        </span>
      );
    }
    return null;
  };

  const renderNotificationContent = () => {
    return (
      <div className="notification-content">
        <div className="notification-header">
          <h4 className="notification-title">{notification.title}</h4>
          <span className="notification-time">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
        
        <p className="notification-message">{notification.message}</p>
        
        {notification.customerName && (
          <div className="notification-customer">
            <strong>Customer:</strong> {notification.customerName}
          </div>
        )}
        
        {getStatusBadge()}
        
        <div className="notification-meta">
          <span className="notification-sender">From: {notification.sender}</span>
          {notification.videoId && (
            <span className="notification-video">Video ID: {notification.videoId}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`notification-item ${!notification.isRead ? 'unread' : 'read'} ${notification.type.toLowerCase()}`}
      onClick={handleItemClick}
      style={{ '--notification-color': getNotificationColor() } as React.CSSProperties}
    >
      <div className="notification-icon">
        {getNotificationIcon()}
      </div>
      
      {renderNotificationContent()}
      
      {showActions && (
        <div className="notification-actions">
          {!notification.isRead && (
            <button 
              className="action-btn mark-read"
              onClick={handleMarkAsRead}
              title="Mark as read"
            >
              ✓
            </button>
          )}
          
          <button 
            className="action-btn delete"
            onClick={handleDelete}
            title="Delete notification"
          >
            ✕
          </button>
        </div>
      )}
      
      {!notification.isRead && <div className="unread-indicator"></div>}
    </div>
  );
};

export default NotificationItem;