package hrms.bhel.client.dto;

import jakarta.validation.constraints.*;
import java.util.Date;

/**
 * Data Transfer Object for new employee registration requests.
 * Includes validation constraints for all required fields.
 */
public class EmployeeRegistrationDTO {

  @NotBlank(message = "First name is required")
  @Size(max = 100, message = "First name must be less than 100 characters")
  private String firstName;

  @NotBlank(message = "Last name is required")
  @Size(max = 100, message = "Last name must be less than 100 characters")
  private String lastName;

  @NotBlank(message = "IC/Passport number is required")
  @Pattern(
    regexp = "^[A-Z0-9-]+$",
    message = "Invalid IC/Passport format. Use uppercase letters, numbers, and hyphens only"
  )
  private String icPassportNumber;

  @NotBlank(message = "Email is required")
  @Email(message = "Invalid email format")
  private String email;

  @Pattern(
    regexp = "^\\+?[0-9]{10,15}$",
    message = "Invalid phone number. Must be 10-15 digits, optionally starting with +"
  )
  private String phone;

  @NotBlank(message = "Department is required")
  private String department;

  @NotBlank(message = "Position is required")
  private String position;

  @NotNull(message = "Hire date is required")
  @PastOrPresent(message = "Hire date cannot be in the future")
  private Date hireDate;

  public EmployeeRegistrationDTO() {}

  public EmployeeRegistrationDTO(
    String firstName,
    String lastName,
    String icPassportNumber,
    String email,
    String phone,
    String department,
    String position,
    Date hireDate
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.icPassportNumber = icPassportNumber;
    this.email = email;
    this.phone = phone;
    this.department = department;
    this.position = position;
    this.hireDate = hireDate;
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

  @Override
  public String toString() {
    return (
      "EmployeeRegistrationDTO{" +
      "firstName='" +
      firstName +
      '\'' +
      ", lastName='" +
      lastName +
      '\'' +
      ", icPassportNumber='" +
      icPassportNumber +
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
      ", hireDate=" +
      hireDate +
      '}'
    );
  }
}
