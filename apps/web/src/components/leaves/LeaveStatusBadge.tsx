/**
 * Leave Status Badge Component
 *
 * Displays a colored badge indicating leave application status.
 * Uses different colors for each status type.
 *
 * Status Colors:
 * - pending: Yellow (warning)
 * - approved: Green (success)
 * - rejected: Red (error)
 * - cancelled: Gray (neutral)
 */

/** Props for the LeaveStatusBadge component */
interface LeaveStatusBadgeProps {
  /** Leave application status to display */
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
}

/**
 * Renders a status badge with appropriate color styling.
 *
 * @param status - Leave status (pending/approved/rejected/cancelled)
 * @returns Colored status badge with capitalized text
 */
export default function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  const safeStatus = status || 'pending'
  const getStatusStyles = () => {
    switch (safeStatus) {
      case 'approved':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'rejected':
        return 'bg-red-50 text-red-700 border border-red-200'
      case 'cancelled':
        return 'bg-gray-50 text-gray-700 border border-gray-200'
      case 'pending':
      default:
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
    }
  }
  return (
    <span
      className={`px-2.5 py-0.5 inline-flex text-xs font-bold uppercase tracking-wide rounded-full ${getStatusStyles()}`}
    >
      {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
    </span>
  )
}
