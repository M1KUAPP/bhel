package hrms.bhel.common.dto;

import java.io.Serializable;
import java.util.Date;

/**
 * Data Transfer Object for updating an existing employee's profile information.
 * Contains modifiable employee fields for profile updates.
 */
public class ProfileUpdate implements Serializable {

  private static final long serialVersionUID = 1L;
  private String firstName;
  private String lastName;
  private String email;
  private String icPassportNumber;
  private String phone;
  private String department;
  private String position;
  private Date hireDate;
  private String status;

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getDepartment() {
    return department;
  }

  public void setDepartment(String department) {
    this.department = department;
  }

  public String getPosition() {
    return position;
  }

  public void setPosition(String position) {
    this.position = position;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public String getIcPassportNumber() {
    return icPassportNumber;
  }

  public void setIcPassportNumber(String icPassportNumber) {
    this.icPassportNumber = icPassportNumber;
  }

  public Date getHireDate() {
    return hireDate;
  }

  public void setHireDate(Date hireDate) {
    this.hireDate = hireDate;
  }
}
