// CreateUserModal Component
// Modal wrapper for CreateUserForm

import React, { useState } from 'react';
import Modal from '../../common/Modal/Modal';
import CreateUserForm from '../CreateUserForm/CreateUserForm';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ 
    isOpen, 
    onClose, 
    onUserCreated 
}) => {
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSuccess = () => {
        setShowSuccess(true);
        // Auto-close success message and modal after 2 seconds
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
            onUserCreated();
        }, 2000);
    };

    const handleClose = () => {
        setShowSuccess(false);
        onClose();
    };

    if (showSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title="✅ Success">
                <div style={{
                    textAlign: 'center',
                    padding: '40px 20px'
                }}>
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '16px'
                    }}>
                        ✅
                    </div>
                    <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#059669',
                        marginBottom: '8px'
                    }}>
                        User Created Successfully!
                    </div>
                    <div style={{
                        fontSize: '14px',
                        color: '#6b7280'
                    }}>
                        The user has been created with default password <strong>1234</strong>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            title="👤 Create New User"
        >
            <CreateUserForm 
                onSuccess={handleSuccess}
                onCancel={handleClose}
            />
        </Modal>
    );
};

export default CreateUserModal;