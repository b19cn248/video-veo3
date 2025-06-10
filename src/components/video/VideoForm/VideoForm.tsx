// Component form để tạo mới hoặc sửa video
// Sử dụng useState để quản lý state của form
// Cập nhật với quyền admin để ẩn/hiện thông tin khách hàng

import React, { useState, useEffect } from 'react';
import { VideoFormData, Video, VideoStatus, DeliveryStatus, PaymentStatus } from '../../../types/video.types';
import { formatVideoStatus, formatDeliveryStatus, formatPaymentStatus } from '../../../utils/formatters';

interface VideoFormProps {
    video?: Video;                              // Video để edit (undefined nếu tạo mới)
    onSubmit: (data: VideoFormData) => void;    // Hàm gọi khi submit form
    onCancel: () => void;                       // Hàm gọi khi hủy
    isLoading?: boolean;                        // Có đang loading không
    isAdmin: boolean;                           // Kiểm tra quyền admin
}

// const STAFF_LIST = ["Hiếu", "Đăng", "Công", "Khánh", "Cường"];
const STAFF_LIST = ["Nguyen Hong", "Nguyen Dung Tuan", "Nguyen Huu Duc", "Duc Anh"];

// Các options thời lượng video cố định (tính bằng giây)
const VIDEO_DURATION_OPTIONS = [
    { value: 8, label: '8 giây' },
    { value: 16, label: '16 giây' },
    { value: 24, label: '24 giây' },
    { value: 32, label: '32 giây' }
];

const VideoForm: React.FC<VideoFormProps> = ({ video, onSubmit, onCancel, isLoading = false, isAdmin }) => {
    // useState hook để quản lý state của form
    // FormData chứa tất cả dữ liệu form
    const [formData, setFormData] = useState<VideoFormData>({
        customerName: '',
        videoContent: '',
        imageUrl: '',
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
    // Nếu có video (edit mode), fill dữ liệu vào form
    useEffect(() => {
        if (video) {
            setFormData({
                customerName: video.customerName,
                videoContent: video.videoContent || '',
                imageUrl: video.imageUrl || '',
                videoDuration: video.videoDuration || 8, // Đảm bảo có giá trị mặc định
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

    // Hàm xử lý khi input thay đổi
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
        }
    };

    // Hàm xử lý submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn form reload trang
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Thông tin khách hàng - chỉ hiển thị cho admin */}
            {isAdmin && (
                <div className="form-group">
                    <label className="form-label">Tên khách hàng *</label>
                    <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                        disabled={isLoading}
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

            {/* Thông tin quy trình */}
            <div className="form-group">
                <label className="form-label">Thời gian giao hàng</label>
                <input
                    type="datetime-local"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={isLoading}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Nhân viên được giao</label>
                <select
                    name="assignedStaff"
                    value={formData.assignedStaff}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={isLoading}
                >
                    <option value="">-- Chọn nhân viên --</option>
                    {STAFF_LIST.map(staff => (
                        <option key={staff} value={staff}>{staff}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={isLoading}
                >
                    {Object.values(VideoStatus).map(status => (
                        <option key={status} value={status}>
                            {formatVideoStatus(status)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">URL video</label>
                <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={isLoading}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Thời gian hoàn thành</label>
                <input
                    type="datetime-local"
                    name="completedTime"
                    value={formData.completedTime}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={isLoading}
                />
            </div>

            {/* Checkbox fields */}
            <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="checkbox"
                        name="customerApproved"
                        checked={formData.customerApproved}
                        onChange={handleInputChange}
                        disabled={isLoading}
                    />
                    Khách hàng đã duyệt
                </label>
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

            {/* Thông tin giao hàng và thanh toán */}
            <div className="form-group">
                <label className="form-label">Trạng thái giao hàng</label>
                <select
                    name="deliveryStatus"
                    value={formData.deliveryStatus}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={isLoading}
                >
                    {Object.values(DeliveryStatus).map(status => (
                        <option key={status} value={status}>
                            {formatDeliveryStatus(status)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Trạng thái thanh toán</label>
                <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={isLoading}
                >
                    {Object.values(PaymentStatus).map(status => (
                        <option key={status} value={status}>
                            {formatPaymentStatus(status)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Ngày thanh toán</label>
                <input
                    type="datetime-local"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={isLoading}
                />
            </div>

            {/* Giá trị đơn hàng - chỉ hiển thị cho admin */}
            {isAdmin && (
                <div className="form-group">
                    <label className="form-label">Giá trị đơn hàng</label>
                    <input
                        type="number"
                        name="orderValue"
                        value={formData.orderValue}
                        onChange={handleInputChange}
                        className="form-input"
                        disabled={isLoading}
                        min="0"
                        step="1000"
                    />
                </div>
            )}

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