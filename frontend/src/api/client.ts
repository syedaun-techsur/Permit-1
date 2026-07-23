import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth.store';

// Default to a same-origin `/api` prefix so the app works behind any preview
// proxy / in any browser (the Vite dev-server proxy forwards `/api/*` to the
// backend and strips the prefix — see vite.config.ts). A hardcoded
// `http://localhost:3000` only works when the browser IS the backend host.
// Override with VITE_API_URL for a split deployment.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // CRITICAL: sends httpOnly refreshToken cookie
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach access token as Bearer
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // For multipart uploads, drop the default JSON Content-Type so axios/the
  // browser set `multipart/form-data` WITH the required boundary themselves.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }
  return config;
});

// Track refresh in-flight to prevent multiple simultaneous refreshes
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

// Endpoints where a 401 means "bad credentials / no session", NOT "access token
// expired". Attempting a silent refresh here is wrong: it masks the real error
// (e.g. a failed login surfaces the refresh's "No refresh token" instead of
// "Invalid email or password") and triggers a spurious logout + redirect.
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
];

// Response interceptor: silent refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Normalize the backend error shape so any UI code that reads (and renders)
    // `response.data.message` always receives a STRING. The API returns domain
    // errors as `message: { code, message }` and validation errors as
    // `message: string[]`; rendering either as a React child throws
    // "Objects are not valid as a React child" and blanks the whole app.
    const errData = error.response?.data as { message?: unknown } | undefined;
    if (errData && typeof errData === 'object') {
      const m = errData.message;
      if (Array.isArray(m)) {
        errData.message = m.filter(Boolean).join(', ');
      } else if (m && typeof m === 'object') {
        const inner = m as { message?: unknown };
        errData.message =
          typeof inner.message === 'string' ? inner.message : JSON.stringify(m);
      }
    }

    const originalRequest = error.config;
    const requestUrl: string = originalRequest?.url ?? '';
    const skipRefresh = NO_REFRESH_PATHS.some((p) => requestUrl.includes(p));

    if (error.response?.status === 401 && !originalRequest._retry && !skipRefresh) {
      if (isRefreshing) {
        // Queue subsequent 401s until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
