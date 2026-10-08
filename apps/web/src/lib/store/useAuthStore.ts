/**
 * Authentication Store Module
 *
 * Zustand store for managing authentication state.
 * Handles login, logout, token management, and user session.
 *
 * Features:
 * - User login with credentials
 * - Logout with state cleanup
 * - Token persistence and initialization
 * - JWT decoding for user info
 * - Loading and error state tracking
 * - Toast notifications for auth events
 */
import { authApi } from '@/lib/api/auth'
import { LoginRequest, LoginResponse } from '@/lib/api/types'
import { extractErrorMessage, showErrorToast, showSuccessToast } from '@/lib/utils/toast'
import { create } from 'zustand'

/** Authentication store state and actions */
interface AuthState {
  /** Current authenticated user info */
  user: LoginResponse | null
  /** JWT access token */
  token: string | null
  /** Loading state for async operations */
  loading: boolean
  /** Error message from failed operations */
  error: string | null
  /** Authenticates user with credentials */
  login: (credentials: LoginRequest) => Promise<void>
  /** Logs out and clears session */
  logout: () => void
  /** Checks if user is authenticated */
  isAuthenticated: () => boolean
  /** Sets user data manually */
  setUser: (user: LoginResponse) => void
  /** Clears error state */
  clearError: () => void
  /** Initializes auth from stored token */
  initializeAuth: () => void
}

/**
 * Authentication store hook.
 * Provides user state, login/logout actions, and auth initialization.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  /** Initializes auth state from stored JWT token on app load */
  initializeAuth: async () => {
    const token = authApi.getToken()
    if (!token || !authApi.isAuthenticated()) {
      set({ user: null, token: null, loading: false })
      return
    }
    try {
      set({ loading: true })
      const { jwtDecode } = await import('jwt-decode')
      const decoded = jwtDecode<{ sub: string; role: string; employeeId?: number }>(token)
      if (decoded.employeeId) {
        const { employeesApi } = await import('@/lib/api/employees')
        const employee = await employeesApi.getById(decoded.employeeId)
        const user: LoginResponse = {
          token,
          username: decoded.sub,
          role: decoded.role,
          userId: decoded.employeeId,
          employeeId: decoded.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email
        }
        set({ token, user, loading: false, error: null })
      } else {
        const user: LoginResponse = {
          token,
          username: decoded.sub,
          role: decoded.role,
          userId: 0
        }
        set({ token, user, loading: false, error: null })
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to initialize auth:', error)
      }
      authApi.logout()
    }
  },
  /** Logs in user and stores token, shows toast on success/failure */
  login: async (credentials: LoginRequest) => {
    set({ loading: true, error: null })
    try {
      const response = await authApi.login(credentials)
      set({
        user: response,
        token: response.token,
        loading: false,
        error: null
      })
      showSuccessToast('Login successful!')
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Login failed')
      set({
        error: errorMessage,
        loading: false,
        user: null,
        token: null
      })
      showErrorToast(errorMessage)
      throw error
    }
  },
  /** Clears auth state and redirects to login */
  logout: () => {
    authApi.logout()
    set({
      user: null,
      token: null,
      loading: false,
      error: null
    })
  },

  /** Returns true if user has valid token */
  isAuthenticated: () => {
    const { token } = get()
    return !!token && authApi.isAuthenticated()
  },

  /** Manually sets user data (used after profile updates) */
  setUser: (user: LoginResponse) => {
    set({ user, token: user.token })
  },

  /** Clears any stored error message */
  clearError: () => {
    set({ error: null })
  }
}))
