package hrms.bhel.client.dto;

import java.util.Date;
import java.util.Map;

/**
 * Standard error response format for REST API errors.
 * Includes timestamp, HTTP status, error type, message, and path.
 */
public class ErrorResponse {

  private Date timestamp;
  private int status;
  private String error;
  private String message;
  private String path;
  private Map<String, String> validationErrors;

  public ErrorResponse() {
    this.timestamp = new Date();
  }

  public ErrorResponse(int status, String error, String message) {
    this.timestamp = new Date();
    this.status = status;
    this.error = error;
    this.message = message;
  }

  public ErrorResponse(int status, String error, String message, String path) {
    this.timestamp = new Date();
    this.status = status;
    this.error = error;
    this.message = message;
    this.path = path;
  }

  public Date getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(Date timestamp) {
    this.timestamp = timestamp;
  }

  public int getStatus() {
    return status;
  }

  public void setStatus(int status) {
    this.status = status;
  }

  public String getError() {
    return error;
  }

  public void setError(String error) {
    this.error = error;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public String getPath() {
    return path;
  }

  public void setPath(String path) {
    this.path = path;
  }

  public Map<String, String> getValidationErrors() {
    return validationErrors;
  }

  public void setValidationErrors(Map<String, String> validationErrors) {
    this.validationErrors = validationErrors;
  }

  @Override
  public String toString() {
    return (
      "ErrorResponse{" +
      "timestamp=" +
      timestamp +
      ", status=" +
      status +
      ", error='" +
      error +
      '\'' +
      ", message='" +
      message +
      '\'' +
      ", path='" +
      path +
      '\'' +
      ", validationErrors=" +
      validationErrors +
      '}'
    );
  }
}
