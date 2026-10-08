/**
 * Edit Profile Page Component
 *
 * Form page for updating the current user's profile and family details.
 * Restricts editing of certain fields (IC, department, etc.) - contact HR for changes.
 *
 * Features:
 * - Tabbed interface (Profile Information, Family Details)
 * - Limited profile fields (email, phone only for regular employees)
 * - Full family member CRUD functionality
 * - Restricted fields info banner
 * - Loading spinner and error states
 * - Redirects to profile on successful update
 */
'use client'

import EmployeeForm from '@/components/employees/EmployeeForm'
import FamilyDetailsForm from '@/components/employees/FamilyDetailsForm'
import { EmployeeRegistration, FamilyMember } from '@/lib/api/types'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useEmployeeStore } from '@/lib/store/useEmployeeStore'
import { ArrowLeft, Info, User, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Profile edit page with restricted field editing.
 *
 * @returns Profile edit form with tabbed interface
 */
export default function EditProfilePage() {
  const router = useRouter()
  const { user, initializeAuth } = useAuthStore()
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
    if (user?.employeeId) {
      fetchEmployee(user.employeeId)
      fetchFamilyDetails(user.employeeId)
    }
  }, [user?.employeeId, fetchEmployee, fetchFamilyDetails])
  const handleProfileSubmit = async (data: EmployeeRegistration) => {
    if (!user?.employeeId) return
    const updateData = {
      email: data.email,
      phone: data.phone
    }
    await updateProfile(user.employeeId, updateData)
    await initializeAuth()
    router.push('/dashboard/profile')
  }
  const handleFamilySubmit = async (data: Omit<FamilyMember, 'id'>[]) => {
    if (!user?.employeeId) return
    await updateFamilyDetails(user.employeeId, data)
    router.push('/dashboard/profile')
  }
  const handleCancel = () => {
    router.push('/dashboard/profile')
  }
  if ((loading && !currentEmployee) || (currentEmployee && currentEmployee.id !== user?.employeeId)) {
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
            onClick={() => router.push('/dashboard/profile')}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Profile Not Found</h1>
        </div>
      </div>
    )
  }
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/profile')}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Profile</h1>
          <p className="text-sm text-gray-500">
            Update your personal information for {currentEmployee.firstName} {currentEmployee.lastName}
          </p>
        </div>
      </div>
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Restricted Fields</p>
          <p className="leading-relaxed opacity-90">
            Some fields like IC/Passport, Date of Birth, Gender, Department, Position, and Status cannot be edited
            directly. Only contact information and emergency contacts can be updated. For changes to other fields,
            please contact your HR department.
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
            isProfileEdit={true}
          />
        ) : (
          <FamilyDetailsForm
            employeeId={user?.employeeId || 0}
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
