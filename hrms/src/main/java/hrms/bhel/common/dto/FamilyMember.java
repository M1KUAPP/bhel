package hrms.bhel.common.dto;

import java.io.Serializable;
import java.util.Date;

/**
 * Data Transfer Object representing a family member of an employee.
 * Used for storing dependent information including contact details and relationship.
 */
public class FamilyMember implements Serializable {

  private static final long serialVersionUID = 1L;

  /** Unique identifier for the family member record. */
  private Long id;

  /** ID of the employee this family member belongs to. */
  private Long employeeId;

  /** Full name of the family member. */
  private String name;

  /** Relationship to the employee (e.g., Spouse, Child, Parent). */
  private String relationship;

  /** Date of birth of the family member. */
  private Date dateOfBirth;

  /** Contact phone number of the family member. */
  private String contactNumber;

  /**
   * Returns the family member ID.
   * @return the unique identifier
   */
  public Long getId() {
    return id;
  }

  /**
   * Sets the family member ID.
   * @param id the unique identifier to set
   */
  public void setId(Long id) {
    this.id = id;
  }

  /**
   * Returns the associated employee ID.
   * @return the employee ID
   */
  public Long getEmployeeId() {
    return employeeId;
  }

  /**
   * Sets the associated employee ID.
   * @param employeeId the employee ID to set
   */
  public void setEmployeeId(Long employeeId) {
    this.employeeId = employeeId;
  }

  /**
   * Returns the family member's name.
   * @return the name
   */
  public String getName() {
    return name;
  }

  /**
   * Sets the family member's name.
   * @param name the name to set
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * Returns the relationship to the employee.
   * @return the relationship
   */
  public String getRelationship() {
    return relationship;
  }

  /**
   * Sets the relationship to the employee.
   * @param relationship the relationship to set
   */
  public void setRelationship(String relationship) {
    this.relationship = relationship;
  }

  /**
   * Returns the date of birth.
   * @return the date of birth
   */
  public Date getDateOfBirth() {
    return dateOfBirth;
  }

  /**
   * Sets the date of birth.
   * @param dateOfBirth the date of birth to set
   */
  public void setDateOfBirth(Date dateOfBirth) {
    this.dateOfBirth = dateOfBirth;
  }

  /**
   * Returns the contact number.
   * @return the contact number
   */
  public String getContactNumber() {
    return contactNumber;
  }

  /**
   * Sets the contact number.
   * @param contactNumber the contact number to set
   */
  public void setContactNumber(String contactNumber) {
    this.contactNumber = contactNumber;
  }
}
