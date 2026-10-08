'use client'

/**
 * Leave Card Demo Component
 *
 * An example leave application on frosted glass. It loops from Pending to
 * Approved: the timeline fills, the balance drops from 14 to 11 days and
 * HR's comment arrives. It holds still while paused and shows the approved
 * end state when the user prefers reduced motion.
 */
import { CalendarDays, CircleCheck, Clock } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import useMotionState from './useMotionState'

/** Milliseconds the card spends in each state. */
const PENDING_MS = 2800
const APPROVED_MS = 4200

const TIMELINE = ['Submitted', 'In review', 'Approved'] as const

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Renders the looping example leave card.
 *
 * @returns A decorative card describing one leave request
 */
export default function LeaveCardDemo() {
  const motionState = useMotionState()
  const [cycleApproved, setCycleApproved] = useState(false)

  useEffect(() => {
    if (motionState !== 'running') return
    const timer = setTimeout(() => setCycleApproved((value) => !value), cycleApproved ? APPROVED_MS : PENDING_MS)
    return () => clearTimeout(timer)
  }, [motionState, cycleApproved])

  const approved = motionState === 'reduced' || cycleApproved
  const reached = approved ? 3 : 2

  return (
    <figure className="relative w-full max-w-md rounded-[28px] border border-white/15 bg-[#04102a]/45 p-6 text-white shadow-[0_40px_80px_-32px_rgb(0_0_0/0.65)] backdrop-blur-2xl backdrop-saturate-150 sm:p-7">
      <figcaption className="absolute -top-3 left-7 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#04102a]">
        Example
      </figcaption>
      <p className="sr-only">An annual leave request for three working days, approved by HR.</p>

      <div aria-hidden="true">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#7fd0ff] to-[#1a7bea] text-sm font-semibold">
              E
            </span>
            <div>
              <p className="text-sm font-semibold">Employee Test</p>
              <p className="text-xs text-white/65">Annual leave</p>
            </div>
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={approved ? 'approved' : 'pending'}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.9 }}
              transition={{ duration: 0.45, ease: EASE }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                approved ? 'bg-emerald-400/20 text-emerald-200' : 'bg-amber-300/20 text-amber-100'
              }`}
            >
              {approved ? <CircleCheck className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              {approved ? 'Approved' : 'Pending'}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm text-white/70">
              <CalendarDays className="h-4 w-4" />
              Mon 12 Oct → Wed 14 Oct
            </p>
            <p className="mt-1.5 text-3xl font-semibold tracking-tight">3 working days</p>
          </div>
        </div>

        <ol className="mt-6 grid grid-cols-3 gap-2">
          {TIMELINE.map((label, index) => (
            <li key={label}>
              <span className="block h-1 overflow-hidden rounded-full bg-white/15">
                <motion.span
                  className="block h-full origin-left rounded-full bg-gradient-to-r from-[#7fd0ff] to-white"
                  initial={false}
                  animate={{ scaleX: index < reached ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: index * 0.12 }}
                />
              </span>
              <span className={`mt-2 block text-xs ${index < reached ? 'text-white' : 'text-white/50'}`}>{label}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-2xl bg-black/20 p-4">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>Annual balance</span>
            <span className="font-semibold text-white tabular-nums">{approved ? 11 : 14} of 14 days left</span>
          </div>
          <span className="mt-3 block h-2 overflow-hidden rounded-full bg-white/10">
            <motion.span
              className="block h-full origin-left rounded-full bg-gradient-to-r from-[#1a7bea] to-[#7fd0ff]"
              initial={false}
              animate={{ scaleX: approved ? 11 / 14 : 1 }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          </span>
        </div>

        <div className="mt-4 h-12">
          <AnimatePresence initial={false}>
            {approved && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
                className="rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm text-[#04102a]"
              >
                “Approved. Enjoy the break.” <span className="text-[#04102a]/60">· HR</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </figure>
  )
}
