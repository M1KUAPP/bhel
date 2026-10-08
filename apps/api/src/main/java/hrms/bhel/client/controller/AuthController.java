package hrms.bhel.client.controller;

import hrms.bhel.client.dto.ErrorResponse;
import hrms.bhel.client.dto.LoginRequest;
import hrms.bhel.client.dto.LoginResponse;
import hrms.bhel.client.security.JwtUtil;
import hrms.bhel.common.dto.Employee;
import hrms.bhel.common.dto.User;
import hrms.bhel.common.service.UserService;
import jakarta.validation.Valid;
import java.rmi.RemoteException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for user authentication.
 * Handles login requests and JWT token generation.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

  @Autowired
  private JwtUtil jwtUtil;

  @Autowired
  private UserService userService;

  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
    logger.info("Login request received for username: {}", request.getUsername());
    try {
      User user = userService.authenticate(request.getUsername(), request.getPassword());
      if (user == null) {
        logger.warn("Authentication failed for username: {}", request.getUsername());
        return error(HttpStatus.UNAUTHORIZED, "Invalid username or password");
      }
      Employee employee = user.getEmployee();
      if (employee == null) {
        logger.error("User {} has no associated employee record", request.getUsername());
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "User account configuration error");
      }
      String role = user.getRole().toUpperCase();
      String token = jwtUtil.generateToken(request.getUsername(), role, employee.getId());
      LoginResponse response = new LoginResponse();
      response.setToken(token);
      response.setTokenType("Bearer");
      response.setUsername(user.getUsername());
      response.setRole(role);
      response.setUserId(user.getId());
      response.setEmployeeId(employee.getId());
      response.setFirstName(employee.getFirstName());
      response.setLastName(employee.getLastName());
      response.setEmail(employee.getEmail());
      logger.info("Login successful for username: {} with role: {}", request.getUsername(), role);
      return ResponseEntity.ok(response);
    } catch (RemoteException e) {
      logger.error(
        "RMI communication error during authentication for user {}: {}",
        request.getUsername(),
        e.getMessage(),
        e
      );
      return error(HttpStatus.SERVICE_UNAVAILABLE, "Authentication service temporarily unavailable");
    } catch (Exception e) {
      logger.error("Unexpected error during authentication for user {}: {}", request.getUsername(), e.getMessage(), e);
      return error(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred during authentication");
    }
  }

  private ResponseEntity<ErrorResponse> error(HttpStatus status, String message) {
    return ResponseEntity.status(status).body(new ErrorResponse(status.value(), status.getReasonPhrase(), message));
  }
}
