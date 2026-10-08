/**
 * Home Page Component
 *
 * The one-page landing for BHEL HRMS. Sunlight through leaves ("komorebi")
 * frames the hero and the call to action; between them the page walks
 * through leave balances, working days, roles, the eight steps and the
 * distributed architecture.
 */
import ArchitectureFlow from '@/components/landing/ArchitectureFlow'
import BalanceMeters from '@/components/landing/BalanceMeters'
import LandingMotion from '@/components/landing/LandingMotion'
import LeaveCardDemo from '@/components/landing/LeaveCardDemo'
import MotionToggle from '@/components/landing/MotionToggle'
import PaperBackdrop from '@/components/landing/PaperBackdrop'
import Reveal from '@/components/landing/Reveal'
import RoleSidebar from '@/components/landing/RoleSidebar'
import ShaderBackground, { type ShaderColor } from '@/components/landing/ShaderBackground'
import SiteNav from '@/components/landing/SiteNav'
import StackMarquee from '@/components/landing/StackMarquee'
import StepsShowcase from '@/components/landing/StepsShowcase'
import WorkingDays from '@/components/landing/WorkingDays'
import { ArrowDown, ArrowRight, ArrowUpRight, KeyRound, Lock, ShieldCheck } from 'lucide-react'
import localFont from 'next/font/local'
import Link from 'next/link'
import type { ReactNode } from 'react'

const instrumentSerif = localFont({
  src: [
    { path: './fonts/instrument-serif-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/instrument-serif-latin-400-italic.woff2', weight: '400', style: 'italic' }
  ],
  variable: '--font-instrument-serif',
  display: 'swap'
})

const REPOSITORY_URL = 'https://github.com/M1KUAPP/bhel'

type Palette = readonly [ShaderColor, ShaderColor, ShaderColor, ShaderColor]

/** Shade from the icon's #003E8A, light toward its #1A7BEA and #7FD0FF glow. */
const HERO_PALETTE: Palette = [
  [0.004, 0.035, 0.11],
  [0.0, 0.18, 0.46],
  [0.1, 0.48, 0.92],
  [0.55, 0.85, 1.0]
]

const CALL_TO_ACTION_PALETTE: Palette = [
  [0.008, 0.05, 0.15],
  [0.02, 0.22, 0.52],
  [0.16, 0.55, 0.95],
  [0.62, 0.89, 1.0]
]

const HERO_FACTS = ['3 roles', '5 leave types', '4 RMI services', 'Earned an A+'] as const

const SECURITY = [
  { icon: Lock, title: 'BCrypt, 12 rounds', body: 'Passwords are stored as BCrypt hashes, never in plain text.' },
  {
    icon: KeyRound,
    title: 'A real JWT secret',
    body: 'The gateway refuses to start without a JWT_SECRET of at least 32 bytes.'
  },
  {
    icon: ShieldCheck,
    title: 'Roles on the gateway',
    body: 'Spring Security limits registration, the directory, approvals and reports to HR and admins.'
  }
] as const

const HEADLINE = [
  { word: 'Leave,', serif: false },
  { word: 'applied', serif: false },
  { word: 'and', serif: false },
  { word: 'approved.', serif: true }
] as const

/**
 * A section heading with an eyebrow, a title and optional copy.
 *
 * @param props - Eyebrow, title, copy and whether the section is dark
 * @returns The heading block
 */
function SectionHeading({
  eyebrow,
  title,
  children,
  dark = false
}: {
  eyebrow: string
  title: ReactNode
  children?: ReactNode
  dark?: boolean
}) {
  return (
    <Reveal className="max-w-3xl">
      <p
        className={`inline-flex items-center gap-2 text-sm font-semibold ${dark ? 'text-[#7fd0ff]' : 'text-[#0b4fb3]'}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {eyebrow}
      </p>
      <h2
        className={`mt-4 text-[clamp(2.25rem,4.6vw,3.9rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance ${dark ? 'text-white' : 'text-gray-950'}`}
      >
        {title}
      </h2>
      {children && (
        <p className={`mt-5 max-w-2xl text-lg leading-relaxed ${dark ? 'text-white/75' : 'text-gray-600'}`}>
          {children}
        </p>
      )}
    </Reveal>
  )
}

/** An italic serif accent inside a heading. */
function Accent({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span className={`font-serif font-normal tracking-[-0.01em] italic ${dark ? 'text-[#9fdcff]' : 'text-[#1a7bea]'}`}>
      {children}
    </span>
  )
}

/**
 * Landing page with komorebi shader sections.
 *
 * @returns The one-page landing
 */
export default function Home() {
  return (
    <LandingMotion>
      <div className={`landing bg-white text-gray-900 ${instrumentSerif.variable}`}>
        <SiteNav />

        <main>
          <section className="relative isolate flex min-h-svh items-center overflow-hidden bg-[#020a1c] pt-28 pb-24">
            <ShaderBackground colors={HERO_PALETTE} className="-z-20" />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(34_46_80)_8%,rgb(120_136_172)_46%,white_74%)] mix-blend-multiply max-lg:bg-[linear-gradient(180deg,rgb(52_66_102),rgb(52_66_102)_58%,rgb(140_156_190))]"
            />
            <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div>
                <p className="landing-intro inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium tracking-wide text-white/85 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7fd0ff] shadow-[0_0_10px_#7fd0ff]" />
                  Next.js · Spring Boot · Java RMI · PostgreSQL
                </p>
                <h1 className="mt-7 text-[clamp(3.1rem,8vw,7rem)] leading-[0.92] font-semibold tracking-[-0.045em] text-white">
                  {HEADLINE.map(({ word, serif }, index) => (
                    <HeadlineWord key={word} index={index} serif={serif} word={word} />
                  ))}
                </h1>
                <p
                  className="landing-intro mt-8 max-w-xl text-lg leading-relaxed text-white/80 md:text-xl"
                  style={{ animationDelay: '520ms' }}
                >
                  An HR management system where employees apply for leave and HR approves it, built on a Spring Boot
                  gateway in front of a Java RMI server.
                </p>
                <div className="landing-intro mt-10 flex flex-wrap gap-3" style={{ animationDelay: '640ms' }}>
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-2 rounded-full bg-white py-3 pr-5 pl-6 font-medium text-[#04102a] shadow-[0_10px_40px_-10px_rgb(127_208_255/0.6)] transition-transform hover:-translate-y-0.5"
                  >
                    Sign in
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.04] px-6 py-3 font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10"
                  >
                    Open dashboard
                  </Link>
                </div>
                <ul
                  className="landing-intro mt-12 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60"
                  style={{ animationDelay: '760ms' }}
                >
                  {HERO_FACTS.map((fact) => (
                    <li key={fact} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-white/40" />
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="landing-intro flex justify-center lg:justify-end" style={{ animationDelay: '420ms' }}>
                <LeaveCardDemo />
              </div>
            </div>
            <a
              href="#leave"
              className="absolute bottom-16 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-medium tracking-wide text-white/60 transition-colors hover:text-white md:inline-flex"
            >
              <ArrowDown className="landing-bob landing-loop h-4 w-4" aria-hidden="true" />
              Scroll
            </a>
          </section>

          <div className="relative z-10 -mt-10 rounded-t-[2.5rem] bg-white">
            <StackMarquee />

            <section id="leave" className="scroll-mt-20 px-6 pt-16 pb-24 md:pt-24 md:pb-32">
              <div className="mx-auto max-w-6xl">
                <SectionHeading
                  eyebrow="Leave balances"
                  title={
                    <>
                      Five kinds of leave, <Accent>counted to the day.</Accent>
                    </>
                  }
                >
                  Each type has a yearly allowance. Employees see what&apos;s left, what&apos;s used and what&apos;s
                  still pending.
                </SectionHeading>
                <Reveal delay={120} className="mt-14">
                  <BalanceMeters />
                </Reveal>

                <div className="mt-28 grid gap-12 lg:mt-36">
                  <SectionHeading
                    eyebrow="Leave rules"
                    title={
                      <>
                        Weekends <Accent>don&apos;t count.</Accent>
                      </>
                    }
                  >
                    The form counts working days as the dates change and blocks a request over the remaining balance.
                    The RMI server checks both again, and also rejects requests that span two years or overlap other
                    leave.
                  </SectionHeading>
                  <Reveal delay={120}>
                    <WorkingDays />
                  </Reveal>
                </div>
              </div>
            </section>

            <section className="bg-[#f5f5f7] px-6 py-24 md:py-32">
              <div className="mx-auto max-w-6xl">
                <SectionHeading
                  eyebrow="Roles"
                  title={
                    <>
                      One login, <Accent>three roles.</Accent>
                    </>
                  }
                >
                  The JWT carries the role, Spring Security enforces it on the gateway and the sidebar follows the same
                  rules. Pick a role to see what it can open.
                </SectionHeading>
                <Reveal delay={120} className="mt-14">
                  <RoleSidebar />
                </Reveal>
              </div>
            </section>

            <section id="how-it-works" className="scroll-mt-20 px-6 py-24 md:py-32">
              <div className="mx-auto max-w-6xl">
                <SectionHeading
                  eyebrow="How it works"
                  title={
                    <>
                      From sign-in to <Accent>the yearly report.</Accent>
                    </>
                  }
                >
                  Eight steps, shown on the real app.
                </SectionHeading>
                <div className="mt-8 lg:mt-0">
                  <StepsShowcase />
                </div>
              </div>
            </section>

            <section
              id="architecture"
              className="relative isolate scroll-mt-20 overflow-hidden bg-[#030b1f] px-6 py-24 md:py-32"
            >
              <PaperBackdrop className="-z-20" />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(3_11_31/0.85)_0%,rgb(3_11_31/0.3)_55%,rgb(3_11_31/0.75)_100%)]"
              />
              <div className="mx-auto max-w-6xl">
                <SectionHeading
                  dark
                  eyebrow="Architecture"
                  title={
                    <>
                      Four services <Accent dark>behind one gateway.</Accent>
                    </>
                  }
                >
                  The Next.js app calls a Spring Boot REST gateway, which authenticates each request with a JWT and
                  reaches four services on a Java RMI server. Only the RMI server opens database connections.
                </SectionHeading>
                <Reveal delay={120} className="mt-16">
                  <ArchitectureFlow />
                </Reveal>
                <ul className="mt-16 grid gap-4 md:grid-cols-3">
                  {SECURITY.map(({ icon: Icon, title, body }, index) => (
                    <li key={title}>
                      <Reveal
                        delay={index * 90}
                        className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md"
                      >
                        <Icon className="h-5 w-5 text-[#7fd0ff]" aria-hidden="true" />
                        <h3 className="mt-4 font-semibold text-white">{title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-white/70">{body}</p>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="px-4 py-20 sm:px-6 md:py-28">
              <Reveal className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-[#04102a] px-8 py-20 md:px-16 md:py-28">
                <ShaderBackground colors={CALL_TO_ACTION_PALETTE} seed={3} className="-z-20" />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-[linear-gradient(95deg,rgb(34_46_80)_10%,rgb(130_146_180)_55%,white_85%)] mix-blend-multiply max-md:bg-[linear-gradient(180deg,rgb(52_66_102),rgb(90_106_142))]"
                />
                <h2 className="max-w-2xl text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1] font-semibold tracking-[-0.04em] text-balance text-white">
                  Run it on <Accent dark>your machine.</Accent>
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
                  PostgreSQL in Docker, the RMI server, the gateway and the web app. The setup guide walks through each
                  one.
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <a
                    href={`${REPOSITORY_URL}#getting-started`}
                    className="group inline-flex items-center gap-2 rounded-full bg-white py-3 pr-5 pl-6 font-medium text-[#04102a] transition-transform hover:-translate-y-0.5"
                  >
                    Read the setup guide
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </a>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.04] px-6 py-3 font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10"
                  >
                    Sign in
                  </Link>
                </div>
              </Reveal>
            </section>
          </div>
        </main>

        <footer className="px-6 pt-6 pb-24 text-sm text-gray-600">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-gray-200 pt-8 md:flex-row md:items-center md:justify-between">
            <p>Built as coursework, where it earned an A+. Not affiliated with Bharat Heavy Electricals Limited.</p>
            <p className="flex gap-5">
              <a href={`${REPOSITORY_URL}/blob/main/LICENSE`} className="hover:text-gray-900">
                MIT License
              </a>
              <a href={REPOSITORY_URL} className="hover:text-gray-900">
                GitHub
              </a>
            </p>
          </div>
        </footer>

        <MotionToggle />
      </div>
    </LandingMotion>
  )
}

/**
 * One headline word, revealed with a staggered CSS animation so it shows without JavaScript.
 *
 * @param props - The word, its position and whether it's set in the serif
 * @returns The animated word followed by a space
 */
function HeadlineWord({ word, index, serif }: { word: string; index: number; serif: boolean }) {
  return (
    <>
      <span
        className={`landing-word ${serif ? 'bg-gradient-to-br from-white via-[#cfeeff] to-[#7fd0ff] bg-clip-text pr-[0.06em] font-serif font-normal tracking-[-0.02em] text-transparent italic' : ''}`}
        style={{ animationDelay: `${120 + index * 110}ms` }}
      >
        {word}
      </span>{' '}
    </>
  )
}
