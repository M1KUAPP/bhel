/**
 * Dashboard Home Page Component
 *
 * Main dashboard view displaying user statistics and quick actions.
 * Fetches and displays data based on user role.
 *
 * Features:
 * - Personalized greeting based on time of day
 * - Statistics cards (employees count, leave balance, pending/upcoming leaves)
 * - Role-based quick action cards (Apply Leave, Register Employee, etc.)
 * - Recent activity feed showing latest leave applications
 * - Loading skeleton states during data fetch
 *
 * Data Sources:
 * - Employee store: employee list (HR/ADMIN only)
 * - Leave store: leave balance and application history
 * - Auth store: current user info and role
 */
'use client'

import { useAuthStore } from '@/lib/store/useAuthStore'
import { useEmployeeStore } from '@/lib/store/useEmployeeStore'
import { useLeaveStore } from '@/lib/store/useLeaveStore'
import {
  Activity,
  ArrowRight,
  Calendar,
  CalendarPlus,
  Clock,
  FileText,
  TrendingUp,
  UserPlus,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Dashboard home page with statistics and quick actions.
 *
 * @returns Dashboard page with stat cards, actions, and activity feed
 */
export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { employees, fetchEmployees } = useEmployeeStore()
  const { leaveBalance, applications, fetchBalance, fetchHistory } = useLeaveStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalLeaveBalance: 0,
    pendingLeaves: 0,
    upcomingLeaves: 0
  })
  const currentYear = new Date().getFullYear()
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        if (user?.role === 'HR' || user?.role === 'ADMIN') {
          await fetchEmployees()
        }
        if (user?.employeeId) {
          await fetchBalance(user.employeeId, currentYear)
          await fetchHistory(user.employeeId, currentYear)
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load dashboard data:', error)
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user, fetchEmployees, fetchBalance, fetchHistory, currentYear])
  useEffect(() => {
    const totalEmployees = employees.length
    const totalLeaveBalance = leaveBalance.reduce((sum, lb) => sum + lb.remainingDays, 0)
    const pendingLeaves = applications.filter((app) => app.status === 'pending').length
    const today = new Date()
    const upcomingLeaves = applications.filter((app) => {
      const startDate = new Date(app.startDate)
      return app.status === 'approved' && startDate > today
    }).length
    setStats({
      totalEmployees,
      totalLeaveBalance,
      pendingLeaves,
      upcomingLeaves
    })
  }, [employees, leaveBalance, applications])
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }
  const getQuickActions = () => {
    const actions = []
    actions.push({
      title: 'View Profile',
      description: 'View and update your profile',
      icon: UserPlus,
      href: '/dashboard/profile',
      color: 'blue'
    })
    actions.push({
      title: 'Apply for Leave',
      description: 'Submit a new leave application',
      icon: CalendarPlus,
      href: '/dashboard/leaves/apply',
      color: 'green'
    })
    if (user?.role === 'HR' || user?.role === 'ADMIN') {
      actions.push({
        title: 'Register Employee',
        description: 'Add a new employee to the system',
        icon: UserPlus,
        href: '/dashboard/employees/new',
        color: 'purple'
      })
    }
    if (user?.role === 'HR' || user?.role === 'ADMIN') {
      actions.push({
        title: 'Approve Leaves',
        description: 'Review pending leave applications',
        icon: FileText,
        href: '/dashboard/approvals',
        color: 'orange'
      })
    }
    return actions
  }
  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'blue',
      visible: user?.role === 'HR' || user?.role === 'ADMIN'
    },
    {
      title: 'Leave Balance',
      value: `${stats.totalLeaveBalance} days`,
      icon: Calendar,
      color: 'green',
      visible: true
    },
    {
      title: 'Pending Applications',
      value: stats.pendingLeaves,
      icon: Clock,
      color: 'yellow',
      visible: true
    },
    {
      title: 'Upcoming Leaves',
      value: stats.upcomingLeaves,
      icon: TrendingUp,
      color: 'purple',
      visible: true
    }
  ]
  const colorVariants: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-600' }
  }
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
          {getGreeting()}, {user?.firstName || user?.username}!
        </h1>
        <p className="text-gray-500 text-lg">Here&apos;s what&apos;s happening today.</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'].map((id) => (
            <div
              key={id}
              className="bg-surface/60 backdrop-blur-xl rounded-2xl shadow-sm p-6 animate-pulse border border-white/20"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards
            .filter((card) => card.visible)
            .map((stat, index) => {
              const Icon = stat.icon
              const colors = colorVariants[stat.color]
              return (
                <div
                  key={index}
                  className="bg-surface/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colors.bg}`}>
                      <Icon className={`w-6 h-6 ${colors.icon}`} />
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                </div>
              )
            })}
        </div>
      )}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getQuickActions().map((action, index) => {
            const Icon = action.icon
            const colors = colorVariants[action.color]
            return (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                className="bg-surface/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 p-6 text-left transition-all duration-200 hover:shadow-md hover:scale-[1.02] group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl ${colors.bg} group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">{action.title}</h3>
                <p className="text-gray-500 text-sm font-medium">{action.description}</p>
              </button>
            )
          })}
        </div>
      </div>
      <div className="bg-surface/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Activity</h2>
        </div>
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.slice(0, 5).map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between py-4 border-b border-gray-100/50 last:border-0 hover:bg-white/40 rounded-xl px-4 -mx-4 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-gray-50 text-gray-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{app.leaveTypeName}</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {new Date(app.startDate).toLocaleDateString()} - {new Date(app.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    app.status === 'approved'
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : app.status === 'rejected'
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : app.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                          : 'bg-gray-50 text-gray-700 border border-gray-100'
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
              <Activity className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No recent activity</h3>
            <p className="mt-1 text-sm text-gray-500">Your recent leave applications will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
