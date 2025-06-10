// React Context để quản lý authentication state toàn ứng dụng
// Cung cấp auth state và các functions cho tất cả components

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, AuthState, UserInfo } from '../services/authService';

// Interface cho AuthContext value
interface AuthContextValue extends AuthState {
    login: () => void;
    logout: () => void;
    refreshToken: () => Promise<boolean>;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    isInitialized: boolean;  // Thêm flag để biết đã khởi tạo xong chưa
}

// Tạo AuthContext với default value
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Props cho AuthProvider
interface AuthProviderProps {
    children: ReactNode;
}

// AuthProvider component để wrap toàn bộ app
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // State quản lý authentication
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        token: null,
        error: null
    });

    // State để track việc khởi tạo Keycloak
    const [isInitialized, setIsInitialized] = useState(false);

    // Effect để khởi tạo authentication khi component mount
    useEffect(() => {
        initializeAuth();
    }, []);

    // Khởi tạo authentication
    const initializeAuth = async () => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            console.log('Initializing Keycloak...');

            // Khởi tạo Keycloak với check-sso
            const authenticated = await AuthService.initialize();

            console.log('Keycloak initialized. Authenticated:', authenticated);

            if (authenticated) {
                // Load user profile và token
                const user = await AuthService.loadUserProfile();
                const token = AuthService.getToken();

                setAuthState({
                    isAuthenticated: true,
                    isLoading: false,
                    user,
                    token,
                    error: null
                });
            } else {
                // Không authenticated nhưng đã khởi tạo xong
                setAuthState({
                    isAuthenticated: false,
                    isLoading: false,
                    user: null,
                    token: null,
                    error: null
                });
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
            setAuthState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                token: null,
                error: error instanceof Error ? error.message : 'Authentication failed'
            });
        } finally {
            // Đánh dấu đã khởi tạo xong
            setIsInitialized(true);
        }
    };

    // Setup event listeners cho Keycloak events
    useEffect(() => {
        if (isInitialized) {
            setupEventListeners();
        }
    }, [isInitialized]);

    // Setup event listeners cho Keycloak events
    const setupEventListeners = () => {
        AuthService.setupEventListeners(
            // onAuthSuccess
            () => {
                console.log('Auth success event triggered');
                updateAuthState();
            },
            // onAuthError
            (error) => {
                console.error('Auth error event:', error);
                setAuthState(prev => ({
                    ...prev,
                    error: 'Authentication error occurred'
                }));
            },
            // onTokenExpired
            () => {
                // Token expired sẽ được handle tự động bởi AuthService
                console.log('Token expired event triggered');
            }
        );
    };

    // Update auth state từ Keycloak
    const updateAuthState = async () => {
        try {
            if (AuthService.isAuthenticated()) {
                const user = await AuthService.loadUserProfile();
                const token = AuthService.getToken();

                setAuthState(prev => ({
                    ...prev,
                    isAuthenticated: true,
                    user,
                    token,
                    error: null
                }));
            } else {
                setAuthState(prev => ({
                    ...prev,
                    isAuthenticated: false,
                    user: null,
                    token: null
                }));
            }
        } catch (error) {
            console.error('Failed to update auth state:', error);
        }
    };

    // Function để login
    const login = () => {
        console.log('Login triggered');
        AuthService.login();
    };

    // Function để logout
    const logout = () => {
        console.log('Logout triggered');
        AuthService.logout();
        setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            token: null,
            error: null
        });
    };

    // Function để refresh token
    const refreshToken = async (): Promise<boolean> => {
        try {
            const token = await AuthService.ensureTokenValid();
            if (token) {
                setAuthState(prev => ({
                    ...prev,
                    token
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    };

    // Function để kiểm tra role
    const hasRole = (role: string): boolean => {
        return AuthService.hasRole(role);
    };

    // Function để kiểm tra multiple roles
    const hasAnyRole = (roles: string[]): boolean => {
        return AuthService.hasAnyRole(roles);
    };

    // Context value
    const contextValue: AuthContextValue = {
        ...authState,
        login,
        logout,
        refreshToken,
        hasRole,
        hasAnyRole,
        isInitialized
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook để sử dụng AuthContext
export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Custom hook để lấy user info
export const useUser = (): UserInfo | null => {
    const { user } = useAuth();
    return user;
};

// Custom hook để kiểm tra authentication status
export const useIsAuthenticated = (): boolean => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated;
};

// Custom hook để kiểm tra quyền admin - THÊM MỚI
export const useIsAdmin = (): boolean => {
    const { user } = useAuth();
    return user?.username === 'admin';
};

// HOC để wrap component cần authentication
export const withAuth = <P extends object>(
    Component: React.ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const { isAuthenticated, isLoading, isInitialized } = useAuth();

        if (!isInitialized || isLoading) {
            return (
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Đang xác thực...</p>
                </div>
            );
        }

        if (!isAuthenticated) {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <h2>Bạn cần đăng nhập để truy cập ứng dụng</h2>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        Đăng nhập
                    </button>
                </div>
            );
        }

        return <Component {...props} />;
    };
};