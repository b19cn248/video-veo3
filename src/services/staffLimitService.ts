// Staff Limit Service - API calls cho quản lý giới hạn nhân viên
// Tích hợp với existing apiClient từ videoService

import axios from 'axios';
import {
    StaffLimitCreateRequest,
    StaffLimitCreateResponse,
    StaffLimitRemoveResponse,
    ActiveLimitsResponse,
    StaffLimitCheckResponse,
    StaffLimitErrorResponse
} from '../types/staffLimit.types';
import { AuthService } from './authService';
import { createOperationErrorMessage } from '../utils/errorUtils';
import { GlobalErrorHandler } from '../utils/globalErrorHandler';

// Sử dụng cùng config với videoService
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://video.openlearnhub.io.vn/api/v1';

// Tạo axios instance với cấu hình tương tự videoService
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'db': 'video_management'
    },
});

// Request interceptor - tương tự videoService
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AuthService.ensureTokenValid();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            config.headers.db = 'video_management';
        } catch (error) {
            console.error('Failed to get valid token for staff limit request:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - tương tự videoService
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        GlobalErrorHandler.logError(error, 'Staff Limit API Response Error', {
            url: originalRequest?.url,
            method: originalRequest?.method
        });

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const newToken = await AuthService.ensureTokenValid();
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    originalRequest.headers.db = 'video_management';
                    return apiClient(originalRequest);
                } else {
                    GlobalErrorHandler.handleAuthenticationError();
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                GlobalErrorHandler.handleAuthenticationError();
            }
        }

        if (error.response?.status === 403) {
            console.error('Access forbidden - insufficient permissions for staff limit operation');
        }

        return Promise.reject(error);
    }
);

export class StaffLimitService {
    
    /**
     * Tạo giới hạn mới cho nhân viên (ADMIN ONLY)
     * POST /api/v1/videos/staff-limit
     */
    static async createStaffLimit(request: StaffLimitCreateRequest): Promise<StaffLimitCreateResponse> {
        try {
            console.log('Creating staff limit:', request);
            
            const params: any = {
                staffName: request.staffName,
                lockDays: request.lockDays
            };

            // Thêm maxOrdersPerDay nếu có
            if (request.maxOrdersPerDay !== undefined) {
                params.maxOrdersPerDay = request.maxOrdersPerDay;
            }
            
            const response = await apiClient.post('/videos/staff-limit', null, {
                params: params
            });
            
            console.log('Staff limit created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating staff limit:', error);
            const errorMessage = createOperationErrorMessage('create', 'giới hạn nhân viên', error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Hủy giới hạn nhân viên (ADMIN ONLY)
     * DELETE /api/v1/videos/staff-limit
     */
    static async removeStaffLimit(staffName: string): Promise<StaffLimitRemoveResponse> {
        try {
            console.log('Removing staff limit for:', staffName);
            
            const response = await apiClient.delete('/videos/staff-limit', {
                params: { staffName }
            });
            
            console.log('Staff limit removed successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error removing staff limit:', error);
            const errorMessage = createOperationErrorMessage('remove', 'giới hạn nhân viên', error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Lấy danh sách tất cả giới hạn đang active
     * GET /api/v1/videos/staff-limits
     */
    static async getActiveLimits(): Promise<ActiveLimitsResponse> {
        try {
            console.log('Fetching active staff limits...');
            
            const response = await apiClient.get('/videos/staff-limits');
            
            console.log('Active limits fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching active limits:', error);
            const errorMessage = createOperationErrorMessage('fetch', 'danh sách giới hạn nhân viên', error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Kiểm tra trạng thái giới hạn của nhân viên
     * GET /api/v1/videos/staff-limit/check
     */
    static async checkStaffLimit(staffName: string): Promise<StaffLimitCheckResponse> {
        try {
            console.log('Checking staff limit for:', staffName);
            
            const response = await apiClient.get('/videos/staff-limit/check', {
                params: { staffName }
            });
            
            console.log('Staff limit check result:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error checking staff limit:', error);
            const errorMessage = createOperationErrorMessage('check', 'trạng thái giới hạn nhân viên', error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Utility method: Kiểm tra nhanh xem nhân viên có thể nhận đơn mới không
     * Sử dụng trong video assignment flow
     */
    static async canStaffReceiveNewOrders(staffName: string): Promise<boolean> {
        try {
            const result = await this.checkStaffLimit(staffName);
            return result.data.canReceiveNewOrders;
        } catch (error) {
            console.warn('Error checking staff availability, allowing assignment:', error);
            // Nếu check fail thì mặc định cho phép assign (fail-safe)
            return true;
        }
    }

    /**
     * Utility method: Validate staff limit form data
     */
    static validateStaffLimitData(data: StaffLimitCreateRequest): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.staffName || data.staffName.trim() === '') {
            errors.push('Tên nhân viên không được để trống');
        }

        if (!data.lockDays || data.lockDays < 1 || data.lockDays > 30) {
            errors.push('Số ngày khóa phải từ 1 đến 30');
        }

        if (!Number.isInteger(data.lockDays)) {
            errors.push('Số ngày khóa phải là số nguyên');
        }

        // Validate maxOrdersPerDay nếu có
        if (data.maxOrdersPerDay !== undefined) {
            if (data.maxOrdersPerDay < 1 || data.maxOrdersPerDay > 50) {
                errors.push('Số đơn tối đa trong ngày phải từ 1 đến 50');
            }

            if (!Number.isInteger(data.maxOrdersPerDay)) {
                errors.push('Số đơn tối đa trong ngày phải là số nguyên');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Utility method: Format remaining days cho UI
     */
    static formatRemainingDays(remainingDays: number): { text: string; color: string; urgent: boolean } {
        if (remainingDays <= 0) {
            return { text: 'Đã hết hạn', color: '#ef4444', urgent: true };
        } else if (remainingDays === 1) {
            return { text: '1 ngày', color: '#f59e0b', urgent: true };
        } else if (remainingDays <= 2) {
            return { text: `${remainingDays} ngày`, color: '#f59e0b', urgent: true };
        } else {
            return { text: `${remainingDays} ngày`, color: '#10b981', urgent: false };
        }
    }

    /**
     * Utility method: Check API health cho staff limit endpoints
     */
    static async checkHealth(): Promise<boolean> {
        try {
            // Thử gọi endpoint đơn giản nhất
            const response = await apiClient.get('/videos/staff-limits');
            return response.data.success === true;
        } catch (error) {
            console.error('Staff limit API health check failed:', error);
            return false;
        }
    }
}