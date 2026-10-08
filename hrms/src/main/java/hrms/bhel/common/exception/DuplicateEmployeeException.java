package hrms.bhel.common.exception;

/**
 * Exception thrown when attempting to register an employee that already exists in the system.
 * Typically occurs when an employee with the same IC/passport number is already registered.
 */
public class DuplicateEmployeeException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  /**
   * Constructs a new DuplicateEmployeeException with no detail message.
   */
  public DuplicateEmployeeException() {
    super();
  }

  /**
   * Constructs a new DuplicateEmployeeException with the specified detail message.
   * @param message the detail message describing the duplicate condition
   */
  public DuplicateEmployeeException(String message) {
    super(message);
  }

  /**
   * Constructs a new DuplicateEmployeeException with the specified detail message and cause.
   * @param message the detail message
   * @param cause the cause of this exception
   */
  public DuplicateEmployeeException(String message, Throwable cause) {
    super(message, cause);
  }

  /**
   * Constructs a new DuplicateEmployeeException with the specified cause.
   * @param cause the cause of this exception
   */
  public DuplicateEmployeeException(Throwable cause) {
    super(cause);
  }
}
