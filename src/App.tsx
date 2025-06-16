// Component gốc của ứng dụng
// Chứa layout chính và routing
// Đã được cập nhật để tích hợp Keycloak authentication
// UPDATED: Cho phép tất cả user xem Staff Salaries, không chỉ admin

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import VideoList from './components/video/VideoList/VideoList';
import VideoDetail from './components/video/VideoDetail/VideoDetail';
import StaffSalaries from './components/staff/StaffSalaries/StaffSalaries';
import SalesSalaries from './components/sales/SalesSalaries/SalesSalaries';
import NotificationBell from './components/common/NotificationBell';
import NotificationPage from './components/notification/NotificationPage';
import './styles/global.css';

// Component hiển thị header với thông tin user và navigation
const AppHeader: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return (
            <header className="header">
                <div className="container">
                    <h1>Hệ thống quản lý Video</h1>
                </div>
            </header>
        );
    }

    // Kiểm tra trang hiện tại để highlight navigation
    const isVideosPage = location.pathname.startsWith('/videos');
    const isStaffSalariesPage = location.pathname === '/staff-salaries';
    const isSalesSalariesPage = location.pathname === '/sales-salaries';

    return (
        <header className="header">
            <div className="container">
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {/* Logo và Navigation */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '40px'
                    }}>
                        <h1 style={{ margin: 0 }}>Hệ thống quản lý Video</h1>

                        {/* Navigation Menu */}
                        <nav style={{
                            display: 'flex',
                            gap: '20px'
                        }}>
                            <a
                                href="/videos"
                                style={{
                                    textDecoration: 'none',
                                    color: isVideosPage ? '#3b82f6' : '#6b7280',
                                    fontWeight: isVideosPage ? '600' : '500',
                                    fontSize: '15px',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    background: isVideosPage ? '#eff6ff' : 'transparent',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isVideosPage) {
                                        e.currentTarget.style.color = '#374151';
                                        e.currentTarget.style.background = '#f3f4f6';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isVideosPage) {
                                        e.currentTarget.style.color = '#6b7280';
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                🎥 Quản lý Video
                            </a>

                            {/* UPDATED: Staff Salaries - hiển thị cho TẤT CẢ user */}
                            <a
                                href="/staff-salaries"
                                style={{
                                    textDecoration: 'none',
                                    color: isStaffSalariesPage ? '#3b82f6' : '#6b7280',
                                    fontWeight: isStaffSalariesPage ? '600' : '500',
                                    fontSize: '15px',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    background: isStaffSalariesPage ? '#eff6ff' : 'transparent',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isStaffSalariesPage) {
                                        e.currentTarget.style.color = '#374151';
                                        e.currentTarget.style.background = '#f3f4f6';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isStaffSalariesPage) {
                                        e.currentTarget.style.color = '#6b7280';
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                💰 Lương nhân viên
                            </a>

                            {/* NEW: Sales Salaries - chỉ hiển thị cho ADMIN */}
                            {user?.roles && user.roles.some((role: string) => role.toLowerCase().includes('admin')) && (
                                <a
                                    href="/sales-salaries"
                                    style={{
                                        textDecoration: 'none',
                                        color: isSalesSalariesPage ? '#3b82f6' : '#6b7280',
                                        fontWeight: isSalesSalariesPage ? '600' : '500',
                                        fontSize: '15px',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        background: isSalesSalariesPage ? '#eff6ff' : 'transparent',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSalesSalariesPage) {
                                            e.currentTarget.style.color = '#374151';
                                            e.currentTarget.style.background = '#f3f4f6';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSalesSalariesPage) {
                                            e.currentTarget.style.color = '#6b7280';
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    💼 Lương Sales
                                </a>
                            )}
                        </nav>
                    </div>

                    {/* User Info, Notifications và Logout */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        {/* Notification Bell */}
                        <NotificationBell />

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

                    {/* UPDATED: Route lương nhân viên - cho TẤT CẢ user, không chỉ admin */}
                    <Route
                        path="/staff-salaries"
                        element={
                            <ProtectedRoute>
                                <StaffSalaries />
                            </ProtectedRoute>
                        }
                    />

                    {/* NEW: Route lương sales - chỉ cho ADMIN */}
                    <Route
                        path="/sales-salaries"
                        element={
                            <ProtectedRoute requiredRoles={['admin']}>
                                <SalesSalaries />
                            </ProtectedRoute>
                        }
                    />

                    {/* NEW: Route notifications - cho TẤT CẢ user */}
                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <NotificationPage />
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

// Component App chính với AuthProvider và NotificationProvider wrapper
const App: React.FC = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </NotificationProvider>
        </AuthProvider>
    );
};

export default App;