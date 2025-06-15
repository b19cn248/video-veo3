// Component chính VideoList - FIXED infinite loop issues
// Sử dụng custom hooks và sub-components với proper lifecycle management
// Clean, focused, và tránh duplicate API calls

import React, { useEffect, useCallback, useState } from 'react';
import { useIsAdmin } from '../../../contexts/AuthContext';
import { useVideoList } from './hooks/useVideoList';
import { useVideoFilters } from './hooks/useVideoFilters';

// Import sub-components
import VideoListHeader from './components/VideoListHeader';
import AdvancedFilterBar from './components/AdvancedFilterBar';
import CustomerSearchStatus from './components/CustomerSearchStatus'; // NEW: Customer search status
import VideoSummary from './components/VideoSummary';
import VideoTable from './components/VideoTable';
import VideoForm from '../VideoForm/VideoForm';
import VideoDetailModal from '../VideoDetail/VideoDetailModal'; // NEW: Import modal chi tiết
import VideoHistory from '../VideoHistory/VideoHistory'; // NEW: Import shared VideoHistory
import Loading from '../../common/Loading/Loading';
import Modal from '../../common/Modal/Modal';
import Pagination from '../../common/Pagination/Pagination';
import ErrorDisplay from '../../common/ErrorDisplay/ErrorDisplay';
import { VideoFilterParams } from '../../../types/video.types';

const VideoList: React.FC = () => {
    const isAdmin = useIsAdmin();
    
    // State for shared VideoHistory modal
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyVideoId, setHistoryVideoId] = useState<number | null>(null);

    // Custom hooks để tách logic
    const {
        videos,
        loading,
        error,
        currentPage,
        totalPages,
        totalElements,
        hasNext,
        hasPrevious,
        showCreateModal,
        showEditModal,
        showDetailModal, // NEW: Modal chi tiết
        detailVideoId, // NEW: ID video đang xem chi tiết
        editingVideo,
        submitting,
        loadVideos,
        handleCreate,
        handleEdit,
        handleUpdate,
        handleDelete,
        handleViewDetail,
        handleVideoUpdate,
        handlePageChange,
        setShowCreateModal,
        setShowEditModal,
        setShowDetailModal, // NEW: Set modal chi tiết
        setDetailVideoId, // NEW: Set ID video chi tiết
        setEditingVideo
    } = useVideoList(isAdmin);

    const {
        filters,
        filterOptions,
        isFiltering,
        activeFiltersCount,
        loadingStaffList,
        loadingCreatorsList,
        handleFilterChange,
        resetAllFilters,
        loadFilterOptions,
        getFilterParams,
        setOnFiltersChangeCallback
    } = useVideoFilters() as any; // Type assertion để access internal method

    // FIXED: Stable callback cho filters change
    const handleFiltersChange = useCallback((filterParams: VideoFilterParams | undefined) => {
        console.log('Filters changed:', filterParams);
        loadVideos(filterParams);
    }, [loadVideos]);

    // Setup callback connection giữa hooks một lần duy nhất
    useEffect(() => {
        setOnFiltersChangeCallback(handleFiltersChange);
    }, [setOnFiltersChangeCallback, handleFiltersChange]);

    // Handle view history action
    const handleViewHistory = useCallback((videoId: number) => {
        setHistoryVideoId(videoId);
        setShowHistoryModal(true);
    }, []);

    // FIXED: Load data lần đầu chỉ khi mount, không phụ thuộc vào currentPage
    useEffect(() => {
        let mounted = true;

        const initialLoad = async () => {
            if (mounted) {
                console.log('Initial load for page:', currentPage);
                await loadVideos(getFilterParams());
            }
        };

        initialLoad();

        return () => {
            mounted = false;
        };
    }, [currentPage]); // Chỉ khi currentPage thay đổi thì load lại

    return (
        <div>
            {/* Header với tips */}
            <VideoListHeader />

            {/* Advanced Filter Bar */}
            <AdvancedFilterBar
                filters={filters}
                filterOptions={filterOptions}
                activeFiltersCount={activeFiltersCount}
                loadingStaffList={loadingStaffList}
                loadingCreatorsList={loadingCreatorsList}
                isAdmin={isAdmin}
                onFilterChange={handleFilterChange}
                onResetAllFilters={resetAllFilters}
                onRefreshStaffList={loadFilterOptions}
                onCreateNew={() => setShowCreateModal(true)}
            />

            {/* NEW: Customer Search Status - chỉ hiển thị cho admin khi đang search */}
            {isAdmin && filters.customerName && (
                <CustomerSearchStatus
                    customerName={filters.customerName}
                    totalResults={totalElements}
                    isSearching={loading}
                    onClearSearch={() => handleFilterChange('customerName', '')}
                />
            )}

            {/* Summary thông tin */}
            <VideoSummary
                totalElements={totalElements}
                currentPage={currentPage}
                totalPages={totalPages}
                isFiltering={isFiltering}
                activeFiltersCount={activeFiltersCount}
                loading={loading}
            />

            {/* Error Display - sử dụng component ErrorDisplay */}
            {error && (
                <ErrorDisplay 
                    message={error}
                    type="error"
                    style={{ marginBottom: '20px' }}
                />
            )}

            {/* Loading Display */}
            {loading && <Loading message="Đang tải danh sách video..." />}

            {/* Video Table */}
            {!loading && !error && (
                <>
                    <VideoTable
                        videos={videos}
                        isAdmin={isAdmin}
                        isFiltering={isFiltering}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onViewDetail={handleViewDetail}
                        onViewHistory={handleViewHistory}
                        onVideoUpdate={handleVideoUpdate}
                    />

                    {/* Pagination */}
                    {totalPages > 1 && (
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

            {/* NEW: Video Detail Modal - cho tất cả user */}
            <VideoDetailModal
                isOpen={showDetailModal}
                videoId={detailVideoId}
                onClose={() => {
                    setShowDetailModal(false);
                    setDetailVideoId(null);
                }}
            />

            {/* NEW: Shared VideoHistory Modal */}
            {historyVideoId && (
                <VideoHistory 
                    videoId={historyVideoId}
                    isOpen={showHistoryModal}
                    onClose={() => {
                        setShowHistoryModal(false);
                        setHistoryVideoId(null);
                    }}
                />
            )}
        </div>
    );
};

export default VideoList;