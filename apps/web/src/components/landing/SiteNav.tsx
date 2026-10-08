'use client'

/**
 * Site Nav Component
 *
 * The landing page's top bar. It starts transparent over the hero and
 * settles into a frosted pill once the page scrolls.
 */
import { motion, useMotionTemplate, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'

const LINKS = [
  { href: '#leave', label: 'Leave' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#architecture', label: 'Architecture' }
] as const

/**
 * Renders the fixed navigation bar.
 *
 * @returns The header with brand, section links and sign-in
 */
export default function SiteNav() {
  const { scrollY } = useScroll()
  const settle = useTransform(scrollY, [0, 120], [0, 1])
  const background = useMotionTemplate`rgb(4 16 40 / ${useTransform(settle, [0, 1], [0, 0.9])})`
  const border = useMotionTemplate`rgb(255 255 255 / ${useTransform(settle, [0, 1], [0, 0.12])})`
  const blur = useMotionTemplate`blur(${useTransform(settle, [0, 1], [0, 18])}px) saturate(${useTransform(settle, [0, 1], [100, 160])}%)`
  const paddingY = useTransform(settle, [0, 1], [14, 8])

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4">
      <motion.nav
        aria-label="Main"
        style={{
          backgroundColor: background,
          borderColor: border,
          backdropFilter: blur,
          WebkitBackdropFilter: blur,
          paddingTop: paddingY,
          paddingBottom: paddingY
        }}
        className="mx-auto flex max-w-6xl items-center justify-between rounded-full border pr-2 pl-4 text-white"
      >
        <Link href="/" className="group flex items-center gap-2.5 font-semibold tracking-tight">
          <Image
            src="/icon.svg"
            alt=""
            width={30}
            height={30}
            unoptimized
            loading="eager"
            className="transition-transform duration-500 ease-out group-hover:-rotate-12"
          />
          BHEL HRMS
        </Link>
        <div className="flex items-center gap-1 text-sm font-medium">
          {LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="hidden rounded-full px-3.5 py-2 text-white/75 transition-colors hover:bg-white/10 hover:text-white md:inline"
            >
              {label}
            </a>
          ))}
          <Link
            href="/login"
            className="ml-2 rounded-full bg-white px-4 py-2 text-[#04102a] transition-transform hover:-translate-y-px"
          >
            Sign in
          </Link>
        </div>
      </motion.nav>
    </header>
  )
}
