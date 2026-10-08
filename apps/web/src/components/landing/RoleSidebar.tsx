'use client'

/**
 * Role Sidebar Component
 *
 * A role switcher next to a miniature of the dashboard sidebar. Pages
 * slide in and out as the role changes, using the same role rules as
 * `app/dashboard/layout.tsx`.
 */
import { BarChart3, CalendarDays, FileText, LayoutDashboard, UserCircle, Users, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

type Role = 'EMPLOYEE' | 'HR' | 'ADMIN'

const ROLES: readonly Role[] = ['EMPLOYEE', 'HR', 'ADMIN']

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  roles: readonly Role[]
}

/** Mirrors `navItems` in `app/dashboard/layout.tsx`. */
const NAV_ITEMS: readonly NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['EMPLOYEE', 'HR', 'ADMIN'] },
  { name: 'Employees', href: '/dashboard/employees', icon: Users, roles: ['HR', 'ADMIN'] },
  { name: 'Profile', href: '/dashboard/profile', icon: UserCircle, roles: ['EMPLOYEE', 'HR', 'ADMIN'] },
  { name: 'Leaves', href: '/dashboard/leaves', icon: CalendarDays, roles: ['EMPLOYEE', 'HR', 'ADMIN'] },
  { name: 'Approvals', href: '/dashboard/approvals', icon: FileText, roles: ['HR', 'ADMIN'] },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, roles: ['HR', 'ADMIN'] }
]

const SUMMARY: Record<Role, string> = {
  EMPLOYEE: 'Keeps their profile and family current, checks balances and applies for leave.',
  HR: 'Registers employees, approves or rejects leave and builds the yearly reports.',
  ADMIN: 'Opens the same pages as HR. Staff registered in the Admin department get this role.'
}

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Renders the role switcher and the animated sidebar.
 *
 * @returns The interactive role demo
 */
export default function RoleSidebar() {
  const [role, setRole] = useState<Role>('EMPLOYEE')
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div>
        <div
          role="group"
          aria-label="Role"
          className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-[0_1px_2px_rgb(0_0_0/0.04)]"
        >
          {ROLES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={role === option}
              onClick={() => setRole(option)}
              className="relative rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-colors sm:px-5 sm:text-sm"
            >
              {role === option && (
                <motion.span
                  layoutId="role-pill"
                  transition={{ duration: 0.45, ease: EASE }}
                  className="absolute inset-0 rounded-full bg-[#04102a]"
                />
              )}
              <span className={`relative ${role === option ? 'text-white' : 'text-gray-600'}`}>{option}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={role}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mt-6 max-w-md text-lg leading-relaxed text-gray-600"
          >
            {SUMMARY[role]}
          </motion.p>
        </AnimatePresence>
        <p className="mt-4 text-sm text-gray-600">
          <span className="font-semibold text-gray-900 tabular-nums">{items.length}</span> of {NAV_ITEMS.length} pages
        </p>
      </div>

      <div
        aria-hidden="true"
        className="overflow-hidden rounded-[28px] border border-gray-200/80 bg-white shadow-[0_30px_60px_-36px_rgb(4_16_42/0.35)]"
      >
        <div className="flex items-center gap-1.5 border-b border-gray-100 px-5 py-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-500">/dashboard</span>
        </div>
        <div className="grid min-h-[22rem] grid-cols-[minmax(0,13rem)_1fr]">
          <div className="border-r border-gray-100 bg-[#fafafa] p-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-3">
              <p className="text-sm font-semibold text-gray-900">
                {role === 'EMPLOYEE' ? 'Employee' : role === 'HR' ? 'HR' : 'Admin'} Test
              </p>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={role}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-2 inline-block rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-gray-600"
                >
                  {role}
                </motion.span>
              </AnimatePresence>
            </div>
            <ul className="mt-4 space-y-1">
              <AnimatePresence initial={false}>
                {items.map(({ name, icon: Icon }) => (
                  <motion.li
                    key={name}
                    layout
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm ${
                      name === 'Dashboard' ? 'bg-[#04102a] text-white' : 'text-gray-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {name}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
          <div className="space-y-3 p-5">
            <AnimatePresence initial={false}>
              {items.map(({ href }) => (
                <motion.p
                  key={href}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="truncate rounded-xl bg-[#f5f7fb] px-3 py-2 font-mono text-xs text-[#0b4fb3]"
                >
                  {href}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
