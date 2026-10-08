package hrms.bhel.client.dto;

/**
 * Data Transfer Object for leave balance information in REST API responses.
 * Contains total, used, and remaining leave days for a specific leave type.
 */
public class LeaveBalanceDTO {

  private Long id;
  private Long employeeId;
  private String leaveType;
  private String leaveTypeName;
  private int year;
  private int totalDays;
  private int usedDays;
  private int remainingDays;

  public LeaveBalanceDTO() {}

  public LeaveBalanceDTO(
    Long id,
    Long employeeId,
    String leaveType,
    String leaveTypeName,
    int year,
    int totalDays,
    int usedDays,
    int remainingDays
  ) {
    this.id = id;
    this.employeeId = employeeId;
    this.leaveType = leaveType;
    this.leaveTypeName = leaveTypeName;
    this.year = year;
    this.totalDays = totalDays;
    this.usedDays = usedDays;
    this.remainingDays = remainingDays;
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

  public String getLeaveType() {
    return leaveType;
  }

  public void setLeaveType(String leaveType) {
    this.leaveType = leaveType;
  }

  public String getLeaveTypeName() {
    return leaveTypeName;
  }

  public void setLeaveTypeName(String leaveTypeName) {
    this.leaveTypeName = leaveTypeName;
  }

  public int getYear() {
    return year;
  }

  public void setYear(int year) {
    this.year = year;
  }

  public int getTotalDays() {
    return totalDays;
  }

  public void setTotalDays(int totalDays) {
    this.totalDays = totalDays;
  }

  public int getUsedDays() {
    return usedDays;
  }

  public void setUsedDays(int usedDays) {
    this.usedDays = usedDays;
  }

  public int getRemainingDays() {
    return remainingDays;
  }

  public void setRemainingDays(int remainingDays) {
    this.remainingDays = remainingDays;
  }

  @Override
  public String toString() {
    return (
      "LeaveBalanceDTO{" +
      "id=" +
      id +
      ", employeeId=" +
      employeeId +
      ", leaveType='" +
      leaveType +
      '\'' +
      ", leaveTypeName='" +
      leaveTypeName +
      '\'' +
      ", year=" +
      year +
      ", totalDays=" +
      totalDays +
      ", usedDays=" +
      usedDays +
      ", remainingDays=" +
      remainingDays +
      '}'
    );
  }
}
