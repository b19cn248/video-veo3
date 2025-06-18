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
 * Format date với pattern tùy chọn
 * @param dateString ISO date string hoặc Date object
 * @param pattern Pattern format (DD/MM/YYYY, HH:mm:ss, etc.)
 * @returns string Ngày đã format
 */
export const formatDate = (dateString: string, pattern: string): string => {
    if (!dateString) return '--';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--';
    
    // Lấy các thành phần ngày
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    // Thay thế pattern
    return pattern
        .replace(/DD/g, day)
        .replace(/MM/g, month)
        .replace(/YYYY/g, String(year))
        .replace(/HH/g, hours)
        .replace(/mm/g, minutes)
        .replace(/ss/g, seconds);
};