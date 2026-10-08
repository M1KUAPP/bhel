/**
 * Application Configuration Module
 *
 * Central configuration constants for the BHEL HRMS application.
 * Includes API settings, UI breakpoints, and company branding.
 *
 * Environment Variables:
 * - NEXT_PUBLIC_API_URL: Backend API base URL
 */

/** Backend API base URL (from env or localhost default) */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

/** Medium breakpoint width in pixels for responsive design */
export const BREAKPOINT_MD = 768

/** Number of years to show in report year dropdowns */
export const REPORT_YEAR_RANGE = 6

/** Company name for branding */
export const COMPANY_NAME = 'BHEL'

/** Full application name for display */
export const APP_NAME = `${COMPANY_NAME} HRMS`

/** Company email domain for validation */
export const EMAIL_DOMAIN = 'bhel.com'

/** LocalStorage key for JWT access token */
export const TOKEN_STORAGE_KEY = 'accessToken'
