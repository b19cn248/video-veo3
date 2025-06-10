// Cấu hình Keycloak cho ứng dụng
// Chứa các thông tin kết nối đến Keycloak server

import Keycloak from 'keycloak-js';

// Interface cho cấu hình Keycloak
export interface KeycloakConfig {
    url: string;            // URL của Keycloak server
    realm: string;          // Realm name
    clientId: string;       // Client ID đã tạo trong Keycloak
}

// Cấu hình mặc định cho Keycloak
// Có thể được override bằng environment variables
export const keycloakConfig: KeycloakConfig = {
    url: process.env.REACT_APP_KEYCLOAK_URL || 'https://keycloak.openlearnhub.io.vn/',
    realm: process.env.REACT_APP_KEYCLOAK_REALM || 'OpenLearnHub',
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'video-veo3'
};

// Khởi tạo Keycloak instance
export const keycloak = new Keycloak({
    url: keycloakConfig.url,
    realm: keycloakConfig.realm,
    clientId: keycloakConfig.clientId
});

// Cấu hình cho việc khởi tạo Keycloak
export const keycloakInitOptions = {
    onLoad: 'login-required' as const,     // Force login ngay khi load
    checkLoginIframe: false,               // Không sử dụng iframe check (tránh CORS issues)
    pkceMethod: 'S256' as const,          // Sử dụng PKCE để bảo mật
    flow: 'standard' as const             // Sử dụng authorization code flow
};

// Utility function để kiểm tra token còn hiệu lực không
export const isTokenValid = (): boolean => {
    // Sử dụng Boolean() để convert undefined thành false
    return Boolean(keycloak.authenticated) && !keycloak.isTokenExpired();
};

// Utility function để refresh token nếu cần
export const refreshTokenIfNeeded = async (): Promise<boolean> => {
    // Kiểm tra authenticated trước
    if (!keycloak.authenticated) {
        return false;
    }

    try {
        // Refresh nếu token sắp hết hạn (trong vòng 30 giây)
        if (keycloak.isTokenExpired(30)) {
            const refreshed = await keycloak.updateToken(30);
            console.log('Token refreshed:', refreshed);
            return true;
        }

        // Token vẫn còn hiệu lực
        return true;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        // Token refresh thất bại, redirect về login
        try {
            keycloak.login();
        } catch (loginError) {
            console.error('Failed to redirect to login:', loginError);
        }
        return false;
    }
};