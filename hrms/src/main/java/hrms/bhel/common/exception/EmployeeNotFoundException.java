package hrms.bhel.common.exception;

/**
 * Exception thrown when an employee cannot be found in the system.
 * Typically occurs when querying by ID or other identifier that does not match any record.
 */
public class EmployeeNotFoundException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  /**
   * Constructs a new EmployeeNotFoundException with no detail message.
   */
  public EmployeeNotFoundException() {
    super();
  }

  /**
   * Constructs a new EmployeeNotFoundException with the specified detail message.
   * @param message the detail message describing which employee was not found
   */
  public EmployeeNotFoundException(String message) {
    super(message);
  }

  /**
   * Constructs a new EmployeeNotFoundException with the specified detail message and cause.
   * @param message the detail message
   * @param cause the cause of this exception
   */
  public EmployeeNotFoundException(String message, Throwable cause) {
    super(message, cause);
  }

  /**
   * Constructs a new EmployeeNotFoundException with the specified cause.
   * @param cause the cause of this exception
   */
  public EmployeeNotFoundException(Throwable cause) {
    super(cause);
  }
}
