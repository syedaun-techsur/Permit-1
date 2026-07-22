import { apiClient } from './client';
import type {
  LoginRequest, RegisterRequest, ForgotPasswordRequest,
  ResetPasswordRequest, AuthResponse,
} from '../types/auth.types';

export const authApi = {
  // AUTH-01
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  // AUTH-02
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  // AUTH-02 — called by interceptor
  refresh: () =>
    apiClient.post<{ accessToken: string }>('/auth/refresh').then((r) => r.data),

  // AUTH-03
  logout: () =>
    apiClient.post<{ message: string }>('/auth/logout').then((r) => r.data),

  // AUTH-04
  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<{ message: string }>('/auth/forgot-password', data).then((r) => r.data),

  // AUTH-04
  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<{ message: string }>('/auth/reset-password', data).then((r) => r.data),

  // AUTH-05
  getMe: () =>
    apiClient.get('/auth/me').then((r) => r.data),
};
