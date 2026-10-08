package hrms.bhel.server.service;

import hrms.bhel.common.dto.*;
import hrms.bhel.common.exception.DuplicateEmployeeException;
import hrms.bhel.common.exception.EmployeeNotFoundException;
import hrms.bhel.common.service.EmployeeService;
import hrms.bhel.server.dao.EmployeeDAO;
import hrms.bhel.server.dao.FamilyDAO;
import hrms.bhel.server.dao.LeaveDAO;
import hrms.bhel.server.dao.UserDAO;
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;
import java.sql.SQLException;
import java.util.List;
import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * RMI service implementation for employee management operations.
 * Handles employee registration, profile updates, and family information management.
 * Also creates associated user accounts and leave balances for new employees.
 */
public class EmployeeServiceImpl extends UnicastRemoteObject implements EmployeeService {

  private static final Logger logger = LoggerFactory.getLogger(EmployeeServiceImpl.class);
  private static final int BCRYPT_ROUNDS = 12;
  private final EmployeeDAO employeeDAO;
  private final FamilyDAO familyDAO;
  private final UserDAO userDAO;
  private final LeaveDAO leaveDAO;

  /**
   * Constructs a new EmployeeServiceImpl with required DAOs.
   * @param employeeDAO the employee data access object
   * @param familyDAO the family data access object
   * @param userDAO the user data access object
   * @param leaveDAO the leave data access object
   * @throws RemoteException if RMI export fails
   */
  public EmployeeServiceImpl(EmployeeDAO employeeDAO, FamilyDAO familyDAO, UserDAO userDAO, LeaveDAO leaveDAO)
    throws RemoteException {
    super(0);
    this.employeeDAO = employeeDAO;
    this.familyDAO = familyDAO;
    this.userDAO = userDAO;
    this.leaveDAO = leaveDAO;
    logger.info("EmployeeServiceImpl initialized successfully");
  }

  @Override
  public Employee registerEmployee(EmployeeRegistration registration) throws RemoteException {
    logger.info("Attempting to register employee: {} {}", registration.getFirstName(), registration.getLastName());
    try {
      if (employeeDAO.existsByIcPassport(registration.getIcPassportNumber())) {
        String errorMsg = "Employee with IC/Passport number " + registration.getIcPassportNumber() + " already exists";
        logger.error(errorMsg);
        throw new DuplicateEmployeeException(errorMsg);
      }
      if (employeeDAO.existsByEmail(registration.getEmail())) {
        String errorMsg = "Employee with email " + registration.getEmail() + " already exists";
        logger.error(errorMsg);
        throw new DuplicateEmployeeException(errorMsg);
      }
      Long employeeId = employeeDAO.create(registration);
      Employee employee = employeeDAO.findById(employeeId);
      if (employee == null) {
        String errorMsg = "Failed to retrieve newly created employee with ID: " + employeeId;
        logger.error(errorMsg);
        throw new RemoteException(errorMsg);
      }
      createUserForEmployee(employeeId, registration.getIcPassportNumber(), registration.getDepartment());
      createLeaveBalancesForEmployee(employeeId);
      logger.info("Employee registered successfully with ID: {}", employeeId);
      return employee;
    } catch (DuplicateEmployeeException e) {
      throw new RemoteException(e.getMessage(), e);
    } catch (SQLException e) {
      String errorMsg = "Database error while registering employee: " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  /**
   * Creates a user account for the newly registered employee.
   * Uses IC/passport number as initial username and password.
   * @param employeeId the employee ID
   * @param icPassportNumber the IC/passport number for credentials
   * @param department the department to determine role
   * @throws SQLException if database operation fails
   */
  private void createUserForEmployee(Long employeeId, String icPassportNumber, String department) throws SQLException {
    String role = determineRoleByDepartment(department);
    String passwordHash = BCrypt.hashpw(icPassportNumber, BCrypt.gensalt(BCRYPT_ROUNDS));
    userDAO.create(employeeId, icPassportNumber, passwordHash, role);
    logger.info(
      "User account created for employee ID: {} with username: {} and role: {}",
      employeeId,
      icPassportNumber,
      role
    );
  }

  /**
   * Determines user role based on department.
   * @param department the department name
   * @return "admin" for Admin, "hr" for Human Resources, "employee" otherwise
   */
  private String determineRoleByDepartment(String department) {
    if (department == null) {
      return "employee";
    }
    switch (department) {
      case "Admin":
        return "admin";
      case "Human Resources":
        return "hr";
      default:
        return "employee";
    }
  }

  /**
   * Creates initial leave balances for a new employee for all leave types.
   * @param employeeId the employee ID
   * @throws SQLException if database operation fails
   */
  private void createLeaveBalancesForEmployee(Long employeeId) throws SQLException {
    int balancesCreated = leaveDAO.createBalancesForNewEmployee(employeeId);
    logger.info("Created {} leave balance records for employee ID: {}", balancesCreated, employeeId);
  }

  @Override
  public Employee getEmployeeById(Long id) throws RemoteException {
    logger.debug("Retrieving employee with ID: {}", id);
    try {
      Employee employee = employeeDAO.findById(id);
      if (employee == null) {
        logger.warn("Employee not found with ID: {}", id);
      } else {
        logger.debug("Employee found with ID: {}", id);
      }
      return employee;
    } catch (SQLException e) {
      String errorMsg = "Database error while retrieving employee by ID " + id + ": " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public List<Employee> getAllEmployees() throws RemoteException {
    logger.debug("Retrieving all employees");
    try {
      List<Employee> employees = employeeDAO.findAll();
      logger.info("Retrieved {} employees", employees.size());
      return employees;
    } catch (SQLException e) {
      String errorMsg = "Database error while retrieving all employees: " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public boolean updateEmployeeProfile(Long id, ProfileUpdate update) throws RemoteException {
    logger.info("Updating profile for employee ID: {}", id);
    try {
      Employee existing = employeeDAO.findById(id);
      if (existing == null) {
        String errorMsg = "Employee not found with ID: " + id;
        logger.error(errorMsg);
        throw new EmployeeNotFoundException(errorMsg);
      }
      if (update.getEmail() != null && !update.getEmail().equals(existing.getEmail())) {
        if (employeeDAO.existsByEmail(update.getEmail())) {
          String errorMsg = "Email " + update.getEmail() + " is already in use by another employee";
          logger.error(errorMsg);
          throw new DuplicateEmployeeException(errorMsg);
        }
      }
      Employee updated = new Employee();
      updated.setId(id);
      updated.setFirstName(update.getFirstName() != null ? update.getFirstName() : existing.getFirstName());
      updated.setLastName(update.getLastName() != null ? update.getLastName() : existing.getLastName());
      updated.setEmail(update.getEmail() != null ? update.getEmail() : existing.getEmail());
      updated.setIcPassportNumber(
        update.getIcPassportNumber() != null ? update.getIcPassportNumber() : existing.getIcPassportNumber()
      );
      updated.setPhone(update.getPhone() != null ? update.getPhone() : existing.getPhone());
      updated.setDepartment(update.getDepartment() != null ? update.getDepartment() : existing.getDepartment());
      updated.setPosition(update.getPosition() != null ? update.getPosition() : existing.getPosition());
      updated.setHireDate(update.getHireDate() != null ? update.getHireDate() : existing.getHireDate());
      updated.setStatus(update.getStatus() != null ? update.getStatus() : existing.getStatus());
      boolean success = employeeDAO.update(id, updated);
      if (success) {
        logger.info("Employee profile updated successfully for ID: {}", id);
      } else {
        logger.warn("Failed to update employee profile for ID: {}", id);
      }
      return success;
    } catch (EmployeeNotFoundException | DuplicateEmployeeException e) {
      throw new RemoteException(e.getMessage(), e);
    } catch (SQLException e) {
      String errorMsg = "Database error while updating employee profile for ID " + id + ": " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public List<FamilyMember> getFamilyDetails(Long employeeId) throws RemoteException {
    logger.debug("Retrieving family details for employee ID: {}", employeeId);
    try {
      Employee employee = employeeDAO.findById(employeeId);
      if (employee == null) {
        String errorMsg = "Employee not found with ID: " + employeeId;
        logger.error(errorMsg);
        throw new EmployeeNotFoundException(errorMsg);
      }
      List<FamilyMember> familyMembers = familyDAO.findByEmployeeId(employeeId);
      logger.info("Retrieved {} family members for employee ID: {}", familyMembers.size(), employeeId);
      return familyMembers;
    } catch (EmployeeNotFoundException e) {
      throw new RemoteException(e.getMessage(), e);
    } catch (SQLException e) {
      String errorMsg =
        "Database error while retrieving family details for employee ID " + employeeId + ": " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public boolean updateFamilyDetails(Long employeeId, List<FamilyMember> members) throws RemoteException {
    logger.info("Updating family details for employee ID: {}, new member count: {}", employeeId, members.size());
    try {
      Employee employee = employeeDAO.findById(employeeId);
      if (employee == null) {
        String errorMsg = "Employee not found with ID: " + employeeId;
        logger.error(errorMsg);
        throw new EmployeeNotFoundException(errorMsg);
      }
      int deletedCount = familyDAO.deleteByEmployeeId(employeeId);
      logger.debug("Deleted {} existing family members for employee ID: {}", deletedCount, employeeId);
      int insertedCount = 0;
      for (FamilyMember member : members) {
        member.setEmployeeId(employeeId);
        Long memberId = familyDAO.create(member);
        if (memberId != null) {
          insertedCount++;
        }
      }
      logger.info("Inserted {} new family members for employee ID: {}", insertedCount, employeeId);
      boolean success = (insertedCount == members.size());
      if (!success) {
        logger.warn(
          "Failed to insert all family members for employee ID: {}. Expected: {}, Inserted: {}",
          employeeId,
          members.size(),
          insertedCount
        );
      }
      return success;
    } catch (EmployeeNotFoundException e) {
      throw new RemoteException(e.getMessage(), e);
    } catch (SQLException e) {
      String errorMsg =
        "Database error while updating family details for employee ID " + employeeId + ": " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }
}
