// Utility functions để xử lý lỗi và extract message từ API response
// Cung cấp các hàm tiện ích để xử lý lỗi một cách nhất quán trong toàn bộ ứng dụng

/**
 * Interface định nghĩa cấu trúc lỗi từ API
 */
interface ApiErrorResponse {
    data: null;
    success: false;
    tenantId: string;
    message: string;
    error: string;
    timestamp: number;
    status: number;
}

/**
 * Interface cho axios error response
 */
interface AxiosError {
    response?: {
        data?: ApiErrorResponse;
        status?: number;
    };
    message?: string;
}

/**
 * Trích xuất message lỗi từ API response
 * Ưu tiên: API message > HTTP status message > Generic error message
 * 
 * @param error - Error object từ API call
 * @param fallbackMessage - Message mặc định nếu không extract được
 * @returns Message lỗi để hiển thị cho user
 */
export const extractErrorMessage = (error: any, fallbackMessage: string = 'Đã có lỗi xảy ra'): string => {
    // Kiểm tra nếu error có response.data.message (format API chuẩn)
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }
    
    // Kiểm tra nếu error có response.data và data có message property
    if (error?.response?.data && typeof error.response.data === 'object') {
        const data = error.response.data;
        if (data.message) {
            return data.message;
        }
        // Fallback: kiểm tra error property
        if (data.error && typeof data.error === 'string') {
            return data.error;
        }
    }
    
    // Kiểm tra HTTP status specific messages
    if (error?.response?.status) {
        const status = error.response.status;
        switch (status) {
            case 400:
                return 'Dữ liệu không hợp lệ';
            case 401:
                return 'Bạn cần đăng nhập để thực hiện thao tác này';
            case 403:
                return 'Bạn không có quyền thực hiện thao tác này';
            case 404:
                return 'Không tìm thấy tài nguyên yêu cầu';
            case 409:
                return 'Dữ liệu đã tồn tại hoặc xung đột';
            case 422:
                return 'Dữ liệu không đúng định dạng';
            case 500:
                return 'Lỗi máy chủ nội bộ';
            case 502:
                return 'Máy chủ không phản hồi';
            case 503:
                return 'Dịch vụ tạm thời không khả dụng';
            default:
                return `Lỗi HTTP ${status}`;
        }
    }
    
    // Kiểm tra network error
    if (error?.message) {
        if (error.message.includes('Network Error') || error.message.includes('net::')) {
            return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet';
        }
        if (error.message.includes('timeout')) {
            return 'Thời gian chờ quá lâu. Vui lòng thử lại';
        }
        // Trả về error message gốc nếu có
        return error.message;
    }
    
    // Trả về fallback message
    return fallbackMessage;
};

/**
 * Tạo error message cho các thao tác CRUD và các operations khác
 * 
 * @param operation - Loại thao tác (create, update, delete, fetch, search, cancel, check)
 * @param resource - Tên tài nguyên (video, staff, etc.)
 * @param error - Error object
 * @returns Message lỗi cụ thể cho thao tác
 */
export const createOperationErrorMessage = (
    operation: 'create' | 'update' | 'delete' | 'fetch' | 'search' | 'cancel' | 'check',
    resource: string,
    error: any
): string => {
    const apiMessage = extractErrorMessage(error, '');
    
    // Nếu có message từ API, ưu tiên sử dụng
    if (apiMessage && apiMessage !== 'Đã có lỗi xảy ra') {
        return apiMessage;
    }
    
    // Fallback sang message cụ thể theo operation
    const operationMap = {
        create: `Lỗi khi tạo ${resource}`,
        update: `Lỗi khi cập nhật ${resource}`,
        delete: `Lỗi khi xóa ${resource}`,
        fetch: `Lỗi khi tải ${resource}`,
        search: `Lỗi khi tìm kiếm ${resource}`,
        cancel: `Lỗi khi hủy ${resource}`,  // NEW: Thêm cancel operation
        check: `Lỗi khi kiểm tra ${resource}`   // NEW: Thêm check operation
    };
    
    return operationMap[operation];
};

/**
 * Xử lý lỗi validation từ backend
 * 
 * @param error - Error object có thể chứa validation errors
 * @returns Array of validation error messages
 */
export const extractValidationErrors = (error: any): string[] => {
    const errors: string[] = [];
    
    // Kiểm tra nếu có validation errors trong response
    if (error?.response?.data?.validationErrors) {
        const validationErrors = error.response.data.validationErrors;
        if (Array.isArray(validationErrors)) {
            errors.push(...validationErrors);
        } else if (typeof validationErrors === 'object') {
            // Nếu validation errors là object, lấy tất cả values
            Object.values(validationErrors).forEach(errorMsg => {
                if (typeof errorMsg === 'string') {
                    errors.push(errorMsg);
                }
            });
        }
    }
    
    // Nếu không có validation errors cụ thể, trả về main message
    if (errors.length === 0) {
        const mainMessage = extractErrorMessage(error);
        if (mainMessage) {
            errors.push(mainMessage);
        }
    }
    
    return errors;
};

/**
 * Kiểm tra xem error có phải là lỗi authentication không
 * 
 * @param error - Error object
 * @returns true nếu là auth error
 */
export const isAuthenticationError = (error: any): boolean => {
    return error?.response?.status === 401;
};

/**
 * Kiểm tra xem error có phải là lỗi authorization không
 * 
 * @param error - Error object
 * @returns true nếu là authorization error
 */
export const isAuthorizationError = (error: any): boolean => {
    return error?.response?.status === 403;
};

/**
 * Kiểm tra xem error có phải là network error không
 * 
 * @param error - Error object
 * @returns true nếu là network error
 */
export const isNetworkError = (error: any): boolean => {
    return !error?.response && error?.message && (
        error.message.includes('Network Error') || 
        error.message.includes('net::') ||
        error.message.includes('timeout')
    );
};

/**
 * Tạo user-friendly error message cho từng loại lỗi
 * 
 * @param error - Error object
 * @param context - Context của lỗi (optional)
 * @returns User-friendly error message
 */
export const createUserFriendlyErrorMessage = (error: any, context?: string): string => {
    if (isNetworkError(error)) {
        return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.';
    }
    
    if (isAuthenticationError(error)) {
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    
    if (isAuthorizationError(error)) {
        return 'Bạn không có quyền thực hiện thao tác này.';
    }
    
    // Trích xuất message từ API
    const apiMessage = extractErrorMessage(error);
    
    // Nếu có context, thêm vào message
    if (context && apiMessage === 'Đã có lỗi xảy ra') {
        return `Lỗi khi ${context}`;
    }
    
    return apiMessage;
};
