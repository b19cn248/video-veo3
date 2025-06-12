// Component bảng hiển thị danh sách video
// Tách riêng để dễ maintain và customize
// Includes: table structure, headers, VideoItem rendering

import React from 'react';
import { Video } from '../../../../types/video.types';
import VideoItem from '../../VideoItem/VideoItem';
import VideoTableEmpty from './VideoTableEmpty';
import { tableStyles } from '../utils/videoListHelpers';

interface VideoTableProps {
    videos: Video[];
    isAdmin: boolean;
    isFiltering: boolean;
    onEdit: (video: Video) => void;
    onDelete: (id: number) => void;
    onViewDetail: (id: number) => void;
    onVideoUpdate: (updatedVideo: Video) => void;
}

const VideoTable: React.FC<VideoTableProps> = ({
                                                   videos,
                                                   isAdmin,
                                                   isFiltering,
                                                   onEdit,
                                                   onDelete,
                                                   onViewDetail,
                                                   onVideoUpdate
                                               }) => {
    const colSpan = isAdmin ? 12 : 10;

    return (
        <div style={tableStyles.container}>
            <table style={tableStyles.table}>
                <thead>
                <tr style={tableStyles.headerRow}>
                    <th style={tableStyles.headerCell}>ID</th>

                    {/* Cột khách hàng - chỉ hiển thị cho admin */}
                    {isAdmin && (
                        <th style={tableStyles.headerCell}>Khách hàng</th>
                    )}

                    {/* Cột người tạo - chỉ hiển thị cho admin */}
                    {isAdmin && (
                        <th style={tableStyles.headerCell}>
                            👤 Người tạo
                        </th>
                    )}

                    <th style={tableStyles.headerCell}>
                        🔄 Trạng thái
                        <div style={{
                            fontSize: '10px',
                            fontWeight: '400',
                            color: '#6b7280'
                        }}>
                            Click để sửa
                        </div>
                    </th>

                    <th style={tableStyles.headerCell}>
                        🎯 Nhân viên
                        <div style={{
                            fontSize: '10px',
                            fontWeight: '400',
                            color: '#6b7280'
                        }}>
                            Nhận việc | Đã giao
                        </div>
                    </th>

                    <th style={tableStyles.headerCell}>Time</th>
                    <th style={tableStyles.headerCell}>Tiền</th>
                    <th style={tableStyles.headerCell}>Ngày tạo</th>

                    <th style={tableStyles.headerCell}>
                        🚚 Giao hàng
                        <div style={{
                            fontSize: '10px',
                            fontWeight: '400',
                            color: '#6b7280'
                        }}>
                            Click để sửa
                        </div>
                    </th>

                    <th style={tableStyles.headerCell}>
                        💰 Thanh toán
                        <div style={{
                            fontSize: '10px',
                            fontWeight: '400',
                            color: '#6b7280'
                        }}>
                            Click để sửa
                        </div>
                    </th>

                    <th style={tableStyles.headerCell}>
                        🎥 Link video
                        <div style={{
                            fontSize: '10px',
                            fontWeight: '400',
                            color: '#6b7280'
                        }}>
                            Click để sửa | 📋 Copy
                        </div>
                    </th>

                    <th style={tableStyles.headerCell}>Thao tác</th>
                </tr>
                </thead>

                <tbody>
                {videos.length === 0 ? (
                    <VideoTableEmpty
                        isFiltering={isFiltering}
                        isAdmin={isAdmin}
                        colSpan={colSpan}
                    />
                ) : (
                    videos.map((video) => (
                        <VideoItem
                            key={video.id}
                            video={video}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onViewDetail={onViewDetail}
                            onVideoUpdate={onVideoUpdate}
                            isAdmin={isAdmin}
                        />
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
};

export default VideoTable;