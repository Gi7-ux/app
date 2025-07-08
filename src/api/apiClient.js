import axios from "axios";
import { AuthService } from "../services/AuthService.js";

const apiClient = axios.create({
    baseURL: "/api/",
});

apiClient.interceptors.request.use(
    (config) => {
        const token = AuthService.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            // Refresh the access token and retry the original request
            try {
                await AuthService.refreshToken();
                originalRequest.headers.Authorization = `Bearer ${AuthService.getAccessToken()}`;
                return axios(originalRequest);
            } catch (refreshError) {
                if (refreshError.response && refreshError.response.status === 401) {
                    // Handle refresh token expiration here (e.g., logout and redirect)
                    console.error("Token refresh failed. Please log in again.");
                    AuthService.logout();
                    // Redirect to login page or show modal
                }
            }
        }
        return Promise.reject(error);
    }
);

export { apiClient };
