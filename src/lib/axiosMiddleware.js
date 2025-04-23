import axios from 'axios';

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/',
  timeout: 10000, // Request timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage/sessionStorage or any other method
    const token = localStorage.getItem('token'); // or sessionStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Attach token to the Authorization header
      config.headers['x-token'] = token;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses globally
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  (error) => {
    // Handle response errors globally, like redirecting to login if unauthorized
    if (error.response && error.response.status === 401 && localStorage.getItem('token')) {
      console.log('Unauthorized, logging out...');
      // Redirect to login or clear storage
      window.location.href = '/login';
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
