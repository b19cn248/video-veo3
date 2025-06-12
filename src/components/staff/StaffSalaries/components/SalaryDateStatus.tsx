// Component hiển thị trạng thái ngày được chọn cho thống kê lương
// Hiển thị thông tin về ngày đang xem và số liệu tổng quan
// NEW: Component riêng để tái sử dụng và maintain dễ dàng

import React from 'react';
import { createDateLabel, isToday } from '../../../../utils/dateUtils';

interface SalaryDateStatusProps {
    selectedDate: string;
    totalStaff: number;
    totalSalary: number;
    totalVideos: number;
    loading: boolean;
}

const SalaryDateStatus: React.FC<SalaryDateStatusProps> = ({
    selectedDate,
    totalStaff,
    totalSalary,
    totalVideos,
    loading
}) => {
    return (
        <div style={{
            background: isToday(selectedDate) ? '#f0f9ff' : '#fef3c7',
            border: `1px solid ${isToday(selectedDate) ? '#0ea5e9' : '#f59e0b'}`,
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
                    {isToday(selectedDate) ? '📅' : '📆'}
                </span>
                <div>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: isToday(selectedDate) ? '#0369a1' : '#92400e'
                    }}>
                        Thống kê lương nhân viên - {createDateLabel(selectedDate)}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: isToday(selectedDate) ? '#0284c7' : '#a16207',
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
            
            {isToday(selectedDate) && (
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