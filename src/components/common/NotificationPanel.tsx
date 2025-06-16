import React, { useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';
import './NotificationPanel.css';

interface NotificationPanelProps {
  onClose?: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { state, actions } = useNotifications();

  useEffect(() => {
    // Load recent notifications when panel opens
    actions.loadRecentNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    await actions.markAllAsRead();
  };

  const handleViewAll = () => {
    // Navigate to notifications page
    window.location.href = '/notifications';
    onClose?.();
  };

  const renderConnectionStatus = () => {
    if (!state.isConnected) {
      return (
        <div className="notification-panel-status disconnected">
          <span className="status-icon">⚠️</span>
          <span className="status-text">Disconnected from notifications</span>
          <button 
            className="reconnect-btn"
            onClick={actions.connect}
            disabled={state.loading}
          >
            Reconnect
          </button>
        </div>
      );
    }

    return (
      <div className="notification-panel-status connected">
        <span className="status-icon">🟢</span>
        <span className="status-text">Connected</span>
      </div>
    );
  };

  const renderHeader = () => (
    <div className="notification-panel-header">
      <div className="header-left">
        <h3 className="panel-title">Notifications</h3>
        {state.unreadCount > 0 && (
          <span className="unread-count">
            {state.unreadCount > 99 ? '99+' : state.unreadCount}
          </span>
        )}
      </div>
      
      <div className="header-actions">
        {state.unreadCount > 0 && (
          <button 
            className="mark-all-read-btn"
            onClick={handleMarkAllAsRead}
            disabled={state.loading}
            title="Mark all as read"
          >
            ✓ All
          </button>
        )}
        
        {onClose && (
          <button 
            className="close-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="notification-panel-empty">
      <div className="empty-icon">📬</div>
      <h4>No notifications</h4>
      <p>You're all caught up!</p>
    </div>
  );

  const renderNotifications = () => {
    if (state.loading && state.recentNotifications.length === 0) {
      return (
        <div className="notification-panel-loading">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      );
    }

    if (state.recentNotifications.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="notification-list">
        {state.recentNotifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={onClose}
            showActions={true}
          />
        ))}
      </div>
    );
  };

  const renderFooter = () => {
    if (state.recentNotifications.length === 0) return null;

    return (
      <div className="notification-panel-footer">
        <button 
          className="view-all-btn"
          onClick={handleViewAll}
        >
          View All Notifications
        </button>
      </div>
    );
  };

  const renderError = () => {
    if (!state.error) return null;

    return (
      <div className="notification-panel-error">
        <span className="error-icon">⚠️</span>
        <span className="error-text">{state.error}</span>
        <button 
          className="retry-btn"
          onClick={() => actions.loadRecentNotifications()}
        >
          Retry
        </button>
      </div>
    );
  };

  return (
    <div className="notification-panel">
      {renderHeader()}
      {renderConnectionStatus()}
      {renderError()}
      
      <div className="notification-panel-content">
        {renderNotifications()}
      </div>
      
      {renderFooter()}
    </div>
  );
};

export default NotificationPanel;