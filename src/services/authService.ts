// Service quản lý authentication với Keycloak
// Cung cấp các hàm tiện ích để làm việc với authentication

import { keycloak, keycloakInitOptions, refreshTokenIfNeeded } from '../utils/authConfig';

// Interface cho thông tin user
export interface UserInfo {
    id: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    roles: string[];
}

// Interface cho auth state
export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserInfo | null;
    token: string | null;
    error: string | null;
}

export class AuthService {

    // Khởi tạo Keycloak và kiểm tra authentication
    static async initialize(): Promise<boolean> {
        try {
            console.log('Initializing Keycloak...');
            const authenticated = await keycloak.init(keycloakInitOptions);

            if (authenticated) {
                console.log('User authenticated successfully');
                // Load user profile nếu authenticated
                await this.loadUserProfile();
                return true;
            } else {
                console.log('User not authenticated');
                return false;
            }
        } catch (error) {
            console.error('Keycloak initialization failed:', error);
            throw new Error('Failed to initialize authentication');
        }
    }

    // Load thông tin profile của user
    static async loadUserProfile(): Promise<UserInfo | null> {
        try {
            if (!keycloak.authenticated) {
                return null;
            }

            const profile = await keycloak.loadUserProfile();
            const tokenParsed = keycloak.tokenParsed;

            const userInfo: UserInfo = {
                id: profile.id || tokenParsed?.sub || '',
                username: profile.username || tokenParsed?.preferred_username || '',
                email: profile.email || tokenParsed?.email || '',
                firstName: profile.firstName || tokenParsed?.given_name || '',
                lastName: profile.lastName || tokenParsed?.family_name || '',
                fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
                roles: this.getUserRoles()
            };

            return userInfo;
        } catch (error) {
            console.error('Failed to load user profile:', error);
            return null;
        }
    }

    // Lấy danh sách roles của user
    static getUserRoles(): string[] {
        if (!keycloak.authenticated || !keycloak.tokenParsed) {
            return [];
        }

        const tokenParsed = keycloak.tokenParsed;
        const realmRoles = tokenParsed.realm_access?.roles || [];

        // Safely access resource_access với optional chaining
        const clientId = keycloak.clientId;
        const resourceRoles = clientId && tokenParsed.resource_access?.[clientId]?.roles || [];

        return [...realmRoles, ...resourceRoles];
    }

    // Kiểm tra user có role cụ thể hay không
    static hasRole(role: string): boolean {
        const roles = this.getUserRoles();
        return roles.includes(role);
    }

    // Kiểm tra user có bất kỳ role nào trong danh sách hay không
    static hasAnyRole(roles: string[]): boolean {
        const userRoles = this.getUserRoles();
        return roles.some(role => userRoles.includes(role));
    }

    // Lấy access token hiện tại
    static getToken(): string | null {
        if (!keycloak.authenticated) {
            return null;
        }
        return keycloak.token || null;
    }

    // Lấy refresh token
    static getRefreshToken(): string | null {
        if (!keycloak.authenticated) {
            return null;
        }
        return keycloak.refreshToken || null;
    }

    // Refresh token nếu cần thiết
    static async ensureTokenValid(): Promise<string | null> {
        const isValid = await refreshTokenIfNeeded();
        if (!isValid) {
            return null;
        }
        return this.getToken();
    }

    // Đăng xuất
    static logout(): void {
        keycloak.logout({
            redirectUri: window.location.origin
        });
    }

    // Đăng nhập (redirect đến Keycloak)
    static login(): void {
        keycloak.login();
    }

    // Kiểm tra trạng thái authenticated
    static isAuthenticated(): boolean {
        return Boolean(keycloak.authenticated);
    }

    // Lấy thời gian hết hạn của token (timestamp)
    static getTokenExpiration(): number | null {
        if (!keycloak.authenticated || !keycloak.tokenParsed) {
            return null;
        }
        return keycloak.tokenParsed.exp ? keycloak.tokenParsed.exp * 1000 : null;
    }

    // Kiểm tra token có sắp hết hạn không (trong vòng X giây)
    static isTokenExpiringSoon(thresholdSeconds: number = 30): boolean {
        const expiration = this.getTokenExpiration();
        if (!expiration) return false;

        const now = Date.now();
        const timeUntilExpiry = expiration - now;
        return timeUntilExpiry <= (thresholdSeconds * 1000);
    }

    // Register event listeners cho Keycloak events
    static setupEventListeners(
        onAuthSuccess?: () => void,
        onAuthError?: (error: any) => void,
        onTokenExpired?: () => void
    ): void {
        keycloak.onAuthSuccess = () => {
            console.log('Authentication successful');
            onAuthSuccess?.();
        };

        keycloak.onAuthError = (error) => {
            console.error('Authentication error:', error);
            onAuthError?.(error);
        };

        keycloak.onTokenExpired = () => {
            console.log('Token expired, attempting refresh...');
            onTokenExpired?.();
            // Auto refresh token khi expired
            this.ensureTokenValid();
        };

        keycloak.onAuthRefreshSuccess = () => {
            console.log('Token refreshed successfully');
        };

        keycloak.onAuthRefreshError = () => {
            console.error('Token refresh failed, redirecting to login...');
            this.login();
        };

        keycloak.onAuthLogout = () => {
            console.log('User logged out');
        };
    }
}