/**
 * Global Error Component
 *
 * Handles critical errors that occur at the root layout level.
 * Provides a complete HTML document since the root layout may have failed.
 *
 * Features:
 * - Self-contained HTML/body structure (bypasses failed root layout)
 * - Error logging in development mode
 * - Detailed error message display in development
 * - "Try Again" and "Refresh Page" recovery options
 */
'use client'

import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

/**
 * Global error fallback component for root-level errors.
 * Renders its own HTML structure since the root layout may have crashed.
 *
 * @param error - The error object with optional digest for error tracking
 * @param reset - Function to reset the error boundary and retry rendering
 * @returns Complete HTML document with error UI
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error:', error)
    }
  }, [error])
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4">
          <div className="max-w-md w-full bg-surface/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-50 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold text-center text-gray-900">Application Error</h1>
            <p className="mt-2 text-sm text-center text-gray-500">
              A critical error occurred. Please refresh the page or contact support.
            </p>
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 font-mono break-all">{error.message}</p>
              </div>
            )}
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={reset}
                className="w-full px-4 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
