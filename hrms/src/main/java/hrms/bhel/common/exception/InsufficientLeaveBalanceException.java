package hrms.bhel.common.exception;

/**
 * Exception thrown when an employee attempts to apply for leave but does not have
 * sufficient leave balance for the requested leave type.
 */
public class InsufficientLeaveBalanceException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  /**
   * Constructs a new InsufficientLeaveBalanceException with no detail message.
   */
  public InsufficientLeaveBalanceException() {
    super();
  }

  /**
   * Constructs a new InsufficientLeaveBalanceException with the specified detail message.
   * @param message the detail message describing the balance shortage
   */
  public InsufficientLeaveBalanceException(String message) {
    super(message);
  }

  /**
   * Constructs a new InsufficientLeaveBalanceException with the specified detail message and cause.
   * @param message the detail message
   * @param cause the cause of this exception
   */
  public InsufficientLeaveBalanceException(String message, Throwable cause) {
    super(message, cause);
  }

  /**
   * Constructs a new InsufficientLeaveBalanceException with the specified cause.
   * @param cause the cause of this exception
   */
  public InsufficientLeaveBalanceException(Throwable cause) {
    super(cause);
  }
}
