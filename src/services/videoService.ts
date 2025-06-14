// File này chứa tất cả các hàm gọi API
// Axios là thư viện để gọi HTTP requests
// Đã được cập nhật để tự động thêm Bearer token vào headers
// UPDATED: Tự động thêm header db: video_management
// UPDATED: Thêm API cập nhật trạng thái giao hàng và thanh toán
// UPDATED: Cập nhật getVideos API để hỗ trợ filter nâng cao
// NEW: Thêm Staff Salary APIs và cập nhật Assigned Staff API

import axios from 'axios';
import {ApiResponse, Video, VideoFormData, VideoListResponse, VideoStatus, DeliveryStatus, PaymentStatus, VideoFilterParams, CustomerExistsResponse} from '../types/video.types';
import {StaffSalariesResponse, AssignedStaffResponse} from '../types/staff.types';
import {SalesSalariesResponse} from '../types/sales.types';
import {AuthService} from './authService';
import { extractErrorMessage, createOperationErrorMessage } from '../utils/errorUtils';
import { GlobalErrorHandler } from '../utils/globalErrorHandler';

// Cấu hình base URL cho API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://video.openlearnhub.io.vn/api/v1';

// Tạo axios instance với cấu hình sẵn
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'db': 'video_management'  // Header db cố định
    },
});

// Request interceptor để tự động thêm Bearer token
apiClient.interceptors.request.use(
    async (config) => {
        try {
            // Đảm bảo token còn hiệu lực trước khi gửi request
            const token = await AuthService.ensureTokenValid();

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Đảm bảo header db luôn có trong mọi request
            config.headers.db = 'video_management';
        } catch (error) {
            console.error('Failed to get valid token for request:', error);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor để handle các lỗi authentication và log errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Log error với global error handler
        GlobalErrorHandler.logError(error, 'API Response Error', {
            url: originalRequest?.url,
            method: originalRequest?.method
        });

        // Nếu gặp lỗi 401 (Unauthorized) và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Thử refresh token
                const newToken = await AuthService.ensureTokenValid();

                if (newToken) {
                    // Cập nhật header và retry request
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    // Đảm bảo header db vẫn có khi retry
                    originalRequest.headers.db = 'video_management';
                    return apiClient(originalRequest);
                } else {
                    // Refresh token thất bại, redirect về login
                    GlobalErrorHandler.handleAuthenticationError();
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                GlobalErrorHandler.handleAuthenticationError();
            }
        }

        // Nếu gặp lỗi 403 (Forbidden), có thể hiển thị thông báo
        if (error.response?.status === 403) {
            console.error('Access forbidden - insufficient permissions');
        }

        return Promise.reject(error);
    }
);

// Class chứa tất cả methods gọi API
export class VideoService {

    // UPDATED: Lấy danh sách video có phân trang với filter nâng cao
    static async getVideos(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'createdAt',
        sortDirection: string = 'desc',
        filters?: VideoFilterParams
    ): Promise<VideoListResponse> {
        try {
            // Tạo params object, chỉ thêm các filter có giá trị
            const params: any = {
                page,
                size,
                sortBy,
                sortDirection
            };

            // Thêm filters nếu có giá trị
            if (filters) {
                if (filters.customerName && filters.customerName.trim()) {
                    params.customerName = filters.customerName.trim();
                }
                if (filters.status) {
                    params.status = filters.status;
                }
                if (filters.assignedStaff && filters.assignedStaff.trim()) {
                    params.assignedStaff = filters.assignedStaff.trim();
                }
                if (filters.deliveryStatus) {
                    params.deliveryStatus = filters.deliveryStatus;
                }
                if (filters.paymentStatus) {
                    params.paymentStatus = filters.paymentStatus;
                }
                if (filters.paymentDate) {
                    params.paymentDate = filters.paymentDate;
                }
            }

            console.log('Making API call with params:', params);

            const response = await apiClient.get('/videos', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching videos:', error);
            // Sử dụng error utils để extract message từ API response
            const errorMessage = createOperationErrorMessage('fetch', 'danh sách video', error);
            throw new Error(errorMessage);
        }
    }

    // Lấy tất cả video không phân trang
    static async getAllVideos(): Promise<ApiResponse<Video[]>> {
        try {
            const response = await apiClient.get('/videos/all');
            return response.data;
        } catch (error) {
            console.error('Error fetching all videos:', error);
            const errorMessage = createOperationErrorMessage('fetch', 'tất cả video', error);
            throw new Error(errorMessage);
        }
    }

    // Lấy chi tiết một video theo ID
    static async getVideoById(id: number): Promise<ApiResponse<Video>> {
        try {
            const response = await apiClient.get(`/videos/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching video detail:', error);
            const errorMessage = createOperationErrorMessage('fetch', 'chi tiết video', error);
            throw new Error(errorMessage);
        }
    }

    // Tạo video mới
    static async createVideo(videoData: VideoFormData): Promise<ApiResponse<Video>> {
        try {
            const response = await apiClient.post('/videos', videoData);
            return response.data;
        } catch (error) {
            console.error('Error creating video:', error);
            const errorMessage = createOperationErrorMessage('create', 'video', error);
            throw new Error(errorMessage);
        }
    }

    // Cập nhật video
    static async updateVideo(id: number, videoData: VideoFormData): Promise<ApiResponse<Video>> {
        try {
            const response = await apiClient.put(`/videos/${id}`, videoData);
            return response.data;
        } catch (error) {
            console.error(`Error updating video ${id}:`, error);
            const errorMessage = createOperationErrorMessage('update', 'video', error);
            throw new Error(errorMessage);
        }
    }

    // Xóa video
    static async deleteVideo(id: number): Promise<ApiResponse<null>> {
        try {
            const response = await apiClient.delete(`/videos/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting video ${id}:`, error);
            const errorMessage = createOperationErrorMessage('delete', 'video', error);
            throw new Error(errorMessage);
        }
    }

    // NEW: Tìm kiếm video theo tên khách hàng - sử dụng cho customer search filter  
    static async searchVideosByCustomerName(customerName: string): Promise<VideoListResponse> {
        try {
            console.log('Searching videos by customer name:', customerName);
            const response = await apiClient.get('/videos/search', {
                params: { customerName }
            });
            
            // Chuyển đổi response từ search API thành format của VideoListResponse
            const searchData = response.data;
            return {
                success: searchData.success,
                message: searchData.message,
                data: searchData.data || [],
                pagination: {
                    currentPage: 0,
                    totalPages: 1,
                    totalElements: searchData.total || searchData.data?.length || 0,
                    pageSize: searchData.data?.length || 0,
                    hasNext: false,
                    hasPrevious: false,
                    isFirst: true,
                    isLast: true,
                },
                timestamp: searchData.timestamp || Date.now()
            };
        } catch (error) {
            console.error('Error searching videos by customer name:', error);
            const errorMessage = createOperationErrorMessage('search', 'video theo tên khách hàng', error);
            throw new Error(errorMessage);
        }
    }

    // DEPRECATED: Lọc video theo trạng thái - sẽ được thay thế bằng filter nâng cao
    static async getVideosByStatus(status: VideoStatus): Promise<ApiResponse<Video[]>> {
        try {
            const response = await apiClient.get(`/videos/status/${status}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching videos by status ${status}:`, error);
            const errorMessage = createOperationErrorMessage('fetch', `video theo trạng thái ${status}`, error);
            throw new Error(errorMessage);
        }
    }

    // ===== STAFF MANAGEMENT APIs =====

    // Lấy danh sách nhân viên được assigned
    static async getAssignedStaffList(): Promise<AssignedStaffResponse> {
        try {
            console.log('Fetching assigned staff list from API...');
            const response = await apiClient.get('/videos/assigned-staff');
            console.log('Assigned staff response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching assigned staff list:', error);
            // Fallback: return empty list with proper structure
            return {
                total: 0,
                data: [],
                success: false,
                tenantId: 'video_management',
                message: 'Failed to fetch assigned staff list',
                timestamp: Date.now()
            };
        }
    }

    // EXISTING: Lấy thông tin lương nhân viên (staff) - dành cho tất cả user
    static async getStaffSalaries(date?: string): Promise<StaffSalariesResponse> {
        try {
            console.log('Fetching staff salaries from API for date:', date);
            
            // Tạo params object, chỉ thêm date nếu có giá trị
            const params: any = {};
            if (date) {
                params.date = date;
            }
            
            const response = await apiClient.get('/videos/staff-salaries', { params });
            console.log('Staff salaries response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching staff salaries:', error);
            const errorMessage = createOperationErrorMessage('fetch', 'lương nhân viên', error);
            throw new Error(errorMessage);
        }
    }

    // ===== SALES MANAGEMENT APIs =====

    // NEW: Lấy thông tin lương sales - ADMIN ONLY  
    static async getSalesSalaries(currentDate: string): Promise<SalesSalariesResponse> {
        try {
            console.log('Fetching sales salaries from API for date:', currentDate);
            
            const response = await apiClient.get('/videos/sales-salaries', {
                params: { currentDate }
            });
            console.log('Sales salaries response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching sales salaries:', error);
            const errorMessage = createOperationErrorMessage('fetch', 'lương sales', error);
            throw new Error(errorMessage);
        }
    }

    // ===== CUSTOMER VALIDATION APIs =====

    // NEW: Kiểm tra khách hàng đã tồn tại trong hệ thống
    static async checkCustomerExists(customerName: string): Promise<CustomerExistsResponse> {
        try {
            console.log('Checking if customer exists:', customerName);
            
            const response = await apiClient.get('/videos/check-customer', {
                params: { customerName: customerName.trim() }
            });
            console.log('Customer exists check response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error checking customer existence:', error);
            const errorMessage = createOperationErrorMessage('check', 'tồn tại khách hàng', error);
            throw new Error(errorMessage);
        }
    }

    // ===== PATCH APIs cho việc cập nhật nhanh =====

    // Cập nhật nhân viên được giao cho video
    static async updateAssignedStaff(id: number, assignedStaff: string): Promise<ApiResponse<Video>> {
        try {
            const response = await apiClient.patch(`/videos/${id}/assigned-staff`, null, {
                params: {assignedStaff}
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating assigned staff for video ${id}:`, error);
            const errorMessage = createOperationErrorMessage('update', 'nhân viên được giao', error);
            throw new Error(errorMessage);
        }
    }

    // Cập nhật trạng thái video
    static async updateVideoStatus(id: number, status: string): Promise<ApiResponse<Video>> {
        try {
            const response = await apiClient.patch(`/videos/${id}/status`, null, {
                params: {status}
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating status for video ${id}:`, error);
            const errorMessage = createOperationErrorMessage('update', 'trạng thái video', error);
            throw new Error(errorMessage);
        }
    }

    // Cập nhật video URL
    static async updateVideoUrl(id: number, videoUrl: string): Promise<ApiResponse<Video>> {
        try {
            const response = await apiClient.patch(`/videos/${id}/video-url`, null, {
                params: {videoUrl}
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating video URL for video ${id}:`, error);
            const errorMessage = createOperationErrorMessage('update', 'URL video', error);
            throw new Error(errorMessage);
        }
    }

    // ===== APIs cho việc cập nhật trạng thái giao hàng và thanh toán =====

    // Cập nhật trạng thái giao hàng
    static async updateDeliveryStatus(id: number, status: DeliveryStatus): Promise<ApiResponse<Video>> {
        try {
            const response = await apiClient.put(`/videos/${id}/delivery-status`, null, {
                params: {status}
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating delivery status for video ${id}:`, error);
            const errorMessage = createOperationErrorMessage('update', 'trạng thái giao hàng', error);
            throw new Error(errorMessage);
        }
    }

    // Cập nhật trạng thái thanh toán
    static async updatePaymentStatus(id: number, status: PaymentStatus): Promise<ApiResponse<Video>> {
        try {
            const response = await apiClient.put(`/videos/${id}/payment-status`, null, {
                params: {status}
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating payment status for video ${id}:`, error);
            const errorMessage = createOperationErrorMessage('update', 'trạng thái thanh toán', error);
            throw new Error(errorMessage);
        }
    }

    // ===== ADMIN-ONLY APIs =====

    // Cancel video - reset về trạng thái chưa ai nhận (chỉ admin)
    static async cancelVideo(id: number): Promise<ApiResponse<Video>> {
        try {
            const response = await apiClient.post(`/videos/${id}/cancel`);
            return response.data;
        } catch (error) {
            console.error(`Error canceling video ${id}:`, error);
            const errorMessage = createOperationErrorMessage('cancel', 'video', error);
            throw new Error(errorMessage);
        }
    }

    // ===== UTILITY METHODS =====

    // Kiểm tra kết nối API
    static async checkHealth(): Promise<boolean> {
        try {
            const response = await apiClient.get('/health');
            return response.status === 200;
        } catch (error) {
            console.error('API health check failed:', error);
            return false;
        }
    }

    // Lấy thông tin user hiện tại từ API (nếu backend có endpoint này)
    static async getCurrentUser(): Promise<ApiResponse<any>> {
        try {
            const response = await apiClient.get('/auth/me');
            return response.data;
        } catch (error) {
            console.error('Error fetching current user:', error);
            const errorMessage = createOperationErrorMessage('fetch', 'thông tin người dùng hiện tại', error);
            throw new Error(errorMessage);
        }
    }
}