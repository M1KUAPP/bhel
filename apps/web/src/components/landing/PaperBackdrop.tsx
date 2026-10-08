'use client'

/**
 * Paper Backdrop Component
 *
 * A Paper Shaders neuro-noise field, like signals crossing a network, behind
 * the architecture section. Paper creates its WebGL context as soon as it
 * mounts, so this waits until the section nears the viewport. It skips WebGL
 * on Save-Data or weak devices, renders at most one pass per CSS pixel and
 * stops animating while paused or under reduced motion.
 */
import { NeuroNoise } from '@paper-design/shaders-react'
import { useEffect, useRef, useState } from 'react'
import useMotionState from './useMotionState'

/** Caps the drawing buffer near a 1600×1000 CSS-pixel section at a 1.5 ratio. */
const MAX_PIXEL_COUNT = 1600 * 1000 * 2.25

/** Whether the device asked to save data or is too weak for continuous WebGL. */
function prefersLightweight(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return Boolean(connection?.saveData) || navigator.hardwareConcurrency <= 2
}

/**
 * Fills its positioned parent with the animated field.
 *
 * @param props - Extra class names
 * @returns A container that mounts the shader near the viewport
 */
export default function PaperBackdrop({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const motionState = useMotionState()

  useEffect(() => {
    const element = ref.current
    if (!element || prefersLightweight()) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setMounted(true)
        observer.disconnect()
      },
      { rootMargin: '300px 0px' }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden bg-[radial-gradient(80%_70%_at_70%_30%,#0b3a8a,#030b1f_75%)] ${className}`}
    >
      {mounted && (
        <NeuroNoise
          colorBack="#030b1f"
          colorMid="#0b4fb3"
          colorFront="#9fdcff"
          brightness={0.04}
          contrast={0.32}
          scale={1.4}
          speed={motionState === 'running' ? 0.35 : 0}
          minPixelRatio={1}
          maxPixelCount={MAX_PIXEL_COUNT}
          className="h-full w-full"
        />
      )}
    </div>
  )
}
