import axios from 'axios';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';

// Create an Axios instance with base configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach authentication tokens
apiClient.interceptors.request.use(
  (config) => {
    // In a real app, retrieve the token from secure storage or HTTP-only cookies
    const token = localStorage.getItem('hims_auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global network errors & 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Automatic logout on 401 Unauthorized
      if (error.response.status === 401) {
        toast.error('Session Expired', { description: 'Please securely log in again.' });
        console.warn('Unauthorized request. Logging user out automatically.');
        const { logout } = useStore.getState();
        logout();
        window.location.href = '/login';
      } else if (error.response.status >= 500) {
        toast.error('Server Error', { description: 'Something went wrong on the server.' });
      } else if (error.response.status === 403) {
        toast.error('Access Denied', { description: 'You do not have permission to perform this action.' });
      } else if (error.response.status === 404) {
        toast.error('Not Found', { description: 'The requested resource was not found.' });
      } else {
        toast.error('Request Failed', { description: error.response.data?.message || 'An unexpected error occurred.' });
      }
      
      // Global error logging
      console.error(`API Error [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      toast.error('Network Error', { description: 'No response received from the server. Check your connection.' });
      console.error('Network Error: No response received from the server.');
    } else {
      toast.error('Error', { description: error.message });
      console.error('Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);
