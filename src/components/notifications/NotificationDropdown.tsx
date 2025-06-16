import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { NotificationResponseDto } from '../../types/notification.types';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { state, markAllAsRead } = useNotifications();

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const recentNotifications = state.notifications.slice(0, 8);
  const hasNotifications = recentNotifications.length > 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: '0',
        marginTop: '8px',
        width: '400px',
        maxWidth: '90vw',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e5e7eb',
        zIndex: 1000,
        maxHeight: '500px',
        overflow: 'hidden',
        animation: 'slideDown 0.2s ease-out'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8f9fa'
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🔔 Thông báo
          {state.unreadCount > 0 && (
            <span
              style={{
                background: '#ef4444',
                color: 'white',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {state.unreadCount}
            </span>
          )}
        </h3>

        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Mark All as Read Button */}
          {state.unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#3b82f6',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: '500',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Đánh dấu tất cả đã đọc"
            >
              Đánh dấu tất cả
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Đóng"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {state.isLoading ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6b7280'
            }}
          >
            <div style={{ marginBottom: '8px' }}>⏳</div>
            Đang tải thông báo...
          </div>
        ) : !hasNotifications ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6b7280'
            }}
          >
            <div style={{ marginBottom: '8px', fontSize: '24px' }}>🔕</div>
            <div style={{ fontSize: '14px' }}>Không có thông báo nào</div>
          </div>
        ) : (
          <div>
            {recentNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {hasNotifications && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #f3f4f6',
            background: '#f8f9fa',
            textAlign: 'center'
          }}
        >
          <button
            onClick={() => {
              // Navigate to notifications page (if implemented)
              window.location.href = '/notifications';
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#3b82f6',
              fontSize: '13px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: '500',
              width: '100%',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#eff6ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Xem tất cả thông báo
          </button>
        </div>
      )}

      {/* Connection Status */}
      {!state.connectionStatus.isConnected && (
        <div
          style={{
            padding: '8px 20px',
            background: '#fef2f2',
            borderTop: '1px solid #fecaca',
            fontSize: '12px',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>⚠️</span>
          Mất kết nối thông báo real-time
        </div>
      )}

      {/* CSS Animation */}
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default NotificationDropdown;