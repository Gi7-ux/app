
import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_ROLE_KEY = "user_role";

export class AuthService {
    /**
     * Wrapper for fetch that automatically refreshes token on 401 and retries once.
     * @param {string} url
     * @param {object} options
     * @returns {Promise<Response>}
     */
    static async fetchWithAuth(url, options = {}) {
        let token = this.getAccessToken();
        if (!options.headers) {
            options.headers = {};
        }
        options.headers['Authorization'] = `Bearer ${token}`;
        let response = await fetch(url, options);
        if (response.status === 401) {
            try {
                token = await this.refreshToken();
                options.headers['Authorization'] = `Bearer ${token}`;
                response = await fetch(url, options);
            } catch (err) {
                // If refresh fails, logout and propagate error
                await this.logout();
                throw err;
            }
        }
        return response;
    }
    static login(accessToken, refreshToken, role) {
        // Store access and refresh tokens in localStorage for persistence across page reloads
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
        localStorage.setItem(USER_ROLE_KEY, role);
    }

    static getAccessToken() {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    static getUserId() {
        const token = this.getAccessToken();
        if (!token) {
            return null;
        }
        try {
            const decoded = jwtDecode(token);
            // Adjust claim name as needed (sub, user_id, id)
            return decoded.sub || decoded.user_id || decoded.id || null;
        } catch (e) {
            console.error('Error decoding token for user ID:', e);
            return null;
        }
    }

    static getRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    static isAuthenticated() {
        const token = this.getAccessToken();
        if (!token) {
            return false;
        }
        try {
            const decodedToken = jwtDecode(token);
            // Check if token is expired
            return decodedToken.exp * 1000 > Date.now();
        } catch (e) {
            console.error("Error decoding token:", e);
            return false;
        }
    }

    static async logout() {
        // Clear tokens from localStorage
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(USER_ROLE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);

        // Call backend endpoint to invalidate the refresh token on the server
        try {
            await fetch("/api/auth/logout.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // No need to send refresh_token in body, as it's in HttpOnly cookie
            });
        } catch (error) {
            console.error("Error during server-side logout:", error);
            // Continue with client-side logout even if server-side fails
        }
    }

    static getRole() {
        return localStorage.getItem(USER_ROLE_KEY);
    }

    static async refreshToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error("Refresh token is required.");
        }
        try {
            const response = await fetch("/api/auth/refresh.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            const data = await response.json();

            if (response.ok) {
                // Backend should return new access token and new refresh token
                this.login(data.access_token, data.refresh_token, data.role);
                return data.access_token;
            } else {
                // If refresh fails (e.g. token revoked, expired), logout user
                this.logout();
                throw new Error(data.message || "Failed to refresh token.");
            }
        } catch (error) {
            console.error("Error during token refresh:", error);
            this.logout(); // Ensure logout on any error during refresh
            throw error; // Re-throw to be caught by API service or caller
        }
    }
}
