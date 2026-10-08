/**
 * Stack Marquee Component
 *
 * The tech stack from the README as a slow, endless ticker. The list is
 * rendered twice so the loop is seamless; the copy is hidden from screen
 * readers.
 */

const STACK = [
  'Next.js 16',
  'React 19',
  'Tailwind CSS 4',
  'zustand',
  'React Hook Form',
  'zod',
  'Spring Boot 3.5',
  'Spring Security',
  'JJWT',
  'Java RMI',
  'iText 7',
  'jBCrypt',
  'HikariCP',
  'PostgreSQL',
  'Bun',
  'Maven'
] as const

/**
 * Renders the scrolling stack list.
 *
 * @returns A masked, looping row of technology names
 */
export default function StackMarquee() {
  return (
    <div className="relative overflow-hidden py-8 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <p className="sr-only">Built with {STACK.join(', ')}.</p>
      <div aria-hidden="true" className="landing-marquee landing-loop flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {STACK.map((name) => (
              <li key={name} className="flex items-center text-lg font-medium tracking-tight text-gray-500">
                <span className="px-6">{name}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#1a7bea]/40" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
