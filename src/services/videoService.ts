// File này chứa tất cả các hàm gọi API
// Axios là thư viện để gọi HTTP requests
import axios from 'axios';
import { Video, VideoFormData, VideoListResponse, ApiResponse, VideoFilter, VideoStatus } from '../types/video.types';

// Cấu hình base URL cho API
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Tạo axios instance với cấu hình sẵn
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
                params: { page, size, sortBy, sortDirection }
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
                params: { customerName }
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
}