// Định nghĩa các kiểu dữ liệu cho Sales Salary
// Types cho tính năng tính lương sales với commission 12%

// Interface cho thông tin lương của một sales person
export interface SalesSalary {
    salesName: string;
    salaryDate: string; // yyyy-MM-dd format
    totalPaidVideos: number;
    totalSalesValue: number;
    commissionSalary: number;
    commissionRate: number; // Tỷ lệ hoa hồng (mặc định 0.12)
}

// Interface cho response API lấy danh sách lương sales
export interface SalesSalariesResponse {
    data: SalesSalary[];
    summary: {
        totalSalesPersons: number;
        totalCommission: number;
        totalSalesValue: number;
        totalPaidVideos: number;
        commissionRate: string;
        calculationDate: string;
    };
    success: boolean;
    tenantId: string;
    message: string;
    timestamp: number;
}

// Interface cho filter/sort trong Sales Salaries
export interface SalesSalaryFilter {
    sortBy: 'salesName' | 'commissionSalary' | 'totalPaidVideos' | 'totalSalesValue';
    sortDirection: 'asc' | 'desc';
    searchTerm?: string;
    selectedDate?: string; // Ngày được chọn để lọc (yyyy-MM-dd format)
}

// Interface cho summary statistics của sales
export interface SalesSalarySummary {
    totalSalesPersons: number;
    totalPaidVideos: number;
    totalSalesValue: number;
    totalCommission: number;
    averageCommission: number;
    averageVideosPerSales: number;
    commissionRate: string;
    selectedDate?: string;
}