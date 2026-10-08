/**
 * New Employee Registration Page Component
 *
 * Form page for registering new employees in the system.
 * Accessible only to HR and ADMIN roles.
 *
 * Features:
 * - Employee registration form with validation
 * - Role-based access control (redirects non-HR/ADMIN users)
 * - Error message display on submission failure
 * - Redirects to employee list on successful registration
 * - Back navigation to employee list
 */
'use client'

import EmployeeForm from '@/components/employees/EmployeeForm'
import { EmployeeRegistration } from '@/lib/api/types'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useEmployeeStore } from '@/lib/store/useEmployeeStore'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * New employee registration page with form.
 *
 * @returns Employee registration form page
 */
export default function NewEmployeePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { loading, registerEmployee } = useEmployeeStore()
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'HR') {
      router.push('/dashboard/employees')
    }
  }, [user, router])
  const handleSubmit = async (data: EmployeeRegistration) => {
    await registerEmployee(data)
    router.push('/dashboard/employees')
  }
  const handleCancel = () => {
    router.push('/dashboard/employees')
  }
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/employees')}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Register Employee</h1>
          <p className="text-sm text-gray-500">Create a new employee record</p>
        </div>
      </div>
      <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-6 sm:p-8">
        <EmployeeForm onSubmit={handleSubmit} onCancel={handleCancel} isSubmitting={loading} />
      </div>
    </div>
  )
}
