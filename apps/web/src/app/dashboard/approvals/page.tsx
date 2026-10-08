/**
 * Leave Approvals Page Component
 *
 * Displays pending leave applications for HR and ADMIN approval.
 * Provides filtering and approval/rejection workflow.
 *
 * Features:
 * - Pending applications table with employee details
 * - Department filter for focused review
 * - Review modal with approve/reject actions and comments
 * - Statistics cards (pending count, department, total employees)
 * - Empty state for no pending applications
 * - Error toast notifications
 * - Loading spinner during data fetch
 */
'use client'

import LeaveApprovalModal from '@/components/leaves/LeaveApprovalModal'
import { LeaveApplication } from '@/lib/api/types'
import { useEmployeeStore } from '@/lib/store/useEmployeeStore'
import { useLeaveStore } from '@/lib/store/useLeaveStore'
import { AlertCircle, CheckCircle, Filter, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

/**
 * Leave approvals page for HR/ADMIN workflow.
 *
 * @returns Approval page with pending applications and review modal
 */
export default function ApprovalsPage() {
  const {
    pendingApplications,
    loading: leaveLoading,
    fetchPendingApplications,
    approveLeave,
    rejectLeave
  } = useLeaveStore()
  const { employees, loading: employeeLoading, fetchEmployees } = useEmployeeStore()
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  useEffect(() => {
    fetchPendingApplications()
    fetchEmployees()
  }, [fetchPendingApplications, fetchEmployees])
  const departments = useMemo(() => {
    const depts = new Set(employees.map((emp) => emp.department))
    return ['all', ...Array.from(depts)].filter(Boolean)
  }, [employees])
  const filteredApplications = useMemo(() => {
    if (selectedDepartment === 'all') {
      return pendingApplications
    }
    return pendingApplications.filter((app) => {
      const employee = employees.find((emp) => emp.id === app.employeeId)
      return employee?.department === selectedDepartment
    })
  }, [pendingApplications, selectedDepartment, employees])
  const getEmployee = (employeeId: number) => {
    return employees.find((emp) => emp.id === employeeId)
  }
  const handleApprove = async (applicationId: number, comments: string) => {
    await approveLeave(applicationId, comments)
  }
  const handleReject = async (applicationId: number, comments: string) => {
    await rejectLeave(applicationId, comments)
  }
  const openApprovalModal = (application: LeaveApplication) => {
    setSelectedApplication(application)
    setIsModalOpen(true)
  }
  const loading = leaveLoading || employeeLoading
  if (loading && pendingApplications.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-3.5 rounded-2xl bg-white shadow-sm border border-gray-100 text-foreground">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Leave Approvals</h1>
            <p className="text-foreground-secondary mt-1 text-lg">Review and approve pending leave applications</p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>
      {filteredApplications.length === 0 ? (
        <div className="bg-surface/60 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
            <CheckCircle className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900">No pending applications</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedDepartment === 'all'
              ? 'All leave applications have been processed.'
              : `No pending applications in ${selectedDepartment} department.`}
          </p>
        </div>
      ) : (
        <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied On
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplications.map((application) => {
                  const employee = getEmployee(application.employeeId)
                  return (
                    <tr key={application.id} className="hover:bg-white/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">{employee?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{employee?.department || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 inline-flex text-xs font-bold uppercase tracking-wide rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {application.leaveTypeName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(application.startDate).toLocaleDateString()} -{' '}
                          {new Date(application.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{application.totalDays}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(application.appliedDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => openApprovalModal(application)}
                          className="text-gray-900 hover:text-gray-700 font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredApplications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Filter className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedDepartment === 'all' ? 'All' : selectedDepartment}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </div>
      </div>
      <LeaveApprovalModal
        application={selectedApplication}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedApplication(null)
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
