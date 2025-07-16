import axios from 'axios';

/**
 * Configure axios instance with base settings
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api'
    : '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

// Current active refresh token request
let refreshTokenRequest = null;

/**
 * Request interceptor for adding auth token and handling requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add cache-buster for GET requests
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    // Add abort controller if not provided
    if (!config.signal) {
      const controller = new AbortController();
      config.signal = controller.signal;
      config.abortController = controller; // Store for external access
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for handling responses and errors
 */
api.interceptors.response.use(
  (response) => {
    // Store new access token if provided
    if (response.data?.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data || response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token refresh (401 status)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Avoid multiple refresh token requests
        refreshTokenRequest = refreshTokenRequest || 
          api.post('/auth/refresh', {}, { skipAuthRefresh: true });
        
        const { data } = await refreshTokenRequest;
        localStorage.setItem('access_token', data.access_token);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem('access_token');
        window.location.href = '/login?session_expired=true';
        return Promise.reject(refreshError);
      } finally {
        refreshTokenRequest = null;
      }
    }

    // Handle other errors
    const errorResponse = {
      status: error.response?.status || 0,
      message: error.response?.data?.message || 
               error.message || 
               'Network Error',
      data: error.response?.data,
      code: error.code,
      isAxiosError: error.isAxiosError,
      config: error.config
    };

    // Specific error handling
    switch (errorResponse.status) {
      case 403:
        window.location.href = '/unauthorized';
        break;
      case 404:
        console.error('Resource not found:', originalRequest.url);
        break;
      case 500:
        console.error('Server error:', errorResponse.message);
        break;
      default:
        console.error('API Error:', errorResponse);
    }

    return Promise.reject(errorResponse);
  }
);

/**
 * API Helper Functions
 */

/**
 * GET request with params
 * @param {string} url 
 * @param {object} params 
 * @param {import('axios').AxiosRequestConfig} config 
 * @returns {Promise<any>}
 */
export const get = (url, params = {}, config = {}) => 
  api.get(url, { ...config, params });

/**
 * POST request with data
 * @param {string} url 
 * @param {object} data 
 * @param {import('axios').AxiosRequestConfig} config 
 * @returns {Promise<any>}
 */
export const post = (url, data, config = {}) => 
  api.post(url, data, config);

/**
 * PUT request with data
 * @param {string} url 
 * @param {object} data 
 * @param {import('axios').AxiosRequestConfig} config 
 * @returns {Promise<any>}
 */
export const put = (url, data, config = {}) => 
  api.put(url, data, config);

/**
 * DELETE request
 * @param {string} url 
 * @param {import('axios').AxiosRequestConfig} config 
 * @returns {Promise<any>}
 */
export const del = (url, config = {}) => 
  api.delete(url, config);

/**
 * Cancel all pending requests
 */
export const cancelAllRequests = () => {
  // This would require tracking all controllers in a real implementation
  console.warn('cancelAllRequests: Implement controller tracking for full functionality');
};

export default api;