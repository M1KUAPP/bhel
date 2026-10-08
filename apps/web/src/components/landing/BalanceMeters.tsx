'use client'

/**
 * Balance Meters Component
 *
 * The five leave types and their yearly allowances as rings that draw and
 * count up the first time they scroll into view. Under reduced motion the
 * rings and numbers appear in their final state.
 */
import { animate, motion, useInView } from 'motion/react'
import { useEffect, useRef } from 'react'
import useMotionState from './useMotionState'

const ALLOWANCES = [
  { type: 'Annual', days: 14 },
  { type: 'Sick', days: 14 },
  { type: 'Emergency', days: 3 },
  { type: 'Maternity', days: 90 },
  { type: 'Paternity', days: 7 }
] as const

const RADIUS = 46

/**
 * One ring with a counter in the middle.
 *
 * @param props - Leave type, allowance and stagger index
 * @returns A card with an animated ring
 */
function Meter({ type, days, index }: { type: string; days: number; index: number }) {
  const cardRef = useRef<HTMLLIElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(cardRef, { once: true, amount: 0.6 })
  const motionState = useMotionState()

  useEffect(() => {
    const count = countRef.current
    if (!inView || !count || motionState === 'reduced') return
    const controls = animate(0, days, {
      duration: 1.4,
      delay: index * 0.12,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (value) => {
        count.textContent = String(Math.round(value))
      }
    })
    return () => controls.stop()
  }, [inView, days, index, motionState])

  return (
    <li
      ref={cardRef}
      className="group relative flex flex-col items-center rounded-[28px] border border-gray-200/80 bg-white px-4 pt-7 pb-6 transition-transform duration-500 ease-out hover:-translate-y-1"
    >
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
          <defs>
            <linearGradient id={`ring-${type}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7fd0ff" />
              <stop offset="1" stopColor="#1a7bea" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#eef2f7" strokeWidth="6" />
          <motion.circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={`url(#ring-${type})`}
            strokeWidth="6"
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: inView || motionState === 'reduced' ? 1 : 0 }}
            transition={{ duration: 1.4, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center">
          <span className="text-center">
            <span ref={countRef} className="block text-4xl font-semibold tracking-tight text-gray-900 tabular-nums">
              {days}
            </span>
            <span className="block text-xs text-gray-500">days</span>
          </span>
        </span>
      </div>
      <p className="mt-5 font-semibold text-gray-900">{type}</p>
      <p className="text-sm text-gray-500">per year</p>
    </li>
  )
}

/**
 * Renders the allowance rings.
 *
 * @returns A list of five meters
 */
export default function BalanceMeters() {
  return (
    <ul aria-label="Yearly leave allowances" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {ALLOWANCES.map(({ type, days }, index) => (
        <Meter key={type} type={type} days={days} index={index} />
      ))}
    </ul>
  )
}
