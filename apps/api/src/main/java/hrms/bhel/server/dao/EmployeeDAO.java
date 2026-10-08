package hrms.bhel.server.dao;

import hrms.bhel.common.dto.Employee;
import hrms.bhel.common.dto.EmployeeRegistration;
import hrms.bhel.server.config.DatabaseConfig;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Data Access Object for employee database operations.
 * Provides CRUD operations and queries for the employees table.
 * Computes effective employee status based on active leave applications.
 */
public class EmployeeDAO {

  private static final Logger logger = LoggerFactory.getLogger(EmployeeDAO.class);

  /** SQL fragment for computing effective status (shows 'on_leave' if employee has approved leave for today). */
  private static final String EFFECTIVE_STATUS_SQL =
    "CASE WHEN EXISTS (" +
    "SELECT 1 FROM leave_applications la " +
    "WHERE la.employee_id = e.id " +
    "AND la.status = 'approved' " +
    "AND CURRENT_DATE BETWEEN la.start_date AND la.end_date" +
    ") THEN 'on_leave' ELSE e.status END AS effective_status";

  /**
   * Creates a new employee record in the database.
   * @param registration the employee registration data
   * @return the generated employee ID
   * @throws SQLException if a database error occurs
   */
  public Long create(EmployeeRegistration registration) throws SQLException {
    String sql =
      "INSERT INTO employees (first_name, last_name, ic_passport_number, " +
      "email, phone, department, position, hire_date) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setString(1, registration.getFirstName());
      pstmt.setString(2, registration.getLastName());
      pstmt.setString(3, registration.getIcPassportNumber());
      pstmt.setString(4, registration.getEmail());
      pstmt.setString(5, registration.getPhone());
      pstmt.setString(6, registration.getDepartment());
      pstmt.setString(7, registration.getPosition());
      pstmt.setDate(8, new java.sql.Date(registration.getHireDate().getTime()));
      ResultSet rs = pstmt.executeQuery();
      if (rs.next()) {
        Long id = rs.getLong("id");
        logger.info("Employee created successfully with ID: {}", id);
        return id;
      }
      throw new SQLException("Employee creation failed, no ID obtained");
    } catch (SQLException e) {
      logger.error("Failed to create employee: {}", e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Finds an employee by ID with effective status computation.
   * @param id the employee ID
   * @return the Employee or null if not found
   * @throws SQLException if a database error occurs
   */
  public Employee findById(Long id) throws SQLException {
    String sql = "SELECT e.*, " + EFFECTIVE_STATUS_SQL + " FROM employees e WHERE e.id = ?";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setLong(1, id);
      ResultSet rs = pstmt.executeQuery();
      if (rs.next()) {
        Employee employee = mapEmployeeWithEffectiveStatus(rs);
        logger.debug("Employee found with ID: {}", id);
        return employee;
      }
      logger.debug("No employee found with ID: {}", id);
      return null;
    } catch (SQLException e) {
      logger.error("Failed to find employee by ID {}: {}", id, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Finds an employee by email address.
   * @param email the email address
   * @return the Employee or null if not found
   * @throws SQLException if a database error occurs
   */
  public Employee findByEmail(String email) throws SQLException {
    String sql = "SELECT e.*, " + EFFECTIVE_STATUS_SQL + " FROM employees e WHERE e.email = ?";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setString(1, email);
      ResultSet rs = pstmt.executeQuery();
      if (rs.next()) {
        Employee employee = mapEmployeeWithEffectiveStatus(rs);
        logger.debug("Employee found with email: {}", email);
        return employee;
      }
      logger.debug("No employee found with email: {}", email);
      return null;
    } catch (SQLException e) {
      logger.error("Failed to find employee by email {}: {}", email, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Retrieves all employees ordered by ID.
   * @return list of all employees
   * @throws SQLException if a database error occurs
   */
  public List<Employee> findAll() throws SQLException {
    String sql = "SELECT e.*, " + EFFECTIVE_STATUS_SQL + " FROM employees e ORDER BY e.id";
    List<Employee> employees = new ArrayList<>();
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      Statement stmt = conn.createStatement();
      ResultSet rs = stmt.executeQuery(sql)
    ) {
      while (rs.next()) {
        employees.add(mapEmployeeWithEffectiveStatus(rs));
      }
      logger.debug("Retrieved {} employees from database", employees.size());
      return employees;
    } catch (SQLException e) {
      logger.error("Failed to retrieve all employees: {}", e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Finds all employees in a specific department.
   * @param department the department name
   * @return list of employees in the department
   * @throws SQLException if a database error occurs
   */
  public List<Employee> findByDepartment(String department) throws SQLException {
    String sql = "SELECT e.*, " + EFFECTIVE_STATUS_SQL + " FROM employees e WHERE e.department = ? ORDER BY e.id";
    List<Employee> employees = new ArrayList<>();
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setString(1, department);
      ResultSet rs = pstmt.executeQuery();
      while (rs.next()) {
        employees.add(mapEmployeeWithEffectiveStatus(rs));
      }
      logger.debug("Retrieved {} employees from department: {}", employees.size(), department);
      return employees;
    } catch (SQLException e) {
      logger.error("Failed to retrieve employees by department {}: {}", department, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Updates an existing employee record.
   * @param id the employee ID
   * @param employee the updated employee data
   * @return true if update was successful
   * @throws SQLException if a database error occurs
   */
  public boolean update(Long id, Employee employee) throws SQLException {
    String sql =
      "UPDATE employees SET first_name = ?, last_name = ?, " +
      "email = ?, ic_passport_number = ?, phone = ?, department = ?, position = ?, hire_date = ?, status = ? " +
      "WHERE id = ?";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setString(1, employee.getFirstName());
      pstmt.setString(2, employee.getLastName());
      pstmt.setString(3, employee.getEmail());
      pstmt.setString(4, employee.getIcPassportNumber());
      pstmt.setString(5, employee.getPhone());
      pstmt.setString(6, employee.getDepartment());
      pstmt.setString(7, employee.getPosition());
      pstmt.setDate(8, new java.sql.Date(employee.getHireDate().getTime()));
      pstmt.setString(9, employee.getStatus());
      pstmt.setLong(10, id);
      int rowsAffected = pstmt.executeUpdate();
      boolean success = rowsAffected > 0;
      if (success) {
        logger.info("Employee {} updated successfully, rows affected: {}", id, rowsAffected);
      } else {
        logger.warn("Employee {} not found for update", id);
      }
      return success;
    } catch (SQLException e) {
      logger.error("Failed to update employee {}: {}", id, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Checks if an employee exists with the given IC/passport number.
   * @param icPassportNumber the IC/passport number
   * @return true if an employee exists with this IC/passport
   * @throws SQLException if a database error occurs
   */
  public boolean existsByIcPassport(String icPassportNumber) throws SQLException {
    String sql = "SELECT EXISTS(SELECT 1 FROM employees WHERE ic_passport_number = ?)";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setString(1, icPassportNumber);
      ResultSet rs = pstmt.executeQuery();
      if (rs.next()) {
        boolean exists = rs.getBoolean(1);
        logger.debug("IC/Passport {} existence check: {}", icPassportNumber, exists);
        return exists;
      }
      return false;
    } catch (SQLException e) {
      logger.error("Failed to check IC/Passport existence {}: {}", icPassportNumber, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Checks if an employee exists with the given email.
   * @param email the email address
   * @return true if an employee exists with this email
   * @throws SQLException if a database error occurs
   */
  public boolean existsByEmail(String email) throws SQLException {
    String sql = "SELECT EXISTS(SELECT 1 FROM employees WHERE email = ?)";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setString(1, email);
      ResultSet rs = pstmt.executeQuery();
      if (rs.next()) {
        boolean exists = rs.getBoolean(1);
        logger.debug("Email {} existence check: {}", email, exists);
        return exists;
      }
      return false;
    } catch (SQLException e) {
      logger.error("Failed to check email existence {}: {}", email, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Maps a ResultSet row to Employee with effective status.
   * @param rs the result set positioned at the row
   * @return the mapped Employee
   * @throws SQLException if a database error occurs
   */
  private Employee mapEmployeeWithEffectiveStatus(ResultSet rs) throws SQLException {
    return mapEmployee(rs, "effective_status");
  }

  /**
   * Maps a ResultSet row to Employee using the specified status column.
   * @param rs the result set positioned at the row
   * @param statusColumn the name of the status column to use
   * @return the mapped Employee
   * @throws SQLException if a database error occurs
   */
  private Employee mapEmployee(ResultSet rs, String statusColumn) throws SQLException {
    Employee emp = new Employee();
    emp.setId(rs.getLong("id"));
    emp.setFirstName(rs.getString("first_name"));
    emp.setLastName(rs.getString("last_name"));
    emp.setIcPassportNumber(rs.getString("ic_passport_number"));
    emp.setEmail(rs.getString("email"));
    emp.setPhone(rs.getString("phone"));
    emp.setDepartment(rs.getString("department"));
    emp.setPosition(rs.getString("position"));
    emp.setHireDate(rs.getDate("hire_date"));
    emp.setStatus(rs.getString(statusColumn));
    emp.setCreatedAt(rs.getTimestamp("created_at"));
    emp.setUpdatedAt(rs.getTimestamp("updated_at"));
    return emp;
  }
}
