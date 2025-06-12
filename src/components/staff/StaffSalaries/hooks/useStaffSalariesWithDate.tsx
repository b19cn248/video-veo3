// Custom hook quản lý logic Staff Salaries với date filtering
// Tách logic khỏi component để dễ test và maintain
// NEW: Hook riêng cho việc quản lý state và API calls với date parameter

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
    loadStaffSalaries: (selectedDate?: string) => Promise<void>;
    handleSearchChange: (searchTerm: string) => void;
    handleSortChange: (sortBy: StaffSalaryFilter['sortBy']) => void;
    handleDateChange: (date: string) => void;
    getSortIcon: (column: StaffSalaryFilter['sortBy']) => string;
}
export const useStaffSalariesWithDate = (): UseStaffSalariesWithDateReturn => {
    // Data states
    const [staffSalaries, setStaffSalaries] = useState<StaffSalary[]>([]);
    const [filteredSalaries, setFilteredSalaries] = useState<StaffSalary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<SalarySummary | null>(null);

    // Filter states - mặc định là ngày hôm nay
    const [filter, setFilter] = useState<StaffSalaryFilter>({
        sortBy: 'totalSalary',
        sortDirection: 'desc',
        searchTerm: '',
        selectedDate: getTodayDate() // NEW: Mặc định là ngày hôm nay
    });

    // Load staff salaries với date parameter
    const loadStaffSalaries = useCallback(async (selectedDate?: string) => {
        try {
            setLoading(true);
            setError(null);

            const dateToUse = selectedDate || filter.selectedDate;
            console.log('Loading staff salaries for date:', dateToUse);

            const response: StaffSalariesResponse = await VideoService.getStaffSalaries(dateToUse);

            if (response.success) {
                setStaffSalaries(response.data);

                // Tính toán summary statistics với ngày được chọn
                const totalStaff = response.totalStaff;
                const totalVideos = response.totalVideos;
                const totalSalary = response.totalSalary;

                const newSummary: SalarySummary = {
                    totalStaff,
                    totalVideos,
                    totalSalary,
                    averageSalary: totalStaff > 0 ? totalSalary / totalStaff : 0,
                    averageVideosPerStaff: totalStaff > 0 ? totalVideos / totalStaff : 0,
                    selectedDate: dateToUse // NEW: Lưu ngày được chọn
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
    }, [filter.selectedDate]);
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

    // NEW: Handle date change
    const handleDateChange = useCallback((date: string) => {
        setFilter(prev => ({
            ...prev,
            selectedDate: date
        }));
        
        // Load data với ngày mới
        loadStaffSalaries(date);
    }, [loadStaffSalaries]);

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
        getSortIcon
    };
};