// Component form để tạo mới hoặc sửa video
// UPDATED: Thêm tính năng kiểm tra khách hàng trùng lặp khi tạo mới
// Sử dụng debounced API call để cảnh báo khi customer name đã tồn tại

import React, { useState, useEffect } from 'react';
import { VideoFormData, Video, VideoStatus, DeliveryStatus, PaymentStatus } from '../../../types/video.types';
import { useAuth } from '../../../contexts/AuthContext';
import { useCustomerCheck } from '../hooks/useCustomerCheck';
import CustomerWarning from '../components/CustomerWarning';

interface VideoFormProps {
    video?: Video;                              // Video để edit (undefined nếu tạo mới)
    onSubmit: (data: VideoFormData) => void;    // Hàm gọi khi submit form
    onCancel: () => void;                       // Hàm gọi khi hủy
    isLoading?: boolean;                        // Có đang loading không
    isAdmin: boolean;                           // Kiểm tra quyền admin
}

// Các options thời lượng video cố định (tính bằng giây)
const VIDEO_DURATION_OPTIONS = [
    { value: 8, label: '8 giây' },
    { value: 16, label: '16 giây' },
    { value: 24, label: '24 giây' },
    { value: 32, label: '32 giây' },
    { value: 40, label: '40 giây' }
];

const VideoForm: React.FC<VideoFormProps> = ({ video, onSubmit, onCancel, isLoading = false, isAdmin }) => {
    // Get current user info từ AuthContext
    const { user } = useAuth();

    // NEW: Customer check hook để kiểm tra khách hàng trùng lặp
    const {
        checkingCustomer,
        customerExists,
        customerWarning,
        checkCustomer,
        clearCheck
    } = useCustomerCheck();

    // useState hook để quản lý state của form
    const [formData, setFormData] = useState<VideoFormData>({
        customerName: '',
        videoContent: '',
        imageUrl: '',
        billImageUrl: '', // URL hình ảnh thanh toán
        linkfb: '', // NEW: Link Facebook
        phoneNumber: '', // NEW: Số điện thoại
        videoDuration: 8, // Mặc định là 8 giây
        deliveryTime: '',
        assignedStaff: '',
        status: VideoStatus.CHUA_AI_NHAN,
        videoUrl: '',
        completedTime: '',
        customerApproved: false,
        customerNote: '',
        checked: false,
        deliveryStatus: DeliveryStatus.CHUA_GUI,
        paymentStatus: PaymentStatus.CHUA_THANH_TOAN,
        paymentDate: '',
        orderValue: 0
    });

    // useEffect hook chạy khi component mount hoặc video prop thay đổi
    useEffect(() => {
        if (video) {
            setFormData({
                customerName: video.customerName,
                videoContent: video.videoContent || '',
                imageUrl: video.imageUrl || '',
                billImageUrl: video.billImageUrl || '', // URL hình ảnh thanh toán
                linkfb: video.linkfb || '', // NEW: Link Facebook
                phoneNumber: video.phoneNumber || '', // NEW: Số điện thoại
                videoDuration: video.videoDuration || 8,
                deliveryTime: video.deliveryTime || '',
                assignedStaff: video.assignedStaff || '',
                status: video.status,
                videoUrl: video.videoUrl || '',
                completedTime: video.completedTime || '',
                customerApproved: video.customerApproved || false,
                customerNote: video.customerNote || '',
                checked: video.checked || false,
                deliveryStatus: video.deliveryStatus,
                paymentStatus: video.paymentStatus,
                paymentDate: video.paymentDate || '',
                orderValue: video.orderValue || 0
            });
        }
    }, [video]);

    // NEW: Enhanced handleInputChange với customer check
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Xử lý checkbox khác với input thường
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else if (type === 'number' || name === 'videoDuration') {
            // Convert string to number cho các field số
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? 0 : parseInt(value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));

            // NEW: Trigger customer check khi customer name thay đổi và đang tạo mới
            if (name === 'customerName' && !video && isAdmin) {
                if (value.trim().length >= 2) {
                    checkCustomer(value);
                } else {
                    clearCheck();
                }
            }
        }
    };

    // Hàm xử lý submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // Helper function để hiển thị customer input với loading indicator
    const renderCustomerInput = () => (
        <div style={{ position: 'relative' }}>
            <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="form-input"
                required
                disabled={isLoading}
                style={{
                    paddingRight: checkingCustomer ? '40px' : '12px'
                }}
            />
            
            {/* Loading indicator for customer check */}
            {checkingCustomer && (
                <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '16px',
                    height: '16px',
                    border: '2px solid #e5e7eb',
                    borderTop: '2px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
            )}
        </div>
    );

    return (
        <form onSubmit={handleSubmit}>
            {/* Thông tin khách hàng - chỉ hiển thị cho admin */}
            {isAdmin && (
                <div className="form-group">
                    <label className="form-label">Tên khách hàng *</label>
                    {renderCustomerInput()}
                    
                    {/* NEW: Customer warning component */}
                    <CustomerWarning
                        customerWarning={customerWarning}
                        isVisible={!video && customerExists === true} // Chỉ hiển thị khi tạo mới và customer tồn tại
                        onDismiss={clearCheck}
                    />
                </div>
            )}

            <div className="form-group">
                <label className="form-label">Nội dung video</label>
                <textarea
                    name="videoContent"
                    value={formData.videoContent}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows={3}
                    disabled={isLoading}
                />
            </div>

            <div className="form-group">
                <label className="form-label">URL hình ảnh</label>
                <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={isLoading}
                />
            </div>

            <div className="form-group">
                <label className="form-label">URL hình ảnh thanh toán</label>
                <input
                    type="url"
                    name="billImageUrl"
                    value={formData.billImageUrl}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={isLoading}
                    placeholder="Nhập URL hình ảnh hóa đơn/thanh toán"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Link Facebook</label>
                <input
                    type="url"
                    name="linkfb"
                    value={formData.linkfb}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={isLoading}
                    placeholder="Nhập link Facebook của khách hàng"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={isLoading}
                    placeholder="Nhập số điện thoại khách hàng"
                    pattern="[0-9+()-\s]*"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Thời lượng video</label>
                <select
                    name="videoDuration"
                    value={formData.videoDuration}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={isLoading}
                    required
                >
                    {VIDEO_DURATION_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Ghi chú khách hàng - chỉ hiển thị cho admin */}
            {isAdmin && (
                <div className="form-group">
                    <label className="form-label">Ghi chú khách hàng</label>
                    <textarea
                        name="customerNote"
                        value={formData.customerNote}
                        onChange={handleInputChange}
                        className="form-textarea"
                        rows={2}
                        disabled={isLoading}
                    />
                </div>
            )}

            <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="checkbox"
                        name="checked"
                        checked={formData.checked}
                        onChange={handleInputChange}
                        disabled={isLoading}
                    />
                    Đã kiểm tra
                </label>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-secondary"
                    disabled={isLoading}
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? 'Đang xử lý...' : (video ? 'Cập nhật' : 'Tạo mới')}
                </button>
            </div>
        </form>
    );
};

export default VideoForm;