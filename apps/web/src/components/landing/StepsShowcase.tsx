'use client'

/**
 * Steps Showcase Component
 *
 * The README's eight steps with their real screenshots. On wide screens the
 * screenshot frame sticks beside the list and crossfades to whichever step
 * crosses the middle of the viewport; on narrow screens each step shows its
 * own screenshot.
 */
import { motion } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'

const STEPS = [
  {
    title: 'Sign in',
    route: '/login',
    image: '1-sign-in.png',
    body: 'A username and password. The gateway returns a JWT carrying the role: EMPLOYEE, HR or ADMIN.'
  },
  {
    title: 'Start from the dashboard',
    route: '/dashboard',
    image: '2-dashboard.png',
    body: 'Remaining leave days, pending applications and upcoming leave, with quick actions. The sidebar lists only the pages the role can open.'
  },
  {
    title: 'Apply for leave',
    route: '/dashboard/leaves/apply',
    image: '3-apply.png',
    body: 'Pick a leave type and dates. The form counts working days, skipping weekends, and blocks a request that exceeds the remaining balance.'
  },
  {
    title: 'Review the application',
    route: '/dashboard/approvals',
    image: '4-review.png',
    body: 'HR and admins work through the queue of pending applications, then approve, or reject with a required comment.'
  },
  {
    title: 'Track the decision',
    route: '/dashboard/leaves/[id]',
    image: '5-track.png',
    body: 'A timeline with the approver and their comment. Approval moves the days from remaining to used; a pending request can be cancelled.'
  },
  {
    title: 'Register employees',
    route: '/dashboard/employees/new',
    image: '6-register.png',
    body: 'HR adds staff, which also creates their login. The department sets the role.'
  },
  {
    title: 'Keep profiles current',
    route: '/dashboard/profile/edit',
    image: '7-family.png',
    body: 'Employees update their email, phone number and family members. The other fields stay locked for HR.'
  },
  {
    title: 'Generate reports',
    route: '/dashboard/reports',
    image: '8-reports.png',
    body: 'Yearly reports for one employee, a department or the whole organization, rendered as PDFs with iText and previewed in the browser.'
  }
] as const

/**
 * A browser-style frame around a screenshot.
 *
 * @param props - Route shown in the address bar and the frame's contents
 * @returns The framed content
 */
function BrowserFrame({ route, children }: { route: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-gray-200/80 bg-white shadow-[0_40px_90px_-40px_rgb(4_16_42/0.45)]">
      <div className="flex items-center gap-1.5 border-b border-gray-100 bg-[#fbfbfd] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 truncate rounded-full bg-white px-3 py-1 font-mono text-[11px] text-gray-500 ring-1 ring-gray-100">
          {route}
        </span>
      </div>
      <div className="relative aspect-[16/10]">{children}</div>
    </div>
  )
}

/**
 * Renders the step list with its sticky screenshot frame.
 *
 * @returns The how-it-works walkthrough
 */
export default function StepsShowcase() {
  const [active, setActive] = useState(0)

  return (
    <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
      <ol>
        {STEPS.map((step, index) => (
          <motion.li
            key={step.title}
            onViewportEnter={() => setActive(index)}
            viewport={{ margin: '-48% 0px -48% 0px' }}
            className="flex flex-col justify-center py-8 lg:min-h-[62vh] lg:py-0"
          >
            <div className="flex gap-5">
              <span
                aria-hidden="true"
                className={`font-serif text-4xl italic tabular-nums transition-colors duration-500 ${index === active ? 'text-[#1a7bea]' : 'text-[#1a7bea] lg:text-[#7a8699]'}`}
              >
                {index + 1}
              </span>
              <div>
                <h3
                  className={`text-2xl font-semibold tracking-tight transition-colors duration-500 ${index === active ? 'text-gray-950' : 'text-gray-950 lg:text-gray-500'}`}
                >
                  {step.title}
                </h3>
                <p className="mt-1 font-mono text-xs text-[#0b4fb3]">{step.route}</p>
                <p className="mt-3 max-w-md leading-relaxed text-gray-600">{step.body}</p>
              </div>
            </div>
            <div className="mt-6 lg:hidden">
              <BrowserFrame route={step.route}>
                <Image
                  src={`/landing/steps/${step.image}`}
                  alt={`bhel ${step.title.toLowerCase()} screen`}
                  fill
                  sizes="100vw"
                  className="object-cover object-top"
                />
              </BrowserFrame>
            </div>
          </motion.li>
        ))}
      </ol>

      <div className="hidden lg:block">
        <div className="sticky top-[14vh]">
          <BrowserFrame route={STEPS[active].route}>
            {STEPS.map((step, index) => (
              <Image
                key={step.image}
                src={`/landing/steps/${step.image}`}
                alt={index === active ? `bhel ${step.title.toLowerCase()} screen` : ''}
                fill
                sizes="(min-width: 1280px) 680px, 55vw"
                className={`object-cover object-top transition-[opacity,transform] duration-700 ease-out ${
                  index === active ? 'scale-100 opacity-100' : 'scale-[1.02] opacity-0'
                }`}
              />
            ))}
          </BrowserFrame>
          <div className="mt-6 flex gap-1.5" aria-hidden="true">
            {STEPS.map((step, index) => (
              <span
                key={step.title}
                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${index <= active ? 'bg-[#1a7bea]' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
