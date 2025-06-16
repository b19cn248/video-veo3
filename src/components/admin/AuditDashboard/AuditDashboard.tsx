/**
 * AuditDashboard Component - Admin dashboard để quản lý audit logs
 * 
 * Chức năng:
 * - Comprehensive view của tất cả audit logs trong hệ thống
 * - Advanced filtering và search capabilities
 * - Export audit reports với multiple formats
 * - User activity monitoring và analytics
 * - System health checking và performance metrics
 * 
 * Tuân thủ SOLID Principles:
 * - Single Responsibility: Chỉ quản lý audit dashboard
 * - Open/Closed: Có thể extend thêm features mà không sửa code cũ
 * - Interface Segregation: Clear component interfaces
 * - Dependency Inversion: Depend on service abstractions
 * 
 * UI/UX Considerations:
 * - Admin-friendly interface với comprehensive controls
 * - Real-time updates cho audit data
 * - Performance monitoring và analytics
 * - Export capabilities cho compliance reports
 * 
 * @author System
 * @since 1.6.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
    AuditService, 
    AuditLog, 
    AuditAction, 
    EntityType,
    AuditSearchFilters,
    AuditSearchResponse 
} from '../../../services/auditService';
import { AuditLogItem } from '../../audit/AuditLogItem';
import Loading from '../../common/Loading/Loading';
import { ErrorDisplay } from '../../common/ErrorDisplay';
import Pagination from '../../common/Pagination/Pagination';
// Temporarily using native Date methods instead of date-fns

// ============= COMPONENT PROPS =============

interface AuditDashboardProps {
    /**
     * Custom CSS classes
     */
    className?: string;
    
    /**
     * Custom page title
     */
    title?: string;
    
    /**
     * Initial filters (optional)
     */
    initialFilters?: Partial<AuditSearchFilters>;
}

// ============= INTERFACES =============

interface DashboardStats {
    totalAudits: number;
    todayAudits: number;
    uniqueUsers: number;
    topActions: Array<{
        action: AuditAction;
        count: number;
    }>;
}

interface FilterState extends AuditSearchFilters {
    // Extend với additional UI state
}

// ============= COMPONENT IMPLEMENTATION =============

/**
 * AuditDashboard Component
 */
export const AuditDashboard: React.FC<AuditDashboardProps> = ({
    className = '',
    title = 'Audit Dashboard',
    initialFilters = {}
}) => {
    // ============= STATE MANAGEMENT =============
    
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    
    // Filter state
    const [filters, setFilters] = useState<FilterState>({
        page: 0,
        size: 20,
        sort: 'performedAt',
        direction: 'desc',
        ...initialFilters
    });
    
    // UI state
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedLogs, setSelectedLogs] = useState<Set<number>>(new Set());
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
    
    // ============= EFFECTS =============
    
    /**
     * Load audit logs when component mounts or filters change
     */
    useEffect(() => {
        loadAuditLogs();
    }, [filters]);
    
    /**
     * Auto refresh functionality
     */
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                loadAuditLogs();
            }, 30000); // Refresh every 30 seconds
            
            setRefreshInterval(interval);
            
            return () => {
                if (interval) {
                    clearInterval(interval);
                }
            };
        } else {
            if (refreshInterval) {
                clearInterval(refreshInterval);
                setRefreshInterval(null);
            }
        }
    }, [autoRefresh]);
    
    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, []);
    
    // ============= DATA LOADING =============
    
    /**
     * Load audit logs từ API
     */
    const loadAuditLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response: AuditSearchResponse = await AuditService.searchAuditLogs(filters);
            
            setAuditLogs(response.audits);
            setCurrentPage(response.currentPage);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
            setHasNext(response.hasNext);
            setHasPrevious(response.hasPrevious);
            
            // Load stats if first page
            if (response.currentPage === 0) {
                // calculateStats(response.audits);
            }
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể tải audit logs';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filters]);
    
    /**
     * Calculate dashboard statistics
     */
    const calculateStats = (logs: AuditLog[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayLogs = logs.filter(log => {
            const logDate = new Date(log.performedAt);
            logDate.setHours(0, 0, 0, 0);
            return logDate.getTime() === today.getTime();
        });
        
        const uniqueUsers = new Set(logs.map(log => log.performedBy)).size;
        
        const actionCounts = logs.reduce((acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1;
            return acc;
        }, {} as Record<AuditAction, number>);
        
        const topActions = Object.entries(actionCounts)
            .map(([action, count]) => ({ action: action as AuditAction, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        setStats({
            totalAudits: logs.length,
            todayAudits: todayLogs.length,
            uniqueUsers,
            topActions
        });
    };
    
    // ============= EVENT HANDLERS =============
    
    /**
     * Handle filter changes
     */
    const handleFilterChange = (newFilters: Partial<FilterState>) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            page: 0 // Reset to first page when filters change
        }));
        setCurrentPage(0);
    };
    
    /**
     * Handle page change
     */
    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
        setCurrentPage(page);
    };
    
    /**
     * Handle page size change
     */
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setFilters(prev => ({ ...prev, size, page: 0 }));
        setCurrentPage(0);
    };
    
    /**
     * Handle export
     */
    const handleExport = async (format: 'json' | 'csv') => {
        try {
            setIsExporting(true);
            
            // Get all audit logs without pagination for export
            const exportFilters = { ...filters, page: undefined, size: undefined };
            const response = await AuditService.searchAuditLogs(exportFilters);
            
            let content: string;
            let filename: string;
            let mimeType: string;
            
            if (format === 'json') {
                content = JSON.stringify(response.audits, null, 2);
                filename = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
            } else {
                // CSV format
                const headers = [
                    'ID',
                    'Entity Type',
                    'Entity ID',
                    'Action',
                    'Description',
                    'Field Name',
                    'Old Value',
                    'New Value',
                    'Performed By',
                    'Performed At',
                    'IP Address'
                ];
                
                const rows = response.audits.map(audit => [
                    audit.id.toString(),
                    audit.entityType,
                    audit.entityId.toString(),
                    audit.action,
                    audit.actionDescription || '',
                    audit.fieldName || '',
                    audit.oldValue || '',
                    audit.newValue || '',
                    audit.performedBy,
                    new Date(audit.performedAt).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }),
                    audit.ipAddress || ''
                ]);
                
                content = [headers, ...rows]
                    .map(row => row.map(cell => `"${cell}"`).join(','))
                    .join('\n');
                
                filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv;charset=utf-8;';
            }
            
            // Download file
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
        } catch (err) {
            console.error('Export failed:', err);
            setError('Không thể export audit logs');
        } finally {
            setIsExporting(false);
        }
    };
    
    /**
     * Handle refresh
     */
    const handleRefresh = () => {
        loadAuditLogs();
    };
    
    /**
     * Handle clear filters
     */
    const handleClearFilters = () => {
        setFilters({
            page: 0,
            size: pageSize,
            sort: 'performedAt',
            direction: 'desc'
        });
    };
    
    /**
     * Handle select all logs
     */
    const handleSelectAll = () => {
        if (selectedLogs.size === auditLogs.length) {
            setSelectedLogs(new Set());
        } else {
            setSelectedLogs(new Set(auditLogs.map(log => log.id)));
        }
    };
    
    /**
     * Handle select individual log
     */
    const handleSelectLog = (logId: number) => {
        const newSelected = new Set(selectedLogs);
        if (newSelected.has(logId)) {
            newSelected.delete(logId);
        } else {
            newSelected.add(logId);
        }
        setSelectedLogs(newSelected);
    };
    
    // ============= RENDER HELPERS =============
    
    /**
     * Render dashboard header
     */
    const renderHeader = () => (
        <div className="bg-white shadow-sm border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Quản lý và theo dõi toàn bộ hoạt động hệ thống
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Auto refresh toggle */}
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="mr-2"
                        />
                        <span className="text-sm text-gray-600">Auto refresh</span>
                    </label>
                    
                    {/* Refresh button */}
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''} mr-1`} />
                        Refresh
                    </button>
                </div>
            </div>
        </div>
    );
    
    /**
     * Render statistics cards
     */
    const renderStats = () => {
        if (!stats) return null;
        
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <i className="fas fa-list-alt text-blue-600 text-2xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Tổng Audit Logs</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalAudits}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <i className="fas fa-calendar-day text-green-600 text-2xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Hôm nay</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.todayAudits}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <i className="fas fa-users text-purple-600 text-2xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Người dùng</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.uniqueUsers}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <i className="fas fa-chart-bar text-orange-600 text-2xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Top Action</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {stats.topActions[0] ? 
                                    AuditService.getActionDescription(stats.topActions[0].action) : 
                                    'N/A'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    /**
     * Render filters section
     */
    const renderFilters = () => (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Bộ lọc</h3>
                <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                    {showAdvancedFilters ? 'Ẩn bộ lọc nâng cao' : 'Hiện bộ lọc nâng cao'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Entity type filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại Entity
                    </label>
                    <select
                        value={filters.entityType || ''}
                        onChange={(e) => handleFilterChange({
                            entityType: e.target.value as EntityType || undefined
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Tất cả</option>
                        {Object.values(EntityType).map(type => (
                            <option key={type} value={type}>
                                {AuditService.getEntityTypeDescription(type)}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Action filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hành động
                    </label>
                    <select
                        value={filters.action || ''}
                        onChange={(e) => handleFilterChange({
                            action: e.target.value as AuditAction || undefined
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Tất cả</option>
                        {Object.values(AuditAction).map(action => (
                            <option key={action} value={action}>
                                {AuditService.getActionDescription(action)}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* User filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Người thực hiện
                    </label>
                    <input
                        type="text"
                        value={filters.performedBy || ''}
                        onChange={(e) => handleFilterChange({ performedBy: e.target.value || undefined })}
                        placeholder="Tìm theo username..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                {/* Date range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Từ ngày
                    </label>
                    <input
                        type="date"
                        value={filters.fromDate ? new Date(filters.fromDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleFilterChange({
                            fromDate: e.target.value ? 
                                AuditService.formatDateForApi(new Date(e.target.value)) : 
                                undefined
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đến ngày
                    </label>
                    <input
                        type="date"
                        value={filters.toDate ? new Date(filters.toDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleFilterChange({
                            toDate: e.target.value ? 
                                AuditService.formatDateForApi(new Date(e.target.value)) : 
                                undefined
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
            
            {/* Advanced filters */}
            {showAdvancedFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Sort options */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sắp xếp theo
                            </label>
                            <select
                                value={filters.sort || 'performedAt'}
                                onChange={(e) => handleFilterChange({ sort: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="performedAt">Thời gian</option>
                                <option value="action">Hành động</option>
                                <option value="performedBy">Người thực hiện</option>
                                <option value="entityType">Loại entity</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thứ tự
                            </label>
                            <select
                                value={filters.direction || 'desc'}
                                onChange={(e) => handleFilterChange({ direction: e.target.value as 'asc' | 'desc' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="desc">Mới nhất</option>
                                <option value="asc">Cũ nhất</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kết quả/trang
                            </label>
                            <select
                                value={pageSize}
                                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Filter actions */}
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                    Hiển thị {auditLogs.length} / {totalElements} kết quả
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={handleClearFilters}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Xóa bộ lọc
                    </button>
                    
                    <button
                        onClick={() => handleExport('csv')}
                        disabled={isExporting || auditLogs.length === 0}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        <i className="fas fa-file-csv mr-1" />
                        CSV
                    </button>
                    
                    <button
                        onClick={() => handleExport('json')}
                        disabled={isExporting || auditLogs.length === 0}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <i className="fas fa-file-code mr-1" />
                        JSON
                    </button>
                </div>
            </div>
        </div>
    );
    
    /**
     * Render audit logs list
     */
    const renderAuditLogs = () => {
        if (auditLogs.length === 0) {
            return (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                        <i className="fas fa-search text-4xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Không tìm thấy audit logs
                    </h3>
                    <p className="text-gray-500">
                        Thử điều chỉnh bộ lọc để xem kết quả khác
                    </p>
                </div>
            );
        }
        
        return (
            <div className="bg-white rounded-lg shadow">
                {/* List header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedLogs.size === auditLogs.length && auditLogs.length > 0}
                                    onChange={handleSelectAll}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Chọn tất cả ({selectedLogs.size} đã chọn)
                                </span>
                            </label>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                            Trang {currentPage + 1} / {totalPages}
                        </div>
                    </div>
                </div>
                
                {/* Audit logs list */}
                <div className="divide-y divide-gray-200">
                    {auditLogs.map((audit) => (
                        <div key={audit.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    checked={selectedLogs.has(audit.id)}
                                    onChange={() => handleSelectLog(audit.id)}
                                    className="mt-1 mr-3"
                                />
                                <div className="flex-1">
                                    <AuditLogItem
                                        auditLog={audit}
                                        compact={true}
                                        showEntity={true}
                                        className="border-0 shadow-none p-0 bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            hasNext={hasNext}
                            hasPrevious={hasPrevious}
                        />
                    </div>
                )}
            </div>
        );
    };
    
    // ============= COMPONENT RENDER =============
    
    // Admin permission check
    if (!AuditService.hasAdminPermission()) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-red-300">
                    <i className="fas fa-shield-alt text-4xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không có quyền truy cập
                </h3>
                <p className="text-gray-500">
                    Chỉ Admin mới có thể truy cập Audit Dashboard
                </p>
            </div>
        );
    }
    
    return (
        <div className={`audit-dashboard ${className}`}>
            {/* Header */}
            {renderHeader()}
            
            {/* Main content */}
            <div className="max-w-7xl mx-auto p-6">
                {/* Statistics */}
                {renderStats()}
                
                {/* Filters */}
                {renderFilters()}
                
                {/* Loading state */}
                {loading && <Loading message="Đang tải audit logs..." />}
                
                {/* Error state */}
                {error && (
                    <ErrorDisplay 
                        message={error}
                        onDismiss={handleRefresh}
                        dismissible={true}
                    />
                )}
                
                {/* Audit logs */}
                {!loading && !error && renderAuditLogs()}
            </div>
        </div>
    );
};

// ============= COMPONENT EXPORTS =============

export default AuditDashboard;