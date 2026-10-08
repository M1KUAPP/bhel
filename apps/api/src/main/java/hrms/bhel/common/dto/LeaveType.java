package hrms.bhel.common.dto;

import java.io.Serializable;
import java.util.Date;

/**
 * Data Transfer Object representing a type of leave available in the system.
 * Defines leave policies including annual allocation and carry-forward rules.
 */
public class LeaveType implements Serializable {

  private static final long serialVersionUID = 1L;

  /** Unique identifier for the leave type. */
  private Long id;

  /** Name of the leave type (e.g., Annual, Sick, Emergency). */
  private String name;

  /** Number of days allocated per year for this leave type. */
  private int daysPerYear;

  /** Whether unused leave can be carried forward to the next year. */
  private boolean carryForwardAllowed;

  /** Description of the leave type and its usage policy. */
  private String description;

  /** Timestamp when the leave type was created. */
  private Date createdAt;

  /**
   * Returns the leave type ID.
   * @return the unique identifier
   */
  public Long getId() {
    return id;
  }

  /**
   * Sets the leave type ID.
   * @param id the unique identifier to set
   */
  public void setId(Long id) {
    this.id = id;
  }

  /**
   * Returns the leave type name.
   * @return the name
   */
  public String getName() {
    return name;
  }

  /**
   * Sets the leave type name.
   * @param name the name to set
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * Returns the days allocated per year.
   * @return the days per year
   */
  public int getDaysPerYear() {
    return daysPerYear;
  }

  /**
   * Sets the days allocated per year.
   * @param daysPerYear the days per year to set
   */
  public void setDaysPerYear(int daysPerYear) {
    this.daysPerYear = daysPerYear;
  }

  /**
   * Returns whether carry-forward is allowed.
   * @return true if carry-forward is allowed
   */
  public boolean isCarryForwardAllowed() {
    return carryForwardAllowed;
  }

  /**
   * Sets whether carry-forward is allowed.
   * @param carryForwardAllowed true to allow carry-forward
   */
  public void setCarryForwardAllowed(boolean carryForwardAllowed) {
    this.carryForwardAllowed = carryForwardAllowed;
  }

  /**
   * Returns the description.
   * @return the description
   */
  public String getDescription() {
    return description;
  }

  /**
   * Sets the description.
   * @param description the description to set
   */
  public void setDescription(String description) {
    this.description = description;
  }

  /**
   * Returns the creation timestamp.
   * @return the creation date
   */
  public Date getCreatedAt() {
    return createdAt;
  }

  /**
   * Sets the creation timestamp.
   * @param createdAt the creation date to set
   */
  public void setCreatedAt(Date createdAt) {
    this.createdAt = createdAt;
  }
}
