/**
 * Leave History Table Component
 *
 * Displays a table of leave applications with details and actions.
 * Shows leave type, dates, duration, status, and view button.
 *
 * Features:
 * - Responsive table with horizontal scroll
 * - Status badge for each application
 * - View button to navigate to application details
 * - Empty state message when no applications
 * - Filters out invalid applications (null or missing ID)
 * - Malaysian date format (en-MY)
 */
import { LeaveApplication } from '@/lib/api/types'
import { Calendar, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import LeaveStatusBadge from './LeaveStatusBadge'

/** Props for the LeaveHistoryTable component */
interface LeaveHistoryTableProps {
  /** Array of leave applications to display */
  applications: LeaveApplication[]
}

/**
 * Renders a table of leave applications.
 *
 * @param applications - Array of leave application records
 * @returns Leave history table or empty state
 */
export default function LeaveHistoryTable({ applications }: LeaveHistoryTableProps) {
  const router = useRouter()
  const validApplications = applications.filter((app) => app && app.id != null)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  if (validApplications.length === 0) {
    return (
      <div className="bg-surface/60 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
          <Calendar className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900">No leave applications</h3>
        <p className="mt-1 text-sm text-gray-500">You haven&apos;t applied for any leave yet.</p>
      </div>
    )
  }
  return (
    <div className="bg-surface/60 backdrop-blur-xl shadow-sm rounded-2xl overflow-hidden border border-white/20">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/60">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Leave Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Days</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Applied On
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/60">
            {validApplications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.leaveTypeName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(app.startDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(app.endDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.totalDays}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <LeaveStatusBadge status={app.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(app.appliedDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => router.push(`/dashboard/leaves/${app.id}`)}
                    className="text-gray-400 hover:text-gray-900 inline-flex items-center gap-1.5 font-medium transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
