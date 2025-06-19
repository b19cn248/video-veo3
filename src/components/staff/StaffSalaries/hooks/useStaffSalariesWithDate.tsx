// Custom hook quản lý logic Staff Salaries với date range filtering
// Tách logic khỏi component để dễ test và maintain
// UPDATED: Hook với date range support thay vì single date

import { useState, useEffect, useCallback } from 'react';
import { StaffSalary, StaffSalaryFilter, SalarySummary, StaffSalariesResponse } from '../../../../types/staff.types';
import { VideoService } from '../../../../services/videoService';
import { getTodayDate } from '../../../../utils/dateUtils';
import { extractErrorMessage } from '../../../../utils/errorUtils';

interface UseStaffSalariesWithDateReturn {
    // Data states
    staffSalaries: StaffSalary[];
    filteredSalaries: StaffSalary[];
    loading: boolean;
    error: string | null;
    summary: SalarySummary | null;

    // Filter states
    filter: StaffSalaryFilter;

    // Actions
    loadStaffSalaries: (startDate?: string, endDate?: string) => Promise<void>;
    handleSearchChange: (searchTerm: string) => void;
    handleSortChange: (sortBy: StaffSalaryFilter['sortBy']) => void;
    handleDateChange: (date: string) => void;
    handleDateRangeChange: (startDate: string, endDate: string) => void;
    getSortIcon: (column: StaffSalaryFilter['sortBy']) => string;
}
export const useStaffSalariesWithDate = (): UseStaffSalariesWithDateReturn => {
    // Data states
    const [staffSalaries, setStaffSalaries] = useState<StaffSalary[]>([]);
    const [filteredSalaries, setFilteredSalaries] = useState<StaffSalary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<SalarySummary | null>(null);

    // Filter states với date range - mặc định là ngày hôm nay
    const [filter, setFilter] = useState<StaffSalaryFilter>({
        sortBy: 'totalSalary',
        sortDirection: 'desc',
        searchTerm: '',
        selectedDate: getTodayDate(), // Backward compatibility
        startDate: getTodayDate(), // Ngày bắt đầu
        endDate: getTodayDate() // Ngày kết thúc
    });

    // Load staff salaries với date range
    const loadStaffSalaries = useCallback(async (startDate?: string, endDate?: string) => {
        try {
            setLoading(true);
            setError(null);

            const targetStartDate = startDate || filter.startDate || getTodayDate();
            const targetEndDate = endDate || filter.endDate || getTodayDate();
            console.log('Loading staff salaries for date range:', targetStartDate, 'to', targetEndDate);

            const response: StaffSalariesResponse = await VideoService.getStaffSalaries(targetStartDate, targetEndDate);

            if (response.success) {
                setStaffSalaries(response.data);

                // Tính toán summary statistics từ data array
                const totalStaff = response.data.length;
                const totalVideos = response.data.reduce((sum, staff) => sum + staff.totalVideos, 0);
                const totalSalary = response.data.reduce((sum, staff) => sum + staff.totalSalary, 0);

                const newSummary: SalarySummary = {
                    totalStaff,
                    totalVideos,
                    totalSalary,
                    averageSalary: totalStaff > 0 ? totalSalary / totalStaff : 0,
                    averageVideosPerStaff: totalStaff > 0 ? totalVideos / totalStaff : 0,
                    selectedDate: targetStartDate,
                    startDate: targetStartDate,
                    endDate: targetEndDate
                };

                setSummary(newSummary);
            } else {
                // Sử dụng error message từ API response
                const errorMessage = extractErrorMessage(response, 'Không thể tải thông tin lương nhân viên');
                setError(errorMessage);
                setSummary(null);
            }
        } catch (err) {
            // Extract error message từ exception
            const errorMessage = extractErrorMessage(err, 'Lỗi kết nối đến server');
            setError(errorMessage);
            console.error('Error loading staff salaries:', err);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    }, [filter.startDate, filter.endDate]);
    // Apply filters và sorting
    const applyFiltersAndSort = useCallback(() => {
        let filtered = [...staffSalaries];

        // Apply search filter
        if (filter.searchTerm && filter.searchTerm.trim()) {
            const searchTerm = filter.searchTerm.toLowerCase().trim();
            filtered = filtered.filter(staff =>
                staff.staffName.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any = a[filter.sortBy];
            let bValue: any = b[filter.sortBy];

            // Handle string sorting
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (filter.sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredSalaries(filtered);
    }, [staffSalaries, filter]);

    // Handle search change
    const handleSearchChange = useCallback((searchTerm: string) => {
        setFilter(prev => ({
            ...prev,
            searchTerm
        }));
    }, []);

    // Handle sort change
    const handleSortChange = useCallback((sortBy: StaffSalaryFilter['sortBy']) => {
        setFilter(prev => ({
            ...prev,
            sortBy,
            sortDirection: prev.sortBy === sortBy && prev.sortDirection === 'desc' ? 'asc' : 'desc'
        }));
    }, []);

    // Handle date range change
    const handleDateRangeChange = useCallback((startDate: string, endDate: string) => {
        setFilter(prev => ({
            ...prev,
            startDate,
            endDate,
            selectedDate: startDate // Backward compatibility
        }));
        
        // Load data với date range mới
        loadStaffSalaries(startDate, endDate);
    }, [loadStaffSalaries]);

    // Handle single date change (backward compatibility)
    const handleDateChange = useCallback((date: string) => {
        handleDateRangeChange(date, date);
    }, [handleDateRangeChange]);

    // Get sort icon
    const getSortIcon = useCallback((column: StaffSalaryFilter['sortBy']): string => {
        if (filter.sortBy !== column) return '↕️';
        return filter.sortDirection === 'desc' ? '⬇️' : '⬆️';
    }, [filter]);

    // Load data lần đầu với ngày hôm nay
    useEffect(() => {
        loadStaffSalaries();
    }, [loadStaffSalaries]);

    // Apply filters khi data hoặc filter thay đổi
    useEffect(() => {
        applyFiltersAndSort();
    }, [applyFiltersAndSort]);

    return {
        // Data states
        staffSalaries,
        filteredSalaries,
        loading,
        error,
        summary,

        // Filter states
        filter,

        // Actions
        loadStaffSalaries,
        handleSearchChange,
        handleSortChange,
        handleDateChange,
        handleDateRangeChange,
        getSortIcon
    };
};