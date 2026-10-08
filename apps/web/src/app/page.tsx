/**
 * Home Page Component
 *
 * The one-page landing for BHEL HRMS: a shader-backed hero, the features,
 * how a leave request moves, the distributed architecture and a call to
 * run it locally.
 */
import ArchitectureFlow from '@/components/landing/ArchitectureFlow'
import LeaveCardDemo from '@/components/landing/LeaveCardDemo'
import MotionToggle from '@/components/landing/MotionToggle'
import Reveal from '@/components/landing/Reveal'
import ShaderBackground, { type ShaderColor } from '@/components/landing/ShaderBackground'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarRange,
  FileText,
  MessageSquareText,
  ShieldCheck,
  UserRound,
  Users
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const REPOSITORY_URL = 'https://github.com/M1KUAPP/bhel'

type Palette = readonly [ShaderColor, ShaderColor, ShaderColor, ShaderColor]

/** Navy to the app's #0066cc accent, with a cyan glint. */
const HERO_PALETTE: Palette = [
  [0.012, 0.043, 0.122],
  [0.035, 0.165, 0.4],
  [0.0, 0.4, 0.8],
  [0.37, 0.77, 1.0]
]

const ARCHITECTURE_PALETTE: Palette = [
  [0.02, 0.05, 0.11],
  [0.04, 0.2, 0.45],
  [0.12, 0.48, 0.88],
  [0.5, 0.82, 1.0]
]

const CALL_TO_ACTION_PALETTE: Palette = [
  [0.016, 0.063, 0.165],
  [0.063, 0.184, 0.478],
  [0.227, 0.357, 0.863],
  [0.286, 0.82, 1.0]
]

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    body: 'Employees, HR and admins each see only what their role allows, enforced by Spring Security on the gateway.'
  },
  {
    icon: Users,
    title: 'Employee records',
    body: 'HR registers and edits employees, with search and department and status filters.'
  },
  {
    icon: UserRound,
    title: 'Profiles and families',
    body: 'Employees keep their own contact details and family members current.'
  },
  {
    icon: CalendarRange,
    title: 'Leave rules',
    body: 'Working days are counted on the form and again on the server. A request must fit the balance, stay within one year and not overlap other leave.'
  },
  {
    icon: MessageSquareText,
    title: 'Approvals',
    body: 'HR approves or rejects with comments, and every rejection says why.'
  },
  {
    icon: FileText,
    title: 'Yearly reports',
    body: 'Employee, department and organization leave reports as PDFs, previewed in the browser.'
  }
] as const

const STEPS = [
  { title: 'Sign in', body: 'The gateway returns a JWT that carries the role: employee, HR or admin.' },
  { title: 'Apply', body: 'Pick a leave type and dates. Weekends are skipped and the balance is checked.' },
  { title: 'Review', body: 'HR approves or rejects the request with a comment.' },
  { title: 'Report', body: 'Yearly PDFs per employee, department or the whole organization.' }
] as const

const ALLOWANCES = [
  { type: 'Annual', days: 14 },
  { type: 'Sick', days: 14 },
  { type: 'Emergency', days: 3 },
  { type: 'Maternity', days: 90 },
  { type: 'Paternity', days: 7 }
] as const

/**
 * Landing page with animated shader sections.
 *
 * @returns The one-page landing
 */
export default function Home() {
  return (
    <div className="landing bg-white text-gray-900">
      <header className="absolute inset-x-0 top-0 z-20">
        <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-white">
            <Image src="/icon.svg" alt="" width={32} height={32} unoptimized priority />
            BHEL HRMS
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-white/85">
            <a href="#features" className="hidden hover:text-white sm:inline">
              Features
            </a>
            <a href="#how-it-works" className="hidden hover:text-white sm:inline">
              How it works
            </a>
            <a href="#architecture" className="hidden hover:text-white sm:inline">
              Architecture
            </a>
            <Link
              href="/login"
              className="rounded-full bg-white px-4 py-2 text-gray-900 transition-colors hover:bg-white/90"
            >
              Sign in
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative isolate flex min-h-svh items-center overflow-hidden bg-[#030b1f] pt-24 pb-16">
          <ShaderBackground colors={HERO_PALETTE} className="-z-20" />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(3_11_31/0.85)_10%,rgb(3_11_31/0.4)_50%,transparent_75%)]"
          />
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="landing-intro inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white">
                Next.js · Spring Boot · Java RMI · PostgreSQL
              </p>
              <h1
                className="landing-intro mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl"
                style={{ animationDelay: '120ms' }}
              >
                Leave, applied and approved.
              </h1>
              <p
                className="landing-intro mt-6 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl"
                style={{ animationDelay: '240ms' }}
              >
                An HR management system where employees apply for leave and HR approves it, built on a Spring Boot
                gateway in front of a Java RMI server.
              </p>
              <div className="landing-intro mt-10 flex flex-wrap gap-4" style={{ animationDelay: '360ms' }}>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-gray-900 transition-transform hover:-translate-y-0.5"
                >
                  Sign in
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
                >
                  Open dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-8 px-6 py-24 md:py-32">
          <div className="mx-auto max-w-6xl">
            <Reveal className="max-w-2xl">
              <p className="text-sm font-semibold tracking-wide text-accent uppercase">Features</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Everything HR does with leave.</h2>
              <p className="mt-4 text-lg text-gray-600">
                From an employee&apos;s first request to the yearly report, in one place.
              </p>
            </Reveal>
            <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, body }, index) => (
                <li key={title}>
                  <Reveal delay={(index % 3) * 90} className="h-full">
                    <div className="card-hover h-full rounded-3xl border border-gray-200 bg-[#f5f5f7] p-7">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-accent shadow-sm">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                      <p className="mt-2 leading-relaxed text-gray-600">{body}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-8 bg-[#f5f5f7] px-6 py-24 md:py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
            <div>
              <Reveal>
                <p className="text-sm font-semibold tracking-wide text-accent uppercase">How it works</p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                  From request to report in four steps.
                </h2>
              </Reveal>
              <ol className="mt-10 space-y-6">
                {STEPS.map((step, index) => (
                  <li key={step.title}>
                    <Reveal delay={index * 90} className="flex gap-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="mt-1 text-gray-600">{step.body}</p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
            <Reveal delay={120}>
              <LeaveCardDemo />
              <dl className="mt-8 grid grid-cols-5 gap-2 text-center">
                {ALLOWANCES.map(({ type, days }) => (
                  <div key={type} className="flex flex-col-reverse rounded-2xl bg-white px-2 py-4">
                    <dt className="mt-1 text-xs text-gray-600">{type}</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{days}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-center text-sm text-gray-600">Leave allowances, in days per year</p>
            </Reveal>
          </div>
        </section>

        <section
          id="architecture"
          className="relative isolate scroll-mt-8 overflow-hidden bg-[#050d1c] px-6 py-24 md:py-32"
        >
          <ShaderBackground colors={ARCHITECTURE_PALETTE} dots seed={7} className="-z-20" />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(5_13_28/0.85)_0%,rgb(5_13_28/0.55)_45%,rgb(5_13_28/0.2)_100%)]"
          />
          <div className="mx-auto max-w-6xl">
            <Reveal className="max-w-2xl">
              <p className="text-sm font-semibold tracking-wide text-[#7fd0ff] uppercase">Architecture</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Four services behind one gateway.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-white/85">
                The gateway reaches the employee, leave, report and user services over Java RMI. Only the RMI server
                opens database connections, through a HikariCP pool, and passwords are stored as BCrypt hashes.
              </p>
            </Reveal>
            <Reveal delay={120} className="mt-14">
              <ArchitectureFlow />
            </Reveal>
          </div>
        </section>

        <section className="px-6 py-24 md:py-32">
          <Reveal className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#04102a] px-8 py-16 md:px-16 md:py-20">
            <ShaderBackground colors={CALL_TO_ACTION_PALETTE} seed={23} className="-z-20" />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(4_16_42/0.85),rgb(4_16_42/0.35))]"
            />
            <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Run it on your machine.
            </h2>
            <p className="mt-4 max-w-xl text-lg text-white/85">
              PostgreSQL in Docker, the RMI server, the gateway and the web app. The setup guide walks through each one.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={`${REPOSITORY_URL}#getting-started`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-gray-900 transition-transform hover:-translate-y-0.5"
              >
                Read the setup guide
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-gray-200 px-6 pt-10 pb-24 text-sm text-gray-600">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>A coursework case study, not affiliated with Bharat Heavy Electricals Limited.</p>
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
  )
}
