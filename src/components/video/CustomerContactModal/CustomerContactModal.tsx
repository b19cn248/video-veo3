/**
 * CustomerContactModal Component
 * 
 * Modal hiển thị thông tin liên hệ khách hàng (chỉ dành cho admin)
 * 
 * Features:
 * - Hiển thị tên khách hàng, Facebook, số điện thoại
 * - Facebook link clickable và có nút copy
 * - Số điện thoại có nút copy
 * - Loading state khi fetch data
 * - Error handling
 * - Toast notifications cho copy actions
 * 
 * @author System
 * @since 1.7.0
 */

import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal/Modal';
import { CustomerContactDto } from '../../../types/video.types';
import { VideoService } from '../../../services/videoService';
import { extractErrorMessage } from '../../../utils/errorUtils';

interface CustomerContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoId: number; // Thay đổi từ customerName thành videoId
}

/**
 * Utility function để show toast notification
 */
const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const toast = document.createElement('div');
    toast.textContent = message;
    
    const bgColor = {
        success: '#10B981',
        error: '#EF4444', 
        info: '#3B82F6'
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
        z-index: 100000;
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

/**
 * Copy text to clipboard với fallback
 */
const copyToClipboard = async (text: string, label: string) => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback cho các trình duyệt cũ
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
        showToast(`Đã copy ${label}`, 'success');
    } catch (error) {
        console.error('Failed to copy:', error);
        showToast(`Lỗi khi copy ${label}`, 'error');
    }
};

/**
 * Main CustomerContactModal component
 */
const CustomerContactModal: React.FC<CustomerContactModalProps> = ({
    isOpen,
    onClose,
    videoId
}) => {
    const [contactData, setContactData] = useState<CustomerContactDto | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [canRetry, setCanRetry] = useState(false);

    // Reset state khi modal đóng/mở
    useEffect(() => {
        if (!isOpen) {
            setContactData(null);
            setError('');
            setCanRetry(false);
            return;
        }

        // Fetch customer contact data
        const fetchCustomerContact = async () => {
            setIsLoading(true);
            setError('');
            
            try {
                const response = await VideoService.getCustomerContactByVideoId(videoId);
                
                if (response.success && response.data) {
                    setContactData(response.data);
                } else {
                    setError('Không tìm thấy thông tin liên hệ cho video này');
                }
            } catch (error) {
                console.error('Error fetching customer contact:', error);
                
                // Enhanced error handling cho specific HTTP status codes
                let errorMessage = 'Lỗi khi tải thông tin liên hệ khách hàng';
                
                if (error instanceof Error) {
                    if (error.message.includes('404')) {
                        errorMessage = 'Video không tồn tại hoặc đã bị xóa';
                        setCanRetry(false);
                    } else if (error.message.includes('400')) {
                        errorMessage = 'ID video không hợp lệ';
                        setCanRetry(false);
                    } else if (error.message.includes('500')) {
                        errorMessage = 'Lỗi server, vui lòng thử lại sau';
                        setCanRetry(true);
                    } else {
                        errorMessage = extractErrorMessage(error, 'Lỗi khi tải thông tin liên hệ khách hàng');
                        setCanRetry(true);
                    }
                }
                
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomerContact();
    }, [isOpen, videoId]);

    // Function để retry khi có lỗi
    const handleRetry = async () => {
        setIsLoading(true);
        setError('');
        setCanRetry(false);
        
        try {
            const response = await VideoService.getCustomerContactByVideoId(videoId);
            
            if (response.success && response.data) {
                setContactData(response.data);
            } else {
                setError('Không tìm thấy thông tin liên hệ cho video này');
                setCanRetry(true);
            }
        } catch (error) {
            console.error('Error retrying customer contact:', error);
            setError('Vẫn không thể tải được thông tin, vui lòng thử lại sau');
            setCanRetry(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle copy Facebook link
    const handleCopyFacebook = () => {
        if (contactData?.linkfb) {
            copyToClipboard(contactData.linkfb, 'link Facebook');
        }
    };

    // Handle copy phone number
    const handleCopyPhone = () => {
        if (contactData?.phoneNumber) {
            copyToClipboard(contactData.phoneNumber, 'số điện thoại');
        }
    };

    // Handle open Facebook link
    const handleOpenFacebook = () => {
        if (contactData?.linkfb) {
            window.open(contactData.linkfb, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="📋 Thông tin liên hệ khách hàng"
        >
            <div style={{ padding: '20px', minHeight: '200px' }}>
                {isLoading && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 20px',
                        color: '#6b7280'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '3px solid #e5e7eb',
                            borderTopColor: '#3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            marginBottom: '16px'
                        }}></div>
                        <span>Đang tải thông tin...</span>
                    </div>
                )}

                {error && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 20px',
                        color: '#dc2626'
                    }}>
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '16px'
                        }}>
                            ⚠️
                        </div>
                        <span style={{ textAlign: 'center', lineHeight: '1.5', marginBottom: '20px' }}>{error}</span>
                        {canRetry && (
                            <button
                                onClick={handleRetry}
                                className="btn btn-primary"
                                style={{ marginTop: '12px' }}
                            >
                                🔄 Thử lại
                            </button>
                        )}
                    </div>
                )}

                {contactData && (
                    <div>
                        {/* Customer Name */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                👤 Tên khách hàng:
                            </div>
                            <div style={{
                                fontSize: '16px',
                                color: '#111827',
                                fontWeight: '500',
                                padding: '8px 12px',
                                backgroundColor: '#f9fafb',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb'
                            }}>
                                {contactData.customerName}
                            </div>
                        </div>

                        {/* Facebook Link */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                📘 Link Facebook:
                            </div>
                            {contactData.linkfb ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    backgroundColor: '#eff6ff',
                                    borderRadius: '6px',
                                    border: '1px solid #bfdbfe'
                                }}>
                                    <button
                                        onClick={handleOpenFacebook}
                                        style={{
                                            flex: 1,
                                            background: 'none',
                                            border: 'none',
                                            color: '#2563eb',
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontSize: '14px',
                                            padding: '0',
                                            wordBreak: 'break-all'
                                        }}
                                        title="Click để mở Facebook"
                                    >
                                        🔗 {contactData.linkfb}
                                    </button>
                                    <button
                                        onClick={handleCopyFacebook}
                                        style={{
                                            background: '#3b82f6',
                                            border: 'none',
                                            borderRadius: '4px',
                                            color: 'white',
                                            padding: '6px 8px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#2563eb';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#3b82f6';
                                        }}
                                        title="Copy link Facebook"
                                    >
                                        📋 Copy
                                    </button>
                                </div>
                            ) : (
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e7eb',
                                    color: '#6b7280',
                                    fontStyle: 'italic',
                                    textAlign: 'center'
                                }}>
                                    Chưa có thông tin Facebook
                                </div>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                📞 Số điện thoại:
                            </div>
                            {contactData.phoneNumber ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    backgroundColor: '#f0fdf4',
                                    borderRadius: '6px',
                                    border: '1px solid #86efac'
                                }}>
                                    <div style={{
                                        flex: 1,
                                        fontSize: '16px',
                                        color: '#059669',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        📱 {contactData.phoneNumber}
                                    </div>
                                    <button
                                        onClick={handleCopyPhone}
                                        style={{
                                            background: '#10b981',
                                            border: 'none',
                                            borderRadius: '4px',
                                            color: 'white',
                                            padding: '6px 8px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#059669';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#10b981';
                                        }}
                                        title="Copy số điện thoại"
                                    >
                                        📋 Copy
                                    </button>
                                </div>
                            ) : (
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e7eb',
                                    color: '#6b7280',
                                    fontStyle: 'italic',
                                    textAlign: 'center'
                                }}>
                                    Chưa có thông tin số điện thoại
                                </div>
                            )}
                        </div>

                        {/* Additional Info */}
                        {(contactData.totalVideos || contactData.latestVideoDate) && (
                            <div style={{
                                marginTop: '20px',
                                padding: '12px',
                                backgroundColor: '#fef3c7',
                                borderRadius: '6px',
                                border: '1px solid #fcd34d'
                            }}>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#92400e',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <span>💡</span>
                                    <span>
                                        {contactData.totalVideos && `Tổng ${contactData.totalVideos} video`}
                                        {contactData.totalVideos && contactData.latestVideoDate && ' • '}
                                        {contactData.latestVideoDate && `Video gần nhất: ${new Date(contactData.latestVideoDate).toLocaleDateString('vi-VN')}`}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Close Button */}
                <div style={{
                    marginTop: '24px',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                </div>
            </div>

            {/* Keyframes for loading spinner */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </Modal>
    );
};

export default CustomerContactModal;