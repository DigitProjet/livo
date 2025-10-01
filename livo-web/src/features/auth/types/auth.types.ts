import { User, Client, Merchant, Courier } from 'livo-types'

export interface AuthUser extends User {
  profile: Client | Merchant | Courier | null
  permissions: string[]
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  role: 'CLIENT' | 'MERCHANT' | 'COURIER'
  acceptTerms: boolean
}

export interface AuthResponse {
  user: AuthUser
  token: string
  refreshTokenValue: string
  expiresIn: number
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  refreshTokenValue: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthActions {
  // Authentification
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  
  // Gestion utilisateur
  updateProfile: (data: Partial<AuthUser>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  
  // Vérifications
  hasPermission: (permission: string) => boolean
  isRole: (role: string) => boolean
  
  // État
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export type AuthStore = AuthState & AuthActions