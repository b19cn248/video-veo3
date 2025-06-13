// Component Date Selector cho Sales Salaries
// Cho phép admin chọn ngày để xem lương sales
// Tái sử dụng pattern từ Staff Salaries

import React from 'react';

interface DateSelectorProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
    loading: boolean;
}

/**
 * Component để chọn ngày xem lương sales
 * @param selectedDate - Ngày hiện tại được chọn (yyyy-MM-dd)
 * @param onDateChange - Callback khi thay đổi ngày
 * @param loading - Trạng thái loading
 */
const DateSelector: React.FC<DateSelectorProps> = ({
    selectedDate,
    onDateChange,
    loading
}) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        }}>
            <label style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                whiteSpace: 'nowrap'
            }}>
                📅 Ngày tính lương:
            </label>
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                disabled={loading}
                style={{
                    padding: '8px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    backgroundColor: loading ? '#f3f4f6' : 'white',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onFocus={(e) => !loading && (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
        </div>
    );
};

export default DateSelector;