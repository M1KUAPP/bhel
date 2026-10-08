/**
 * Leaves API Module
 *
 * API methods for leave management operations.
 * Handles leave applications, balances, and approval workflows.
 *
 * Features:
 * - Get leave balances by employee and year
 * - Apply for leave
 * - Check application status
 * - View leave history
 * - Approve/reject leave (admin)
 * - Cancel pending applications
 */
import { apiClient } from './client'
import { LeaveApplication, LeaveBalance, LeaveRequest } from './types'

/** Leave management API methods */
export const leavesApi = {
  /**
   * Fetches leave balances for an employee.
   * @param employeeId - Employee ID
   * @param year - Year to query (default: current year)
   * @returns Array of leave balances by type
   */
  getBalance: async (employeeId: number, year?: number): Promise<LeaveBalance[]> => {
    const queryYear = year || new Date().getFullYear()
    return apiClient.get<LeaveBalance[]>(`/leaves/balance/${employeeId}?year=${queryYear}`)
  },

  /**
   * Submits a new leave application.
   * @param request - Leave request data
   * @returns Created leave application
   */
  apply: async (request: LeaveRequest): Promise<LeaveApplication> => {
    return apiClient.post<LeaveApplication>('/leaves', request)
  },

  /**
   * Gets status of a specific application.
   * @param applicationId - Application ID
   * @returns Leave application details
   */
  getStatus: async (applicationId: number): Promise<LeaveApplication> => {
    return apiClient.get<LeaveApplication>(`/leaves/${applicationId}/status`)
  },

  /**
   * Fetches leave history for an employee.
   * @param employeeId - Employee ID
   * @param year - Year to query (default: current year)
   * @returns Array of leave applications
   */
  getHistory: async (employeeId: number, year?: number): Promise<LeaveApplication[]> => {
    const queryYear = year || new Date().getFullYear()
    return apiClient.get<LeaveApplication[]>(`/leaves/employee/${employeeId}?year=${queryYear}`)
  },

  /**
   * Fetches all pending leave applications (admin only).
   * @returns Array of pending applications
   */
  getPending: async (): Promise<LeaveApplication[]> => {
    return apiClient.get<LeaveApplication[]>('/leaves/pending')
  },

  /**
   * Approves a leave application (admin only).
   * @param applicationId - Application ID
   * @param comments - Optional approval comments
   * @returns Updated leave application
   */
  approve: async (applicationId: number, comments?: string): Promise<LeaveApplication> => {
    return apiClient.post<LeaveApplication>(`/leaves/${applicationId}/approve`, { comments })
  },

  /**
   * Rejects a leave application (admin only).
   * @param applicationId - Application ID
   * @param comments - Optional rejection reason
   * @returns Updated leave application
   */
  reject: async (applicationId: number, comments?: string): Promise<LeaveApplication> => {
    return apiClient.post<LeaveApplication>(`/leaves/${applicationId}/reject`, { comments })
  },

  /**
   * Cancels a pending leave application.
   * @param applicationId - Application ID to cancel
   */
  cancel: async (applicationId: number): Promise<void> => {
    await apiClient.post<void>(`/leaves/${applicationId}/cancel`)
  }
}
