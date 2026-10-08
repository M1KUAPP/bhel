package hrms.bhel.common.service;

import hrms.bhel.common.dto.User;
import java.rmi.Remote;
import java.rmi.RemoteException;

/**
 * Remote service interface for user authentication and management operations.
 * Provides methods for user login, account creation, and login tracking.
 */
public interface UserService extends Remote {
  /**
   * Authenticates a user with the provided credentials.
   * @param username the username
   * @param password the password
   * @return the authenticated User if credentials are valid, null otherwise
   * @throws RemoteException if a remote communication error occurs
   */
  User authenticate(String username, String password) throws RemoteException;

  /**
   * Updates the last login timestamp for a user.
   * @param userId the user ID
   * @throws RemoteException if a remote communication error occurs
   */
  void updateLastLogin(Long userId) throws RemoteException;

  /**
   * Creates a new user account linked to an employee.
   * @param employeeId the employee ID to link the user to
   * @param username the username for the new account
   * @param password the password for the new account
   * @param role the user role (e.g., EMPLOYEE, HR, ADMIN)
   * @return the created User with generated ID
   * @throws RemoteException if a remote communication error occurs
   */
  User createUser(Long employeeId, String username, String password, String role) throws RemoteException;
}
