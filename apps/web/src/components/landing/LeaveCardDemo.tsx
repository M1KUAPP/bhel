/**
 * Leave Card Demo Component
 *
 * An example leave application whose status loops from Pending to
 * Approved, illustrating the review step. With reduced motion it shows
 * the approved end state.
 */
import { CalendarDays, CircleCheck, Clock } from 'lucide-react'

/**
 * Renders the looping example leave card.
 *
 * @returns A decorative card describing one leave request
 */
export default function LeaveCardDemo() {
  return (
    <figure className="relative rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]">
      <figcaption className="absolute -top-3 left-6 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
        Example
      </figcaption>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-600">Annual leave</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">3 working days</p>
        </div>
        <p className="relative h-7 w-28">
          <span className="sr-only">Status: approved</span>
          <span
            aria-hidden="true"
            className="status-pending landing-loop absolute inset-0 inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-50 text-xs font-semibold text-amber-800"
          >
            <Clock className="h-3.5 w-3.5" />
            Pending
          </span>
          <span
            aria-hidden="true"
            className="status-approved landing-loop absolute inset-0 inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-50 text-xs font-semibold text-emerald-800"
          >
            <CircleCheck className="h-3.5 w-3.5" />
            Approved
          </span>
        </p>
      </div>
      <p className="mt-5 flex items-center gap-2 text-sm text-gray-600">
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        Monday to Wednesday, weekends skipped
      </p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="balance-bar landing-loop h-full rounded-full bg-accent" />
      </div>
      <p className="mt-2 text-xs text-gray-600">Annual balance: 11 of 14 days left once approved</p>
      <p className="status-comment landing-loop mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900">
        “Approved. Enjoy the break.” · HR
      </p>
    </figure>
  )
}
