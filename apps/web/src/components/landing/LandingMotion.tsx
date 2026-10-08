'use client'

/**
 * Landing Motion Component
 *
 * Applies the page's motion state to every Motion animation inside it:
 * transforms stop while the user prefers reduced motion or has paused the page.
 */
import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import useMotionState from './useMotionState'

/**
 * Wraps the landing page in a Motion config that follows the motion toggle.
 *
 * @param props - The page content
 * @returns The content inside a MotionConfig
 */
export default function LandingMotion({ children }: { children: ReactNode }) {
  const state = useMotionState()
  return <MotionConfig reducedMotion={state === 'running' ? 'never' : 'always'}>{children}</MotionConfig>
}
