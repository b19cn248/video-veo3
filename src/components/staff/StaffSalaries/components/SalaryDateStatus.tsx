// Component hiển thị trạng thái khoảng thời gian được chọn cho thống kê lương
// UPDATED: Hỗ trợ hiển thị date range thay vì single date
// Component riêng để tái sử dụng và maintain dễ dàng

import React from 'react';
import { createDateLabel, isToday, formatDateForDisplay } from '../../../../utils/dateUtils';

interface SalaryDateStatusProps {
    selectedDate?: string; // Backward compatibility
    startDate: string;
    endDate: string;
    totalStaff: number;
    totalSalary: number;
    totalVideos: number;
    loading: boolean;
}

const SalaryDateStatus: React.FC<SalaryDateStatusProps> = ({
    selectedDate,
    startDate,
    endDate,
    totalStaff,
    totalSalary,
    totalVideos,
    loading
}) => {
    // Xác định xem có phải single date hay date range
    const isSingleDate = startDate === endDate;
    
    // Format date range để hiển thị
    const getDateDisplay = () => {
        if (isSingleDate) {
            return createDateLabel(startDate);
        } else {
            return `${formatDateForDisplay(startDate)} → ${formatDateForDisplay(endDate)}`;
        }
    };
    
    // Tính số ngày trong range
    const getDaysCount = () => {
        if (isSingleDate) return 1;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };
    
    // Xác định theme color dựa trên isSingleDate và isToday
    const isShowingToday = isSingleDate && isToday(startDate);
    const themeColor = isShowingToday ? { bg: '#f0f9ff', border: '#0ea5e9', text: '#0369a1', subText: '#0284c7' } 
                                      : { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', subText: '#a16207' };

    return (
        <div style={{
            background: themeColor.bg,
            border: `1px solid ${themeColor.border}`,
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span style={{
                    fontSize: '16px'
                }}>
                    {isSingleDate ? (isShowingToday ? '📅' : '📆') : '📊'}
                </span>
                <div>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: themeColor.text
                    }}>
                        Thống kê lương nhân viên - {getDateDisplay()}
                        {!isSingleDate && ` (${getDaysCount()} ngày)`}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: themeColor.subText,
                        marginTop: '2px'
                    }}>
                        {loading ? (
                            <span>⏳ Đang tải dữ liệu...</span>
                        ) : (
                            <span>
                                {totalStaff} nhân viên • {totalVideos} video • Tổng: {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(totalSalary)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            {isShowingToday && (
                <div style={{
                    background: '#10b981',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '4px 8px',
                    borderRadius: '12px'
                }}>
                    Hôm nay
                </div>
            )}
        </div>
    );
};

export default SalaryDateStatus;