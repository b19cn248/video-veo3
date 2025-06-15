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
            gap: '4px', 
            alignItems: 'center',
            flexWrap: 'nowrap',
            overflow: 'visible',
            minWidth: '200px'
        }}>
            <button
                className="btn btn-primary"
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
                onClick={() => onViewDetail(video.id)}
                title="Xem chi tiết"
            >
                👁️
            </button>
            
            <button
                className="btn btn-outline-info"
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
                            height: '28px',
                            minWidth: '32px',
                            padding: '3px 6px'
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