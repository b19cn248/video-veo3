// Component gốc của ứng dụng
// Chứa layout chính và routing
// Đã được cập nhật để tích hợp Keycloak authentication

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import VideoList from './components/video/VideoList/VideoList';
import VideoDetail from './components/video/VideoDetail/VideoDetail';
import './styles/global.css';

// Component hiển thị header với thông tin user
const AppHeader: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return (
            <header className="header">
                <div className="container">
                    <h1>Hệ thống quản lý Video</h1>
                </div>
            </header>
        );
    }

    return (
        <header className="header">
            <div className="container">
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h1>Hệ thống quản lý Video</h1>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        {/* Thông tin user */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: '#f8f9fa',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#3498db',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>
                                {user?.fullName?.charAt(0)?.toUpperCase() ||
                                    user?.username?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <div style={{
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: '#2c3e50'
                                }}>
                                    {user?.fullName || user?.username || 'User'}
                                </div>
                                {user?.email && (
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#666'
                                    }}>
                                        {user.email}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Nút đăng xuất */}
                        <button
                            onClick={logout}
                            className="btn btn-secondary"
                            style={{
                                fontSize: '14px',
                                padding: '8px 16px'
                            }}
                            title="Đăng xuất"
                        >
                            🚪 Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

// Component chính của app với routes
const AppRoutes: React.FC = () => {
    return (
        <div className="App">
            {/* Header */}
            <AppHeader />

            {/* Main Content */}
            <main className="container">
                <Routes>
                    {/* Route mặc định redirect đến danh sách video */}
                    <Route path="/" element={<Navigate to="/videos" replace />} />

                    {/* Route danh sách video - được bảo vệ */}
                    <Route
                        path="/videos"
                        element={
                            <ProtectedRoute>
                                <VideoList />
                            </ProtectedRoute>
                        }
                    />

                    {/* Route chi tiết video - được bảo vệ */}
                    <Route
                        path="/videos/:id"
                        element={
                            <ProtectedRoute>
                                <VideoDetail />
                            </ProtectedRoute>
                        }
                    />

                    {/* Route cho trường hợp không có quyền */}
                    <Route
                        path="/unauthorized"
                        element={
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '60vh',
                                textAlign: 'center'
                            }}>
                                <div>
                                    <h2>Không có quyền truy cập</h2>
                                    <p>Bạn không có quyền truy cập vào trang này.</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => window.history.back()}
                                    >
                                        Quay lại
                                    </button>
                                </div>
                            </div>
                        }
                    />

                    {/* Route 404 */}
                    <Route
                        path="*"
                        element={
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '60vh',
                                textAlign: 'center'
                            }}>
                                <div>
                                    <h2>Trang không tồn tại</h2>
                                    <p>Đường dẫn bạn truy cập không tồn tại.</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => window.location.href = '/videos'}
                                    >
                                        Về trang chủ
                                    </button>
                                </div>
                            </div>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
};

// Component App chính với AuthProvider wrapper
const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
};

export default App;