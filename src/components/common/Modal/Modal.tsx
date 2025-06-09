// Component Modal để hiển thị popup
// Sử dụng React Portal để render ngoài DOM tree chính

import React from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;                    // Có mở modal hay không
    onClose: () => void;               // Hàm đóng modal
    title: string;                     // Tiêu đề modal
    children: React.ReactNode;         // Nội dung bên trong modal
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    // Nếu modal không mở, không render gì cả
    if (!isOpen) return null;

    // Hàm xử lý click vào overlay để đóng modal
    const handleOverlayClick = (e: React.MouseEvent) => {
        // Chỉ đóng khi click vào overlay, không phải nội dung modal
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Portal cho phép render component này vào body thay vì vị trí hiện tại
    return createPortal(
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body // Render vào body
    );
};

export default Modal;