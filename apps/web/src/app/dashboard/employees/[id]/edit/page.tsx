/**
 * Edit Employee Page Component
 *
 * Form page for updating employee profile and family details.
 * Accessible to HR, ADMIN, or the employee themselves.
 *
 * Features:
 * - Tabbed interface (Profile Information, Family Details)
 * - Pre-populated employee form with current data
 * - Family members CRUD functionality
 * - Role-based access control
 * - Loading spinner and error states
 * - Redirects to employee details on successful update
 * - Dynamic route with employee ID parameter
 */
'use client'

import EmployeeForm from '@/components/employees/EmployeeForm'
import FamilyDetailsForm from '@/components/employees/FamilyDetailsForm'
import { EmployeeRegistration, EmployeeStatus, FamilyMember } from '@/lib/api/types'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useEmployeeStore } from '@/lib/store/useEmployeeStore'
import { ArrowLeft, User, Users } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Edit employee page with profile and family detail forms.
 *
 * @returns Employee edit form with tabbed interface
 */
export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const employeeId = parseInt(params.id as string)
  const { user } = useAuthStore()
  const {
    currentEmployee,
    familyMembers,
    loading,
    fetchEmployee,
    fetchFamilyDetails,
    updateProfile,
    updateFamilyDetails
  } = useEmployeeStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'family'>('profile')
  useEffect(() => {
    if (employeeId) {
      fetchEmployee(employeeId)
      fetchFamilyDetails(employeeId)
    }
  }, [employeeId, fetchEmployee, fetchFamilyDetails])
  useEffect(() => {
    if (user && currentEmployee) {
      const canEdit = user.role === 'ADMIN' || user.role === 'HR' || user.employeeId === employeeId
      if (!canEdit) {
        router.push(`/dashboard/employees/${employeeId}`)
      }
    }
  }, [user, currentEmployee, employeeId, router])
  const handleProfileSubmit = async (data: EmployeeRegistration & { status?: EmployeeStatus }) => {
    const updateData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      icPassportNumber: data.icPassportNumber,
      phone: data.phone,
      department: data.department,
      position: data.position,
      hireDate: data.hireDate,
      status: data.status
    }
    await updateProfile(employeeId, updateData)
    router.push(`/dashboard/employees/${employeeId}`)
  }
  const handleFamilySubmit = async (data: Omit<FamilyMember, 'id'>[]) => {
    await updateFamilyDetails(employeeId, data)
    router.push(`/dashboard/employees/${employeeId}`)
  }
  const handleCancel = () => {
    router.push(`/dashboard/employees/${employeeId}`)
  }
  if ((loading && !currentEmployee) || (currentEmployee && currentEmployee.id !== employeeId)) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  if (!currentEmployee) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/employees')}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Employee Not Found</h1>
        </div>
      </div>
    )
  }
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/dashboard/employees/${employeeId}`)}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Employee</h1>
          <p className="text-sm text-gray-500">
            Update employee information for {currentEmployee.firstName} {currentEmployee.lastName}
          </p>
        </div>
      </div>
      <div className="flex p-1 bg-gray-100/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'profile'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <User className="h-4 w-4" />
          Profile Information
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
        </button>
      </div>
      <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-6 sm:p-8">
        {activeTab === 'profile' ? (
          <EmployeeForm
            employee={currentEmployee}
            onSubmit={handleProfileSubmit}
            onCancel={handleCancel}
            isSubmitting={loading}
          />
        ) : (
          <FamilyDetailsForm
            employeeId={employeeId}
            familyMembers={familyMembers}
            onSubmit={handleFamilySubmit}
            onCancel={handleCancel}
            isSubmitting={loading}
          />
        )}
      </div>
    </div>
  )
}
