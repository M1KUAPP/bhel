package hrms.bhel.server.dao;

import hrms.bhel.common.dto.Employee;
import hrms.bhel.common.dto.User;
import hrms.bhel.server.config.DatabaseConfig;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Data Access Object for user account database operations.
 * Provides operations for user authentication, account creation,
 * and login tracking in the users table.
 */
public class UserDAO {

  private static final Logger logger = LoggerFactory.getLogger(UserDAO.class);
  private final EmployeeDAO employeeDAO;

  /**
   * Constructs a UserDAO with the required EmployeeDAO dependency.
   * @param employeeDAO the employee DAO for resolving user-employee relationships
   */
  public UserDAO(EmployeeDAO employeeDAO) {
    this.employeeDAO = employeeDAO;
  }

  /**
   * Finds a user by username with associated employee details.
   * @param username the username to search for
   * @return the User with employee data or null if not found
   * @throws SQLException if a database error occurs
   */
  public User findByUsername(String username) throws SQLException {
    String sql = "SELECT id, employee_id, username, role, last_login, created_at FROM users WHERE username = ?";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setString(1, username);
      ResultSet rs = pstmt.executeQuery();
      if (rs.next()) {
        User user = mapUser(rs);
        if (user.getEmployeeId() != null) {
          Employee employee = employeeDAO.findById(user.getEmployeeId());
          user.setEmployee(employee);
        }
        logger.debug("User found: {}", username);
        return user;
      }
      logger.debug("User not found: {}", username);
      return null;
    } catch (SQLException e) {
      logger.error("Failed to find user by username {}: {}", username, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Updates the last login timestamp for a user.
   * @param userId the user ID
   * @throws SQLException if a database error occurs
   */
  public void updateLastLogin(Long userId) throws SQLException {
    String sql = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setLong(1, userId);
      int rowsAffected = pstmt.executeUpdate();
      if (rowsAffected > 0) {
        logger.debug("Updated last login for user ID: {}", userId);
      } else {
        logger.warn("User ID {} not found for last login update", userId);
      }
    } catch (SQLException e) {
      logger.error("Failed to update last login for user ID {}: {}", userId, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Creates a new user account.
   * @param employeeId the associated employee ID
   * @param username the username
   * @param passwordHash the BCrypt password hash
   * @param role the user role (admin, employee, hr)
   * @return the generated user ID
   * @throws SQLException if a database error occurs
   */
  public Long create(Long employeeId, String username, String passwordHash, String role) throws SQLException {
    String sql = "INSERT INTO users (employee_id, username, password_hash, role) " + "VALUES (?, ?, ?, ?) RETURNING id";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setLong(1, employeeId);
      pstmt.setString(2, username);
      pstmt.setString(3, passwordHash);
      pstmt.setString(4, role);
      ResultSet rs = pstmt.executeQuery();
      if (rs.next()) {
        Long id = rs.getLong("id");
        logger.info("User created successfully with ID: {} for employee ID: {}", id, employeeId);
        return id;
      }
      throw new SQLException("User creation failed, no ID obtained");
    } catch (SQLException e) {
      logger.error("Failed to create user for employee ID {}: {}", employeeId, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Checks if a username already exists in the database.
   * @param username the username to check
   * @return true if username exists
   * @throws SQLException if a database error occurs
   */
  public boolean existsByUsername(String username) throws SQLException {
    String sql = "SELECT COUNT(*) FROM users WHERE username = ?";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setString(1, username);
      ResultSet rs = pstmt.executeQuery();
      if (rs.next()) {
        return rs.getInt(1) > 0;
      }
      return false;
    } catch (SQLException e) {
      logger.error("Failed to check username existence: {}", e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Maps a ResultSet row to User.
   * @param rs the result set positioned at the row
   * @return the mapped User
   * @throws SQLException if a database error occurs
   */
  private User mapUser(ResultSet rs) throws SQLException {
    User user = new User();
    user.setId(rs.getLong("id"));
    user.setEmployeeId(rs.getLong("employee_id"));
    user.setUsername(rs.getString("username"));
    user.setRole(rs.getString("role"));
    Timestamp lastLogin = rs.getTimestamp("last_login");
    if (lastLogin != null) {
      user.setLastLogin(new java.util.Date(lastLogin.getTime()));
    }
    Timestamp createdAt = rs.getTimestamp("created_at");
    if (createdAt != null) {
      user.setCreatedAt(new java.util.Date(createdAt.getTime()));
    }
    return user;
  }

  /**
   * Retrieves the password hash for a username.
   * @param username the username to look up
   * @return the BCrypt password hash or null if user not found
   * @throws SQLException if a database error occurs
   */
  public String getPasswordHashByUsername(String username) throws SQLException {
    String sql = "SELECT password_hash FROM users WHERE username = ?";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setString(1, username);
      ResultSet rs = pstmt.executeQuery();
      if (rs.next()) {
        return rs.getString("password_hash");
      }
      return null;
    } catch (SQLException e) {
      logger.error("Failed to retrieve password hash for username {}: {}", username, e.getMessage(), e);
      throw e;
    }
  }
}
