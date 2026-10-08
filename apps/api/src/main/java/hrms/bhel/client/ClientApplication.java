package hrms.bhel.client;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot application entry point for the HRMS API Gateway.
 * This client application provides REST API endpoints and connects
 * to the RMI server for backend operations.
 */
@SpringBootApplication
public class ClientApplication {

  public static void main(String[] args) {
    SpringApplication.run(ClientApplication.class, args);
  }
}
