/**
 * Leave Approval Modal Component
 *
 * Modal dialog for HR/Admin to approve or reject leave applications.
 * Displays application details and allows adding comments.
 *
 * Features:
 * - Application summary (type, duration, dates, reason)
 * - HR comments textarea
 * - Approve button (comments optional)
 * - Reject button (comments required)
 * - Loading states during processing
 * - Error display for failed operations
 * - Backdrop blur and overlay
 * - Close on backdrop or X button
 */
'use client'

import { LeaveApplication } from '@/lib/api/types'
import { showErrorToast } from '@/lib/utils/toast'
import { Calendar, CheckCircle, Clock, FileText, X, XCircle } from 'lucide-react'
import { useState } from 'react'

/** Props for the LeaveApprovalModal component */
interface LeaveApprovalModalProps {
  /** Leave application to review (null when closed) */
  application: LeaveApplication | null
  /** Whether modal is open */
  isOpen: boolean
  /** Callback when modal is closed */
  onClose: () => void
  /** Callback when approve is clicked with comments */
  onApprove: (applicationId: number, comments: string) => Promise<void>
  /** Callback when reject is clicked with comments */
  onReject: (applicationId: number, comments: string) => Promise<void>
}

/**
 * Modal for reviewing and approving/rejecting leave applications.
 *
 * @param application - Leave application to review
 * @param isOpen - Modal visibility state
 * @param onClose - Close modal callback
 * @param onApprove - Approve action callback
 * @param onReject - Reject action callback
 * @returns Modal dialog or null when closed
 */
export default function LeaveApprovalModal({
  application,
  isOpen,
  onClose,
  onApprove,
  onReject
}: LeaveApprovalModalProps) {
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  if (!isOpen || !application) return null
  const handleApprove = async () => {
    try {
      setIsSubmitting(true)
      await onApprove(application.id, comments)
      setComments('')
      onClose()
    } catch {
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleReject = async () => {
    if (!comments.trim()) {
      showErrorToast('Please provide a reason for rejection')
      return
    }
    try {
      setIsSubmitting(true)
      await onReject(application.id, comments)
      setComments('')
      onClose()
    } catch {
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleClose = () => {
    if (!isSubmitting) {
      setComments('')
      onClose()
    }
  }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-surface/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
          <h2 className="text-lg font-semibold text-gray-900">Review Application</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wider">Leave Type</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{application.leaveTypeName}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wider">Duration</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {application.totalDays} day{application.totalDays !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wider">Start Date</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{formatDate(application.startDate)}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wider">End Date</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{formatDate(application.endDate)}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Reason</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{application.reason}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
              HR Comments <span className="text-gray-400 font-normal text-xs ml-1">(Required for rejection)</span>
            </label>
            <textarea
              id="comments"
              rows={3}
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none resize-none text-sm"
              placeholder="Add your comments here..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <XCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Processing...' : 'Reject'}
          </button>
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Processing...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  )
}
