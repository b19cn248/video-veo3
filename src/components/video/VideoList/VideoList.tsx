// Component chính hiển thị danh sách video
// Đây là component phức tạp nhất, quản lý nhiều state và logic
// Hỗ trợ inline updates cho staff, status, video URL, delivery status và payment status
// UPDATED: Cập nhật header table để hỗ trợ inline editing cho delivery và payment status
// UPDATED: Thêm tooltips cho các cột có thể edit

import React, { useState, useEffect } from 'react';
import { Video, VideoStatus, VideoFilter } from '../../../types/video.types';
import { VideoService } from '../../../services/videoService';
import { formatVideoStatus } from '../../../utils/formatters';
import { useIsAdmin } from '../../../contexts/AuthContext';
import VideoItem from '../VideoItem/VideoItem';
import VideoForm from '../VideoForm/VideoForm';
import Loading from '../../common/Loading/Loading';
import Modal from '../../common/Modal/Modal';
import Pagination from '../../common/Pagination/Pagination';
import { useNavigate } from 'react-router-dom';

const VideoList: React.FC = () => {
    // State management với useState hooks
    const [videos, setVideos] = useState<Video[]>([]);                    // Danh sách video
    const [loading, setLoading] = useState(true);                         // Trạng thái loading
    const [error, setError] = useState<string | null>(null);              // Thông báo lỗi
    const [currentPage, setCurrentPage] = useState(0);                    // Trang hiện tại
    const [totalPages, setTotalPages] = useState(0);                      // Tổng số trang
    const [totalElements, setTotalElements] = useState(0);                // Tổng số phần tử
    const [hasNext, setHasNext] = useState(false);                       // Có trang sau không
    const [hasPrevious, setHasPrevious] = useState(false);               // Có trang trước không

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);        // Hiển thị modal tạo mới
    const [showEditModal, setShowEditModal] = useState(false);            // Hiển thị modal sửa
    const [editingVideo, setEditingVideo] = useState<Video | null>(null); // Video đang sửa
    const [submitting, setSubmitting] = useState(false);                  // Đang submit form

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');                     // Từ khóa tìm kiếm
    const [statusFilter, setStatusFilter] = useState<VideoStatus | ''>(''); // Lọc theo trạng thái
    const [isFiltering, setIsFiltering] = useState(false);               // Đang filter hay không

    // Admin check
    const isAdmin = useIsAdmin();

    const navigate = useNavigate();

    // useEffect hook - chạy khi component mount lần đầu
    useEffect(() => {
        loadVideos();
    }, [currentPage]); // Dependency array - chạy lại khi currentPage thay đổi

    // Hàm load danh sách video từ API
    const loadVideos = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await VideoService.getVideos(currentPage, 10, 'createdAt', 'desc');

            if (response.success) {
                setVideos(response.data);
                setTotalPages(response.pagination.totalPages);
                setTotalElements(response.pagination.totalElements);
                setHasNext(response.pagination.hasNext);
                setHasPrevious(response.pagination.hasPrevious);
            } else {
                setError('Không thể tải danh sách video');
            }
        } catch (err) {
            setError('Lỗi kết nối đến server');
            console.error('Error loading videos:', err);
        } finally {
            setLoading(false);
        }
    };

    // Hàm tìm kiếm theo tên khách hàng - chỉ cho admin
    const handleSearch = async () => {
        if (!isAdmin) return; // Chỉ admin mới được search theo tên khách hàng

        if (!searchTerm.trim()) {
            setIsFiltering(false);
            setCurrentPage(0);
            loadVideos();
            return;
        }

        try {
            setLoading(true);
            setIsFiltering(true);

            const response = await VideoService.searchByCustomerName(searchTerm.trim());

            if (response.success) {
                setVideos(response.data);
                setTotalPages(1);
                setTotalElements(response.data.length);
                setHasNext(false);
                setHasPrevious(false);
                setCurrentPage(0);
            } else {
                setError('Không thể tìm kiếm video');
            }
        } catch (err) {
            setError('Lỗi khi tìm kiếm');
            console.error('Error searching videos:', err);
        } finally {
            setLoading(false);
        }
    };

    // Hàm lọc theo trạng thái
    const handleStatusFilter = async (status: VideoStatus | '') => {
        setStatusFilter(status);

        if (!status) {
            setIsFiltering(false);
            setCurrentPage(0);
            loadVideos();
            return;
        }

        try {
            setLoading(true);
            setIsFiltering(true);

            const response = await VideoService.getVideosByStatus(status);

            if (response.success) {
                setVideos(response.data);
                setTotalPages(1);
                setTotalElements(response.data.length);
                setHasNext(false);
                setHasPrevious(false);
                setCurrentPage(0);
            } else {
                setError('Không thể lọc video theo trạng thái');
            }
        } catch (err) {
            setError('Lỗi khi lọc video');
            console.error('Error filtering videos:', err);
        } finally {
            setLoading(false);
        }
    };

    // Hàm reset filter
    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setIsFiltering(false);
        setCurrentPage(0);
        loadVideos();
    };

    // Hàm xử lý khi video được cập nhật từ inline editing
    const handleVideoUpdate = (updatedVideo: Video) => {
        setVideos(prevVideos =>
            prevVideos.map(video =>
                video.id === updatedVideo.id ? updatedVideo : video
            )
        );
    };

    // Hàm xử lý tạo video mới - chỉ admin
    const handleCreate = async (videoData: any) => {
        if (!isAdmin) return;

        try {
            setSubmitting(true);
            const response = await VideoService.createVideo(videoData);

            if (response.success) {
                setShowCreateModal(false);
                if (!isFiltering) {
                    loadVideos(); // Reload list
                }
                showSuccessToast('Tạo video thành công!');
            } else {
                showErrorToast('Lỗi: ' + response.message);
            }
        } catch (err) {
            showErrorToast('Lỗi khi tạo video');
            console.error('Error creating video:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Hàm xử lý sửa video - chỉ admin
    const handleEdit = (video: Video) => {
        if (!isAdmin) return;
        setEditingVideo(video);
        setShowEditModal(true);
    };

    // Hàm xử lý cập nhật video - chỉ admin
    const handleUpdate = async (videoData: any) => {
        if (!editingVideo || !isAdmin) return;

        try {
            setSubmitting(true);
            const response = await VideoService.updateVideo(editingVideo.id, videoData);

            if (response.success) {
                setShowEditModal(false);
                setEditingVideo(null);
                if (!isFiltering) {
                    loadVideos();
                }
                showSuccessToast('Cập nhật video thành công!');
            } else {
                showErrorToast('Lỗi: ' + response.message);
            }
        } catch (err) {
            showErrorToast('Lỗi khi cập nhật video');
            console.error('Error updating video:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Hàm xử lý xóa video - chỉ admin
    const handleDelete = async (id: number) => {
        if (!isAdmin) return;

        try {
            const response = await VideoService.deleteVideo(id);

            if (response.success) {
                if (!isFiltering) {
                    loadVideos();
                }
                showSuccessToast('Xóa video thành công!');
            } else {
                showErrorToast('Lỗi: ' + response.message);
            }
        } catch (err) {
            showErrorToast('Lỗi khi xóa video');
            console.error('Error deleting video:', err);
        }
    };

    // Hàm xử lý xem chi tiết
    const handleViewDetail = (id: number) => {
        navigate(`/videos/${id}`);
    };

    // Hàm xử lý đổi trang
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Helper functions cho toast notifications
    const showSuccessToast = (message: string) => {
        showToast(message, 'success');
    };

    const showErrorToast = (message: string) => {
        showToast(message, 'error');
    };

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
        <div>
            {/* Enhanced Quick Actions Tip - hiển thị cho tất cả user */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                💡 <strong>Mẹo:</strong> Click trực tiếp vào <strong>Trạng thái</strong>, <strong>Nhân viên</strong>, <strong>Giao hàng</strong>, <strong>Thanh toán</strong> hoặc <strong>Link video</strong> trong bảng để cập nhật nhanh! 📋 Button copy để sao chép link.
            </div>

            {/* Search and Filter Bar */}
            <div className="search-bar" style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap'
            }}>
                {/* Search input - chỉ hiển thị cho admin */}
                {isAdmin && (
                    <>
                        <div className="search-input" style={{ flex: 1, minWidth: '200px' }}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên khách hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            className="btn btn-primary"
                            style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                borderRadius: '6px'
                            }}
                        >
                            🔍 Tìm kiếm
                        </button>
                    </>
                )}

                {/* Status filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value as VideoStatus | '')}
                    className="form-select"
                    style={{
                        width: '200px',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                    }}
                >
                    <option value="">📋 Tất cả trạng thái</option>
                    {Object.values(VideoStatus).map(status => (
                        <option key={status} value={status}>
                            {formatVideoStatus(status)}
                        </option>
                    ))}
                </select>

                {isFiltering && (
                    <button
                        onClick={resetFilters}
                        className="btn btn-secondary"
                        style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            borderRadius: '6px'
                        }}
                    >
                        ❌ Bỏ lọc
                    </button>
                )}

                {/* Create button - chỉ hiển thị cho admin */}
                {isAdmin && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-success"
                        style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            borderRadius: '6px',
                            fontWeight: '600'
                        }}
                    >
                        ➕ Tạo video mới
                    </button>
                )}
            </div>

            {/* Summary */}
            <div style={{
                marginBottom: '20px',
                background: 'white',
                padding: '15px 20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <strong>Tổng cộng:</strong> {totalElements} video
                    {isFiltering && <span style={{ color: '#6b7280', fontStyle: 'italic' }}> (đã lọc)</span>}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Trang {currentPage + 1} / {totalPages || 1}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Loading Display */}
            {loading && <Loading message="Đang tải danh sách video..." />}

            {/* Video Table */}
            {!loading && !error && (
                <>
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb'
                    }}>
                        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr style={{ background: '#f9fafb' }}>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>ID</th>
                                {/* Cột khách hàng - chỉ hiển thị cho admin */}
                                {isAdmin && (
                                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Khách hàng</th>
                                )}
                                {isAdmin && (
                                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                                        👤 Người tạo
                                    </th>
                                )}
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                                    🔄 Trạng thái
                                    <div style={{ fontSize: '10px', fontWeight: '400', color: '#6b7280' }}>Click để sửa</div>
                                </th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                                    👤 Nhân viên
                                    <div style={{ fontSize: '10px', fontWeight: '400', color: '#6b7280' }}>Click để giao</div>
                                </th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Time</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Tiền</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Ngày tạo</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                                    🚚 Giao hàng
                                    <div style={{ fontSize: '10px', fontWeight: '400', color: '#6b7280' }}>Click để sửa</div>
                                </th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                                    💰 Thanh toán
                                    <div style={{ fontSize: '10px', fontWeight: '400', color: '#6b7280' }}>Click để sửa</div>
                                </th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                                    🎥 Link video
                                    <div style={{ fontSize: '10px', fontWeight: '400', color: '#6b7280' }}>Click để sửa | 📋 Copy</div>
                                </th>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {videos.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 12 : 10} style={{
                                        textAlign: 'center',
                                        padding: '60px 20px',
                                        color: '#6b7280',
                                        fontSize: '14px'
                                    }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
                                        {isFiltering ? 'Không tìm thấy video nào' : 'Chưa có video nào'}
                                        <div style={{ fontSize: '12px', marginTop: '8px' }}>
                                            {!isFiltering && isAdmin && 'Hãy tạo video đầu tiên bằng cách click "Tạo video mới"'}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                videos.map((video, index) => (
                                    <VideoItem
                                        key={video.id}
                                        video={video}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onViewDetail={handleViewDetail}
                                        onVideoUpdate={handleVideoUpdate}
                                        isAdmin={isAdmin}
                                    />
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination - chỉ hiển thị khi không filter */}
                    {!isFiltering && totalPages > 1 && (
                        <div style={{ marginTop: '20px' }}>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                hasNext={hasNext}
                                hasPrevious={hasPrevious}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Create Modal - chỉ cho admin */}
            {isAdmin && (
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Tạo video mới"
                >
                    <VideoForm
                        onSubmit={handleCreate}
                        onCancel={() => setShowCreateModal(false)}
                        isLoading={submitting}
                        isAdmin={isAdmin}
                    />
                </Modal>
            )}

            {/* Edit Modal - chỉ cho admin */}
            {isAdmin && (
                <Modal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingVideo(null);
                    }}
                    title="Sửa video"
                >
                    <VideoForm
                        video={editingVideo || undefined}
                        onSubmit={handleUpdate}
                        onCancel={() => {
                            setShowEditModal(false);
                            setEditingVideo(null);
                        }}
                        isLoading={submitting}
                        isAdmin={isAdmin}
                    />
                </Modal>
            )}
        </div>
    );
};

export default VideoList;