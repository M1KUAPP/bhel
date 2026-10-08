/**
 * Form Buttons Component
 *
 * Standardized submit and cancel button pair for forms.
 * Handles loading state and disabled states.
 *
 * Features:
 * - Submit and Cancel buttons with consistent styling
 * - Loading state with customizable "submitting" text
 * - Disabled state (both buttons when submitting)
 * - Customizable button labels
 * - Right-aligned flex container
 * - Rounded-xl styling to match form inputs
 */
'use client'

/** Props for the FormButtons component */
interface FormButtonsProps {
  /** Callback when cancel button is clicked */
  onCancel: () => void
  /** Whether form is currently submitting */
  isSubmitting: boolean
  /** Submit button text (default: "Save") */
  submitLabel?: string
  /** Submit button text while submitting (default: "Saving...") */
  submittingLabel?: string
  /** Cancel button text (default: "Cancel") */
  cancelLabel?: string
  /** Additional disabled condition for submit */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Submit and cancel button pair for forms.
 *
 * @param props - FormButtonsProps
 * @returns Right-aligned button group with cancel and submit
 */
export default function FormButtons({
  onCancel,
  isSubmitting,
  submitLabel = 'Save',
  submittingLabel = 'Saving...',
  cancelLabel = 'Cancel',
  disabled = false,
  className = ''
}: FormButtonsProps) {
  return (
    <div className={`flex justify-end gap-3 ${className}`}>
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-6 py-2.5 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={isSubmitting || disabled}
        className="px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </div>
  )
}
