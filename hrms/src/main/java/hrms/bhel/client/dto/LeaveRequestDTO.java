package hrms.bhel.client.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

/**
 * Data Transfer Object for new leave application requests.
 * Includes validation constraints for dates and reason.
 */
public class LeaveRequestDTO {

  @NotNull(message = "Employee ID is required")
  private Long employeeId;

  @NotBlank(message = "Leave type is required")
  private String leaveType;

  @NotNull(message = "Start date is required")
  @FutureOrPresent(message = "Start date must be today or in the future")
  private LocalDate startDate;

  @NotNull(message = "End date is required")
  @FutureOrPresent(message = "End date must be today or in the future")
  private LocalDate endDate;

  @NotBlank(message = "Reason is required")
  @Size(max = 500, message = "Reason must be less than 500 characters")
  private String reason;

  public LeaveRequestDTO() {}

  public LeaveRequestDTO(Long employeeId, String leaveType, LocalDate startDate, LocalDate endDate, String reason) {
    this.employeeId = employeeId;
    this.leaveType = leaveType;
    this.startDate = startDate;
    this.endDate = endDate;
    this.reason = reason;
  }

  public Long getEmployeeId() {
    return employeeId;
  }

  public void setEmployeeId(Long employeeId) {
    this.employeeId = employeeId;
  }

  public String getLeaveType() {
    return leaveType;
  }

  public void setLeaveType(String leaveType) {
    this.leaveType = leaveType;
  }

  public LocalDate getStartDate() {
    return startDate;
  }

  public void setStartDate(LocalDate startDate) {
    this.startDate = startDate;
  }

  public LocalDate getEndDate() {
    return endDate;
  }

  public void setEndDate(LocalDate endDate) {
    this.endDate = endDate;
  }

  public String getReason() {
    return reason;
  }

  public void setReason(String reason) {
    this.reason = reason;
  }

  @AssertTrue(message = "End date must be on or after start date")
  public boolean isEndDateAfterStartDate() {
    if (startDate == null || endDate == null) {
      return true;
    }
    return !endDate.isBefore(startDate);
  }

  @Override
  public String toString() {
    return (
      "LeaveRequestDTO{" +
      "employeeId=" +
      employeeId +
      ", leaveType='" +
      leaveType +
      '\'' +
      ", startDate=" +
      startDate +
      ", endDate=" +
      endDate +
      ", reason='" +
      reason +
      '\'' +
      '}'
    );
  }
}
