import React from 'react';
import { DeliveryStatus } from '../../../../types/video.types';
import { formatDeliveryStatus, getStatusColor } from '../../../../utils/formatters';

interface VideoDeliveryStatusSelectorProps {
    status: DeliveryStatus;
    isUpdating: boolean;
    onChange: (status: DeliveryStatus) => void;
}

// Helper function để get style cho delivery status select
const getSelectStyleForDelivery = (status: DeliveryStatus) => {
    const colorMap = {
        [DeliveryStatus.CHUA_GUI]: { color: '#dc2626', backgroundColor: '#fef2f2' },
        [DeliveryStatus.DA_GUI]: { color: '#16a34a', backgroundColor: '#f0fdf4' },
        [DeliveryStatus.CAN_SUA_GAP]: { color: '#ffffff', backgroundColor: '#ff6b35' },
        [DeliveryStatus.HUY]: { color: '#6b7280', backgroundColor: '#f3f4f6' }
    };
    return colorMap[status] || { color: '#6b7280', backgroundColor: '#f9fafb' };
};

const VideoDeliveryStatusSelector: React.FC<VideoDeliveryStatusSelectorProps> = ({
    status,
    isUpdating,
    onChange
}) => {
    return (
        <div style={{ position: 'relative' }}>
            <select
                value={status}
                onChange={(e) => onChange(e.target.value as DeliveryStatus)}
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
                    minWidth: '80px',
                    ...getSelectStyleForDelivery(status)
                }}
                className={`status-badge ${getStatusColor(status)}`}
            >
                {Object.values(DeliveryStatus).map(statusOption => (
                    <option key={statusOption} value={statusOption}>
                        {formatDeliveryStatus(statusOption)}
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

export default React.memo(VideoDeliveryStatusSelector);