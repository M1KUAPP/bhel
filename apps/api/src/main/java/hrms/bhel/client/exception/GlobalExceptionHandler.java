package hrms.bhel.client.exception;

import hrms.bhel.client.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 * Global exception handler for REST API error responses.
 * Handles validation errors, service communication errors,
 * and resource not found exceptions with appropriate HTTP status codes.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(ServiceCommunicationException.class)
  public ResponseEntity<ErrorResponse> handleServiceCommunicationException(
    ServiceCommunicationException ex,
    HttpServletRequest request
  ) {
    logger.error("Service communication error: {} at {}", ex.getMessage(), request.getRequestURI(), ex);
    ErrorResponse error = new ErrorResponse(
      HttpStatus.SERVICE_UNAVAILABLE.value(),
      "Service Unavailable",
      "Unable to communicate with backend service: " + ex.getMessage(),
      request.getRequestURI()
    );
    return new ResponseEntity<>(error, HttpStatus.SERVICE_UNAVAILABLE);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(
    MethodArgumentNotValidException ex,
    HttpServletRequest request
  ) {
    Map<String, String> validationErrors = new HashMap<>();
    for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
      validationErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
      logger.warn(
        "Validation failed for field '{}': {} (rejected value: {})",
        fieldError.getField(),
        fieldError.getDefaultMessage(),
        fieldError.getRejectedValue()
      );
    }
    logger.warn(
      "Validation error at {}: {} field(s) failed - {}",
      request.getRequestURI(),
      ex.getBindingResult().getErrorCount(),
      validationErrors
    );
    ErrorResponse error = new ErrorResponse(
      HttpStatus.BAD_REQUEST.value(),
      "Validation Failed",
      "Request validation failed. Please check the validation errors.",
      request.getRequestURI()
    );
    error.setValidationErrors(validationErrors);
    return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
    ResourceNotFoundException ex,
    HttpServletRequest request
  ) {
    logger.warn("Resource not found: {} at {}", ex.getMessage(), request.getRequestURI());
    ErrorResponse error = new ErrorResponse(
      HttpStatus.NOT_FOUND.value(),
      "Resource Not Found",
      ex.getMessage() != null ? ex.getMessage() : "The requested resource was not found",
      request.getRequestURI()
    );
    return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(DuplicateResourceException.class)
  public ResponseEntity<ErrorResponse> handleDuplicateResourceException(
    DuplicateResourceException ex,
    HttpServletRequest request
  ) {
    logger.warn("Duplicate resource: {} at {}", ex.getMessage(), request.getRequestURI());
    ErrorResponse error = new ErrorResponse(
      HttpStatus.CONFLICT.value(),
      "Duplicate Resource",
      ex.getMessage() != null ? ex.getMessage() : "A resource with these details already exists",
      request.getRequestURI()
    );
    return new ResponseEntity<>(error, HttpStatus.CONFLICT);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
    IllegalArgumentException ex,
    HttpServletRequest request
  ) {
    logger.warn("Invalid argument: {} at {}", ex.getMessage(), request.getRequestURI());
    ErrorResponse error = new ErrorResponse(
      HttpStatus.BAD_REQUEST.value(),
      "Invalid Argument",
      ex.getMessage() != null ? ex.getMessage() : "Invalid argument provided",
      request.getRequestURI()
    );
    return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
    logger.error("Internal server error: {} at {}", ex.getMessage(), request.getRequestURI(), ex);
    ErrorResponse error = new ErrorResponse(
      HttpStatus.INTERNAL_SERVER_ERROR.value(),
      "Internal Server Error",
      "An unexpected error occurred. Please try again later.",
      request.getRequestURI()
    );
    return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
