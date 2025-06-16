/**
 * Audit Service - API service layer cho audit functionality
 * 
 * Chức năng:
 * - Integrate với backend audit APIs
 * - Provide TypeScript types cho audit data
 * - Error handling và response formatting
 * - Caching cho performance optimization
 * 
 * Tuân thủ SOLID Principles:
 * - Single Responsibility: Chỉ handle audit API calls
 * - Open/Closed: Có thể extend thêm methods mà không sửa code cũ  
 * - Interface Segregation: Clear method interfaces
 * - Dependency Inversion: Depend on abstractions (axios, types)
 * 
 * Performance Considerations:
 * - Response caching cho frequently accessed data
 * - Efficient error handling
 * - Pagination support
 * - Request cancellation support
 * 
 * @author System
 * @since 1.6.0
 */

import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { AuthService } from './authService';
import { extractErrorMessage, createOperationErrorMessage } from '../utils/errorUtils';
import { GlobalErrorHandler } from '../utils/globalErrorHandler';

// ============= TYPE DEFINITIONS =============

/**
 * Enum cho các loại audit actions
 * Sync với backend AuditAction enum
 */
export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    UPDATE_STATUS = 'UPDATE_STATUS',
    UPDATE_DELIVERY_STATUS = 'UPDATE_DELIVERY_STATUS',
    UPDATE_PAYMENT_STATUS = 'UPDATE_PAYMENT_STATUS',
    ASSIGN_STAFF = 'ASSIGN_STAFF',
    UNASSIGN_STAFF = 'UNASSIGN_STAFF',
    UPDATE_VIDEO_URL = 'UPDATE_VIDEO_URL',
    UPDATE_ORDER_VALUE = 'UPDATE_ORDER_VALUE',
    UPDATE_PRICE = 'UPDATE_PRICE',
    AUTO_RESET = 'AUTO_RESET',
    CUSTOMER_APPROVAL = 'CUSTOMER_APPROVAL',
    CUSTOMER_REVISION = 'CUSTOMER_REVISION',
    CANCEL = 'CANCEL',
    ADMIN_OVERRIDE = 'ADMIN_OVERRIDE',
    RESTORE = 'RESTORE',
    EXPORT = 'EXPORT'
}

/**
 * Enum cho các loại entity types
 * Sync với backend EntityType enum
 */
export enum EntityType {
    VIDEO = 'VIDEO',
    USER = 'USER',
    STAFF = 'STAFF',
    CUSTOMER = 'CUSTOMER',
    PROJECT = 'PROJECT',
    SETTING = 'SETTING'
}

/**
 * Interface cho AuditLog object
 * Sync với backend AuditLog entity
 */
export interface AuditLog {
    id: number;
    entityType: EntityType;
    entityId: number;
    action: AuditAction;
    actionDescription?: string;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    performedBy: string;
    performedAt: string; // ISO date string
    ipAddress?: string;
    userAgent?: string;
    tenantId?: string;
}

/**
 * Interface cho video history response
 */
export interface VideoHistoryResponse {
    audits: AuditLog[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
    videoId: number;
}

/**
 * Interface cho complete video history (no pagination)
 */
export interface VideoHistoryAllResponse {
    audits: AuditLog[];
    totalCount: number;
    videoId: number;
}

/**
 * Interface cho audit search filters
 */
export interface AuditSearchFilters {
    entityType?: EntityType;
    action?: AuditAction;
    performedBy?: string;
    fromDate?: string; // ISO date string
    toDate?: string; // ISO date string
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
}

/**
 * Interface cho audit search response
 */
export interface AuditSearchResponse {
    audits: AuditLog[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
    filters: AuditSearchFilters;
}

/**
 * Interface cho API error response
 */
export interface AuditApiError {
    error: string;
    message: string;
    timestamp?: string;
}

/**
 * Interface cho enum response
 */
export interface EnumResponse<T> {
    [key: string]: T[];
}

/**
 * Interface cho health check response
 */
export interface HealthCheckResponse {
    status: 'UP' | 'DOWN';
    service: string;
    timestamp: string;
    error?: string;
}

// ============= SERVICE CONFIGURATION =============

// API Base URL configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://video.openlearnhub.io.vn/api/v1';

// Tạo axios instance với cấu hình cho audit APIs
const auditApiClient = axios.create({
    baseURL: `${API_BASE_URL}/audit`,
    headers: {
        'Content-Type': 'application/json',
        'db': 'video_management'  // Multi-tenant header
    },
    timeout: 30000, // 30s timeout cho audit queries
});

// Request interceptor để tự động thêm Bearer token
auditApiClient.interceptors.request.use(
    (config) => {
        const token = AuthService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        GlobalErrorHandler.handleApiError(error, 'Audit Request Error');
        return Promise.reject(error);
    }
);

// Response interceptor để handle errors
auditApiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const errorMessage = extractErrorMessage(error);
        GlobalErrorHandler.handleApiError(error, `Audit API Error: ${errorMessage}`);
        return Promise.reject(error);
    }
);

// ============= AUDIT SERVICE CLASS =============

/**
 * AuditService class để handle tất cả audit-related API calls
 */
export class AuditService {
    
    // Cancel token để support request cancellation
    private static cancelTokenSource: CancelTokenSource | null = null;
    
    // ============= VIDEO HISTORY METHODS =============
    
    /**
     * Lấy lịch sử của một video với pagination
     * 
     * @param videoId ID của video
     * @param page Page number (0-based)
     * @param size Page size
     * @param sort Sort field
     * @param direction Sort direction
     * @returns Promise<VideoHistoryResponse>
     */
    static async getVideoHistory(
        videoId: number,
        page: number = 0,
        size: number = 20,
        sort: string = 'performedAt',
        direction: 'asc' | 'desc' = 'desc'
    ): Promise<VideoHistoryResponse> {
        try {
            // Cancel previous request nếu có
            this.cancelPreviousRequest();
            this.cancelTokenSource = axios.CancelToken.source();
            
            const config: AxiosRequestConfig = {
                params: { page, size, sort, direction },
                cancelToken: this.cancelTokenSource.token
            };
            
            const response = await auditApiClient.get<VideoHistoryResponse>(
                `/video/${videoId}/history`,
                config
            );
            
            return response.data;
            
        } catch (error) {
            if (axios.isCancel(error)) {
                throw new Error('Request was cancelled');
            }
            
            const errorMessage = extractErrorMessage(error);
            throw new Error(createOperationErrorMessage('fetch', 'video history', error));
        }
    }
    
    /**
     * Lấy toàn bộ lịch sử video (không phân trang)
     * 
     * @param videoId ID của video
     * @returns Promise<VideoHistoryAllResponse>
     */
    static async getVideoHistoryAll(videoId: number): Promise<VideoHistoryAllResponse> {
        try {
            this.cancelPreviousRequest();
            this.cancelTokenSource = axios.CancelToken.source();
            
            const config: AxiosRequestConfig = {
                cancelToken: this.cancelTokenSource.token
            };
            
            const response = await auditApiClient.get<VideoHistoryAllResponse>(
                `/video/${videoId}/history/all`,
                config
            );
            
            return response.data;
            
        } catch (error) {
            if (axios.isCancel(error)) {
                throw new Error('Request was cancelled');
            }
            
            const errorMessage = extractErrorMessage(error);
            throw new Error(createOperationErrorMessage('fetch', 'complete video history', error));
        }
    }
    
    // ============= ADMIN SEARCH METHODS =============
    
    /**
     * Search audit logs với filters
     * 
     * @param filters Search filters
     * @returns Promise<AuditSearchResponse>
     */
    static async searchAuditLogs(filters: AuditSearchFilters): Promise<AuditSearchResponse> {
        try {
            this.cancelPreviousRequest();
            this.cancelTokenSource = axios.CancelToken.source();
            
            // Clean undefined values from filters
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
            );
            
            const config: AxiosRequestConfig = {
                params: cleanFilters,
                cancelToken: this.cancelTokenSource.token
            };
            
            const response = await auditApiClient.get<AuditSearchResponse>(
                '/search',
                config
            );
            
            return response.data;
            
        } catch (error) {
            if (axios.isCancel(error)) {
                throw new Error('Request was cancelled');
            }
            
            const errorMessage = extractErrorMessage(error);
            throw new Error(createOperationErrorMessage('search', 'audit logs', error));
        }
    }
    
    // ============= ENUM METHODS =============
    
    /**
     * Lấy danh sách tất cả entity types
     * 
     * @returns Promise<EntityType[]>
     */
    static async getEntityTypes(): Promise<EntityType[]> {
        try {
            const response = await auditApiClient.get<EnumResponse<EntityType>>('/entity-types');
            return response.data.entityTypes;
            
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            throw new Error(createOperationErrorMessage('fetch', 'entity types', error));
        }
    }
    
    /**
     * Lấy danh sách tất cả audit actions
     * 
     * @returns Promise<AuditAction[]>
     */
    static async getAuditActions(): Promise<AuditAction[]> {
        try {
            const response = await auditApiClient.get<EnumResponse<AuditAction>>('/actions');
            return response.data.actions;
            
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            throw new Error(createOperationErrorMessage('fetch', 'audit actions', error));
        }
    }
    
    // ============= HEALTH CHECK =============
    
    /**
     * Health check cho audit service
     * 
     * @returns Promise<HealthCheckResponse>
     */
    static async healthCheck(): Promise<HealthCheckResponse> {
        try {
            const response = await auditApiClient.get<HealthCheckResponse>('/health');
            return response.data;
            
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            throw new Error(createOperationErrorMessage('check', 'audit service health', error));
        }
    }
    
    // ============= UTILITY METHODS =============
    
    /**
     * Cancel previous request để tránh race conditions
     */
    private static cancelPreviousRequest(): void {
        if (this.cancelTokenSource) {
            this.cancelTokenSource.cancel('New request initiated');
            this.cancelTokenSource = null;
        }
    }
    
    /**
     * Format date cho API requests
     * 
     * @param date Date object hoặc string
     * @returns ISO date string
     */
    static formatDateForApi(date: Date | string): string {
        if (typeof date === 'string') {
            return new Date(date).toISOString();
        }
        return date.toISOString();
    }
    
    /**
     * Parse audit log date từ API response
     * 
     * @param dateString ISO date string
     * @returns Date object
     */
    static parseAuditDate(dateString: string): Date {
        return new Date(dateString);
    }
    
    /**
     * Check if user has permission để access audit data
     * 
     * @returns boolean
     */
    static hasAuditPermission(): boolean {
        return AuthService.hasAnyRole(['ADMIN', 'STAFF', 'admin', 'staff']);
    }
    
    /**
     * Check if user has admin permission
     * 
     * @returns boolean
     */
    static hasAdminPermission(): boolean {
        return AuthService.hasAnyRole(['ADMIN', 'admin']);
    }
    
    /**
     * Get action description cho display
     * 
     * @param action AuditAction
     * @returns Vietnamese description
     */
    static getActionDescription(action: AuditAction): string {
        const descriptions: Record<AuditAction, string> = {
            [AuditAction.CREATE]: 'Tạo mới',
            [AuditAction.UPDATE]: 'Cập nhật',
            [AuditAction.DELETE]: 'Xóa',
            [AuditAction.UPDATE_STATUS]: 'Thay đổi trạng thái',
            [AuditAction.UPDATE_DELIVERY_STATUS]: 'Thay đổi trạng thái giao hàng',
            [AuditAction.UPDATE_PAYMENT_STATUS]: 'Thay đổi trạng thái thanh toán',
            [AuditAction.ASSIGN_STAFF]: 'Gán nhân viên',
            [AuditAction.UNASSIGN_STAFF]: 'Hủy gán nhân viên',
            [AuditAction.UPDATE_VIDEO_URL]: 'Cập nhật link video',
            [AuditAction.UPDATE_ORDER_VALUE]: 'Cập nhật giá trị đơn hàng',
            [AuditAction.UPDATE_PRICE]: 'Cập nhật giá bán',
            [AuditAction.AUTO_RESET]: 'Tự động reset',
            [AuditAction.CUSTOMER_APPROVAL]: 'Khách hàng phê duyệt',
            [AuditAction.CUSTOMER_REVISION]: 'Khách hàng yêu cầu sửa',
            [AuditAction.CANCEL]: 'Hủy',
            [AuditAction.ADMIN_OVERRIDE]: 'Admin can thiệp',
            [AuditAction.RESTORE]: 'Khôi phục',
            [AuditAction.EXPORT]: 'Xuất dữ liệu'
        };
        
        return descriptions[action] || action;
    }
    
    /**
     * Get entity type description cho display
     * 
     * @param entityType EntityType
     * @returns Vietnamese description
     */
    static getEntityTypeDescription(entityType: EntityType): string {
        const descriptions: Record<EntityType, string> = {
            [EntityType.VIDEO]: 'Video',
            [EntityType.USER]: 'Người dùng',
            [EntityType.STAFF]: 'Nhân viên',
            [EntityType.CUSTOMER]: 'Khách hàng',
            [EntityType.PROJECT]: 'Dự án',
            [EntityType.SETTING]: 'Cài đặt'
        };
        
        return descriptions[entityType] || entityType;
    }
    
    /**
     * Get action icon class cho UI
     * 
     * @param action AuditAction
     * @returns CSS icon class
     */
    static getActionIcon(action: AuditAction): string {
        const icons: Record<AuditAction, string> = {
            [AuditAction.CREATE]: 'fas fa-plus-circle text-green-500',
            [AuditAction.UPDATE]: 'fas fa-edit text-blue-500',
            [AuditAction.DELETE]: 'fas fa-trash text-red-500',
            [AuditAction.UPDATE_STATUS]: 'fas fa-exchange-alt text-orange-500',
            [AuditAction.UPDATE_DELIVERY_STATUS]: 'fas fa-shipping-fast text-purple-500',
            [AuditAction.UPDATE_PAYMENT_STATUS]: 'fas fa-credit-card text-yellow-500',
            [AuditAction.ASSIGN_STAFF]: 'fas fa-user-plus text-indigo-500',
            [AuditAction.UNASSIGN_STAFF]: 'fas fa-user-minus text-gray-500',
            [AuditAction.UPDATE_VIDEO_URL]: 'fas fa-link text-cyan-500',
            [AuditAction.UPDATE_ORDER_VALUE]: 'fas fa-dollar-sign text-green-600',
            [AuditAction.UPDATE_PRICE]: 'fas fa-tag text-pink-500',
            [AuditAction.AUTO_RESET]: 'fas fa-redo text-orange-400',
            [AuditAction.CUSTOMER_APPROVAL]: 'fas fa-thumbs-up text-green-600',
            [AuditAction.CUSTOMER_REVISION]: 'fas fa-comment-dots text-amber-500',
            [AuditAction.CANCEL]: 'fas fa-ban text-red-600',
            [AuditAction.ADMIN_OVERRIDE]: 'fas fa-shield-alt text-red-700',
            [AuditAction.RESTORE]: 'fas fa-undo text-blue-600',
            [AuditAction.EXPORT]: 'fas fa-download text-gray-600'
        };
        
        return icons[action] || 'fas fa-circle text-gray-400';
    }
}