// File này chứa tất cả các hàm gọi API
// Axios là thư viện để gọi HTTP requests
// Đã được cập nhật để tự động thêm Bearer token vào headers
// UPDATED: Tự động thêm header db: video_management_1

import axios from 'axios';
import {ApiResponse, Video, VideoFormData, VideoListResponse, VideoStatus} from '../types/video.types';
import {AuthService} from './authService';

// Cấu hình base URL cho API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://video.openlearnhub.io.vn/api/v1';

// Tạo axios instance với cấu hình sẵn
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'db': 'video_management_1'  // THÊM MỚI: Header db cố định
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
            config.headers.db = 'video_management_1';
        } catch (error) {
            console.error('Failed to get valid token for request:', error);
            // Nếu không lấy được token, có thể redirect về login
            // AuthService.login();
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor để handle các lỗi authentication
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

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
                    originalRequest.headers.db = 'video_management_1';
                    return apiClient(originalRequest);
                } else {
                    // Refresh token thất bại, redirect về login
                    AuthService.login();
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                AuthService.login();
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

    // Lấy danh sách video có phân trang
    static async getVideos(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'createdAt',
        sortDirection: string = 'desc'
    ): Promise<VideoListResponse> {
        try {
            const response = await apiClient.get('/videos', {
                params: {page, size, sortBy, sortDirection}
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching videos:', error);
            throw error;
        }
    }

    // Lấy tất cả video không phân trang
    static async getAllVideos(): Promise<ApiResponse<Video[]>> {
        try {
            const response = await apiClient.get('/videos/all');
            return response.data;
        } catch (error) {
            console.error('Error fetching all videos:', error);
            throw error;
        }
    }

    // Lấy chi tiết một video theo ID
    static async getVideoById(id: number): Promise<ApiResponse<Video>> {
        try {
            const response = await apiClient.get(`/videos/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching video detail:', error);
            throw error;
        }
    }

    // Tạo video mới
    static async createVideo(videoData: VideoFormData): Promise<ApiResponse<Video>> {
        try {
            const response = await apiClient.post('/videos', videoData);
            return response.data;
        } catch (error) {
            console.error('Error creating video:', error);
            throw error;
        }
    }

    // Cập nhật video
    static async updateVideo(id: number, videoData: VideoFormData): Promise<ApiResponse<Video>> {
        try {
            const response = await apiClient.put(`/videos/${id}`, videoData);
            return response.data;
        } catch (error) {
            console.error(`Error updating video ${id}:`, error);
            throw error;
        }
    }

    // Xóa video
    static async deleteVideo(id: number): Promise<ApiResponse<null>> {
        try {
            const response = await apiClient.delete(`/videos/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting video ${id}:`, error);
            throw error;
        }
    }

    // Tìm kiếm video theo tên khách hàng
    static async searchByCustomerName(customerName: string): Promise<ApiResponse<Video[]>> {
        try {
            const response = await apiClient.get('/videos/search', {
                params: {customerName}
            });
            return response.data;
        } catch (error) {
            console.error('Error searching videos:', error);
            throw error;
        }
    }

    // Lọc video theo trạng thái
    static async getVideosByStatus(status: VideoStatus): Promise<ApiResponse<Video[]>> {
        try {
            const response = await apiClient.get(`/videos/status/${status}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching videos by status ${status}:`, error);
            throw error;
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
            throw error;
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
            throw error;
        }
    }

    // Cập nhật video URL - API mới
    static async updateVideoUrl(id: number, videoUrl: string): Promise<ApiResponse<Video>> {
        try {
            const response = await apiClient.patch(`/videos/${id}/video-url`, null, {
                params: {videoUrl}
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating video URL for video ${id}:`, error);
            throw error;
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
            throw error;
        }
    }
}