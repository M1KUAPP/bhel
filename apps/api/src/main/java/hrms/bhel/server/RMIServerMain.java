package hrms.bhel.server;

import hrms.bhel.server.config.DatabaseConfig;
import hrms.bhel.server.service.EmployeeServiceImpl;
import hrms.bhel.server.service.LeaveServiceImpl;
import hrms.bhel.server.service.ReportServiceImpl;
import hrms.bhel.server.service.UserServiceImpl;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Main entry point for the RMI server application.
 * Bootstraps the server by initializing DAOs, creating service implementations,
 * and binding them to the RMI registry for remote access.
 */
public class RMIServerMain {

  private static final Logger logger = LoggerFactory.getLogger(RMIServerMain.class);

  /**
   * Main method that starts the RMI server.
   * Initializes database connections, creates service instances, and binds them to the RMI registry.
   * @param args command line arguments (not used, configuration via environment variables)
   */
  public static void main(String[] args) {
    logger.info("BHEL HRMS - RMI Server");
    try {
      String rmiHost = System.getenv().getOrDefault("RMI_SERVER_HOST", "localhost");
      String rmiPort = System.getenv().getOrDefault("RMI_SERVER_PORT", "1099");
      logger.info("Configuring RMI system properties...");
      System.setProperty("java.rmi.server.hostname", rmiHost);
      System.setProperty("java.rmi.server.useCodebaseOnly", "true");
      logger.info("RMI Host: {}", rmiHost);
      logger.info("RMI Port: {}", rmiPort);
      logger.info("Testing database connectivity...");
      if (DatabaseConfig.testConnection()) {
        logger.info("Database connection successful");
      } else {
        logger.error("Database connection failed");
        throw new IllegalStateException("Cannot start RMI server without database connection");
      }
      logger.info("Creating DAO instances...");
      hrms.bhel.server.dao.EmployeeDAO employeeDAO = new hrms.bhel.server.dao.EmployeeDAO();
      hrms.bhel.server.dao.FamilyDAO familyDAO = new hrms.bhel.server.dao.FamilyDAO();
      hrms.bhel.server.dao.LeaveDAO leaveDAO = new hrms.bhel.server.dao.LeaveDAO();
      hrms.bhel.server.dao.UserDAO userDAO = new hrms.bhel.server.dao.UserDAO(employeeDAO);
      logger.info("DAO instances created");
      logger.info("Creating service instances...");
      EmployeeServiceImpl employeeService;
      LeaveServiceImpl leaveService;
      ReportServiceImpl reportService;
      UserServiceImpl userService;
      try {
        employeeService = new EmployeeServiceImpl(employeeDAO, familyDAO, userDAO, leaveDAO);
        logger.info("EmployeeService initialized");
      } catch (RemoteException e) {
        logger.error("Failed to create EmployeeService", e);
        throw new RuntimeException("Failed to initialize EmployeeService", e);
      }
      try {
        leaveService = new LeaveServiceImpl(leaveDAO);
        logger.info("LeaveService initialized");
      } catch (RemoteException e) {
        logger.error("Failed to create LeaveService", e);
        throw new RuntimeException("Failed to initialize LeaveService", e);
      }
      try {
        reportService = new ReportServiceImpl(employeeDAO, familyDAO, leaveDAO);
        logger.info("ReportService initialized");
      } catch (RemoteException e) {
        logger.error("Failed to create ReportService", e);
        throw new RuntimeException("Failed to initialize ReportService", e);
      }
      try {
        userService = new UserServiceImpl(userDAO, employeeDAO);
        logger.info("UserService initialized");
      } catch (RemoteException e) {
        logger.error("Failed to create UserService", e);
        throw new RuntimeException("Failed to initialize UserService", e);
      }
      logger.info("Creating RMI registry on port {}...", rmiPort);
      int port = Integer.parseInt(rmiPort);
      Registry registry = LocateRegistry.createRegistry(port);
      logger.info("RMI registry created");
      logger.info("Binding services to registry...");
      registry.rebind("EmployeeService", employeeService);
      logger.info("EmployeeService bound to registry");
      registry.rebind("LeaveService", leaveService);
      logger.info("LeaveService bound to registry");
      registry.rebind("ReportService", reportService);
      logger.info("ReportService bound to registry");
      registry.rebind("UserService", userService);
      logger.info("UserService bound to registry");
      Runtime.getRuntime().addShutdownHook(
        new Thread(
          () -> {
            logger.info("Shutting down RMI Server...");
            try {
              logger.info("Closing database connections...");
              DatabaseConfig.closeDataSource();
              logger.info("Database connections closed");
            } catch (Exception e) {
              logger.error("Error during shutdown", e);
            }
            logger.info("RMI Server shutdown complete");
          },
          "RMI-Shutdown-Hook"
        )
      );
      logger.info("Shutdown hook registered");
      logger.info("RMI Server Ready!");
      logger.info("Host: {}", rmiHost);
      logger.info("Port: {}", port);
      logger.info("Services available:");
      logger.info("  - EmployeeService");
      logger.info("  - LeaveService");
      logger.info("  - ReportService");
      logger.info("  - UserService");
      logger.info("Press Ctrl+C to stop the server");
      Thread.currentThread().join();
    } catch (NumberFormatException e) {
      logger.error("Invalid port number in RMI_PORT environment variable", e);
      logger.error("Please set RMI_PORT to a valid integer value (default: 1099)");
      System.exit(1);
    } catch (RemoteException e) {
      logger.error("RMI error occurred during server startup", e);
      logger.error("Possible causes:");
      logger.error("  - Port {} may already be in use", System.getenv().getOrDefault("RMI_SERVER_PORT", "1099"));
      logger.error("  - Network configuration issues");
      logger.error("  - Firewall blocking RMI port");
      System.exit(1);
    } catch (InterruptedException e) {
      logger.info("Server interrupted");
      Thread.currentThread().interrupt();
      System.exit(0);
    } catch (Exception e) {
      logger.error("Failed to start RMI Server", e);
      logger.error("Error type: {}", e.getClass().getName());
      logger.error("Error message: {}", e.getMessage());
      System.exit(1);
    }
  }
}
