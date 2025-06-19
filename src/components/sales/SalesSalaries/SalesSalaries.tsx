// Component hiển thị bảng lương sales - ADMIN ONLY
// Tương tự StaffSalaries nhưng với data structure khác và quyền hạn admin
// UI/UX: Dashboard-style với date selector, cards thống kê và bảng responsive

import React from 'react';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { useSalesSalariesWithDate } from './hooks/useSalesSalariesWithDate';
import DateSelector from './components/DateSelector';
import SalesDateStatus from './components/SalesDateStatus';
import Loading from '../../common/Loading/Loading';
import ErrorDisplay from '../../common/ErrorDisplay/ErrorDisplay';
import { extractErrorMessage } from '../../../utils/errorUtils';
import { useIsVideoVeo3BeAdmin } from '../../../contexts/AuthContext';

const SalesSalaries: React.FC = () => {
    // Kiểm tra quyền admin trong video-veo3-be
    const isVideoVeo3BeAdmin = useIsVideoVeo3BeAdmin();
    
    // Sử dụng custom hook để quản lý logic với date filtering
    // PHẢI gọi hook trước khi return conditional
    const {
        salesSalaries,
        filteredSalaries,
        loading,
        error,
        summary,
        filter,
        loadSalesSalaries,
        handleSearchChange,
        handleSortChange,
        handleDateChange,
        getSortIcon
    } = useSalesSalariesWithDate();

    // Hàm format sales name (xử lý trường hợp empty hoặc Unknown)
    const formatSalesName = (name: string): string => {
        if (!name || name.trim() === '' || name === 'Unknown Sales') {
            return 'Chưa xác định';
        }
        return name;
    };

    // Nếu không có quyền admin, hiển thị thông báo lỗi
    if (!isVideoVeo3BeAdmin) {
        return (
            <div style={{ 
                padding: '20px', 
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    textAlign: 'center',
                    maxWidth: '500px'
                }}>
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '20px'
                    }}>🔒</div>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '12px'
                    }}>
                        Truy cập bị từ chối
                    </h2>
                    <p style={{
                        fontSize: '16px',
                        color: '#6b7280',
                        marginBottom: '8px'
                    }}>
                        Bạn không có quyền truy cập trang này.
                    </p>
                    <p style={{
                        fontSize: '14px',
                        color: '#9ca3af'
                    }}>
                        Chỉ người dùng có role admin trong video-veo3-be mới có thể xem bảng lương sales.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                marginBottom: '30px',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '8px'
                }}>
                    💼 Bảng lương Sales
                </h1>
                <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                }}>
                    Tổng quan về lương và hoa hồng của sales theo từng ngày (12% commission)
                </p>
                <div style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    marginTop: '4px',
                    fontWeight: '500'
                }}>
                    🔒 Chỉ dành cho Admin
                </div>
            </div>

            {/* Date Status - hiển thị thông tin ngày được chọn */}
            {!loading && !error && summary && filter.selectedDate && (
                <SalesDateStatus
                    selectedDate={filter.selectedDate}
                    totalSales={summary.totalSalesPersons}
                    totalCommission={summary.totalCommission}
                    totalVideos={summary.totalPaidVideos}
                    loading={loading}
                />
            )}

            {/* Loading */}
            {loading && <Loading message="Đang tải thông tin lương sales..." />}

            {/* Error - sử dụng ErrorDisplay component */}
            {error && (
                <ErrorDisplay 
                    message={error}
                    type="error"
                    style={{ marginBottom: '20px' }}
                />
            )}

            {/* Summary Cards */}
            {!loading && !error && summary && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    {/* Total Sales Persons */}
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
                            color: '#3b82f6',
                            marginBottom: '8px'
                        }}>
                            {summary.totalSalesPersons}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500'
                        }}>
                            👥 Tổng Sales
                        </div>
                    </div>

                    {/* Total Videos */}
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
                            color: '#10b981',
                            marginBottom: '8px'
                        }}>
                            {summary.totalPaidVideos}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500'
                        }}>
                            🎥 Video đã thanh toán
                        </div>
                    </div>

                    {/* Total Sales Value */}
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
                            color: '#f59e0b',
                            marginBottom: '8px'
                        }}>
                            {formatCurrency(summary.totalSalesValue)}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500'
                        }}>
                            💵 Tổng doanh số
                        </div>
                    </div>

                    {/* Total Commission */}
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
                            color: '#ef4444',
                            marginBottom: '8px'
                        }}>
                            {formatCurrency(summary.totalCommission)}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500'
                        }}>
                            💰 Tổng hoa hồng
                        </div>
                    </div>

                    {/* Average Commission */}
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
                            color: '#8b5cf6',
                            marginBottom: '8px'
                        }}>
                            {formatCurrency(summary.averageCommission)}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500'
                        }}>
                            📊 Hoa hồng TB
                        </div>
                    </div>
                </div>
            )}            {/* Search and Controls với Date Selector */}
            {!loading && !error && (
                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    marginBottom: '20px',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        {/* Date Selector */}
                        <DateSelector
                            selectedDate={filter.selectedDate || ''}
                            onDateChange={handleDateChange}
                            loading={loading}
                        />

                        {/* Search */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <input
                                type="text"
                                placeholder="🔍 Tìm kiếm theo tên sales..."
                                value={filter.searchTerm || ''}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={() => loadSalesSalaries(filter.selectedDate)}
                            style={{
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#2563eb';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#3b82f6';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            🔄 Làm mới
                        </button>
                    </div>
                </div>
            )}
            {/* Sales Salaries Table */}
            {!loading && !error && (
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                    {/* Table Header */}
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid #e5e7eb',
                        background: '#f9fafb'
                    }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1f2937',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            📊 Chi tiết lương sales
                            <span style={{
                                background: '#3b82f6',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: '500',
                                padding: '2px 8px',
                                borderRadius: '10px'
                            }}>
                                {filteredSalaries.length}
                            </span>
                        </h3>
                    </div>

                    {/* Table Content */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: '700px'
                        }}>
                            <thead>
                            <tr style={{ background: '#f9fafb' }}>
                                <th
                                    style={{
                                        padding: '14px 16px',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        fontSize: '13px',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #e5e7eb',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onClick={() => handleSortChange('salesName')}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                >
                                    👤 Tên Sales {getSortIcon('salesName')}
                                </th>
                                <th
                                    style={{
                                        padding: '14px 16px',
                                        textAlign: 'right',
                                        fontWeight: '600',
                                        fontSize: '13px',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #e5e7eb',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onClick={() => handleSortChange('totalPaidVideos')}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                >
                                    🎥 Video đã TT {getSortIcon('totalPaidVideos')}
                                </th>
                                <th
                                    style={{
                                        padding: '14px 16px',
                                        textAlign: 'right',
                                        fontWeight: '600',
                                        fontSize: '13px',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #e5e7eb',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onClick={() => handleSortChange('totalSalesValue')}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                >
                                    💵 Tổng doanh số {getSortIcon('totalSalesValue')}
                                </th>
                                <th
                                    style={{
                                        padding: '14px 16px',
                                        textAlign: 'right',
                                        fontWeight: '600',
                                        fontSize: '13px',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #e5e7eb',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onClick={() => handleSortChange('commissionSalary')}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                >
                                    💰 Hoa hồng (12%) {getSortIcon('commissionSalary')}
                                </th>
                                <th style={{
                                    padding: '14px 16px',
                                    textAlign: 'right',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    color: '#374151',
                                    borderBottom: '1px solid #e5e7eb'
                                }}>
                                    📊 Hoa hồng/Video
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredSalaries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{
                                        textAlign: 'center',
                                        padding: '60px 20px',
                                        color: '#6b7280',
                                        fontSize: '14px'
                                    }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                                            {filter.searchTerm ? '🔍' : '👥'}
                                        </div>
                                        {filter.searchTerm ? (
                                            <div>
                                                <div style={{ marginBottom: '8px' }}>
                                                    Không tìm thấy sales nào với từ khóa "{filter.searchTerm}"
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                                    Thử thay đổi từ khóa tìm kiếm
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                Chưa có dữ liệu lương sales cho ngày này
                                                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                                                    Dữ liệu sẽ được cập nhật khi có video được thanh toán
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredSalaries.map((sales, index) => {
                                    const averageCommissionPerVideo = sales.totalPaidVideos > 0
                                        ? sales.commissionSalary / sales.totalPaidVideos
                                        : 0;

                                    return (
                                        <tr
                                            key={index}
                                            style={{
                                                borderBottom: '1px solid #f3f4f6',
                                                transition: 'background-color 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                        >
                                            {/* Sales Name */}
                                            <td style={{
                                                padding: '16px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: sales.salesName === 'Unknown Sales' ? '#9ca3af' : '#1f2937'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: sales.salesName === 'Unknown Sales'
                                                            ? '#e5e7eb'
                                                            : '#10b981',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: '12px'
                                                    }}>
                                                        {sales.salesName === 'Unknown Sales'
                                                            ? '?'
                                                            : sales.salesName.charAt(0).toUpperCase()
                                                        }
                                                    </div>
                                                    <span>{formatSalesName(sales.salesName)}</span>
                                                </div>
                                            </td>

                                            {/* Total Videos */}
                                            <td style={{
                                                padding: '16px',
                                                textAlign: 'right',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: '#1f2937'
                                            }}>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    background: sales.totalPaidVideos > 0 ? '#d1fae5' : '#f3f4f6',
                                                    color: sales.totalPaidVideos > 0 ? '#065f46' : '#6b7280',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}>
                                                    {sales.totalPaidVideos}
                                                </div>
                                            </td>

                                            {/* Total Sales Value */}
                                            <td style={{
                                                padding: '16px',
                                                textAlign: 'right',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: sales.totalSalesValue > 0 ? '#d97706' : '#6b7280'
                                            }}>
                                                {formatCurrency(sales.totalSalesValue)}
                                            </td>

                                            {/* Commission Salary */}
                                            <td style={{
                                                padding: '16px',
                                                textAlign: 'right',
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: sales.commissionSalary > 0 ? '#dc2626' : '#6b7280'
                                            }}>
                                                {formatCurrency(sales.commissionSalary)}
                                            </td>

                                            {/* Average Commission per Video */}
                                            <td style={{
                                                padding: '16px',
                                                textAlign: 'right',
                                                fontSize: '13px',
                                                color: '#6b7280'
                                            }}>
                                                {sales.totalPaidVideos > 0
                                                    ? formatCurrency(averageCommissionPerVideo)
                                                    : '--'
                                                }
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer with Summary */}
                    {filteredSalaries.length > 0 && (
                        <div style={{
                            padding: '16px 20px',
                            borderTop: '1px solid #e5e7eb',
                            background: '#f9fafb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '13px',
                            color: '#6b7280'
                        }}>
                            <span>
                                Hiển thị {filteredSalaries.length} sales
                                {filter.searchTerm && ` (lọc từ ${salesSalaries.length} sales)`}
                            </span>
                            <span>
                                Cập nhật lúc: {formatDate(new Date().toISOString())}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SalesSalaries;