
import { jwtDecode } from "jwt-decode";

export class AuthService {
    static login(token, role) {
        localStorage.setItem("access_token", token);
        localStorage.setItem("user_role", role);
    }

    static getAccessToken() {
        return localStorage.getItem("access_token");
    }

    static isAuthenticated() {
        const token = localStorage.getItem("access_token");
        if (!token) {
            return false;
        }

        try {
            const decodedToken = jwtDecode(token);
            return decodedToken.exp * 1000 > new Date().getTime();
        } catch {
            return false;
        }
    }

    static logout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");
    }

    static getRole() {
        return localStorage.getItem("user_role");
    }

    static refreshToken() {
        const token = sessionStorage.getItem("refresh_token"); // Use refresh token from session storage
        return fetch("/api/auth/refresh.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }).then(async (res) => {
            const data = await res.json();
            if (res.ok) {
                sessionStorage.setItem("access_token", data.access_token);
            } else {
                throw new Error("Failed to refresh token.");
            }
        });
    }
}