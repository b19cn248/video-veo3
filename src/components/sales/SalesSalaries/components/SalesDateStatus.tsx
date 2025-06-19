// Component hiển thị thông tin tổng quan về khoảng thời gian tính lương sales
// UPDATED: Hỗ trợ hiển thị date range thay vì single date
// Tương tự SalaryDateStatus cho Staff nhưng với data structure khác

import React from 'react';
import { formatCurrency, formatDate } from '../../../../utils/formatters';

interface SalesDateStatusProps {
    selectedDate?: string; // Backward compatibility
    startDate: string;
    endDate: string;
    totalSales: number;
    totalCommission: number;
    totalVideos: number;
    loading: boolean;
}

/**
 * Component hiển thị thông tin tổng quan về khoảng thời gian tính lương sales
 * @param startDate - Ngày bắt đầu (yyyy-MM-dd)
 * @param endDate - Ngày kết thúc (yyyy-MM-dd)
 * @param selectedDate - Backward compatibility
 * @param totalSales - Tổng số sales persons
 * @param totalCommission - Tổng hoa hồng
 * @param totalVideos - Tổng số video đã thanh toán
 * @param loading - Trạng thái loading
 */
const SalesDateStatus: React.FC<SalesDateStatusProps> = ({
    selectedDate,
    startDate,
    endDate,
    totalSales,
    totalCommission,
    totalVideos,
    loading
}) => {
    // Xác định xem có phải single date hay date range
    const isSingleDate = startDate === endDate;
    
    // Format date range để hiển thị
    const getDateDisplay = () => {
        if (isSingleDate) {
            return formatDate(startDate);
        } else {
            return `${formatDate(startDate)} → ${formatDate(endDate)}`;
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
    
    // Xác định trạng thái date range
    const getDateStatus = () => {
        if (isSingleDate) {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            if (startDate === today) return '📅 Hôm nay';
            if (startDate === yesterday) return '📆 Hôm qua';
            return '📋 Ngày đã chọn';
        } else {
            const daysCount = getDaysCount();
            return `📊 Khoảng thời gian (${daysCount} ngày)`;
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                {/* Date Info */}
                <div>
                    <div style={{
                        fontSize: '14px',
                        opacity: 0.9,
                        marginBottom: '8px',
                        fontWeight: '500'
                    }}>
                        {getDateStatus()}
                    </div>
                    <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '4px',
                        lineHeight: 1.2
                    }}>
                        {getDateDisplay()}
                    </div>
                    <div style={{
                        fontSize: '13px',
                        opacity: 0.8
                    }}>
                        📊 Báo cáo lương sales (Hoa hồng 12%)
                        {!isSingleDate && ` • ${getDaysCount()} ngày`}
                    </div>
                </div>

                {/* Quick Stats */}
                {!loading && (
                    <div style={{
                        display: 'flex',
                        gap: '32px',
                        alignItems: 'center'
                    }}>
                        {/* Total Sales */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                lineHeight: 1
                            }}>
                                {totalSales}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                opacity: 0.9,
                                marginTop: '4px'
                            }}>
                                👥 Sales
                            </div>
                        </div>

                        {/* Total Videos */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                lineHeight: 1
                            }}>
                                {totalVideos}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                opacity: 0.9,
                                marginTop: '4px'
                            }}>
                                🎥 Videos
                            </div>
                        </div>

                        {/* Total Commission */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                lineHeight: 1
                            }}>
                                {formatCurrency(totalCommission)}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                opacity: 0.9,
                                marginTop: '4px'
                            }}>
                                💰 Hoa hồng
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Loading indicator */}
            {loading && (
                <div style={{
                    marginTop: '16px',
                    fontSize: '14px',
                    opacity: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    Đang tải dữ liệu lương...
                </div>
            )}
        </div>
    );
};

export default SalesDateStatus;