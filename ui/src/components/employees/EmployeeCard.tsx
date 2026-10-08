/**
 * Employee Card Component
 *
 * Displays detailed employee information in a card layout.
 * Shows avatar, contact details, and employment information.
 *
 * Features:
 * - Avatar with employee initials
 * - Status badge with color coding
 * - Contact section (email, phone)
 * - Details section (IC/Passport, department, hire date)
 * - Hover effects on info items
 * - Malaysian date format (en-MY)
 */
'use client'

import { Employee } from '@/lib/api/types'
import { Building2, Calendar, CreditCard, Mail, Phone } from 'lucide-react'

/** Props for the EmployeeCard component */
interface EmployeeCardProps {
  /** Employee record to display */
  employee: Employee
}

/**
 * Renders an employee details card with contact and employment info.
 *
 * @param employee - Employee record to display
 * @returns Employee card with avatar, contact, and details sections
 */
export default function EmployeeCard({ employee }: EmployeeCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  return (
    <div className="bg-surface shadow-sm rounded-2xl overflow-hidden border border-white/50 card-hover">
      <div className="p-6">
        <div className="flex items-center gap-5 mb-8">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-inner shrink-0">
            {employee.firstName.charAt(0)}
            {employee.lastName.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-foreground-secondary font-medium text-lg">{employee.position}</p>
            <div className="mt-2">
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
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center group">
                <div className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:text-accent group-hover:bg-blue-50 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-foreground-secondary">Email</p>
                  <p className="text-sm text-foreground font-medium">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center group">
                <div className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:text-accent group-hover:bg-blue-50 transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-foreground-secondary">Phone</p>
                  <p className="text-sm text-foreground font-medium">{employee.phone}</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Details</h3>
            <div className="space-y-4">
              <div className="flex items-center group">
                <div className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:text-accent group-hover:bg-blue-50 transition-colors">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-foreground-secondary">IC/Passport</p>
                  <p className="text-sm text-foreground font-medium">{employee.icPassportNumber}</p>
                </div>
              </div>
              <div className="flex items-center group">
                <div className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:text-accent group-hover:bg-blue-50 transition-colors">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-foreground-secondary">Department</p>
                  <p className="text-sm text-foreground font-medium">{employee.department}</p>
                </div>
              </div>
              <div className="flex items-center group">
                <div className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:text-accent group-hover:bg-blue-50 transition-colors">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-foreground-secondary">Hire Date</p>
                  <p className="text-sm text-foreground font-medium">{formatDate(employee.hireDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
