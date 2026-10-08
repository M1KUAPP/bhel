/**
 * Root Layout Component
 *
 * The root layout for the BHEL HRMS application.
 * Provides global HTML structure, metadata configuration, and toast notifications.
 *
 * Features:
 * - SEO metadata (title, description, Open Graph, Twitter cards)
 * - Viewport configuration for responsive design
 * - Global toast notifications via react-hot-toast
 * - Global CSS styles import
 */
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

/** Application metadata for SEO and social sharing */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'BHEL HRMS',
    template: '%s | BHEL HRMS'
  },
  description:
    'Human Resource Management System for BHEL - Manage employees, leave applications, and HR operations efficiently',
  keywords: ['BHEL', 'HRM', 'Human Resources', 'Employee Management', 'Leave Management', 'HR System'],
  authors: [{ name: 'BHEL' }],
  creator: 'BHEL',
  publisher: 'BHEL',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'BHEL HRMS',
    title: 'BHEL HRMS',
    description:
      'Human Resource Management System for BHEL - Manage employees, leave applications, and HR operations efficiently'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BHEL HRMS',
    description: 'Human Resource Management System for BHEL'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

/** Viewport settings for responsive mobile-first design */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
}

/**
 * Root layout wrapper component.
 * Renders the HTML document structure with Toaster for notifications.
 *
 * @param children - Child components to render within the layout
 * @returns The root HTML document with body and toast notifications
 */
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased text-foreground bg-background">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              color: '#1D1D1F',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
              borderRadius: '16px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 500,
              border: '1px solid rgba(255, 255, 255, 0.5)'
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#34C759',
                secondary: '#fff'
              }
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#FF3B30',
                secondary: '#fff'
              }
            }
          }}
        />
      </body>
    </html>
  )
}
