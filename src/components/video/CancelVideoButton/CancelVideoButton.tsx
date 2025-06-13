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
 * Component hiển thị confirmation dialog
 */
interface ConfirmDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    video: Video;
    isLoading: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
    isOpen, 
    onConfirm, 
    onCancel, 
    video, 
    isLoading 
}) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                minWidth: '400px',
                maxWidth: '500px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px',
                    gap: '8px'
                }}>
                    <span style={{ fontSize: '20px' }}>⚠️</span>
                    <h3 style={{ 
                        margin: 0, 
                        color: '#dc2626',
                        fontSize: '18px',
                        fontWeight: '600'
                    }}>
                        Xác nhận hủy video
                    </h3>
                </div>

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
                        onClick={onCancel}
                        disabled={isLoading}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            backgroundColor: 'white',
                            color: '#374151',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                                e.currentTarget.style.borderColor = '#9ca3af';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#d1d5db';
                            }
                        }}
                    >
                        Hủy bỏ
                    </button>
                    
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isLoading ? '#f87171' : '#dc2626',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            minWidth: '120px',
                            justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = '#b91c1c';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = '#dc2626';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        {isLoading ? (
                            <>
                                <span style={{
                                    display: 'inline-block',
                                    width: '12px',
                                    height: '12px',
                                    border: '2px solid #fff',
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
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
        </div>
    );
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

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showConfirmDialog}
                onConfirm={handleConfirmCancel}
                onCancel={handleCancelConfirmation}
                video={video}
                isLoading={isLoading}
            />

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