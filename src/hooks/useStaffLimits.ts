// Custom hook for Staff Limit Management
// Quản lý state và logic cho staff limit operations

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    StaffLimit,
    StaffLimitFormData,
    StaffLimitCheckResponse,
    UseStaffLimitsReturn
} from '../types/staffLimit.types';
import { StaffLimitService } from '../services/staffLimitService';
import { extractErrorMessage } from '../utils/errorUtils';

export const useStaffLimits = (): UseStaffLimitsReturn => {
    // State management
    const [activeLimits, setActiveLimits] = useState<StaffLimit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);

    // Ref để tránh duplicate calls
    const loadingRef = useRef(false);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load active limits từ API
    const refreshLimits = useCallback(async () => {
        // Tránh duplicate calls
        if (loadingRef.current) {
            return;
        }

        try {
            loadingRef.current = true;
            setLoading(true);
            setError(null);

            console.log('Loading active staff limits...');
            const response = await StaffLimitService.getActiveLimits();

            if (response.success) {
                setActiveLimits(response.data);
                setLastUpdated(Date.now());
                console.log('Active limits loaded successfully:', response.data);
            } else {
                const errorMessage = extractErrorMessage(response, 'Không thể tải danh sách giới hạn');
                setError(errorMessage);
                console.warn('Failed to load active limits:', response.message);
            }
        } catch (err) {
            const errorMessage = extractErrorMessage(err, 'Lỗi kết nối khi tải danh sách giới hạn');
            setError(errorMessage);
            console.error('Error loading active limits:', err);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, []);

    // Tạo giới hạn mới
    const createLimit = useCallback(async (data: StaffLimitFormData): Promise<boolean> => {
        try {
            setSubmitting(true);
            setError(null);

            console.log('Creating staff limit:', data);
            
            // Validate data trước khi gửi
            const validation = StaffLimitService.validateStaffLimitData(data);
            if (!validation.isValid) {
                setError(validation.errors.join(', '));
                return false;
            }

            const response = await StaffLimitService.createStaffLimit(data);

            if (response.success) {
                console.log('Staff limit created successfully:', response.data);
                // Refresh danh sách sau khi tạo thành công
                await refreshLimits();
                return true;
            } else {
                const errorMessage = extractErrorMessage(response, 'Không thể tạo giới hạn nhân viên');
                setError(errorMessage);
                return false;
            }
        } catch (err) {
            const errorMessage = extractErrorMessage(err, 'Lỗi khi tạo giới hạn nhân viên');
            setError(errorMessage);
            console.error('Error creating staff limit:', err);
            return false;
        } finally {
            setSubmitting(false);
        }
    }, [refreshLimits]);

    // Hủy giới hạn
    const removeLimit = useCallback(async (staffName: string): Promise<boolean> => {
        try {
            setSubmitting(true);
            setError(null);

            console.log('Removing staff limit for:', staffName);
            const response = await StaffLimitService.removeStaffLimit(staffName);

            if (response.success) {
                console.log('Staff limit removed successfully:', response.data);
                // Refresh danh sách sau khi hủy thành công
                await refreshLimits();
                return true;
            } else {
                const errorMessage = extractErrorMessage(response, 'Không thể hủy giới hạn nhân viên');
                setError(errorMessage);
                return false;
            }
        } catch (err) {
            const errorMessage = extractErrorMessage(err, 'Lỗi khi hủy giới hạn nhân viên');
            setError(errorMessage);
            console.error('Error removing staff limit:', err);
            return false;
        } finally {
            setSubmitting(false);
        }
    }, [refreshLimits]);

    // Kiểm tra trạng thái giới hạn của nhân viên
    const checkStaffLimit = useCallback(async (staffName: string): Promise<StaffLimitCheckResponse | null> => {
        try {
            console.log('Checking staff limit for:', staffName);
            const response = await StaffLimitService.checkStaffLimit(staffName);
            console.log('Staff limit check result:', response);
            return response;
        } catch (err) {
            const errorMessage = extractErrorMessage(err, 'Lỗi khi kiểm tra trạng thái nhân viên');
            console.error('Error checking staff limit:', errorMessage);
            return null;
        }
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Setup auto-refresh mỗi 30 giây
    useEffect(() => {
        // Load initial data
        refreshLimits();

        // Setup auto-refresh interval
        refreshIntervalRef.current = setInterval(() => {
            console.log('Auto-refreshing active limits...');
            refreshLimits();
        }, 30000); // 30 seconds

        // Cleanup function
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }
        };
    }, [refreshLimits]);

    // Cleanup khi unmount
    useEffect(() => {
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, []);

    return {
        // Data
        activeLimits,
        loading,
        error,
        submitting,
        lastUpdated,

        // Actions
        createLimit,
        removeLimit,
        checkStaffLimit,
        refreshLimits,
        clearError
    };
};