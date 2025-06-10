// Component để bảo vệ routes
// Không hiển thị custom UI, chỉ loading hoặc render children

import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Loading from '../Loading/Loading';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];           // Các roles cần thiết để truy cập
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                           children,
                                                           requiredRoles = []
                                                       }) => {
    const { isAuthenticated, isLoading, hasAnyRole, user } = useAuth();

    // Hiển thị loading khi đang xác thực
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Loading message="Đang xác thực người dùng..." />
            </div>
        );
    }

    // Nếu chưa authenticate, AuthContext sẽ tự động redirect
    // Chúng ta chỉ hiển thị loading để tránh flash
    if (!isAuthenticated) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Loading message="Đang chuyển hướng đến trang đăng nhập..." />
            </div>
        );
    }

    // Nếu có yêu cầu roles cụ thể, kiểm tra quyền
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '20px',
                background: '#f5f5f5'
            }}>
                <div style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    maxWidth: '500px'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚫</div>
                    <h2 style={{ marginBottom: '16px', color: '#e74c3c' }}>
                        Không có quyền truy cập
                    </h2>
                    <p style={{ marginBottom: '16px', color: '#666' }}>
                        Xin chào <strong>{user?.fullName || user?.username}</strong>,<br/>
                        Bạn không có quyền truy cập vào trang này.
                    </p>
                    <p style={{ marginBottom: '24px', color: '#666', fontSize: '14px' }}>
                        Yêu cầu quyền: {requiredRoles.join(', ')}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => window.history.back()}
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Nếu tất cả điều kiện đều OK, render children
    return <>{children}</>;
};

export default ProtectedRoute;