'use client'

/**
 * Motion Toggle Component
 *
 * Pauses and resumes the landing page's looping animations by setting
 * `data-motion="paused"` on `<html>`; the shaders and CSS loops follow it.
 * Hidden when the user already prefers reduced motion.
 */
import { Pause, Play } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Floating button that toggles background motion.
 *
 * @returns The toggle button
 */
export default function MotionToggle() {
  const [paused, setPaused] = useState(false)

  useEffect(
    () => () => {
      delete document.documentElement.dataset.motion
    },
    []
  )

  const toggle = () => {
    const next = !paused
    setPaused(next)
    if (next) document.documentElement.dataset.motion = 'paused'
    else delete document.documentElement.dataset.motion
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={paused}
      className="motion-toggle fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#071633]/85 px-4 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-[#0b2350] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
      {paused ? 'Play motion' : 'Pause motion'}
    </button>
  )
}
