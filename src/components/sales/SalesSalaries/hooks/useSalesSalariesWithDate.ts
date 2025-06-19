// Custom hook để quản lý logic Sales Salaries với date range filtering
// Tách biệt logic khỏi UI component để dễ maintain và test
// UPDATED: Hỗ trợ date range thay vì single date

import { useState, useEffect, useCallback, useMemo } from 'react';
import { VideoService } from '../../../../services/videoService';
import { SalesSalary, SalesSalaryFilter, SalesSalarySummary } from '../../../../types/sales.types';
import { extractErrorMessage } from '../../../../utils/errorUtils';

/**
 * Custom hook để quản lý state và logic cho Sales Salaries với date range
 * @returns Object chứa state và methods để tương tác với sales salaries data
 */
export const useSalesSalariesWithDate = () => {
    // State quản lý data và UI
    const [salesSalaries, setSalesSalaries] = useState<SalesSalary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State cho filter và search với date range
    const [filter, setFilter] = useState<SalesSalaryFilter>({
        sortBy: 'commissionSalary',
        sortDirection: 'desc',
        searchTerm: '',
        selectedDate: new Date().toISOString().split('T')[0], // Backward compatibility
        startDate: new Date().toISOString().split('T')[0], // Ngày bắt đầu
        endDate: new Date().toISOString().split('T')[0] // Ngày kết thúc, mặc định = startDate
    });

    /**
     * Load sales salaries data từ API với date range
     * @param startDate - Ngày bắt đầu (yyyy-MM-dd)
     * @param endDate - Ngày kết thúc (yyyy-MM-dd)
     */
    const loadSalesSalaries = useCallback(async (startDate?: string, endDate?: string) => {
        const targetStartDate = startDate || filter.startDate;
        const targetEndDate = endDate || filter.endDate;
        
        if (!targetStartDate || !targetEndDate) return;

        setLoading(true);
        setError(null);

        try {
            console.log('Loading sales salaries for date range:', targetStartDate, 'to', targetEndDate);
            const response = await VideoService.getSalesSalaries(targetStartDate, targetEndDate);

            if (response.success && response.data) {
                setSalesSalaries(response.data);
                console.log('Successfully loaded', response.data.length, 'sales records');
            } else {
                setSalesSalaries([]);
                console.warn('API returned success=false or no data');
            }
        } catch (err) {
            const errorMessage = extractErrorMessage(err);
            setError(errorMessage);
            setSalesSalaries([]);
            console.error('Failed to load sales salaries:', errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filter.startDate, filter.endDate]);

    /**
     * Effect để load data khi component mount hoặc date thay đổi
     */
    useEffect(() => {
        loadSalesSalaries();
    }, [loadSalesSalaries]);

    /**
     * Filter và sort sales salaries theo search term và sort criteria
     */
    const filteredSalaries = useMemo(() => {
        let filtered = [...salesSalaries];

        // Filter by search term
        if (filter.searchTerm && filter.searchTerm.trim()) {
            const searchLower = filter.searchTerm.toLowerCase().trim();
            filtered = filtered.filter(salary =>
                salary.salesName.toLowerCase().includes(searchLower)
            );
        }

        // Sort by selected criteria
        filtered.sort((a, b) => {
            let aValue: any = a[filter.sortBy];
            let bValue: any = b[filter.sortBy];

            // Handle string sorting (case insensitive)
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            let result = 0;
            if (aValue < bValue) result = -1;
            else if (aValue > bValue) result = 1;

            return filter.sortDirection === 'desc' ? -result : result;
        });

        return filtered;
    }, [salesSalaries, filter.searchTerm, filter.sortBy, filter.sortDirection]);

    /**
     * Tính summary statistics từ filtered data
     */
    const summary = useMemo((): SalesSalarySummary | null => {
        if (filteredSalaries.length === 0) return null;

        const totalCommission = filteredSalaries.reduce((sum, salary) => sum + salary.commissionSalary, 0);
        const totalSalesValue = filteredSalaries.reduce((sum, salary) => sum + salary.totalSalesValue, 0);
        const totalVideos = filteredSalaries.reduce((sum, salary) => sum + salary.totalPaidVideos, 0);

        return {
            totalSalesPersons: filteredSalaries.length,
            totalPaidVideos: totalVideos,
            totalSalesValue: totalSalesValue,
            totalCommission: totalCommission,
            averageCommission: filteredSalaries.length > 0 ? totalCommission / filteredSalaries.length : 0,
            averageVideosPerSales: filteredSalaries.length > 0 ? totalVideos / filteredSalaries.length : 0,
            commissionRate: '12%',
            selectedDate: filter.selectedDate,
            startDate: filter.startDate,
            endDate: filter.endDate
        };
    }, [filteredSalaries, filter.selectedDate, filter.startDate, filter.endDate]);

    /**
     * Handler để thay đổi search term
     */
    const handleSearchChange = useCallback((searchTerm: string) => {
        setFilter(prev => ({
            ...prev,
            searchTerm
        }));
    }, []);

    /**
     * Handler để thay đổi sort criteria
     */
    const handleSortChange = useCallback((sortBy: SalesSalaryFilter['sortBy']) => {
        setFilter(prev => ({
            ...prev,
            sortBy,
            sortDirection: prev.sortBy === sortBy && prev.sortDirection === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    /**
     * Handler để thay đổi date range
     */
    const handleDateRangeChange = useCallback((startDate: string, endDate: string) => {
        setFilter(prev => ({
            ...prev,
            startDate,
            endDate,
            selectedDate: startDate // Backward compatibility
        }));
        // Load data cho date range mới
        loadSalesSalaries(startDate, endDate);
    }, [loadSalesSalaries]);

    /**
     * Handler để thay đổi ngày được chọn (backward compatibility)
     */
    const handleDateChange = useCallback((selectedDate: string) => {
        handleDateRangeChange(selectedDate, selectedDate);
    }, [handleDateRangeChange]);

    /**
     * Get sort icon based on current sort state
     */
    const getSortIcon = useCallback((columnKey: SalesSalaryFilter['sortBy']) => {
        if (filter.sortBy !== columnKey) return '↕️';
        return filter.sortDirection === 'asc' ? '↗️' : '↘️';
    }, [filter.sortBy, filter.sortDirection]);

    return {
        // Data state
        salesSalaries,
        filteredSalaries,
        loading,
        error,
        summary,
        filter,

        // Actions
        loadSalesSalaries,
        handleSearchChange,
        handleSortChange,
        handleDateChange,
        handleDateRangeChange,
        getSortIcon
    };
};