package hrms.bhel.common.dto;

import java.io.Serializable;
import java.util.Date;

/**
 * Data Transfer Object for registering a new employee in the HRMS system.
 * Contains the required fields for employee onboarding without system-generated fields.
 */
public class EmployeeRegistration implements Serializable {

  private static final long serialVersionUID = 1L;

  /** Employee's first name. */
  private String firstName;

  /** Employee's last name. */
  private String lastName;

  /** IC or passport number for identification. */
  private String icPassportNumber;

  /** Employee's email address. */
  private String email;

  /** Employee's phone number. */
  private String phone;

  /** Department where the employee will work. */
  private String department;

  /** Job position or title of the employee. */
  private String position;

  /** Date when the employee is hired. */
  private Date hireDate;

  /**
   * Returns the first name.
   * @return the first name
   */
  public String getFirstName() {
    return firstName;
  }

  /**
   * Sets the first name.
   * @param firstName the first name to set
   */
  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  /**
   * Returns the last name.
   * @return the last name
   */
  public String getLastName() {
    return lastName;
  }

  /**
   * Sets the last name.
   * @param lastName the last name to set
   */
  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  /**
   * Returns the IC/passport number.
   * @return the IC or passport number
   */
  public String getIcPassportNumber() {
    return icPassportNumber;
  }

  /**
   * Sets the IC/passport number.
   * @param icPassportNumber the IC or passport number to set
   */
  public void setIcPassportNumber(String icPassportNumber) {
    this.icPassportNumber = icPassportNumber;
  }

  /**
   * Returns the email address.
   * @return the email address
   */
  public String getEmail() {
    return email;
  }

  /**
   * Sets the email address.
   * @param email the email address to set
   */
  public void setEmail(String email) {
    this.email = email;
  }

  /**
   * Returns the phone number.
   * @return the phone number
   */
  public String getPhone() {
    return phone;
  }

  /**
   * Sets the phone number.
   * @param phone the phone number to set
   */
  public void setPhone(String phone) {
    this.phone = phone;
  }

  /**
   * Returns the department name.
   * @return the department
   */
  public String getDepartment() {
    return department;
  }

  /**
   * Sets the department name.
   * @param department the department to set
   */
  public void setDepartment(String department) {
    this.department = department;
  }

  /**
   * Returns the job position.
   * @return the position
   */
  public String getPosition() {
    return position;
  }

  /**
   * Sets the job position.
   * @param position the position to set
   */
  public void setPosition(String position) {
    this.position = position;
  }

  /**
   * Returns the hire date.
   * @return the hire date
   */
  public Date getHireDate() {
    return hireDate;
  }

  /**
   * Sets the hire date.
   * @param hireDate the hire date to set
   */
  public void setHireDate(Date hireDate) {
    this.hireDate = hireDate;
  }
}
