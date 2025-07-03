// Component hiển thị card tổng doanh thu từ các đơn
// Thiết kế tương tự các card khác trong SalesSalaries

import React from 'react';
import { formatCurrency } from '../../../../utils/formatters';
import { RevenueStatistics } from '../../../../types/sales.types';

interface RevenueCardProps {
    revenueStats: RevenueStatistics | null;
    loading: boolean;
    error: string | null;
}

const RevenueCard: React.FC<RevenueCardProps> = ({ 
    revenueStats, 
    loading, 
    error 
}) => {
    // Hiển thị loading state
    if (loading) {
        return (
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#9ca3af',
                    marginBottom: '8px'
                }}>
                    ⏳
                </div>
                <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '500'
                }}>
                    💰 Đang tải doanh thu...
                </div>
            </div>
        );
    }

    // Hiển thị error state
    if (error) {
        return (
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid #fecaca',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#ef4444',
                    marginBottom: '8px'
                }}>
                    ❌
                </div>
                <div style={{
                    fontSize: '14px',
                    color: '#ef4444',
                    fontWeight: '500'
                }}>
                    💰 Lỗi tải doanh thu
                </div>
                <div style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginTop: '4px'
                }}>
                    {error}
                </div>
            </div>
        );
    }

    // Hiển thị data state
    return (
        <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
        }}>
            <div style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#06b6d4', // Cyan color để khác với các card khác
                marginBottom: '8px'
            }}>
                {revenueStats ? formatCurrency(revenueStats.totalRevenue) : '--'}
            </div>
            <div style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500'
            }}>
                💰 Tổng số tiền từ các đơn
            </div>
            {revenueStats && (
                <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    marginTop: '4px'
                }}>
                    {revenueStats.totalVideos} video • {formatCurrency(revenueStats.averageRevenuePerVideo)}/video
                </div>
            )}
        </div>
    );
};

export default RevenueCard;