// Component hiển thị bảng lương nhân viên
// UPDATED: Cho phép tất cả user xem lương, không chỉ admin
// Tính năng chính: Hiển thị tổng quan lương, bảng chi tiết với search/sort
// UI/UX: Dashboard-style với cards thống kê và bảng responsive

import React, { useState, useEffect } from 'react';
import { StaffSalary, StaffSalaryFilter, SalarySummary } from '../../../types/staff.types';
import { VideoService } from '../../../services/videoService';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import Loading from '../../common/Loading/Loading';

const StaffSalaries: React.FC = () => {
    // State management
    const [staffSalaries, setStaffSalaries] = useState<StaffSalary[]>([]);
    const [filteredSalaries, setFilteredSalaries] = useState<StaffSalary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<SalarySummary | null>(null);

    // Filter states
    const [filter, setFilter] = useState<StaffSalaryFilter>({
        sortBy: 'totalSalary',
        sortDirection: 'desc',
        searchTerm: ''
    });

    // REMOVED: isAdmin check - tất cả user đều có thể xem

    // useEffect để load data khi component mount
    useEffect(() => {
        loadStaffSalaries();
    }, []);

    // useEffect để apply filter/sort khi data hoặc filter thay đổi
    useEffect(() => {
        applyFiltersAndSort();
    }, [staffSalaries, filter]);

    // Hàm load dữ liệu lương nhân viên
    const loadStaffSalaries = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await VideoService.getStaffSalaries();

            if (response.success) {
                setStaffSalaries(response.data);

                // Tính toán summary statistics
                const totalStaff = response.totalStaff;
                const totalVideos = response.totalVideos;
                const totalSalary = response.totalSalary;

                const summary: SalarySummary = {
                    totalStaff,
                    totalVideos,
                    totalSalary,
                    averageSalary: totalStaff > 0 ? totalSalary / totalStaff : 0,
                    averageVideosPerStaff: totalStaff > 0 ? totalVideos / totalStaff : 0
                };

                setSummary(summary);
            } else {
                setError('Không thể tải thông tin lương nhân viên');
            }
        } catch (err) {
            setError('Lỗi kết nối đến server');
            console.error('Error loading staff salaries:', err);
        } finally {
            setLoading(false);
        }
    };

    // Hàm apply filter và sort
    const applyFiltersAndSort = () => {
        let filtered = [...staffSalaries];

        // Apply search filter
        if (filter.searchTerm && filter.searchTerm.trim()) {
            const searchTerm = filter.searchTerm.toLowerCase().trim();
            filtered = filtered.filter(staff =>
                staff.staffName.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any = a[filter.sortBy];
            let bValue: any = b[filter.sortBy];

            // Handle string sorting
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (filter.sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredSalaries(filtered);
    };

    // Hàm xử lý thay đổi search
    const handleSearchChange = (searchTerm: string) => {
        setFilter(prev => ({
            ...prev,
            searchTerm
        }));
    };

    // Hàm xử lý thay đổi sort
    const handleSortChange = (sortBy: StaffSalaryFilter['sortBy']) => {
        setFilter(prev => ({
            ...prev,
            sortBy,
            sortDirection: prev.sortBy === sortBy && prev.sortDirection === 'desc' ? 'asc' : 'desc'
        }));
    };

    // Hàm format staff name (xử lý trường hợp empty)
    const formatStaffName = (name: string): string => {
        return name.trim() === '' ? 'Chưa có nhân viên' : name;
    };

    // Hàm get icon cho sort direction
    const getSortIcon = (column: StaffSalaryFilter['sortBy']): string => {
        if (filter.sortBy !== column) return '↕️';
        return filter.sortDirection === 'desc' ? '⬇️' : '⬆️';
    };

    // REMOVED: Admin check - tất cả user đều có thể xem

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
                    💰 Bảng lương nhân viên
                </h1>
                <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                }}>
                    Tổng quan về lương và hiệu suất làm việc của nhân viên
                </p>
            </div>

            {/* Loading */}
            {loading && <Loading message="Đang tải thông tin lương nhân viên..." />}

            {/* Error */}
            {error && (
                <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Summary Cards */}
            {!loading && !error && summary && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    {/* Total Staff */}
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
                            {summary.totalStaff}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500'
                        }}>
                            👥 Tổng nhân viên
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
                            {summary.totalVideos}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500'
                        }}>
                            🎥 Tổng video hoàn thành
                        </div>
                    </div>

                    {/* Total Salary */}
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
                            {formatCurrency(summary.totalSalary)}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500'
                        }}>
                            💵 Tổng tiền lương
                        </div>
                    </div>

                    {/* Average Salary */}
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
                            {formatCurrency(summary.averageSalary)}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500'
                        }}>
                            📊 Lương trung bình
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Controls */}
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
                        {/* Search */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <input
                                type="text"
                                placeholder="🔍 Tìm kiếm theo tên nhân viên..."
                                value={filter.searchTerm}
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
                            onClick={loadStaffSalaries}
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

            {/* Staff Salaries Table */}
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
                            📊 Chi tiết lương nhân viên
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
                            minWidth: '600px'
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
                                    onClick={() => handleSortChange('staffName')}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                >
                                    👤 Tên nhân viên {getSortIcon('staffName')}
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
                                    onClick={() => handleSortChange('totalVideos')}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                >
                                    🎥 Số video {getSortIcon('totalVideos')}
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
                                    onClick={() => handleSortChange('totalSalary')}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                >
                                    💰 Tổng lương {getSortIcon('totalSalary')}
                                </th>
                                <th style={{
                                    padding: '14px 16px',
                                    textAlign: 'right',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    color: '#374151',
                                    borderBottom: '1px solid #e5e7eb'
                                }}>
                                    📊 Lương/Video
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredSalaries.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{
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
                                                    Không tìm thấy nhân viên nào với từ khóa "{filter.searchTerm}"
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                                    Thử thay đổi từ khóa tìm kiếm
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                Chưa có dữ liệu lương nhân viên
                                                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                                                    Dữ liệu sẽ được cập nhật khi có video hoàn thành
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredSalaries.map((staff, index) => {
                                    const averageSalaryPerVideo = staff.totalVideos > 0
                                        ? staff.totalSalary / staff.totalVideos
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
                                            {/* Staff Name */}
                                            <td style={{
                                                padding: '16px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: staff.staffName.trim() === '' ? '#9ca3af' : '#1f2937'
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
                                                        background: staff.staffName.trim() === ''
                                                            ? '#e5e7eb'
                                                            : '#3b82f6',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: '12px'
                                                    }}>
                                                        {staff.staffName.trim() === ''
                                                            ? '?'
                                                            : staff.staffName.charAt(0).toUpperCase()
                                                        }
                                                    </div>
                                                    <span>{formatStaffName(staff.staffName)}</span>
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
                                                    background: staff.totalVideos > 0 ? '#dbeafe' : '#f3f4f6',
                                                    color: staff.totalVideos > 0 ? '#1e40af' : '#6b7280',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}>
                                                    {staff.totalVideos}
                                                </div>
                                            </td>

                                            {/* Total Salary */}
                                            <td style={{
                                                padding: '16px',
                                                textAlign: 'right',
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: staff.totalSalary > 0 ? '#059669' : '#6b7280'
                                            }}>
                                                {formatCurrency(staff.totalSalary)}
                                            </td>

                                            {/* Average Salary per Video */}
                                            <td style={{
                                                padding: '16px',
                                                textAlign: 'right',
                                                fontSize: '13px',
                                                color: '#6b7280'
                                            }}>
                                                {staff.totalVideos > 0
                                                    ? formatCurrency(averageSalaryPerVideo)
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
                                Hiển thị {filteredSalaries.length} nhân viên
                                {filter.searchTerm && ` (lọc từ ${staffSalaries.length} nhân viên)`}
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

export default StaffSalaries;