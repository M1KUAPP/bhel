/**
 * Leave Application Form Component
 *
 * Form for submitting new leave applications.
 * Validates dates, calculates working days, and checks balance.
 *
 * Features:
 * - Zod schema validation for all fields
 * - Leave type dropdown with available balances
 * - Date range picker (start/end dates)
 * - Automatic working days calculation (excludes weekends)
 * - Balance validation before submission
 * - Remaining days indicator per leave type
 * - Error display for validation failures
 * - Loading state during submission
 * - React Hook Form for state management
 *
 * Validations:
 * - Leave type required
 * - Valid date range (end >= start)
 * - Reason required (min 10 characters)
 * - Sufficient leave balance
 */
'use client'

import { FormTextarea } from '@/components/ui/FormInput'
import { LeaveBalance } from '@/lib/api/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

/**
 * Gets today's date in YYYY-MM-DD format.
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

/** Zod schema for leave application form */
const leaveApplicationSchema = z
  .object({
    leaveType: z.string().min(1, 'Please select a leave type'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    reason: z
      .string()
      .min(1, 'Reason is required')
      .min(10, 'Reason must be at least 10 characters')
      .max(500, 'Reason must not exceed 500 characters')
  })
  .refine(
    (data) => {
      if (!data.startDate) return true
      const today = getTodayString()
      return data.startDate >= today
    },
    {
      message: `Value must be ${getTodayString()} or later.`,
      path: ['startDate']
    }
  )
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true
      return new Date(data.endDate) >= new Date(data.startDate)
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate']
    }
  )

/** Form data type inferred from schema */
type LeaveApplicationFormData = z.infer<typeof leaveApplicationSchema>

/** Props for the LeaveApplicationForm component */
interface LeaveApplicationFormProps {
  /** Available leave balances for selection */
  leaveBalances: LeaveBalance[]
  /** Callback when form is submitted with application data */
  onSubmit: (data: { leaveType: string; startDate: string; endDate: string; reason: string }) => Promise<void>
  /** Callback when cancel is clicked */
  onCancel: () => void
}

/**
 * Calculates working days between two dates (excludes weekends).
 *
 * @param start - Start date
 * @param end - End date
 * @returns Number of working days
 */
function calculateWorkingDays(start: Date, end: Date): number {
  let count = 0
  const curDate = new Date(start.getTime())
  while (curDate <= end) {
    const dayOfWeek = curDate.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
    curDate.setDate(curDate.getDate() + 1)
  }
  return count
}

/**
 * Leave application form with validation and balance check.
 *
 * @param leaveBalances - Available leave types and balances
 * @param onSubmit - Submission callback with form data
 * @param onCancel - Cancel button callback
 * @returns Leave application form with date picker and validation
 */
export default function LeaveApplicationForm({ leaveBalances, onSubmit, onCancel }: LeaveApplicationFormProps) {
  const [totalDays, setTotalDays] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<LeaveApplicationFormData>({
    resolver: zodResolver(leaveApplicationSchema),
    defaultValues: {
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: ''
    }
  })

  const watchedLeaveType = watch('leaveType')
  const watchedStartDate = watch('startDate')
  const watchedEndDate = watch('endDate')

  useEffect(() => {
    if (watchedStartDate && watchedEndDate) {
      const start = new Date(watchedStartDate)
      const end = new Date(watchedEndDate)
      if (end >= start) {
        const days = calculateWorkingDays(start, end)
        setTotalDays(days)
      } else {
        setTotalDays(0)
      }
    } else {
      setTotalDays(0)
    }
  }, [watchedStartDate, watchedEndDate])

  useEffect(() => {
    if (watchedLeaveType && totalDays > 0) {
      const selectedBalance = leaveBalances.find((b) => b.leaveTypeName === watchedLeaveType)
      if (selectedBalance && totalDays > selectedBalance.remainingDays) {
        setBalanceError(`Insufficient balance. You have ${selectedBalance.remainingDays} days remaining.`)
      } else {
        setBalanceError(null)
      }
    } else {
      setBalanceError(null)
    }
  }, [watchedLeaveType, totalDays, leaveBalances])

  const onFormSubmit = async (data: LeaveApplicationFormData) => {
    if (balanceError) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason
      })
    } catch {
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedBalance = leaveBalances.find((b) => b.leaveTypeName === watchedLeaveType)

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 ml-1">
          Leave Type <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            id="leaveType"
            {...register('leaveType')}
            className={`w-full px-4 py-2.5 bg-white/50 border rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 appearance-none ${
              errors.leaveType ? 'border-red-300' : 'border-gray-200'
            }`}
          >
            <option value="">Select a leave type</option>
            {leaveBalances.map((balance) => (
              <option key={balance.id} value={balance.leaveTypeName}>
                {balance.leaveTypeName}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.leaveType && <p className="text-sm text-red-500 ml-1">{errors.leaveType.message}</p>}
        {selectedBalance && (
          <div className="mt-2 flex items-center gap-2 ml-1">
            <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${(selectedBalance.remainingDays / selectedBalance.totalDays) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 font-medium">{selectedBalance.remainingDays} days remaining</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 ml-1">
            Start Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="date"
              id="startDate"
              {...register('startDate')}
              min={new Date().toISOString().split('T')[0]}
              className={`pl-12 w-full px-4 py-2.5 bg-white/50 border rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 ${
                errors.startDate ? 'border-red-300' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.startDate && <p className="text-sm text-red-500 ml-1">{errors.startDate.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 ml-1">
            End Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="date"
              id="endDate"
              {...register('endDate')}
              min={watchedStartDate || new Date().toISOString().split('T')[0]}
              className={`pl-12 w-full px-4 py-2.5 bg-white/50 border rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 ${
                errors.endDate ? 'border-red-300' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.endDate && <p className="text-sm text-red-500 ml-1">{errors.endDate.message}</p>}
        </div>
      </div>

      {totalDays > 0 && (
        <div
          className={`border rounded-xl p-4 flex justify-between items-center ${
            balanceError ? 'bg-red-50/50 border-red-100' : 'bg-blue-50/50 border-blue-100'
          }`}
        >
          <span className={`text-sm font-medium ${balanceError ? 'text-red-900' : 'text-blue-900'}`}>
            Total Duration
          </span>
          <span className={`text-lg font-bold ${balanceError ? 'text-red-700' : 'text-blue-700'}`}>
            {totalDays} day{totalDays !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {balanceError && <p className="text-sm text-red-500 ml-1">{balanceError}</p>}

      <FormTextarea
        id="reason"
        label="Reason"
        register={register('reason')}
        error={errors.reason}
        required
        placeholder="Please provide a reason for your leave application..."
      />

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !!balanceError}
          className="flex-1 px-6 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </form>
  )
}
