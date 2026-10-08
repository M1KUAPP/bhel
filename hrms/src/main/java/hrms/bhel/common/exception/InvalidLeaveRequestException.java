package hrms.bhel.common.exception;

/**
 * Exception thrown when a leave request contains invalid data.
 * Examples include invalid date ranges, missing required fields, or invalid leave type.
 */
public class InvalidLeaveRequestException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  /**
   * Constructs a new InvalidLeaveRequestException with no detail message.
   */
  public InvalidLeaveRequestException() {
    super();
  }

  /**
   * Constructs a new InvalidLeaveRequestException with the specified detail message.
   * @param message the detail message describing what made the request invalid
   */
  public InvalidLeaveRequestException(String message) {
    super(message);
  }

  /**
   * Constructs a new InvalidLeaveRequestException with the specified detail message and cause.
   * @param message the detail message
   * @param cause the cause of this exception
   */
  public InvalidLeaveRequestException(String message, Throwable cause) {
    super(message, cause);
  }

  /**
   * Constructs a new InvalidLeaveRequestException with the specified cause.
   * @param cause the cause of this exception
   */
  public InvalidLeaveRequestException(Throwable cause) {
    super(cause);
  }
}
