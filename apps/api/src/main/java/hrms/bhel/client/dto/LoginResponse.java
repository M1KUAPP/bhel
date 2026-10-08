package hrms.bhel.client.dto;

/**
 * Data Transfer Object for successful login responses.
 * Contains JWT token, user details, and employee information.
 */
public class LoginResponse {

  private String token;
  private String tokenType = "Bearer";
  private Long userId;
  private String username;
  private String role;
  private Long employeeId;
  private String firstName;
  private String lastName;
  private String email;

  public LoginResponse() {}

  public LoginResponse(String token, Long userId, String username, String role) {
    this.token = token;
    this.userId = userId;
    this.username = username;
    this.role = role;
  }

  public LoginResponse(
    String token,
    String tokenType,
    Long userId,
    String username,
    String role,
    Long employeeId,
    String firstName,
    String lastName,
    String email
  ) {
    this.token = token;
    this.tokenType = tokenType;
    this.userId = userId;
    this.username = username;
    this.role = role;
    this.employeeId = employeeId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }

  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
  }

  public String getTokenType() {
    return tokenType;
  }

  public void setTokenType(String tokenType) {
    this.tokenType = tokenType;
  }

  public Long getUserId() {
    return userId;
  }

  public void setUserId(Long userId) {
    this.userId = userId;
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

  public Long getEmployeeId() {
    return employeeId;
  }

  public void setEmployeeId(Long employeeId) {
    this.employeeId = employeeId;
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

  @Override
  public String toString() {
    return (
      "LoginResponse{" +
      "tokenType='" +
      tokenType +
      '\'' +
      ", userId=" +
      userId +
      ", username='" +
      username +
      '\'' +
      ", role='" +
      role +
      '\'' +
      ", employeeId=" +
      employeeId +
      ", firstName='" +
      firstName +
      '\'' +
      ", lastName='" +
      lastName +
      '\'' +
      '}'
    );
  }
}
