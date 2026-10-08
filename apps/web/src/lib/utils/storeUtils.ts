/**
 * Store Utilities Module
 *
 * Helper functions for Zustand store async operations.
 * Provides consistent loading/error state handling and toast notifications.
 *
 * Features:
 * - Automatic loading state management
 * - Error state handling with message extraction
 * - Optional success/error toast notifications
 * - Silent variant for background operations
 */
import { extractErrorMessage, showErrorToast, showSuccessToast } from './toast'

/** Zustand set function type for partial state updates */
type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void

/** Options for async store action execution */
interface AsyncActionOptions {
  /** Message to show on success (enables toast if provided) */
  successMessage?: string
  /** Message to show on error */
  errorMessage: string
  /** Whether to show success toast (default: true if successMessage provided) */
  showToastOnSuccess?: boolean
  /** Whether to show error toast (default: true) */
  showToastOnError?: boolean
}

/**
 * Executes an async action with loading state and toast notifications.
 * Sets loading=true before action, loading=false after, handles errors.
 *
 * @param set - Zustand set function
 * @param action - Async action to execute
 * @param options - Success/error message options
 * @returns Action result
 * @throws Re-throws error after handling
 */
export async function executeStoreAction<T extends { loading: boolean; error: string | null }, R>(
  set: SetState<T>,
  action: () => Promise<R>,
  options: AsyncActionOptions
): Promise<R> {
  const { successMessage, errorMessage, showToastOnSuccess = !!successMessage, showToastOnError = true } = options

  set({ loading: true, error: null } as Partial<T>)
  try {
    const result = await action()
    set({ loading: false } as Partial<T>)
    if (showToastOnSuccess && successMessage) {
      showSuccessToast(successMessage)
    }
    return result
  } catch (error) {
    const errorMsg = extractErrorMessage(error, errorMessage)
    set({ error: errorMsg, loading: false } as Partial<T>)
    if (showToastOnError) {
      showErrorToast(errorMsg)
    }
    throw error
  }
}

/**
 * Executes an async action silently without toast notifications.
 * Sets loading state but only stores error without showing toast.
 * Returns undefined on error instead of throwing.
 *
 * @param set - Zustand set function
 * @param action - Async action to execute
 * @param errorMessage - Fallback error message
 * @returns Action result or undefined on error
 */
export async function executeStoreActionSilent<T extends { loading: boolean; error: string | null }, R>(
  set: SetState<T>,
  action: () => Promise<R>,
  errorMessage: string
): Promise<R | undefined> {
  set({ loading: true, error: null } as Partial<T>)
  try {
    const result = await action()
    set({ loading: false } as Partial<T>)
    return result
  } catch (error) {
    const errorMsg = extractErrorMessage(error, errorMessage)
    set({ error: errorMsg, loading: false } as Partial<T>)
    return undefined
  }
}
