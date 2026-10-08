package hrms.bhel.common.dto;

import java.io.Serializable;
import java.util.Date;

/**
 * Data Transfer Object representing a user account in the HRMS system.
 * Links to an employee record and contains authentication and authorization data.
 */
public class User implements Serializable {

  private static final long serialVersionUID = 1L;
  private Long id;
  private Long employeeId;
  private String username;
  private String role;
  private Date lastLogin;
  private Date createdAt;
  private Employee employee;

  public User() {}

  public User(Long id, Long employeeId, String username, String role) {
    this.id = id;
    this.employeeId = employeeId;
    this.username = username;
    this.role = role;
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

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }

  public Date getLastLogin() {
    return lastLogin;
  }

  public void setLastLogin(Date lastLogin) {
    this.lastLogin = lastLogin;
  }

  public Date getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Date createdAt) {
    this.createdAt = createdAt;
  }

  public Employee getEmployee() {
    return employee;
  }

  public void setEmployee(Employee employee) {
    this.employee = employee;
  }

  @Override
  public String toString() {
    return (
      "User{" +
      "id=" +
      id +
      ", employeeId=" +
      employeeId +
      ", username='" +
      username +
      '\'' +
      ", role='" +
      role +
      '\'' +
      ", lastLogin=" +
      lastLogin +
      ", createdAt=" +
      createdAt +
      '}'
    );
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    User user = (User) o;
    if (id != null ? !id.equals(user.id) : user.id != null) return false;
    return username != null ? username.equals(user.username) : user.username == null;
  }

  @Override
  public int hashCode() {
    int result = id != null ? id.hashCode() : 0;
    result = 31 * result + (username != null ? username.hashCode() : 0);
    return result;
  }
}
