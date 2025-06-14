// Định nghĩa các kiểu dữ liệu cho Video
// TypeScript giúp chúng ta kiểm tra lỗi ngay khi viết code
// UPDATED: Thêm CAN_SUA_GAP cho DeliveryStatus
// UPDATED: Thêm VideoFilterParams cho filter nâng cao

export enum VideoStatus {
    CHUA_AI_NHAN = 'CHUA_AI_NHAN',
    DANG_LAM = 'DANG_LAM',
    DA_XONG = 'DA_XONG',
    DANG_SUA = 'DANG_SUA',
    DA_SUA_XONG = 'DA_SUA_XONG'
}

// UPDATED: Thêm CAN_SUA_GAP vào DeliveryStatus enum
export enum DeliveryStatus {
    DA_GUI = 'DA_GUI',
    CHUA_GUI = 'CHUA_GUI',
    CAN_SUA_GAP = 'CAN_SUA_GAP'  // Thêm trạng thái mới: Cần sửa gấp
}

export enum PaymentStatus {
    DA_THANH_TOAN = 'DA_THANH_TOAN',
    CHUA_THANH_TOAN = 'CHUA_THANH_TOAN',
    BUNG = 'BUNG'
}

// Interface định nghĩa cấu trúc của một Video object
export interface Video {
    id: number;
    customerName: string;
    videoContent?: string;
    imageUrl?: string;
    videoDuration?: number; // Thay đổi từ string thành number (đơn vị: giây)
    deliveryTime?: string;
    assignedStaff?: string;
    assignedAt?: string; // NEW: Thời gian assign staff
    status: VideoStatus;
    videoUrl?: string;
    completedTime?: string;
    customerApproved?: boolean;
    customerNote?: string;
    checked?: boolean;
    createdAt: string;
    createdBy?: string;
    updatedAt: string;
    deliveryStatus: DeliveryStatus;
    paymentStatus: PaymentStatus;
    paymentDate?: string;
    orderValue?: number;
    price?: number; // NEW: Giá video
}

// Interface cho form tạo/sửa video
export interface VideoFormData {
    customerName: string;
    videoContent?: string;
    imageUrl?: string;
    videoDuration?: number; // Thay đổi từ string thành number (đơn vị: giây)
    deliveryTime?: string;
    assignedStaff?: string;
    assignedAt?: string; // NEW: Thời gian assign staff
    status: VideoStatus;
    videoUrl?: string;
    completedTime?: string;
    customerApproved?: boolean;
    customerNote?: string;
    checked?: boolean;
    deliveryStatus: DeliveryStatus;
    paymentStatus: PaymentStatus;
    paymentDate?: string;
    orderValue?: number;
    price?: number; // NEW: Giá video
}

// NEW: Interface cho filter parameters - khớp với API backend mới
export interface VideoFilterParams {
    status?: VideoStatus;
    assignedStaff?: string;
    deliveryStatus?: DeliveryStatus;
    paymentStatus?: PaymentStatus;
    customerName?: string; // NEW: Thêm search theo tên khách hàng
    paymentDate?: string; // NEW: Thêm filter theo ngày thanh toán
}

// Interface cho response từ API khi lấy danh sách có phân trang
export interface VideoListResponse {
    success: boolean;
    message: string;
    data: Video[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalElements: number;
        pageSize: number;
        hasNext: boolean;
        hasPrevious: boolean;
        isFirst: boolean;
        isLast: boolean;
    };
    timestamp: number;
}

// Interface cho response API thông thường
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: number;
}

// DEPRECATED: Interface cho filter/search cũ - sẽ được thay thế bằng VideoFilterParams
export interface VideoFilter {
    customerName?: string;
    status?: VideoStatus;
    assignedStaff?: string;
}

// NEW: Interface cho filter state trong component
export interface FilterState {
    customerName: string; // NEW: Thêm search theo tên khách hàng
    status: VideoStatus | '';
    assignedStaff: string;
    deliveryStatus: DeliveryStatus | '';
    paymentStatus: PaymentStatus | '';
    paymentDate: string; // NEW: Thêm filter theo ngày thanh toán
}

// NEW: Interface cho filter options
export interface FilterOptions {
    assignedStaffList: string[];
}

// Interface cho response API check customer exists
export interface CustomerExistsResponse {
    success: boolean;
    message: string;
    data: {
        customerName: string;
        exists: boolean;
        warning?: string; // Message cảnh báo nếu khách hàng đã tồn tại
    };
    tenantId: string;
    timestamp: number;
}