package hrms.bhel.common.service;

import hrms.bhel.common.dto.*;
import java.rmi.Remote;
import java.rmi.RemoteException;
import java.util.List;

/**
 * Remote service interface for leave management operations.
 * Provides methods for leave applications, approvals, rejections, and balance inquiries.
 */
public interface LeaveService extends Remote {
  /**
   * Retrieves leave balances for an employee for a specific year.
   * @param employeeId the employee ID
   * @param year the calendar year
   * @return list of leave balances for different leave types
   * @throws RemoteException if a remote communication error occurs
   */
  List<LeaveBalance> getLeaveBalance(Long employeeId, int year) throws RemoteException;

  /**
   * Submits a new leave application.
   * @param request the leave request details
   * @return the created LeaveApplication with generated ID and PENDING status
   * @throws RemoteException if a remote communication error occurs
   */
  LeaveApplication applyForLeave(LeaveRequest request) throws RemoteException;

  /**
   * Retrieves the current status of a leave application.
   * @param applicationId the leave application ID
   * @return the LeaveApplication with current status
   * @throws RemoteException if a remote communication error occurs
   */
  LeaveApplication getLeaveApplicationStatus(Long applicationId) throws RemoteException;

  /**
   * Retrieves leave application history for an employee in a specific year.
   * @param employeeId the employee ID
   * @param year the calendar year
   * @return list of leave applications submitted by the employee
   * @throws RemoteException if a remote communication error occurs
   */
  List<LeaveApplication> getEmployeeLeaveHistory(Long employeeId, int year) throws RemoteException;

  /**
   * Retrieves all pending leave applications awaiting approval.
   * @return list of pending leave applications
   * @throws RemoteException if a remote communication error occurs
   */
  List<LeaveApplication> getPendingApplications() throws RemoteException;

  /**
   * Approves a pending leave application.
   * @param applicationId the leave application ID
   * @param approverId the ID of the approving hr
   * @param comments optional approval comments
   * @return true if the approval was successful
   * @throws RemoteException if a remote communication error occurs
   */
  boolean approveLeave(Long applicationId, Long approverId, String comments) throws RemoteException;

  /**
   * Rejects a pending leave application.
   * @param applicationId the leave application ID
   * @param approverId the ID of the rejecting hr
   * @param reason the reason for rejection
   * @return true if the rejection was successful
   * @throws RemoteException if a remote communication error occurs
   */
  boolean rejectLeave(Long applicationId, Long approverId, String reason) throws RemoteException;

  /**
   * Cancels a leave application.
   * @param applicationId the leave application ID to cancel
   * @return true if the cancellation was successful
   * @throws RemoteException if a remote communication error occurs
   */
  boolean cancelLeave(Long applicationId) throws RemoteException;
}
