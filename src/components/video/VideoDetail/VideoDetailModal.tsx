// Modal hiển thị chi tiết video trong danh sách
// Tối ưu UX - không cần chuyển trang, hiển thị modal overlay trên trang hiện tại
// Bao gồm đầy đủ thông tin bao gồm customerNote

import React, { useEffect, useState } from 'react';
import { Video } from '../../../types/video.types';
import { VideoService } from '../../../services/videoService';
import { useIsAdmin } from '../../../contexts/AuthContext';
import { formatVideoStatus, formatDeliveryStatus, formatPaymentStatus, formatDate, formatCurrency } from '../../../utils/formatters';
import { extractErrorMessage } from '../../../utils/errorUtils';
import ErrorDisplay from '../../common/ErrorDisplay/ErrorDisplay';
import Loading from '../../common/Loading/Loading';

interface VideoDetailModalProps {
    isOpen: boolean;
    videoId: number | null;
    onClose: () => void;
}

// Hàm format thời lượng video đơn giản - chỉ hiển thị số + "s"
const formatSimpleDuration = (seconds: number | undefined): string => {
    if (!seconds && seconds !== 0) return '--';
    return `${seconds}s`;
};

const VideoDetailModal: React.FC<VideoDetailModalProps> = ({ isOpen, videoId, onClose }) => {
    const isAdmin = useIsAdmin();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch video detail khi modal mở và có videoId
    useEffect(() => {
        if (isOpen && videoId) {
            fetchVideoDetail();
        }
    }, [isOpen, videoId]);

    const fetchVideoDetail = async () => {
        if (!videoId) return;

        setLoading(true);
        setError(null);
        try {
            const res = await VideoService.getVideoById(videoId);
            if (res.success) {
                setVideo(res.data);
            } else {
                const errorMessage = extractErrorMessage(res, 'Không tìm thấy video');
                setError(errorMessage);
            }
        } catch (err) {
            const errorMessage = extractErrorMessage(err, 'Lỗi khi tải chi tiết video');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Reset state khi đóng modal
    useEffect(() => {
        if (!isOpen) {
            setVideo(null);
            setError(null);
        }
    }, [isOpen]);

    // Xử lý ESC key để đóng modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden'; // Prevent body scroll
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: '20px'
            }}
            onClick={(e) => {
                // Đóng modal khi click vào backdrop
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div 
                style={{
                    background: 'white',
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    padding: 32,
                    maxWidth: 800,
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()} // Prevent click propagation
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: 'none',
                        border: 'none',
                        fontSize: 24,
                        cursor: 'pointer',
                        color: '#6b7280',
                        padding: 8,
                        borderRadius: 6,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.color = '#374151';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#6b7280';
                    }}
                    title="Đóng (ESC)"
                >
                    ×
                </button>

                {/* Loading state */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Loading message="Đang tải chi tiết video..." />
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div style={{ marginBottom: 20 }}>
                        <ErrorDisplay message={error} type="error" />
                    </div>
                )}

                {/* Video detail content */}
                {!loading && !error && video && (
                    <>
                        <h2 style={{ 
                            textAlign: 'center', 
                            marginBottom: 24,
                            marginTop: 0,
                            fontSize: 24,
                            fontWeight: 600,
                            color: '#1f2937'
                        }}>
                            Chi tiết Video #{video.id}
                        </h2>

                        {/* Image preview */}
                        {video.imageUrl && (
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                marginBottom: 24 
                            }}>
                                <img 
                                    src={video.imageUrl} 
                                    alt="Ảnh video" 
                                    style={{ 
                                        maxWidth: 320, 
                                        maxHeight: 180, 
                                        borderRadius: 8, 
                                        objectFit: 'cover', 
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                                    }} 
                                />
                            </div>
                        )}

                        {/* Video information */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: 32
                        }}>
                            {/* Left column */}
                            <div>
                                {/* Thông tin khách hàng - chỉ hiển thị cho admin */}
                                {isAdmin ? (
                                    <div style={{ marginBottom: 16 }}>
                                        <strong>Khách hàng:</strong> {video.customerName}
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: 16 }}>
                                        <strong>Mã khách hàng:</strong> #{video.id.toString().padStart(4, '0')}
                                    </div>
                                )}

                                <div style={{ marginBottom: 16 }}>
                                    <strong>Nội dung:</strong> {video.videoContent || '--'}
                                </div>

                                {/* URL hình ảnh */}
                                <div style={{ marginBottom: 16 }}>
                                    <strong>URL hình ảnh:</strong> 
                                    {video.imageUrl ? (
                                        <div style={{ 
                                            marginTop: 4,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}>
                                            <a 
                                                href={video.imageUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: '#3b82f6',
                                                    textDecoration: 'none',
                                                    wordWrap: 'break-word',
                                                    display: 'inline-block',
                                                    padding: '4px 8px',
                                                    backgroundColor: '#eff6ff',
                                                    borderRadius: 4,
                                                    fontSize: 13,
                                                    flex: 1,
                                                    minWidth: 0,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#dbeafe';
                                                    e.currentTarget.style.textDecoration = 'underline';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#eff6ff';
                                                    e.currentTarget.style.textDecoration = 'none';
                                                }}
                                                title={video.imageUrl}
                                            >
                                                🖼️ {video.imageUrl.length > 40 
                                                    ? `${video.imageUrl.substring(0, 40)}...` 
                                                    : video.imageUrl}
                                            </a>
                                            
                                            {/* Copy button cho image URL */}
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        if (navigator.clipboard && window.isSecureContext) {
                                                            await navigator.clipboard.writeText(video.imageUrl || '');
                                                        } else {
                                                            // Fallback method
                                                            const textArea = document.createElement('textarea');
                                                            textArea.value = video.imageUrl || '';
                                                            document.body.appendChild(textArea);
                                                            textArea.select();
                                                            document.execCommand('copy');
                                                            document.body.removeChild(textArea);
                                                        }
                                                        
                                                        // Simple toast notification
                                                        const toast = document.createElement('div');
                                                        toast.textContent = 'Đã copy URL hình ảnh!';
                                                        toast.style.cssText = `
                                                            position: fixed; top: 20px; right: 20px; padding: 12px 20px;
                                                            border-radius: 6px; color: white; font-size: 14px;
                                                            background-color: #10B981; z-index: 10001;
                                                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                                                        `;
                                                        document.body.appendChild(toast);
                                                        setTimeout(() => {
                                                            if (document.body.contains(toast)) {
                                                                document.body.removeChild(toast);
                                                            }
                                                        }, 2000);
                                                    } catch (error) {
                                                        console.error('Failed to copy image URL:', error);
                                                    }
                                                }}
                                                style={{
                                                    background: '#3b82f6',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    color: 'white',
                                                    padding: '4px 8px',
                                                    fontSize: 11,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    minWidth: 24,
                                                    height: 24,
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
                                                title="Copy URL hình ảnh"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    ) : (
                                        <span style={{ 
                                            color: '#6b7280', 
                                            fontStyle: 'italic',
                                            marginLeft: 8 
                                        }}>
                                            Không có hình ảnh
                                        </span>
                                    )}
                                </div>
                                
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Nhân viên:</strong> {video.assignedStaff || '--'}
                                </div>

                                {/* Thời gian assign staff - chỉ hiển thị cho admin khi có */}
                                {isAdmin && video.assignedAt && (
                                    <div style={{ marginBottom: 16 }}>
                                        <strong>Thời gian giao việc:</strong> {formatDate(video.assignedAt)}
                                    </div>
                                )}
                                
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Thời lượng:</strong> {formatSimpleDuration(video.videoDuration)}
                                </div>
                                
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Thời gian giao:</strong> {formatDate(video.deliveryTime || '')}
                                </div>
                                
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Thời gian hoàn thành:</strong> {formatDate(video.completedTime || '')}
                                </div>
                                
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Ngày tạo:</strong> {formatDate(video.createdAt)}
                                </div>
                                
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Ngày cập nhật:</strong> {formatDate(video.updatedAt)}
                                </div>

                                {/* Người tạo - chỉ hiển thị cho admin */}
                                {isAdmin && (
                                    <div style={{ marginBottom: 16 }}>
                                        <strong>Người tạo:</strong> {video.createdBy || '--'}
                                    </div>
                                )}
                            </div>

                            {/* Right column */}
                            <div>
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Trạng thái:</strong> 
                                    <span 
                                        className={`status-badge ${video.status && video.status.toLowerCase() ? 'status-' + video.status.toLowerCase() : ''}`} 
                                        style={{ 
                                            fontSize: 14, 
                                            padding: '6px 12px',
                                            marginLeft: 8,
                                            borderRadius: 6
                                        }}
                                    >
                                        {formatVideoStatus(video.status)}
                                    </span>
                                </div>
                                
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Trạng thái giao hàng:</strong> 
                                    <span className="status-badge" style={{ fontSize: 13, marginLeft: 8 }}>
                                        {formatDeliveryStatus(video.deliveryStatus)}
                                    </span>
                                </div>
                                
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Trạng thái thanh toán:</strong> 
                                    <span className="status-badge" style={{ fontSize: 13, marginLeft: 8 }}>
                                        {formatPaymentStatus(video.paymentStatus)}
                                    </span>
                                </div>

                                {/* Giá trị đơn hàng - chỉ hiển thị cho admin */}
                                {isAdmin ? (
                                    <div style={{ marginBottom: 16 }}>
                                        <strong>Giá trị đơn hàng:</strong> {formatCurrency(video.orderValue)}
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: 16 }}>
                                        <strong>Trạng thái xử lý:</strong> {video.checked ? '✔️ Đã kiểm tra' : '⏳ Đang xử lý'}
                                    </div>
                                )}

                                {/* NEW: Ghi chú khách hàng - hiển thị cho tất cả user nhưng ưu tiên admin */}
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Ghi chú khách hàng:</strong> 
                                    <div style={{
                                        marginTop: 4,
                                        padding: '8px 12px',
                                        backgroundColor: video.customerNote ? '#f0fdf4' : '#f9fafb',
                                        border: `1px solid ${video.customerNote ? '#bbf7d0' : '#e5e7eb'}`,
                                        borderRadius: 6,
                                        color: video.customerNote ? '#166534' : '#6b7280',
                                        fontSize: 14,
                                        fontStyle: video.customerNote ? 'normal' : 'italic',
                                        minHeight: 40,
                                        wordWrap: 'break-word'
                                    }}>
                                        {video.customerNote || 'Không có ghi chú'}
                                    </div>
                                </div>
                                
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Khách hàng đã duyệt:</strong> {video.customerApproved ? '✔️ Đã duyệt' : '❌ Chưa duyệt'}
                                </div>

                                {/* Thông tin kiểm tra - chỉ hiển thị cho admin */}
                                {isAdmin && (
                                    <div style={{ marginBottom: 16 }}>
                                        <strong>Đã kiểm tra:</strong> {video.checked ? '✔️ Đã kiểm tra' : '❌ Chưa kiểm tra'}
                                    </div>
                                )}

                                {/* Video URL */}
                                {video.videoUrl && (
                                    <div style={{ marginBottom: 16 }}>
                                        <strong>URL video:</strong> 
                                        <div style={{ marginTop: 4 }}>
                                            <a 
                                                href={video.videoUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: '#3b82f6',
                                                    textDecoration: 'none',
                                                    wordWrap: 'break-word',
                                                    display: 'inline-block',
                                                    padding: '4px 8px',
                                                    backgroundColor: '#eff6ff',
                                                    borderRadius: 4,
                                                    fontSize: 13
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#dbeafe';
                                                    e.currentTarget.style.textDecoration = 'underline';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#eff6ff';
                                                    e.currentTarget.style.textDecoration = 'none';
                                                }}
                                            >
                                                🎥 Xem video
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Payment date - chỉ hiển thị cho admin khi có */}
                                {isAdmin && video.paymentDate && (
                                    <div style={{ marginBottom: 16 }}>
                                        <strong>Ngày thanh toán:</strong> {formatDate(video.paymentDate)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VideoDetailModal;