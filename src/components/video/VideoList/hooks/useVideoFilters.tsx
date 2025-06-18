// Custom hook quản lý logic filter cho VideoList
// FIXED: Loại bỏ infinite loop và tối ưu re-renders
// Includes: filter states, API calls, proper memoization

import { useState, useEffect, useCallback, useRef } from 'react';
import { FilterState, FilterOptions, VideoFilterParams } from '../../../../types/video.types';
import { VideoService } from '../../../../services/videoService';
import { extractErrorMessage } from '../../../../utils/errorUtils';

interface UseVideoFiltersReturn {
    // Filter states
    filters: FilterState;
    filterOptions: FilterOptions;
    isFiltering: boolean;
    activeFiltersCount: number;
    loadingStaffList: boolean;
    loadingCreatorsList: boolean; // NEW: Loading state cho creators

    // Actions
    handleFilterChange: (filterType: keyof FilterState, value: string) => void;
    resetAllFilters: () => void;
    loadFilterOptions: () => Promise<void>;
    getFilterParams: () => VideoFilterParams | undefined;

    // NEW: Manual trigger để tránh auto-apply
    applyFilters: () => void;
}

export const useVideoFilters = (): UseVideoFiltersReturn => {
    // Filter states
    const [filters, setFilters] = useState<FilterState>({
        customerName: '', // NEW: Thêm customer name search
        status: '',
        assignedStaff: '',
        deliveryStatus: '',
        paymentStatus: '',
        paymentDate: '', // NEW: Thêm filter ngày thanh toán
        createdBy: '', // NEW: Thêm filter người tạo
        videoId: '' // NEW: Thêm filter video ID
    });

    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        assignedStaffList: [],
        creatorsList: [] // NEW: Thêm danh sách người tạo
    });

    const [isFiltering, setIsFiltering] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const [loadingStaffList, setLoadingStaffList] = useState(false);
    const [loadingCreatorsList, setLoadingCreatorsList] = useState(false); // NEW: Loading state cho creators

    // NEW: Ref để track filters cho external callback
    const filtersRef = useRef(filters);
    const onFiltersChangeCallbackRef = useRef<((filters: VideoFilterParams | undefined) => void) | null>(null);

    // Update ref khi filters thay đổi
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    // Load filter options (assigned staff list và creators list từ API)
    const loadFilterOptions = useCallback(async () => {
        try {
            setLoadingStaffList(true);
            setLoadingCreatorsList(true);
            console.log('Loading filter options...');

            // Load both staff list and creators list in parallel
            const [staffResponse, creatorsResponse] = await Promise.allSettled([
                VideoService.getAssignedStaffList(),
                VideoService.getCreatorsList()
            ]);

            // Handle staff list response
            if (staffResponse.status === 'fulfilled') {
                const response = staffResponse.value;
                console.log('Staff list response:', response);

                if (response.success && response.data) {
                    setFilterOptions(prev => ({
                        ...prev,
                        assignedStaffList: response.data
                    }));
                    console.log('Loaded staff list:', response.data);
                } else {
                    console.warn('Failed to load staff list:', response.message);
                    setFilterOptions(prev => ({
                        ...prev,
                        assignedStaffList: []
                    }));
                }
            } else {
                console.error('Error loading staff list:', staffResponse.reason);
                setFilterOptions(prev => ({
                    ...prev,
                    assignedStaffList: []
                }));
            }

            // Handle creators list response
            if (creatorsResponse.status === 'fulfilled') {
                const response = creatorsResponse.value;
                console.log('Creators list response:', response);

                if (response.success && response.data) {
                    setFilterOptions(prev => ({
                        ...prev,
                        creatorsList: response.data
                    }));
                    console.log('Loaded creators list:', response.data);
                } else {
                    console.warn('Failed to load creators list:', response.message);
                    setFilterOptions(prev => ({
                        ...prev,
                        creatorsList: []
                    }));
                }
            } else {
                console.error('Error loading creators list:', creatorsResponse.reason);
                setFilterOptions(prev => ({
                    ...prev,
                    creatorsList: []
                }));
            }
        } catch (error) {
            console.error('Error loading filter options:', error);
            // Extract error message để có thể log chi tiết hơn nếu cần
            const errorMessage = extractErrorMessage(error, 'Lỗi khi tải danh sách filter options');
            console.warn('Filter options loading failed:', errorMessage);
            
            setFilterOptions(prev => ({
                ...prev,
                assignedStaffList: [],
                creatorsList: []
            }));
        } finally {
            setLoadingStaffList(false);
            setLoadingCreatorsList(false);
        }
    }, []);

    // Tính toán số lượng active filters
    useEffect(() => {
        const count = Object.values(filters).filter(value =>
            value !== null && value !== undefined && value !== ''
        ).length;
        setActiveFiltersCount(count);
        setIsFiltering(count > 0);
    }, [filters]);

    // Convert filters sang API params - STABLE function
    const getFilterParams = useCallback((): VideoFilterParams | undefined => {
        const currentFilters = filtersRef.current;
        const filterParams: VideoFilterParams = {};

        if (currentFilters.customerName && currentFilters.customerName.trim()) {
            filterParams.customerName = currentFilters.customerName.trim();
        }
        if (currentFilters.status) {
            filterParams.status = currentFilters.status as any;
        }
        if (currentFilters.assignedStaff && currentFilters.assignedStaff.trim()) {
            filterParams.assignedStaff = currentFilters.assignedStaff.trim();
        }
        if (currentFilters.deliveryStatus) {
            filterParams.deliveryStatus = currentFilters.deliveryStatus as any;
        }
        if (currentFilters.paymentStatus) {
            filterParams.paymentStatus = currentFilters.paymentStatus as any;
        }
        if (currentFilters.paymentDate) {
            filterParams.paymentDate = currentFilters.paymentDate;
        }
        if (currentFilters.createdBy && currentFilters.createdBy.trim()) {
            filterParams.createdBy = currentFilters.createdBy.trim();
        }
        if (currentFilters.videoId && currentFilters.videoId.trim()) {
            // Convert videoId string to number for API
            const videoIdNumber = parseInt(currentFilters.videoId.trim(), 10);
            if (!isNaN(videoIdNumber)) {
                filterParams.videoId = videoIdNumber;
            }
        }

        return Object.keys(filterParams).length > 0 ? filterParams : undefined;
    }, []); // Empty dependency - function chỉ đọc từ ref

    // NEW: Manual apply filters function
    const applyFilters = useCallback(() => {
        const filterParams = getFilterParams();
        if (onFiltersChangeCallbackRef.current) {
            onFiltersChangeCallbackRef.current(filterParams);
        }
    }, [getFilterParams]);

    // NEW: Set callback function từ bên ngoài
    const setOnFiltersChangeCallback = useCallback((callback: (filters: VideoFilterParams | undefined) => void) => {
        onFiltersChangeCallbackRef.current = callback;
    }, []);

    // REMOVED: Auto-apply useEffect để tránh infinite loop
    // Thay vào đó sử dụng manual applyFilters()

    // Xử lý thay đổi filter với debounce cho customer name search và video ID
    const handleFilterChange = useCallback((filterType: keyof FilterState, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));

        // Special handling cho customer name search và video ID với debounce dài hơn
        const debounceTime = (filterType === 'customerName' || filterType === 'videoId') ? 500 : 300;
        
        setTimeout(() => {
            const filterParams = getFilterParams();
            if (onFiltersChangeCallbackRef.current) {
                onFiltersChangeCallbackRef.current(filterParams);
            }
        }, debounceTime);
    }, [getFilterParams]);

    // Reset tất cả filters
    const resetAllFilters = useCallback(() => {
        setFilters({
            customerName: '', // NEW: Reset customer name search
            status: '',
            assignedStaff: '',
            deliveryStatus: '',
            paymentStatus: '',
            paymentDate: '', // NEW: Reset payment date filter
            createdBy: '', // NEW: Reset created by filter
            videoId: '' // NEW: Reset video ID filter
        });

        // Apply empty filters immediately
        setTimeout(() => {
            if (onFiltersChangeCallbackRef.current) {
                onFiltersChangeCallbackRef.current(undefined);
            }
        }, 50);
    }, []);

    // Load filter options khi mount
    useEffect(() => {
        loadFilterOptions();
    }, [loadFilterOptions]);

    return {
        // Filter states
        filters,
        filterOptions,
        isFiltering,
        activeFiltersCount,
        loadingStaffList,
        loadingCreatorsList, // NEW: Loading state cho creators

        // Actions
        handleFilterChange,
        resetAllFilters,
        loadFilterOptions,
        getFilterParams,
        applyFilters,

        // NEW: Internal method để set callback
        setOnFiltersChangeCallback
    } as UseVideoFiltersReturn & { setOnFiltersChangeCallback: (callback: (filters: VideoFilterParams | undefined) => void) => void };
};