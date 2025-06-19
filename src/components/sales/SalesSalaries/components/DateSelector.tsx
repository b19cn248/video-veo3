// Component Date Range Selector cho Sales Salaries
// Cho phép admin chọn khoảng thời gian để xem lương sales
// UPDATED: Hỗ trợ date range selection (startDate - endDate)

import React, { useState } from 'react';
import { getTodayDate, isToday } from '../../../../utils/dateUtils';

interface DateSelectorProps {
    startDate: string;
    endDate: string;
    onDateRangeChange: (startDate: string, endDate: string) => void;
    loading: boolean;
}

/**
 * Component để chọn khoảng thời gian xem lương sales
 * @param startDate - Ngày bắt đầu (yyyy-MM-dd)
 * @param endDate - Ngày kết thúc (yyyy-MM-dd)
 * @param onDateRangeChange - Callback khi thay đổi khoảng thời gian
 * @param loading - Trạng thái loading
 */
const DateSelector: React.FC<DateSelectorProps> = ({
    startDate,
    endDate,
    onDateRangeChange,
    loading
}) => {
    const [mode, setMode] = useState<'single' | 'range'>(
        startDate === endDate ? 'single' : 'range'
    );

    const handleModeChange = (newMode: 'single' | 'range') => {
        setMode(newMode);
        if (newMode === 'single') {
            // Khi chuyển về single, set cả 2 ngày về startDate
            onDateRangeChange(startDate, startDate);
        }
    };

    const handleStartDateChange = (newStartDate: string) => {
        if (mode === 'single') {
            onDateRangeChange(newStartDate, newStartDate);
        } else {
            // Đảm bảo startDate <= endDate
            if (newStartDate <= endDate) {
                onDateRangeChange(newStartDate, endDate);
            } else {
                onDateRangeChange(newStartDate, newStartDate);
            }
        }
    };

    const handleEndDateChange = (newEndDate: string) => {
        // Đảm bảo endDate >= startDate
        if (newEndDate >= startDate) {
            onDateRangeChange(startDate, newEndDate);
        } else {
            onDateRangeChange(newEndDate, newEndDate);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            {/* Mode Toggle */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    whiteSpace: 'nowrap'
                }}>
                    📅 Thống kê lương:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        type="button"
                        onClick={() => handleModeChange('single')}
                        disabled={loading}
                        style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            background: mode === 'single' ? '#3b82f6' : '#e5e7eb',
                            color: mode === 'single' ? 'white' : '#374151',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Theo ngày
                    </button>
                    <button
                        type="button"
                        onClick={() => handleModeChange('range')}
                        disabled={loading}
                        style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            background: mode === 'range' ? '#3b82f6' : '#e5e7eb',
                            color: mode === 'range' ? 'white' : '#374151',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Theo khoảng
                    </button>
                </div>
            </div>

            {/* Date Inputs */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
            }}>
                {/* Start Date */}
                <div style={{ position: 'relative' }}>
                    <label style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginBottom: '4px',
                        display: 'block'
                    }}>
                        {mode === 'single' ? 'Ngày' : 'Từ ngày'}
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        max={getTodayDate()}
                        onChange={(e) => handleStartDateChange(e.target.value)}
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
                    {/* Today badge */}
                    {mode === 'single' && isToday(startDate) && (
                        <div style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-8px',
                            background: '#10b981',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: '600',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            pointerEvents: 'none'
                        }}>
                            Hôm nay
                        </div>
                    )}
                </div>

                {/* End Date (chỉ hiển thị trong range mode) */}
                {mode === 'range' && (
                    <>
                        <span style={{ color: '#6b7280', fontSize: '14px', marginTop: '16px' }}>→</span>
                        <div>
                            <label style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                marginBottom: '4px',
                                display: 'block'
                            }}>
                                Đến ngày
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                max={getTodayDate()}
                                onChange={(e) => handleEndDateChange(e.target.value)}
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
                    </>
                )}
            </div>

            {/* Date Range Summary */}
            {startDate && endDate && (
                <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    padding: '8px',
                    background: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                }}>
                    {startDate === endDate ? (
                        `📊 Thống kê ngày ${startDate}`
                    ) : (
                        `📊 Thống kê từ ${startDate} đến ${endDate} (${Math.ceil(
                            (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
                        ) + 1} ngày)`
                    )}
                </div>
            )}
        </div>
    );
};

export default DateSelector;