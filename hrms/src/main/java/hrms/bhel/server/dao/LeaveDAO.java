package hrms.bhel.server.dao;

import hrms.bhel.common.dto.LeaveApplication;
import hrms.bhel.common.dto.LeaveBalance;
import hrms.bhel.common.dto.LeaveRequest;
import hrms.bhel.server.config.DatabaseConfig;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Data Access Object for leave management database operations.
 * Provides CRUD operations for leave balances and leave applications,
 * including transactional operations for approving and cancelling leave.
 */
public class LeaveDAO {

  private static final Logger logger = LoggerFactory.getLogger(LeaveDAO.class);

  /**
   * Finds all leave balances for an employee in a specific year.
   * @param employeeId the employee ID
   * @param year the year to query
   * @return list of leave balances with leave type names
   * @throws SQLException if a database error occurs
   */
  public List<LeaveBalance> findBalanceByEmployeeAndYear(Long employeeId, int year) throws SQLException {
    String sql =
      "SELECT lb.*, lt.name AS leave_type_name " +
      "FROM leave_balance lb " +
      "JOIN leave_types lt ON lb.leave_type_id = lt.id " +
      "WHERE lb.employee_id = ? AND lb.year = ? " +
      "ORDER BY lt.name";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setLong(1, employeeId);
      pstmt.setInt(2, year);
      ResultSet rs = pstmt.executeQuery();
      List<LeaveBalance> balances = new ArrayList<>();
      while (rs.next()) {
        balances.add(mapLeaveBalance(rs));
      }
      logger.debug("Found {} leave balances for employee {} in year {}", balances.size(), employeeId, year);
      return balances;
    } catch (SQLException e) {
      logger.error("Failed to find leave balance for employee {} year {}: {}", employeeId, year, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Finds a specific leave balance for an employee, leave type, and year.
   * @param employeeId the employee ID
   * @param leaveTypeId the leave type ID
   * @param year the year to query
   * @return the leave balance or null if not found
   * @throws SQLException if a database error occurs
   */
  public LeaveBalance findBalance(Long employeeId, Long leaveTypeId, int year) throws SQLException {
    String sql =
      "SELECT lb.*, lt.name AS leave_type_name " +
      "FROM leave_balance lb " +
      "JOIN leave_types lt ON lb.leave_type_id = lt.id " +
      "WHERE lb.employee_id = ? AND lb.leave_type_id = ? AND lb.year = ?";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setLong(1, employeeId);
      pstmt.setLong(2, leaveTypeId);
      pstmt.setInt(3, year);
      ResultSet rs = pstmt.executeQuery();
      if (rs.next()) {
        LeaveBalance balance = mapLeaveBalance(rs);
        logger.debug("Leave balance found for employee {} leave type {} year {}", employeeId, leaveTypeId, year);
        return balance;
      }
      logger.debug("No leave balance found for employee {} leave type {} year {}", employeeId, leaveTypeId, year);
      return null;
    } catch (SQLException e) {
      logger.error(
        "Failed to find leave balance for employee {} leave type {} year {}: {}",
        employeeId,
        leaveTypeId,
        year,
        e.getMessage(),
        e
      );
      throw e;
    }
  }

  /**
   * Creates a new leave application with pending status.
   * @param request the leave request data
   * @return the generated leave application ID
   * @throws SQLException if a database error occurs
   */
  public Long createApplication(LeaveRequest request) throws SQLException {
    String sql =
      "INSERT INTO leave_applications (employee_id, leave_type_id, start_date, " +
      "end_date, total_days, reason, status) " +
      "VALUES (?, ?, ?, ?, ?, ?, 'pending') RETURNING id";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setLong(1, request.getEmployeeId());
      pstmt.setLong(2, request.getLeaveTypeId());
      pstmt.setDate(3, new java.sql.Date(request.getStartDate().getTime()));
      pstmt.setDate(4, new java.sql.Date(request.getEndDate().getTime()));
      pstmt.setBigDecimal(5, request.getTotalDays());
      pstmt.setString(6, request.getReason());
      ResultSet rs = pstmt.executeQuery();
      if (rs.next()) {
        Long id = rs.getLong("id");
        logger.info("Leave application created successfully with ID: {}", id);
        return id;
      }
      throw new SQLException("Leave application creation failed, no ID obtained");
    } catch (SQLException e) {
      logger.error("Failed to create leave application: {}", e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Finds a leave application by ID with employee and approver details.
   * @param id the leave application ID
   * @return the leave application or null if not found
   * @throws SQLException if a database error occurs
   */
  public LeaveApplication findApplicationById(Long id) throws SQLException {
    String sql =
      "SELECT la.*, " +
      "lt.name AS leave_type_name, " +
      "e.first_name || ' ' || e.last_name AS employee_name, " +
      "approver.first_name || ' ' || approver.last_name AS approver_name " +
      "FROM leave_applications la " +
      "JOIN leave_types lt ON la.leave_type_id = lt.id " +
      "JOIN employees e ON la.employee_id = e.id " +
      "LEFT JOIN employees approver ON la.approved_by = approver.id " +
      "WHERE la.id = ?";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setLong(1, id);
      ResultSet rs = pstmt.executeQuery();
      if (rs.next()) {
        LeaveApplication application = mapLeaveApplication(rs);
        logger.debug("Leave application found with ID: {}", id);
        return application;
      }
      logger.debug("No leave application found with ID: {}", id);
      return null;
    } catch (SQLException e) {
      logger.error("Failed to find leave application by ID {}: {}", id, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Finds all leave applications for an employee in a specific year.
   * @param employeeId the employee ID
   * @param year the year to query
   * @return list of leave applications ordered by applied date descending
   * @throws SQLException if a database error occurs
   */
  public List<LeaveApplication> findApplicationsByEmployeeAndYear(Long employeeId, int year) throws SQLException {
    String sql =
      "SELECT la.*, " +
      "lt.name AS leave_type_name, " +
      "e.first_name || ' ' || e.last_name AS employee_name, " +
      "approver.first_name || ' ' || approver.last_name AS approver_name " +
      "FROM leave_applications la " +
      "JOIN leave_types lt ON la.leave_type_id = lt.id " +
      "JOIN employees e ON la.employee_id = e.id " +
      "LEFT JOIN employees approver ON la.approved_by = approver.id " +
      "WHERE la.employee_id = ? AND EXTRACT(YEAR FROM la.start_date) = ? " +
      "ORDER BY la.applied_date DESC";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setLong(1, employeeId);
      pstmt.setInt(2, year);
      ResultSet rs = pstmt.executeQuery();
      List<LeaveApplication> applications = new ArrayList<>();
      while (rs.next()) {
        applications.add(mapLeaveApplication(rs));
      }
      logger.debug("Found {} leave applications for employee {} in year {}", applications.size(), employeeId, year);
      return applications;
    } catch (SQLException e) {
      logger.error(
        "Failed to find leave applications for employee {} year {}: {}",
        employeeId,
        year,
        e.getMessage(),
        e
      );
      throw e;
    }
  }

  /**
   * Finds all pending leave applications awaiting approval.
   * @return list of pending applications ordered by applied date ascending
   * @throws SQLException if a database error occurs
   */
  public List<LeaveApplication> findPendingApplications() throws SQLException {
    String sql =
      "SELECT la.*, " +
      "lt.name AS leave_type_name, " +
      "e.first_name || ' ' || e.last_name AS employee_name, " +
      "approver.first_name || ' ' || approver.last_name AS approver_name " +
      "FROM leave_applications la " +
      "JOIN leave_types lt ON la.leave_type_id = lt.id " +
      "JOIN employees e ON la.employee_id = e.id " +
      "LEFT JOIN employees approver ON la.approved_by = approver.id " +
      "WHERE la.status = 'pending' " +
      "ORDER BY la.applied_date ASC";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql);
      ResultSet rs = pstmt.executeQuery()
    ) {
      List<LeaveApplication> applications = new ArrayList<>();
      while (rs.next()) {
        applications.add(mapLeaveApplication(rs));
      }
      logger.debug("Found {} pending leave applications", applications.size());
      return applications;
    } catch (SQLException e) {
      logger.error("Failed to find pending leave applications: {}", e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Updates the status of a leave application.
   * @param applicationId the leave application ID
   * @param status the new status (approved, rejected, cancelled)
   * @param approvedBy the approver's employee ID (nullable)
   * @param comments hr comments (nullable)
   * @return true if update was successful
   * @throws SQLException if a database error occurs
   */
  public boolean updateApplicationStatus(Long applicationId, String status, Long approvedBy, String comments)
    throws SQLException {
    String sql =
      "UPDATE leave_applications SET status = ?, approved_by = ?, " +
      "approved_date = CURRENT_TIMESTAMP, hr_comments = ? " +
      "WHERE id = ?";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setString(1, status);
      if (approvedBy != null) {
        pstmt.setLong(2, approvedBy);
      } else {
        pstmt.setNull(2, Types.BIGINT);
      }
      pstmt.setString(3, comments);
      pstmt.setLong(4, applicationId);
      int rowsAffected = pstmt.executeUpdate();
      if (rowsAffected > 0) {
        logger.info("Leave application {} status updated to: {}", applicationId, status);
        return true;
      }
      logger.warn("No leave application found with ID: {}", applicationId);
      return false;
    } catch (SQLException e) {
      logger.error("Failed to update leave application status for ID {}: {}", applicationId, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Updates the used days in a leave balance record.
   * @param employeeId the employee ID
   * @param leaveTypeId the leave type ID
   * @param year the year
   * @param additionalUsedDays days to add to used_days
   * @return true if update was successful
   * @throws SQLException if a database error occurs
   */
  public boolean updateLeaveBalance(Long employeeId, Long leaveTypeId, int year, BigDecimal additionalUsedDays)
    throws SQLException {
    String sql =
      "UPDATE leave_balance SET used_days = used_days + ? " +
      "WHERE employee_id = ? AND leave_type_id = ? AND year = ?";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setBigDecimal(1, additionalUsedDays);
      pstmt.setLong(2, employeeId);
      pstmt.setLong(3, leaveTypeId);
      pstmt.setInt(4, year);
      int rowsAffected = pstmt.executeUpdate();
      if (rowsAffected > 0) {
        logger.info(
          "Leave balance updated for employee {} leave type {} year {} - added {} days",
          employeeId,
          leaveTypeId,
          year,
          additionalUsedDays
        );
        return true;
      }
      logger.warn("No leave balance found for employee {} leave type {} year {}", employeeId, leaveTypeId, year);
      return false;
    } catch (SQLException e) {
      logger.error(
        "Failed to update leave balance for employee {} leave type {} year {}: {}",
        employeeId,
        leaveTypeId,
        year,
        e.getMessage(),
        e
      );
      throw e;
    }
  }

  /**
   * Checks if an employee has overlapping leave for the given date range.
   * @param employeeId the employee ID
   * @param startDate the start date
   * @param endDate the end date
   * @return true if overlapping approved or pending leave exists
   * @throws SQLException if a database error occurs
   */
  public boolean hasOverlappingLeave(Long employeeId, java.util.Date startDate, java.util.Date endDate)
    throws SQLException {
    String sql =
      "SELECT COUNT(*) FROM leave_applications " +
      "WHERE employee_id = ? AND status IN ('approved', 'pending') " +
      "AND (start_date, end_date) OVERLAPS (?, ?)";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setLong(1, employeeId);
      pstmt.setDate(2, new java.sql.Date(startDate.getTime()));
      pstmt.setDate(3, new java.sql.Date(endDate.getTime()));
      ResultSet rs = pstmt.executeQuery();
      if (rs.next()) {
        int count = rs.getInt(1);
        boolean hasOverlap = count > 0;
        logger.debug(
          "Overlapping leave check for employee {}: {} (checked approved and pending)",
          employeeId,
          hasOverlap
        );
        return hasOverlap;
      }
      return false;
    } catch (SQLException e) {
      logger.error("Failed to check overlapping leave for employee {}: {}", employeeId, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Approves a leave application within a database transaction.
   * Updates application status and deducts days from leave balance atomically.
   * @param applicationId the leave application ID
   * @param approverId the approver's employee ID
   * @param comments hr comments
   * @param employeeId the employee ID
   * @param leaveTypeId the leave type ID
   * @param year the year for balance deduction
   * @param daysToDeduct number of days to deduct from balance
   * @return true if transaction was successful
   * @throws SQLException if a database error occurs
   */
  public boolean approveLeaveTransaction(
    Long applicationId,
    Long approverId,
    String comments,
    Long employeeId,
    Long leaveTypeId,
    int year,
    BigDecimal daysToDeduct
  ) throws SQLException {
    return DaoUtils.executeInTransaction(
      conn -> {
        String sqlStatus =
          "UPDATE leave_applications SET status = 'approved', approved_by = ?, " +
          "approved_date = CURRENT_TIMESTAMP, hr_comments = ? WHERE id = ?";
        try (PreparedStatement stmtStatus = conn.prepareStatement(sqlStatus)) {
          stmtStatus.setLong(1, approverId);
          stmtStatus.setString(2, comments);
          stmtStatus.setLong(3, applicationId);
          int rowsStatus = stmtStatus.executeUpdate();
          if (rowsStatus == 0) {
            conn.rollback();
            return false;
          }
        }
        String sqlBalance =
          "UPDATE leave_balance SET used_days = used_days + ? " +
          "WHERE employee_id = ? AND leave_type_id = ? AND year = ?";
        try (PreparedStatement stmtBalance = conn.prepareStatement(sqlBalance)) {
          stmtBalance.setBigDecimal(1, daysToDeduct);
          stmtBalance.setLong(2, employeeId);
          stmtBalance.setLong(3, leaveTypeId);
          stmtBalance.setInt(4, year);
          int rowsBalance = stmtBalance.executeUpdate();
          if (rowsBalance == 0) {
            conn.rollback();
            throw new SQLException("Failed to update leave balance. Transaction rolled back.");
          }
        }
        return true;
      },
      logger,
      "Failed to approve leave transaction"
    );
  }

  /**
   * Cancels an approved leave application within a database transaction.
   * Updates application status to cancelled and restores days to leave balance atomically.
   * @param applicationId the leave application ID
   * @param employeeId the employee ID
   * @param leaveTypeId the leave type ID
   * @param year the year for balance restoration
   * @param daysToRestore number of days to restore to balance
   * @return true if transaction was successful
   * @throws SQLException if a database error occurs
   */
  public boolean cancelApprovedLeaveTransaction(
    Long applicationId,
    Long employeeId,
    Long leaveTypeId,
    int year,
    BigDecimal daysToRestore
  ) throws SQLException {
    return DaoUtils.executeInTransaction(
      conn -> {
        String sqlStatus =
          "UPDATE leave_applications SET status = 'cancelled', " +
          "approved_by = NULL, approved_date = NULL " +
          "WHERE id = ?";
        try (PreparedStatement stmtStatus = conn.prepareStatement(sqlStatus)) {
          stmtStatus.setLong(1, applicationId);
          int rowsStatus = stmtStatus.executeUpdate();
          if (rowsStatus == 0) {
            conn.rollback();
            return false;
          }
        }
        String sqlBalance =
          "UPDATE leave_balance SET used_days = used_days - ? " +
          "WHERE employee_id = ? AND leave_type_id = ? AND year = ?";
        try (PreparedStatement stmtBalance = conn.prepareStatement(sqlBalance)) {
          stmtBalance.setBigDecimal(1, daysToRestore);
          stmtBalance.setLong(2, employeeId);
          stmtBalance.setLong(3, leaveTypeId);
          stmtBalance.setInt(4, year);
          int rowsBalance = stmtBalance.executeUpdate();
          if (rowsBalance == 0) {
            conn.rollback();
            throw new SQLException("Failed to restore leave balance. Transaction rolled back.");
          }
        }
        return true;
      },
      logger,
      "Failed to cancel approved leave transaction"
    );
  }

  /**
   * Creates initial leave balance records for a new employee.
   * Creates one balance record per leave type for the current year.
   * @param employeeId the employee ID
   * @return number of balance records created
   * @throws SQLException if a database error occurs
   */
  public int createBalancesForNewEmployee(Long employeeId) throws SQLException {
    String sql =
      "INSERT INTO leave_balance (employee_id, leave_type_id, year, total_days, used_days) " +
      "SELECT ?, lt.id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, lt.days_per_year, 0 " +
      "FROM leave_types lt";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setLong(1, employeeId);
      int rowsInserted = pstmt.executeUpdate();
      logger.info("Created {} leave balance records for employee ID: {}", rowsInserted, employeeId);
      return rowsInserted;
    } catch (SQLException e) {
      logger.error("Failed to create leave balances for employee ID {}: {}", employeeId, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Maps a ResultSet row to LeaveBalance.
   * @param rs the result set positioned at the row
   * @return the mapped LeaveBalance
   * @throws SQLException if a database error occurs
   */
  private LeaveBalance mapLeaveBalance(ResultSet rs) throws SQLException {
    LeaveBalance balance = new LeaveBalance();
    balance.setId(rs.getLong("id"));
    balance.setEmployeeId(rs.getLong("employee_id"));
    balance.setLeaveTypeId(rs.getLong("leave_type_id"));
    balance.setLeaveTypeName(rs.getString("leave_type_name"));
    balance.setYear(rs.getInt("year"));
    balance.setTotalDays(rs.getBigDecimal("total_days"));
    balance.setUsedDays(rs.getBigDecimal("used_days"));
    balance.setRemainingDays(rs.getBigDecimal("remaining_days"));
    return balance;
  }

  /**
   * Maps a ResultSet row to LeaveApplication.
   * @param rs the result set positioned at the row
   * @return the mapped LeaveApplication
   * @throws SQLException if a database error occurs
   */
  private LeaveApplication mapLeaveApplication(ResultSet rs) throws SQLException {
    LeaveApplication application = new LeaveApplication();
    application.setId(rs.getLong("id"));
    application.setEmployeeId(rs.getLong("employee_id"));
    application.setEmployeeName(rs.getString("employee_name"));
    application.setLeaveTypeId(rs.getLong("leave_type_id"));
    application.setLeaveTypeName(rs.getString("leave_type_name"));
    application.setStartDate(rs.getDate("start_date"));
    application.setEndDate(rs.getDate("end_date"));
    application.setTotalDays(rs.getBigDecimal("total_days"));
    application.setReason(rs.getString("reason"));
    application.setStatus(rs.getString("status"));
    application.setAppliedDate(rs.getTimestamp("applied_date"));
    long approvedById = rs.getLong("approved_by");
    if (!rs.wasNull()) {
      application.setApprovedBy(approvedById);
      application.setApproverName(rs.getString("approver_name"));
    }
    Timestamp approvedDate = rs.getTimestamp("approved_date");
    if (approvedDate != null) {
      application.setApprovedDate(approvedDate);
    }
    application.setHrComments(rs.getString("hr_comments"));
    return application;
  }
}
