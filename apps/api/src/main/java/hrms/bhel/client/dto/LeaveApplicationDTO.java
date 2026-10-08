package hrms.bhel.client.dto;

import java.util.Date;

/**
 * Data Transfer Object for leave application information in REST API responses.
 * Contains application details, dates, status, and approver information.
 */
public class LeaveApplicationDTO {

  private Long id;
  private Long employeeId;
  private String leaveTypeName;
  private Date startDate;
  private Date endDate;
  private int totalDays;
  private String reason;
  private String status;
  private Date appliedDate;
  private Long approvedBy;
  private String approvedByName;
  private String approverComments;
  private Date approvedRejectedDate;

  public LeaveApplicationDTO() {}

  public LeaveApplicationDTO(
    Long id,
    Long employeeId,
    String leaveTypeName,
    Date startDate,
    Date endDate,
    int totalDays,
    String reason,
    String status,
    Date appliedDate,
    String approverComments,
    Date approvedRejectedDate
  ) {
    this.id = id;
    this.employeeId = employeeId;
    this.leaveTypeName = leaveTypeName;
    this.startDate = startDate;
    this.endDate = endDate;
    this.totalDays = totalDays;
    this.reason = reason;
    this.status = status;
    this.appliedDate = appliedDate;
    this.approverComments = approverComments;
    this.approvedRejectedDate = approvedRejectedDate;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Long getEmployeeId() {
    return employeeId;
  }

  public void setEmployeeId(Long employeeId) {
    this.employeeId = employeeId;
  }

  public String getLeaveTypeName() {
    return leaveTypeName;
  }

  public void setLeaveTypeName(String leaveTypeName) {
    this.leaveTypeName = leaveTypeName;
  }

  public Date getStartDate() {
    return startDate;
  }

  public void setStartDate(Date startDate) {
    this.startDate = startDate;
  }

  public Date getEndDate() {
    return endDate;
  }

  public void setEndDate(Date endDate) {
    this.endDate = endDate;
  }

  public int getTotalDays() {
    return totalDays;
  }

  public void setTotalDays(int totalDays) {
    this.totalDays = totalDays;
  }

  public String getReason() {
    return reason;
  }

  public void setReason(String reason) {
    this.reason = reason;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public Date getAppliedDate() {
    return appliedDate;
  }

  public void setAppliedDate(Date appliedDate) {
    this.appliedDate = appliedDate;
  }

  public Long getApprovedBy() {
    return approvedBy;
  }

  public void setApprovedBy(Long approvedBy) {
    this.approvedBy = approvedBy;
  }

  public String getApprovedByName() {
    return approvedByName;
  }

  public void setApprovedByName(String approvedByName) {
    this.approvedByName = approvedByName;
  }

  public String getApproverComments() {
    return approverComments;
  }

  public void setApproverComments(String approverComments) {
    this.approverComments = approverComments;
  }

  public Date getApprovedRejectedDate() {
    return approvedRejectedDate;
  }

  public void setApprovedRejectedDate(Date approvedRejectedDate) {
    this.approvedRejectedDate = approvedRejectedDate;
  }

  @Override
  public String toString() {
    return (
      "LeaveApplicationDTO{" +
      "id=" +
      id +
      ", employeeId=" +
      employeeId +
      ", leaveTypeName='" +
      leaveTypeName +
      '\'' +
      ", startDate=" +
      startDate +
      ", endDate=" +
      endDate +
      ", totalDays=" +
      totalDays +
      ", status='" +
      status +
      '\'' +
      '}'
    );
  }
}
