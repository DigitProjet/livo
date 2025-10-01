import axios from 'axios'
import { useAuth } from '../hooks/useAuth'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
})

// Intercepteur pour gérer les tokens expirés
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const { refreshTokenValue } = useAuth.getState()
        await useAuth.getState().refreshToken()
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        useAuth.getState().logout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)