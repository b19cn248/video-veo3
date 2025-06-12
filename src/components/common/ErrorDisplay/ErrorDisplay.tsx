// Component hiển thị lỗi một cách nhất quán trong toàn bộ ứng dụng
// Hỗ trợ nhiều kiểu hiển thị khác nhau và có thể tùy chỉnh

import React from 'react';

interface ErrorDisplayProps {
    /** Message lỗi cần hiển thị */
    message: string;
    /** Loại lỗi để áp dụng style phù hợp */
    type?: 'error' | 'warning' | 'info';
    /** Có hiển thị icon không */
    showIcon?: boolean;
    /** Custom icon thay thế icon mặc định */
    customIcon?: string;
    /** Có thể đóng được không */
    dismissible?: boolean;
    /** Callback khi người dùng đóng error */
    onDismiss?: () => void;
    /** Custom style cho container */
    style?: React.CSSProperties;
    /** Custom className */
    className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    message,
    type = 'error',
    showIcon = true,
    customIcon,
    dismissible = false,
    onDismiss,
    style,
    className
}) => {
    // Cấu hình style cho từng loại lỗi
    const getTypeConfig = () => {
        switch (type) {
            case 'warning':
                return {
                    background: '#fffbeb',
                    border: '1px solid #fed7aa',
                    color: '#92400e',
                    icon: '⚠️'
                };
            case 'info':
                return {
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1e40af',
                    icon: 'ℹ️'
                };
            case 'error':
            default:
                return {
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    icon: '⚠️'
                };
        }
    };

    const typeConfig = getTypeConfig();
    const icon = customIcon || typeConfig.icon;

    return (
        <div
            className={className}
            style={{
                background: typeConfig.background,
                border: typeConfig.border,
                color: typeConfig.color,
                padding: '12px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                lineHeight: '1.5',
                ...style
            }}
        >
            {/* Icon */}
            {showIcon && (
                <span style={{ fontSize: '16px', flexShrink: 0 }}>
                    {icon}
                </span>
            )}

            {/* Message */}
            <span style={{ flex: 1 }}>
                {message}
            </span>

            {/* Dismiss button */}
            {dismissible && onDismiss && (
                <button
                    onClick={onDismiss}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        opacity: 0.7,
                        transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                    title="Đóng"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export default ErrorDisplay;
