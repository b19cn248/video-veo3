// Component hiển thị một dòng video trong table
// Nhận props là thông tin video và các hàm callback

import React from 'react';
import { Video } from '../../../types/video.types';
import { formatVideoStatus, formatDate, formatCurrency, getStatusColor } from '../../../utils/formatters';

interface VideoItemProps {
    video: Video;                          // Dữ liệu video
    onEdit: (video: Video) => void;        // Hàm gọi khi click sửa
    onDelete: (id: number) => void;        // Hàm gọi khi click xóa
    onViewDetail: (id: number) => void;    // Hàm gọi khi click xem chi tiết
}

const VideoItem: React.FC<VideoItemProps> = ({ video, onEdit, onDelete, onViewDetail }) => {
    return (
        <tr>
            <td>{video.id}</td>
            <td>{video.customerName}</td>
            <td>
        <span className={`status-badge ${getStatusColor(video.status)}`}>
          {formatVideoStatus(video.status)}
        </span>
            </td>
            <td>{video.assignedStaff || '--'}</td>
            <td>{formatDate(video.deliveryTime || '')}</td>
            <td>{formatCurrency(video.orderValue)}</td>
            <td>{formatDate(video.createdAt)}</td>
            <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn btn-primary"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => onViewDetail(video.id)}
                    >
                        Xem
                    </button>
                    <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => onEdit(video)}
                    >
                        Sửa
                    </button>
                    <button
                        className="btn btn-danger"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => onDelete(video.id)}
                    >
                        Xóa
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default VideoItem;