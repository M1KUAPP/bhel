package hrms.bhel.server.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Singleton configuration class for database connection pooling using HikariCP.
 * Provides thread-safe lazy initialization of the connection pool with configuration
 * from properties file or environment variables.
 */
public class DatabaseConfig {

  private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);
  private static HikariDataSource dataSource;
  private static final String PROPERTIES_FILE = "database.properties";

  /**
   * Private constructor to prevent instantiation.
   */
  private DatabaseConfig() {}

  /**
   * Returns the singleton DataSource instance, creating it if necessary.
   * Uses double-checked locking for thread-safe lazy initialization.
   * @return the HikariCP DataSource instance
   */
  public static DataSource getDataSource() {
    if (dataSource == null) {
      synchronized (DatabaseConfig.class) {
        if (dataSource == null) {
          try {
            logger.info("Initializing database connection pool...");
            dataSource = createDataSource();
            logger.info("Database connection pool initialized successfully");
          } catch (Exception e) {
            logger.error("Failed to initialize database connection pool", e);
            throw new RuntimeException("Database configuration failed", e);
          }
        }
      }
    }
    return dataSource;
  }

  /**
   * Creates and configures a new HikariCP DataSource.
   * @return configured HikariDataSource instance
   * @throws IOException if properties file cannot be read
   */
  private static HikariDataSource createDataSource() throws IOException {
    Properties props = loadProperties();
    HikariConfig config = new HikariConfig();
    String jdbcUrl = getProperty(props, "db.url", System.getenv("DATABASE_URL"));
    String username = getProperty(props, "db.username", System.getenv("DB_USER"));
    String password = getProperty(props, "db.password", System.getenv("DB_PASSWORD"));
    if (jdbcUrl == null || jdbcUrl.isEmpty()) {
      throw new IllegalStateException(
        "Database URL is not configured. Set db.url in database.properties or DATABASE_URL environment variable."
      );
    }
    config.setJdbcUrl(jdbcUrl);
    if (username != null && !username.isEmpty()) {
      config.setUsername(username);
    }
    if (password != null && !password.isEmpty()) {
      config.setPassword(password);
    }
    config.setMaximumPoolSize(getIntPropertyWithEnv(props, "db.pool.maximumPoolSize", "DB_POOL_MAX_SIZE", 120));
    config.setMinimumIdle(getIntPropertyWithEnv(props, "db.pool.minimumIdle", "DB_POOL_MIN_IDLE", 20));
    config.setConnectionTimeout(
      getLongPropertyWithEnv(props, "db.pool.connectionTimeout", "DB_POOL_CONNECTION_TIMEOUT", 30000L)
    );
    config.setIdleTimeout(getLongPropertyWithEnv(props, "db.pool.idleTimeout", "DB_POOL_IDLE_TIMEOUT", 600000L));
    config.setMaxLifetime(getLongPropertyWithEnv(props, "db.pool.maxLifetime", "DB_POOL_MAX_LIFETIME", 1800000L));
    config.setPoolName("HRM-HikariCP");
    config.setConnectionTestQuery("SELECT 1");
    config.setAutoCommit(true);
    config.addDataSourceProperty("cachePrepStmts", getBooleanProperty(props, "db.pool.cachePrepStmts", true));
    config.addDataSourceProperty("prepStmtCacheSize", getIntProperty(props, "db.pool.prepStmtCacheSize", 250));
    config.addDataSourceProperty("prepStmtCacheSqlLimit", getIntProperty(props, "db.pool.prepStmtCacheSqlLimit", 2048));
    config.addDataSourceProperty("useServerPrepStmts", true);
    logger.info(
      "Database configuration: URL={}, MaxPoolSize={}, MinIdle={}",
      maskUrl(jdbcUrl),
      config.getMaximumPoolSize(),
      config.getMinimumIdle()
    );
    return new HikariDataSource(config);
  }

  /**
   * Loads database properties from the properties file.
   * @return Properties object with loaded configuration
   * @throws IOException if an I/O error occurs
   */
  private static Properties loadProperties() throws IOException {
    Properties props = new Properties();
    try (InputStream input = DatabaseConfig.class.getClassLoader().getResourceAsStream(PROPERTIES_FILE)) {
      if (input != null) {
        props.load(input);
        logger.debug("Loaded properties from {}", PROPERTIES_FILE);
      } else {
        logger.warn("Properties file {} not found, using environment variables and defaults", PROPERTIES_FILE);
      }
    }
    return props;
  }

  /**
   * Gets a property value with fallback to default.
   * @param props the properties object
   * @param key the property key
   * @param defaultValue the default value if key not found
   * @return the property value or default
   */
  private static String getProperty(Properties props, String key, String defaultValue) {
    return props.getProperty(key, defaultValue);
  }

  /**
   * Gets an integer property value with fallback to default.
   * @param props the properties object
   * @param key the property key
   * @param defaultValue the default value if key not found or invalid
   * @return the parsed integer or default
   */
  private static int getIntProperty(Properties props, String key, int defaultValue) {
    String value = props.getProperty(key);
    if (value != null && !value.isEmpty()) {
      try {
        return Integer.parseInt(value);
      } catch (NumberFormatException e) {
        logger.warn("Invalid integer value for {}: {}, using default: {}", key, value, defaultValue);
      }
    }
    return defaultValue;
  }

  /**
   * Gets an integer property value with environment variable fallback.
   * @param props the properties object
   * @param key the property key
   * @param envVar the environment variable name
   * @param defaultValue the default value if neither found
   * @return the parsed integer or default
   */
  private static int getIntPropertyWithEnv(Properties props, String key, String envVar, int defaultValue) {
    String value = props.getProperty(key);
    if (value == null || value.isEmpty()) {
      value = System.getenv(envVar);
    }
    if (value != null && !value.isEmpty()) {
      try {
        return Integer.parseInt(value);
      } catch (NumberFormatException e) {
        logger.warn("Invalid integer value for {}/{}: {}, using default: {}", key, envVar, value, defaultValue);
      }
    }
    return defaultValue;
  }

  /**
   * Gets a long property value with environment variable fallback.
   * @param props the properties object
   * @param key the property key
   * @param envVar the environment variable name
   * @param defaultValue the default value if neither found
   * @return the parsed long or default
   */
  private static long getLongPropertyWithEnv(Properties props, String key, String envVar, long defaultValue) {
    String value = props.getProperty(key);
    if (value == null || value.isEmpty()) {
      value = System.getenv(envVar);
    }
    if (value != null && !value.isEmpty()) {
      try {
        return Long.parseLong(value);
      } catch (NumberFormatException e) {
        logger.warn("Invalid long value for {}/{}: {}, using default: {}", key, envVar, value, defaultValue);
      }
    }
    return defaultValue;
  }

  /**
   * Gets a boolean property value with fallback to default.
   * @param props the properties object
   * @param key the property key
   * @param defaultValue the default value if key not found
   * @return the parsed boolean or default
   */
  private static boolean getBooleanProperty(Properties props, String key, boolean defaultValue) {
    String value = props.getProperty(key);
    if (value != null && !value.isEmpty()) {
      return Boolean.parseBoolean(value);
    }
    return defaultValue;
  }

  /**
   * Masks password in URL for safe logging.
   * @param url the database URL
   * @return URL with password masked
   */
  private static String maskUrl(String url) {
    if (url == null) {
      return "null";
    }
    return url.replaceAll("password=[^&]+", "password=***");
  }

  /**
   * Closes the database connection pool and releases resources.
   */
  public static void closeDataSource() {
    if (dataSource != null && !dataSource.isClosed()) {
      logger.info("Closing database connection pool...");
      dataSource.close();
      dataSource = null;
      logger.info("Database connection pool closed");
    }
  }

  /**
   * Tests the database connection by acquiring and releasing a connection.
   * @return true if connection test succeeds, false otherwise
   */
  public static boolean testConnection() {
    try {
      DataSource ds = getDataSource();
      try (var connection = ds.getConnection()) {
        logger.info("Database connection test successful");
        return true;
      }
    } catch (Exception e) {
      logger.error("Database connection test failed", e);
      return false;
    }
  }
}
