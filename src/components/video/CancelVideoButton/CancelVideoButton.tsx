/**
 * CancelVideoButton Component
 * 
 * Chỉ hiển thị cho admin để hủy video (reset về trạng thái chưa ai nhận)
 * 
 * Features:
 * - Kiểm tra quyền admin trước khi hiển thị
 * - Confirmation dialog trước khi hủy
 * - Loading state khi đang xử lý
 * - Toast notification khi thành công/thất bại
 * - Optimistic UI updates
 * 
 * @author System
 * @since 1.6.0
 */

import React, { useState } from 'react';
import { Video } from '../../../types/video.types';
import { VideoService } from '../../../services/videoService';
import { useIsAdmin } from '../../../contexts/AuthContext';
import { extractErrorMessage } from '../../../utils/errorUtils';
import Modal from '../../common/Modal/Modal';

interface CancelVideoButtonProps {
    video: Video;
    onVideoUpdate?: (updatedVideo: Video) => void;
    size?: 'small' | 'medium' | 'large';
    style?: React.CSSProperties;
}

/**
 * Utility function để show toast notification
 */
const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    const toast = document.createElement('div');
    toast.textContent = message;
    
    const bgColor = {
        success: '#10B981',
        error: '#EF4444', 
        warning: '#F59E0B'
    }[type];
    
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
        background-color: ${bgColor};
        max-width: 300px;
        word-wrap: break-word;
    `;

    document.body.appendChild(toast);

    // Animation in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 100);

    // Auto remove sau 4 giây
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
};


/**
 * Main CancelVideoButton component
 */
const CancelVideoButton: React.FC<CancelVideoButtonProps> = ({
    video,
    onVideoUpdate,
    size = 'small',
    style = {}
}) => {
    const isAdmin = useIsAdmin();
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Không hiển thị nếu không phải admin
    if (!isAdmin) {
        return null;
    }

    // Kiểm tra xem video có thể hủy không
    const canCancel = video.assignedStaff && video.assignedStaff.trim() !== '';

    /**
     * Handle click button cancel
     */
    const handleCancelClick = () => {
        setShowConfirmDialog(true);
    };

    /**
     * Handle confirm cancel video
     */
    const handleConfirmCancel = async () => {
        setIsLoading(true);
        
        try {
            const response = await VideoService.cancelVideo(video.id);
            
            if (response.success && onVideoUpdate) {
                // Update video state optimistically
                onVideoUpdate(response.data);
                
                showToast(
                    `✅ Video #${video.id} đã được hủy thành công!`,
                    'success'
                );
            }
            
            setShowConfirmDialog(false);
            
        } catch (error) {
            console.error('Error canceling video:', error);
            const errorMessage = extractErrorMessage(error, 'Lỗi khi hủy video');
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle cancel confirmation
     */
    const handleCancelConfirmation = () => {
        setShowConfirmDialog(false);
    };

    // Size configurations
    const sizeConfig = {
        small: {
            padding: '4px 8px',
            fontSize: '11px',
            minWidth: '40px',
            height: '28px'
        },
        medium: {
            padding: '6px 12px',
            fontSize: '13px',
            minWidth: '80px',
            height: '32px'
        },
        large: {
            padding: '8px 16px',
            fontSize: '14px',
            minWidth: '100px',
            height: '36px'
        }
    };

    const config = sizeConfig[size];

    return (
        <>
            <button
                onClick={handleCancelClick}
                disabled={isLoading || !canCancel}
                style={{
                    ...config,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: canCancel ? '#dc2626' : '#9ca3af',
                    color: 'white',
                    fontWeight: '500',
                    cursor: (isLoading || !canCancel) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    opacity: canCancel ? 1 : 0.6,
                    ...style
                }}
                onMouseEnter={(e) => {
                    if (!isLoading && canCancel) {
                        e.currentTarget.style.backgroundColor = '#b91c1c';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isLoading && canCancel) {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }
                }}
                title={
                    canCancel 
                        ? 'Hủy video - Reset về trạng thái chưa ai nhận'
                        : 'Video chưa được giao cho ai'
                }
            >
                {isLoading ? '⏳' : '🚫'}
                {size !== 'small' && (
                    <span>
                        {isLoading ? 'Đang hủy...' : 'Hủy'}
                    </span>
                )}
            </button>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmDialog}
                onClose={handleCancelConfirmation}
                title="⚠️ Xác nhận hủy video"
            >
                <div style={{ padding: '20px' }}>
                    {/* Content */}
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ 
                            margin: '0 0 12px 0',
                            color: '#374151',
                            lineHeight: '1.5'
                        }}>
                            Bạn có chắc chắn muốn hủy video này không?
                        </p>
                        
                        <div style={{
                            backgroundColor: '#f9fafb',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{ 
                                fontSize: '14px',
                                color: '#6b7280',
                                marginBottom: '6px'
                            }}>
                                Thông tin video:
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: '#111827',
                                fontWeight: '500'
                            }}>
                                #{video.id} - {video.customerName}
                            </div>
                            {video.assignedStaff && (
                                <div style={{
                                    fontSize: '13px',
                                    color: '#6b7280',
                                    marginTop: '4px'
                                }}>
                                    Hiện tại: {video.assignedStaff}
                                </div>
                            )}
                        </div>

                        <div style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            backgroundColor: '#fef3c7',
                            borderRadius: '4px',
                            border: '1px solid #fbbf24'
                        }}>
                            <div style={{
                                fontSize: '13px',
                                color: '#92400e',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <span>💡</span>
                                <span>
                                    Video sẽ được reset về trạng thái "Chưa ai nhận" và assignedStaff sẽ bị xóa.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            className="btn btn-secondary"
                            onClick={handleCancelConfirmation}
                            disabled={isLoading}
                        >
                            Hủy bỏ
                        </button>
                        
                        <button
                            className="btn btn-danger"
                            onClick={handleConfirmCancel}
                            disabled={isLoading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                minWidth: '120px',
                                justifyContent: 'center'
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner" style={{
                                        width: '12px',
                                        height: '12px',
                                        border: '2px solid #fff',
                                        borderTopColor: 'transparent'
                                    }}></span>
                                    Đang hủy...
                                </>
                            ) : (
                                <>
                                    🚫 Xác nhận hủy
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Keyframes for loading spinner */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default CancelVideoButton;