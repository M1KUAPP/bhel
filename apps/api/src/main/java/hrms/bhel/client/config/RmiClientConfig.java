package hrms.bhel.client.config;

import hrms.bhel.common.service.EmployeeService;
import hrms.bhel.common.service.LeaveService;
import hrms.bhel.common.service.ReportService;
import hrms.bhel.common.service.UserService;
import java.net.MalformedURLException;
import java.rmi.Naming;
import java.rmi.NotBoundException;
import java.rmi.RemoteException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

/**
 * RMI client configuration for connecting to the backend RMI server.
 * Provides lazy-initialized beans for Employee, Leave, Report, and User services.
 * Services are looked up from the RMI registry on first access.
 */
@Configuration
public class RmiClientConfig {

  private static final Logger logger = LoggerFactory.getLogger(RmiClientConfig.class);
  private final String rmiHost = System.getenv().getOrDefault("RMI_SERVER_HOST", "localhost");
  private final int rmiPort = Integer.parseInt(System.getenv().getOrDefault("RMI_SERVER_PORT", "1099"));

  @Bean
  @Lazy
  public EmployeeService employeeService() {
    String serviceUrl = String.format("rmi://%s:%d/EmployeeService", rmiHost, rmiPort);
    logger.info("Looking up EmployeeService at: {}", serviceUrl);
    try {
      EmployeeService service = (EmployeeService) Naming.lookup(serviceUrl);
      logger.info("Successfully connected to EmployeeService");
      logger.debug("  - Service URL: {}", serviceUrl);
      logger.debug("  - Service Interface: {}", EmployeeService.class.getName());
      return service;
    } catch (NotBoundException e) {
      logger.error("✗ EmployeeService not bound in RMI registry at {}", serviceUrl);
      throw new RuntimeException("Failed to lookup EmployeeService: Service not bound", e);
    } catch (MalformedURLException e) {
      logger.error("✗ Invalid RMI URL: {}", serviceUrl);
      throw new RuntimeException("Failed to lookup EmployeeService: Malformed URL", e);
    } catch (RemoteException e) {
      logger.error("✗ Failed to connect to RMI server at {}:{}", rmiHost, rmiPort);
      logger.warn(
        "Note: The application will start, but EmployeeService calls will fail until RMI server is available"
      );
      throw new RuntimeException("Failed to lookup EmployeeService: Connection failed", e);
    }
  }

  @Bean
  @Lazy
  public LeaveService leaveService() {
    String serviceUrl = String.format("rmi://%s:%d/LeaveService", rmiHost, rmiPort);
    logger.info("Looking up LeaveService at: {}", serviceUrl);
    try {
      LeaveService service = (LeaveService) Naming.lookup(serviceUrl);
      logger.info("Successfully connected to LeaveService");
      logger.debug("  - Service URL: {}", serviceUrl);
      logger.debug("  - Service Interface: {}", LeaveService.class.getName());
      return service;
    } catch (NotBoundException e) {
      logger.error("✗ LeaveService not bound in RMI registry at {}", serviceUrl);
      throw new RuntimeException("Failed to lookup LeaveService: Service not bound", e);
    } catch (MalformedURLException e) {
      logger.error("✗ Invalid RMI URL: {}", serviceUrl);
      throw new RuntimeException("Failed to lookup LeaveService: Malformed URL", e);
    } catch (RemoteException e) {
      logger.error("✗ Failed to connect to RMI server at {}:{}", rmiHost, rmiPort);
      logger.warn("Note: The application will start, but LeaveService calls will fail until RMI server is available");
      throw new RuntimeException("Failed to lookup LeaveService: Connection failed", e);
    }
  }

  @Bean
  @Lazy
  public ReportService reportService() {
    String serviceUrl = String.format("rmi://%s:%d/ReportService", rmiHost, rmiPort);
    logger.info("Looking up ReportService at: {}", serviceUrl);
    try {
      ReportService service = (ReportService) Naming.lookup(serviceUrl);
      logger.info("Successfully connected to ReportService");
      logger.debug("  - Service URL: {}", serviceUrl);
      logger.debug("  - Service Interface: {}", ReportService.class.getName());
      return service;
    } catch (NotBoundException e) {
      logger.error("✗ ReportService not bound in RMI registry at {}", serviceUrl);
      throw new RuntimeException("Failed to lookup ReportService: Service not bound", e);
    } catch (MalformedURLException e) {
      logger.error("✗ Invalid RMI URL: {}", serviceUrl);
      throw new RuntimeException("Failed to lookup ReportService: Malformed URL", e);
    } catch (RemoteException e) {
      logger.error("✗ Failed to connect to RMI server at {}:{}", rmiHost, rmiPort);
      logger.warn("Note: The application will start, but ReportService calls will fail until RMI server is available");
      throw new RuntimeException("Failed to lookup ReportService: Connection failed", e);
    }
  }

  @Bean
  @Lazy
  public UserService userService() {
    String serviceUrl = String.format("rmi://%s:%d/UserService", rmiHost, rmiPort);
    logger.info("Looking up UserService at: {}", serviceUrl);
    try {
      UserService service = (UserService) Naming.lookup(serviceUrl);
      logger.info("Successfully connected to UserService");
      logger.debug("  - Service URL: {}", serviceUrl);
      logger.debug("  - Service Interface: {}", UserService.class.getName());
      return service;
    } catch (NotBoundException e) {
      logger.error("✗ UserService not bound in RMI registry at {}", serviceUrl);
      throw new RuntimeException("Failed to lookup UserService: Service not bound", e);
    } catch (MalformedURLException e) {
      logger.error("✗ Invalid RMI URL: {}", serviceUrl);
      throw new RuntimeException("Failed to lookup UserService: Malformed URL", e);
    } catch (RemoteException e) {
      logger.error("✗ Failed to connect to RMI server at {}:{}", rmiHost, rmiPort);
      logger.warn("Note: The application will start, but UserService calls will fail until RMI server is available");
      throw new RuntimeException("Failed to lookup UserService: Connection failed", e);
    }
  }
}
