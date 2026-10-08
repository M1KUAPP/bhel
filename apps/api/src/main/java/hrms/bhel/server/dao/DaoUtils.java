package hrms.bhel.server.dao;

import hrms.bhel.server.config.DatabaseConfig;
import java.sql.Connection;
import java.sql.SQLException;
import org.slf4j.Logger;

/**
 * Utility interface for DAO operations providing common database transaction handling.
 */
public interface DaoUtils {
  /**
   * Functional interface for actions to be executed within a database transaction.
   * @param <T> the return type of the action
   */
  @FunctionalInterface
  interface TransactionAction<T> {
    /**
     * Executes the action using the provided connection.
     * @param conn the database connection
     * @return the result of the action
     * @throws SQLException if a database error occurs
     */
    T execute(Connection conn) throws SQLException;
  }

  /**
   * Executes an action within a database transaction with automatic commit/rollback handling.
   * @param <T> the return type of the action
   * @param action the action to execute
   * @param logger the logger for error logging
   * @param errorMessage the error message prefix for logging
   * @return the result of the action
   * @throws SQLException if a database error occurs
   */
  static <T> T executeInTransaction(TransactionAction<T> action, Logger logger, String errorMessage)
    throws SQLException {
    Connection conn = null;
    try {
      conn = DatabaseConfig.getDataSource().getConnection();
      conn.setAutoCommit(false);
      T result = action.execute(conn);
      conn.commit();
      return result;
    } catch (SQLException e) {
      if (conn != null) {
        try {
          conn.rollback();
        } catch (SQLException ex) {
          logger.error("Failed to rollback transaction: {}", ex.getMessage(), ex);
        }
      }
      logger.error("{}: {}", errorMessage, e.getMessage(), e);
      throw e;
    } finally {
      if (conn != null) {
        try {
          conn.setAutoCommit(true);
          conn.close();
        } catch (SQLException e) {
          logger.error("Failed to close connection: {}", e.getMessage(), e);
        }
      }
    }
  }
}
