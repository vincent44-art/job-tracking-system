// import axios from 'axios';
// import { toast } from 'react-hot-toast';

// // Create axios instance with default configuration

// //original
// // const api = axios.create({
// //   baseURL: process.env.NODE_ENV === 'development' 
// //     ? 'http://localhost:5000/api'
// //     : '/api',
// //   withCredentials: true,
// //   timeout: 10000, // 10 second timeout
// //   headers: {
// //     'Content-Type': 'application/json',
// //     'Accept': 'application/json'
// //   }
// // });

// //updated

// const api = axios.create({
//   baseURL: '/api', // Adjust based on your backend URL
// });

// // Add a request interceptor to attach the access token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
// //end updated

// // Current refresh token request to prevent multiple refresh attempts
// let refreshTokenRequest = null;

// // Request interceptor
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem('access_token');
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }
    
// //     // Add cache-buster for GET requests
// //     if (config.method === 'get' && !config.params?.noCache) {
// //       config.params = {
// //         ...config.params,
// //         _t: Date.now()
// //       };
// //     }
    
// //     return config;
// //   },
// //   (error) => {
// //     return Promise.reject(error);
// //   }
// // );

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('access_token');
//     console.log("📡 Attaching token to request:", token);

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     // Add cache-buster for GET requests
//     if (config.method === 'get' && !config.params?.noCache) {
//       config.params = {
//         ...config.params,
//         _t: Date.now(),
//       };
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor
// api.interceptors.response.use(
//   (response) => {
//     // Store new access token if provided in response
//     if (response.data?.access_token) {
//       localStorage.setItem('access_token', response.data.access_token);
//     }
//     return response.data;
//   },
//   async (error) => {
//     const originalRequest = error.config;
    
//     // Handle token refresh (401 status)
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
      
//       try {
//         // Prevent multiple refresh token requests
//         // refreshTokenRequest = refreshTokenRequest || 
//         //   api.post('/auth/refresh', {}, { skipAuthRefresh: true });
        
//         refreshTokenRequest = refreshTokenRequest || 
//   api.post('/auth/refresh', {}, {
//     withCredentials: true, // ✅ Ensure cookies are sent
//     skipAuthRefresh: true,
//   });

        
//         const { data } = await refreshTokenRequest;
//         localStorage.setItem('access_token', data.access_token);
        
//         // Retry original request with new token
//         originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         // Clear tokens and redirect to login
//         localStorage.removeItem('access_token');
//         window.location.href = '/login?session_expired=true';
//         return Promise.reject(refreshError);
//       } finally {
//         refreshTokenRequest = null;
//       }
//     }

//     // Handle specific error statuses
//     if (error.response) {
//       const { status, data } = error.response;
//       let errorMessage = data?.message || 'An error occurred';
      
//       switch (status) {
//         case 400:
//           errorMessage = data?.errors?.join('\n') || 'Bad request';
//           break;
//         case 403:
//           errorMessage = 'You are not authorized to perform this action';
//           break;
//         case 404:
//           errorMessage = 'Resource not found';
//           break;
//         case 500:
//           errorMessage = 'Server error occurred';
//           break;
//         default:
//           errorMessage = data?.message || 'An unexpected error occurred';
//           break;
//       }
      
//       // Show error toast (optional)
//       if (!originalRequest?.skipErrorToast) {
//         toast.error(errorMessage);
//       }
      
//       return Promise.reject({
//         status,
//         message: errorMessage,
//         errors: data?.errors,
//         data: data
//       });
//     } else if (error.request) {
//       // The request was made but no response was received
//       toast.error('Network error - please check your connection');
//       return Promise.reject({
//         status: 0,
//         message: 'No response from server'
//       });
//     } else {
//       // Something happened in setting up the request
//       console.error('Request setup error:', error.message);
//       return Promise.reject({
//         status: -1,
//         message: error.message
//       });
//     }
//   }
// );


// // Request interceptor to attach access token
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem('access_token');
// //     if (token) {
// //       config.headers['Authorization'] = `Bearer ${token}`;
// //     }
// //     return config;
// //   },
// //   (error) => Promise.reject(error)
// // );

// // Temporary simplified response handling (for debugging)
// // api.interceptors.response.use(
// //   (response) => response.data,
// //   (error) => Promise.reject(error)
// // );
// export default api;
