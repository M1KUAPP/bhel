package hrms.bhel.server.service;

import hrms.bhel.common.dto.User;
import hrms.bhel.common.service.UserService;
import hrms.bhel.server.dao.EmployeeDAO;
import hrms.bhel.server.dao.UserDAO;
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;
import java.sql.SQLException;
import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * RMI service implementation for user authentication and management.
 * Handles login authentication using BCrypt password hashing,
 * user account creation, and login tracking.
 */
public class UserServiceImpl extends UnicastRemoteObject implements UserService {

  private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
  private static final int BCRYPT_ROUNDS = 12;
  private final UserDAO userDAO;
  private final EmployeeDAO employeeDAO;

  /**
   * Constructs a new UserServiceImpl with required DAOs.
   * @param userDAO the user data access object
   * @param employeeDAO the employee data access object
   * @throws RemoteException if RMI export fails
   */
  public UserServiceImpl(UserDAO userDAO, EmployeeDAO employeeDAO) throws RemoteException {
    super(0);
    this.userDAO = userDAO;
    this.employeeDAO = employeeDAO;
    logger.info("UserServiceImpl initialized successfully");
  }

  @Override
  public User authenticate(String username, String password) throws RemoteException {
    logger.info("Authentication attempt for user: {}", username);
    if (username == null || password == null) {
      logger.warn("Authentication failed: Null username or password");
      throw new RemoteException("Username and password cannot be null");
    }
    try {
      String storedHash = userDAO.getPasswordHashByUsername(username);
      if (storedHash == null) {
        logger.warn("Authentication failed: User not found - {}", username);
        return null;
      }
      boolean passwordMatches = BCrypt.checkpw(password, storedHash);
      if (!passwordMatches) {
        logger.warn("Authentication failed: Invalid password for user - {}", username);
        return null;
      }
      User user = userDAO.findByUsername(username);
      if (user == null) {
        logger.error("User found during password check but not found when retrieving details: {}", username);
        return null;
      }
      try {
        userDAO.updateLastLogin(user.getId());
      } catch (SQLException e) {
        logger.warn("Failed to update last login for user {}: {}", username, e.getMessage());
      }
      logger.info("Authentication successful for user: {} with role: {}", username, user.getRole());
      return user;
    } catch (SQLException e) {
      String errorMsg = "Database error during authentication for user " + username + ": " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    } catch (Exception e) {
      String errorMsg = "Unexpected error during authentication for user " + username + ": " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public void updateLastLogin(Long userId) throws RemoteException {
    logger.debug("Updating last login for user ID: {}", userId);
    try {
      userDAO.updateLastLogin(userId);
    } catch (SQLException e) {
      String errorMsg = "Database error while updating last login for user " + userId + ": " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public User createUser(Long employeeId, String username, String password, String role) throws RemoteException {
    logger.info("Creating user account for employee ID {} with username: {}", employeeId, username);
    try {
      if (!isValidRole(role)) {
        String errorMsg = "Invalid role: " + role + ". Must be one of: admin, employee, hr";
        logger.error(errorMsg);
        throw new IllegalArgumentException(errorMsg);
      }
      if (userDAO.existsByUsername(username)) {
        String errorMsg = "Username already exists: " + username;
        logger.error(errorMsg);
        throw new IllegalArgumentException(errorMsg);
      }
      if (employeeDAO.findById(employeeId) == null) {
        String errorMsg = "Employee not found with ID: " + employeeId;
        logger.error(errorMsg);
        throw new IllegalArgumentException(errorMsg);
      }
      String passwordHash = BCrypt.hashpw(password, BCrypt.gensalt(BCRYPT_ROUNDS));
      Long userId = userDAO.create(employeeId, username, passwordHash, role);
      User user = userDAO.findByUsername(username);
      if (user == null) {
        String errorMsg = "Failed to retrieve newly created user with ID: " + userId;
        logger.error(errorMsg);
        throw new RemoteException(errorMsg);
      }
      logger.info("User created successfully with ID: {} for employee ID: {}", userId, employeeId);
      return user;
    } catch (IllegalArgumentException e) {
      throw new RemoteException(e.getMessage(), e);
    } catch (SQLException e) {
      String errorMsg = "Database error while creating user: " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  /**
   * Validates if the role is one of the allowed values.
   * @param role the role to validate
   * @return true if valid (admin, employee, or hr)
   */
  private boolean isValidRole(String role) {
    if (role == null) {
      return false;
    }
    String lowerRole = role.toLowerCase();
    return (lowerRole.equals("admin") || lowerRole.equals("employee") || lowerRole.equals("hr"));
  }
}
