/**
 * Family Details Form Component
 *
 * Dynamic form for managing employee family members.
 * Supports adding, editing, and removing family member entries.
 *
 * Features:
 * - Dynamic field array for multiple family members
 * - Add/Remove family member buttons
 * - Zod validation for each member
 * - Relationship dropdown (spouse, child, parent, sibling, other)
 * - Optional date of birth and contact number
 * - Empty state when no family members
 * - React Hook Form with useFieldArray
 */
'use client'

import { FamilyMember } from '@/lib/api/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Users } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

/** Zod schema for a single family member */
const familyMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  relationship: z
    .enum(['spouse', 'child', 'parent', 'sibling', 'other', ''], {
      message: 'Please select a relationship'
    })
    .refine((val) => val !== '', { message: 'Please select a relationship' }),
  dateOfBirth: z.string().optional(),
  contactNumber: z
    .string()
    .regex(/^\+?[0-9\s-()]*$/, 'Invalid phone number')
    .optional()
    .or(z.literal(''))
})

/** Schema for the entire form (array of family members) */
const familyDetailsSchema = z.object({
  familyMembers: z.array(familyMemberSchema)
})

/** Form values before validation (relationship may still be empty) */
type FamilyDetailsFormInput = z.input<typeof familyDetailsSchema>

/** Form data type inferred from schema */
type FamilyDetailsFormData = z.infer<typeof familyDetailsSchema>

/** Props for the FamilyDetailsForm component */
interface FamilyDetailsFormProps {
  /** ID of the employee these family members belong to */
  employeeId: number
  /** Existing family members to pre-populate */
  familyMembers?: FamilyMember[]
  /** Callback when form is submitted */
  onSubmit: (data: Omit<FamilyMember, 'id'>[]) => void
  /** Callback when cancel is clicked */
  onCancel: () => void
  /** Whether form is currently submitting */
  isSubmitting?: boolean
}

/**
 * Family details form with dynamic member entries.
 *
 * @param employeeId - Employee ID for family member records
 * @param familyMembers - Existing family members to edit
 * @param onSubmit - Form submission callback
 * @param onCancel - Cancel button callback
 * @param isSubmitting - Loading state for submit button
 * @returns Dynamic family member form
 */
export default function FamilyDetailsForm({
  employeeId,
  familyMembers = [],
  onSubmit,
  onCancel,
  isSubmitting = false
}: FamilyDetailsFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FamilyDetailsFormInput, unknown, FamilyDetailsFormData>({
    resolver: zodResolver(familyDetailsSchema),
    defaultValues: {
      familyMembers:
        familyMembers.length > 0
          ? familyMembers.map((fm) => ({
              name: fm.name,
              relationship: fm.relationship,
              dateOfBirth: fm.dateOfBirth || '',
              contactNumber: fm.contactNumber || ''
            }))
          : []
    }
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'familyMembers'
  })
  const handleFormSubmit = (data: FamilyDetailsFormData) => {
    const formattedData = data.familyMembers.map((fm) => ({
      employeeId,
      name: fm.name,
      relationship: fm.relationship as 'spouse' | 'child' | 'parent' | 'sibling' | 'other',
      dateOfBirth: fm.dateOfBirth || undefined,
      contactNumber: fm.contactNumber || undefined
    }))
    onSubmit(formattedData)
  }
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-surface/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Family Members</h3>
          <button
            type="button"
            onClick={() => append({ name: '', relationship: '', dateOfBirth: '', contactNumber: '' })}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Family Member
          </button>
        </div>
        {fields.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No family members added yet</h3>
            <p className="mt-1 text-sm text-gray-500">Click &quot;Add Family Member&quot; to get started.</p>
          </div>
        )}
        <div className="space-y-6">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-white/50 border border-gray-200 rounded-xl p-6 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-md font-semibold text-gray-900">Family Member {index + 1}</h4>
                {fields.length > 0 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                    title="Remove"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label
                    htmlFor={`familyMembers.${index}.name`}
                    className="block text-sm font-medium text-gray-700 ml-1"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id={`familyMembers.${index}.name`}
                    {...register(`familyMembers.${index}.name`)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400"
                  />
                  {errors.familyMembers?.[index]?.name && (
                    <p className="text-sm text-red-500 ml-1">{errors.familyMembers[index]?.name?.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor={`familyMembers.${index}.relationship`}
                    className="block text-sm font-medium text-gray-700 ml-1"
                  >
                    Relationship *
                  </label>
                  <div className="relative">
                    <select
                      id={`familyMembers.${index}.relationship`}
                      {...register(`familyMembers.${index}.relationship`)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 appearance-none"
                    >
                      <option value="">Select relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.familyMembers?.[index]?.relationship && (
                    <p className="text-sm text-red-500 ml-1">{errors.familyMembers[index]?.relationship?.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor={`familyMembers.${index}.dateOfBirth`}
                    className="block text-sm font-medium text-gray-700 ml-1"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id={`familyMembers.${index}.dateOfBirth`}
                    {...register(`familyMembers.${index}.dateOfBirth`)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900"
                  />
                  {errors.familyMembers?.[index]?.dateOfBirth && (
                    <p className="text-sm text-red-500 ml-1">{errors.familyMembers[index]?.dateOfBirth?.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor={`familyMembers.${index}.contactNumber`}
                    className="block text-sm font-medium text-gray-700 ml-1"
                  >
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    id={`familyMembers.${index}.contactNumber`}
                    {...register(`familyMembers.${index}.contactNumber`)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400"
                  />
                  {errors.familyMembers?.[index]?.contactNumber && (
                    <p className="text-sm text-red-500 ml-1">{errors.familyMembers[index]?.contactNumber?.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2.5 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-all duration-200"
        >
          {isSubmitting ? 'Saving...' : 'Save Family Details'}
        </button>
      </div>
    </form>
  )
}
