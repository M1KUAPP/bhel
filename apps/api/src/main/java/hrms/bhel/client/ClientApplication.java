package hrms.bhel.client;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

/**
 * Spring Boot application entry point for the HRMS API Gateway.
 * This client application provides REST API endpoints and connects
 * to the RMI server for backend operations.
 */
// Authentication is JWT-only (JwtAuthenticationFilter), so Spring Boot's generated in-memory user would never be used.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class ClientApplication {

  public static void main(String[] args) {
    SpringApplication.run(ClientApplication.class, args);
  }
}
