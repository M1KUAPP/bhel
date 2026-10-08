/**
 * Leave History Page Component
 *
 * Displays complete leave application history with filtering.
 * Supports year and status filters.
 *
 * Features:
 * - Year filter (current year and 2 previous years)
 * - Status filter (all, pending, approved, rejected, cancelled)
 * - Application count display with filter results
 * - Leave history table with all application details
 * - Loading spinner and error toast notifications
 * - Empty state for no matching applications
 */
'use client'

import LeaveHistoryTable from '@/components/leaves/LeaveHistoryTable'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useLeaveStore } from '@/lib/store/useLeaveStore'
import { ArrowLeft, Calendar, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Leave history page with filtering capabilities.
 *
 * @returns Leave history table with year and status filters
 */
export default function LeaveHistoryPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { applications, loading, fetchHistory, clearError } = useLeaveStore()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  useEffect(() => {
    clearError()
    if (user?.employeeId) {
      fetchHistory(user.employeeId, selectedYear)
    }
  }, [user?.employeeId, selectedYear, fetchHistory, clearError])
  const currentYear = new Date().getFullYear()
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2]
  const filteredApplications =
    selectedStatus === 'all' ? applications : applications.filter((app) => app.status === selectedStatus)
  if (loading && applications.length === 0) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/leaves')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-foreground-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Leave History</h1>
            <p className="text-foreground-secondary mt-1 text-lg">View all your leave applications</p>
          </div>
        </div>
      </div>
      <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="year" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Year
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="block w-full pl-10 pr-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 flex items-center justify-between">
          <span>
            Showing <span className="font-medium text-gray-900">{filteredApplications.length}</span> of{' '}
            <span className="font-medium text-gray-900">{applications.length}</span> application
            {applications.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      {filteredApplications.length === 0 && !loading ? (
        <div className="bg-surface/60 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900">
            {selectedStatus === 'all' ? 'No leave applications found' : `No ${selectedStatus} leave applications`}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedStatus === 'all'
              ? "You haven't applied for any leave in this year."
              : `You don't have any ${selectedStatus} leave applications in this year.`}
          </p>
        </div>
      ) : (
        <LeaveHistoryTable applications={filteredApplications} />
      )}
    </div>
  )
}
