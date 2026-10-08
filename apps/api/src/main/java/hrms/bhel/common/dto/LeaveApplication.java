package hrms.bhel.common.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * Data Transfer Object representing a leave application submitted by an employee.
 * Contains leave details, status, approval information, and hr comments.
 */
public class LeaveApplication implements Serializable {

  private static final long serialVersionUID = 1L;

  /** Unique identifier for the leave application. */
  private Long id;

  /** ID of the employee who submitted the application. */
  private Long employeeId;

  /** Full name of the employee. */
  private String employeeName;

  /** ID of the leave type being requested. */
  private Long leaveTypeId;

  /** Name of the leave type (e.g., Annual, Sick, Emergency). */
  private String leaveTypeName;

  /** Start date of the leave period. */
  private Date startDate;

  /** End date of the leave period. */
  private Date endDate;

  /** Total number of leave days requested. */
  private BigDecimal totalDays;

  /** Reason provided by the employee for the leave. */
  private String reason;

  /** Current status of the application (e.g., PENDING, APPROVED, REJECTED). */
  private String status;

  /** Date when the application was submitted. */
  private Date appliedDate;

  /** ID of the hr who approved/rejected the application. */
  private Long approvedBy;

  /** Name of the approver. */
  private String approverName;

  /** Date when the application was approved or rejected. */
  private Date approvedDate;

  /** Comments from the hr regarding the application. */
  private String hrComments;

  /**
   * Returns the application ID.
   * @return the unique identifier
   */
  public Long getId() {
    return id;
  }

  /**
   * Sets the application ID.
   * @param id the unique identifier to set
   */
  public void setId(Long id) {
    this.id = id;
  }

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
   * Returns the employee name.
   * @return the employee name
   */
  public String getEmployeeName() {
    return employeeName;
  }

  /**
   * Sets the employee name.
   * @param employeeName the employee name to set
   */
  public void setEmployeeName(String employeeName) {
    this.employeeName = employeeName;
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
   * Returns the leave type name.
   * @return the leave type name
   */
  public String getLeaveTypeName() {
    return leaveTypeName;
  }

  /**
   * Sets the leave type name.
   * @param leaveTypeName the leave type name to set
   */
  public void setLeaveTypeName(String leaveTypeName) {
    this.leaveTypeName = leaveTypeName;
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

  /**
   * Returns the application status.
   * @return the status
   */
  public String getStatus() {
    return status;
  }

  /**
   * Sets the application status.
   * @param status the status to set
   */
  public void setStatus(String status) {
    this.status = status;
  }

  /**
   * Returns the application date.
   * @return the applied date
   */
  public Date getAppliedDate() {
    return appliedDate;
  }

  /**
   * Sets the application date.
   * @param appliedDate the applied date to set
   */
  public void setAppliedDate(Date appliedDate) {
    this.appliedDate = appliedDate;
  }

  /**
   * Returns the approver's ID.
   * @return the approver ID
   */
  public Long getApprovedBy() {
    return approvedBy;
  }

  /**
   * Sets the approver's ID.
   * @param approvedBy the approver ID to set
   */
  public void setApprovedBy(Long approvedBy) {
    this.approvedBy = approvedBy;
  }

  /**
   * Returns the approver's name.
   * @return the approver name
   */
  public String getApproverName() {
    return approverName;
  }

  /**
   * Sets the approver's name.
   * @param approverName the approver name to set
   */
  public void setApproverName(String approverName) {
    this.approverName = approverName;
  }

  /**
   * Returns the approval date.
   * @return the approved date
   */
  public Date getApprovedDate() {
    return approvedDate;
  }

  /**
   * Sets the approval date.
   * @param approvedDate the approved date to set
   */
  public void setApprovedDate(Date approvedDate) {
    this.approvedDate = approvedDate;
  }

  /**
   * Returns the hr's comments.
   * @return the hr comments
   */
  public String getHRComments() {
    return hrComments;
  }

  /**
   * Sets the hr's comments.
   * @param hrComments the hr comments to set
   */
  public void setHrComments(String hrComments) {
    this.hrComments = hrComments;
  }
}
