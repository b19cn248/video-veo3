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
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
                className="btn btn-primary"
                style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    minWidth: '40px',
                    borderRadius: '4px'
                }}
                onClick={() => onViewDetail(video.id)}
                title="Xem chi tiết"
            >
                👁️
            </button>
            
            <button
                className="btn btn-outline-info"
                style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    minWidth: '40px',
                    borderRadius: '4px'
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
                            padding: '4px 8px',
                            fontSize: '11px',
                            minWidth: '40px',
                            borderRadius: '4px'
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
                    />
                    
                    <button
                        className="btn btn-danger"
                        style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            minWidth: '40px',
                            borderRadius: '4px'
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