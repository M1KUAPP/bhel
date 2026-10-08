/**
 * Employee Details Page Component
 *
 * Displays detailed information about a specific employee.
 * Supports tabbed view for profile, family, and leave history.
 *
 * Features:
 * - Tabbed interface (Employee Details, Family Details, Leave History)
 * - Employee card with contact and employment info
 * - Family members list with relationship and contact details
 * - Leave history table with status badges
 * - Edit button for authorized users (HR, ADMIN, or self)
 * - Loading spinner and error states
 * - Dynamic route with employee ID parameter
 */
'use client'

import EmployeeCard from '@/components/employees/EmployeeCard'
import LeaveStatusBadge from '@/components/leaves/LeaveStatusBadge'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useEmployeeStore } from '@/lib/store/useEmployeeStore'
import { useLeaveStore } from '@/lib/store/useLeaveStore'
import { ArrowLeft, Calendar, Edit, User, Users } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Employee details page with tabbed view.
 *
 * @returns Employee details with profile, family, and leave tabs
 */
export default function EmployeeDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const employeeId = parseInt(params.id as string)
  const { user } = useAuthStore()
  const { currentEmployee, familyMembers, loading, fetchEmployee, fetchFamilyDetails, clearError } = useEmployeeStore()
  const { applications, fetchHistory } = useLeaveStore()
  const [activeTab, setActiveTab] = useState<'details' | 'family' | 'leave'>('details')
  useEffect(() => {
    clearError()
    if (employeeId) {
      fetchEmployee(employeeId)
      fetchFamilyDetails(employeeId)
      fetchHistory(employeeId, new Date().getFullYear())
    }
  }, [employeeId, fetchEmployee, fetchFamilyDetails, fetchHistory, clearError])
  const canEdit = user?.role === 'ADMIN' || user?.role === 'HR' || user?.employeeId === employeeId
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }
  if (!currentEmployee) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Not Found</h3>
          <p className="text-gray-500 mb-6">The requested employee could not be found.</p>
          <button
            onClick={() => router.push('/dashboard/employees')}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/employees')}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Employee Details</h1>
            <p className="text-sm text-gray-500">View employee information and records</p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => router.push(`/dashboard/employees/${employeeId}/edit`)}
            className="inline-flex items-center px-6 py-3.5 border border-transparent rounded-full shadow-lg shadow-blue-500/20 text-sm font-semibold text-white bg-accent hover:bg-accent-hover hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            <Edit className="h-5 w-5 mr-2" />
            Edit Employee
          </button>
        )}
      </div>
      <div className="flex p-1 bg-gray-100/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'details'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <User className="h-4 w-4" />
          Employee Details
        </button>
        <button
          onClick={() => setActiveTab('family')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'family'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Users className="h-4 w-4" />
          Family Details
          <span
            className={`py-0.5 px-2 rounded-full text-xs ${
              activeTab === 'family' ? 'bg-gray-100 text-gray-900' : 'bg-gray-200/50 text-gray-600'
            }`}
          >
            {familyMembers.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('leave')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'leave'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Leave History
          <span
            className={`py-0.5 px-2 rounded-full text-xs ${
              activeTab === 'leave' ? 'bg-gray-100 text-gray-900' : 'bg-gray-200/50 text-gray-600'
            }`}
          >
            {applications.length}
          </span>
        </button>
      </div>
      <div className="min-h-[400px]">
        {activeTab === 'details' && <EmployeeCard employee={currentEmployee} />}
        {activeTab === 'family' && (
          <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Family Members</h3>
            </div>
            {familyMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">No family members</h3>
                <p className="mt-1 text-sm text-gray-500">No family members registered for this employee.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {familyMembers.map((member, index) => (
                  <div
                    key={member.id || `family-${index}`}
                    className="group bg-white/50 border border-gray-100 rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-accent font-medium capitalize mt-0.5">{member.relationship}</p>
                      </div>
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-1">
                      {member.dateOfBirth && (
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(member.dateOfBirth)}
                        </p>
                      )}
                      {member.contactNumber && (
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          {member.contactNumber}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'leave' && (
          <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Leave History</h3>
            </div>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">No leave applications</h3>
                <p className="mt-1 text-sm text-gray-500">No leave applications found for this employee.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leave Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {app.leaveTypeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(app.startDate)} - {formatDate(app.endDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.totalDays} day{app.totalDays !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <LeaveStatusBadge status={app.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(app.appliedDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
