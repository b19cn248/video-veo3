// Staff Limit Form Component
// Form để tạo giới hạn mới cho nhân viên (Admin only)

import React, { useState, useEffect } from 'react';
import { StaffLimitFormData, StaffLimitFormErrors } from '../../../types/staffLimit.types';
import { VideoService } from '../../../services/videoService';
import { StaffLimitService } from '../../../services/staffLimitService';
import {
    createButtonStyle,
    createButtonHoverHandlers,
    createFilterInputStyle,
    createInputFocusHandlers,
    showToast
} from '../../video/VideoList/utils/videoListHelpers';

interface StaffLimitFormProps {
    onSubmit: (data: StaffLimitFormData) => Promise<void>;
    onCancel: () => void;
    submitting: boolean;
}

const StaffLimitForm: React.FC<StaffLimitFormProps> = ({
    onSubmit,
    onCancel,
    submitting
}) => {
    const [formData, setFormData] = useState<StaffLimitFormData>({
        staffName: '',
        lockDays: 1,
        maxOrdersPerDay: 3
    });

    const [errors, setErrors] = useState<StaffLimitFormErrors>({});
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
                console.warn('Failed to load staff list:', response.message);
                setStaffList([]);
            }
        } catch (error) {
            console.error('Error loading staff list:', error);
            showToast('Không thể tải danh sách nhân viên', 'error');
            setStaffList([]);
        } finally {
            setLoadingStaff(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: StaffLimitFormErrors = {};

        // Validate staff name
        if (!formData.staffName.trim()) {
            newErrors.staffName = 'Vui lòng chọn nhân viên';
        }

        // Validate lock days
        if (!formData.lockDays || formData.lockDays < 1 || formData.lockDays > 30) {
            newErrors.lockDays = 'Số ngày khóa phải từ 1 đến 30';
        }

        if (!Number.isInteger(formData.lockDays)) {
            newErrors.lockDays = 'Số ngày khóa phải là số nguyên';
        }

        // Validate maxOrdersPerDay
        if (formData.maxOrdersPerDay !== undefined) {
            if (formData.maxOrdersPerDay < 1 || formData.maxOrdersPerDay > 50) {
                newErrors.maxOrdersPerDay = 'Số đơn tối đa trong ngày phải từ 1 đến 50';
            }

            if (!Number.isInteger(formData.maxOrdersPerDay)) {
                newErrors.maxOrdersPerDay = 'Số đơn tối đa trong ngày phải là số nguyên';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit(formData);
            // Reset form after successful submission
            setFormData({ staffName: '', lockDays: 1, maxOrdersPerDay: 3 });
            setErrors({});
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    const handleInputChange = (field: keyof StaffLimitFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
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
                    🚫 Tạo giới hạn nhân viên
                </h3>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{
                    display: 'grid',
                    gap: '20px',
                    marginBottom: '24px'
                }}>
                    {/* Staff Name Selection */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>
                            👤 Chọn nhân viên *
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
                            value={formData.staffName}
                            onChange={(e) => handleInputChange('staffName', e.target.value)}
                            disabled={loadingStaff || submitting}
                            style={{
                                ...createFilterInputStyle(loadingStaff || submitting),
                                ...(errors.staffName && { borderColor: '#ef4444' })
                            }}
                            {...createInputFocusHandlers(loadingStaff || submitting)}
                        >
                            <option value="">-- Chọn nhân viên --</option>
                            {staffList.map(staff => (
                                <option key={staff} value={staff}>
                                    {staff}
                                </option>
                            ))}
                        </select>
                        {errors.staffName && (
                            <div style={{
                                color: '#ef4444',
                                fontSize: '12px',
                                marginTop: '4px'
                            }}>
                                {errors.staffName}
                            </div>
                        )}
                    </div>

                    {/* Lock Days Input */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>
                            📅 Số ngày khóa * (1-30 ngày)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={formData.lockDays}
                            onChange={(e) => handleInputChange('lockDays', parseInt(e.target.value) || 1)}
                            disabled={submitting}
                            placeholder="Nhập số ngày khóa..."
                            style={{
                                ...createFilterInputStyle(submitting),
                                ...(errors.lockDays && { borderColor: '#ef4444' })
                            }}
                            {...createInputFocusHandlers(submitting)}
                        />
                        {errors.lockDays && (
                            <div style={{
                                color: '#ef4444',
                                fontSize: '12px',
                                marginTop: '4px'
                            }}>
                                {errors.lockDays}
                            </div>
                        )}
                        <div style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginTop: '4px'
                        }}>
                            Nhân viên sẽ không thể nhận đơn hàng mới trong thời gian này
                        </div>
                    </div>

                    {/* Max Orders Per Day Input */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>
                            📊 Số đơn tối đa/ngày (1-50 đơn) - Mặc định: 3
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={formData.maxOrdersPerDay || 3}
                            onChange={(e) => handleInputChange('maxOrdersPerDay', parseInt(e.target.value) || 3)}
                            disabled={submitting}
                            placeholder="Nhập số đơn tối đa trong một ngày..."
                            style={{
                                ...createFilterInputStyle(submitting),
                                ...(errors.maxOrdersPerDay && { borderColor: '#ef4444' })
                            }}
                            {...createInputFocusHandlers(submitting)}
                        />
                        {errors.maxOrdersPerDay && (
                            <div style={{
                                color: '#ef4444',
                                fontSize: '12px',
                                marginTop: '4px'
                            }}>
                                {errors.maxOrdersPerDay}
                            </div>
                        )}
                        <div style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginTop: '4px'
                        }}>
                            Giới hạn số đơn hàng nhân viên có thể nhận trong một ngày (để trống sẽ dùng mặc định 3 đơn)
                        </div>
                    </div>

                    {/* General Error */}
                    {errors.general && (
                        <div style={{
                            padding: '12px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            color: '#dc2626',
                            fontSize: '14px'
                        }}>
                            {errors.general}
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={submitting}
                        style={{
                            ...createButtonStyle('secondary'),
                            opacity: submitting ? 0.6 : 1,
                            cursor: submitting ? 'not-allowed' : 'pointer'
                        }}
                        {...(!submitting && createButtonHoverHandlers('secondary'))}
                    >
                        ✖️ Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || loadingStaff}
                        style={{
                            ...createButtonStyle('danger'),
                            opacity: (submitting || loadingStaff) ? 0.6 : 1,
                            cursor: (submitting || loadingStaff) ? 'not-allowed' : 'pointer'
                        }}
                        {...(!(submitting || loadingStaff) && createButtonHoverHandlers('danger'))}
                    >
                        {submitting ? '⏳ Đang xử lý...' : '🚫 Tạo giới hạn'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StaffLimitForm;