// Component bảng hiển thị danh sách video
// Tách riêng để dễ maintain và customize
// Includes: table structure, headers, VideoItem rendering

import React from 'react';
import { Video } from '../../../../types/video.types';
import VideoItem from '../../VideoItem/VideoItem';
import VideoTableEmpty from './VideoTableEmpty';
import { tableStyles, columnWidths, createRowHoverEffect } from '../utils/videoListHelpers';

interface VideoTableProps {
    videos: Video[];
    isAdmin: boolean;
    isFiltering: boolean;
    onEdit: (video: Video) => void;
    onDelete: (id: number) => void;
    onViewDetail: (id: number) => void;
    onViewHistory: (videoId: number) => void;
    onVideoUpdate: (updatedVideo: Video) => void;
}

const VideoTable: React.FC<VideoTableProps> = ({
                                                   videos,
                                                   isAdmin,
                                                   isFiltering,
                                                   onEdit,
                                                   onDelete,
                                                   onViewDetail,
                                                   onViewHistory,
                                                   onVideoUpdate
                                               }) => {
    const colSpan = isAdmin ? 12 : 10; // UPDATED: Admin now has 12 columns (added bill image URL)

    return (
        <div style={tableStyles.container}>
            <table style={tableStyles.table}>
                <thead>
                <tr style={tableStyles.headerRow}>
                    <th style={{...tableStyles.headerCell, width: columnWidths.id}}>
                        Code
                    </th>

                    {/* Cột khách hàng - chỉ hiển thị cho admin */}
                    {isAdmin && (
                        <th style={{...tableStyles.headerCell, width: columnWidths.customer}}>
                            👤 Khách hàng
                        </th>
                    )}

                    {/* Cột người tạo - hiển thị cho tất cả người dùng */}
                    <th style={{...tableStyles.headerCell, width: columnWidths.creator}}>
                        ✍️ Người tạo
                    </th>

                    {/* Cột thời lượng - hiển thị cho tất cả người dùng */}
                    <th style={{...tableStyles.headerCell, width: columnWidths.duration}}>
                        ⏱️ Time
                    </th>

                    <th style={{...tableStyles.headerCell, width: columnWidths.status}}>
                        🔄 Trạng thái
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '400',
                            color: '#64748b',
                            marginTop: '2px'
                        }}>
                            Click để sửa
                        </div>
                    </th>

                    <th style={{...tableStyles.headerCell, width: columnWidths.staff}}>
                        🎯 Nhân viên
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '400',
                            color: '#64748b',
                            marginTop: '2px'
                        }}>
                            Nhận việc | Đã giao
                        </div>
                    </th>


                    <th style={{...tableStyles.headerCell, width: columnWidths.delivery}}>
                        🚚 Giao hàng
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '400',
                            color: '#64748b',
                            marginTop: '2px'
                        }}>
                            Click để sửa
                        </div>
                    </th>

                    <th style={{...tableStyles.headerCell, width: columnWidths.payment}}>
                        💰 Thanh toán
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '400',
                            color: '#64748b',
                            marginTop: '2px'
                        }}>
                            Click để sửa
                        </div>
                    </th>

                    <th style={{...tableStyles.headerCell, width: columnWidths.paymentDate}}>
                        📅 Ngày TT
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '400',
                            color: '#64748b',
                            marginTop: '2px'
                        }}>
                            Ngày thanh toán
                        </div>
                    </th>

                    <th style={{...tableStyles.headerCell, width: columnWidths.videoUrl}}>
                        🎥 Link video
                    </th>

                    {/* Bill Image URL Column - chỉ hiển thị cho admin */}
                    {isAdmin && (
                        <th style={{...tableStyles.headerCell, width: columnWidths.billImageUrl}}>
                            🧾 Ảnh hóa đơn
                        </th>
                    )}

                    <th style={{...tableStyles.headerCell, width: columnWidths.actions}}>
                        ⚙️ Thao tác
                    </th>
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
                            onViewHistory={onViewHistory}
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