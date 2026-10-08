package hrms.bhel.common.service;

import hrms.bhel.common.dto.EmployeeReportData;
import java.rmi.Remote;
import java.rmi.RemoteException;
import java.util.List;

/**
 * Remote service interface for report generation operations.
 * Provides methods for generating employee, department, and leave reports.
 */
public interface ReportService extends Remote {
  /**
   * Generates a yearly employee report as a PDF document.
   * @param employeeId the employee ID
   * @param year the report year
   * @return byte array containing the PDF document
   * @throws RemoteException if a remote communication error occurs
   */
  byte[] generateYearlyEmployeeReport(Long employeeId, int year) throws RemoteException;

  /**
   * Retrieves raw employee report data for custom report generation.
   * @param employeeId the employee ID
   * @param year the report year
   * @return list of employee report data including leave and family information
   * @throws RemoteException if a remote communication error occurs
   */
  List<EmployeeReportData> getEmployeeReportData(Long employeeId, int year) throws RemoteException;

  /**
   * Generates a department-wide report as a PDF document.
   * @param department the department name
   * @param year the report year
   * @return byte array containing the PDF document
   * @throws RemoteException if a remote communication error occurs
   */
  byte[] generateDepartmentReport(String department, int year) throws RemoteException;

  /**
   * Generates a company-wide leave utilization report as a PDF document.
   * @param year the report year
   * @return byte array containing the PDF document
   * @throws RemoteException if a remote communication error occurs
   */
  byte[] generateLeaveReport(int year) throws RemoteException;
}
