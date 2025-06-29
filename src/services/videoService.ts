// File này chứa tất cả các hàm gọi API
// Axios là thư viện để gọi HTTP requests
// Đã được cập nhật để tự động thêm Bearer token vào headers
// UPDATED: Tự động thêm header db: video_management
// UPDATED: Thêm API cập nhật trạng thái giao hàng và thanh toán
// UPDATED: Cập nhật getVideos API để hỗ trợ filter nâng cao
// NEW: Thêm Staff Salary APIs và cập nhật Assigned Staff API

import axios from 'axios';
import {ApiResponse, Video, VideoFormData, VideoListResponse, VideoStatus, DeliveryStatus, PaymentStatus, VideoFilterParams, CustomerExistsResponse, CreatorsResponse, VideoAuditHistoryResponse, CustomerContactResponse, CustomerContactFilterParams, CustomerContactDto} from '../types/video.types';
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
                // UPDATED: Sử dụng date range parameters mới
                if (filters.fromPaymentDate) {
                    params.fromPaymentDate = filters.fromPaymentDate;
                }
                if (filters.toPaymentDate) {
                    params.toPaymentDate = filters.toPaymentDate;
                }
                if (filters.fromDateCreatedVideo) {
                    params.fromDateCreatedVideo = filters.fromDateCreatedVideo;
                }
                if (filters.toDateCreatedVideo) {
                    params.toDateCreatedVideo = filters.toDateCreatedVideo;
                }
                if (filters.createdBy && filters.createdBy.trim()) {
                    params.createdBy = filters.createdBy.trim();
                }
                if (filters.videoId) {
                    params.videoId = filters.videoId;
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

    // NEW: Tìm kiếm video theo ID - sử dụng cho ID search filter  
    static async searchVideoById(id: number): Promise<VideoListResponse> {
        try {
            console.log('Searching video by ID:', id);
            const response = await apiClient.get('/videos/search/id', {
                params: { id }
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
            console.error('Error searching video by ID:', error);
            const errorMessage = createOperationErrorMessage('search', 'video theo ID', error);
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

    // NEW: Lấy danh sách người tạo video (creators)
    static async getCreatorsList(): Promise<CreatorsResponse> {
        try {
            console.log('Fetching creators list from API...');
            const response = await apiClient.get('/videos/creators');
            console.log('Creators response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching creators list:', error);
            // Fallback: return empty list with proper structure
            return {
                data: [],
                success: false,
                tenantId: 'video_management',
                message: 'Failed to fetch creators list',
                timestamp: Date.now()
            };
        }
    }

    // UPDATED: Lấy thông tin lương nhân viên (staff) theo khoảng thời gian - dành cho tất cả user
    static async getStaffSalaries(startDate: string, endDate: string): Promise<StaffSalariesResponse> {
        try {
            console.log('Fetching staff salaries from API for date range:', startDate, 'to', endDate);
            
            const params = {
                startDate,
                endDate
            };
            
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

    // UPDATED: Lấy thông tin lương sales theo khoảng thời gian - ADMIN ONLY  
    static async getSalesSalaries(startDate: string, endDate: string): Promise<SalesSalariesResponse> {
        try {
            console.log('Fetching sales salaries from API for date range:', startDate, 'to', endDate);
            
            const response = await apiClient.get('/videos/sales-salaries', {
                params: { startDate, endDate }
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

    // Cập nhật bill image URL - chỉ người tạo video mới có quyền
    static async updateBillImageUrl(id: number, billImageUrl: string): Promise<ApiResponse<Video>> {
        try {
            const response = await apiClient.put(`/videos/${id}/bill-image-url`, null, {
                params: {billImageUrl}
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating bill image URL for video ${id}:`, error);
            const errorMessage = createOperationErrorMessage('update', 'URL hình ảnh hóa đơn', error);
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

    // ===== AUDIT HISTORY APIs =====

    // Lấy lịch sử thay đổi của video
    static async getVideoAuditHistory(videoId: number): Promise<VideoAuditHistoryResponse> {
        try {
            console.log('Fetching audit history for video:', videoId);
            const response = await apiClient.get(`/audit/video/${videoId}/history/all`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching audit history for video ${videoId}:`, error);
            const errorMessage = createOperationErrorMessage('fetch', 'lịch sử thay đổi video', error);
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

    // ===== CUSTOMER CONTACT APIs =====

    /**
     * Lấy thông tin liên hệ khách hàng với pagination và filtering
     * GET /api/v1/videos/customer-contacts
     */
    static async getCustomerContacts(params?: CustomerContactFilterParams): Promise<CustomerContactResponse> {
        try {
            console.log('Fetching customer contacts with params:', params);
            
            const queryParams = new URLSearchParams();
            
            if (params?.page !== undefined) queryParams.append('page', params.page.toString());
            if (params?.size !== undefined) queryParams.append('size', params.size.toString());
            if (params?.search) queryParams.append('search', params.search);
            if (params?.hasLinkfb !== undefined) queryParams.append('hasLinkfb', params.hasLinkfb.toString());
            if (params?.hasPhoneNumber !== undefined) queryParams.append('hasPhoneNumber', params.hasPhoneNumber.toString());
            if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
            if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);

            const url = `/videos/customer-contacts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await apiClient.get(url);
            
            console.log('Customer contacts response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching customer contacts:', error);
            const errorMessage = createOperationErrorMessage('fetch', 'thông tin liên hệ khách hàng', error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Lấy thông tin liên hệ của một khách hàng cụ thể theo Video ID
     * GET /api/v1/videos/{id}/customer-contact
     * API mới - preferred method
     */
    static async getCustomerContactByVideoId(videoId: number): Promise<ApiResponse<CustomerContactDto>> {
        try {
            console.log('Fetching customer contact for video ID:', videoId);
            
            const response = await apiClient.get(`/videos/${videoId}/customer-contact`);
            
            console.log('Customer contact response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching customer contact by video ID:', error);
            const errorMessage = createOperationErrorMessage('fetch', `thông tin liên hệ khách hàng video #${videoId}`, error);
            throw new Error(errorMessage);
        }
    }

    /**
     * DEPRECATED: Lấy thông tin liên hệ của một khách hàng cụ thể
     * Sử dụng search để tìm theo tên khách hàng
     * @deprecated Use getCustomerContactByVideoId instead
     */
    static async getCustomerContactByName(customerName: string): Promise<CustomerContactResponse> {
        try {
            console.log('Fetching customer contact for:', customerName);
            
            return await this.getCustomerContacts({
                search: customerName,
                page: 0,
                size: 1 // Chỉ lấy 1 kết quả đầu tiên
            });
        } catch (error) {
            console.error('Error fetching customer contact by name:', error);
            const errorMessage = createOperationErrorMessage('fetch', `thông tin liên hệ khách hàng '${customerName}'`, error);
            throw new Error(errorMessage);
        }
    }
}