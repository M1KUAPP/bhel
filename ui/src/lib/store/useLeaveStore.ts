/**
 * Leave Store Module
 *
 * Zustand store for managing leave applications and balances.
 * Handles leave requests, approvals, and history tracking.
 *
 * Features:
 * - Fetch leave balances by year
 * - Apply for leave
 * - View application status and history
 * - Approve/reject applications (admin)
 * - Cancel pending applications
 * - Loading and error state tracking
 */
import { leavesApi } from '@/lib/api/leaves'
import { LeaveApplication, LeaveBalance, LeaveRequest } from '@/lib/api/types'
import { executeStoreAction, executeStoreActionSilent } from '@/lib/utils/storeUtils'
import { create } from 'zustand'

/** Leave store state and actions */
interface LeaveState {
  /** Leave balances by type */
  leaveBalance: LeaveBalance[]
  /** Leave application history */
  applications: LeaveApplication[]
  /** Pending applications for approval (admin) */
  pendingApplications: LeaveApplication[]
  /** Currently viewed application */
  currentApplication: LeaveApplication | null
  /** Loading state for async operations */
  loading: boolean
  /** Error message from failed operations */
  error: string | null
  /** Fetches leave balances for employee */
  fetchBalance: (employeeId: number, year?: number) => Promise<void>
  /** Submits new leave application */
  applyLeave: (request: LeaveRequest) => Promise<LeaveApplication>
  /** Fetches single application status */
  fetchApplicationStatus: (applicationId: number) => Promise<void>
  /** Fetches leave history for employee */
  fetchHistory: (employeeId: number, year?: number) => Promise<void>
  /** Fetches all pending applications (admin) */
  fetchPendingApplications: () => Promise<void>
  /** Approves leave application (admin) */
  approveLeave: (applicationId: number, comments?: string) => Promise<void>
  /** Rejects leave application (admin) */
  rejectLeave: (applicationId: number, comments?: string) => Promise<void>
  /** Cancels pending leave application */
  cancelLeave: (applicationId: number) => Promise<void>
  /** Clears error state */
  clearError: () => void
  /** Clears current application selection */
  clearCurrentApplication: () => void
}

/**
 * Leave store hook.
 * Provides leave balances, applications, and approval workflow.
 */
export const useLeaveStore = create<LeaveState>((set) => ({
  leaveBalance: [],
  applications: [],
  pendingApplications: [],
  currentApplication: null,
  loading: false,
  error: null,

  /** Fetches and stores leave balances for an employee */
  fetchBalance: async (employeeId: number, year?: number) => {
    const balance = await executeStoreActionSilent(
      set,
      () => leavesApi.getBalance(employeeId, year),
      'Failed to fetch leave balance'
    )
    if (balance) {
      set({ leaveBalance: balance })
    }
  },
  /** Submits leave application and adds to list */
  applyLeave: async (request: LeaveRequest) => {
    const application = await executeStoreAction(set, () => leavesApi.apply(request), {
      successMessage: 'Leave application submitted successfully!',
      errorMessage: 'Failed to apply for leave'
    })
    set((state) => ({ applications: [...state.applications, application] }))
    return application
  },
  /** Fetches status of specific application */
  fetchApplicationStatus: async (applicationId: number) => {
    const application = await executeStoreActionSilent(
      set,
      () => leavesApi.getStatus(applicationId),
      'Failed to fetch application status'
    )
    if (application) {
      set({ currentApplication: application })
    }
  },
  /** Fetches leave history for an employee */
  fetchHistory: async (employeeId: number, year?: number) => {
    const history = await executeStoreActionSilent(
      set,
      () => leavesApi.getHistory(employeeId, year),
      'Failed to fetch leave history'
    )
    if (history) {
      set({ applications: history })
    }
  },
  /** Fetches all pending applications for admin review */
  fetchPendingApplications: async () => {
    const pending = await executeStoreActionSilent(
      set,
      () => leavesApi.getPending(),
      'Failed to fetch pending applications'
    )
    if (pending) {
      set({ pendingApplications: pending })
    }
  },
  /** Approves application and updates lists */
  approveLeave: async (applicationId: number, comments?: string) => {
    const updatedApplication = await executeStoreAction(set, () => leavesApi.approve(applicationId, comments), {
      successMessage: 'Leave application approved successfully!',
      errorMessage: 'Failed to approve leave'
    })
    set((state) => ({
      applications: state.applications.map((app) => (app.id === applicationId ? updatedApplication : app)),
      pendingApplications: state.pendingApplications.filter((app) => app.id !== applicationId),
      currentApplication: state.currentApplication?.id === applicationId ? updatedApplication : state.currentApplication
    }))
  },
  /** Rejects application and updates lists */
  rejectLeave: async (applicationId: number, comments?: string) => {
    const updatedApplication = await executeStoreAction(set, () => leavesApi.reject(applicationId, comments), {
      successMessage: 'Leave application rejected',
      errorMessage: 'Failed to reject leave'
    })
    set((state) => ({
      applications: state.applications.map((app) => (app.id === applicationId ? updatedApplication : app)),
      pendingApplications: state.pendingApplications.filter((app) => app.id !== applicationId),
      currentApplication: state.currentApplication?.id === applicationId ? updatedApplication : state.currentApplication
    }))
  },
  /** Cancels pending application */
  cancelLeave: async (applicationId: number) => {
    await executeStoreAction(set, () => leavesApi.cancel(applicationId), {
      successMessage: 'Leave application cancelled successfully!',
      errorMessage: 'Failed to cancel leave'
    })
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === applicationId ? { ...app, status: 'cancelled' as const } : app
      ),
      currentApplication:
        state.currentApplication?.id === applicationId
          ? { ...state.currentApplication, status: 'cancelled' as const }
          : state.currentApplication
    }))
  },
  /** Clears any stored error message */
  clearError: () => {
    set({ error: null })
  },

  /** Clears current application selection */
  clearCurrentApplication: () => {
    set({ currentApplication: null })
  }
}))
