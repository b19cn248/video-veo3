// Helper functions cho VideoList components
// Tách riêng utility functions để tái sử dụng
// Includes: toast notifications, formatting, validation

// Enhanced toast notification helper
export const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const toast = document.createElement('div');
    toast.textContent = message;
    
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        info: '#3B82F6',
        warning: '#F59E0B'
    };
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 14px 24px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        background-color: ${colors[type]};
        backdrop-filter: blur(10px);
        max-width: 400px;
        word-wrap: break-word;
    `;

    document.body.appendChild(toast);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
};

// Enhanced button styles for better UX
export const createButtonStyle = (variant: 'primary' | 'secondary' | 'danger' | 'success') => {
    const baseStyle = {
        border: 'none',
        borderRadius: '8px',
        padding: '8px 14px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        textDecoration: 'none'
    };

    const variants = {
        primary: { background: '#3b82f6', color: 'white' },
        secondary: { background: '#64748b', color: 'white' },
        danger: { background: '#ef4444', color: 'white' },
        success: { background: '#10b981', color: 'white' }
    };

    return { ...baseStyle, ...variants[variant] };
};

// Status badge styles for better visual hierarchy
export const createStatusBadgeStyle = (status: string) => {
    const baseStyle = {
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        border: '1px solid transparent'
    };

    const statusColors: { [key: string]: { bg: string; color: string; border: string } } = {
        'CHUA_AI_NHAN': { bg: '#fef3c7', color: '#92400e', border: '#fbbf24' },
        'DANG_LAM': { bg: '#dbeafe', color: '#1e40af', border: '#60a5fa' },
        'DA_XONG': { bg: '#d1fae5', color: '#065f46', border: '#34d399' },
        'DANG_SUA': { bg: '#fde68a', color: '#92400e', border: '#f59e0b' },
        'DA_SUA_XONG': { bg: '#d1fae5', color: '#065f46', border: '#10b981' }
    };

    const colors = statusColors[status] || { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };

    return {
        ...baseStyle,
        backgroundColor: colors.bg,
        color: colors.color,
        borderColor: colors.border
    };
};

// Tạo hover handlers cho buttons
export const createButtonHoverHandlers = (variant: 'primary' | 'secondary' | 'danger' | 'success') => {
    const hoverColors = {
        primary: '#2563eb',
        secondary: '#4b5563',
        danger: '#dc2626',
        success: '#059669'
    };

    const originalColors = {
        primary: '#3b82f6',
        secondary: '#6b7280',
        danger: '#ef4444',
        success: '#10b981'
    };

    return {
        onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = hoverColors[variant];
            e.currentTarget.style.transform = 'translateY(-1px)';
        },
        onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = originalColors[variant];
            e.currentTarget.style.transform = 'translateY(0)';
        }
    };
};

// Enhanced filter input styles
export const createFilterInputStyle = (disabled = false) => ({
    width: '100%',
    padding: '10px 14px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: disabled ? '#f8fafc' : 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    opacity: disabled ? 0.7 : 1,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
});

// Enhanced focus/blur handlers for inputs
export const createInputFocusHandlers = (disabled = false) => ({
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!disabled) {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
        }
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!disabled) {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        }
    }
});

// Enhanced filter badge styles
export const createFilterBadgeStyle = (color: string) => ({
    background: color,
    color: 'white',
    fontSize: '11px',
    padding: '6px 12px',
    borderRadius: '16px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
});

// Enhanced colors for different filter types
export const filterBadgeColors = {
    customerName: '#db2777', // Pink for customer name search
    status: '#1e40af', // Blue for status
    assignedStaff: '#7c3aed', // Purple for staff assignment
    deliveryStatus: '#ea580c', // Orange for delivery status
    paymentStatus: '#059669', // Green for payment status
    paymentDate: '#0891b2', // Cyan for payment date filter
    createdBy: '#8b5cf6' // Violet for created by filter
};

// Responsive breakpoints for better mobile experience
export const breakpoints = {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    large: '1280px'
};

// Enhanced filter value validation
export const validateFilterValue = (value: string): boolean => {
    return value !== null && value !== undefined && value.trim() !== '' && value !== 'undefined';
};

// Utility function for truncating text
export const truncateText = (text: string, maxLength: number): string => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Utility function for formatting display names
export const formatDisplayName = (name: string | undefined | null): string => {
    if (!name || name.trim() === '') return '--';
    return name.trim();
};

// Enhanced filter display text formatting
export const formatFilterDisplayText = (filterType: string, value: string): string => {
    const prefixes = {
        customerName: '👤 Khách hàng:', // Enhanced with icon
        status: '🎬 Trạng thái:',
        assignedStaff: '👨‍💼 Nhân viên:',
        deliveryStatus: '🚚 Giao hàng:',
        paymentStatus: '💰 Thanh toán:',
        paymentDate: '📅 Ngày thanh toán:',
        createdBy: '✍️ Người tạo:'
    };

    return `${prefixes[filterType as keyof typeof prefixes] || ''} ${value}`;
};

// Common table styles - optimized for better UX
export const tableStyles = {
    container: {
        background: 'white',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        tableLayout: 'fixed' as const // Better column width control
    },
    headerCell: {
        padding: '16px 12px',
        textAlign: 'left' as const,
        fontWeight: '600',
        fontSize: '14px',
        color: '#374151',
        background: '#f8fafc',
        borderBottom: '2px solid #e2e8f0',
        position: 'sticky' as const,
        top: 0,
        zIndex: 10
    },
    headerRow: {
        background: '#f8fafc'
    },
    bodyRow: {
        borderBottom: '1px solid #f1f5f9',
        transition: 'all 0.2s ease',
        cursor: 'default'
    },
    bodyCell: {
        padding: '12px',
        fontSize: '13px',
        color: '#475569',
        verticalAlign: 'middle' as const
    }
};

// Optimized column widths for better space utilization
export const columnWidths = {
    id: '48px', // Reduced to 60% of original 80px
    customer: '160px',
    creator: '120px',
    status: '140px',
    staff: '160px',
    delivery: '120px',
    payment: '120px',
    paymentDate: '120px',
    videoUrl: '200px',
    actions: '220px' // Increased to accommodate 5 buttons for admin
};

// Empty state configuration - enhanced
export const emptyStateConfig = {
    filtering: {
        icon: '🔍',
        title: 'Không tìm thấy video nào với bộ lọc hiện tại',
        subtitle: 'Thử thay đổi hoặc xóa bớt điều kiện lọc để xem thêm kết quả'
    },
    noData: {
        icon: '📹',
        title: 'Chưa có video nào',
        subtitle: 'Hãy tạo video đầu tiên để bắt đầu quản lý dự án của bạn'
    }
};

// Hover effects for table rows
export const createRowHoverEffect = () => ({
    onMouseEnter: (e: React.MouseEvent<HTMLTableRowElement>) => {
        e.currentTarget.style.backgroundColor = '#f8fafc';
        e.currentTarget.style.transform = 'scale(1.001)';
    },
    onMouseLeave: (e: React.MouseEvent<HTMLTableRowElement>) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.transform = 'scale(1)';
    }
});