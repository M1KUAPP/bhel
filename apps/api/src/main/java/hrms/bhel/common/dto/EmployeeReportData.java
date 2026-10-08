package hrms.bhel.common.dto;

import java.io.Serializable;
import java.util.List;

/**
 * Data Transfer Object that aggregates employee information for report generation.
 * Combines employee details with family members, leave balances, and leave applications.
 */
public class EmployeeReportData implements Serializable {

  private static final long serialVersionUID = 1L;

  /** The employee's basic information. */
  private Employee employee;

  /** List of family members associated with the employee. */
  private List<FamilyMember> familyMembers;

  /** List of leave balances for different leave types. */
  private List<LeaveBalance> leaveBalances;

  /** List of leave applications submitted by the employee. */
  private List<LeaveApplication> leaveApplications;

  /** The year for which the report is generated. */
  private int reportYear;

  /**
   * Returns the employee information.
   * @return the employee
   */
  public Employee getEmployee() {
    return employee;
  }

  /**
   * Sets the employee information.
   * @param employee the employee to set
   */
  public void setEmployee(Employee employee) {
    this.employee = employee;
  }

  /**
   * Returns the list of family members.
   * @return list of family members
   */
  public List<FamilyMember> getFamilyMembers() {
    return familyMembers;
  }

  /**
   * Sets the list of family members.
   * @param familyMembers the family members to set
   */
  public void setFamilyMembers(List<FamilyMember> familyMembers) {
    this.familyMembers = familyMembers;
  }

  /**
   * Returns the list of leave balances.
   * @return list of leave balances
   */
  public List<LeaveBalance> getLeaveBalances() {
    return leaveBalances;
  }

  /**
   * Sets the list of leave balances.
   * @param leaveBalances the leave balances to set
   */
  public void setLeaveBalances(List<LeaveBalance> leaveBalances) {
    this.leaveBalances = leaveBalances;
  }

  /**
   * Returns the list of leave applications.
   * @return list of leave applications
   */
  public List<LeaveApplication> getLeaveApplications() {
    return leaveApplications;
  }

  /**
   * Sets the list of leave applications.
   * @param leaveApplications the leave applications to set
   */
  public void setLeaveApplications(List<LeaveApplication> leaveApplications) {
    this.leaveApplications = leaveApplications;
  }

  /**
   * Returns the report year.
   * @return the year
   */
  public int getReportYear() {
    return reportYear;
  }

  /**
   * Sets the report year.
   * @param reportYear the year to set
   */
  public void setReportYear(int reportYear) {
    this.reportYear = reportYear;
  }
}
