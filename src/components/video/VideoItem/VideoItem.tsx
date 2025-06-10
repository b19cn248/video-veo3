// Component hiển thị một dòng video trong table với khả năng inline editing
// Cho phép cập nhật nhanh assigned staff và status trực tiếp trong bảng

import React, { useState } from 'react';
import { Video, VideoStatus } from '../../../types/video.types';
import { VideoService } from '../../../services/videoService';
import { formatVideoStatus, formatDate, formatDeliveryStatus, formatPaymentStatus, getStatusColor } from '../../../utils/formatters';

interface VideoItemProps {
    video: Video;                          // Dữ liệu video
    onEdit: (video: Video) => void;        // Hàm gọi khi click sửa
    onDelete: (id: number) => void;        // Hàm gọi khi click xóa
    onViewDetail: (id: number) => void;    // Hàm gọi khi click xem chi tiết
    onVideoUpdate?: (updatedVideo: Video) => void; // Callback khi video được cập nhật
}

const STAFF_LIST = ["", "Hiếu", "Đăng", "Công", "Khánh", "Cường"]; // Thêm option trống để có thể bỏ assign

// Hàm format thời lượng video đơn giản - chỉ hiển thị số + "s"
const formatSimpleDuration = (seconds: number | undefined): string => {
    if (!seconds && seconds !== 0) return '--';
    return `${seconds}s`;
};

const VideoItem: React.FC<VideoItemProps> = ({
                                                 video,
                                                 onEdit,
                                                 onDelete,
                                                 onViewDetail,
                                                 onVideoUpdate
                                             }) => {
    // State để tracking việc loading khi update
    const [isUpdatingStaff, setIsUpdatingStaff] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Hàm xử lý cập nhật nhân viên
    const handleStaffChange = async (newStaff: string) => {
        if (newStaff === video.assignedStaff) return; // Không thay đổi

        setIsUpdatingStaff(true);
        try {
            const response = await VideoService.updateAssignedStaff(video.id, newStaff);
            if (response.success && onVideoUpdate) {
                onVideoUpdate(response.data);
                // Hiển thị toast notification nhẹ nhàng
                showToast(`Đã cập nhật nhân viên: ${newStaff || 'Không có'}`, 'success');
            }
        } catch (error) {
            console.error('Error updating assigned staff:', error);
            showToast('Lỗi khi cập nhật nhân viên', 'error');
        } finally {
            setIsUpdatingStaff(false);
        }
    };

    // Hàm xử lý cập nhật trạng thái
    const handleStatusChange = async (newStatus: VideoStatus) => {
        if (newStatus === video.status) return; // Không thay đổi

        setIsUpdatingStatus(true);
        try {
            const response = await VideoService.updateVideoStatus(video.id, newStatus);
            if (response.success && onVideoUpdate) {
                onVideoUpdate(response.data);
                // Hiển thị toast notification nhẹ nhàng
                showToast(`Đã cập nhật trạng thái: ${formatVideoStatus(newStatus)}`, 'success');
            }
        } catch (error) {
            console.error('Error updating video status:', error);
            showToast('Lỗi khi cập nhật trạng thái', 'error');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Hàm hiển thị toast notification đơn giản
    const showToast = (message: string, type: 'success' | 'error') => {
        // Tạo toast element
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
            background-color: ${type === 'success' ? '#10B981' : '#EF4444'};
        `;

        document.body.appendChild(toast);

        // Auto remove sau 3 giây
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    };

    return (
        <tr>
            <td>{video.id}</td>
            <td>{video.customerName}</td>

            {/* Inline Status Selector */}
            <td>
                <div style={{ position: 'relative' }}>
                    <select
                        value={video.status}
                        onChange={(e) => handleStatusChange(e.target.value as VideoStatus)}
                        disabled={isUpdatingStatus}
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
                            ...getSelectStyle(video.status)
                        }}
                        className={`status-badge ${getStatusColor(video.status)}`}
                    >
                        {Object.values(VideoStatus).map(status => (
                            <option key={status} value={status}>
                                {formatVideoStatus(status)}
                            </option>
                        ))}
                    </select>
                    {isUpdatingStatus && (
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
            </td>

            {/* Inline Staff Selector */}
            <td>
                <div style={{ position: 'relative' }}>
                    <select
                        value={video.assignedStaff || ''}
                        onChange={(e) => handleStaffChange(e.target.value)}
                        disabled={isUpdatingStaff}
                        style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            minWidth: '80px',
                            background: 'white',
                            color: video.assignedStaff ? '#374151' : '#9ca3af'
                        }}
                    >
                        <option value="">Chưa giao</option>
                        {STAFF_LIST.slice(1).map(staff => (
                            <option key={staff} value={staff}>{staff}</option>
                        ))}
                    </select>
                    {isUpdatingStaff && (
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
            </td>

            <td>{formatSimpleDuration(video.videoDuration)}</td>
            <td>{formatDate(video.createdAt || '')}</td>
            <td>
                <span className={`status-badge ${getStatusColor(video.deliveryStatus)}`}>
                    {formatDeliveryStatus(video.deliveryStatus)}
                </span>
            </td>
            <td>
                <span className={`status-badge ${getStatusColor(video.paymentStatus)}`}>
                    {formatPaymentStatus(video.paymentStatus)}
                </span>
            </td>
            <td>
                <div style={{ display: 'flex', gap: '6px' }}>
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
                </div>
            </td>
        </tr>
    );
};

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

export default VideoItem;