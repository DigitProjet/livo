// Hook principal d'authentification

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthStore, LoginCredentials, RegisterData } from '../types/auth.types'
import { authApi } from '../services/auth.api'
import { axiosInstance } from '../services/api'

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      token: null,
      refreshTokenValue: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authApi.login(credentials)
          
          // Stocker le token dans axios
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.token}`
          
          set({
            user: response.user,
            token: response.token,
            refreshTokenValue: response.refreshTokenValue,
            isAuthenticated: true,
            isLoading: false
          })

          // Sauvegarder rememberMe
          if (credentials.rememberMe) {
            localStorage.setItem('livo-remember-me', 'true')
          }
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Erreur de connexion', 
            isLoading: false 
          })
          throw error
        }
      },

      // Register
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authApi.register(data)
          
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.token}`
          
          set({
            user: response.user,
            token: response.token,
            refreshTokenValue: response.refreshTokenValue,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || "Erreur d'inscription", 
            isLoading: false 
          })
          throw error
        }
      },

      // Logout
      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          console.error('Error during logout:', error)
        } finally {
          // Nettoyer le state
          set({
            user: null,
            token: null,
            refreshTokenValue: null,
            isAuthenticated: false,
            error: null
          })
          
          // Nettoyer axios
          delete axiosInstance.defaults.headers.common['Authorization']
          localStorage.removeItem('livo-remember-me')
        }
      },

      // Refresh token
      refreshToken: async () => {
        const { refreshTokenValue } = get()
        if (!refreshTokenValue) throw new Error('No refresh token available')

        try {
          const response = await authApi.refreshToken(refreshTokenValue)
          
          set({
            token: response.token,
            refreshTokenValue: response.refreshToken
          })
          
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.token}`
        } catch (error) {
          get().logout()
          throw error
        }
      },

      // Update profile
      updateProfile: async (data: Partial<any>) => {
        set({ isLoading: true, error: null })
        
        try {
          const updatedUser = await authApi.updateProfile(data)
          
          set(state => ({
            user: state.user ? { ...state.user, ...updatedUser } : null,
            isLoading: false
          }))
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Erreur de mise à jour', 
            isLoading: false 
          })
          throw error
        }
      },

      // Change password
      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null })
        
        try {
          await authApi.changePassword({ currentPassword, newPassword })
          set({ isLoading: false })
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Erreur de changement de mot de passe', 
            isLoading: false 
          })
          throw error
        }
      },

      // Password reset
      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null })
        
        try {
          await authApi.requestPasswordReset(email)
          set({ isLoading: false })
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Erreur de réinitialisation', 
            isLoading: false 
          })
          throw error
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null })
        
        try {
          await authApi.resetPassword({ token, newPassword })
          set({ isLoading: false })
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Erreur de réinitialisation', 
            isLoading: false 
          })
          throw error
        }
      },

      // Vérifications de permissions
      hasPermission: (permission: string): boolean => {
        const { user } = get()
        return user?.permissions?.includes(permission) || false
      },

      isRole: (role: string): boolean => {
        const { user } = get()
        return user?.role === role
      },

      // Gestion état
      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading })
    }),
    {
      name: 'livo-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
        }
      }
    }
  )
)

// Hooks dérivés pour une utilisation plus spécifique
export const useUser = () => useAuth(state => state.user)
export const useAuthError = () => useAuth(state => state.error)
export const useAuthLoading = () => useAuth(state => state.isLoading)
export const useAuthActions = () => useAuth(state => ({
  login: state.login,
  logout: state.logout,
  register: state.register,
  clearError: state.clearError
}))