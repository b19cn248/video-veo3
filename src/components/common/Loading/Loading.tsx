// Component hiển thị loading spinner
// Đây là functional component đơn giản nhất trong React

import React from 'react';

// Interface định nghĩa props mà component này nhận
interface LoadingProps {
    message?: string; // Thông điệp tùy chọn
}

// Functional Component với TypeScript
// Props là cách truyền dữ liệu từ component cha xuống component con
const Loading: React.FC<LoadingProps> = ({ message = 'Đang tải...' }) => {
    return (
        <div className="loading">
            <div className="loading-spinner"></div>
            <p>{message}</p>
        </div>
    );
};

export default Loading;