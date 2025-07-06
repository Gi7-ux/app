
import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_ROLE_KEY = "user_role";

export class AuthService {
    static login(accessToken, refreshToken, role) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(USER_ROLE_KEY, role);
    }

    static getAccessToken() {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
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

    static logout() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_ROLE_KEY);
        // Optionally, call a backend endpoint to invalidate the refresh token on the server
    }

    static getRole() {
        return localStorage.getItem(USER_ROLE_KEY);
    }

    static async refreshToken() {
        const currentRefreshToken = this.getRefreshToken();
        if (!currentRefreshToken) {
            this.logout(); // No refresh token, force logout
            throw new Error("No refresh token available.");
        }

        try {
            const response = await fetch("/api/auth/refresh.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: currentRefreshToken }),
            });

            const data = await response.json();

            if (response.ok) {
                this.login(data.access_token, data.refresh_token, this.getRole()); // Re-use login to store new tokens
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