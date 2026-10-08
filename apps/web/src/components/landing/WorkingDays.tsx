'use client'

/**
 * Working Days Component
 *
 * Two weeks of October 2026. A request from Thursday the 15th to Tuesday the
 * 20th sweeps across the calendar; weekend days are skipped, the counter
 * stops at four working days, then the leave rules check off one by one.
 * It plays once when scrolled into view and can be replayed. Under reduced
 * motion, or while paused, it shows the finished state.
 */
import { Check, RotateCcw } from 'lucide-react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import useMotionState from './useMotionState'

/** Monday 12 to Sunday 25 October 2026. */
const DAYS = Array.from({ length: 14 }, (_, index) => ({ date: 12 + index, weekend: index % 7 >= 5 }))
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

/** The request covers the 15th to the 20th. */
const FIRST = 15
const LAST = 20
const SELECTED = DAYS.filter(({ date }) => date >= FIRST && date <= LAST)

const RULES = [
  { label: 'Working days counted, weekends skipped', where: ['Form', 'RMI server'] },
  { label: 'Fits the remaining balance', where: ['Form', 'RMI server'] },
  { label: 'Stays within one calendar year', where: ['RMI server'] },
  { label: 'No overlap with pending or approved leave', where: ['RMI server'] }
] as const

/** Milliseconds between swept days, and between rules. */
const DAY_MS = 420
const RULE_MS = 380

/** The final step: every day swept and every rule checked. */
const DONE = SELECTED.length + RULES.length

/**
 * Renders the calendar sweep and the rule checklist.
 *
 * @returns The working-days demo
 */
export default function WorkingDays() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const motionState = useMotionState()
  const [step, setStep] = useState(0)
  const [run, setRun] = useState(0)

  useEffect(() => {
    if (!inView || motionState !== 'running' || step >= DONE) return
    const delay = step === 0 ? 500 : step < SELECTED.length ? DAY_MS : RULE_MS
    const timer = setTimeout(() => setStep((value) => value + 1), delay)
    return () => clearTimeout(timer)
  }, [inView, motionState, step, run])

  const shown = motionState === 'running' ? step : DONE
  const swept = SELECTED.slice(0, Math.min(shown, SELECTED.length))
  const workingDays = swept.filter(({ weekend }) => !weekend).length
  const rulesChecked = Math.max(0, shown - SELECTED.length)

  const replay = () => {
    setStep(0)
    setRun((value) => value + 1)
  }

  return (
    <div ref={ref} className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-[28px] border border-gray-200/80 bg-white p-5 sm:p-7">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-semibold text-gray-900">October 2026</p>
          <p className="text-sm text-gray-500">Thu 15 → Tue 20</p>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-1.5 text-center sm:gap-2" aria-hidden="true">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="pb-1 text-[11px] font-medium tracking-wide text-gray-500 uppercase">
              {label}
            </span>
          ))}
          {DAYS.map(({ date, weekend }) => {
            const isSwept = swept.some((day) => day.date === date)
            const counted = isSwept && !weekend
            const skipped = isSwept && weekend
            return (
              <span
                key={date}
                className={`relative grid aspect-square place-items-center rounded-xl text-sm font-medium transition-colors duration-300 sm:rounded-2xl sm:text-base ${
                  counted
                    ? 'bg-[#1570dd] text-white shadow-[0_10px_24px_-12px_#1570dd]'
                    : skipped
                      ? 'bg-[repeating-linear-gradient(135deg,#eef2f7_0_6px,#f8fafc_6px_12px)] text-gray-500 line-through'
                      : weekend
                        ? 'bg-gray-50 text-gray-500'
                        : 'bg-gray-50 text-gray-700'
                }`}
              >
                {date}
                {counted && (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0.8 }}
                    animate={{ scale: 1.25, opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-[inherit] border-2 border-[#1570dd]"
                  />
                )}
              </span>
            )
          })}
        </div>
        <div className="mt-6 flex items-end justify-between gap-4 border-t border-gray-100 pt-5">
          <p aria-live="polite">
            <span className="text-5xl font-semibold tracking-tight text-gray-900 tabular-nums">{workingDays}</span>
            <span className="ml-2 text-gray-500">working {workingDays === 1 ? 'day' : 'days'}</span>
          </p>
          <p className="text-right text-sm text-gray-500">
            {swept.length} calendar {swept.length === 1 ? 'day' : 'days'}
            <br />
            {swept.filter(({ weekend }) => weekend).length} skipped
          </p>
        </div>
      </div>

      <div className="flex flex-col rounded-[28px] border border-gray-200/80 bg-white p-5 sm:p-7">
        <p className="font-semibold text-gray-900">Checked before it reaches HR</p>
        <ul className="mt-5 space-y-3">
          {RULES.map(({ label, where }, index) => {
            const checked = index < rulesChecked
            return (
              <li key={label} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
                    checked ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-transparent'
                  }`}
                >
                  <AnimatePresence initial={false}>
                    {checked && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
                        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <span>
                  <span className={`block transition-colors ${checked ? 'text-gray-900' : 'text-gray-500'}`}>
                    {label}
                  </span>
                  <span className="mt-1 flex gap-1.5">
                    {where.map((place) => (
                      <span
                        key={place}
                        className="rounded-full bg-[#eaf3ff] px-2 py-0.5 text-[11px] font-medium text-[#0b4fb3]"
                      >
                        {place}
                      </span>
                    ))}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
        <button
          type="button"
          onClick={replay}
          disabled={motionState !== 'running'}
          className="mt-auto inline-flex items-center gap-2 self-start rounded-full border border-gray-200 px-4 py-2 pt-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 max-lg:mt-6"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Replay
        </button>
      </div>
    </div>
  )
}
