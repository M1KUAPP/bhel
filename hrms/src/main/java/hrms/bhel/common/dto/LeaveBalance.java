package hrms.bhel.common.dto;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Data Transfer Object representing an employee's leave balance for a specific leave type and year.
 * Tracks total allocated days, used days, and remaining days available.
 */
public class LeaveBalance implements Serializable {

  private static final long serialVersionUID = 1L;

  /** Unique identifier for the leave balance record. */
  private Long id;

  /** ID of the employee this balance belongs to. */
  private Long employeeId;

  /** ID of the leave type. */
  private Long leaveTypeId;

  /** Name of the leave type. */
  private String leaveTypeName;

  /** The calendar year this balance applies to. */
  private int year;

  /** Total number of leave days allocated for the year. */
  private BigDecimal totalDays;

  /** Number of leave days already used. */
  private BigDecimal usedDays;

  /** Number of leave days remaining (totalDays - usedDays). */
  private BigDecimal remainingDays;

  /**
   * Returns the balance record ID.
   * @return the unique identifier
   */
  public Long getId() {
    return id;
  }

  /**
   * Sets the balance record ID.
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
   * Returns the year.
   * @return the year
   */
  public int getYear() {
    return year;
  }

  /**
   * Sets the year.
   * @param year the year to set
   */
  public void setYear(int year) {
    this.year = year;
  }

  /**
   * Returns the total allocated days.
   * @return the total days
   */
  public BigDecimal getTotalDays() {
    return totalDays;
  }

  /**
   * Sets the total allocated days.
   * @param totalDays the total days to set
   */
  public void setTotalDays(BigDecimal totalDays) {
    this.totalDays = totalDays;
  }

  /**
   * Returns the used days.
   * @return the used days
   */
  public BigDecimal getUsedDays() {
    return usedDays;
  }

  /**
   * Sets the used days.
   * @param usedDays the used days to set
   */
  public void setUsedDays(BigDecimal usedDays) {
    this.usedDays = usedDays;
  }

  /**
   * Returns the remaining days.
   * @return the remaining days
   */
  public BigDecimal getRemainingDays() {
    return remainingDays;
  }

  /**
   * Sets the remaining days.
   * @param remainingDays the remaining days to set
   */
  public void setRemainingDays(BigDecimal remainingDays) {
    this.remainingDays = remainingDays;
  }
}
