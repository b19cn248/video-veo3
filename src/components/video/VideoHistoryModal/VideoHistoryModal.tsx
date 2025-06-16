/**
 * VideoHistoryModal Component - Modal hiển thị lịch sử đầy đủ của video
 * 
 * Chức năng:
 * - Modal popup để hiển thị complete history của video
 * - Timeline view với chronological order
 * - Export functionality cho audit report
 * - Filter và search trong history
 * - Responsive design cho mobile/desktop
 * 
 * Tuân thủ SOLID Principles:
 * - Single Responsibility: Chỉ hiển thị video history modal
 * - Open/Closed: Có thể extend thêm export formats
 * - Interface Segregation: Clear props interface
 * 
 * UI/UX Considerations:
 * - Large modal để accommodate timeline data
 * - Smooth animations và transitions
 * - Loading states và error handling
 * - Export options với different formats
 * 
 * @author System
 * @since 1.6.0
 */

import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal/Modal';
import { AuditTimeline } from '../../audit/AuditTimeline';
import { AuditLog, AuditService, AuditAction, EntityType } from '../../../services/auditService';
import { Video } from '../../../types/video.types';
import Loading from '../../common/Loading/Loading';
import { ErrorDisplay } from '../../common/ErrorDisplay';
// Temporarily using native Date methods instead of date-fns

// ============= COMPONENT PROPS =============

interface VideoHistoryModalProps {
    /**
     * Video object để hiển thị history
     */
    video: Video | null;
    
    /**
     * Modal open state
     */
    isOpen: boolean;
    
    /**
     * Close modal handler
     */
    onClose: () => void;
    
    /**
     * Optional pre-loaded audit logs
     */
    auditLogs?: AuditLog[];
    
    /**
     * Show export options
     * @default true
     */
    showExportOptions?: boolean;
    
    /**
     * Custom modal title
     */
    customTitle?: string;
}

// ============= INTERFACES =============

interface HistoryStats {
    totalActions: number;
    uniqueUsers: number;
    dateRange: {
        from: Date | null;
        to: Date | null;
    };
    actionCounts: Record<string, number>;
}

// ============= COMPONENT IMPLEMENTATION =============

/**
 * VideoHistoryModal Component
 */
export const VideoHistoryModal: React.FC<VideoHistoryModalProps> = ({
    video,
    isOpen,
    onClose,
    auditLogs: providedAuditLogs,
    showExportOptions = true,
    customTitle
}) => {
    // ============= STATE MANAGEMENT =============
    
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(providedAuditLogs || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAction, setSelectedAction] = useState<AuditAction | ''>('');
    const [dateRange, setDateRange] = useState<{from: string; to: string}>({
        from: '',
        to: ''
    });
    const [isExporting, setIsExporting] = useState(false);
    
    // ============= EFFECTS =============
    
    /**
     * Load audit logs khi modal mở và có video
     */
    useEffect(() => {
        if (isOpen && video && !providedAuditLogs) {
            loadAuditLogs();
        }
    }, [isOpen, video, providedAuditLogs]);
    
    /**
     * Reset state khi modal đóng
     */
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setSelectedAction('');
            setDateRange({ from: '', to: '' });
            setError(null);
        }
    }, [isOpen]);
    
    /**
     * Update audit logs khi props change
     */
    useEffect(() => {
        if (providedAuditLogs) {
            setAuditLogs(providedAuditLogs);
        }
    }, [providedAuditLogs]);
    
    // ============= DATA LOADING =============
    
    /**
     * Load audit logs từ API
     */
    const loadAuditLogs = async () => {
        if (!video?.id) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const response = await AuditService.getVideoHistoryAll(video.id);
            setAuditLogs(response.audits);
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể tải lịch sử video';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // ============= DATA PROCESSING =============
    
    /**
     * Filter audit logs dựa trên search và filters
     */
    const filteredAuditLogs = React.useMemo(() => {
        let filtered = auditLogs;
        
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(audit => 
                audit.actionDescription?.toLowerCase().includes(searchLower) ||
                audit.performedBy.toLowerCase().includes(searchLower) ||
                audit.fieldName?.toLowerCase().includes(searchLower) ||
                audit.oldValue?.toLowerCase().includes(searchLower) ||
                audit.newValue?.toLowerCase().includes(searchLower)
            );
        }
        
        // Action filter
        if (selectedAction) {
            filtered = filtered.filter(audit => audit.action === selectedAction);
        }
        
        // Date range filter
        if (dateRange.from) {
            const fromDate = new Date(dateRange.from);
            filtered = filtered.filter(audit => 
                new Date(audit.performedAt) >= fromDate
            );
        }
        
        if (dateRange.to) {
            const toDate = new Date(dateRange.to);
            toDate.setHours(23, 59, 59, 999); // Include full day
            filtered = filtered.filter(audit => 
                new Date(audit.performedAt) <= toDate
            );
        }
        
        return filtered;
    }, [auditLogs, searchTerm, selectedAction, dateRange]);
    
    /**
     * Calculate history statistics
     */
    const historyStats = React.useMemo((): HistoryStats => {
        const users = new Set(auditLogs.map(audit => audit.performedBy));
        const actionCounts: Record<string, number> = {};
        
        auditLogs.forEach(audit => {
            const actionKey = audit.action;
            actionCounts[actionKey] = (actionCounts[actionKey] || 0) + 1;
        });
        
        const dates = auditLogs.map(audit => new Date(audit.performedAt));
        const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
        
        return {
            totalActions: auditLogs.length,
            uniqueUsers: users.size,
            dateRange: {
                from: sortedDates[0] || null,
                to: sortedDates[sortedDates.length - 1] || null
            },
            actionCounts
        };
    }, [auditLogs]);
    
    // ============= EVENT HANDLERS =============
    
    /**
     * Handle retry loading
     */
    const handleRetry = () => {
        loadAuditLogs();
    };
    
    /**
     * Handle export audit logs
     */
    const handleExport = async (format: 'json' | 'csv') => {
        try {
            setIsExporting(true);
            
            let content: string;
            let filename: string;
            let mimeType: string;
            
            if (format === 'json') {
                content = JSON.stringify(filteredAuditLogs, null, 2);
                filename = `video-${video?.id}-history.json`;
                mimeType = 'application/json';
            } else {
                // CSV format
                const headers = [
                    'Thời gian',
                    'Hành động', 
                    'Mô tả',
                    'Trường',
                    'Giá trị cũ',
                    'Giá trị mới',
                    'Người thực hiện',
                    'IP Address'
                ];
                
                const rows = filteredAuditLogs.map(audit => [
                    new Date(audit.performedAt).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }),
                    AuditService.getActionDescription(audit.action),
                    audit.actionDescription || '',
                    audit.fieldName || '',
                    audit.oldValue || '',
                    audit.newValue || '',
                    audit.performedBy,
                    audit.ipAddress || ''
                ]);
                
                content = [headers, ...rows]
                    .map(row => row.map(cell => `"${cell}"`).join(','))
                    .join('\n');
                
                filename = `video-${video?.id}-history.csv`;
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
            // Could show error toast here
        } finally {
            setIsExporting(false);
        }
    };
    
    /**
     * Handle clear filters
     */
    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedAction('');
        setDateRange({ from: '', to: '' });
    };
    
    // ============= RENDER HELPERS =============
    
    /**
     * Render modal header với video info
     */
    const renderHeader = () => (
        <div className="border-b border-gray-200 pb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                        {customTitle || `Lịch sử Video #${video?.id}`}
                    </h3>
                    {video && (
                        <p className="text-sm text-gray-600 mt-1">
                            Khách hàng: <span className="font-medium">{video.customerName}</span>
                        </p>
                    )}
                </div>
                
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <i className="fas fa-times text-xl" />
                </button>
            </div>
        </div>
    );
    
    /**
     * Render stats summary
     */
    const renderStats = () => (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Thống kê lịch sử</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{historyStats.totalActions}</div>
                    <div className="text-xs text-gray-500">Tổng hành động</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{historyStats.uniqueUsers}</div>
                    <div className="text-xs text-gray-500">Người tham gia</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-bold text-purple-600">
                        {historyStats.dateRange.from ? 
                            historyStats.dateRange.from.toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit'
                            }) : 
                            'N/A'
                        }
                    </div>
                    <div className="text-xs text-gray-500">Ngày bắt đầu</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-bold text-orange-600">
                        {historyStats.dateRange.to ? 
                            historyStats.dateRange.to.toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit'
                            }) : 
                            'N/A'
                        }
                    </div>
                    <div className="text-xs text-gray-500">Ngày gần nhất</div>
                </div>
            </div>
        </div>
    );
    
    /**
     * Render filters
     */
    const renderFilters = () => (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-end">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tìm kiếm
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm trong mô tả, người thực hiện..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                {/* Action filter */}
                <div className="min-w-[150px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hành động
                    </label>
                    <select
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value as AuditAction | '')}
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
                
                {/* Date range */}
                <div className="flex gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Từ ngày
                        </label>
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đến ngày
                        </label>
                        <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
                
                {/* Clear filters */}
                <button
                    onClick={handleClearFilters}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    title="Xóa bộ lọc"
                >
                    <i className="fas fa-times" />
                </button>
            </div>
            
            {/* Active filters count */}
            {(searchTerm || selectedAction || dateRange.from || dateRange.to) && (
                <div className="mt-3 text-sm text-gray-600">
                    Hiển thị {filteredAuditLogs.length} / {auditLogs.length} mục
                </div>
            )}
        </div>
    );
    
    /**
     * Render export options
     */
    const renderExportOptions = () => {
        if (!showExportOptions) return null;
        
        return (
            <div className="flex justify-end gap-2 mb-4">
                <button
                    onClick={() => handleExport('csv')}
                    disabled={isExporting || filteredAuditLogs.length === 0}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                    <i className="fas fa-file-csv mr-1" />
                    CSV
                </button>
                <button
                    onClick={() => handleExport('json')}
                    disabled={isExporting || filteredAuditLogs.length === 0}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <i className="fas fa-file-code mr-1" />
                    JSON
                </button>
            </div>
        );
    };
    
    // ============= COMPONENT RENDER =============
    
    if (!video) return null;
    
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={customTitle || `Lịch sử Video #${video?.id}`}
        >
            <div className="max-h-[80vh] overflow-hidden flex flex-col">
                {/* Video info */}
                {video && (
                    <div className="border-b border-gray-200 pb-4 mb-6">
                        <p className="text-sm text-gray-600">
                            Khách hàng: <span className="font-medium">{video.customerName}</span>
                        </p>
                    </div>
                )}
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Loading state */}
                    {loading && (
                        <Loading message="Đang tải lịch sử video..." />
                    )}
                    
                    {/* Error state */}
                    {error && (
                        <ErrorDisplay 
                            message={error}
                            onDismiss={handleRetry}
                            dismissible={true}
                        />
                    )}
                    
                    {/* Content when loaded */}
                    {!loading && !error && (
                        <>
                            {/* Stats */}
                            {renderStats()}
                            
                            {/* Filters */}
                            {renderFilters()}
                            
                            {/* Export options */}
                            {renderExportOptions()}
                            
                            {/* Timeline */}
                            <AuditTimeline
                                auditLogs={filteredAuditLogs}
                                showDateGrouping={true}
                                compact={false}
                                showLoadMore={false}
                                emptyMessage={
                                    filteredAuditLogs.length === 0 && auditLogs.length > 0 ?
                                    'Không có kết quả phù hợp với bộ lọc' :
                                    'Chưa có lịch sử cho video này'
                                }
                            />
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

// ============= COMPONENT EXPORTS =============

export default VideoHistoryModal;