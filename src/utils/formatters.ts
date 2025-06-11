import { VideoStatus, DeliveryStatus, PaymentStatus } from '../types/video.types';

// Chuyển đổi enum sang text tiếng Việt để hiển thị
export const formatVideoStatus = (status: VideoStatus): string => {
    const statusMap = {
        [VideoStatus.CHUA_AI_NHAN]: 'Chưa ai nhận',
        [VideoStatus.DANG_LAM]: 'Đang làm',
        [VideoStatus.DA_XONG]: 'Đã xong',
        [VideoStatus.DANG_SUA]: 'Đang sửa',
        [VideoStatus.DA_SUA_XONG]: 'Đã sửa xong'
    };
    return statusMap[status] || status;
};

// UPDATED: Thêm format cho CAN_SUA_GAP
export const formatDeliveryStatus = (status: DeliveryStatus): string => {
    const statusMap = {
        [DeliveryStatus.DA_GUI]: 'Đã gửi',
        [DeliveryStatus.CHUA_GUI]: 'Chưa gửi',
        [DeliveryStatus.CAN_SUA_GAP]: 'Cần sửa gấp'  // Thêm format cho trạng thái mới
    };
    return statusMap[status] || status;
};

export const formatPaymentStatus = (status: PaymentStatus): string => {
    const statusMap = {
        [PaymentStatus.DA_THANH_TOAN]: 'Đã thanh toán',
        [PaymentStatus.CHUA_THANH_TOAN]: 'Chưa thanh toán',
        [PaymentStatus.BUNG]: 'Bùng'
    };
    return statusMap[status] || status;
};

// Format ngày tháng từ ISO string sang định dạng dd/mm/yyyy
export const formatDate = (dateString: string): string => {
    if (!dateString) return '--';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return '--';
    }
};

// Format thời lượng video từ số giây sang HH:mm:ss
export const formatVideoDuration = (seconds: number | undefined): string => {
    if (!seconds || seconds === 0) return '--';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Chuyển đổi từ format HH:mm:ss sang số giây (utility function)
export const timeStringToSeconds = (timeString: string): number => {
    if (!timeString || timeString.trim() === '') return 0;

    const parts = timeString.split(':');
    if (parts.length !== 3) return 0;

    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;

    return hours * 3600 + minutes * 60 + seconds;
};

// Chuyển đổi từ số giây sang format HH:mm:ss (utility function)
export const secondsToTimeString = (seconds: number): string => {
    if (!seconds || seconds === 0) return '';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Format số tiền với dấu phẩy ngăn cách
export const formatCurrency = (amount: number | undefined): string => {
    if (!amount) return '--';

    return amount.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND'
    });
};

// UPDATED: Thêm color mapping cho CAN_SUA_GAP
// Lấy màu CSS class theo trạng thái
export const getStatusColor = (status: VideoStatus | DeliveryStatus | PaymentStatus): string => {
    const colorMap = {
        // Video status colors
        [VideoStatus.CHUA_AI_NHAN]: 'status-pending',
        [VideoStatus.DANG_LAM]: 'status-working',
        [VideoStatus.DA_XONG]: 'status-completed',
        [VideoStatus.DANG_SUA]: 'status-editing',
        [VideoStatus.DA_SUA_XONG]: 'status-edit-completed',

        // Delivery status colors - UPDATED: Thêm CAN_SUA_GAP
        [DeliveryStatus.CHUA_GUI]: 'status-pending',
        [DeliveryStatus.DA_GUI]: 'status-completed',
        [DeliveryStatus.CAN_SUA_GAP]: 'status-urgent',  // Thêm class mới cho trạng thái urgent

        // Payment status colors
        [PaymentStatus.CHUA_THANH_TOAN]: 'status-pending',
        [PaymentStatus.DA_THANH_TOAN]: 'status-completed',
        [PaymentStatus.BUNG]: 'status-danger'
    };
    return colorMap[status] || 'status-default';
};