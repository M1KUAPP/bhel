/**
 * Employee Store Module
 *
 * Zustand store for managing employee data and operations.
 * Handles CRUD operations for employees and family members.
 *
 * Features:
 * - Fetch all employees or single employee
 * - Register new employees
 * - Update employee profiles
 * - Manage family member details
 * - Loading and error state tracking
 * - Toast notifications for operations
 */
import { employeesApi } from '@/lib/api/employees'
import { Employee, EmployeeRegistration, FamilyMember, ProfileUpdate } from '@/lib/api/types'
import { executeStoreAction, executeStoreActionSilent } from '@/lib/utils/storeUtils'
import { create } from 'zustand'

/** Employee store state and actions */
interface EmployeeState {
  /** List of all employees */
  employees: Employee[]
  /** Currently selected/viewed employee */
  currentEmployee: Employee | null
  /** Family members of current employee */
  familyMembers: FamilyMember[]
  /** Loading state for async operations */
  loading: boolean
  /** Error message from failed operations */
  error: string | null
  /** Fetches all employees from API */
  fetchEmployees: () => Promise<void>
  /** Fetches single employee by ID */
  fetchEmployee: (id: number) => Promise<void>
  /** Registers new employee */
  registerEmployee: (data: EmployeeRegistration) => Promise<Employee>
  /** Updates employee profile */
  updateProfile: (id: number, data: ProfileUpdate) => Promise<void>
  /** Fetches family members for employee */
  fetchFamilyDetails: (id: number) => Promise<void>
  /** Updates family member details */
  updateFamilyDetails: (id: number, family: FamilyMember[]) => Promise<void>
  /** Clears error state */
  clearError: () => void
}

/**
 * Employee store hook.
 * Provides employee data, CRUD operations, and family management.
 */
export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: [],
  currentEmployee: null,
  familyMembers: [],
  loading: false,
  error: null,

  /** Fetches and stores all employees */
  fetchEmployees: async () => {
    const employees = await executeStoreActionSilent(set, () => employeesApi.getAll(), 'Failed to fetch employees')
    if (employees) {
      set({ employees })
    }
  },
  /** Fetches single employee and sets as current */
  fetchEmployee: async (id: number) => {
    set({ currentEmployee: null })
    const employee = await executeStoreActionSilent(set, () => employeesApi.getById(id), 'Failed to fetch employee')
    if (employee) {
      set({ currentEmployee: employee })
    }
  },
  /** Registers new employee and adds to list */
  registerEmployee: async (data: EmployeeRegistration) => {
    const newEmployee = await executeStoreAction(set, () => employeesApi.register(data), {
      successMessage: 'Employee registered successfully!',
      errorMessage: 'Failed to register employee'
    })
    set((state) => ({ employees: [...state.employees, newEmployee] }))
    return newEmployee
  },
  /** Updates employee profile and refreshes store */
  updateProfile: async (id: number, data: ProfileUpdate) => {
    const updatedEmployee = await executeStoreAction(set, () => employeesApi.updateProfile(id, data), {
      successMessage: 'Profile updated successfully!',
      errorMessage: 'Failed to update profile'
    })
    set((state) => ({
      employees: state.employees.map((emp) => (emp.id === id ? updatedEmployee : emp)),
      currentEmployee: state.currentEmployee?.id === id ? updatedEmployee : state.currentEmployee
    }))
  },
  /** Fetches family members for an employee */
  fetchFamilyDetails: async (id: number) => {
    set({ familyMembers: [] })
    const familyMembers = await executeStoreActionSilent(
      set,
      () => employeesApi.getFamilyDetails(id),
      'Failed to fetch family details'
    )
    if (familyMembers) {
      set({ familyMembers })
    }
  },
  /** Updates family details for an employee */
  updateFamilyDetails: async (id: number, family: FamilyMember[]) => {
    const updatedFamily = await executeStoreAction(set, () => employeesApi.updateFamilyDetails(id, family), {
      successMessage: 'Family details updated successfully!',
      errorMessage: 'Failed to update family details'
    })
    set({ familyMembers: updatedFamily })
  },
  /** Clears any stored error message */
  clearError: () => {
    set({ error: null })
  }
}))
