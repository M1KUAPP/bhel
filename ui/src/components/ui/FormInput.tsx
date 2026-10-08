/**
 * Form Input Components
 *
 * Reusable form field components for React Hook Form integration.
 * Includes input, select, and textarea variants with consistent styling.
 *
 * Components:
 * - FormInput: Text input field (text, email, tel, date, password, number)
 * - FormSelect: Dropdown select field with options
 * - FormTextarea: Multi-line text input
 *
 * Features:
 * - React Hook Form integration via register prop
 * - Error message display from FieldError
 * - Required field indicator (red asterisk)
 * - Disabled state styling
 * - Consistent rounded-xl styling
 * - Focus ring and border transitions
 */
'use client'

import { FieldError, UseFormRegisterReturn } from 'react-hook-form'

/** Props for the FormInput component */
interface FormInputProps {
  /** HTML id attribute for the input */
  id: string
  /** Label text displayed above the input */
  label: string
  /** Input type (default: text) */
  type?: 'text' | 'email' | 'tel' | 'date' | 'password' | 'number'
  /** React Hook Form register return value */
  register: UseFormRegisterReturn
  /** Field error from React Hook Form */
  error?: FieldError
  /** Whether field is required (shows asterisk) */
  required?: boolean
  /** Whether field is disabled */
  disabled?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Styled text input field with label and error handling.
 *
 * @param props - FormInputProps
 * @returns Input field with label and optional error message
 */
export default function FormInput({
  id,
  label,
  type = 'text',
  register,
  error,
  required = false,
  disabled = false,
  placeholder,
  className = ''
}: FormInputProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        {...register}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {error && <p className="text-sm text-red-500 ml-1">{error.message}</p>}
    </div>
  )
}

/** Props for the FormSelect component */
interface FormSelectProps {
  /** HTML id attribute for the select */
  id: string
  /** Label text displayed above the select */
  label: string
  /** React Hook Form register return value */
  register: UseFormRegisterReturn
  /** Field error from React Hook Form */
  error?: FieldError
  /** Whether field is required (shows asterisk) */
  required?: boolean
  /** Whether field is disabled */
  disabled?: boolean
  /** Array of options with value and label */
  options: { value: string; label: string }[]
  /** Placeholder text for empty option */
  placeholder?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Styled select dropdown with label and error handling.
 *
 * @param props - FormSelectProps
 * @returns Select field with label, options, and optional error message
 */
export function FormSelect({
  id,
  label,
  register,
  error,
  required = false,
  disabled = false,
  options,
  placeholder = 'Select an option',
  className = ''
}: FormSelectProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={id}
        {...register}
        disabled={disabled}
        className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500 ml-1">{error.message}</p>}
    </div>
  )
}

/** Props for the FormTextarea component */
interface FormTextareaProps {
  /** HTML id attribute for the textarea */
  id: string
  /** Label text displayed above the textarea */
  label: string
  /** React Hook Form register return value */
  register: UseFormRegisterReturn
  /** Field error from React Hook Form */
  error?: FieldError
  /** Whether field is required (shows asterisk) */
  required?: boolean
  /** Whether field is disabled */
  disabled?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Number of visible text rows (default: 4) */
  rows?: number
  /** Additional CSS classes */
  className?: string
}

/**
 * Styled textarea with label and error handling.
 *
 * @param props - FormTextareaProps
 * @returns Textarea field with label and optional error message
 */
export function FormTextarea({
  id,
  label,
  register,
  error,
  required = false,
  disabled = false,
  placeholder,
  rows = 4,
  className = ''
}: FormTextareaProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        {...register}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {error && <p className="text-sm text-red-500 ml-1">{error.message}</p>}
    </div>
  )
}
