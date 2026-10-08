/**
 * Leave Balance Card Component
 *
 * Displays leave balance information in a card format.
 * Shows total allowance, used days, remaining days, and usage progress bar.
 *
 * Features:
 * - Leave type name with calendar icon
 * - Remaining days displayed prominently
 * - Total and used days breakdown
 * - Progress bar with color coding (green/yellow/red based on usage)
 * - Percentage used indicator
 *
 * Color Thresholds:
 * - Green: <50% used
 * - Yellow: 50-80% used
 * - Red: >80% used
 */
import { LeaveBalance } from '@/lib/api/types'
import { Calendar } from 'lucide-react'

/** Props for the LeaveBalanceCard component */
interface LeaveBalanceCardProps {
  /** Leave balance record to display */
  balance: LeaveBalance
}

/**
 * Renders a leave balance card with usage progress.
 *
 * @param balance - Leave balance record with type, total, used, remaining
 * @returns Card showing leave balance with visual progress indicator
 */
export default function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
  const percentageUsed = (balance.usedDays / balance.totalDays) * 100
  return (
    <div className="bg-surface border border-white/50 rounded-2xl p-6 card-hover shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-accent">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">{balance.leaveTypeName}</h3>
        </div>
        <div className="text-right">
          <span className="block text-2xl font-bold text-foreground">{balance.remainingDays}</span>
          <span className="text-xs font-medium text-foreground-secondary uppercase tracking-wide">Left</span>
        </div>
      </div>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-foreground-secondary">Total Allowance</span>
          <span className="text-foreground">{balance.totalDays} days</span>
        </div>
        <div className="flex justify-between text-sm font-medium">
          <span className="text-foreground-secondary">Used</span>
          <span className="text-foreground">{balance.usedDays} days</span>
        </div>
      </div>
      <div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              percentageUsed > 80 ? 'bg-red-500' : percentageUsed > 50 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-xs text-foreground-secondary font-medium">{percentageUsed.toFixed(0)}% used</p>
        </div>
      </div>
    </div>
  )
}
