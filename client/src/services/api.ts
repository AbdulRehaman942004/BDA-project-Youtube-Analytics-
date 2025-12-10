import axios from 'axios';
import frontendCache from '../utils/cache';

// API Base URL Configuration
// In Docker: REACT_APP_API_URL is set to '/api' during build
// In local dev: Use full URL to backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Log for debugging
if (process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_URL) {
  console.log('🌐 API Base URL:', API_BASE_URL);
}

// Create Axios instance for API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 seconds (2 minutes) for large dataset queries
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to generate cache key
const getCacheKey = (method: string, url: string, params?: any): string => {
  const paramStr = params ? JSON.stringify(params) : '';
  const urlParams = url.includes('?') ? url.split('?')[1] : '';
  return `${method}_${url.split('?')[0]}_${paramStr}_${urlParams}`;
};

// Attach interceptors
api.interceptors.request.use(
  (config) => {
    // Check cache for GET requests
    if (config.method === 'get' && config.url) {
      try {
        const cacheKey = getCacheKey(config.method || 'get', config.url, config.params);
        const cached = frontendCache.get(cacheKey);
        
        if (cached) {
          console.log(`✅ Cache hit for ${config.url}`);
          // Return cached response as a promise
          return Promise.reject({
            __cached: true,
            data: cached,
            config
          });
        }
      } catch (error) {
        console.error('Cache check error:', error);
        // Continue with normal request if cache check fails
      }
    }
    
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    // Handle cached responses
    if (error && error.__cached) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
        fromCache: true
      });
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.config.url && !(response as any).fromCache) {
      try {
        const cacheKey = getCacheKey(response.config.method || 'get', response.config.url, response.config.params);
        
        // Determine TTL based on endpoint
        let ttl = 5 * 60 * 1000; // Default 5 minutes
        if (response.config.url.includes('/analytics/dashboard')) {
          // Dashboard data - cache based on timeRange
          // Extract timeRange from URL or params
          const urlParams = new URLSearchParams(response.config.url.split('?')[1] || '');
          const params = response.config.params || {};
          const timeRange = params.timeRange || urlParams.get('timeRange') || '7d';
          ttl = timeRange === '1d' ? 2 * 60 * 1000 : // 2 minutes
                timeRange === '7d' ? 5 * 60 * 1000 : // 5 minutes
                timeRange === '30d' ? 10 * 60 * 1000 : // 10 minutes
                15 * 60 * 1000; // 15 minutes
        }
        
        frontendCache.set(cacheKey, response.data, ttl);
        console.log(`✅ Cached ${response.config.url} for ${ttl / 1000 / 60} minutes`);
      } catch (error) {
        console.error('Cache set error:', error);
        // Continue even if caching fails
      }
    }
    
    return response;
  },
  (error) => {
    // Don't log errors for cached responses
    if (error && error.__cached) {
      return Promise.reject(error);
    }
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export default api;
