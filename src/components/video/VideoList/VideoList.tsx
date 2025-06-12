// Component chính VideoList - FIXED infinite loop issues
// Sử dụng custom hooks và sub-components với proper lifecycle management
// Clean, focused, và tránh duplicate API calls

import React, { useEffect, useCallback } from 'react';
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
import Loading from '../../common/Loading/Loading';
import Modal from '../../common/Modal/Modal';
import Pagination from '../../common/Pagination/Pagination';
import { VideoFilterParams } from '../../../types/video.types';

const VideoList: React.FC = () => {
    const isAdmin = useIsAdmin();

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
        setEditingVideo
    } = useVideoList(isAdmin);

    const {
        filters,
        filterOptions,
        isFiltering,
        activeFiltersCount,
        loadingStaffList,
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
                    <VideoTable
                        videos={videos}
                        isAdmin={isAdmin}
                        isFiltering={isFiltering}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onViewDetail={handleViewDetail}
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
        </div>
    );
};

export default VideoList;