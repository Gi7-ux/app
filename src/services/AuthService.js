
import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_KEY = "access_token";
const USER_ROLE_KEY = "user_role";

export class AuthService {
    static login(accessToken, refreshToken, role) {
        // Store access token in localStorage for persistence across page reloads
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(USER_ROLE_KEY, role);
    }

    static getAccessToken() {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    static getRefreshToken() {
        // Refresh token is now HttpOnly, so it's not accessible via JavaScript
        return null;
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
        // No need to get currentRefreshToken from client-side storage as it's HttpOnly
        // The browser will automatically send the HttpOnly refresh token cookie with the request

        try {
            const response = await fetch("/api/auth/refresh.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // No need to send refresh_token in body, as it's in HttpOnly cookie
            });

            const data = await response.json();

            if (response.ok) {
                // Backend should return new access token and set new refresh token as HttpOnly cookie
                this.login(data.access_token, null, data.role); // Pass null for refresh token as it's not returned to client
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
