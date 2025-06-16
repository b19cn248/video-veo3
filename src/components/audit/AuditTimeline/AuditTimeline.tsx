/**
 * AuditTimeline Component - Hiển thị audit logs dưới dạng timeline
 * 
 * Chức năng:
 * - Timeline view cho audit logs với chronological order
 * - Visual timeline connector lines
 * - Grouping theo date hoặc action type
 * - Infinite scroll hoặc pagination support
 * - Filter và search capabilities
 * 
 * Tuân thủ SOLID Principles:
 * - Single Responsibility: Chỉ hiển thị audit timeline
 * - Open/Closed: Có thể extend thêm timeline features
 * - Interface Segregation: Clear props interface
 * 
 * UI/UX Considerations:
 * - Clear visual timeline flow
 * - Responsive design cho mobile/desktop
 * - Loading states và error handling
 * - Smooth animations và transitions
 * 
 * @author System
 * @since 1.6.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AuditLog, AuditService } from '../../../services/auditService';
import { AuditLogItem } from '../AuditLogItem';
import Loading from '../../common/Loading/Loading';
import { ErrorDisplay } from '../../common/ErrorDisplay';
// Temporarily using native Date methods instead of date-fns

// ============= COMPONENT PROPS =============

interface AuditTimelineProps {
    /**
     * Video ID để lấy audit logs
     */
    videoId?: number;
    
    /**
     * Pre-loaded audit logs (optional)
     */
    auditLogs?: AuditLog[];
    
    /**
     * Show date grouping
     * @default true
     */
    showDateGrouping?: boolean;
    
    /**
     * Compact mode để tiết kiệm space
     * @default false
     */
    compact?: boolean;
    
    /**
     * Maximum số items để hiển thị initially
     * @default 50
     */
    initialLimit?: number;
    
    /**
     * Show load more button
     * @default true
     */
    showLoadMore?: boolean;
    
    /**
     * Custom empty state message
     */
    emptyMessage?: string;
    
    /**
     * Custom CSS classes
     */
    className?: string;
    
    /**
     * Click handler cho audit log items
     */
    onAuditClick?: (auditLog: AuditLog) => void;
    
    /**
     * Callback khi load thêm data
     */
    onLoadMore?: () => void;
}

// ============= INTERFACES =============

interface GroupedAuditLogs {
    date: string;
    audits: AuditLog[];
}

// ============= COMPONENT IMPLEMENTATION =============

/**
 * AuditTimeline Component
 */
export const AuditTimeline: React.FC<AuditTimelineProps> = ({
    videoId,
    auditLogs: providedAuditLogs,
    showDateGrouping = true,
    compact = false,
    initialLimit = 50,
    showLoadMore = true,
    emptyMessage = 'Chưa có lịch sử audit nào',
    className = '',
    onAuditClick,
    onLoadMore
}) => {
    // ============= STATE MANAGEMENT =============
    
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(providedAuditLogs || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [displayLimit, setDisplayLimit] = useState(initialLimit);
    const [hasMoreData, setHasMoreData] = useState(true);
    
    // ============= EFFECTS =============
    
    /**
     * Load audit logs nếu videoId được provide và chưa có data
     */
    useEffect(() => {
        if (videoId && !providedAuditLogs) {
            loadAuditLogs();
        }
    }, [videoId, providedAuditLogs]);
    
    /**
     * Update audit logs khi props change
     */
    useEffect(() => {
        if (providedAuditLogs) {
            setAuditLogs(providedAuditLogs);
            setHasMoreData(providedAuditLogs.length > displayLimit);
        }
    }, [providedAuditLogs, displayLimit]);
    
    // ============= DATA LOADING =============
    
    /**
     * Load audit logs từ API
     */
    const loadAuditLogs = async () => {
        if (!videoId) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const response = await AuditService.getVideoHistoryAll(videoId);
            setAuditLogs(response.audits);
            setHasMoreData(response.audits.length > displayLimit);
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể tải lịch sử audit';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // ============= DATA PROCESSING =============
    
    /**
     * Group audit logs theo date nếu enabled
     */
    const groupedAudits = useMemo((): GroupedAuditLogs[] => {
        if (!showDateGrouping) {
            return [{
                date: '',
                audits: auditLogs.slice(0, displayLimit)
            }];
        }
        
        const displayedAudits = auditLogs.slice(0, displayLimit);
        const groups: GroupedAuditLogs[] = [];
        let currentGroup: GroupedAuditLogs | null = null;
        
        displayedAudits.forEach(audit => {
            const auditDate = new Date(audit.performedAt);
            const dateKey = auditDate.toISOString().split('T')[0];
            
            if (!currentGroup || currentGroup.date !== dateKey) {
                currentGroup = {
                    date: dateKey,
                    audits: []
                };
                groups.push(currentGroup);
            }
            
            currentGroup.audits.push(audit);
        });
        
        return groups;
    }, [auditLogs, displayLimit, showDateGrouping]);
    
    /**
     * Check if còn data để load more
     */
    const canLoadMore = useMemo(() => {
        return hasMoreData && displayLimit < auditLogs.length;
    }, [hasMoreData, displayLimit, auditLogs.length]);
    
    // ============= EVENT HANDLERS =============
    
    /**
     * Handle load more
     */
    const handleLoadMore = () => {
        if (onLoadMore) {
            onLoadMore();
        } else {
            setDisplayLimit(prev => prev + initialLimit);
        }
    };
    
    /**
     * Handle retry on error
     */
    const handleRetry = () => {
        if (videoId) {
            loadAuditLogs();
        }
    };
    
    // ============= RENDER HELPERS =============
    
    /**
     * Render date group header
     */
    const renderDateHeader = (date: string) => {
        if (!showDateGrouping || !date) return null;
        
        const dateObj = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let displayDate;
        const isSameDay = (date1: Date, date2: Date) => {
            return date1.toDateString() === date2.toDateString();
        };
        
        if (isSameDay(dateObj, today)) {
            displayDate = 'Hôm nay';
        } else if (isSameDay(dateObj, yesterday)) {
            displayDate = 'Hôm qua';
        } else {
            displayDate = dateObj.toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: '2-digit', 
                month: 'long',
                year: 'numeric'
            });
        }
        
        return (
            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-sm font-medium text-gray-500">
                        {displayDate}
                    </span>
                </div>
            </div>
        );
    };
    
    /**
     * Render timeline item với connector
     */
    const renderTimelineItem = (audit: AuditLog, index: number, isLast: boolean) => (
        <div key={audit.id} className="relative">
            {/* Timeline connector */}
            {!isLast && (
                <div 
                    className="absolute left-4 top-8 w-0.5 h-full bg-gray-200"
                    style={{ marginLeft: '-1px' }}
                />
            )}
            
            {/* Audit log item */}
            <div className="relative pl-10">
                <AuditLogItem
                    auditLog={audit}
                    compact={compact}
                    showEntity={false} // Timeline thường specific cho một entity
                    onClick={onAuditClick}
                    className="mb-4"
                />
            </div>
        </div>
    );
    
    /**
     * Render load more button
     */
    const renderLoadMoreButton = () => {
        if (!showLoadMore || !canLoadMore) return null;
        
        return (
            <div className="text-center mt-6">
                <button
                    onClick={handleLoadMore}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <i className="fas fa-chevron-down mr-2" />
                    Xem thêm
                </button>
            </div>
        );
    };
    
    /**
     * Render empty state
     */
    const renderEmptyState = () => (
        <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <i className="fas fa-history text-4xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có lịch sử
            </h3>
            <p className="text-gray-500">
                {emptyMessage}
            </p>
        </div>
    );
    
    // ============= COMPONENT RENDER =============
    
    // Loading state
    if (loading && auditLogs.length === 0) {
        return (
            <div className={`audit-timeline ${className}`}>
                <Loading message="Đang tải lịch sử..." />
            </div>
        );
    }
    
    // Error state
    if (error && auditLogs.length === 0) {
        return (
            <div className={`audit-timeline ${className}`}>
                <ErrorDisplay 
                    message={error}
                    onDismiss={handleRetry}
                    dismissible={true}
                />
            </div>
        );
    }
    
    // Empty state
    if (auditLogs.length === 0) {
        return (
            <div className={`audit-timeline ${className}`}>
                {renderEmptyState()}
            </div>
        );
    }
    
    // Main render
    return (
        <div className={`audit-timeline space-y-6 ${className}`}>
            {/* Timeline content */}
            {groupedAudits.map((group, groupIndex) => (
                <div key={group.date || groupIndex} className="space-y-4">
                    {/* Date header */}
                    {renderDateHeader(group.date)}
                    
                    {/* Audit items */}
                    <div className="space-y-0">
                        {group.audits.map((audit, index) => 
                            renderTimelineItem(
                                audit, 
                                index, 
                                index === group.audits.length - 1 && 
                                groupIndex === groupedAudits.length - 1 &&
                                !canLoadMore
                            )
                        )}
                    </div>
                </div>
            ))}
            
            {/* Load more button */}
            {renderLoadMoreButton()}
            
            {/* Loading indicator cho load more */}
            {loading && auditLogs.length > 0 && (
                <div className="text-center py-4">
                    <div className="inline-flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-sm text-gray-600">Đang tải...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============= COMPONENT EXPORTS =============

export default AuditTimeline;