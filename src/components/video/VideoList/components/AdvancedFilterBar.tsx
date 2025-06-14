// Component bộ lọc nâng cao cho VideoList
// UPDATED: Xóa refresh button và align layout cho đồng đều
// Includes: 4 filter controls aligned, active filters display, reset functionality

import React from 'react';
import { FilterState, FilterOptions, VideoStatus, DeliveryStatus, PaymentStatus } from '../../../../types/video.types';
import { formatVideoStatus, formatDeliveryStatus, formatPaymentStatus } from '../../../../utils/formatters';
import {
    createButtonStyle,
    createButtonHoverHandlers,
    createFilterInputStyle,
    createInputFocusHandlers,
    createFilterBadgeStyle,
    filterBadgeColors,
    formatFilterDisplayText
} from '../utils/videoListHelpers';

interface AdvancedFilterBarProps {
    filters: FilterState;
    filterOptions: FilterOptions;
    activeFiltersCount: number;
    loadingStaffList: boolean;
    loadingCreatorsList: boolean; // NEW: Loading state cho creators
    isAdmin: boolean;
    onFilterChange: (filterType: keyof FilterState, value: string) => void;
    onResetAllFilters: () => void;
    onRefreshStaffList: () => void;
    onCreateNew: () => void;
}

const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({
                                                                 filters,
                                                                 filterOptions,
                                                                 activeFiltersCount,
                                                                 loadingStaffList,
                                                                 loadingCreatorsList,
                                                                 isAdmin,
                                                                 onFilterChange,
                                                                 onResetAllFilters,
                                                                 onRefreshStaffList,
                                                                 onCreateNew
                                                             }) => {
    return (
        <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginBottom: '20px',
            border: '1px solid #e5e7eb'
        }}>
            {/* Filter Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937'
                    }}>
                        🔍 Bộ lọc nâng cao
                    </h3>
                    {activeFiltersCount > 0 && (
                        <span style={{
                            background: '#3b82f6',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            minWidth: '20px',
                            textAlign: 'center'
                        }}>
                            {activeFiltersCount}
                        </span>
                    )}
                </div>

                {/* Reset All Filters Button */}
                {activeFiltersCount > 0 && (
                    <button
                        onClick={onResetAllFilters}
                        style={createButtonStyle('danger')}
                        {...createButtonHoverHandlers('danger')}
                    >
                        🗑️ Xóa tất cả filter
                    </button>
                )}
            </div>

            {/* Filter Controls Grid - UPDATED: Thêm Customer Name Search, Payment Date và Created By cho admin */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isAdmin 
                    ? 'repeat(auto-fit, minmax(180px, 1fr))' // Admin: 7 columns (thêm customer search, payment date và created by)
                    : 'repeat(auto-fit, minmax(200px, 1fr))', // User: 4 columns như cũ
                gap: '16px',
                alignItems: 'end'
            }}>
                {/* NEW: Customer Name Search - chỉ cho admin */}
                {isAdmin && (
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>
                            🔍 Tìm theo tên khách hàng
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={filters.customerName}
                                onChange={(e) => onFilterChange('customerName', e.target.value)}
                                placeholder="Nhập tên khách hàng..."
                                style={{
                                    ...createFilterInputStyle(),
                                    paddingRight: filters.customerName ? '36px' : '12px'
                                }}
                                {...createInputFocusHandlers()}
                            />
                            {/* Clear button khi có text */}
                            {filters.customerName && (
                                <button
                                    onClick={() => onFilterChange('customerName', '')}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        color: '#6b7280',
                                        padding: '2px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    title="Xóa tìm kiếm"
                                >
                                    ✖️
                                </button>
                            )}
                        </div>
                    </div>
                )}
                {/* Video Status Filter */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '6px'
                    }}>
                        🔄 Trạng thái Video
                    </label>
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                        style={createFilterInputStyle()}
                        {...createInputFocusHandlers()}
                    >
                        <option value="">Tất cả trạng thái</option>
                        {Object.values(VideoStatus).map(status => (
                            <option key={status} value={status}>
                                {formatVideoStatus(status)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* UPDATED: Assigned Staff Filter - Simplified, no refresh button */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '6px'
                    }}>
                        👤 Nhân viên phụ trách
                        {loadingStaffList && (
                            <span style={{
                                marginLeft: '8px',
                                fontSize: '11px',
                                color: '#6b7280'
                            }}>
                                ⏳ Đang tải...
                            </span>
                        )}
                    </label>
                    <select
                        value={filters.assignedStaff}
                        onChange={(e) => onFilterChange('assignedStaff', e.target.value)}
                        disabled={loadingStaffList}
                        style={createFilterInputStyle(loadingStaffList)}
                        {...createInputFocusHandlers(loadingStaffList)}
                    >
                        <option value="">Tất cả nhân viên</option>
                        {filterOptions.assignedStaffList.map(staff => (
                            <option key={staff} value={staff}>
                                {staff || 'Chưa có nhân viên'}
                            </option>
                        ))}
                    </select>
                    {/* REMOVED: Refresh Staff List Button để alignment đồng đều */}
                </div>

                {/* NEW: Created By Filter - chỉ cho admin */}
                {isAdmin && (
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>
                            👨‍💼 Người tạo
                            {loadingCreatorsList && (
                                <span style={{
                                    marginLeft: '8px',
                                    fontSize: '11px',
                                    color: '#6b7280'
                                }}>
                                    ⏳ Đang tải...
                                </span>
                            )}
                        </label>
                        <select
                            value={filters.createdBy}
                            onChange={(e) => onFilterChange('createdBy', e.target.value)}
                            disabled={loadingCreatorsList}
                            style={createFilterInputStyle(loadingCreatorsList)}
                            {...createInputFocusHandlers(loadingCreatorsList)}
                        >
                            <option value="">Tất cả người tạo</option>
                            {filterOptions.creatorsList.map(creator => (
                                <option key={creator} value={creator}>
                                    {creator || 'Không rõ'}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Delivery Status Filter */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '6px'
                    }}>
                        🚚 Trạng thái giao hàng
                    </label>
                    <select
                        value={filters.deliveryStatus}
                        onChange={(e) => onFilterChange('deliveryStatus', e.target.value)}
                        style={createFilterInputStyle()}
                        {...createInputFocusHandlers()}
                    >
                        <option value="">Tất cả trạng thái</option>
                        {Object.values(DeliveryStatus).map(status => (
                            <option key={status} value={status}>
                                {formatDeliveryStatus(status)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Payment Status Filter */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '6px'
                    }}>
                        💰 Trạng thái thanh toán
                    </label>
                    <select
                        value={filters.paymentStatus}
                        onChange={(e) => onFilterChange('paymentStatus', e.target.value)}
                        style={createFilterInputStyle()}
                        {...createInputFocusHandlers()}
                    >
                        <option value="">Tất cả trạng thái</option>
                        {Object.values(PaymentStatus).map(status => (
                            <option key={status} value={status}>
                                {formatPaymentStatus(status)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* NEW: Payment Date Filter - chỉ cho admin */}
                {isAdmin && (
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>
                            📅 Ngày thanh toán
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="date"
                                value={filters.paymentDate}
                                onChange={(e) => onFilterChange('paymentDate', e.target.value)}
                                style={{
                                    ...createFilterInputStyle(),
                                    paddingRight: filters.paymentDate ? '36px' : '12px'
                                }}
                                {...createInputFocusHandlers()}
                            />
                            {/* Clear button khi có date */}
                            {filters.paymentDate && (
                                <button
                                    onClick={() => onFilterChange('paymentDate', '')}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        color: '#6b7280',
                                        padding: '2px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    title="Xóa ngày thanh toán"
                                >
                                    ✖️
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Create Button - chỉ hiển thị cho admin */}
                {isAdmin && (
                    <div>
                        <button
                            onClick={onCreateNew}
                            style={{
                                ...createButtonStyle('success'),
                                width: '100%',
                                padding: '10px 16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#059669';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#10b981';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            ➕ Tạo video mới
                        </button>
                    </div>
                )}
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '6px'
                }}>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#0369a1',
                        marginBottom: '8px'
                    }}>
                        📊 Đang áp dụng {activeFiltersCount} bộ lọc:
                    </div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px'
                    }}>
                        {/* NEW: Customer Name Search Badge - chỉ cho admin */}
                        {isAdmin && filters.customerName && (
                            <span style={createFilterBadgeStyle(filterBadgeColors.customerName)}>
                                {formatFilterDisplayText('customerName', filters.customerName)}
                            </span>
                        )}
                        {filters.status && (
                            <span style={createFilterBadgeStyle(filterBadgeColors.status)}>
                                {formatFilterDisplayText('status', formatVideoStatus(filters.status as VideoStatus))}
                            </span>
                        )}
                        {filters.assignedStaff && (
                            <span style={createFilterBadgeStyle(filterBadgeColors.assignedStaff)}>
                                {formatFilterDisplayText('assignedStaff', filters.assignedStaff)}
                            </span>
                        )}
                        {filters.deliveryStatus && (
                            <span style={createFilterBadgeStyle(filterBadgeColors.deliveryStatus)}>
                                {formatFilterDisplayText('deliveryStatus', formatDeliveryStatus(filters.deliveryStatus as DeliveryStatus))}
                            </span>
                        )}
                        {filters.paymentStatus && (
                            <span style={createFilterBadgeStyle(filterBadgeColors.paymentStatus)}>
                                {formatFilterDisplayText('paymentStatus', formatPaymentStatus(filters.paymentStatus as PaymentStatus))}
                            </span>
                        )}
                        {isAdmin && filters.paymentDate && (
                            <span style={createFilterBadgeStyle(filterBadgeColors.paymentDate || filterBadgeColors.status)}>
                                {formatFilterDisplayText('paymentDate', filters.paymentDate)}
                            </span>
                        )}
                        {isAdmin && filters.createdBy && (
                            <span style={createFilterBadgeStyle(filterBadgeColors.createdBy || filterBadgeColors.assignedStaff)}>
                                {formatFilterDisplayText('createdBy', filters.createdBy)}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedFilterBar;