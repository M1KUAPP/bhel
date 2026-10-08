package hrms.bhel.common.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * Data Transfer Object for submitting a new leave request.
 * Contains the minimum required fields to apply for leave.
 */
public class LeaveRequest implements Serializable {

  private static final long serialVersionUID = 1L;

  /** ID of the employee requesting leave. */
  private Long employeeId;

  /** ID of the leave type being requested. */
  private Long leaveTypeId;

  /** Start date of the leave period. */
  private Date startDate;

  /** End date of the leave period. */
  private Date endDate;

  /** Total number of leave days requested. */
  private BigDecimal totalDays;

  /** Reason for the leave request. */
  private String reason;

  /**
   * Returns the employee ID.
   * @return the employee ID
   */
  public Long getEmployeeId() {
    return employeeId;
  }

  /**
   * Sets the employee ID.
   * @param employeeId the employee ID to set
   */
  public void setEmployeeId(Long employeeId) {
    this.employeeId = employeeId;
  }

  /**
   * Returns the leave type ID.
   * @return the leave type ID
   */
  public Long getLeaveTypeId() {
    return leaveTypeId;
  }

  /**
   * Sets the leave type ID.
   * @param leaveTypeId the leave type ID to set
   */
  public void setLeaveTypeId(Long leaveTypeId) {
    this.leaveTypeId = leaveTypeId;
  }

  /**
   * Returns the leave start date.
   * @return the start date
   */
  public Date getStartDate() {
    return startDate;
  }

  /**
   * Sets the leave start date.
   * @param startDate the start date to set
   */
  public void setStartDate(Date startDate) {
    this.startDate = startDate;
  }

  /**
   * Returns the leave end date.
   * @return the end date
   */
  public Date getEndDate() {
    return endDate;
  }

  /**
   * Sets the leave end date.
   * @param endDate the end date to set
   */
  public void setEndDate(Date endDate) {
    this.endDate = endDate;
  }

  /**
   * Returns the total leave days.
   * @return the total days
   */
  public BigDecimal getTotalDays() {
    return totalDays;
  }

  /**
   * Sets the total leave days.
   * @param totalDays the total days to set
   */
  public void setTotalDays(BigDecimal totalDays) {
    this.totalDays = totalDays;
  }

  /**
   * Returns the leave reason.
   * @return the reason
   */
  public String getReason() {
    return reason;
  }

  /**
   * Sets the leave reason.
   * @param reason the reason to set
   */
  public void setReason(String reason) {
    this.reason = reason;
  }
}
