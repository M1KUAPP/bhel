/**
 * Error Boundary Component
 *
 * Catches and displays errors that occur within the application.
 * Provides user-friendly error messages and recovery options.
 *
 * Features:
 * - Error logging in development mode
 * - Detailed error message display in development
 * - "Try Again" button to reset the error boundary
 * - "Go to Dashboard" button for navigation fallback
 */
'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'

/**
 * Error boundary fallback UI component.
 * Displays when an unhandled error occurs in child components.
 *
 * @param error - The error object with optional digest for error tracking
 * @param reset - Function to reset the error boundary and retry rendering
 * @returns Error UI with recovery options
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error)
    }
  }, [error])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4">
      <div className="max-w-md w-full bg-surface/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-8">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-50 rounded-full">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-center text-gray-900">Something went wrong!</h1>
        <p className="mt-2 text-sm text-center text-gray-500">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-600 font-mono">{error.message}</p>
          </div>
        )}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
          <button
            // A full page load discards the client state that raised the error.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            onClick={() => (window.location.href = '/dashboard')}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
