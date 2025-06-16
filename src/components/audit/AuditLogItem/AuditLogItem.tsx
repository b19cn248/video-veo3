/**
 * AuditLogItem Component - Hiển thị một audit log entry đơn lẻ
 * 
 * Chức năng:
 * - Hiển thị thông tin chi tiết của một audit log
 * - Format time và user information
 * - Show action icons và colors
 * - Support expansion để xem chi tiết
 * - Responsive design cho mobile/desktop
 * 
 * Tuân thủ SOLID Principles:
 * - Single Responsibility: Chỉ hiển thị một audit log item
 * - Open/Closed: Có thể extend thêm display options
 * - Interface Segregation: Clear props interface
 * 
 * UI/UX Considerations:
 * - Clear visual hierarchy
 * - Consistent styling với app theme
 * - Intuitive interaction patterns
 * - Accessibility support
 * 
 * @author System
 * @since 1.6.0
 */

import React, { useState } from 'react';
import { AuditLog, AuditService } from '../../../services/auditService';
// Temporarily using native Date methods instead of date-fns

// ============= COMPONENT PROPS =============

interface AuditLogItemProps {
    /**
     * Audit log data để hiển thị
     */
    auditLog: AuditLog;
    
    /**
     * Show expanded view by default
     * @default false
     */
    defaultExpanded?: boolean;
    
    /**
     * Show entity information
     * @default true
     */
    showEntity?: boolean;
    
    /**
     * Compact mode để tiết kiệm space
     * @default false
     */
    compact?: boolean;
    
    /**
     * Custom CSS classes
     */
    className?: string;
    
    /**
     * Click handler cho audit log item
     */
    onClick?: (auditLog: AuditLog) => void;
}

// ============= COMPONENT IMPLEMENTATION =============

/**
 * AuditLogItem Component
 */
export const AuditLogItem: React.FC<AuditLogItemProps> = ({
    auditLog,
    defaultExpanded = false,
    showEntity = true,
    compact = false,
    className = '',
    onClick
}) => {
    // ============= STATE MANAGEMENT =============
    
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    
    // ============= DATA PROCESSING =============
    
    // Parse performed date
    const performedDate = AuditService.parseAuditDate(auditLog.performedAt);
    
    // Format relative time (vd: "2 giờ trước")
    const formatRelativeTime = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    };
    
    const relativeTime = formatRelativeTime(performedDate);
    
    // Format absolute time (vd: "14:30, 13/01/2025")
    const absoluteTime = performedDate.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    // Get action description và icon
    const actionDescription = AuditService.getActionDescription(auditLog.action);
    const actionIcon = AuditService.getActionIcon(auditLog.action);
    
    // Get entity type description
    const entityDescription = showEntity ? 
        AuditService.getEntityTypeDescription(auditLog.entityType) : '';
    
    // Determine if có value changes
    const hasValueChange = auditLog.oldValue || auditLog.newValue;
    
    // ============= EVENT HANDLERS =============
    
    /**
     * Handle click on audit item
     */
    const handleItemClick = () => {
        if (onClick) {
            onClick(auditLog);
        } else if (hasValueChange && !compact) {
            setIsExpanded(!isExpanded);
        }
    };
    
    /**
     * Handle expand/collapse toggle
     */
    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };
    
    // ============= RENDER HELPERS =============
    
    /**
     * Render action icon
     */
    const renderActionIcon = () => (
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            <i className={actionIcon} />
        </div>
    );
    
    /**
     * Render main content
     */
    const renderMainContent = () => (
        <div className="flex-1 min-w-0">
            {/* Action description và entity info */}
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className={`${compact ? 'text-sm' : 'text-base'} font-medium text-gray-900 truncate`}>
                        {auditLog.actionDescription || actionDescription}
                        {showEntity && (
                            <span className="ml-2 text-sm text-gray-500">
                                ({entityDescription} #{auditLog.entityId})
                            </span>
                        )}
                    </p>
                    
                    {/* Field name nếu có */}
                    {auditLog.fieldName && !compact && (
                        <p className="text-sm text-gray-600 mt-1">
                            Trường: <span className="font-mono bg-gray-100 px-1 rounded">
                                {auditLog.fieldName}
                            </span>
                        </p>
                    )}
                </div>
                
                {/* Expand button nếu có value changes */}
                {hasValueChange && !compact && (
                    <button
                        onClick={handleToggleExpand}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title={isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                    >
                        <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-sm`} />
                    </button>
                )}
            </div>
            
            {/* User và time info */}
            <div className={`flex items-center ${compact ? 'mt-1' : 'mt-2'} text-sm text-gray-500`}>
                <i className="fas fa-user mr-1" />
                <span className="font-medium">{auditLog.performedBy}</span>
                <span className="mx-2">•</span>
                <i className="fas fa-clock mr-1" />
                <span title={absoluteTime}>{relativeTime}</span>
                
                {/* IP address nếu có và không compact */}
                {auditLog.ipAddress && !compact && (
                    <>
                        <span className="mx-2">•</span>
                        <i className="fas fa-globe mr-1" />
                        <span className="font-mono text-xs">{auditLog.ipAddress}</span>
                    </>
                )}
            </div>
        </div>
    );
    
    /**
     * Render expanded content với value changes
     */
    const renderExpandedContent = () => {
        if (!isExpanded || !hasValueChange) return null;
        
        return (
            <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Old value */}
                    {auditLog.oldValue && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Giá trị cũ
                            </p>
                            <div className="bg-red-50 border border-red-200 rounded-md p-2">
                                <pre className="text-sm text-red-800 whitespace-pre-wrap break-words font-mono">
                                    {auditLog.oldValue}
                                </pre>
                            </div>
                        </div>
                    )}
                    
                    {/* New value */}
                    {auditLog.newValue && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Giá trị mới
                            </p>
                            <div className="bg-green-50 border border-green-200 rounded-md p-2">
                                <pre className="text-sm text-green-800 whitespace-pre-wrap break-words font-mono">
                                    {auditLog.newValue}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Additional metadata */}
                <div className="mt-3 pt-2 border-t border-gray-50">
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>
                            <i className="fas fa-hashtag mr-1" />
                            ID: {auditLog.id}
                        </span>
                        
                        {auditLog.userAgent && (
                            <span className="truncate max-w-xs">
                                <i className="fas fa-desktop mr-1" />
                                {auditLog.userAgent}
                            </span>
                        )}
                        
                        {auditLog.tenantId && (
                            <span>
                                <i className="fas fa-building mr-1" />
                                Tenant: {auditLog.tenantId}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };
    
    // ============= COMPONENT RENDER =============
    
    return (
        <div
            className={`
                ${compact ? 'p-3' : 'p-4'}
                bg-white border border-gray-200 rounded-lg shadow-sm
                hover:shadow-md transition-shadow duration-200
                ${onClick || (hasValueChange && !compact) ? 'cursor-pointer' : ''}
                ${className}
            `}
            onClick={handleItemClick}
        >
            <div className="flex items-start space-x-3">
                {renderActionIcon()}
                {renderMainContent()}
            </div>
            
            {renderExpandedContent()}
        </div>
    );
};

// ============= COMPONENT EXPORTS =============

export default AuditLogItem;