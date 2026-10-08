/**
 * Architecture Flow Component
 *
 * The request path from the web app to the database, drawn as four nodes
 * with animated packets on the links between them. Horizontal on wide
 * screens, vertical on narrow ones.
 */
import { Fragment } from 'react'

const NODES = [
  { name: 'Next.js web app', detail: 'React 19 · zustand · Tailwind CSS' },
  { name: 'Spring Boot gateway', detail: 'Spring Security · JJWT' },
  { name: 'Java RMI server', detail: 'Employee, Leave, Report and User services' },
  { name: 'PostgreSQL', detail: 'Reached only by the RMI server' }
] as const

const LINKS = ['REST + JWT', 'Java RMI', 'HikariCP pool'] as const

/**
 * Renders the four-tier request path.
 *
 * @returns An ordered list of nodes joined by animated links
 */
export default function ArchitectureFlow() {
  return (
    <ol aria-label="Request path" className="flex flex-col items-stretch md:flex-row md:items-center">
      {NODES.map((node, index) => (
        <Fragment key={node.name}>
          <li className="flex flex-col justify-center rounded-2xl border border-white/15 bg-[#071633]/85 px-5 py-4 md:min-h-32 md:w-48 md:shrink-0">
            <p className="font-semibold text-white">{node.name}</p>
            <p className="mt-1 text-sm text-white/75">{node.detail}</p>
          </li>
          {index < LINKS.length && (
            <li className="flow-link">
              <span
                aria-hidden="true"
                className="flow-packet landing-loop"
                style={{ animationDelay: `${index * 0.6}s` }}
              />
              <span className="flow-label">{LINKS[index]}</span>
            </li>
          )}
        </Fragment>
      ))}
    </ol>
  )
}
