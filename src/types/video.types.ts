// Định nghĩa các kiểu dữ liệu cho Video
// TypeScript giúp chúng ta kiểm tra lỗi ngay khi viết code

export enum VideoStatus {
    CHUA_AI_NHAN = 'CHUA_AI_NHAN',
    DANG_LAM = 'DANG_LAM',
    DA_XONG = 'DA_XONG',
    DANG_SUA = 'DANG_SUA',
    DA_SUA_XONG = 'DA_SUA_XONG'
}

export enum DeliveryStatus {
    DA_GUI = 'DA_GUI',
    CHUA_GUI = 'CHUA_GUI'
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
    status: VideoStatus;
    videoUrl?: string;
    completedTime?: string;
    customerApproved?: boolean;
    customerNote?: string;
    checked?: boolean;
    createdAt: string;
    updatedAt: string;
    deliveryStatus: DeliveryStatus;
    paymentStatus: PaymentStatus;
    paymentDate?: string;
    orderValue?: number;
}

// Interface cho form tạo/sửa video
export interface VideoFormData {
    customerName: string;
    videoContent?: string;
    imageUrl?: string;
    videoDuration?: number; // Thay đổi từ string thành number (đơn vị: giây)
    deliveryTime?: string;
    assignedStaff?: string;
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

// Interface cho filter/search
export interface VideoFilter {
    customerName?: string;
    status?: VideoStatus;
    assignedStaff?: string;
}