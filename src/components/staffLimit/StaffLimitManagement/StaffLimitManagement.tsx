// Staff Limit Management - Main Page Component
// Trang chính quản lý giới hạn nhân viên (Admin only)

import React, { useState } from 'react';
import { useAuth, useIsAdmin } from '../../../contexts/AuthContext';
import { StaffLimitFormData } from '../../../types/staffLimit.types';
import { useStaffLimits } from '../../../hooks/useStaffLimits';
import StaffLimitForm from '../StaffLimitForm';
import ActiveLimitsTable from '../ActiveLimitsTable';
import StaffStatusChecker from '../StaffStatusChecker';
import {
    createButtonStyle,
    createButtonHoverHandlers,
    showToast
} from '../../video/VideoList/utils/videoListHelpers';

const StaffLimitManagement: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = useIsAdmin();
    const [showCreateForm, setShowCreateForm] = useState(false);

    const {
        activeLimits,
        loading,
        error,
        submitting,
        lastUpdated,
        createLimit,
        removeLimit,
        refreshLimits,
        clearError
    } = useStaffLimits();

    // Redirect nếu không phải admin
    if (!isAdmin) {
        return (
            <div style={{
                padding: '48px 24px',
                textAlign: 'center',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                margin: '20px'
            }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
                <h2 style={{
                    margin: '0 0 12px 0',
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#dc2626'
                }}>
                    Không có quyền truy cập
                </h2>
                <p style={{
                    margin: '0 0 24px 0',
                    fontSize: '16px',
                    color: '#6b7280'
                }}>
                    Chỉ Administrator mới có thể truy cập trang quản lý giới hạn nhân viên.
                </p>
                <button
                    onClick={() => window.history.back()}
                    style={createButtonStyle('secondary')}
                    {...createButtonHoverHandlers('secondary')}
                >
                    ← Quay lại
                </button>
            </div>
        );
    }

    const handleCreateLimit = async (data: StaffLimitFormData) => {
        const success = await createLimit(data);
        if (success) {
            setShowCreateForm(false);
            showToast(
                `Đã tạo giới hạn ${data.lockDays} ngày cho nhân viên ${data.staffName}`,
                'success'
            );
        }
    };

    const handleRemoveLimit = async (staffName: string): Promise<void> => {
        const success = await removeLimit(staffName);
        if (success) {
            showToast(`Đã hủy giới hạn cho nhân viên ${staffName}`, 'success');
        }
    };

    const handleCloseForm = () => {
        setShowCreateForm(false);
        clearError();
    };

    return (
        <div style={{
            padding: '20px',
            maxWidth: '1400px',
            margin: '0 auto'
        }}>
            {/* Page Header */}
            <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                marginBottom: '24px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }}>
                    <div>
                        <h1 style={{
                            margin: '0 0 8px 0',
                            fontSize: '28px',
                            fontWeight: '700',
                            color: '#1f2937'
                        }}>
                            🚫 Quản lý giới hạn nhân viên
                        </h1>
                        <p style={{
                            margin: 0,
                            fontSize: '16px',
                            color: '#6b7280'
                        }}>
                            Thiết lập và quản lý thời gian nhân viên không được phép nhận đơn hàng mới
                        </p>
                    </div>
                    {!showCreateForm && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            style={createButtonStyle('danger')}
                            {...createButtonHoverHandlers('danger')}
                        >
                            ➕ Tạo giới hạn mới
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginTop: '20px'
                }}>
                    <div style={{
                        padding: '16px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px'
                    }}>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#dc2626',
                            marginBottom: '4px'
                        }}>
                            {activeLimits.length}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#991b1b'
                        }}>
                            Nhân viên đang bị giới hạn
                        </div>
                    </div>

                    <div style={{
                        padding: '16px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px'
                    }}>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#16a34a',
                            marginBottom: '4px'
                        }}>
                            {lastUpdated ? new Date(lastUpdated).toLocaleTimeString('vi-VN') : '--:--'}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#15803d'
                        }}>
                            Cập nhật lần cuối
                        </div>
                    </div>

                    <div style={{
                        padding: '16px',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px'
                    }}>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#2563eb',
                            marginBottom: '4px'
                        }}>
                            {user?.username || 'Admin'}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#1d4ed8'
                        }}>
                            Người quản lý
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div style={{
                        marginTop: '16px',
                        padding: '12px 16px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        color: '#dc2626',
                        fontSize: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>⚠️ {error}</span>
                        <button
                            onClick={clearError}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#dc2626',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                            title="Đóng thông báo lỗi"
                        >
                            ✖️
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Grid */}
            <div style={{
                display: 'grid',
                gap: '24px',
                gridTemplateColumns: showCreateForm 
                    ? 'minmax(400px, 1fr) 2fr' 
                    : activeLimits.length > 0 
                        ? '1fr 1fr' 
                        : '1fr'
            }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Create Form */}
                    {showCreateForm && (
                        <StaffLimitForm
                            onSubmit={handleCreateLimit}
                            onCancel={handleCloseForm}
                            submitting={submitting}
                        />
                    )}

                    {/* Staff Status Checker */}
                    <StaffStatusChecker />
                </div>

                {/* Right Column - Active Limits Table */}
                {(activeLimits.length > 0 || loading) && (
                    <div>
                        <ActiveLimitsTable
                            limits={activeLimits}
                            loading={loading}
                            isAdmin={isAdmin}
                            onRemoveLimit={handleRemoveLimit}
                            onRefresh={refreshLimits}
                        />
                    </div>
                )}
            </div>

            {/* Help Section */}
            <div style={{
                marginTop: '32px',
                padding: '20px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
            }}>
                <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937'
                }}>
                    💡 Hướng dẫn sử dụng
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '16px',
                    fontSize: '14px',
                    color: '#6b7280'
                }}>
                    <div>
                        <strong style={{ color: '#374151' }}>🚫 Tạo giới hạn:</strong>
                        <br />
                        Chọn nhân viên và số ngày khóa (1-30 ngày). Nhân viên sẽ không thể nhận đơn hàng mới trong thời gian này.
                    </div>
                    <div>
                        <strong style={{ color: '#374151' }}>🔍 Kiểm tra trạng thái:</strong>
                        <br />
                        Sử dụng công cụ kiểm tra để xem nhân viên có đang bị giới hạn hay không.
                    </div>
                    <div>
                        <strong style={{ color: '#374151' }}>🗑️ Hủy giới hạn:</strong>
                        <br />
                        Nhấn nút "Hủy" trong bảng để hủy giới hạn trước thời hạn.
                    </div>
                    <div>
                        <strong style={{ color: '#374151' }}>🔄 Tự động cập nhật:</strong>
                        <br />
                        Danh sách giới hạn được cập nhật tự động mỗi 30 giây.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffLimitManagement;