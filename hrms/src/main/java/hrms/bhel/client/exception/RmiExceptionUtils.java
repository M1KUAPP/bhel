package hrms.bhel.client.exception;

import java.rmi.RemoteException;
import java.util.Optional;
import org.slf4j.Logger;

/**
 * Utility class for handling RMI exceptions and translating them to REST API exceptions.
 * Provides methods to extract and handle specific business exceptions from RemoteException.
 */
public final class RmiExceptionUtils {

  private RmiExceptionUtils() {}

  public static Optional<Throwable> findCauseByType(RemoteException e, String simpleClassName) {
    Throwable cause = e;
    while (cause != null) {
      if (cause.getClass().getSimpleName().equals(simpleClassName)) {
        return Optional.of(cause);
      }
      cause = cause.getCause();
    }
    return Optional.empty();
  }

  public static void handleDuplicateEmployee(RemoteException e, Logger logger) {
    findCauseByType(e, "DuplicateEmployeeException").ifPresent(cause -> {
      logger.warn("Duplicate employee: {}", cause.getMessage());
      throw new DuplicateResourceException(cause.getMessage());
    });
  }

  public static void handleEmployeeNotFound(RemoteException e, Logger logger) {
    findCauseByType(e, "EmployeeNotFoundException").ifPresent(cause -> {
      logger.warn("Employee not found: {}", cause.getMessage());
      throw new ResourceNotFoundException(cause.getMessage());
    });
  }

  public static void handleInvalidLeaveRequest(RemoteException e, Logger logger) {
    findCauseByType(e, "InvalidLeaveRequestException").ifPresent(cause -> {
      logger.warn("Invalid leave request: {}", cause.getMessage());
      throw new IllegalArgumentException(cause.getMessage());
    });
  }

  public static void handleInsufficientLeaveBalance(RemoteException e, Logger logger) {
    findCauseByType(e, "InsufficientLeaveBalanceException").ifPresent(cause -> {
      logger.warn("Insufficient leave balance: {}", cause.getMessage());
      throw new IllegalArgumentException(cause.getMessage());
    });
  }

  public static void handleCommonExceptions(RemoteException e, Logger logger) {
    handleDuplicateEmployee(e, logger);
    handleEmployeeNotFound(e, logger);
    handleInvalidLeaveRequest(e, logger);
    handleInsufficientLeaveBalance(e, logger);
  }
}
