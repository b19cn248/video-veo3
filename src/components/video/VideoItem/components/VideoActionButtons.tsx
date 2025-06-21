import React from 'react';
import { Video } from '../../../../types/video.types';
import CancelVideoButton from '../../CancelVideoButton/CancelVideoButton';

interface VideoActionButtonsProps {
    video: Video;
    isAdmin: boolean;
    onEdit: (video: Video) => void;
    onDelete: (id: number) => void;
    onViewDetail: (id: number) => void;
    onViewHistory: (videoId: number) => void;
    onVideoUpdate?: (updatedVideo: Video) => void;
}

const VideoActionButtons: React.FC<VideoActionButtonsProps> = ({
    video,
    isAdmin,
    onEdit,
    onDelete,
    onViewDetail,
    onViewHistory,
    onVideoUpdate
}) => {
    return (
        <div style={{ 
            display: 'flex', 
            gap: '3px', // OPTIMIZED: Reduced gap from 4px to 3px
            alignItems: 'center',
            flexWrap: 'nowrap',
            overflow: 'visible',
            minWidth: '170px', // OPTIMIZED: Reduced from 200px to 170px
            maxWidth: '180px' // OPTIMIZED: Ensure buttons fit in allocated space
        }}>
            <button
                className="btn btn-primary"
                style={{
                    padding: '2px 4px', // OPTIMIZED: Reduced padding for smaller buttons
                    fontSize: '11px',
                    minWidth: '28px', // OPTIMIZED: Reduced from 32px to 28px
                    borderRadius: '4px',
                    height: '26px', // OPTIMIZED: Reduced from 28px to 26px
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={() => onViewDetail(video.id)}
                title="Xem chi tiết"
            >
                👁️
            </button>
            
            <button
                className="btn btn-outline-info"
                style={{
                    padding: '2px 4px', // OPTIMIZED: Reduced padding for smaller buttons
                    fontSize: '11px',
                    minWidth: '28px', // OPTIMIZED: Reduced from 32px to 28px
                    borderRadius: '4px',
                    height: '26px', // OPTIMIZED: Reduced from 28px to 26px
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={() => onViewHistory(video.id)}
                title="Xem lịch sử thay đổi"
            >
                📋
            </button>
            
            {/* Edit và Delete button - chỉ hiển thị cho admin */}
            {isAdmin && (
                <>
                    <button
                        className="btn btn-secondary"
                        style={{
                            padding: '3px 6px',
                            fontSize: '11px',
                            minWidth: '32px',
                            borderRadius: '4px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onClick={() => onEdit(video)}
                        title="Sửa đầy đủ"
                    >
                        ✏️
                    </button>
                    
                    {/* Cancel Video Button - chỉ cho admin */}
                    <CancelVideoButton
                        video={video}
                        onVideoUpdate={onVideoUpdate}
                        size="small"
                        style={{
                            height: '26px', // OPTIMIZED: Reduced from 28px to 26px
                            minWidth: '28px', // OPTIMIZED: Reduced from 32px to 28px
                            padding: '2px 4px' // OPTIMIZED: Reduced padding
                        }}
                    />
                    
                    <button
                        className="btn btn-danger"
                        style={{
                            padding: '3px 6px',
                            fontSize: '11px',
                            minWidth: '32px',
                            borderRadius: '4px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onClick={() => onDelete(video.id)}
                        title="Xóa video"
                    >
                        🗑️
                    </button>
                </>
            )}
        </div>
    );
};

export default React.memo(VideoActionButtons);