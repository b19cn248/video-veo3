import React, { useEffect, useState } from 'react';
import { VideoService } from '../../../services/videoService';
import { AuditEntry, VideoAuditHistoryResponse } from '../../../types/video.types';
import { formatDate } from '../../../utils/formatters';
import { extractErrorMessage } from '../../../utils/errorUtils';
import ErrorDisplay from '../../common/ErrorDisplay/ErrorDisplay';
import Modal from '../../common/Modal/Modal';

interface VideoHistoryProps {
    videoId: number;
    isOpen: boolean;
    onClose: () => void;
}

const VideoHistory: React.FC<VideoHistoryProps> = ({ videoId, isOpen, onClose }) => {
    const [auditHistory, setAuditHistory] = useState<VideoAuditHistoryResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && videoId) {
            fetchAuditHistory();
        }
    }, [isOpen, videoId]);

    const fetchAuditHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await VideoService.getVideoAuditHistory(videoId);
            setAuditHistory(response);
        } catch (err) {
            const errorMessage = extractErrorMessage(err, 'Lỗi khi tải lịch sử thay đổi');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadgeStyle = (action: string) => {
        const styles: { [key: string]: React.CSSProperties } = {
            'UPDATE_VIDEO_URL': { backgroundColor: '#e3f2fd', color: '#1565c0', border: '1px solid #bbdefb' },
            'UPDATE_STATUS': { backgroundColor: '#f3e5f5', color: '#7b1fa2', border: '1px solid #e1bee7' },
            'ASSIGN_STAFF': { backgroundColor: '#e8f5e8', color: '#2e7d32', border: '1px solid #c8e6c8' },
            'UPDATE_DELIVERY_STATUS': { backgroundColor: '#fff3e0', color: '#ef6c00', border: '1px solid #ffcc02' },
            'UPDATE_PAYMENT_STATUS': { backgroundColor: '#fce4ec', color: '#c2185b', border: '1px solid #f8bbd9' },
            'CREATE': { backgroundColor: '#e0f2f1', color: '#00695c', border: '1px solid #b2dfdb' },
            'UPDATE': { backgroundColor: '#f1f8e9', color: '#558b2f', border: '1px solid #dcedc8' },
            'DELETE': { backgroundColor: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2' }
        };

        return styles[action] || { backgroundColor: '#f5f5f5', color: '#616161', border: '1px solid #e0e0e0' };
    };

    const formatValue = (value: string | null): string => {
        if (value === null) return 'null';
        if (value === '""') return '(trống)';
        return value.replace(/^"|"$/g, '');
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                    <div>Đang tải lịch sử thay đổi...</div>
                </div>
            );
        }

        if (error) {
            return (
                <div style={{ padding: '20px' }}>
                    <ErrorDisplay message={error} type="error" />
                </div>
            );
        }

        if (!auditHistory || auditHistory.audits.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    Không có lịch sử thay đổi nào cho video này.
                </div>
            );
        }

        return (
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <h4 style={{ margin: 0, color: '#333' }}>
                        Lịch sử thay đổi Video #{auditHistory.videoId}
                    </h4>
                    <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>
                        Tổng số thay đổi: {auditHistory.totalCount}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {auditHistory.audits.map((audit: AuditEntry) => (
                        <div 
                            key={audit.id} 
                            style={{ 
                                border: '1px solid #e0e0e0', 
                                borderRadius: '8px', 
                                padding: '16px',
                                backgroundColor: '#ffffff',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                    <span 
                                        style={{
                                            ...getActionBadgeStyle(audit.action),
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {audit.action}
                                    </span>
                                    <div style={{ marginTop: '6px', fontSize: '14px', color: '#666' }}>
                                        Thực hiện bởi: <strong>{audit.performedBy}</strong>
                                    </div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#999', textAlign: 'right' }}>
                                    {formatDate(audit.performedAt)}
                                </div>
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                                    {audit.actionDescription}
                                </div>
                                {audit.fieldName && (
                                    <div style={{ fontSize: '13px', color: '#666' }}>
                                        Trường: <strong>{audit.fieldName}</strong>
                                    </div>
                                )}
                            </div>

                            {audit.fieldLevelChange && (
                                <div style={{ 
                                    backgroundColor: '#f8f9fa', 
                                    padding: '10px', 
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <strong style={{ color: '#dc3545' }}>Giá trị cũ:</strong>
                                            <div style={{ marginTop: '2px', color: '#666' }}>
                                                {formatValue(audit.oldValue)}
                                            </div>
                                        </div>
                                        <div>
                                            <strong style={{ color: '#28a745' }}>Giá trị mới:</strong>
                                            <div style={{ marginTop: '2px', color: '#666' }}>
                                                {formatValue(audit.newValue)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px', fontStyle: 'italic' }}>
                                {audit.formattedDescription}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Lịch sử thay đổi"
        >
            <div style={{ width: '800px', maxWidth: '90vw' }}>
                {renderContent()}
            </div>
        </Modal>
    );
};

export default VideoHistory;