// Component hiển thị cảnh báo khi khách hàng đã tồn tại trong hệ thống
// Sử dụng khi tạo mới video để cảnh báo về khả năng trùng đơn

import React from 'react';

interface CustomerWarningProps {
    customerWarning: string | null;
    isVisible: boolean;
    onDismiss?: () => void;
}

/**
 * Component hiển thị cảnh báo khách hàng đã tồn tại
 * 
 * @param customerWarning - Message cảnh báo từ API
 * @param isVisible - Có hiển thị cảnh báo hay không
 * @param onDismiss - Callback khi người dùng dismiss cảnh báo (optional)
 */
const CustomerWarning: React.FC<CustomerWarningProps> = ({
    customerWarning,
    isVisible,
    onDismiss
}) => {
    if (!isVisible || !customerWarning) {
        return null;
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '12px 16px',
            marginTop: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
            animation: 'slideInDown 0.3s ease-out'
        }}>
            {/* Warning Icon */}
            <div style={{
                fontSize: '20px',
                color: '#d97706',
                lineHeight: 1,
                marginTop: '1px',
                flexShrink: 0
            }}>
                ⚠️
            </div>

            {/* Warning Content */}
            <div style={{ flex: 1 }}>
                <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#92400e',
                    marginBottom: '4px'
                }}>
                    Cảnh báo trùng khách hàng
                </div>
                <div style={{
                    fontSize: '13px',
                    color: '#a16207',
                    lineHeight: 1.4
                }}>
                    {customerWarning}
                </div>
            </div>

            {/* Dismiss Button (Optional) */}
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#a16207',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '0',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fbbf24';
                        e.currentTarget.style.color = '#78350f';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                        e.currentTarget.style.color = '#a16207';
                    }}
                    title="Đóng cảnh báo"
                >
                    ×
                </button>
            )}
        </div>
    );
};

export default CustomerWarning;