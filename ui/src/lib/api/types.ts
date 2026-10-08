/**
 * API Types Module
 *
 * TypeScript interfaces and types for API data structures.
 * Defines shapes for employees, leaves, authentication, and related entities.
 *
 * Categories:
 * - Employee: Employee, EmployeeRegistration, ProfileUpdate, EmployeeStatus
 * - Family: FamilyMember, Relationship
 * - Leave: LeaveBalance, LeaveApplication, LeaveRequest
 * - Auth: LoginRequest, LoginResponse
 */

/** Employee employment status */
export type EmployeeStatus = 'active' | 'inactive' | 'on_leave'

/** Complete employee record from API */
export interface Employee {
  /** Unique employee identifier */
  id: number
  /** Employee first name */
  firstName: string
  /** Employee last name */
  lastName: string
  /** Employee email address */
  email: string
  /** IC or passport number */
  icPassportNumber: string
  /** Contact phone number */
  phone: string
  /** Department name */
  department: string
  /** Job position/title */
  position: string
  /** Employment start date (ISO string) */
  hireDate: string
  /** Current employment status */
  status: EmployeeStatus
  /** Record creation timestamp */
  createdAt?: string
  /** Last update timestamp */
  updatedAt?: string
}

/** Data required for new employee registration */
export interface EmployeeRegistration {
  firstName: string
  lastName: string
  email: string
  icPassportNumber: string
  phone: string
  department: string
  position: string
  hireDate: string
}

/** Partial employee data for profile updates */
export interface ProfileUpdate {
  firstName?: string
  lastName?: string
  email?: string
  icPassportNumber?: string
  phone?: string
  department?: string
  position?: string
  hireDate?: string
  status?: EmployeeStatus
}

/** Family member relationship type */
export type Relationship = 'spouse' | 'child' | 'parent' | 'sibling' | 'other'

/** Employee family member record */
export interface FamilyMember {
  /** Unique identifier (optional for new entries) */
  id?: number
  /** Associated employee ID */
  employeeId: number
  /** Family member name */
  name: string
  /** Relationship to employee */
  relationship: Relationship
  /** Date of birth (ISO string) */
  dateOfBirth?: string
  /** Contact phone number */
  contactNumber?: string
}

/** Employee leave balance for a specific leave type and year */
export interface LeaveBalance {
  /** Unique balance record ID */
  id: number
  /** Associated employee ID */
  employeeId: number
  /** Year for this balance */
  year: number
  /** Leave type identifier */
  leaveTypeId: number
  /** Leave type display name */
  leaveTypeName: string
  /** Total allocated days */
  totalDays: number
  /** Days already used */
  usedDays: number
  /** Days available to use */
  remainingDays: number
}

/** Leave application record with status and approval info */
export interface LeaveApplication {
  /** Unique application ID */
  id: number
  /** Applicant employee ID */
  employeeId: number
  /** Leave type identifier */
  leaveTypeId: number
  /** Leave type display name */
  leaveTypeName: string
  /** Leave start date (ISO string) */
  startDate: string
  /** Leave end date (ISO string) */
  endDate: string
  /** Total working days requested */
  totalDays: number
  /** Reason for leave */
  reason: string
  /** Current application status */
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  /** Date application was submitted */
  appliedDate: string
  /** Approver employee ID */
  approvedBy?: number
  /** Approver display name */
  approvedByName?: string
  /** Date of approval/rejection */
  approvedRejectedDate?: string
  /** Comments from approver */
  approverComments?: string
}

/** Data required to submit a new leave application */
export interface LeaveRequest {
  /** Applicant employee ID */
  employeeId: number
  /** Leave type name */
  leaveType: string
  /** Start date (ISO string) */
  startDate: string
  /** End date (ISO string) */
  endDate: string
  /** Reason for leave */
  reason: string
}

/** Login credentials payload */
export interface LoginRequest {
  /** Username or email */
  username: string
  /** User password */
  password: string
}

/** Successful login response with user info and token */
export interface LoginResponse {
  /** JWT access token */
  token: string
  /** Authenticated username */
  username: string
  /** User role (e.g., admin, employee) */
  role: string
  /** User account ID */
  userId: number
  /** Associated employee ID (if applicable) */
  employeeId?: number
  /** User first name */
  firstName?: string
  /** User last name */
  lastName?: string
  /** User email address */
  email?: string
}
