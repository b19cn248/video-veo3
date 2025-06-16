// Utility functions cho xử lý ngày tháng trong Staff Salaries
// Tách riêng để dễ test và maintain

/**
 * Lấy ngày hiện tại theo format yyyy-MM-dd
 * @returns string Ngày hiện tại
 */
export const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

/**
 * Format ngày từ yyyy-MM-dd sang định dạng hiển thị
 * @param dateString Ngày theo format yyyy-MM-dd
 * @returns string Ngày đã format để hiển thị
 */
export const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Kiểm tra xem ngày có phải hôm nay không
 * @param dateString Ngày theo format yyyy-MM-dd
 * @returns boolean True nếu là hôm nay
 */
export const isToday = (dateString: string): boolean => {
    return dateString === getTodayDate();
};

/**
 * Tạo label hiển thị cho date selector
 * @param dateString Ngày theo format yyyy-MM-dd
 * @returns string Label để hiển thị
 */
export const createDateLabel = (dateString: string): string => {
    if (isToday(dateString)) {
        return `Hôm nay (${formatDateForDisplay(dateString)})`;
    }
    return formatDateForDisplay(dateString);
};

/**
 * Validate date string format
 * @param dateString Ngày cần validate
 * @returns boolean True nếu format đúng
 */
export const isValidDateFormat = (dateString: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
        return false;
    }
    
    const date = new Date(dateString);
    return date.toISOString().startsWith(dateString);
};

/**
 * Tính khoảng cách thời gian từ một ngày đến hiện tại (dạng "X phút trước", "X giờ trước", etc.)
 * @param date Ngày cần tính khoảng cách
 * @returns string Mô tả khoảng cách thời gian
 */
export const formatDistanceToNow = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
        return 'Vừa xong';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
    } else {
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
};