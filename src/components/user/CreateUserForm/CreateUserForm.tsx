// CreateUserForm Component
// Form for creating new users with validation

import React, { useState } from 'react';
import { CreateUserRequest, UserRole } from '../../../types/user.types';
import { UserService } from '../../../services/userService';

interface CreateUserFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

interface FormData {
    username: string;
    fullname: string;
    role: UserRole | '';
}

interface FormErrors {
    username?: string;
    fullname?: string;
    role?: string;
    submit?: string;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<FormData>({
        username: '',
        fullname: '',
        role: ''
    });
    
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Username validation
        const usernameError = UserService.validateUsername(formData.username);
        if (usernameError) {
            newErrors.username = usernameError;
        }

        // Full name validation
        const fullnameError = UserService.validateFullname(formData.fullname);
        if (fullnameError) {
            newErrors.fullname = fullnameError;
        }

        // Role validation
        if (!formData.role) {
            newErrors.role = 'Please select a role';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const userData: CreateUserRequest = {
                username: formData.username.trim(),
                fullname: formData.fullname.trim(),
                role: formData.role as UserRole
            };

            await UserService.createUser(userData);
            onSuccess();
        } catch (error) {
            setErrors({
                submit: error instanceof Error ? error.message : 'Failed to create user'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: 'white'
    };

    const errorInputStyle = {
        ...inputStyle,
        borderColor: '#ef4444'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '6px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151'
    };

    const errorStyle = {
        color: '#ef4444',
        fontSize: '12px',
        marginTop: '4px'
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: '0' }}>
            {/* Username Field */}
            <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>
                    Username *
                </label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    style={errors.username ? errorInputStyle : inputStyle}
                    placeholder="Enter username (no spaces)"
                    disabled={isSubmitting}
                />
                {errors.username && (
                    <div style={errorStyle}>{errors.username}</div>
                )}
            </div>

            {/* Full Name Field */}
            <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>
                    Full Name *
                </label>
                <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    style={errors.fullname ? errorInputStyle : inputStyle}
                    placeholder="Enter full name (at least 2 words)"
                    disabled={isSubmitting}
                />
                {errors.fullname && (
                    <div style={errorStyle}>{errors.fullname}</div>
                )}
            </div>

            {/* Role Field */}
            <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>
                    Role *
                </label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    style={errors.role ? errorInputStyle : inputStyle}
                    disabled={isSubmitting}
                >
                    <option value="">Select a role</option>
                    <option value={UserRole.SALE}>SALE (Admin permissions)</option>
                    <option value={UserRole.EDITOR}>EDITOR (User permissions)</option>
                </select>
                {errors.role && (
                    <div style={errorStyle}>{errors.role}</div>
                )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
                <div style={{
                    ...errorStyle,
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '20px'
                }}>
                    {errors.submit}
                </div>
            )}

            {/* Info Note */}
            <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '20px',
                fontSize: '12px',
                color: '#1e40af'
            }}>
                ℹ️ Default password is <strong>1234</strong>. User must change password on first login.
            </div>

            {/* Action Buttons */}
            <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
            }}>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    style={{
                        padding: '10px 20px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#374151',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                        color: 'white',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    {isSubmitting ? '⏳ Creating...' : '✓ Create User'}
                </button>
            </div>
        </form>
    );
};

export default CreateUserForm;