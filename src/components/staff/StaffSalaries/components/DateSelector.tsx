// Component Date Selector cho Staff Salaries
// Cho phép chọn ngày để lọc thống kê lương nhân viên
// NEW: Component riêng để tái sử dụng và maintain dễ dàng

import React from 'react';
import { getTodayDate, createDateLabel, isToday } from '../../../../utils/dateUtils';

interface DateSelectorProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
    loading?: boolean;
}

const DateSelector: React.FC<DateSelectorProps> = ({
    selectedDate,
    onDateChange,
    loading = false
}) => {
    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            minWidth: '200px' 
        }}>
            <label style={{
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                whiteSpace: 'nowrap'
            }}>
                📅 Ngày thống kê:
            </label>
            
            <div style={{ position: 'relative', flex: 1 }}>
                <input
                    type="date"
                    value={selectedDate}
                    max={getTodayDate()} // Không cho phép chọn ngày tương lai
                    onChange={(e) => onDateChange(e.target.value)}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                        backgroundColor: loading ? '#f9fafb' : 'white',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                    onFocus={(e) => {
                        if (!loading) e.target.style.borderColor = '#3b82f6';
                    }}
                    onBlur={(e) => {
                        if (!loading) e.target.style.borderColor = '#e5e7eb';
                    }}
                />
                
                {/* Today badge khi chọn ngày hôm nay */}
                {isToday(selectedDate) && (
                    <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#10b981',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        pointerEvents: 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        Hôm nay
                    </div>
                )}
            </div>
        </div>
    );
};

export default DateSelector;