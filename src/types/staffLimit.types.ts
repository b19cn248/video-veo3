// Staff Limit Management Types
// Định nghĩa các kiểu dữ liệu cho hệ thống quản lý giới hạn nhân viên

export interface StaffLimit {
    id: number;
    staffName: string;
    startDate: string;
    endDate: string;
    remainingDays: number;
    createdBy: string;
    createdAt: string;
    isCurrentlyActive: boolean;
}

export interface StaffLimitCreateRequest {
    staffName: string;
    lockDays: number;
}

export interface StaffLimitCreateResponse {
    success: boolean;
    message: string;
    data: {
        staffName: string;
        lockDays: number;
        startDate: string;
        endDate: string;
        remainingDays: number;
        createdBy: string;
    };
    timestamp: number;
    tenantId: string;
}

export interface StaffLimitRemoveResponse {
    success: boolean;
    message: string;
    data: {
        staffName: string;
        action: 'LIMIT_REMOVED';
    };
    timestamp: number;
    tenantId: string;
}

export interface ActiveLimitsResponse {
    success: boolean;
    message: string;
    data: StaffLimit[];
    total: number;
    timestamp: number;
    tenantId: string;
}

export interface StaffLimitCheckResponse {
    success: boolean;
    message: string;
    data: {
        staffName: string;
        isLimited: boolean;
        canReceiveNewOrders: boolean;
    };
    timestamp: number;
    tenantId: string;
}

export interface StaffLimitErrorResponse {
    success: false;
    message: string;
    data: null;
    timestamp: number;
    status: number;
    error: string;
    tenantId: string;
}

// Form state interfaces
export interface StaffLimitFormData {
    staffName: string;
    lockDays: number;
}

export interface StaffLimitFormErrors {
    staffName?: string;
    lockDays?: string;
    general?: string;
}

// UI State interfaces
export interface StaffLimitState {
    activeLimits: StaffLimit[];
    loading: boolean;
    error: string | null;
    submitting: boolean;
    lastUpdated: number | null;
}

// Hook return type
export interface UseStaffLimitsReturn {
    // Data
    activeLimits: StaffLimit[];
    loading: boolean;
    error: string | null;
    submitting: boolean;
    lastUpdated: number | null;

    // Actions
    createLimit: (data: StaffLimitFormData) => Promise<boolean>;
    removeLimit: (staffName: string) => Promise<boolean>;
    checkStaffLimit: (staffName: string) => Promise<StaffLimitCheckResponse | null>;
    refreshLimits: () => Promise<void>;
    clearError: () => void;
}