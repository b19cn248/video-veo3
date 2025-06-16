import React, {useState, useCallback} from 'react';
import {Video, VideoStatus, DeliveryStatus, PaymentStatus} from '../../../types/video.types';
import {VideoService} from '../../../services/videoService';
import {
    formatPaymentDate
} from '../../../utils/formatters';
import { tableStyles, createRowHoverEffect, formatDisplayName } from '../../video/VideoList/utils/videoListHelpers';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { extractErrorMessage } from '../../../utils/errorUtils';

// Import sub-components
import VideoActionButtons from './components/VideoActionButtons';
import VideoStatusSelector from './components/VideoStatusSelector';
import VideoDeliveryStatusSelector from './components/VideoDeliveryStatusSelector';
import VideoPaymentStatusSelector from './components/VideoPaymentStatusSelector';
import VideoStaffAssignment from './components/VideoStaffAssignment';
import VideoUrlEditor from './components/VideoUrlEditor';

interface VideoItemProps {
    video: Video;
    onEdit: (video: Video) => void;
    onDelete: (id: number) => void;
    onViewDetail: (id: number) => void;
    onViewHistory: (videoId: number) => void;
    onVideoUpdate?: (updatedVideo: Video) => void;
    isAdmin: boolean;
}

// Hàm format thời lượng video đơn giản - chỉ hiển thị số + "s"
const formatSimpleDuration = (seconds: number | undefined): string => {
    if (!seconds && seconds !== 0) return '--';
    return `${seconds}s`;
};

// Hàm validate URL
const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty URL is allowed
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Hàm copy to clipboard với fallback
const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const result = document.execCommand('copy');
            document.body.removeChild(textArea);
            return result;
        }
    } catch (error) {
        console.error('Failed to copy text:', error);
        return false;
    }
};

const VideoItem: React.FC<VideoItemProps> = ({
    video,
    onEdit,
    onDelete,
    onViewDetail,
    onViewHistory,
    onVideoUpdate,
    isAdmin
}) => {
    const { user } = useAuth();
    const { refreshUnreadCount, loadRecentNotifications } = useNotifications();

    // State để tracking việc loading khi update các trạng thái
    const [isUpdatingStaff, setIsUpdatingStaff] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isUpdatingVideoUrl, setIsUpdatingVideoUrl] = useState(false);
    const [isUpdatingDeliveryStatus, setIsUpdatingDeliveryStatus] = useState(false);
    const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);

    // Get user display name
    const userDisplayName = user?.fullName || user?.username;

    // Hàm xử lý assign video cho user hiện tại
    const handleAssignToMe = useCallback(async () => {
        if (!user || !userDisplayName) return;

        setIsUpdatingStaff(true);
        try {
            const response = await VideoService.updateAssignedStaff(video.id, userDisplayName);
            if (response.success && onVideoUpdate) {
                onVideoUpdate(response.data);
                showToast(`Đã nhận video thành công! 🎯`, 'success');
            }
        } catch (error) {
            console.error('Error assigning video to current user:', error);
            const errorMessage = extractErrorMessage(error, 'Lỗi khi nhận video');
            showToast(errorMessage, 'error');
        } finally {
            setIsUpdatingStaff(false);
        }
    }, [user, userDisplayName, video.id, onVideoUpdate]);

    // Hàm xử lý cập nhật trạng thái video
    const handleStatusChange = useCallback(async (newStatus: VideoStatus) => {
        if (newStatus === video.status) return;

        setIsUpdatingStatus(true);
        try {
            const response = await VideoService.updateVideoStatus(video.id, newStatus);
            if (response.success && onVideoUpdate) {
                onVideoUpdate(response.data);
                showToast(`Đã cập nhật trạng thái thành công!`, 'success');
                
                // Refresh notifications if status changed to "Đã sửa xong"
                if (newStatus === VideoStatus.DA_SUA_XONG) {
                    setTimeout(() => {
                        loadRecentNotifications(10);
                        refreshUnreadCount();
                    }, 500); // Small delay to ensure backend notification is processed
                }
            }
        } catch (error) {
            console.error('Error updating video status:', error);
            const errorMessage = extractErrorMessage(error, 'Lỗi khi cập nhật trạng thái');
            showToast(errorMessage, 'error');
        } finally {
            setIsUpdatingStatus(false);
        }
    }, [video.status, video.id, onVideoUpdate, loadRecentNotifications, refreshUnreadCount]);

    // Hàm xử lý cập nhật trạng thái giao hàng
    const handleDeliveryStatusChange = useCallback(async (newStatus: DeliveryStatus) => {
        if (newStatus === video.deliveryStatus) return;

        setIsUpdatingDeliveryStatus(true);
        try {
            const response = await VideoService.updateDeliveryStatus(video.id, newStatus);
            if (response.success && onVideoUpdate) {
                onVideoUpdate(response.data);
                showToast(`Đã cập nhật trạng thái giao hàng!`, 'success');
                
                // Refresh notifications if status changed to "Cần sửa gấp"
                if (newStatus === DeliveryStatus.CAN_SUA_GAP) {
                    setTimeout(() => {
                        loadRecentNotifications(10);
                        refreshUnreadCount();
                    }, 500); // Small delay to ensure backend notification is processed
                }
            }
        } catch (error) {
            console.error('Error updating delivery status:', error);
            const errorMessage = extractErrorMessage(error, 'Lỗi khi cập nhật trạng thái giao hàng');
            showToast(errorMessage, 'error');
        } finally {
            setIsUpdatingDeliveryStatus(false);
        }
    }, [video.deliveryStatus, video.id, onVideoUpdate, loadRecentNotifications, refreshUnreadCount]);

    // Hàm xử lý cập nhật trạng thái thanh toán
    const handlePaymentStatusChange = useCallback(async (newStatus: PaymentStatus) => {
        if (newStatus === video.paymentStatus) return;

        setIsUpdatingPaymentStatus(true);
        try {
            const response = await VideoService.updatePaymentStatus(video.id, newStatus);
            if (response.success && onVideoUpdate) {
                onVideoUpdate(response.data);
                showToast(`Đã cập nhật trạng thái thanh toán!`, 'success');
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            const errorMessage = extractErrorMessage(error, 'Lỗi khi cập nhật trạng thái thanh toán');
            showToast(errorMessage, 'error');
        } finally {
            setIsUpdatingPaymentStatus(false);
        }
    }, [video.paymentStatus, video.id, onVideoUpdate]);

    // Hàm xử lý copy video URL
    const handleCopyVideoUrl = useCallback(async () => {
        if (!video.videoUrl || !video.videoUrl.trim()) {
            showToast('Không có link video để copy', 'error');
            return;
        }

        const success = await copyToClipboard(video.videoUrl);
        if (success) {
            showToast('Đã copy link video!', 'success');
        } else {
            showToast('Không thể copy link. Vui lòng copy thủ công.', 'error');
        }
    }, [video.videoUrl]);

    // Hàm xử lý cập nhật video URL
    const handleVideoUrlUpdate = useCallback(async (newUrl: string) => {
        if (newUrl === (video.videoUrl || '')) return;

        setIsUpdatingVideoUrl(true);
        try {
            const response = await VideoService.updateVideoUrl(video.id, newUrl);
            if (response.success && onVideoUpdate) {
                onVideoUpdate(response.data);
                showToast(
                    newUrl ? 'Đã cập nhật link video' : 'Đã xóa link video',
                    'success'
                );
            }
        } catch (error) {
            console.error('Error updating video URL:', error);
            const errorMessage = extractErrorMessage(error, 'Lỗi khi cập nhật link video');
            showToast(errorMessage, 'error');
        } finally {
            setIsUpdatingVideoUrl(false);
        }
    }, [video.videoUrl, video.id, onVideoUpdate]);

    // Hàm hiển thị toast notification đơn giản
    const showToast = (message: string, type: 'success' | 'error') => {
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

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    };

    return (
        <tr style={tableStyles.bodyRow} {...createRowHoverEffect()}>
            <td style={{
                ...tableStyles.bodyCell,
                fontWeight: '600',
                color: '#374151'
            }}>
                #{video.id}
            </td>

            {/* Cột khách hàng - chỉ hiển thị cho admin */}
            {isAdmin && (
                <td style={{
                    ...tableStyles.bodyCell,
                    fontWeight: '500',
                    color: '#1f2937'
                }}>
                    {formatDisplayName(video.customerName)}
                </td>
            )}

            {/* Cột người tạo - hiển thị cho tất cả người dùng */}
            <td style={{
                ...tableStyles.bodyCell,
                fontSize: '12px',
                color: '#64748b',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontStyle: video.createdBy ? 'normal' : 'italic'
            }}>
                {formatDisplayName(video.createdBy)}
            </td>

            {/* Cột thời lượng - hiển thị cho tất cả người dùng */}
            <td style={{
                ...tableStyles.bodyCell,
                fontSize: '13px',
                fontWeight: '500',
                color: video.videoDuration ? '#374151' : '#9ca3af',
                textAlign: 'center'
            }}>
                {formatSimpleDuration(video.videoDuration)}
            </td>

            {/* Status Selector */}
            <td style={tableStyles.bodyCell}>
                <VideoStatusSelector
                    status={video.status}
                    isUpdating={isUpdatingStatus}
                    onChange={handleStatusChange}
                />
            </td>

            {/* Staff Assignment */}
            <td style={tableStyles.bodyCell}>
                <VideoStaffAssignment
                    video={video}
                    currentUserName={userDisplayName}
                    isUpdating={isUpdatingStaff}
                    onAssignToMe={handleAssignToMe}
                />
            </td>


            {/* Delivery Status Selector */}
            <td style={tableStyles.bodyCell}>
                <VideoDeliveryStatusSelector
                    status={video.deliveryStatus}
                    isUpdating={isUpdatingDeliveryStatus}
                    onChange={handleDeliveryStatusChange}
                />
            </td>

            {/* Payment Status Selector */}
            <td style={tableStyles.bodyCell}>
                <VideoPaymentStatusSelector
                    status={video.paymentStatus}
                    isUpdating={isUpdatingPaymentStatus}
                    onChange={handlePaymentStatusChange}
                />
            </td>

            {/* Payment Date Column */}
            <td style={{
                ...tableStyles.bodyCell,
                fontSize: '12px',
                color: video.paymentDate ? '#059669' : '#64748b',
                backgroundColor: video.paymentDate ? '#f0fdf4' : 'transparent',
                textAlign: 'center',
                fontWeight: video.paymentDate ? '500' : '400'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                }}>
                    {video.paymentDate ? (
                        <>
                            <span>📅</span>
                            <span>{formatPaymentDate(video.paymentDate)}</span>
                        </>
                    ) : (
                        <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Chưa có</span>
                    )}
                </div>
            </td>

            {/* Video URL Editor */}
            <td style={tableStyles.bodyCell}>
                <VideoUrlEditor
                    videoUrl={video.videoUrl}
                    isUpdating={isUpdatingVideoUrl}
                    onUpdate={handleVideoUrlUpdate}
                    onCopy={handleCopyVideoUrl}
                />
            </td>

            {/* Action Buttons */}
            <td style={{
                ...tableStyles.bodyCell,
                overflow: 'visible',
                position: 'relative'
            }}>
                <VideoActionButtons
                    video={video}
                    isAdmin={isAdmin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewDetail={onViewDetail}
                    onViewHistory={onViewHistory}
                    onVideoUpdate={onVideoUpdate}
                />
            </td>
        </tr>
    );
};

export default React.memo(VideoItem);