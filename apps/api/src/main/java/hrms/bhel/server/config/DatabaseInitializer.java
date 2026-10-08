package hrms.bhel.server.config;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Utility class for initializing the database schema and seed data.
 * Executes SQL scripts from resources to create tables and populate initial data.
 */
public class DatabaseInitializer {

  private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);
  private static final String SCHEMA_SQL_PATH = "db/schema.sql";
  private static final String SEED_DATA_SQL_PATH = "db/seed_data.sql";

  /**
   * Main entry point for running database initialization as a standalone process.
   * @param args command line arguments (not used)
   */
  public static void main(String[] args) {
    boolean success = initialize();
    System.exit(success ? 0 : 1);
  }

  /**
   * Initializes the database by executing schema and seed data scripts.
   * @return true if initialization succeeds, false otherwise
   */
  public static boolean initialize() {
    logger.info("Database Initialization");
    try {
      logger.info("Testing database connectivity...");
      if (!DatabaseConfig.testConnection()) {
        logger.error("Database connection failed. Cannot initialize.");
        return false;
      }
      logger.info("Database connection successful");
      logger.info("Loading schema script from {}...", SCHEMA_SQL_PATH);
      String schemaSql = loadSqlFromResource(SCHEMA_SQL_PATH);
      logger.info("Executing schema script...");
      if (!executeScript(schemaSql, "schema")) {
        logger.error("Schema script execution failed");
        return false;
      }
      logger.info("Schema script executed successfully");
      logger.info("Loading seed data script from {}...", SEED_DATA_SQL_PATH);
      String seedDataSql = loadSqlFromResource(SEED_DATA_SQL_PATH);
      logger.info("Executing seed data script...");
      if (!executeScript(seedDataSql, "seed_data")) {
        logger.error("Seed data script execution failed");
        return false;
      }
      logger.info("Seed data script executed successfully");
      logger.info("Database initialization complete!");
      return true;
    } catch (Exception e) {
      logger.error("Database initialization failed", e);
      return false;
    } finally {
      DatabaseConfig.closeDataSource();
    }
  }

  /**
   * Executes a SQL script within a transaction.
   * @param sql the SQL script content
   * @param scriptName name of the script for logging
   * @return true if execution succeeds, false otherwise
   */
  private static boolean executeScript(String sql, String scriptName) {
    List<String> statements = parseStatements(sql);
    logger.info("Parsed {} statements from {}", statements.size(), scriptName);
    try (Connection conn = DatabaseConfig.getDataSource().getConnection()) {
      conn.setAutoCommit(false);
      try (Statement stmt = conn.createStatement()) {
        int executed = 0;
        for (String statement : statements) {
          if (statement.isBlank()) {
            continue;
          }
          try {
            stmt.execute(statement);
            executed++;
          } catch (SQLException e) {
            logger.error("Failed to execute statement: {}", truncate(statement, 100));
            logger.error("Error: {}", e.getMessage());
            conn.rollback();
            return false;
          }
        }
        conn.commit();
        logger.info("Executed {} statements successfully", executed);
        return true;
      } catch (SQLException e) {
        conn.rollback();
        throw e;
      }
    } catch (SQLException e) {
      logger.error("Database error during script execution", e);
      return false;
    }
  }

  /**
   * Parses SQL script into individual statements, handling PostgreSQL dollar-quoting and comments.
   * @param sql the SQL script content
   * @return list of individual SQL statements
   */
  private static List<String> parseStatements(String sql) {
    List<String> statements = new ArrayList<>();
    StringBuilder current = new StringBuilder();
    boolean inString = false;
    boolean inDollarQuote = false;
    String dollarTag = null;
    int i = 0;
    while (i < sql.length()) {
      char c = sql.charAt(i);
      if (!inString && c == '$') {
        int tagEnd = findDollarTagEnd(sql, i);
        if (tagEnd > i) {
          String tag = sql.substring(i, tagEnd + 1);
          if (!inDollarQuote) {
            inDollarQuote = true;
            dollarTag = tag;
            current.append(tag);
            i = tagEnd + 1;
            continue;
          } else if (tag.equals(dollarTag)) {
            inDollarQuote = false;
            current.append(tag);
            dollarTag = null;
            i = tagEnd + 1;
            continue;
          }
        }
      }
      if (inDollarQuote) {
        current.append(c);
        i++;
        continue;
      }
      if (!inString && c == '-' && i + 1 < sql.length() && sql.charAt(i + 1) == '-') {
        while (i < sql.length() && sql.charAt(i) != '\n') {
          i++;
        }
        if (i < sql.length()) {
          current.append('\n');
          i++;
        }
        continue;
      }
      if (c == '\'' && !inDollarQuote) {
        current.append(c);
        if (inString) {
          if (i + 1 < sql.length() && sql.charAt(i + 1) == '\'') {
            current.append(sql.charAt(i + 1));
            i += 2;
            continue;
          }
          inString = false;
        } else {
          inString = true;
        }
        i++;
        continue;
      }
      if (!inString && c == ';') {
        current.append(c);
        String stmt = current.toString().trim();
        if (!stmt.isEmpty() && !stmt.equals(";")) {
          statements.add(stmt);
        }
        current = new StringBuilder();
        i++;
        continue;
      }
      current.append(c);
      i++;
    }
    String remaining = current.toString().trim();
    if (!remaining.isEmpty() && !remaining.equals(";")) {
      statements.add(remaining);
    }
    return statements;
  }

  /**
   * Finds the end index of a PostgreSQL dollar-quote tag.
   * @param sql the SQL string
   * @param start the starting position of the dollar sign
   * @return the index of the closing dollar sign, or start if not a valid tag
   */
  private static int findDollarTagEnd(String sql, int start) {
    if (start >= sql.length() || sql.charAt(start) != '$') {
      return start;
    }
    for (int i = start + 1; i < sql.length(); i++) {
      char c = sql.charAt(i);
      if (c == '$') {
        return i;
      }
      if (!Character.isLetterOrDigit(c) && c != '_') {
        return start;
      }
    }
    return start;
  }

  /**
   * Truncates a string for logging, normalizing whitespace.
   * @param str the string to truncate
   * @param maxLen maximum length
   * @return truncated string with ellipsis if needed
   */
  private static String truncate(String str, int maxLen) {
    if (str == null) {
      return null;
    }
    String normalized = str.replaceAll("\\s+", " ").trim();
    if (normalized.length() <= maxLen) {
      return normalized;
    }
    return normalized.substring(0, maxLen) + "...";
  }

  /**
   * Loads SQL content from a classpath resource.
   * @param resourcePath path to the resource
   * @return the SQL content as a string
   * @throws IOException if resource not found or cannot be read
   */
  private static String loadSqlFromResource(String resourcePath) throws IOException {
    try (InputStream is = DatabaseInitializer.class.getClassLoader().getResourceAsStream(resourcePath)) {
      if (is == null) {
        throw new IOException("Resource not found: " + resourcePath);
      }
      try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
        return reader.lines().collect(Collectors.joining("\n"));
      }
    }
  }
}
