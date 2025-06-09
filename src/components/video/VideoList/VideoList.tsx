// Component chính hiển thị danh sách video
// Đây là component phức tạp nhất, quản lý nhiều state và logic

import React, { useState, useEffect } from 'react';
import { Video, VideoStatus, VideoFilter } from '../../../types/video.types';
import { VideoService } from '../../../services/videoService';
import { formatVideoStatus } from '../../../utils/formatters';
import VideoItem from '../VideoItem/VideoItem';
import VideoForm from '../VideoForm/VideoForm';
import Loading from '../../common/Loading/Loading';
import Modal from '../../common/Modal/Modal';
import Pagination from '../../common/Pagination/Pagination';

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

    // Hàm tìm kiếm theo tên khách hàng
    const handleSearch = async () => {
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

    // Hàm xử lý tạo video mới
    const handleCreate = async (videoData: any) => {
        try {
            setSubmitting(true);
            const response = await VideoService.createVideo(videoData);

            if (response.success) {
                setShowCreateModal(false);
                if (!isFiltering) {
                    loadVideos(); // Reload list
                }
                alert('Tạo video thành công!');
            } else {
                alert('Lỗi: ' + response.message);
            }
        } catch (err) {
            alert('Lỗi khi tạo video');
            console.error('Error creating video:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Hàm xử lý sửa video
    const handleEdit = (video: Video) => {
        setEditingVideo(video);
        setShowEditModal(true);
    };

    // Hàm xử lý cập nhật video
    const handleUpdate = async (videoData: any) => {
        if (!editingVideo) return;

        try {
            setSubmitting(true);
            const response = await VideoService.updateVideo(editingVideo.id, videoData);

            if (response.success) {
                setShowEditModal(false);
                setEditingVideo(null);
                if (!isFiltering) {
                    loadVideos();
                }
                alert('Cập nhật video thành công!');
            } else {
                alert('Lỗi: ' + response.message);
            }
        } catch (err) {
            alert('Lỗi khi cập nhật video');
            console.error('Error updating video:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Hàm xử lý xóa video
    const handleDelete = async (id: number) => {
        // if (!confirm('Bạn có chắc chắn muốn xóa video này?')) return;

        try {
            const response = await VideoService.deleteVideo(id);

            if (response.success) {
                if (!isFiltering) {
                    loadVideos();
                }
                alert('Xóa video thành công!');
            } else {
                alert('Lỗi: ' + response.message);
            }
        } catch (err) {
            alert('Lỗi khi xóa video');
            console.error('Error deleting video:', err);
        }
    };

    // Hàm xử lý xem chi tiết (placeholder)
    const handleViewDetail = (id: number) => {
        alert(`Xem chi tiết video ID: ${id}`);
        // TODO: Navigate to detail page
    };

    // Hàm xử lý đổi trang
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div>
            {/* Search and Filter Bar */}
            <div className="search-bar">
                <div className="search-input">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                <button onClick={handleSearch} className="btn btn-primary">
                    Tìm kiếm
                </button>

                <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value as VideoStatus | '')}
                    className="form-select"
                    style={{ width: '200px' }}
                >
                    <option value="">Tất cả trạng thái</option>
                    {Object.values(VideoStatus).map(status => (
                        <option key={status} value={status}>
                            {formatVideoStatus(status)}
                        </option>
                    ))}
                </select>

                {isFiltering && (
                    <button onClick={resetFilters} className="btn btn-secondary">
                        Bỏ lọc
                    </button>
                )}

                <button onClick={() => setShowCreateModal(true)} className="btn btn-success">
                    + Tạo video mới
                </button>
            </div>

            {/* Summary */}
            <div style={{ marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '8px' }}>
                <p>
                    <strong>Tổng cộng:</strong> {totalElements} video
                    {isFiltering && <span style={{ color: '#666' }}> (đã lọc)</span>}
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="error">
                    {error}
                </div>
            )}

            {/* Loading Display */}
            {loading && <Loading message="Đang tải danh sách video..." />}

            {/* Video Table */}
            {!loading && !error && (
                <>
                    <table className="table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Khách hàng</th>
                            <th>Trạng thái</th>
                            <th>Nhân viên</th>
                            <th>Thời gian giao</th>
                            <th>Giá trị</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {videos.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    {isFiltering ? 'Không tìm thấy video nào' : 'Chưa có video nào'}
                                </td>
                            </tr>
                        ) : (
                            videos.map(video => (
                                <VideoItem
                                    key={video.id}
                                    video={video}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onViewDetail={handleViewDetail}
                                />
                            ))
                        )}
                        </tbody>
                    </table>

                    {/* Pagination - chỉ hiển thị khi không filter */}
                    {!isFiltering && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            hasNext={hasNext}
                            hasPrevious={hasPrevious}
                        />
                    )}
                </>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Tạo video mới"
            >
                <VideoForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowCreateModal(false)}
                    isLoading={submitting}
                />
            </Modal>

            {/* Edit Modal */}
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
                />
            </Modal>
        </div>
    );
};

export default VideoList;