// Custom hook để gọi API revenue statistics
// Tách riêng để dễ quản lý và tái sử dụng

import { useState, useCallback } from 'react';
import { VideoService } from '../../../../services/videoService';
import { RevenueStatistics } from '../../../../types/sales.types';
import { extractErrorMessage } from '../../../../utils/errorUtils';

interface UseRevenueStatisticsReturn {
    revenueStats: RevenueStatistics | null;
    loading: boolean;
    error: string | null;
    loadRevenueStatistics: (startDate: string, endDate: string) => Promise<void>;
}

export const useRevenueStatistics = (): UseRevenueStatisticsReturn => {
    const [revenueStats, setRevenueStats] = useState<RevenueStatistics | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadRevenueStatistics = useCallback(async (startDate: string, endDate: string) => {
        if (!startDate || !endDate) {
            console.log('Missing startDate or endDate for revenue statistics');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            console.log('Loading revenue statistics for date range:', startDate, 'to', endDate);
            
            const response = await VideoService.getRevenueStatistics(startDate, endDate);
            
            if (response.success && response.data) {
                setRevenueStats(response.data);
                console.log('Revenue statistics loaded successfully:', response.data);
            } else {
                const errorMessage = extractErrorMessage(response, 'Không thể tải thống kê doanh thu');
                setError(errorMessage);
                console.error('Revenue statistics API returned error:', response.message);
            }
        } catch (err) {
            const errorMessage = extractErrorMessage(err, 'Lỗi khi tải thống kê doanh thu');
            setError(errorMessage);
            console.error('Error loading revenue statistics:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        revenueStats,
        loading,
        error,
        loadRevenueStatistics
    };
};