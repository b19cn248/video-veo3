import React from 'react';
import { PaymentStatus } from '../../../../types/video.types';
import { formatPaymentStatus, getStatusColor } from '../../../../utils/formatters';

interface VideoPaymentStatusSelectorProps {
    status: PaymentStatus;
    isUpdating: boolean;
    onChange: (status: PaymentStatus) => void;
}

// Helper function để get style cho payment status select
const getSelectStyleForPayment = (status: PaymentStatus) => {
    const colorMap = {
        [PaymentStatus.CHUA_THANH_TOAN]: { color: '#dc2626', backgroundColor: '#fef2f2' },
        [PaymentStatus.DA_THANH_TOAN]: { color: '#16a34a', backgroundColor: '#f0fdf4' },
        [PaymentStatus.BUNG]: { color: '#dc2626', backgroundColor: '#fef2f2' }
    };
    return colorMap[status] || { color: '#6b7280', backgroundColor: '#f9fafb' };
};

const VideoPaymentStatusSelector: React.FC<VideoPaymentStatusSelectorProps> = ({
    status,
    isUpdating,
    onChange
}) => {
    return (
        <div style={{ position: 'relative' }}>
            <select
                value={status}
                onChange={(e) => onChange(e.target.value as PaymentStatus)}
                disabled={isUpdating}
                style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    appearance: 'none',
                    width: '100%',
                    minWidth: '100px',
                    ...getSelectStyleForPayment(status)
                }}
                className={`status-badge ${getStatusColor(status)}`}
            >
                {Object.values(PaymentStatus).map(statusOption => (
                    <option key={statusOption} value={statusOption}>
                        {formatPaymentStatus(statusOption)}
                    </option>
                ))}
            </select>
            {isUpdating && (
                <div style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '10px'
                }}>
                    ⏳
                </div>
            )}
        </div>
    );
};

export default React.memo(VideoPaymentStatusSelector);