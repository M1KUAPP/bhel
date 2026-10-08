/**
 * Home Page Component
 *
 * The landing page for the BHEL HRMS application.
 * Displays a hero section with navigation to login and dashboard.
 *
 * Features:
 * - Hero section with application title and description
 * - Login and Dashboard navigation buttons
 * - Feature highlights (Employee Management, Leave Management, Reports)
 * - Decorative gradient background with blur effects
 */
import Link from 'next/link'

/**
 * Landing page component with hero section and navigation.
 *
 * @returns The home page with login/dashboard links and feature badges
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50/50 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-[120px]" />
      </div>
      <main className="flex flex-col items-center justify-center gap-10 px-4 text-center max-w-4xl mx-auto z-10">
        <div className="space-y-6">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 tracking-tight">BHEL HRMS</h1>
          <p className="text-2xl md:text-3xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Human Resource Management System.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/login"
            className="rounded-xl bg-gray-900 px-8 py-3.5 text-white font-medium text-lg transition-all hover:bg-gray-800 shadow-sm hover:shadow-md"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl bg-white px-8 py-3.5 text-gray-900 font-medium text-lg transition-all hover:bg-gray-50 shadow-sm border border-gray-200 hover:border-gray-300"
          >
            Dashboard
          </Link>
        </div>
        <div className="mt-16 flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-500">
          <span className="px-4 py-2 rounded-full bg-white/60 border border-white/20 backdrop-blur-sm shadow-sm">
            Employee Management
          </span>
          <span className="px-4 py-2 rounded-full bg-white/60 border border-white/20 backdrop-blur-sm shadow-sm">
            Leave Management
          </span>
          <span className="px-4 py-2 rounded-full bg-white/60 border border-white/20 backdrop-blur-sm shadow-sm">
            Reports
          </span>
        </div>
      </main>
      <footer className="absolute bottom-8 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} BHEL. All rights reserved.
      </footer>
    </div>
  )
}
