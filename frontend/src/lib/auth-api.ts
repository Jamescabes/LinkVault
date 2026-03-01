import { apiClient } from './api-client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  UserProfileResponse,
} from '../types/api';

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest) =>
    apiClient<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () =>
    apiClient<UserProfileResponse>('/api/v1/users/me'),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient<UserProfileResponse>('/api/v1/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
