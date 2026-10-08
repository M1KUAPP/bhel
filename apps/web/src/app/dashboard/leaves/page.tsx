/**
 * Leaves Overview Page Component
 *
 * Main leave management page displaying balance and recent history.
 * Accessible to all authenticated users.
 *
 * Features:
 * - Leave balance cards for each leave type (Annual, Sick, Emergency, etc.)
 * - Pending applications alert with details
 * - Recent leave history table (last 5 applications)
 * - "Apply for Leave" and "View All History" buttons
 * - Loading spinner and error toast notifications
 */
'use client'

import LeaveBalanceCard from '@/components/leaves/LeaveBalanceCard'
import LeaveHistoryTable from '@/components/leaves/LeaveHistoryTable'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useLeaveStore } from '@/lib/store/useLeaveStore'
import { AlertCircle, Calendar, History, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Leave management page with balance and history overview.
 *
 * @returns Leave dashboard with balance cards and recent applications
 */
export default function LeavesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { leaveBalance, applications, loading, fetchBalance, fetchHistory, clearError } = useLeaveStore()
  useEffect(() => {
    clearError()
    if (user?.employeeId) {
      const currentYear = new Date().getFullYear()
      fetchBalance(user.employeeId, currentYear)
      fetchHistory(user.employeeId, currentYear)
    }
  }, [user?.employeeId, fetchBalance, fetchHistory, clearError])
  if (loading && leaveBalance.length === 0) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }
  const pendingApplications = applications.filter((app) => app.status === 'pending')
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-3.5 rounded-2xl bg-white shadow-sm border border-gray-100 text-foreground">
            <Calendar className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Leave Management</h1>
            <p className="text-foreground-secondary mt-1 text-lg">View your leave balance and apply for leave</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard/leaves/apply')}
          className="inline-flex items-center px-6 py-3.5 border border-transparent rounded-full shadow-lg shadow-blue-500/20 text-sm font-semibold text-white bg-accent hover:bg-accent-hover hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
        >
          <Plus className="h-5 w-5 mr-2" />
          Apply for Leave
        </button>
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground mb-6 tracking-tight">Leave Balance</h2>
        {leaveBalance.length === 0 ? (
          <div className="bg-surface/60 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No leave balance found</h3>
            <p className="mt-1 text-sm text-gray-500">Your leave balance will appear here once configured.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaveBalance.map((balance) => (
              <LeaveBalanceCard key={balance.id} balance={balance} />
            ))}
          </div>
        )}
      </div>
      {pendingApplications.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-6 tracking-tight">Pending Applications</h2>
          <div className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-yellow-900 font-bold text-lg">
                  You have {pendingApplications.length} pending leave application
                  {pendingApplications.length !== 1 ? 's' : ''}
                </p>
                <div className="mt-3 space-y-2">
                  {pendingApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center gap-2 text-yellow-800 font-medium bg-yellow-100/50 px-3 py-2 rounded-lg"
                    >
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      {app.leaveTypeName} • {new Date(app.startDate).toLocaleDateString()} to{' '}
                      {new Date(app.endDate).toLocaleDateString()} ({app.totalDays} day
                      {app.totalDays !== 1 ? 's' : ''})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground tracking-tight">Recent Leave History</h2>
          <button
            onClick={() => router.push('/dashboard/leaves/history')}
            className="inline-flex items-center text-sm font-semibold text-accent hover:text-accent-hover transition-colors bg-blue-50 px-4 py-2 rounded-full"
          >
            <History className="h-4 w-4 mr-2" />
            View All
          </button>
        </div>
        <LeaveHistoryTable applications={applications.slice(0, 5)} />
      </div>
    </div>
  )
}
