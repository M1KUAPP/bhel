/**
 * Architecture Flow Component
 *
 * The request path from the web app to the database, drawn as four nodes
 * with animated packets on the links between them. The RMI server lists its
 * four services, which light up in turn. Horizontal on wide screens,
 * vertical on narrow ones.
 */
import { Database, Monitor, Server, ShieldCheck } from 'lucide-react'
import { Fragment } from 'react'

const NODES = [
  { icon: Monitor, name: 'Web app', detail: 'Next.js 16 · React 19' },
  { icon: ShieldCheck, name: 'REST gateway', detail: 'Spring Boot 3.5 · :8080' },
  {
    icon: Server,
    name: 'RMI server',
    detail: 'Registry :1099',
    services: ['EmployeeService', 'LeaveService', 'ReportService', 'UserService']
  },
  { icon: Database, name: 'PostgreSQL', detail: 'Reached only by the RMI server' }
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
          <li className="rounded-3xl border border-white/12 bg-[#071633]/70 p-5 backdrop-blur-md md:w-52 md:shrink-0">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-[#7fd0ff]">
              <node.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-4 font-semibold text-white">{node.name}</p>
            <p className="mt-1 text-sm text-white/70">{node.detail}</p>
            {'services' in node && (
              <ul className="mt-4 space-y-1.5">
                {node.services.map((service, serviceIndex) => (
                  <li
                    key={service}
                    className="service-chip landing-loop rounded-lg border px-2.5 py-1 font-mono text-[11px] text-white/85"
                    style={{ animationDelay: `${serviceIndex * 1.2}s` }}
                  >
                    {service}
                  </li>
                ))}
              </ul>
            )}
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
