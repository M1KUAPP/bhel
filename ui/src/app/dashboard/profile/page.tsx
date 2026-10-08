/**
 * Profile Page Component
 *
 * Displays the current user's profile information.
 * Provides tabbed view for profile details, family members, and leave history.
 *
 * Features:
 * - Tabbed interface (Profile Details, Family Details, Leave History)
 * - Employee card with personal and employment info
 * - Family members list with relationship details
 * - Leave history table with status badges
 * - Edit button to modify profile information
 * - Loading spinner and error states
 */
'use client'

import EmployeeCard from '@/components/employees/EmployeeCard'
import LeaveStatusBadge from '@/components/leaves/LeaveStatusBadge'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useEmployeeStore } from '@/lib/store/useEmployeeStore'
import { useLeaveStore } from '@/lib/store/useLeaveStore'
import { Calendar, Edit, User, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * User profile page with personal information and history.
 *
 * @returns Profile page with tabbed details, family, and leave sections
 */
export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { currentEmployee, familyMembers, loading, fetchEmployee, fetchFamilyDetails, clearError } = useEmployeeStore()
  const { applications, fetchHistory } = useLeaveStore()
  const [activeTab, setActiveTab] = useState<'details' | 'family' | 'leave'>('details')
  useEffect(() => {
    clearError()
    if (user?.employeeId) {
      fetchEmployee(user.employeeId)
      fetchFamilyDetails(user.employeeId)
      fetchHistory(user.employeeId, new Date().getFullYear())
    }
  }, [user?.employeeId, fetchEmployee, fetchFamilyDetails, fetchHistory, clearError])
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
        <div className="bg-red-50/50 border border-red-100 rounded-2xl p-8">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-500">Unable to load profile</p>
        </div>
      </div>
    )
  }
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-3.5 rounded-2xl bg-white shadow-sm border border-gray-100 text-foreground">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">My Profile</h1>
            <p className="text-foreground-secondary mt-1 text-lg">Manage your personal information</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard/profile/edit')}
          className="inline-flex items-center px-6 py-3.5 border border-transparent rounded-full shadow-lg shadow-blue-500/20 text-sm font-semibold text-white bg-accent hover:bg-accent-hover hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
        >
          <Edit className="h-5 w-5 mr-2" />
          Edit Profile
        </button>
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
          Profile Details
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
