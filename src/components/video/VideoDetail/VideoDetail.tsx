import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video } from '../../../types/video.types';
import { VideoService } from '../../../services/videoService';
import { useIsAdmin } from '../../../contexts/AuthContext';
import { formatVideoStatus, formatDeliveryStatus, formatPaymentStatus, formatDate, formatCurrency } from '../../../utils/formatters';
import { extractErrorMessage } from '../../../utils/errorUtils';
import ErrorDisplay from '../../common/ErrorDisplay/ErrorDisplay';
import VideoHistory from '../VideoHistory/VideoHistory';

// Hàm format thời lượng video đơn giản - chỉ hiển thị số + "s"
const formatSimpleDuration = (seconds: number | undefined): string => {
    if (!seconds && seconds !== 0) return '--';
    return `${seconds}s`;
};

const VideoDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isAdmin = useIsAdmin();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await VideoService.getVideoById(Number(id));
                if (res.success) {
                    setVideo(res.data);
                } else {
                    // Sử dụng error message từ API response
                    const errorMessage = extractErrorMessage(res, 'Không tìm thấy video');
                    setError(errorMessage);
                }
            } catch (err) {
                // Extract error message từ exception
                const errorMessage = extractErrorMessage(err, 'Lỗi khi tải chi tiết video');
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div className="loading">Đang tải chi tiết video...</div>;
    if (error) return (
        <div style={{ padding: '20px' }}>
            <ErrorDisplay message={error} type="error" />
        </div>
    );
    if (!video) return null;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh', background: '#f5f5f5' }}>
            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, maxWidth: 700, width: '100%', margin: '40px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ fontWeight: 500, fontSize: 15 }}>
                        ← Quay lại danh sách
                    </button>
                    <button 
                        className="btn btn-outline-info" 
                        onClick={() => setShowHistory(true)}
                        style={{ fontWeight: 500, fontSize: 14 }}
                    >
                        📋 Lịch sử thay đổi
                    </button>
                </div>

                <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
                    Chi tiết Video #{video.id}
                </h2>

                {video.imageUrl && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                        <img src={video.imageUrl} alt="Ảnh video" style={{ maxWidth: 320, maxHeight: 180, borderRadius: 8, objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                    </div>
                )}

                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 220 }}>
                        {/* Thông tin khách hàng - chỉ hiển thị cho admin */}
                        {isAdmin ? (
                            <div style={{ marginBottom: 16 }}><b>Khách hàng:</b> {video.customerName}</div>
                        ) : (
                            <div style={{ marginBottom: 16 }}><b>Mã khách hàng:</b> #{video.id.toString().padStart(4, '0')}</div>
                        )}

                        <div style={{ marginBottom: 16 }}><b>Nội dung:</b> {video.videoContent || '--'}</div>
                        <div style={{ marginBottom: 16 }}><b>Nhân viên:</b> {video.assignedStaff || '--'}</div>
                        <div style={{ marginBottom: 16 }}><b>Thời lượng:</b> {formatSimpleDuration(video.videoDuration)}</div>
                        <div style={{ marginBottom: 16 }}><b>Thời gian giao:</b> {formatDate(video.deliveryTime || '')}</div>
                        <div style={{ marginBottom: 16 }}><b>Thời gian hoàn thành:</b> {formatDate(video.completedTime || '')}</div>
                        <div style={{ marginBottom: 16 }}><b>Ngày tạo:</b> {formatDate(video.createdAt)}</div>
                        <div style={{ marginBottom: 16 }}><b>Ngày cập nhật:</b> {formatDate(video.updatedAt)}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 220 }}>
                        <div style={{ marginBottom: 16 }}>
                            <b>Trạng thái:</b> <span className={`status-badge ${video.status && video.status.toLowerCase() ? 'status-' + video.status.toLowerCase() : ''}`} style={{ fontSize: 15, padding: '6px 18px' }}>{formatVideoStatus(video.status)}</span>
                        </div>
                        <div style={{ marginBottom: 16 }}><b>Trạng thái giao hàng:</b> <span className="status-badge" style={{ fontSize: 13 }}>{formatDeliveryStatus(video.deliveryStatus)}</span></div>
                        <div style={{ marginBottom: 16 }}><b>Trạng thái thanh toán:</b> <span className="status-badge" style={{ fontSize: 13 }}>{formatPaymentStatus(video.paymentStatus)}</span></div>

                        {/* Giá trị đơn hàng - chỉ hiển thị cho admin */}
                        {isAdmin ? (
                            <div style={{ marginBottom: 16 }}><b>Giá trị đơn hàng:</b> {formatCurrency(video.orderValue)}</div>
                        ) : (
                            <div style={{ marginBottom: 16 }}><b>Trạng thái xử lý:</b> {video.checked ? '✔️ Đã kiểm tra' : '⏳ Đang xử lý'}</div>
                        )}

                        {/* Ghi chú khách hàng - chỉ hiển thị cho admin */}
                        {isAdmin && (
                            <div style={{ marginBottom: 16 }}><b>Ghi chú khách hàng:</b> {video.customerNote || '--'}</div>
                        )}

                        <div style={{ marginBottom: 16 }}><b>Khách hàng đã duyệt:</b> {video.customerApproved ? '✔️' : '❌'}</div>

                        {/* Thông tin kiểm tra - chỉ hiển thị cho admin */}
                        {isAdmin && (
                            <div style={{ marginBottom: 16 }}><b>Đã kiểm tra:</b> {video.checked ? '✔️' : '❌'}</div>
                        )}

                        {video.videoUrl && <div style={{ marginBottom: 16 }}><b>URL video:</b> <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">Xem video</a></div>}

                        {/* Hình ảnh thanh toán - chỉ hiển thị khi có URL */}
                        {video.billImageUrl && (
                            <div style={{ marginBottom: 16 }}>
                                <b>Hình ảnh thanh toán:</b>
                                <div style={{ marginTop: 8 }}>
                                    <img 
                                        src={video.billImageUrl} 
                                        alt="Hình ảnh thanh toán" 
                                        style={{ 
                                            maxWidth: 200, 
                                            maxHeight: 150, 
                                            borderRadius: 4, 
                                            objectFit: 'cover',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => window.open(video.billImageUrl, '_blank')}
                                        title="Click để xem ảnh kích thước đầy đủ"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Video History Modal */}
                <VideoHistory 
                    videoId={video.id}
                    isOpen={showHistory}
                    onClose={() => setShowHistory(false)}
                />
            </div>
        </div>
    );
};

export default VideoDetail;