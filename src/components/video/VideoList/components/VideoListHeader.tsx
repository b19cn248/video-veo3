// Component header cho VideoList
// Hiển thị tips và hướng dẫn sử dụng cho user
// Simple, focused component chỉ làm một việc

import React from 'react';

const VideoListHeader: React.FC = () => {
    return (
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
            💡 <strong>Mẹo:</strong> Sử dụng <strong>Filter nâng cao</strong> để tìm video nhanh chóng!
            Click trực tiếp vào <strong>Trạng thái</strong>, <strong>Giao hàng</strong>, <strong>Thanh toán</strong> hoặc <strong>Link video</strong> trong bảng để cập nhật nhanh!
            🎯 Nút <strong>"Nhận việc"</strong> để tự assign video cho mình.
        </div>
    );
};

export default VideoListHeader;