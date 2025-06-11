// Component hiển thị một dòng video trong table với khả năng inline editing
// Cho phép cập nhật nhanh assigned staff, status, video URL, delivery status và payment status trực tiếp trong bảng
// UPDATED: Thêm inline editing cho trạng thái giao hàng và thanh toán
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

interface VideoItemProps {
    video: Video;                          // Dữ liệu video
    onEdit: (video: Video) => void;        // Hàm gọi khi click sửa
    onDelete: (id: number) => void;        // Hàm gọi khi click xóa
    onViewDetail: (id: number) => void;    // Hàm gọi khi click xem chi tiết
    onVideoUpdate?: (updatedVideo: Video) => void; // Callback khi video được cập nhật
    isAdmin: boolean;                      // Kiểm tra quyền admin
}

const STAFF_LIST = ["","Nguyễn Minh Hiếu", "Nguyễn Quang Đăng", "Trần Quốc Cường", "Lý Chí Công",
    "Nguyễn Mạnh Tuấn", "Nguyễn Duy Khánh", "Nguyễn Minh Khánh"];

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

    // Kiểm tra xem có được phép thay đổi nhân viên không (chỉ khi chưa giao)
    const isStaffEditable = !video.assignedStaff || video.assignedStaff.trim() === '';

    // Hàm xử lý cập nhật nhân viên - chỉ cho phép khi chưa giao
    const handleStaffChange = async (newStaff: string) => {
        if (!isStaffEditable) return; // Không cho phép thay đổi nếu đã giao
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
            showToast('Lỗi khi cập nhật trạng thái', 'error');
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
            showToast('Lỗi khi cập nhật trạng thái giao hàng', 'error');
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
            showToast('Lỗi khi cập nhật trạng thái thanh toán', 'error');
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
            showToast('Lỗi khi cập nhật link video', 'error');
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

            {/* Inline Staff Selector - chỉ cho phép chỉnh sửa khi chưa giao */}
            <td>
                <div style={{position: 'relative'}}>
                    {isStaffEditable ? (
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
                    ) : (
                        <div
                            style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                minWidth: '80px',
                                backgroundColor: '#f3f4f6',
                                color: '#6b7280',
                                border: '1px solid #e5e7eb',
                                borderRadius: '4px',
                                cursor: 'not-allowed'
                            }}
                            title="Đã giao việc - không thể thay đổi"
                        >
                            {video.assignedStaff}
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

// Helper function để get style cho delivery status select
const getSelectStyleForDelivery = (status: DeliveryStatus) => {
    const colorMap = {
        [DeliveryStatus.CHUA_GUI]: {color: '#dc2626', backgroundColor: '#fef2f2'},
        [DeliveryStatus.DA_GUI]: {color: '#16a34a', backgroundColor: '#f0fdf4'}
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