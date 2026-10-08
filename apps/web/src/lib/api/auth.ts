/**
 * Authentication API Module
 *
 * Handles user authentication operations including login, logout,
 * and token management. Stores tokens in both localStorage and cookies.
 *
 * Features:
 * - Login with credentials
 * - Logout with token cleanup
 * - Authentication status check
 * - Token retrieval
 * - Cookie-based token for SSR middleware
 */
import { TOKEN_STORAGE_KEY } from '@/lib/config'
import { apiClient } from './client'
import { LoginRequest, LoginResponse } from './types'

/**
 * Sets a browser cookie with expiration.
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Days until expiration (default: 1)
 */
const setCookie = (name: string, value: string, days: number = 1) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

/**
 * Deletes a browser cookie by setting expired date.
 * @param name - Cookie name to delete
 */
const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`
}

/** Authentication API methods */
export const authApi = {
  /**
   * Authenticates user and stores token.
   * @param credentials - Username and password
   * @returns Login response with token and user info
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
    if (response.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token)
      setCookie('auth_token', response.token, 1)
    }
    return response
  },
  /** Clears stored tokens and redirects to login page */
  logout: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    deleteCookie('auth_token')
    // A full page load clears the in-memory stores along with the token.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/login'
  },

  /**
   * Checks if user has a stored authentication token.
   * @returns True if token exists in localStorage
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_STORAGE_KEY)
  },

  /**
   * Retrieves the stored JWT token.
   * @returns Token string or null if not authenticated
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  }
}
