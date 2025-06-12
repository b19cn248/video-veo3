// Global error handler để xử lý và log lỗi một cách nhất quán
// Cung cấp utility functions để handle lỗi ở level ứng dụng

import { extractErrorMessage, isAuthenticationError, isNetworkError } from './errorUtils';

/**
 * Global error handler class để xử lý lỗi toàn ứng dụng
 */
export class GlobalErrorHandler {
    /**
     * Xử lý lỗi từ API calls và hiển thị toast notification
     * 
     * @param error - Error object từ API call
     * @param context - Context của lỗi (operation name)
     * @param showToast - Function để hiển thị toast notification
     */
    static handleApiError(
        error: any, 
        context: string, 
        showToast?: (message: string, type: 'success' | 'error') => void
    ): string {
        // Extract error message từ API response
        const errorMessage = extractErrorMessage(error, `Lỗi khi ${context}`);
        
        // Log lỗi với context
        console.error(`API Error [${context}]:`, {
            error,
            message: errorMessage,
            url: error?.config?.url,
            method: error?.config?.method,
            status: error?.response?.status
        });

        // Hiển thị toast nếu có function
        if (showToast) {
            showToast(errorMessage, 'error');
        }

        // Xử lý đặc biệt cho authentication errors
        if (isAuthenticationError(error)) {
            this.handleAuthenticationError();
        }

        return errorMessage;
    }

    /**
     * Xử lý lỗi authentication - redirect về login page
     */
    static handleAuthenticationError(): void {
        console.warn('Authentication error detected, triggering login...');
        // Import AuthService dynamically để tránh circular dependency
        import('../services/authService').then(({ AuthService }) => {
            AuthService.login();
        }).catch((err) => {
            console.error('Failed to import AuthService:', err);
            // Fallback: reload trang để trigger authentication check
            window.location.reload();
        });
    }

    /**
     * Xử lý network errors
     * 
     * @param error - Network error object
     * @param showToast - Function để hiển thị toast notification
     */
    static handleNetworkError(
        error: any,
        showToast?: (message: string, type: 'success' | 'error') => void
    ): string {
        const errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.';
        
        console.error('Network Error:', {
            error,
            message: errorMessage
        });

        if (showToast) {
            showToast(errorMessage, 'error');
        }

        return errorMessage;
    }

    /**
     * Generic error handler cho tất cả loại lỗi
     * 
     * @param error - Error object
     * @param context - Context của lỗi
     * @param showToast - Function để hiển thị toast notification
     */
    static handle(
        error: any,
        context: string,
        showToast?: (message: string, type: 'success' | 'error') => void
    ): string {
        // Kiểm tra loại lỗi và xử lý tương ứng
        if (isNetworkError(error)) {
            return this.handleNetworkError(error, showToast);
        }

        return this.handleApiError(error, context, showToast);
    }

    /**
     * Log error cho debugging purposes
     * 
     * @param error - Error object
     * @param context - Context của lỗi
     * @param additionalInfo - Thông tin bổ sung
     */
    static logError(error: any, context: string, additionalInfo?: any): void {
        const errorInfo = {
            context,
            message: extractErrorMessage(error),
            timestamp: new Date().toISOString(),
            error: {
                name: error?.name,
                message: error?.message,
                stack: error?.stack,
                status: error?.response?.status,
                url: error?.config?.url,
                method: error?.config?.method
            },
            additionalInfo
        };

        // Log lỗi với đầy đủ thông tin
        console.error('Application Error:', errorInfo);

        // Có thể gửi error logs lên server monitoring service
        // this.sendErrorToMonitoringService(errorInfo);
    }

    /**
     * Gửi error logs lên monitoring service (placeholder)
     * 
     * @param errorInfo - Thông tin lỗi đã được format
     */
    static sendErrorToMonitoringService(errorInfo: any): void {
        // Placeholder cho việc gửi logs lên service như Sentry, LogRocket, etc.
        // try {
        //     await fetch('/api/errors', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify(errorInfo)
        //     });
        // } catch (err) {
        //     console.warn('Failed to send error to monitoring service:', err);
        // }
    }
}

/**
 * Higher-order function để wrap async functions với error handling
 * 
 * @param asyncFn - Async function cần wrap
 * @param context - Context của operation
 * @param showToast - Function để hiển thị toast notification
 */
export const withErrorHandling = <T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>,
    context: string,
    showToast?: (message: string, type: 'success' | 'error') => void
) => {
    return async (...args: T): Promise<R | null> => {
        try {
            return await asyncFn(...args);
        } catch (error) {
            GlobalErrorHandler.handle(error, context, showToast);
            return null;
        }
    };
};

/**
 * Hook-like function để sử dụng error handler trong React components
 * 
 * @param showToast - Function để hiển thị toast notification
 */
export const useErrorHandler = (
    showToast?: (message: string, type: 'success' | 'error') => void
) => {
    return {
        handleError: (error: any, context: string) => 
            GlobalErrorHandler.handle(error, context, showToast),
        
        handleApiError: (error: any, context: string) => 
            GlobalErrorHandler.handleApiError(error, context, showToast),
            
        logError: (error: any, context: string, additionalInfo?: any) => 
            GlobalErrorHandler.logError(error, context, additionalInfo),
            
        withErrorHandling: <T extends any[], R>(
            asyncFn: (...args: T) => Promise<R>,
            context: string
        ) => withErrorHandling(asyncFn, context, showToast)
    };
};
