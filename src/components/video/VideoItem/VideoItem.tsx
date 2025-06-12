// Component hiển thị một dòng video trong table với khả năng inline editing
// Cho phép cập nhật nhanh assigned staff, status, video URL, delivery status và payment status trực tiếp trong bảng
// UPDATED: Thay đổi logic assign staff từ dropdown thành nút "Assign to me"
// UPDATED: Thêm button copy link video với UX tối ưu

import React, {useState} from 'react';
import {Video, VideoStatus, DeliveryStatus, PaymentStatus} from '../../../types/video.types';
import {VideoService} from '../../../services/videoService';
import {
    formatDate,
    formatDeliveryStatus,
    formatPaymentStatus,
    formatVideoStatus,
    getStatusColor
} from '../../../utils/formatters';
import { useAuth } from '../../../contexts/AuthContext';
import { extractErrorMessage } from '../../../utils/errorUtils';

interface VideoItemProps {
    video: Video;                          // Dữ liệu video
    onEdit: (video: Video) => void;        // Hàm gọi khi click sửa
    onDelete: (id: number) => void;        // Hàm gọi khi click xóa
    onViewDetail: (id: number) => void;    // Hàm gọi khi click xem chi tiết
    onVideoUpdate?: (updatedVideo: Video) => void; // Callback khi video được cập nhật
    isAdmin: boolean;                      // Kiểm tra quyền admin
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
        // Thử sử dụng modern Clipboard API trước
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback cho browsers cũ hoặc không secure context
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
                                                 onVideoUpdate,
                                                 isAdmin
                                             }) => {
    // Get current user info từ AuthContext
    const { user } = useAuth();

    // State để tracking việc loading khi update các trạng thái
    const [isUpdatingStaff, setIsUpdatingStaff] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isUpdatingVideoUrl, setIsUpdatingVideoUrl] = useState(false);
    const [isUpdatingDeliveryStatus, setIsUpdatingDeliveryStatus] = useState(false);
    const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);

    // State cho video URL editing
    const [editingVideoUrl, setEditingVideoUrl] = useState(false);
    const [tempVideoUrl, setTempVideoUrl] = useState(video.videoUrl || '');
    const [urlError, setUrlError] = useState('');

    // Kiểm tra xem video đã được assign chưa
    const isVideoAssigned = Boolean(video.assignedStaff && video.assignedStaff.trim() !== '');

    // Kiểm tra xem user hiện tại có phải là người được assign không
    const isAssignedToCurrentUser = video.assignedStaff === user?.fullName || video.assignedStaff === user?.username;

    // Hàm xử lý assign video cho user hiện tại
    const handleAssignToMe = async () => {
        if (!user || isVideoAssigned) return;

        const userDisplayName = user.fullName || user.username || 'Unknown User';

        setIsUpdatingStaff(true);
        try {
            const response = await VideoService.updateAssignedStaff(video.id, userDisplayName);
            if (response.success && onVideoUpdate) {
                onVideoUpdate(response.data);
                // Hiển thị toast notification
                showToast(`Đã nhận video thành công! 🎯`, 'success');
            }
        } catch (error) {
            console.error('Error assigning video to current user:', error);
            const errorMessage = extractErrorMessage(error, 'Lỗi khi nhận video');
            showToast(errorMessage, 'error');
        } finally {
            setIsUpdatingStaff(false);
        }
    };

    // Hàm xử lý cập nhật trạng thái video - cho tất cả user
    const handleStatusChange = async (newStatus: VideoStatus) => {
        if (newStatus === video.status) return; // Không thay đổi

        setIsUpdatingStatus(true);
        try {
            const response = await VideoService.updateVideoStatus(video.id, newStatus);
            if (response.success && onVideoUpdate) {
                onVideoUpdate(response.data);
                showToast(`Đã cập nhật trạng thái: ${formatVideoStatus(newStatus)}`, 'success');
            }
        } catch (error) {
            console.error('Error updating video status:', error);
            const errorMessage = extractErrorMessage(error, 'Lỗi khi cập nhật trạng thái');
            showToast(errorMessage, 'error');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Hàm xử lý cập nhật trạng thái giao hàng - cho tất cả user
    const handleDeliveryStatusChange = async (newStatus: DeliveryStatus) => {
        if (newStatus === video.deliveryStatus) return; // Không thay đổi

        setIsUpdatingDeliveryStatus(true);
        try {
            const response = await VideoService.updateDeliveryStatus(video.id, newStatus);
            if (response.success && onVideoUpdate) {
                onVideoUpdate(response.data);
                showToast(`Đã cập nhật trạng thái giao hàng: ${formatDeliveryStatus(newStatus)}`, 'success');
            }
        } catch (error) {
            console.error('Error updating delivery status:', error);
            const errorMessage = extractErrorMessage(error, 'Lỗi khi cập nhật trạng thái giao hàng');
            showToast(errorMessage, 'error');
        } finally {
            setIsUpdatingDeliveryStatus(false);
        }
    };

    // Hàm xử lý cập nhật trạng thái thanh toán - cho tất cả user
    const handlePaymentStatusChange = async (newStatus: PaymentStatus) => {
        if (newStatus === video.paymentStatus) return; // Không thay đổi

        setIsUpdatingPaymentStatus(true);
        try {
            const response = await VideoService.updatePaymentStatus(video.id, newStatus);
            if (response.success && onVideoUpdate) {
                onVideoUpdate(response.data);
                showToast(`Đã cập nhật trạng thái thanh toán: ${formatPaymentStatus(newStatus)}`, 'success');
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            const errorMessage = extractErrorMessage(error, 'Lỗi khi cập nhật trạng thái thanh toán');
            showToast(errorMessage, 'error');
        } finally {
            setIsUpdatingPaymentStatus(false);
        }
    };

    // Hàm xử lý copy video URL
    const handleCopyVideoUrl = async () => {
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
    };

    // Hàm xử lý khi bắt đầu edit video URL - cho tất cả user
    const handleVideoUrlEditStart = () => {
        setEditingVideoUrl(true);
        setTempVideoUrl(video.videoUrl || '');
        setUrlError('');
    };

    // Hàm xử lý khi hủy edit video URL
    const handleVideoUrlEditCancel = () => {
        setEditingVideoUrl(false);
        setTempVideoUrl(video.videoUrl || '');
        setUrlError('');
    };

    // Hàm xử lý khi thay đổi video URL
    const handleVideoUrlChange = (newUrl: string) => {
        setTempVideoUrl(newUrl);

        // Validate URL realtime
        if (newUrl.trim() && !isValidUrl(newUrl)) {
            setUrlError('URL không hợp lệ');
        } else {
            setUrlError('');
        }
    };

    // Hàm xử lý cập nhật video URL - cho tất cả user
    const handleVideoUrlUpdate = async () => {
        const trimmedUrl = tempVideoUrl.trim();

        // Validate URL
        if (trimmedUrl && !isValidUrl(trimmedUrl)) {
            setUrlError('URL không hợp lệ');
            return;
        }

        // Nếu URL không thay đổi
        if (trimmedUrl === (video.videoUrl || '')) {
            setEditingVideoUrl(false);
            return;
        }

        setIsUpdatingVideoUrl(true);
        try {
            const response = await VideoService.updateVideoUrl(video.id, trimmedUrl);
            if (response.success && onVideoUpdate) {
                onVideoUpdate(response.data);
                setEditingVideoUrl(false);
                showToast(
                    trimmedUrl ? 'Đã cập nhật link video' : 'Đã xóa link video',
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
    };

    // Hàm xử lý key press trong input video URL
    const handleVideoUrlKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleVideoUrlUpdate();
        } else if (e.key === 'Escape') {
            handleVideoUrlEditCancel();
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
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    };

    return (
        <tr>
            <td>{video.id}</td>

            {/* Cột khách hàng - chỉ hiển thị cho admin */}
            {isAdmin && <td>{video.customerName}</td>}

            {/* Cột người tạo - chỉ hiển thị cho admin */}
            {isAdmin && (
                <td style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {video.createdBy || '--'}
                </td>
            )}

            {/* Inline Status Selector - cho tất cả user */}
            <td>
                <div style={{position: 'relative'}}>
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

            {/* Staff Assignment Column - UPDATED: Assign to me logic */}
            <td>
                <div style={{position: 'relative', minWidth: '120px'}}>
                    {!isVideoAssigned ? (
                        // Hiển thị nút "Assign to me" khi chưa có ai nhận
                        <button
                            onClick={handleAssignToMe}
                            disabled={isUpdatingStaff || !user}
                            style={{
                                background: isUpdatingStaff ? '#94a3b8' : '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '11px',
                                cursor: isUpdatingStaff ? 'not-allowed' : 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                minWidth: '100px',
                                justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                                if (!isUpdatingStaff) {
                                    e.currentTarget.style.background = '#2563eb';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isUpdatingStaff) {
                                    e.currentTarget.style.background = '#3b82f6';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                            title="Nhận video này để thực hiện"
                        >
                            {isUpdatingStaff ? (
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
            <td>{video.orderValue}</td>
            <td>{formatDate(video.createdAt || '')}</td>

            {/* Inline Delivery Status Selector - cho tất cả user */}
            <td>
                <div style={{position: 'relative'}}>
                    <select
                        value={video.deliveryStatus}
                        onChange={(e) => handleDeliveryStatusChange(e.target.value as DeliveryStatus)}
                        disabled={isUpdatingDeliveryStatus}
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
                            ...getSelectStyleForDelivery(video.deliveryStatus)
                        }}
                        className={`status-badge ${getStatusColor(video.deliveryStatus)}`}
                    >
                        {Object.values(DeliveryStatus).map(status => (
                            <option key={status} value={status}>
                                {formatDeliveryStatus(status)}
                            </option>
                        ))}
                    </select>
                    {isUpdatingDeliveryStatus && (
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

            {/* Inline Payment Status Selector - cho tất cả user */}
            <td>
                <div style={{position: 'relative'}}>
                    <select
                        value={video.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(e.target.value as PaymentStatus)}
                        disabled={isUpdatingPaymentStatus}
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
                            ...getSelectStyleForPayment(video.paymentStatus)
                        }}
                        className={`status-badge ${getStatusColor(video.paymentStatus)}`}
                    >
                        {Object.values(PaymentStatus).map(status => (
                            <option key={status} value={status}>
                                {formatPaymentStatus(status)}
                            </option>
                        ))}
                    </select>
                    {isUpdatingPaymentStatus && (
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

            {/* Inline Video URL Editor với Copy Button - cho tất cả user */}
            <td style={{minWidth: '200px'}}>
                {editingVideoUrl ? (
                    <div style={{position: 'relative'}}>
                        <input
                            type="text"
                            value={tempVideoUrl}
                            onChange={(e) => handleVideoUrlChange(e.target.value)}
                            onBlur={handleVideoUrlUpdate}
                            onKeyDown={handleVideoUrlKeyPress}
                            disabled={isUpdatingVideoUrl}
                            placeholder="Nhập link video..."
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '4px 8px',
                                fontSize: '12px',
                                border: urlError ? '1px solid #ef4444' : '1px solid #3b82f6',
                                borderRadius: '4px',
                                outline: 'none'
                            }}
                        />
                        {urlError && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: '0',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                padding: '2px 6px',
                                fontSize: '10px',
                                borderRadius: '3px',
                                marginTop: '2px',
                                whiteSpace: 'nowrap',
                                zIndex: 10
                            }}>
                                {urlError}
                            </div>
                        )}
                        {isUpdatingVideoUrl && (
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
                ) : (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        {/* Hiển thị URL hoặc placeholder */}
                        <div
                            style={{
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid transparent',
                                transition: 'all 0.2s',
                                fontSize: '12px',
                                minHeight: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: video.videoUrl ? '#f0fdf4' : '#f9fafb',
                                color: video.videoUrl ? '#059669' : '#6b7280',
                                flex: 1
                            }}
                            onClick={handleVideoUrlEditStart}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#d1d5db';
                                e.currentTarget.style.backgroundColor = video.videoUrl ? '#ecfdf5' : '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.backgroundColor = video.videoUrl ? '#f0fdf4' : '#f9fafb';
                            }}
                            title={video.videoUrl ? `Click để sửa: ${video.videoUrl}` : 'Click để thêm link video'}
                        >
                            {video.videoUrl ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <span>🎥</span>
                                    <span style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '120px'
                                    }}>
                                        {video.videoUrl.length > 20
                                            ? `${video.videoUrl.substring(0, 20)}...`
                                            : video.videoUrl
                                        }
                                    </span>
                                </div>
                            ) : (
                                <span style={{fontStyle: 'italic'}}>+ Thêm link</span>
                            )}
                        </div>

                        {/* Copy Button - chỉ hiển thị khi có URL */}
                        {video.videoUrl && video.videoUrl.trim() && (
                            <button
                                onClick={handleCopyVideoUrl}
                                style={{
                                    background: '#3b82f6',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'white',
                                    padding: '4px 6px',
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '24px',
                                    height: '24px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#2563eb';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#3b82f6';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                                title="Copy link video"
                            >
                                📋
                            </button>
                        )}
                    </div>
                )}
            </td>

            <td>
                <div style={{display: 'flex', gap: '6px'}}>
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
            </td>
        </tr>
    );
};

// Helper function để get style cho status select
const getSelectStyle = (status: VideoStatus) => {
    const colorMap = {
        [VideoStatus.CHUA_AI_NHAN]: {color: '#dc2626', backgroundColor: '#fef2f2'},
        [VideoStatus.DANG_LAM]: {color: '#ea580c', backgroundColor: '#fff7ed'},
        [VideoStatus.DA_XONG]: {color: '#16a34a', backgroundColor: '#f0fdf4'},
        [VideoStatus.DANG_SUA]: {color: '#2563eb', backgroundColor: '#eff6ff'},
        [VideoStatus.DA_SUA_XONG]: {color: '#059669', backgroundColor: '#ecfdf5'}
    };
    return colorMap[status] || {color: '#6b7280', backgroundColor: '#f9fafb'};
};

// UPDATED: Helper function để get style cho delivery status select - Thêm CAN_SUA_GAP
const getSelectStyleForDelivery = (status: DeliveryStatus) => {
    const colorMap = {
        [DeliveryStatus.CHUA_GUI]: {color: '#dc2626', backgroundColor: '#fef2f2'},
        [DeliveryStatus.DA_GUI]: {color: '#16a34a', backgroundColor: '#f0fdf4'},
        [DeliveryStatus.CAN_SUA_GAP]: {color: '#ffffff', backgroundColor: '#ff6b35'}  // Thêm style cho trạng thái mới
    };
    return colorMap[status] || {color: '#6b7280', backgroundColor: '#f9fafb'};
};
// Helper function để get style cho payment status select
const getSelectStyleForPayment = (status: PaymentStatus) => {
    const colorMap = {
        [PaymentStatus.CHUA_THANH_TOAN]: {color: '#dc2626', backgroundColor: '#fef2f2'},
        [PaymentStatus.DA_THANH_TOAN]: {color: '#16a34a', backgroundColor: '#f0fdf4'},
        [PaymentStatus.BUNG]: {color: '#dc2626', backgroundColor: '#fef2f2'}
    };
    return colorMap[status] || {color: '#6b7280', backgroundColor: '#f9fafb'};
};

export default VideoItem;