import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from '../common/NotificationItem';
import { NotificationFilters } from '../../types/notification';
import './NotificationPage.css';

const NotificationPage: React.FC = () => {
  const { state, actions } = useNotifications();
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [filters.isRead, filters.sortBy, filters.sortDirection]);

  const loadNotifications = async () => {
    await actions.loadNotifications();
  };

  const loadMoreNotifications = async () => {
    if (state.loading || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      // This would need pagination support in the context
      // For now, we'll just reload with increased size
      const newFilters = {
        ...filters,
        size: (filters.size || 20) + 20
      };
      setFilters(newFilters);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<NotificationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  };

  const handleMarkAllAsRead = async () => {
    if (window.confirm('Mark all notifications as read?')) {
      await actions.markAllAsRead();
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Delete all notifications? This action cannot be undone.')) {
      // This would need a deleteAll API endpoint
      console.log('Delete all notifications - not implemented yet');
    }
  };

  const renderHeader = () => (
    <div className="notification-page-header">
      <div className="header-left">
        <h1 className="page-title">Notifications</h1>
        <div className="notification-stats">
          <span className="total-count">
            Total: {state.notifications.length}
          </span>
          {state.unreadCount > 0 && (
            <span className="unread-count-badge">
              {state.unreadCount} unread
            </span>
          )}
        </div>
      </div>

      <div className="header-actions">
        {state.unreadCount > 0 && (
          <button 
            className="btn btn-primary"
            onClick={handleMarkAllAsRead}
            disabled={state.loading}
          >
            Mark All Read
          </button>
        )}
        
        <button 
          className="btn btn-secondary"
          onClick={handleDeleteAll}
          disabled={state.loading}
        >
          Clear All
        </button>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="notification-filters">
      <div className="filter-group">
        <label>Status:</label>
        <select 
          value={filters.isRead === undefined ? 'all' : filters.isRead ? 'read' : 'unread'}
          onChange={(e) => {
            const value = e.target.value;
            const isRead = value === 'all' ? undefined : value === 'read';
            handleFilterChange({ isRead });
          }}
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Sort by:</label>
        <select 
          value={filters.sortBy || 'createdAt'}
          onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
        >
          <option value="createdAt">Date Created</option>
          <option value="title">Title</option>
          <option value="type">Type</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Order:</label>
        <select 
          value={filters.sortDirection || 'desc'}
          onChange={(e) => handleFilterChange({ sortDirection: e.target.value as 'asc' | 'desc' })}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      <div className="filter-actions">
        <button 
          className="btn btn-outline refresh-btn"
          onClick={loadNotifications}
          disabled={state.loading}
          title="Refresh notifications"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );

  const renderConnectionStatus = () => {
    if (!state.isConnected) {
      return (
        <div className="connection-status-banner disconnected">
          <span className="status-icon">⚠️</span>
          <span className="status-text">
            Disconnected from notification service. Real-time updates are not available.
          </span>
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
      <div className="connection-status-banner connected">
        <span className="status-icon">🟢</span>
        <span className="status-text">Connected - Real-time notifications active</span>
      </div>
    );
  };

  const renderNotificationList = () => {
    if (state.loading && state.notifications.length === 0) {
      return (
        <div className="notification-loading">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      );
    }

    if (state.notifications.length === 0) {
      return (
        <div className="notification-empty">
          <div className="empty-icon">📬</div>
          <h3>No notifications</h3>
          <p>You don't have any notifications yet.</p>
        </div>
      );
    }

    return (
      <div className="notification-list-container">
        <div className="notification-list">
          {state.notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              showActions={true}
            />
          ))}
        </div>

        {state.notifications.length >= (filters.size || 20) && (
          <div className="load-more-container">
            <button 
              className="btn btn-outline load-more-btn"
              onClick={loadMoreNotifications}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderError = () => {
    if (!state.error) return null;

    return (
      <div className="notification-error">
        <span className="error-icon">⚠️</span>
        <span className="error-text">{state.error}</span>
        <button 
          className="retry-btn"
          onClick={loadNotifications}
        >
          Retry
        </button>
      </div>
    );
  };

  return (
    <div className="notification-page">
      {renderHeader()}
      {renderConnectionStatus()}
      {renderFilters()}
      {renderError()}
      {renderNotificationList()}
    </div>
  );
};

export default NotificationPage;