import axios from "axios";
import { AuthService } from "../services/AuthService";

const axiosInstance = axios.create({
  baseURL: "/api/auth/",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = AuthService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
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

// // Add debug logging to capture failing responses -- Start Commment Out
// axiosInstance.interceptors.response.use(
//   response => {
//     console.debug("Successful API response:", response);
//     return response;
//   },
//   error => {
//     console.error("API Error:", error.response ? error.response.data : error.message);
//     return Promise.reject(error);
//   }
// );
// // Debug utility function
// const logNetworkActivity = (type, config, response) => {
//   console.log(`[%c${type} Network Activity%c]`, 'color:yellow;', 'color:auto;', {
//     Config: config,
//     Response: response
//   });
// };

// // Enhanced response interceptor with debug logging
// axiosInstance.interceptors.response.use(
//   response => {
//     logNetworkActivity('SUCCESS', response.config, response);
//     return response;
//   },
//   error => {
//     logNetworkActivity('ERROR', error.config, error.response || error.request);
//     return Promise.reject(error);
//   }
// );

// // Cleanup duplicate handlers
// if (axiosInstance.interceptors.response.handlers.length > 1) {
//   const firstHandlerId = axiosInstance.interceptors.response.handlers[0].id;
//   axiosInstance.interceptors.response.eject(firstHandlerId);
// }
// -- End Comment Out

export default axiosInstance;
