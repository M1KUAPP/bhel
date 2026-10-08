/**
 * Employee Table Component
 *
 * Displays a table of employees with sortable columns and action buttons.
 * Shows employee details including name, email, department, position, and status.
 *
 * Features:
 * - Responsive table with horizontal scroll on mobile
 * - Status badges with color coding (active/inactive/on_leave)
 * - View and Edit action buttons (optional)
 * - Empty state message when no employees found
 * - IC/Passport number displayed under name
 */
'use client'

import { Employee } from '@/lib/api/types'
import { Edit, Eye } from 'lucide-react'
import Link from 'next/link'

/** Props for the EmployeeTable component */
interface EmployeeTableProps {
  /** Array of employee records to display */
  employees: Employee[]
  /** Whether to show View/Edit action buttons (default: true) */
  showActions?: boolean
}

/**
 * Renders a table of employees with optional action buttons.
 *
 * @param employees - Array of employee records
 * @param showActions - Whether to display action buttons
 * @returns Employee table or empty state message
 */
export default function EmployeeTable({ employees, showActions = true }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
          <Eye className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900">No employees found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
      </div>
    )
  }
  return (
    <div className="overflow-x-auto bg-surface/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200/60">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            {showActions && (
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200/60">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {employee.firstName} {employee.lastName}
                </div>
                <div className="text-sm text-gray-500">{employee.icPassportNumber}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2.5 py-0.5 inline-flex text-xs font-bold uppercase tracking-wide rounded-full ${
                    employee.status === 'active'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : employee.status === 'inactive'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}
                >
                  {employee.status.replace('_', ' ')}
                </span>
              </td>
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/dashboard/employees/${employee.id}`}
                      className="text-gray-400 hover:text-gray-900 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/dashboard/employees/${employee.id}/edit`}
                      className="text-gray-400 hover:text-gray-900 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
