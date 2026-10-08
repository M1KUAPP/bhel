package hrms.bhel.client.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Date;

/**
 * Data Transfer Object for employee family member information.
 * Includes validation constraints for name, relationship, and contact.
 */
public class FamilyMemberDTO {

  private Long id;
  private Long employeeId;

  @NotBlank(message = "Family member name is required")
  @Size(max = 200, message = "Name must be less than 200 characters")
  private String name;

  @NotBlank(message = "Relationship is required")
  @Pattern(
    regexp = "^(spouse|child|parent|sibling|other)$",
    message = "Invalid relationship. Must be: spouse, child, parent, sibling, or other"
  )
  private String relationship;

  @Past(message = "Date of birth must be in the past")
  private Date dateOfBirth;

  @Pattern(regexp = "^\\+?[0-9\\s\\-()]*$", message = "Invalid contact number format")
  @Size(max = 50, message = "Contact number must be less than 50 characters")
  private String contactNumber;

  public FamilyMemberDTO() {}

  public FamilyMemberDTO(
    Long id,
    Long employeeId,
    String name,
    String relationship,
    Date dateOfBirth,
    String contactNumber
  ) {
    this.id = id;
    this.employeeId = employeeId;
    this.name = name;
    this.relationship = relationship;
    this.dateOfBirth = dateOfBirth;
    this.contactNumber = contactNumber;
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

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getRelationship() {
    return relationship;
  }

  public void setRelationship(String relationship) {
    this.relationship = relationship;
  }

  public Date getDateOfBirth() {
    return dateOfBirth;
  }

  public void setDateOfBirth(Date dateOfBirth) {
    this.dateOfBirth = dateOfBirth;
  }

  public String getContactNumber() {
    return contactNumber;
  }

  public void setContactNumber(String contactNumber) {
    this.contactNumber = contactNumber;
  }

  @Override
  public String toString() {
    return (
      "FamilyMemberDTO{" +
      "id=" +
      id +
      ", employeeId=" +
      employeeId +
      ", name='" +
      name +
      '\'' +
      ", relationship='" +
      relationship +
      '\'' +
      ", dateOfBirth=" +
      dateOfBirth +
      ", contactNumber='" +
      contactNumber +
      '\'' +
      '}'
    );
  }
}
