// Định nghĩa các kiểu dữ liệu cho Staff Salary
// Types cho tính năng tính lương nhân viên

// Interface cho thông tin lương của một nhân viên
export interface StaffSalary {
    staffName: string;
    totalSalary: number;
    totalVideos: number;
}

// Interface cho response API lấy danh sách lương nhân viên
export interface StaffSalariesResponse {
    data: StaffSalary[];
    success: boolean;
    tenantId: string;
    message: string;
    timestamp: number;
}

// Interface cho response API lấy danh sách nhân viên
export interface AssignedStaffResponse {
    total: number;
    data: string[];
    success: boolean;
    tenantId: string;
    message: string;
    timestamp: number;
}

// Interface cho filter/sort trong Staff Salaries
export interface StaffSalaryFilter {
    sortBy: 'staffName' | 'totalSalary' | 'totalVideos';
    sortDirection: 'asc' | 'desc';
    searchTerm?: string;
    selectedDate?: string; // Backward compatibility
    startDate?: string; // Ngày bắt đầu (yyyy-MM-dd format)
    endDate?: string; // Ngày kết thúc (yyyy-MM-dd format)
}

// Interface cho summary statistics
export interface SalarySummary {
    totalStaff: number;
    totalVideos: number;
    totalSalary: number;
    averageSalary: number;
    averageVideosPerStaff: number;
    selectedDate?: string; // Backward compatibility
    startDate?: string; // Ngày bắt đầu
    endDate?: string; // Ngày kết thúc
}