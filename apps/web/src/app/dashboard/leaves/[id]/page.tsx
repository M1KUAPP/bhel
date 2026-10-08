/**
 * Leave Details Page Component
 *
 * Displays detailed information about a specific leave application.
 * Supports cancellation for pending applications.
 *
 * Features:
 * - Application summary (type, duration, dates, reason)
 * - Status badge with visual indicator
 * - Approval/rejection details with hr comments
 * - Application timeline (submitted, approved/rejected/pending)
 * - Cancel action for pending applications with confirmation
 * - Loading spinner and error states
 * - Dynamic route with application ID parameter
 */
'use client'

import LeaveStatusBadge from '@/components/leaves/LeaveStatusBadge'
import { useLeaveStore } from '@/lib/store/useLeaveStore'
import { AlertCircle, ArrowLeft, Calendar, Clock, FileText, Trash2, User } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Leave details page with application info and actions.
 *
 * @returns Leave application details with timeline and cancel option
 */
export default function LeaveDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const applicationId = Number(params.id)
  const { currentApplication, loading, fetchApplicationStatus, cancelLeave, clearCurrentApplication } = useLeaveStore()
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  useEffect(() => {
    if (applicationId) {
      fetchApplicationStatus(applicationId)
    }
    return () => {
      clearCurrentApplication()
    }
  }, [applicationId, fetchApplicationStatus, clearCurrentApplication])
  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await cancelLeave(applicationId)
      setShowCancelConfirm(false)
      fetchApplicationStatus(applicationId)
    } catch {
    } finally {
      setIsCancelling(false)
    }
  }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  if (loading && !currentApplication) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }
  if (!currentApplication) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <div className="bg-red-50/50 border border-red-100 rounded-2xl p-8">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Not Found</h3>
          <p className="text-gray-500 mb-6">Unable to load leave application details</p>
          <button
            onClick={() => router.push('/dashboard/leaves')}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leaves
          </button>
        </div>
      </div>
    )
  }
  const canCancel = currentApplication.status === 'pending'
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/leaves')}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Leave Details</h1>
            <p className="text-sm text-gray-500">ID: #{currentApplication.id}</p>
          </div>
        </div>
        <LeaveStatusBadge status={currentApplication.status} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Application Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Leave Type</span>
                </div>
                <p className="text-base font-medium text-gray-900">{currentApplication.leaveTypeName}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Duration</span>
                </div>
                <p className="text-base font-medium text-gray-900">
                  {currentApplication.totalDays} day{currentApplication.totalDays !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Start Date</span>
                </div>
                <p className="text-base font-medium text-gray-900">{formatDate(currentApplication.startDate)}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">End Date</span>
                </div>
                <p className="text-base font-medium text-gray-900">{formatDate(currentApplication.endDate)}</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Reason</span>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{currentApplication.reason}</p>
                </div>
              </div>
            </div>
            {(currentApplication.status === 'approved' || currentApplication.status === 'rejected') && (
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                {currentApplication.approvedByName && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        {currentApplication.status === 'approved' ? 'Approved By' : 'Rejected By'}
                      </span>
                      <p className="text-gray-700">{currentApplication.approvedByName}</p>
                    </div>
                  </div>
                )}
                {currentApplication.approverComments && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-xs font-medium uppercase tracking-wider text-gray-500">HR Comments</span>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                        &quot;{currentApplication.approverComments}&quot;
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {canCancel && (
            <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="inline-flex items-center px-4 py-2.5 border border-red-200 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancel Application
                </button>
              ) : (
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Cancel this application?</p>
                      <p className="text-sm text-red-600 mt-1">This action cannot be undone.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      disabled={isCancelling}
                      className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Keep Application
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Timeline</h2>
            <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
              <div className="relative">
                <div
                  className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                    currentApplication.appliedDate ? 'bg-accent' : 'bg-gray-300'
                  }`}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                  <p className="text-xs text-gray-500">{formatDateTime(currentApplication.appliedDate)}</p>
                </div>
              </div>
              <div className="relative">
                <div
                  className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                    currentApplication.status === 'approved'
                      ? 'bg-green-500'
                      : currentApplication.status === 'rejected'
                        ? 'bg-red-500'
                        : currentApplication.status === 'cancelled'
                          ? 'bg-gray-400'
                          : 'bg-yellow-500'
                  }`}
                />
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {currentApplication.status === 'approved'
                        ? 'Approved'
                        : currentApplication.status === 'rejected'
                          ? 'Rejected'
                          : currentApplication.status === 'cancelled'
                            ? 'Cancelled'
                            : 'Pending Approval'}
                    </p>
                    {currentApplication.approvedRejectedDate && (
                      <p className="text-xs text-gray-500">{formatDateTime(currentApplication.approvedRejectedDate)}</p>
                    )}
                    {currentApplication.approvedByName && (
                      <p className="text-xs text-gray-500">by {currentApplication.approvedByName}</p>
                    )}
                  </div>
                  {currentApplication.status === 'pending' && (
                    <p className="text-xs text-gray-500">Waiting for HR review</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
