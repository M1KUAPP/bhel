'use client'

/**
 * Motion State Hook
 *
 * Reports whether the landing page's loops may run: `reduced` when the user
 * prefers reduced motion, `paused` while `<html data-motion="paused">` is set
 * by the motion toggle, and `running` otherwise.
 */
import { useSyncExternalStore } from 'react'

export type MotionState = 'running' | 'paused' | 'reduced'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(REDUCED_MOTION)
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] })
  media.addEventListener('change', onChange)
  return () => {
    observer.disconnect()
    media.removeEventListener('change', onChange)
  }
}

function getSnapshot(): MotionState {
  if (window.matchMedia(REDUCED_MOTION).matches) return 'reduced'
  return document.documentElement.dataset.motion === 'paused' ? 'paused' : 'running'
}

/**
 * Subscribes to the reduced-motion preference and the page's pause toggle.
 *
 * @returns The current motion state; `running` during server rendering
 */
export default function useMotionState(): MotionState {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'running')
}
