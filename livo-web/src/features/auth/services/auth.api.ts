// API calls spécifiques auth

import { axiosInstance } from '../services/api'
import { AuthResponse, LoginCredentials, RegisterData } from '../types/auth.types'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login', credentials)
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/register', data)
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    const response = await axiosInstance.post('/auth/refresh', { refreshToken })
    return response.data
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout')
  },

  updateProfile: async (data: Partial<any>): Promise<any> => {
    const response = await axiosInstance.put('/auth/profile', data)
    return response.data
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await axiosInstance.put('/auth/password', data)
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    await axiosInstance.post('/auth/password/reset', { email })
  },

  resetPassword: async (data: { token: string; newPassword: string }): Promise<void> => {
    await axiosInstance.post('/auth/password/reset/confirm', data)
  },

  verifyEmail: async (token: string): Promise<void> => {
    await axiosInstance.post('/auth/verify-email', { token })
  }
}