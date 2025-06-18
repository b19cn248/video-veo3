// Active Limits Table Component
// Hiển thị danh sách giới hạn nhân viên đang active

import React from 'react';
import { StaffLimit } from '../../../types/staffLimit.types';
import { StaffLimitService } from '../../../services/staffLimitService';
import {
    createButtonStyle,
    createButtonHoverHandlers,
    tableStyles,
    createRowHoverEffect,
    showToast
} from '../../video/VideoList/utils/videoListHelpers';
import { formatDate } from '../../../utils/dateUtils';

interface ActiveLimitsTableProps {
    limits: StaffLimit[];
    loading: boolean;
    isAdmin: boolean;
    onRemoveLimit: (staffName: string) => Promise<void>;
    onRefresh: () => void;
}

const ActiveLimitsTable: React.FC<ActiveLimitsTableProps> = ({
    limits,
    loading,
    isAdmin,
    onRemoveLimit,
    onRefresh
}) => {

    const formatRemainingDays = (remainingDays: number) => {
        return StaffLimitService.formatRemainingDays(remainingDays);
    };

    const handleRemoveConfirm = async (staffName: string) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn hủy giới hạn cho nhân viên "${staffName}"?\n\nNhân viên sẽ có thể nhận đơn hàng mới ngay lập tức.`
        );
        
        if (confirmed) {
            try {
                await onRemoveLimit(staffName);
                showToast(`Đã hủy giới hạn cho nhân viên ${staffName}`, 'success');
            } catch (error) {
                console.error('Error removing limit:', error);
                showToast('Có lỗi xảy ra khi hủy giới hạn', 'error');
            }
        }
    };

    // Empty state
    if (!loading && limits.length === 0) {
        return (
            <div style={{
                background: 'white',
                padding: '48px 24px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937'
                }}>
                    Không có giới hạn nào đang hoạt động
                </h3>
                <p style={{
                    margin: '0 0 20px 0',
                    fontSize: '14px',
                    color: '#6b7280'
                }}>
                    Tất cả nhân viên hiện tại đều có thể nhận đơn hàng mới
                </p>
                <button
                    onClick={onRefresh}
                    style={createButtonStyle('primary')}
                    {...createButtonHoverHandlers('primary')}
                >
                    🔄 Làm mới
                </button>
            </div>
        );
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
        }}>
            {/* Table Header */}
            <div style={{
                padding: '20px 24px 16px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937'
                    }}>
                        🚫 Danh sách giới hạn đang hoạt động
                    </h3>
                    {limits.length > 0 && (
                        <span style={{
                            background: '#dc2626',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '4px 8px',
                            borderRadius: '12px'
                        }}>
                            {limits.length}
                        </span>
                    )}
                </div>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    style={{
                        ...createButtonStyle('secondary'),
                        opacity: loading ? 0.6 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    {...(!loading && createButtonHoverHandlers('secondary'))}
                >
                    {loading ? '⏳ Đang tải...' : '🔄 Làm mới'}
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{
                    padding: '48px 24px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>
                        Đang tải danh sách giới hạn...
                    </div>
                </div>
            )}

            {/* Table */}
            {!loading && limits.length > 0 && (
                <div style={{ overflow: 'auto' }}>
                    <table style={tableStyles.table}>
                        <thead>
                            <tr style={tableStyles.headerRow}>
                                <th style={{
                                    ...tableStyles.headerCell,
                                    width: '180px'
                                }}>
                                    👤 Nhân viên
                                </th>
                                <th style={{
                                    ...tableStyles.headerCell,
                                    width: '140px'
                                }}>
                                    📅 Ngày bắt đầu
                                </th>
                                <th style={{
                                    ...tableStyles.headerCell,
                                    width: '140px'
                                }}>
                                    📅 Ngày kết thúc
                                </th>
                                <th style={{
                                    ...tableStyles.headerCell,
                                    width: '120px'
                                }}>
                                    ⏰ Còn lại
                                </th>
                                <th style={{
                                    ...tableStyles.headerCell,
                                    width: '120px'
                                }}>
                                    📊 Đơn/Ngày
                                </th>
                                <th style={{
                                    ...tableStyles.headerCell,
                                    width: '140px'
                                }}>
                                    👨‍💼 Tạo bởi
                                </th>
                                {isAdmin && (
                                    <th style={{
                                        ...tableStyles.headerCell,
                                        width: '120px'
                                    }}>
                                        ⚡ Hành động
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {limits.map((limit) => {
                                const remainingInfo = formatRemainingDays(limit.remainingDays);
                                
                                return (
                                    <tr
                                        key={limit.id}
                                        style={tableStyles.bodyRow}
                                        {...createRowHoverEffect()}
                                    >
                                        {/* Staff Name */}
                                        <td style={tableStyles.bodyCell}>
                                            <div style={{
                                                fontWeight: '500',
                                                color: '#1f2937'
                                            }}>
                                                {limit.staffName}
                                            </div>
                                        </td>

                                        {/* Start Date */}
                                        <td style={tableStyles.bodyCell}>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6b7280'
                                            }}>
                                                {formatDate(limit.startDate, 'DD/MM/YYYY HH:mm')}
                                            </div>
                                        </td>

                                        {/* End Date */}
                                        <td style={tableStyles.bodyCell}>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6b7280'
                                            }}>
                                                {formatDate(limit.endDate, 'DD/MM/YYYY HH:mm')}
                                            </div>
                                        </td>

                                        {/* Remaining Days */}
                                        <td style={tableStyles.bodyCell}>
                                            <span style={{
                                                background: remainingInfo.color,
                                                color: 'white',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                textTransform: 'uppercase',
                                                ...(remainingInfo.urgent && {
                                                    animation: 'pulse 2s infinite'
                                                })
                                            }}>
                                                {remainingInfo.text}
                                            </span>
                                        </td>

                                        {/* Max Orders Per Day */}
                                        <td style={tableStyles.bodyCell}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <span style={{
                                                    background: '#3b82f6',
                                                    color: 'white',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    minWidth: '40px',
                                                    textAlign: 'center'
                                                }}>
                                                    {limit.maxOrdersPerDay || 3}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Created By */}
                                        <td style={tableStyles.bodyCell}>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6b7280'
                                            }}>
                                                {limit.createdBy}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        {isAdmin && (
                                            <td style={tableStyles.bodyCell}>
                                                <button
                                                    onClick={() => handleRemoveConfirm(limit.staffName)}
                                                    style={{
                                                        ...createButtonStyle('danger'),
                                                        fontSize: '11px',
                                                        padding: '6px 10px'
                                                    }}
                                                    {...createButtonHoverHandlers('danger')}
                                                    title="Hủy giới hạn"
                                                >
                                                    🗑️ Hủy
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Footer Info */}
            {!loading && limits.length > 0 && (
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #e5e7eb',
                    background: '#f8fafc',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px'
                }}>
                    <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>
                            📊 Tổng cộng: <strong>{limits.length}</strong> nhân viên đang bị giới hạn
                        </span>
                        <span>
                            🔄 Cập nhật lần cuối: {formatDate(new Date().toISOString(), 'HH:mm:ss')}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveLimitsTable;