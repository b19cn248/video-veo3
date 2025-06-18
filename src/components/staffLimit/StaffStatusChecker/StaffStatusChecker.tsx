// Staff Status Checker Component
// Quick check component để kiểm tra trạng thái giới hạn của nhân viên

import React, { useState, useEffect } from 'react';
import { StaffLimitCheckResponse } from '../../../types/staffLimit.types';
import { StaffLimitService } from '../../../services/staffLimitService';
import { VideoService } from '../../../services/videoService';
import {
    createButtonStyle,
    createButtonHoverHandlers,
    createFilterInputStyle,
    createInputFocusHandlers,
    showToast
} from '../../video/VideoList/utils/videoListHelpers';

interface StaffStatusCheckerProps {
    onStatusCheck?: (result: StaffLimitCheckResponse) => void;
}

const StaffStatusChecker: React.FC<StaffStatusCheckerProps> = ({
    onStatusCheck
}) => {
    const [staffName, setStaffName] = useState('');
    const [checking, setChecking] = useState(false);
    const [lastResult, setLastResult] = useState<StaffLimitCheckResponse | null>(null);
    const [staffList, setStaffList] = useState<string[]>([]);
    const [loadingStaff, setLoadingStaff] = useState(false);

    // Load staff list khi component mount
    useEffect(() => {
        loadStaffList();
    }, []);

    const loadStaffList = async () => {
        try {
            setLoadingStaff(true);
            const response = await VideoService.getAssignedStaffList();
            if (response.success && response.data) {
                setStaffList(response.data);
            } else {
                setStaffList([]);
            }
        } catch (error) {
            console.error('Error loading staff list:', error);
            setStaffList([]);
        } finally {
            setLoadingStaff(false);
        }
    };

    const handleCheck = async () => {
        if (!staffName.trim()) {
            showToast('Vui lòng chọn nhân viên để kiểm tra', 'warning');
            return;
        }

        try {
            setChecking(true);
            const result = await StaffLimitService.checkStaffLimit(staffName.trim());
            setLastResult(result);
            
            if (onStatusCheck) {
                onStatusCheck(result);
            }

            // Show toast notification
            if (result.data.isLimited) {
                showToast(`Nhân viên ${staffName} hiện đang bị giới hạn`, 'warning');
            } else {
                showToast(`Nhân viên ${staffName} có thể nhận đơn mới`, 'success');
            }
        } catch (error) {
            console.error('Error checking staff status:', error);
            showToast('Có lỗi xảy ra khi kiểm tra trạng thái nhân viên', 'error');
            setLastResult(null);
        } finally {
            setChecking(false);
        }
    };

    const handleReset = () => {
        setStaffName('');
        setLastResult(null);
    };

    const getStatusColor = (isLimited: boolean) => {
        return isLimited ? '#ef4444' : '#10b981';
    };

    const getStatusIcon = (isLimited: boolean) => {
        return isLimited ? '🚫' : '✅';
    };

    const getStatusText = (isLimited: boolean) => {
        return isLimited ? 'Đang bị giới hạn' : 'Có thể nhận đơn mới';
    };

    return (
        <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937'
                }}>
                    🔍 Kiểm tra trạng thái nhân viên
                </h3>
            </div>

            {/* Search Form */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '12px',
                alignItems: 'end',
                marginBottom: '20px'
            }}>
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '6px'
                    }}>
                        👤 Chọn nhân viên
                        {loadingStaff && (
                            <span style={{
                                marginLeft: '8px',
                                fontSize: '12px',
                                color: '#6b7280'
                            }}>
                                ⏳ Đang tải...
                            </span>
                        )}
                    </label>
                    <select
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        disabled={loadingStaff || checking}
                        style={{
                            ...createFilterInputStyle(loadingStaff || checking),
                            minWidth: '200px'
                        }}
                        {...createInputFocusHandlers(loadingStaff || checking)}
                    >
                        <option value="">-- Chọn nhân viên --</option>
                        {staffList.map(staff => (
                            <option key={staff} value={staff}>
                                {staff}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleCheck}
                    disabled={!staffName.trim() || checking || loadingStaff}
                    style={{
                        ...createButtonStyle('primary'),
                        opacity: (!staffName.trim() || checking || loadingStaff) ? 0.6 : 1,
                        cursor: (!staffName.trim() || checking || loadingStaff) ? 'not-allowed' : 'pointer'
                    }}
                    {...(!(checking || loadingStaff || !staffName.trim()) && createButtonHoverHandlers('primary'))}
                >
                    {checking ? '⏳ Đang kiểm tra...' : '🔍 Kiểm tra'}
                </button>

                {lastResult && (
                    <button
                        onClick={handleReset}
                        style={createButtonStyle('secondary')}
                        {...createButtonHoverHandlers('secondary')}
                    >
                        🔄 Làm mới
                    </button>
                )}
            </div>

            {/* Result Display */}
            {lastResult && (
                <div style={{
                    padding: '20px',
                    borderRadius: '8px',
                    border: `2px solid ${getStatusColor(lastResult.data.isLimited)}`,
                    background: lastResult.data.isLimited ? '#fef2f2' : '#f0fdf4'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px'
                    }}>
                        <div style={{ fontSize: '24px' }}>
                            {getStatusIcon(lastResult.data.isLimited)}
                        </div>
                        <div>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: getStatusColor(lastResult.data.isLimited),
                                marginBottom: '4px'
                            }}>
                                {lastResult.data.staffName}
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: getStatusColor(lastResult.data.isLimited)
                            }}>
                                {getStatusText(lastResult.data.isLimited)}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        background: 'rgba(0,0,0,0.05)',
                        padding: '8px 12px',
                        borderRadius: '6px'
                    }}>
                        💡 <strong>Ý nghĩa:</strong> {
                            lastResult.data.canReceiveNewOrders 
                                ? 'Nhân viên này có thể được giao video mới'
                                : 'Nhân viên này hiện không thể nhận video mới do đang bị giới hạn'
                        }
                    </div>
                </div>
            )}

            {/* Help Text */}
            {!lastResult && (
                <div style={{
                    padding: '16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#6b7280'
                }}>
                    💡 <strong>Hướng dẫn:</strong> Chọn nhân viên và nhấn "Kiểm tra" để xem trạng thái giới hạn hiện tại. 
                    Kết quả sẽ cho biết nhân viên có thể nhận đơn hàng mới hay không.
                </div>
            )}
        </div>
    );
};

export default StaffStatusChecker;