/**
 * API Client Module
 *
 * Centralized HTTP client for all API communications.
 * Built on Axios with automatic token handling and error management.
 *
 * Features:
 * - Bearer token authentication from localStorage
 * - Automatic 401 handling with redirect to login
 * - Standardized error response format
 * - JSON content type by default
 * - Credentials included for CORS
 */
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '@/lib/config'
import axios, { AxiosError, AxiosInstance } from 'axios'

/** Standardized API error format */
interface ApiError {
  /** Human-readable error message */
  message: string
  /** Error code for programmatic handling */
  code: string
  /** HTTP status code */
  status: number
  /** Additional error details */
  details?: unknown
}

/** Raw error response shape from API */
interface ApiErrorResponse {
  message?: string
  code?: string
  details?: unknown
}

/**
 * HTTP client wrapper with authentication and error handling.
 * Singleton instance exported as apiClient.
 */
class ApiClient {
  /** Underlying Axios instance */
  private client: AxiosInstance

  /** Creates client with base URL, interceptors for auth and error handling */
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    })
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
          localStorage.removeItem(TOKEN_STORAGE_KEY)
          window.location.href = '/login'
        }
        return Promise.reject(this.handleError(error))
      }
    )
  }
  /**
   * Transforms Axios errors into standardized ApiError format.
   * @param error - Axios error from failed request
   * @returns Standardized error object
   */
  private handleError(error: AxiosError<ApiErrorResponse>): ApiError {
    if (error.response?.data) {
      const data = error.response.data
      return {
        message: data.message || 'An error occurred',
        code: data.code || 'UNKNOWN_ERROR',
        status: error.response.status,
        details: data.details
      }
    }
    return {
      message: 'Network error',
      code: 'NETWORK_ERROR',
      status: 0
    }
  }
  /** GET request returning response data */
  get<T>(url: string): Promise<T> {
    return this.client.get<T>(url).then((res) => res.data)
  }

  /** POST request with optional body, returning response data */
  post<T>(url: string, data?: unknown): Promise<T> {
    return this.client.post<T>(url, data).then((res) => res.data)
  }

  /** PUT request with optional body, returning response data */
  put<T>(url: string, data?: unknown): Promise<T> {
    return this.client.put<T>(url, data).then((res) => res.data)
  }
}

/** Singleton API client instance for application-wide use */
export const apiClient = new ApiClient()
