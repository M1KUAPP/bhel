package hrms.bhel.client.exception;

/**
 * Exception thrown when RMI communication with the backend server fails.
 * Results in HTTP 503 Service Unavailable response.
 */
public class ServiceCommunicationException extends RuntimeException {

  public ServiceCommunicationException() {
    super();
  }

  public ServiceCommunicationException(String message) {
    super(message);
  }

  public ServiceCommunicationException(String message, Throwable cause) {
    super(message, cause);
  }

  public ServiceCommunicationException(Throwable cause) {
    super(cause);
  }
}
