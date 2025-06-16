import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationPanel from './NotificationPanel';
import './NotificationBell.css';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const { state } = useNotifications();
  const [showPanel, setShowPanel] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const prevUnreadCount = useRef(state.unreadCount);

  // Handle clicking outside to close panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setShowPanel(false);
      }
    };

    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPanel]);

  // Animate bell when new notification arrives
  useEffect(() => {
    if (state.unreadCount > prevUnreadCount.current) {
      setHasNewNotification(true);
      const timer = setTimeout(() => setHasNewNotification(false), 2000);
      return () => clearTimeout(timer);
    }
    prevUnreadCount.current = state.unreadCount;
  }, [state.unreadCount]);

  const handleBellClick = () => {
    setShowPanel(!showPanel);
  };

  const getBellIcon = () => {
    if (state.unreadCount > 0) {
      return '🔔'; // Bell with notification
    }
    return '🔕'; // Silent bell
  };

  const getConnectionStatusIcon = () => {
    if (!state.isConnected) {
      return '⚠️';
    }
    return null;
  };

  return (
    <div ref={bellRef} className={`notification-bell-container ${className}`}>
      <div 
        className={`notification-bell ${hasNewNotification ? 'shake' : ''} ${!state.isConnected ? 'disconnected' : ''}`}
        onClick={handleBellClick}
        title={state.isConnected ? 'Notifications' : 'Disconnected from notification service'}
      >
        <span className="bell-icon">{getBellIcon()}</span>
        
        {state.unreadCount > 0 && (
          <span className="notification-badge">
            {state.unreadCount > 99 ? '99+' : state.unreadCount}
          </span>
        )}
        
        {getConnectionStatusIcon() && (
          <span className="connection-status">{getConnectionStatusIcon()}</span>
        )}
      </div>

      {showPanel && (
        <div className="notification-panel-wrapper">
          <NotificationPanel onClose={() => setShowPanel(false)} />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;