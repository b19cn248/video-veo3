// Component hiển thị thông tin tổng quan về danh sách video
// Tách riêng để dễ maintain và customize
// Includes: total count, filter info, pagination info

import React from 'react';

interface VideoSummaryProps {
    totalElements: number;
    currentPage: number;
    totalPages: number;
    isFiltering: boolean;
    activeFiltersCount: number;
    loading: boolean;
}

const VideoSummary: React.FC<VideoSummaryProps> = ({
                                                       totalElements,
                                                       currentPage,
                                                       totalPages,
                                                       isFiltering,
                                                       activeFiltersCount,
                                                       loading
                                                   }) => {
    return (
        <div style={{
            marginBottom: '20px',
            background: 'white',
            padding: '16px 20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <div>
                    <strong>Tổng cộng:</strong> {totalElements} video
                    {isFiltering && (
                        <span style={{
                            color: '#3b82f6',
                            fontStyle: 'italic',
                            fontSize: '13px',
                            marginLeft: '8px'
                        }}>
                            (đã lọc với {activeFiltersCount} tiêu chí)
                        </span>
                    )}
                </div>
            </div>
            <div style={{
                fontSize: '12px',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                {loading && (
                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#3b82f6'
                    }}>
                        ⏳ Đang tải...
                    </span>
                )}
                <span>Trang {currentPage + 1} / {totalPages || 1}</span>
            </div>
        </div>
    );
};

export default VideoSummary;