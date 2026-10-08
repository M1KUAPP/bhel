package hrms.bhel.server.dao;

import hrms.bhel.common.dto.FamilyMember;
import hrms.bhel.server.config.DatabaseConfig;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Data Access Object for family member database operations.
 * Provides CRUD operations for the family_details table.
 */
public class FamilyDAO {

  private static final Logger logger = LoggerFactory.getLogger(FamilyDAO.class);

  /**
   * Creates a new family member record.
   * @param familyMember the family member data
   * @return the generated family member ID
   * @throws SQLException if a database error occurs
   */
  public Long create(FamilyMember familyMember) throws SQLException {
    String sql =
      "INSERT INTO family_details (employee_id, name, relationship, " +
      "date_of_birth, contact_number) " +
      "VALUES (?, ?, ?, ?, ?) RETURNING id";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setLong(1, familyMember.getEmployeeId());
      pstmt.setString(2, familyMember.getName());
      pstmt.setString(3, familyMember.getRelationship());
      if (familyMember.getDateOfBirth() != null) {
        pstmt.setDate(4, new java.sql.Date(familyMember.getDateOfBirth().getTime()));
      } else {
        pstmt.setNull(4, Types.DATE);
      }
      pstmt.setString(5, familyMember.getContactNumber());
      ResultSet rs = pstmt.executeQuery();
      if (rs.next()) {
        Long id = rs.getLong("id");
        logger.info(
          "Family member created successfully with ID: {} for employee ID: {}",
          id,
          familyMember.getEmployeeId()
        );
        return id;
      }
      throw new SQLException("Family member creation failed, no ID obtained");
    } catch (SQLException e) {
      logger.error(
        "Failed to create family member for employee {}: {}",
        familyMember.getEmployeeId(),
        e.getMessage(),
        e
      );
      throw e;
    }
  }

  /**
   * Finds all family members for an employee.
   * @param employeeId the employee ID
   * @return list of family members
   * @throws SQLException if a database error occurs
   */
  public List<FamilyMember> findByEmployeeId(Long employeeId) throws SQLException {
    String sql = "SELECT * FROM family_details WHERE employee_id = ? ORDER BY id";
    List<FamilyMember> familyMembers = new ArrayList<>();
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setLong(1, employeeId);
      ResultSet rs = pstmt.executeQuery();
      while (rs.next()) {
        familyMembers.add(mapFamilyMember(rs));
      }
      logger.debug("Retrieved {} family members for employee ID: {}", familyMembers.size(), employeeId);
      return familyMembers;
    } catch (SQLException e) {
      logger.error("Failed to retrieve family members for employee {}: {}", employeeId, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Updates an existing family member record.
   * @param id the family member ID
   * @param familyMember the updated data
   * @return true if update was successful
   * @throws SQLException if a database error occurs
   */
  public boolean update(Long id, FamilyMember familyMember) throws SQLException {
    String sql =
      "UPDATE family_details SET name = ?, relationship = ?, " +
      "date_of_birth = ?, contact_number = ? " +
      "WHERE id = ?";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setString(1, familyMember.getName());
      pstmt.setString(2, familyMember.getRelationship());
      if (familyMember.getDateOfBirth() != null) {
        pstmt.setDate(3, new java.sql.Date(familyMember.getDateOfBirth().getTime()));
      } else {
        pstmt.setNull(3, Types.DATE);
      }
      pstmt.setString(4, familyMember.getContactNumber());
      pstmt.setLong(5, id);
      int rowsAffected = pstmt.executeUpdate();
      boolean success = rowsAffected > 0;
      if (success) {
        logger.info("Family member {} updated successfully, rows affected: {}", id, rowsAffected);
      } else {
        logger.warn("Family member {} not found for update", id);
      }
      return success;
    } catch (SQLException e) {
      logger.error("Failed to update family member {}: {}", id, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Deletes all family members for an employee.
   * @param employeeId the employee ID
   * @return number of rows deleted
   * @throws SQLException if a database error occurs
   */
  public int deleteByEmployeeId(Long employeeId) throws SQLException {
    String sql = "DELETE FROM family_details WHERE employee_id = ?";
    try (
      Connection conn = DatabaseConfig.getDataSource().getConnection();
      PreparedStatement pstmt = conn.prepareStatement(sql)
    ) {
      pstmt.setLong(1, employeeId);
      int rowsAffected = pstmt.executeUpdate();
      logger.info("Deleted {} family member(s) for employee ID: {}", rowsAffected, employeeId);
      return rowsAffected;
    } catch (SQLException e) {
      logger.error("Failed to delete family members for employee {}: {}", employeeId, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Maps a ResultSet row to FamilyMember.
   * @param rs the result set positioned at the row
   * @return the mapped FamilyMember
   * @throws SQLException if a database error occurs
   */
  private FamilyMember mapFamilyMember(ResultSet rs) throws SQLException {
    FamilyMember member = new FamilyMember();
    member.setId(rs.getLong("id"));
    member.setEmployeeId(rs.getLong("employee_id"));
    member.setName(rs.getString("name"));
    member.setRelationship(rs.getString("relationship"));
    member.setDateOfBirth(rs.getDate("date_of_birth"));
    member.setContactNumber(rs.getString("contact_number"));
    return member;
  }
}
