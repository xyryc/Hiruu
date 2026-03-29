import { useServerStatusStore } from '@/stores/serverStatusStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
};

const HEALTH_CHECK_PATH = '/api/v1';

const isHealthCheckRequest = (url?: string) => {
  if (!url) return false;
  return url.includes(HEALTH_CHECK_PATH);
};

const AUTH_ENDPOINTS_REQUIRING_TOKEN = [
  '/auth/add-contact',
  '/auth/req-verify-account',
];

const shouldAttachAuthToken = (url?: string) => {
  if (!url) return false;
  if (AUTH_ENDPOINTS_REQUIRING_TOKEN.some((path) => url.includes(path))) {
    return true;
  }
  return !url.includes('/auth/');
};

let healthCheckInFlight: Promise<boolean> | null = null;

const runHealthCheckOnce = async () => {
  if (healthCheckInFlight) {
    return healthCheckInFlight;
  }

  healthCheckInFlight = useServerStatusStore
    .getState()
    .checkHealthNow()
    .finally(() => {
      healthCheckInFlight = null;
    });

  return healthCheckInFlight;
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to all requests
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const { isServerDown } = useServerStatusStore.getState();
      if (isServerDown && !isHealthCheckRequest(config.url)) {
        return Promise.reject(
          new Error('SERVER_UNAVAILABLE: blocked while health polling /api/v1')
        );
      }

      if (shouldAttachAuthToken(config.url)) {
        const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }

      // Don't override Content-Type if it's FormData (for file uploads)
      if (config.data instanceof FormData && config.headers) {
        delete config.headers['Content-Type'];
      }

      // utils/axios.ts inside request interceptor before return config
      // console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);
      // console.log("Request:", config.url);
      // console.log("Has token:", !!(await AsyncStorage.getItem("auth_access_token")));


      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    if (isHealthCheckRequest(response.config?.url) && response.data?.success === true) {
      useServerStatusStore.getState().clearServerDown();
    }
    // Return the response data directly if it exists
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const shouldSkipErrorLog = Boolean((error.config as any)?.skipErrorLog);

    const isAuthEndpoint = !shouldAttachAuthToken(originalRequest?.url);

    // Handle 401 Unauthorized - Token refresh logic
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (refreshToken) {
          const response = await axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL }).post('/auth/refresh-tokens', {
            refreshToken
          });

          const result = response.data;

          // Check if refresh was successful
          if (result.success && result.tokens) {
            const newAccessToken = result.tokens.access.token;
            const newRefreshToken = result.tokens.refresh.token;

            // Update stored tokens
            await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
            await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

            processQueue(null, newAccessToken);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            return axiosInstance(originalRequest);
          } else {
            throw new Error(result.message || 'Token refresh failed');
          }
        } else {
          throw new Error('No refresh token available');
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);

        // Token refresh failed - clear storage and redirect to login
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          'auth_user', // Clear user data
        ]);

        try {
          const { useAuthStore } = require('@/stores/authStore');
          const { useBusinessStore } = require('@/stores/businessStore');
          if (useBusinessStore?.getState) {
            useBusinessStore.getState().resetBusinessSession();
          }
          if (useAuthStore?.getState) {
            useAuthStore.getState().setTokens(null, null);
            useAuthStore.getState().setUser(null);
          }
        } catch (e) {
          console.error('Failed to clear store state:', e);
        }

        // Don't redirect here - let app/index.tsx handle navigation
        // Setting user to null will trigger automatic redirect
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Log errors in development
    if (process.env.NODE_ENV === 'development' && !shouldSkipErrorLog) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    const statusCode = error.response?.status;
    const isNetworkOrTimeout =
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK';
    const isServerFailure = typeof statusCode === 'number' && statusCode >= 500;

    const failedOnHealthCheck = isHealthCheckRequest(error.config?.url);
    if ((isNetworkOrTimeout || isServerFailure) && !failedOnHealthCheck) {
      const isHealthy = await runHealthCheckOnce();
      if (isHealthy) {
        return Promise.reject(error);
      }

      useServerStatusStore.getState().setServerDown(
        isNetworkOrTimeout
          ? 'Could not reach the server. Please check your connection and try again.'
          : 'Server is currently facing issues. Please try again shortly.'
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
