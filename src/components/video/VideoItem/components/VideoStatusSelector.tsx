import React from 'react';
import { VideoStatus } from '../../../../types/video.types';
import { formatVideoStatus, getStatusColor } from '../../../../utils/formatters';

interface VideoStatusSelectorProps {
    status: VideoStatus;
    isUpdating: boolean;
    onChange: (status: VideoStatus) => void;
}

// Helper function để get style cho status select
const getSelectStyle = (status: VideoStatus) => {
    const colorMap = {
        [VideoStatus.CHUA_AI_NHAN]: { color: '#dc2626', backgroundColor: '#fef2f2' },
        [VideoStatus.DANG_LAM]: { color: '#ea580c', backgroundColor: '#fff7ed' },
        [VideoStatus.DA_XONG]: { color: '#16a34a', backgroundColor: '#f0fdf4' },
        [VideoStatus.DANG_SUA]: { color: '#2563eb', backgroundColor: '#eff6ff' },
        [VideoStatus.DA_SUA_XONG]: { color: '#059669', backgroundColor: '#ecfdf5' }
    };
    return colorMap[status] || { color: '#6b7280', backgroundColor: '#f9fafb' };
};

const VideoStatusSelector: React.FC<VideoStatusSelectorProps> = ({
    status,
    isUpdating,
    onChange
}) => {
    return (
        <div style={{ position: 'relative' }}>
            <select
                value={status}
                onChange={(e) => onChange(e.target.value as VideoStatus)}
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
                    ...getSelectStyle(status)
                }}
                className={`status-badge ${getStatusColor(status)}`}
            >
                {Object.values(VideoStatus).map(statusOption => (
                    <option key={statusOption} value={statusOption}>
                        {formatVideoStatus(statusOption)}
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

export default React.memo(VideoStatusSelector);