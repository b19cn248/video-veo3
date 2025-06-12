// Component hiển thị empty state cho video table
// Tách riêng để dễ customize và maintain
// Includes: different states for filtering vs no data

import React from 'react';
import { emptyStateConfig } from '../utils/videoListHelpers';

interface VideoTableEmptyProps {
    isFiltering: boolean;
    isAdmin: boolean;
    colSpan: number;
}

const VideoTableEmpty: React.FC<VideoTableEmptyProps> = ({
                                                             isFiltering,
                                                             isAdmin,
                                                             colSpan
                                                         }) => {
    const config = isFiltering ? emptyStateConfig.filtering : emptyStateConfig.noData;

    return (
        <tr>
            <td colSpan={colSpan} style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6b7280',
                fontSize: '14px'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    {config.icon}
                </div>
                <div>
                    <div style={{ marginBottom: '8px' }}>
                        {config.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {config.subtitle}
                        {!isFiltering && isAdmin && ' bằng cách click "Tạo video mới"'}
                    </div>
                </div>
            </td>
        </tr>
    );
};

export default VideoTableEmpty;