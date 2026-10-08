/**
 * Employees List Page Component
 *
 * Displays a searchable and filterable list of all employees.
 * Accessible only to HR and ADMIN roles.
 *
 * Features:
 * - Search by name, email, or IC/Passport number
 * - Filter by department and status
 * - Employee count display with filter results
 * - "Register Employee" button for HR/ADMIN users
 * - Employee table with actions (view, edit)
 * - Loading spinner during data fetch
 * - Error toast notifications
 */
'use client'

import EmployeeTable from '@/components/employees/EmployeeTable'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useEmployeeStore } from '@/lib/store/useEmployeeStore'
import { Filter, Plus, Search, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Employee list page with search and filtering capabilities.
 *
 * @returns Employee list with filters and action buttons
 */
export default function EmployeesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { employees, loading, fetchEmployees, clearError } = useEmployeeStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  useEffect(() => {
    clearError()
    fetchEmployees()
  }, [fetchEmployees, clearError])
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      searchTerm === '' ||
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.icPassportNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === '' || employee.department === departmentFilter
    const matchesStatus = statusFilter === '' || employee.status === statusFilter
    return matchesSearch && matchesDepartment && matchesStatus
  })
  const departments = Array.from(new Set(employees.map((e) => e.department))).sort()
  const canManageEmployees = user?.role === 'ADMIN' || user?.role === 'HR'
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-3.5 rounded-2xl bg-white shadow-sm border border-gray-100 text-foreground">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Employees</h1>
            <p className="text-foreground-secondary mt-1 text-lg">Manage employee records and information</p>
          </div>
        </div>
        {canManageEmployees && (
          <button
            onClick={() => router.push('/dashboard/employees/new')}
            className="inline-flex items-center px-6 py-3.5 border border-transparent rounded-full shadow-lg shadow-blue-500/20 text-sm font-semibold text-white bg-accent hover:bg-accent-hover hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            <Plus className="h-5 w-5 mr-2" />
            Register Employee
          </button>
        )}
      </div>
      <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or IC/Passport..."
                className="block w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="department"
              className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5"
            >
              Department
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                id="department"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 flex items-center justify-between">
          <span>
            Showing <span className="font-medium text-gray-900">{filteredEmployees.length}</span> of{' '}
            <span className="font-medium text-gray-900">{employees.length}</span> employees
          </span>
        </div>
      </div>
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      )}
      {!loading && (
        <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl overflow-hidden">
          <EmployeeTable employees={filteredEmployees} showActions={true} />
        </div>
      )}
    </div>
  )
}
