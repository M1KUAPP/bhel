/**
 * Employees API Module
 *
 * API methods for employee management operations.
 * Handles CRUD operations for employees and their family details.
 *
 * Features:
 * - List all employees
 * - Get employee by ID
 * - Register new employee
 * - Update employee profile
 * - Manage family member details
 */
import { apiClient } from './client'
import { Employee, EmployeeRegistration, FamilyMember, ProfileUpdate } from './types'

/** Employee management API methods */
export const employeesApi = {
  /**
   * Fetches all employees.
   * @returns Array of all employee records
   */
  getAll: async (): Promise<Employee[]> => {
    return apiClient.get<Employee[]>('/employees')
  },

  /**
   * Fetches a single employee by ID.
   * @param id - Employee ID
   * @returns Employee record
   */
  getById: async (id: number): Promise<Employee> => {
    return apiClient.get<Employee>(`/employees/${id}`)
  },

  /**
   * Registers a new employee.
   * @param data - Employee registration data
   * @returns Created employee record
   */
  register: async (data: EmployeeRegistration): Promise<Employee> => {
    return apiClient.post<Employee>('/employees', data)
  },

  /**
   * Updates an employee's profile.
   * @param id - Employee ID
   * @param data - Partial profile data to update
   * @returns Updated employee record
   */
  updateProfile: async (id: number, data: ProfileUpdate): Promise<Employee> => {
    return apiClient.put<Employee>(`/employees/${id}/profile`, data)
  },

  /**
   * Fetches family members for an employee.
   * @param id - Employee ID
   * @returns Array of family member records
   */
  getFamilyDetails: async (id: number): Promise<FamilyMember[]> => {
    return apiClient.get<FamilyMember[]>(`/employees/${id}/family`)
  },

  /**
   * Updates family member details for an employee.
   * @param id - Employee ID
   * @param family - Complete family members array
   * @returns Updated family members array
   */
  updateFamilyDetails: async (id: number, family: FamilyMember[]): Promise<FamilyMember[]> => {
    return apiClient.put<FamilyMember[]>(`/employees/${id}/family`, family)
  }
}
