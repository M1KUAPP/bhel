/**
 * Auth Layout Component
 *
 * Layout wrapper for authentication pages (login).
 * Provides a centered card container with decorative background.
 *
 * Features:
 * - Centered content container with max-width constraint
 * - Decorative gradient blur background effects
 * - Responsive full-height layout
 *
 * @param children - Auth page content to render (login form, etc.)
 * @returns Centered authentication layout with decorative background
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100/50 blur-[120px]" />
      </div>
      <div className="w-full max-w-md p-4 z-10">{children}</div>
    </div>
  )
}
