// API configuration
const getBaseUrl = () => {
    // In development, use localhost
    if (typeof window !== 'undefined' && window.location) {
        const { protocol, hostname, port } = window.location;
        // For PHP API running on port 8000
        const apiPort = port === '3000' ? '8000' : port;
        return `${protocol}//${hostname}:${apiPort}`;
    }

    // Fallback for test environment
    return 'http://localhost:8000';
};

export const API_BASE_URL = getBaseUrl();

export const API_ENDPOINTS = {
    ASSIGNMENTS: {
        GET: '/api/assignments/get.php',
        SAVE: '/api/assignments/save.php'
    },
    USERS: {
        LIST_FREELANCERS: '/api/users/list_clients_freelancers.php'
    },
    FILES: {
        GET: '/api/files/get_files.php',
        UPLOAD: '/api/files/upload.php',
        DELETE: '/api/files/delete.php',
        DOWNLOAD: '/api/files/download_file.php'
    }
};

// Helper function to construct full API URLs
export const getApiUrl = (endpoint, params = {}) => {
    let url = `${API_BASE_URL}${endpoint}`;

    if (Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    return url;
};
