/**
 * Apply for Leave Page Component
 *
 * Form page for submitting new leave applications.
 * Requires available leave balance to apply.
 *
 * Features:
 * - Leave application form with type, dates, and reason
 * - Leave balance display for available types
 * - Session validation with login redirect
 * - Success message with auto-redirect
 * - Error and empty balance state handling
 * - Leave type mapping to backend format
 */
'use client'

import LeaveApplicationForm from '@/components/leaves/LeaveApplicationForm'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useLeaveStore } from '@/lib/store/useLeaveStore'
import { showErrorToast } from '@/lib/utils/toast'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Maps display leave type names to backend format.
 *
 * @param displayName - Human-readable leave type name
 * @returns Backend-compatible leave type identifier
 */
function mapLeaveTypeToBackend(displayName: string): string {
  const mapping: Record<string, string> = {
    'Annual Leave': 'annual_leave',
    'Sick Leave': 'sick_leave',
    'Emergency Leave': 'emergency_leave',
    'Maternity Leave': 'maternity_leave',
    'Paternity Leave': 'paternity_leave'
  }
  return mapping[displayName] || displayName.toLowerCase().replace(/\s+/g, '_')
}

/**
 * Leave application page with form and balance check.
 *
 * @returns Leave application form with validation
 */
export default function ApplyLeavePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { leaveBalance, loading, fetchBalance, applyLeave, clearError } = useLeaveStore()
  useEffect(() => {
    if (!user?.employeeId) {
      showErrorToast('Session expired. Please log in again.')
      router.push('/login')
    }
  }, [user, router])
  useEffect(() => {
    clearError()
    if (user?.employeeId) {
      const currentYear = new Date().getFullYear()
      fetchBalance(user.employeeId, currentYear)
    }
  }, [user?.employeeId, fetchBalance, clearError])
  const handleSubmit = async (data: { leaveType: string; startDate: string; endDate: string; reason: string }) => {
    if (!user?.employeeId) {
      showErrorToast('Session expired. Please log in again.')
      router.push('/login')
      return
    }
    await applyLeave({
      employeeId: user.employeeId,
      leaveType: mapLeaveTypeToBackend(data.leaveType),
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason
    })
    router.push('/dashboard/leaves')
  }
  const handleCancel = () => {
    router.push('/dashboard/leaves')
  }
  if (loading && leaveBalance.length === 0) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }
  if (leaveBalance.length === 0) {
    showErrorToast('No leave balance found. Please contact HR.')
    router.push('/dashboard/leaves')
    return null
  }
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/leaves')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-foreground-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Apply for Leave</h1>
          <p className="text-foreground-secondary mt-1 text-lg">Submit a new leave application</p>
        </div>
      </div>
      <div className="bg-surface shadow-sm rounded-2xl p-8 border border-white/50">
        <LeaveApplicationForm leaveBalances={leaveBalance} onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  )
}
