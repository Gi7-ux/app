// Placeholder for src/api/apiClient.js
// Implement actual API client logic here, e.g., using axios or fetch

const apiClient = {
  get: async (url, config) => {
    // console.log(`Mock apiClient.get called with URL: ${url}`, config);
    const token = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(config?.headers || {}),
    };
    const response = await fetch(url, { ...config, headers, method: 'GET' });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw { response: { data: errorData, status: response.status } }; // Mimic axios error structure
    }
    return response.json().then(data => ({data})); // Mimic axios response structure
  },
  post: async (url, data, config) => {
    // console.log(`Mock apiClient.post called with URL: ${url}`, data, config);
    const token = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(config?.headers || {}),
    };
    const response = await fetch(url, { ...config, headers, method: 'POST', body: JSON.stringify(data) });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw { response: { data: errorData, status: response.status } }; // Mimic axios error structure
    }
    return response.json().then(data => ({data})); // Mimic axios response structure
  },
  // Add other methods like put, delete as needed
};

// Named export for specific use, and default export for general use
export { apiClient };
export default apiClient;
