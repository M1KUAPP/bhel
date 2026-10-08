/**
 * Dashboard Layout Component
 *
 * Main layout wrapper for all dashboard pages.
 * Provides sidebar navigation, authentication protection, and responsive design.
 *
 * Features:
 * - Role-based navigation menu (EMPLOYEE, HR, ADMIN)
 * - Authentication guard with redirect to login
 * - Responsive sidebar (collapsible on mobile, fixed on desktop)
 * - User profile display in sidebar
 * - Logout functionality
 *
 * Navigation Items (role-based):
 * - Dashboard: All roles
 * - Employees: HR, ADMIN only
 * - Profile: All roles
 * - Leaves: All roles
 * - Approvals: HR, ADMIN only
 * - Reports: HR, ADMIN only
 */
'use client'

import { APP_NAME, BREAKPOINT_MD } from '@/lib/config'
import { useAuthStore } from '@/lib/store/useAuthStore'
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCircle,
  Users,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Dashboard layout with sidebar navigation and auth protection.
 *
 * @param children - Page content to render in the main area
 * @returns Dashboard layout with sidebar and main content area
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isAuthenticated, initializeAuth, loading } = useAuthStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const init = async () => {
      await initializeAuth()
      if (!isAuthenticated()) {
        router.push('/login')
      }
    }
    init()
  }, [isAuthenticated, router, initializeAuth])
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < BREAKPOINT_MD
      setIsMobile(mobile)
      if (!mobile) {
        setIsSidebarOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const handleLogout = () => {
    logout()
    router.push('/login')
  }
  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['EMPLOYEE', 'HR', 'ADMIN']
    },
    {
      name: 'Employees',
      href: '/dashboard/employees',
      icon: Users,
      roles: ['HR', 'ADMIN']
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: UserCircle,
      roles: ['EMPLOYEE', 'HR', 'ADMIN']
    },
    {
      name: 'Leaves',
      href: '/dashboard/leaves',
      icon: CalendarDays,
      roles: ['EMPLOYEE', 'HR', 'ADMIN']
    },
    {
      name: 'Approvals',
      href: '/dashboard/approvals',
      icon: FileText,
      roles: ['HR', 'ADMIN']
    },
    {
      name: 'Reports',
      href: '/dashboard/reports',
      icon: BarChart3,
      roles: ['HR', 'ADMIN']
    }
  ]
  const visibleNavItems = navItems.filter((item) => user?.role && item.roles.includes(user.role))
  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }
  if (loading || !isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-white/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="font-semibold text-lg text-gray-900">{APP_NAME}</h1>
        </div>
        <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
          <LogOut size={20} />
        </button>
      </div>
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsSidebarOpen(false)} />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          bg-gray-50/50
          transition-transform duration-300 ease-in-out
          ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          md:translate-x-0
        `}
      >
        <div className="h-20 flex items-center justify-between px-6">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">{APP_NAME}</h1>
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-black/5 rounded">
              <ChevronLeft size={20} />
            </button>
          )}
        </div>
        <div className="px-4 mb-6">
          <div className="p-4 rounded-2xl bg-white/50 border border-white/40 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center font-semibold text-sm shadow-inner">
                {user?.firstName?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
            <div className="mt-3">
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-[10px] font-medium uppercase tracking-wider border border-gray-200">
                {user?.role || 'User'}
              </span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const isActive = isActiveRoute(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                      : 'text-gray-500 hover:bg-white/60 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors duration-150"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main
        className={`
          min-h-screen transition-all duration-300
          md:ml-64
          ${isMobile ? 'pt-16' : ''}
        `}
      >
        <div className="p-6 md:p-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
