/**
 * Login Page Component
 *
 * User authentication page with login form.
 * Validates credentials via Zod schema and authenticates through the auth store.
 *
 * Features:
 * - Form validation with Zod schema (username, password required)
 * - React Hook Form for form state management
 * - Loading state with spinner during authentication
 * - Error message display for failed login attempts
 * - Test credentials display in development mode
 * - Redirects to dashboard on successful login
 */
'use client'

import { useAuthStore } from '@/lib/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

/** Zod schema for login form validation */
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
})

/** Type for login form data inferred from schema */
type LoginFormData = z.infer<typeof loginSchema>

/**
 * Login page component with authentication form.
 * Handles user login via username/password credentials.
 *
 * @returns Login form with validation and error handling
 */
export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      await login(data)
      router.push('/dashboard')
    } catch {
      // useAuthStore.login already shows the error toast.
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="bg-surface/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-8 w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Welcome Back</h1>
        <p className="text-gray-500 mt-2 text-sm">Sign in to your account to continue</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 ml-1">
            Username
          </label>
          <input
            {...register('username')}
            id="username"
            type="text"
            autoComplete="username"
            disabled={isLoading}
            className={`w-full px-4 py-2.5 bg-white/50 border rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 ${
              errors.username ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
            }`}
            placeholder="Enter your username"
          />
          {errors.username && <p className="text-sm text-red-500 ml-1">{errors.username.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 ml-1">
            Password
          </label>
          <input
            {...register('password')}
            id="password"
            type="password"
            autoComplete="current-password"
            disabled={isLoading}
            className={`w-full px-4 py-2.5 bg-white/50 border rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 ${
              errors.password ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
            }`}
            placeholder="Enter your password"
          />
          {errors.password && <p className="text-sm text-red-500 ml-1">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 pt-6 border-t border-gray-200/60">
          <p className="text-xs text-gray-500 mb-4 font-medium uppercase tracking-wider text-center">
            Test Credentials
          </p>
          <div className="grid grid-cols-3 gap-3 text-xs text-gray-600">
            <div className="p-2 rounded-lg bg-gray-50/50 border border-gray-200/60">
              <span className="block font-semibold text-gray-900 mb-1">Admin</span>
              <span className="font-mono opacity-75">admin / admin</span>
            </div>
            <div className="p-2 rounded-lg bg-gray-50/50 border border-gray-200/60">
              <span className="block font-semibold text-gray-900 mb-1">HR</span>
              <span className="font-mono opacity-75">hr / hr</span>
            </div>
            <div className="p-2 rounded-lg bg-gray-50/50 border border-gray-200/60">
              <span className="block font-semibold text-gray-900 mb-1">Employee</span>
              <span className="font-mono opacity-75">employee / employee</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
