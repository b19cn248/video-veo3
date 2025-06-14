// Helper functions cho VideoList components
// Tách riêng utility functions để tái sử dụng
// Includes: toast notifications, formatting, validation

// Toast notification helper
export const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        background-color: ${type === 'success' ? '#10B981' : '#EF4444'};
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
};

// Tạo CSS inline styles cho common elements
export const createButtonStyle = (variant: 'primary' | 'secondary' | 'danger' | 'success') => {
    const baseStyle = {
        border: 'none',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    };

    const variants = {
        primary: { background: '#3b82f6', color: 'white' },
        secondary: { background: '#6b7280', color: 'white' },
        danger: { background: '#ef4444', color: 'white' },
        success: { background: '#10b981', color: 'white' }
    };

    return { ...baseStyle, ...variants[variant] };
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

// Tạo style cho filter input/select
export const createFilterInputStyle = (disabled = false) => ({
    width: '100%',
    padding: '8px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: disabled ? '#f9fafb' : 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'border-color 0.2s ease',
    outline: 'none',
    opacity: disabled ? 0.7 : 1
});

// Tạo focus/blur handlers cho inputs
export const createInputFocusHandlers = (disabled = false) => ({
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!disabled) e.target.style.borderColor = '#3b82f6';
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!disabled) e.target.style.borderColor = '#e5e7eb';
    }
});

// Tạo style cho filter badges
export const createFilterBadgeStyle = (color: string) => ({
    background: color,
    color: 'white',
    fontSize: '11px',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: '500'
});

// Colors cho different filter types
export const filterBadgeColors = {
    customerName: '#db2777', // NEW: Pink color cho customer name search
    status: '#1e40af',
    assignedStaff: '#7c3aed',
    deliveryStatus: '#ea580c',
    paymentStatus: '#059669',
    paymentDate: '#0891b2', // NEW: Cyan color cho payment date filter
    createdBy: '#8b5cf6' // NEW: Purple color cho created by filter
};

// Validate filter values
export const validateFilterValue = (value: string): boolean => {
    return value !== null && value !== undefined && value.trim() !== '';
};

// Format filter display text
export const formatFilterDisplayText = (filterType: string, value: string): string => {
    const prefixes = {
        customerName: 'Khách hàng:', // NEW: Prefix cho customer search
        status: 'Video:',
        assignedStaff: 'Nhân viên:',
        deliveryStatus: 'Giao hàng:',
        paymentStatus: 'Thanh toán:',
        paymentDate: 'Ngày thanh toán:', // NEW: Prefix cho payment date
        createdBy: 'Người tạo:' // NEW: Prefix cho created by
    };

    return `${prefixes[filterType as keyof typeof prefixes] || ''} ${value}`;
};

// Common table styles
export const tableStyles = {
    container: {
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const
    },
    headerCell: {
        padding: '12px 8px',
        textAlign: 'left' as const,
        fontWeight: '600',
        fontSize: '13px',
        color: '#374151'
    },
    headerRow: {
        background: '#f9fafb'
    },
    bodyRow: {
        borderBottom: '1px solid #f3f4f6',
        transition: 'background-color 0.2s ease'
    }
};

// Empty state configuration
export const emptyStateConfig = {
    filtering: {
        icon: '🔍',
        title: 'Không tìm thấy video nào với bộ lọc hiện tại',
        subtitle: 'Thử thay đổi hoặc xóa bớt điều kiện lọc'
    },
    noData: {
        icon: '📹',
        title: 'Chưa có video nào',
        subtitle: 'Hãy tạo video đầu tiên bằng cách click "Tạo video mới"'
    }
};