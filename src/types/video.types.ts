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

// UPDATED: Thêm CAN_SUA_GAP và SUA_XONG_CAN_GUI vào DeliveryStatus enum
export enum DeliveryStatus {
    DA_GUI = 'DA_GUI',
    CHUA_GUI = 'CHUA_GUI',
    CAN_SUA_GAP = 'CAN_SUA_GAP',  // Thêm trạng thái mới: Cần sửa gấp
    SUA_XONG_CAN_GUI = 'SUA_XONG_CAN_GUI',  // Thêm trạng thái mới: Sửa xong, cần gửi
    HUY = 'HUY'  // Thêm trạng thái mới: Huỷ
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
    billImageUrl?: string; // URL hình ảnh thanh toán/hóa đơn
    linkfb?: string; // NEW: Link Facebook
    phoneNumber?: string; // NEW: Số điện thoại khách hàng
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
    billImageUrl?: string; // URL hình ảnh thanh toán/hóa đơn
    linkfb?: string; // NEW: Link Facebook
    phoneNumber?: string; // NEW: Số điện thoại khách hàng
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
    fromPaymentDate?: string; // UPDATED: Đổi từ paymentDate thành fromPaymentDate
    toPaymentDate?: string; // NEW: Thêm toPaymentDate cho date range
    fromDateCreatedVideo?: string; // NEW: Thêm fromDateCreatedVideo cho date range
    toDateCreatedVideo?: string; // NEW: Thêm toDateCreatedVideo cho date range
    createdBy?: string; // NEW: Thêm filter theo người tạo
    videoId?: number; // NEW: Thêm search theo ID video
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
    fromPaymentDate: string; // UPDATED: Đổi từ paymentDate thành fromPaymentDate
    toPaymentDate: string; // NEW: Thêm toPaymentDate cho date range
    fromDateCreatedVideo: string; // NEW: Thêm fromDateCreatedVideo cho date range
    toDateCreatedVideo: string; // NEW: Thêm toDateCreatedVideo cho date range
    createdBy: string; // NEW: Thêm filter theo người tạo
    videoId: string; // NEW: Thêm search theo ID video
}

// NEW: Interface cho filter options
export interface FilterOptions {
    assignedStaffList: string[];
    creatorsList: string[]; // NEW: Thêm danh sách người tạo
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

// NEW: Interface cho response API lấy danh sách creators
export interface CreatorsResponse {
    success: boolean;
    message: string;
    data: string[];
    tenantId: string;
    timestamp: number;
}

// Interface cho audit history entry
export interface AuditEntry {
    id: number;
    entityType: string;
    entityId: number;
    action: string;
    actionDescription: string;
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
    performedBy: string;
    performedAt: string;
    ipAddress: string | null;
    userAgent: string | null;
    tenantId: string | null;
    fieldLevelChange: boolean;
    entityLevelOperation: boolean;
    formattedDescription: string;
    entityIdentifier: string;
}

// Interface cho response API audit history
export interface VideoAuditHistoryResponse {
    videoId: number;
    totalCount: number;
    audits: AuditEntry[];
}

// NEW: Interface cho customer contact information
export interface CustomerContactDto {
    customerName: string;
    linkfb?: string;
    phoneNumber?: string;
    totalVideos?: number; // Tổng số video của khách hàng này
    latestVideoDate?: string; // Video gần nhất
}

// NEW: Interface cho response API customer contacts với pagination
export interface CustomerContactResponse {
    success: boolean;
    message: string;
    data: CustomerContactDto[];
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

// NEW: Interface cho customer contact filter parameters
export interface CustomerContactFilterParams {
    page?: number;
    size?: number;
    search?: string; // Tìm kiếm theo tên khách hàng
    hasLinkfb?: boolean; // Lọc khách hàng có Facebook
    hasPhoneNumber?: boolean; // Lọc khách hàng có số điện thoại
    sortBy?: string; // Trường sắp xếp
    sortDirection?: 'asc' | 'desc'; // Hướng sắp xếp
}