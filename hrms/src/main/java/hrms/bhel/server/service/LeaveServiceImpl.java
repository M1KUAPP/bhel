package hrms.bhel.server.service;

import hrms.bhel.common.dto.*;
import hrms.bhel.common.exception.InsufficientLeaveBalanceException;
import hrms.bhel.common.exception.InvalidLeaveRequestException;
import hrms.bhel.common.service.LeaveService;
import hrms.bhel.server.dao.LeaveDAO;
import java.math.BigDecimal;
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * RMI service implementation for leave management operations.
 * Handles leave applications, approvals, rejections, cancellations, and balance inquiries.
 * Validates leave requests against balance and date constraints.
 */
public class LeaveServiceImpl extends UnicastRemoteObject implements LeaveService {

  private static final Logger logger = LoggerFactory.getLogger(LeaveServiceImpl.class);
  private final LeaveDAO leaveDAO;

  /**
   * Constructs a new LeaveServiceImpl with required DAO.
   * @param leaveDAO the leave data access object
   * @throws RemoteException if RMI export fails
   */
  public LeaveServiceImpl(LeaveDAO leaveDAO) throws RemoteException {
    super(0);
    this.leaveDAO = leaveDAO;
    logger.info("LeaveServiceImpl initialized successfully");
  }

  @Override
  public List<LeaveBalance> getLeaveBalance(Long employeeId, int year) throws RemoteException {
    logger.debug("Retrieving leave balance for employee ID: {} and year: {}", employeeId, year);
    try {
      List<LeaveBalance> balances = leaveDAO.findBalanceByEmployeeAndYear(employeeId, year);
      logger.info(
        "Retrieved {} leave balance records for employee ID: {} in year: {}",
        balances.size(),
        employeeId,
        year
      );
      return balances;
    } catch (SQLException e) {
      String errorMsg =
        "Database error while retrieving leave balance for employee ID " +
        employeeId +
        " and year " +
        year +
        ": " +
        e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public LeaveApplication applyForLeave(LeaveRequest request) throws RemoteException {
    logger.info(
      "Processing leave application for employee ID: {}, leave type: {}, dates: {} to {}",
      request.getEmployeeId(),
      request.getLeaveTypeId(),
      request.getStartDate(),
      request.getEndDate()
    );
    try {
      if (request.getStartDate() == null || request.getEndDate() == null) {
        String errorMsg = "Start date and end date are required";
        logger.error(errorMsg);
        throw new InvalidLeaveRequestException(errorMsg);
      }
      if (request.getStartDate().after(request.getEndDate())) {
        String errorMsg = "Start date cannot be after end date";
        logger.error(errorMsg);
        throw new InvalidLeaveRequestException(errorMsg);
      }
      Calendar startCal = Calendar.getInstance();
      startCal.setTime(request.getStartDate());
      int startYear = startCal.get(Calendar.YEAR);
      Calendar endCal = Calendar.getInstance();
      endCal.setTime(request.getEndDate());
      int endYear = endCal.get(Calendar.YEAR);
      if (startYear != endYear) {
        String errorMsg =
          "Leave application cannot span multiple years. Please submit separate applications for each year.";
        logger.error(errorMsg);
        throw new InvalidLeaveRequestException(errorMsg);
      }
      BigDecimal actualDays = calculateWorkingDays(request.getStartDate(), request.getEndDate());
      request.setTotalDays(actualDays);
      if (request.getTotalDays() == null || request.getTotalDays().compareTo(BigDecimal.ZERO) <= 0) {
        String errorMsg = "Leave duration is 0 working days (weekends/holidays only)";
        logger.error(errorMsg);
        throw new InvalidLeaveRequestException(errorMsg);
      }
      Calendar cal = Calendar.getInstance();
      cal.setTime(request.getStartDate());
      int year = cal.get(Calendar.YEAR);
      LeaveBalance balance = leaveDAO.findBalance(request.getEmployeeId(), request.getLeaveTypeId(), year);
      if (balance == null) {
        String errorMsg =
          "No leave balance found for employee ID " +
          request.getEmployeeId() +
          " for leave type " +
          request.getLeaveTypeId() +
          " in year " +
          year;
        logger.error(errorMsg);
        throw new InvalidLeaveRequestException(errorMsg);
      }
      if (balance.getRemainingDays().compareTo(request.getTotalDays()) < 0) {
        String errorMsg =
          "Insufficient leave balance. Available: " +
          balance.getRemainingDays() +
          " days, Requested: " +
          request.getTotalDays() +
          " days";
        logger.error(errorMsg);
        throw new InsufficientLeaveBalanceException(errorMsg);
      }
      boolean hasOverlap = leaveDAO.hasOverlappingLeave(
        request.getEmployeeId(),
        request.getStartDate(),
        request.getEndDate()
      );
      if (hasOverlap) {
        String errorMsg = "Leave application overlaps with existing approved or pending leave";
        logger.error(errorMsg);
        throw new InvalidLeaveRequestException(errorMsg);
      }
      Long applicationId = leaveDAO.createApplication(request);
      if (applicationId == null) {
        String errorMsg = "Failed to create leave application";
        logger.error(errorMsg);
        throw new RemoteException(errorMsg);
      }
      LeaveApplication application = leaveDAO.findApplicationById(applicationId);
      if (application == null) {
        String errorMsg = "Failed to retrieve newly created leave application with ID: " + applicationId;
        logger.error(errorMsg);
        throw new RemoteException(errorMsg);
      }
      logger.info("Leave application created successfully with ID: {}", applicationId);
      return application;
    } catch (InsufficientLeaveBalanceException | InvalidLeaveRequestException e) {
      throw new RemoteException(e.getMessage(), e);
    } catch (SQLException e) {
      String errorMsg = "Database error while applying for leave: " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public LeaveApplication getLeaveApplicationStatus(Long applicationId) throws RemoteException {
    logger.debug("Retrieving leave application status for ID: {}", applicationId);
    try {
      LeaveApplication application = leaveDAO.findApplicationById(applicationId);
      if (application == null) {
        logger.warn("Leave application not found with ID: {}", applicationId);
      } else {
        logger.debug("Leave application found with ID: {}, status: {}", applicationId, application.getStatus());
      }
      return application;
    } catch (SQLException e) {
      String errorMsg =
        "Database error while retrieving leave application status for ID " + applicationId + ": " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public List<LeaveApplication> getEmployeeLeaveHistory(Long employeeId, int year) throws RemoteException {
    logger.debug("Retrieving leave history for employee ID: {} and year: {}", employeeId, year);
    try {
      List<LeaveApplication> applications = leaveDAO.findApplicationsByEmployeeAndYear(employeeId, year);
      logger.info(
        "Retrieved {} leave applications for employee ID: {} in year: {}",
        applications.size(),
        employeeId,
        year
      );
      return applications;
    } catch (SQLException e) {
      String errorMsg =
        "Database error while retrieving leave history for employee ID " +
        employeeId +
        " and year " +
        year +
        ": " +
        e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public List<LeaveApplication> getPendingApplications() throws RemoteException {
    logger.debug("Retrieving all pending leave applications");
    try {
      List<LeaveApplication> applications = leaveDAO.findPendingApplications();
      logger.info("Retrieved {} pending leave applications", applications.size());
      return applications;
    } catch (SQLException e) {
      String errorMsg = "Database error while retrieving pending leave applications: " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public boolean approveLeave(Long applicationId, Long approverId, String comments) throws RemoteException {
    logger.info("Approving leave application ID: {} by approver ID: {}", applicationId, approverId);
    try {
      LeaveApplication application = leaveDAO.findApplicationById(applicationId);
      if (application == null) {
        String errorMsg = "Leave application not found with ID: " + applicationId;
        logger.error(errorMsg);
        throw new InvalidLeaveRequestException(errorMsg);
      }
      if (!"pending".equalsIgnoreCase(application.getStatus())) {
        String errorMsg =
          "Cannot approve leave application with status: " +
          application.getStatus() +
          ". Only pending applications can be approved.";
        logger.error(errorMsg);
        throw new InvalidLeaveRequestException(errorMsg);
      }
      Calendar cal = Calendar.getInstance();
      cal.setTime(application.getStartDate());
      int year = cal.get(Calendar.YEAR);
      boolean success = leaveDAO.approveLeaveTransaction(
        applicationId,
        approverId,
        comments,
        application.getEmployeeId(),
        application.getLeaveTypeId(),
        year,
        application.getTotalDays()
      );
      if (!success) {
        String errorMsg = "Failed to approve leave application ID: " + applicationId;
        logger.error(errorMsg);
        return false;
      }
      logger.info("Leave application ID: {} approved successfully (Transaction committed)", applicationId);
      return true;
    } catch (InvalidLeaveRequestException e) {
      throw new RemoteException(e.getMessage(), e);
    } catch (SQLException e) {
      String errorMsg = "Database error while approving leave application ID " + applicationId + ": " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public boolean rejectLeave(Long applicationId, Long approverId, String reason) throws RemoteException {
    logger.info("Rejecting leave application ID: {} by approver ID: {}", applicationId, approverId);
    try {
      LeaveApplication application = leaveDAO.findApplicationById(applicationId);
      if (application == null) {
        String errorMsg = "Leave application not found with ID: " + applicationId;
        logger.error(errorMsg);
        throw new InvalidLeaveRequestException(errorMsg);
      }
      if (!"pending".equalsIgnoreCase(application.getStatus())) {
        String errorMsg =
          "Cannot reject leave application with status: " +
          application.getStatus() +
          ". Only pending applications can be rejected.";
        logger.error(errorMsg);
        throw new InvalidLeaveRequestException(errorMsg);
      }
      boolean statusUpdated = leaveDAO.updateApplicationStatus(applicationId, "rejected", approverId, reason);
      if (statusUpdated) {
        logger.info("Leave application ID: {} rejected successfully", applicationId);
      } else {
        logger.warn("Failed to reject leave application ID: {}", applicationId);
      }
      return statusUpdated;
    } catch (InvalidLeaveRequestException e) {
      throw new RemoteException(e.getMessage(), e);
    } catch (SQLException e) {
      String errorMsg = "Database error while rejecting leave application ID " + applicationId + ": " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public boolean cancelLeave(Long applicationId) throws RemoteException {
    logger.info("Cancelling leave application ID: {}", applicationId);
    try {
      LeaveApplication application = leaveDAO.findApplicationById(applicationId);
      if (application == null) {
        String errorMsg = "Leave application not found with ID: " + applicationId;
        logger.error(errorMsg);
        throw new RemoteException(errorMsg);
      }
      String status = application.getStatus();
      if ("cancelled".equalsIgnoreCase(status) || "rejected".equalsIgnoreCase(status)) {
        String errorMsg = "Cannot cancel application that is already " + status;
        logger.error(errorMsg);
        throw new RemoteException(errorMsg);
      }
      boolean wasApproved = "approved".equalsIgnoreCase(status);
      if (wasApproved) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(application.getStartDate());
        int year = cal.get(Calendar.YEAR);
        boolean success = leaveDAO.cancelApprovedLeaveTransaction(
          applicationId,
          application.getEmployeeId(),
          application.getLeaveTypeId(),
          year,
          application.getTotalDays()
        );
        if (success) {
          logger.info("Leave application ID: {} cancelled and balance restored (Transaction committed)", applicationId);
        } else {
          logger.error("Failed to cancel leave application ID: {}", applicationId);
        }
        return success;
      } else {
        boolean success = leaveDAO.updateApplicationStatus(applicationId, "cancelled", null, null);
        if (success) {
          logger.info("Leave application ID: {} cancelled (was pending)", applicationId);
        } else {
          logger.error("Failed to cancel leave application ID: {}", applicationId);
        }
        return success;
      }
    } catch (SQLException e) {
      String errorMsg = "Database error while cancelling leave application ID " + applicationId + ": " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  /**
   * Calculates the number of working days between two dates, excluding weekends.
   * @param startDate the start date
   * @param endDate the end date
   * @return the number of working days
   */
  private BigDecimal calculateWorkingDays(java.util.Date startDate, java.util.Date endDate) {
    if (startDate == null || endDate == null) return BigDecimal.ZERO;
    Calendar startCal = Calendar.getInstance();
    startCal.setTime(startDate);
    Calendar endCal = Calendar.getInstance();
    endCal.setTime(endDate);
    int workingDays = 0;
    while (!startCal.after(endCal)) {
      int dayOfWeek = startCal.get(Calendar.DAY_OF_WEEK);
      if (dayOfWeek != Calendar.SATURDAY && dayOfWeek != Calendar.SUNDAY) {
        workingDays++;
      }
      startCal.add(Calendar.DAY_OF_MONTH, 1);
    }
    return new BigDecimal(workingDays);
  }
}
