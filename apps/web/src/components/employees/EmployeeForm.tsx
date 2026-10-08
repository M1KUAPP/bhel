/**
 * Employee Form Component
 *
 * Reusable form for creating and editing employee records.
 * Supports registration mode and edit mode with different field restrictions.
 *
 * Features:
 * - Zod schema validation for all fields
 * - Auto-generated email based on first/last name (registration only)
 * - Two form sections: Basic Information and Employment Information
 * - Status field appears only in edit mode
 * - Profile edit mode restricts certain fields
 * - React Hook Form for state management
 *
 * Modes:
 * - Registration: All fields editable, no status field
 * - Edit: All fields editable, includes status field
 * - Profile Edit: Limited fields (email, phone only)
 */
'use client'

import FormButtons from '@/components/ui/FormButtons'
import FormInput, { FormSelect } from '@/components/ui/FormInput'
import { Employee } from '@/lib/api/types'
import { EMAIL_DOMAIN } from '@/lib/config'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

/** Zod schema for employee registration (no status field) */
const registrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  icPassportNumber: z.string().min(1, 'IC/Passport is required').max(20),
  phone: z.string().min(1, 'Phone number is required').max(20),
  department: z.string().min(1, 'Department is required').max(50),
  position: z.string().min(1, 'Position is required').max(100),
  hireDate: z.string().min(1, 'Hire date is required')
})

/** Extended schema for editing (includes status field) */
const editSchema = registrationSchema.extend({
  status: z.enum(['active', 'inactive', 'on_leave'], { message: 'Status is required' })
})

/** Form data type for registration */
type RegistrationFormData = z.infer<typeof registrationSchema>

/** Form data type for editing */
type EditFormData = z.infer<typeof editSchema>

/** Union type for form data */
type FormData = RegistrationFormData | EditFormData

/** Props for the EmployeeForm component */
interface EmployeeFormProps {
  /** Existing employee for edit mode (undefined for registration) */
  employee?: Employee
  /** Callback when form is submitted */
  onSubmit: (data: FormData) => void
  /** Callback when cancel is clicked */
  onCancel: () => void
  /** Whether form is currently submitting */
  isSubmitting?: boolean
  /** Whether this is a profile self-edit (restricts fields) */
  isProfileEdit?: boolean
}

/**
 * Employee registration/edit form with validation.
 *
 * @param employee - Existing employee for edit mode
 * @param onSubmit - Form submission callback
 * @param onCancel - Cancel button callback
 * @param isSubmitting - Loading state for submit button
 * @param isProfileEdit - Restricts editable fields for profile self-edit
 * @returns Employee form with basic and employment sections
 */
export default function EmployeeForm({
  employee,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isProfileEdit = false
}: EmployeeFormProps) {
  const schema = employee ? editSchema : registrationSchema
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm<EditFormData | RegistrationFormData>({
    resolver: zodResolver(schema),
    defaultValues: employee
      ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          icPassportNumber: employee.icPassportNumber,
          phone: employee.phone,
          department: employee.department,
          position: employee.position,
          hireDate: employee.hireDate,
          status: employee.status as 'active' | 'inactive' | 'on_leave'
        }
      : undefined
  })
  const [firstName, lastName] = useWatch({ control, name: ['firstName', 'lastName'] })
  useEffect(() => {
    if (!employee && firstName && lastName) {
      const autoEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${EMAIL_DOMAIN}`
      setValue('email', autoEmail)
    } else if (!employee && (!firstName || !lastName)) {
      setValue('email', '')
    }
  }, [firstName, lastName, employee, setValue])

  const submitLabel = isProfileEdit ? 'Update Profile' : employee ? 'Update Employee' : 'Register Employee'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-surface/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="firstName"
            label="First Name"
            register={register('firstName')}
            error={errors.firstName}
            required
            disabled={isProfileEdit}
          />
          <FormInput
            id="lastName"
            label="Last Name"
            register={register('lastName')}
            error={errors.lastName}
            required
            disabled={isProfileEdit}
          />
          <FormInput id="email" label="Email" type="email" register={register('email')} error={errors.email} required />
          <FormInput
            id="icPassportNumber"
            label="IC/Passport"
            register={register('icPassportNumber')}
            error={errors.icPassportNumber}
            required
            disabled={isProfileEdit}
          />
          <FormInput
            id="phone"
            label="Phone Number"
            type="tel"
            register={register('phone')}
            error={errors.phone}
            required
          />
        </div>
      </div>
      <div className="bg-surface/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Employment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="department"
            label="Department"
            register={register('department')}
            error={errors.department}
            required
            disabled={isProfileEdit}
          />
          <FormInput
            id="position"
            label="Position"
            register={register('position')}
            error={errors.position}
            required
            disabled={isProfileEdit}
          />
          <FormInput
            id="hireDate"
            label="Hire Date"
            type="date"
            register={register('hireDate')}
            error={errors.hireDate}
            required
            disabled={isProfileEdit}
          />
          {employee && (
            <FormSelect
              id="status"
              label="Status"
              register={register('status' as keyof EditFormData)}
              error={'status' in errors ? errors.status : undefined}
              required
              disabled={isProfileEdit}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'on_leave', label: 'On Leave' }
              ]}
              placeholder="Select status"
            />
          )}
        </div>
      </div>
      <FormButtons onCancel={onCancel} isSubmitting={isSubmitting} submitLabel={submitLabel} />
    </form>
  )
}
