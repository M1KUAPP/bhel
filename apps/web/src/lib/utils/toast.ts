/**
 * Toast Utilities Module
 *
 * Wrapper functions for react-hot-toast notifications.
 * Provides consistent toast display and error message extraction.
 *
 * Features:
 * - Success toast display
 * - Error toast display
 * - API error message extraction
 * - Fallback to default messages
 */
import toast from 'react-hot-toast'

/**
 * Displays a success toast notification.
 * @param message - Success message to display
 * @returns Toast ID
 */
export const showSuccessToast = (message: string) => {
  return toast.success(message)
}

/**
 * Displays an error toast notification.
 * @param message - Error message to display
 * @returns Toast ID
 */
export const showErrorToast = (message: string) => {
  return toast.error(message)
}

/** Shape of API error responses (Axios format) */
interface ApiErrorShape {
  response?: { data?: { message?: string } }
  message?: string
}

/**
 * Type guard for API error shape.
 * @param error - Unknown error value
 * @returns True if error matches API error shape
 */
const isApiError = (error: unknown): error is ApiErrorShape => {
  return error !== null && typeof error === 'object'
}

/**
 * Extracts human-readable message from error object.
 * Tries API response message, then error.message, then default.
 *
 * @param error - Error object to extract message from
 * @param defaultMessage - Fallback message if extraction fails
 * @returns Extracted or default error message
 */
export const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (isApiError(error)) {
    return error.response?.data?.message || error.message || defaultMessage
  }
  return defaultMessage
}
