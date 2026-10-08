package hrms.bhel.client.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Date;

/**
 * Data Transfer Object for employee profile update requests.
 * Includes validation constraints for updatable fields.
 */
public class ProfileUpdateDTO {

  @Size(max = 50, message = "First name must be less than 50 characters")
  private String firstName;

  @Size(max = 50, message = "Last name must be less than 50 characters")
  private String lastName;

  @Email(message = "Invalid email format")
  private String email;

  @Size(max = 20, message = "IC/Passport must be less than 20 characters")
  private String icPassportNumber;

  @Pattern(
    regexp = "^\\+?[0-9]{10,15}$",
    message = "Invalid phone number. Must be 10-15 digits, optionally starting with +"
  )
  private String phone;

  @Size(max = 100, message = "Department must be less than 100 characters")
  private String department;

  @Size(max = 100, message = "Position must be less than 100 characters")
  private String position;

  private Date hireDate;

  @Pattern(
    regexp = "^(active|inactive|terminated|on_leave)$",
    message = "Invalid status. Must be: active, inactive, terminated, or on_leave"
  )
  private String status;

  public ProfileUpdateDTO() {}

  public ProfileUpdateDTO(
    String firstName,
    String lastName,
    String email,
    String icPassportNumber,
    String phone,
    String department,
    String position,
    Date hireDate,
    String status
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.icPassportNumber = icPassportNumber;
    this.phone = phone;
    this.department = department;
    this.position = position;
    this.hireDate = hireDate;
    this.status = status;
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

  @Override
  public String toString() {
    return (
      "ProfileUpdateDTO{" +
      "firstName='" +
      firstName +
      '\'' +
      ", lastName='" +
      lastName +
      '\'' +
      ", email='" +
      email +
      '\'' +
      ", icPassportNumber='" +
      icPassportNumber +
      '\'' +
      ", phone='" +
      phone +
      '\'' +
      ", department='" +
      department +
      '\'' +
      ", position='" +
      position +
      '\'' +
      ", hireDate=" +
      hireDate +
      ", status='" +
      status +
      '\'' +
      '}'
    );
  }
}
