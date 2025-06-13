// Component hiển thị thông tin tổng quan ngày tính lương sales
// Hiển thị thông tin ngày được chọn và các thống kê tổng quan
// Tương tự SalaryDateStatus cho Staff nhưng với data structure khác

import React from 'react';
import { formatCurrency, formatDate } from '../../../../utils/formatters';

interface SalesDateStatusProps {
    selectedDate: string;
    totalSales: number;
    totalCommission: number;
    totalVideos: number;
    loading: boolean;
}

/**
 * Component hiển thị thông tin tổng quan về ngày tính lương sales
 * @param selectedDate - Ngày được chọn (yyyy-MM-dd)
 * @param totalSales - Tổng số sales persons
 * @param totalCommission - Tổng hoa hồng
 * @param totalVideos - Tổng số video đã thanh toán
 * @param loading - Trạng thái loading
 */
const SalesDateStatus: React.FC<SalesDateStatusProps> = ({
    selectedDate,
    totalSales,
    totalCommission,
    totalVideos,
    loading
}) => {
    // Format ngày để hiển thị
    const formattedDate = formatDate(selectedDate);
    
    // Xác định trạng thái ngày (hôm nay, hôm qua, v.v.)
    const getDateStatus = () => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        if (selectedDate === today) return '📅 Hôm nay';
        if (selectedDate === yesterday) return '📆 Hôm qua';
        return '📋 Ngày đã chọn';
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
                        fontSize: '24px',
                        fontWeight: '700',
                        marginBottom: '4px'
                    }}>
                        {formattedDate}
                    </div>
                    <div style={{
                        fontSize: '13px',
                        opacity: 0.8
                    }}>
                        📊 Báo cáo lương sales (Hoa hồng 12%)
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