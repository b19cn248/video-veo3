import React from 'react';
import { Video } from '../../../../types/video.types';

interface VideoStaffAssignmentProps {
    video: Video;
    currentUserName?: string;
    isUpdating: boolean;
    onAssignToMe: () => void;
}

const VideoStaffAssignment: React.FC<VideoStaffAssignmentProps> = ({
    video,
    currentUserName,
    isUpdating,
    onAssignToMe
}) => {
    // Kiểm tra xem video đã được assign chưa
    const isVideoAssigned = Boolean(video.assignedStaff && video.assignedStaff.trim() !== '');
    
    // Kiểm tra xem user hiện tại có phải là người được assign không
    const isAssignedToCurrentUser = video.assignedStaff === currentUserName;

    return (
        <div style={{ position: 'relative', minWidth: '120px' }}>
            {!isVideoAssigned ? (
                // Hiển thị nút "Assign to me" khi chưa có ai nhận
                <button
                    onClick={onAssignToMe}
                    disabled={isUpdating || !currentUserName}
                    style={{
                        background: isUpdating ? '#94a3b8' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        minWidth: '100px',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                        if (!isUpdating) {
                            e.currentTarget.style.background = '#2563eb';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isUpdating) {
                            e.currentTarget.style.background = '#3b82f6';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }
                    }}
                    title="Nhận video này để thực hiện"
                >
                    {isUpdating ? (
                        <>⏳ Đang nhận...</>
                    ) : (
                        <>🎯 Nhận việc</>
                    )}
                </button>
            ) : (
                // Hiển thị thông tin nhân viên đã được assign (read-only)
                <div
                    style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        backgroundColor: isAssignedToCurrentUser ? '#dcfce7' : '#f3f4f6',
                        color: isAssignedToCurrentUser ? '#166534' : '#374151',
                        border: `1px solid ${isAssignedToCurrentUser ? '#bbf7d0' : '#e5e7eb'}`,
                        borderRadius: '6px',
                        cursor: 'default',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                    title={isAssignedToCurrentUser ? 'Video được giao cho bạn' : `Video được giao cho ${video.assignedStaff}`}
                >
                    {isAssignedToCurrentUser ? (
                        <>✅ {video.assignedStaff}</>
                    ) : (
                        <>👤 {video.assignedStaff}</>
                    )}
                </div>
            )}
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

export default React.memo(VideoStaffAssignment);