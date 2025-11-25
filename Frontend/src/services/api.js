import axios from 'axios';

const api = axios.create({
  baseURL: 'https://solution-config.onrender.com/api/v1',
  withCredentials: true,  // IMPORTANT: Send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  }
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired, redirect to login
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
