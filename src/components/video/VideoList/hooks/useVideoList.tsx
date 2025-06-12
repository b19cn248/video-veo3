// Custom hook quản lý logic chính của VideoList
// FIXED: Tối ưu re-renders và loại bỏ duplicate API calls
// Includes: video CRUD operations, pagination, modals với proper memoization

import { useState, useEffect, useCallback, useRef } from 'react';
import { Video, VideoFilterParams } from '../../../../types/video.types';
import { VideoService } from '../../../../services/videoService';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/videoListHelpers';

interface UseVideoListReturn {
    // Data states
    videos: Video[];
    loading: boolean;
    error: string | null;

    // Pagination states
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;

    // Modal states
    showCreateModal: boolean;
    showEditModal: boolean;
    editingVideo: Video | null;
    submitting: boolean;

    // Actions - STABLE references
    loadVideos: (filters?: VideoFilterParams) => Promise<void>;
    handleCreate: (videoData: any) => Promise<void>;
    handleEdit: (video: Video) => void;
    handleUpdate: (videoData: any) => Promise<void>;
    handleDelete: (id: number) => Promise<void>;
    handleViewDetail: (id: number) => void;
    handleVideoUpdate: (updatedVideo: Video) => void;
    handlePageChange: (page: number) => void;

    // Modal actions
    setShowCreateModal: (show: boolean) => void;
    setShowEditModal: (show: boolean) => void;
    setEditingVideo: (video: Video | null) => void;
}

export const useVideoList = (isAdmin: boolean): UseVideoListReturn => {
    // Data states
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    // NEW: Ref để track current filters và tránh duplicate calls
    const currentFiltersRef = useRef<VideoFilterParams | undefined>(undefined);
    const loadingRef = useRef(false);

    // FIXED: Stable loadVideos function với proper memoization
    const loadVideos = useCallback(async (filters?: VideoFilterParams) => {
        // Tránh duplicate calls
        if (loadingRef.current) {
            console.log('Already loading, skipping duplicate call');
            return;
        }

        try {
            loadingRef.current = true;
            setLoading(true);
            setError(null);

            console.log('Loading videos with filters:', filters, 'page:', currentPage);

            const response = await VideoService.getVideos(
                currentPage,
                10,
                'createdAt',
                'desc',
                filters
            );

            if (response.success) {
                setVideos(response.data);
                setTotalPages(response.pagination.totalPages);
                setTotalElements(response.pagination.totalElements);
                setHasNext(response.pagination.hasNext);
                setHasPrevious(response.pagination.hasPrevious);

                // Update current filters ref
                currentFiltersRef.current = filters;
            } else {
                setError('Không thể tải danh sách video');
            }
        } catch (err) {
            setError('Lỗi kết nối đến server');
            console.error('Error loading videos:', err);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [currentPage]); // Chỉ depend vào currentPage

    // Tạo video mới - chỉ admin
    const handleCreate = useCallback(async (videoData: any) => {
        if (!isAdmin) return;

        try {
            setSubmitting(true);
            const response = await VideoService.createVideo(videoData);

            if (response.success) {
                setShowCreateModal(false);
                // Reload with current filters
                await loadVideos(currentFiltersRef.current);
                showToast('Tạo video thành công!', 'success');
            } else {
                showToast('Lỗi: ' + response.message, 'error');
            }
        } catch (err) {
            showToast('Lỗi khi tạo video', 'error');
            console.error('Error creating video:', err);
        } finally {
            setSubmitting(false);
        }
    }, [isAdmin, loadVideos]);

    // Mở modal edit
    const handleEdit = useCallback((video: Video) => {
        if (!isAdmin) return;
        setEditingVideo(video);
        setShowEditModal(true);
    }, [isAdmin]);

    // Cập nhật video - chỉ admin
    const handleUpdate = useCallback(async (videoData: any) => {
        if (!editingVideo || !isAdmin) return;

        try {
            setSubmitting(true);
            const response = await VideoService.updateVideo(editingVideo.id, videoData);

            if (response.success) {
                setShowEditModal(false);
                setEditingVideo(null);
                // Reload with current filters
                await loadVideos(currentFiltersRef.current);
                showToast('Cập nhật video thành công!', 'success');
            } else {
                showToast('Lỗi: ' + response.message, 'error');
            }
        } catch (err) {
            showToast('Lỗi khi cập nhật video', 'error');
            console.error('Error updating video:', err);
        } finally {
            setSubmitting(false);
        }
    }, [editingVideo, isAdmin, loadVideos]);

    // Xóa video - chỉ admin
    const handleDelete = useCallback(async (id: number) => {
        if (!isAdmin) return;

        try {
            const response = await VideoService.deleteVideo(id);

            if (response.success) {
                // Reload with current filters
                await loadVideos(currentFiltersRef.current);
                showToast('Xóa video thành công!', 'success');
            } else {
                showToast('Lỗi: ' + response.message, 'error');
            }
        } catch (err) {
            showToast('Lỗi khi xóa video', 'error');
            console.error('Error deleting video:', err);
        }
    }, [isAdmin, loadVideos]);

    // Xem chi tiết video
    const handleViewDetail = useCallback((id: number) => {
        navigate(`/videos/${id}`);
    }, [navigate]);

    // Cập nhật video từ inline editing
    const handleVideoUpdate = useCallback((updatedVideo: Video) => {
        setVideos(prevVideos =>
            prevVideos.map(video =>
                video.id === updatedVideo.id ? updatedVideo : video
            )
        );
    }, []);

    // Thay đổi trang
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    return {
        // Data states
        videos,
        loading,
        error,

        // Pagination states
        currentPage,
        totalPages,
        totalElements,
        hasNext,
        hasPrevious,

        // Modal states
        showCreateModal,
        showEditModal,
        editingVideo,
        submitting,

        // Actions - All stable references
        loadVideos,
        handleCreate,
        handleEdit,
        handleUpdate,
        handleDelete,
        handleViewDetail,
        handleVideoUpdate,
        handlePageChange,

        // Modal actions
        setShowCreateModal,
        setShowEditModal,
        setEditingVideo
    };
};