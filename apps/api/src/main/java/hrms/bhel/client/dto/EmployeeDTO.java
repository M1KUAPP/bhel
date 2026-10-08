package hrms.bhel.client.dto;

import java.util.Date;

/**
 * Data Transfer Object for employee information in REST API responses.
 * Contains personal details, work information, and status.
 */
public class EmployeeDTO {

  private Long id;
  private String firstName;
  private String lastName;
  private String icPassportNumber;
  private String email;
  private String phone;
  private String department;
  private String position;
  private Date hireDate;
  private String status;
  private Date createdAt;
  private Date updatedAt;

  public EmployeeDTO() {}

  public EmployeeDTO(
    Long id,
    String firstName,
    String lastName,
    String icPassportNumber,
    String email,
    String phone,
    String department,
    String position,
    Date hireDate,
    String status,
    Date createdAt,
    Date updatedAt
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.icPassportNumber = icPassportNumber;
    this.email = email;
    this.phone = phone;
    this.department = department;
    this.position = position;
    this.hireDate = hireDate;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

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

  public String getIcPassportNumber() {
    return icPassportNumber;
  }

  public void setIcPassportNumber(String icPassportNumber) {
    this.icPassportNumber = icPassportNumber;
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

  public Date getHireDate() {
    return hireDate;
  }

  public void setHireDate(Date hireDate) {
    this.hireDate = hireDate;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public Date getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Date createdAt) {
    this.createdAt = createdAt;
  }

  public Date getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Date updatedAt) {
    this.updatedAt = updatedAt;
  }

  @Override
  public String toString() {
    return (
      "EmployeeDTO{" +
      "id=" +
      id +
      ", firstName='" +
      firstName +
      '\'' +
      ", lastName='" +
      lastName +
      '\'' +
      ", email='" +
      email +
      '\'' +
      ", department='" +
      department +
      '\'' +
      ", position='" +
      position +
      '\'' +
      ", status='" +
      status +
      '\'' +
      '}'
    );
  }
}
