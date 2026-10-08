package hrms.bhel.common.service;

import hrms.bhel.common.dto.*;
import java.rmi.Remote;
import java.rmi.RemoteException;
import java.util.List;

/**
 * Remote service interface for employee management operations.
 * Provides methods for employee registration, profile updates, and family information management.
 */
public interface EmployeeService extends Remote {
  /**
   * Registers a new employee in the system.
   * @param registration the employee registration data
   * @return the created Employee with generated ID and timestamps
   * @throws RemoteException if a remote communication error occurs
   */
  Employee registerEmployee(EmployeeRegistration registration) throws RemoteException;

  /**
   * Retrieves an employee by their unique identifier.
   * @param id the employee ID
   * @return the Employee if found
   * @throws RemoteException if a remote communication error occurs
   */
  Employee getEmployeeById(Long id) throws RemoteException;

  /**
   * Retrieves all employees in the system.
   * @return list of all employees
   * @throws RemoteException if a remote communication error occurs
   */
  List<Employee> getAllEmployees() throws RemoteException;

  /**
   * Updates an existing employee's profile information.
   * @param id the employee ID to update
   * @param update the profile update data
   * @return true if the update was successful
   * @throws RemoteException if a remote communication error occurs
   */
  boolean updateEmployeeProfile(Long id, ProfileUpdate update) throws RemoteException;

  /**
   * Retrieves family member details for a specific employee.
   * @param employeeId the employee ID
   * @return list of family members associated with the employee
   * @throws RemoteException if a remote communication error occurs
   */
  List<FamilyMember> getFamilyDetails(Long employeeId) throws RemoteException;

  /**
   * Updates the family member information for an employee.
   * @param employeeId the employee ID
   * @param members the list of family members to save
   * @return true if the update was successful
   * @throws RemoteException if a remote communication error occurs
   */
  boolean updateFamilyDetails(Long employeeId, List<FamilyMember> members) throws RemoteException;
}
