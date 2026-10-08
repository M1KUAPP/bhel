package hrms.bhel.client.controller;

import hrms.bhel.client.dto.*;
import hrms.bhel.client.exception.ServiceCommunicationException;
import hrms.bhel.client.security.JwtUtil;
import hrms.bhel.common.dto.*;
import hrms.bhel.common.service.LeaveService;
import jakarta.validation.Valid;
import java.rmi.RemoteException;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for leave management operations.
 * Provides endpoints for leave balance queries, application submission,
 * approval/rejection workflows, and leave history retrieval.
 */
@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

  private static final Logger logger = LoggerFactory.getLogger(LeaveController.class);

  @Autowired
  private LeaveService leaveService;

  @Autowired
  private JwtUtil jwtUtil;

  @GetMapping("/balance/{employeeId}")
  public ResponseEntity<List<LeaveBalanceDTO>> getLeaveBalance(
    @PathVariable Long employeeId,
    @RequestParam(required = false) Integer year
  ) {
    try {
      int queryYear = (year != null) ? year : Year.now().getValue();
      logger.info("Fetching leave balance for employee ID: {}, year: {}", employeeId, queryYear);
      List<LeaveBalance> balances = leaveService.getLeaveBalance(employeeId, queryYear);
      List<LeaveBalanceDTO> dtos = balances.stream().map(this::convertToBalanceDTO).collect(Collectors.toList());
      logger.info("Retrieved {} leave balance records for employee ID: {}", dtos.size(), employeeId);
      return ResponseEntity.ok(dtos);
    } catch (RemoteException e) {
      logger.error("RMI error fetching leave balance for employee ID: {}", employeeId, e);
      throw new ServiceCommunicationException("Failed to fetch leave balance", e);
    }
  }

  @PostMapping
  public ResponseEntity<LeaveApplicationDTO> applyLeave(@Valid @RequestBody LeaveRequestDTO dto) {
    try {
      logger.info(
        "Applying leave for employee ID: {}, type: {}, from {} to {}",
        dto.getEmployeeId(),
        dto.getLeaveType(),
        dto.getStartDate(),
        dto.getEndDate()
      );
      LeaveRequest request = convertToLeaveRequest(dto);
      LeaveApplication application = leaveService.applyForLeave(request);
      logger.info("Leave application created with ID: {}", application.getId());
      return ResponseEntity.status(HttpStatus.CREATED).body(convertToApplicationDTO(application));
    } catch (RemoteException e) {
      String errorMessage = extractBusinessErrorMessage(e);
      if (errorMessage != null) {
        logger.warn("Business logic error applying for leave: {}", errorMessage);
        throw new IllegalArgumentException(errorMessage);
      }
      logger.error("RMI error applying for leave for employee ID: {}", dto.getEmployeeId(), e);
      throw new ServiceCommunicationException("Failed to apply for leave", e);
    }
  }

  private String extractBusinessErrorMessage(RemoteException e) {
    String message = e.getMessage();
    if (message == null) {
      return null;
    }
    if (message.contains("No leave balance found")) {
      if (message.contains("in year")) {
        return "Leave balance for the requested year has not been allocated yet. Please contact HR.";
      }
      return "No leave balance found. Please contact HR.";
    }
    if (message.contains("Insufficient leave balance")) {
      return message;
    }
    if (message.contains("overlaps with existing")) {
      return "The requested dates overlap with an existing leave application.";
    }
    if (message.contains("0 working days") || message.contains("weekends/holidays only")) {
      return "Cannot apply for leave on weekends only. Please select at least one working day.";
    }
    if (message.contains("cannot span multiple years")) {
      return "Leave application cannot span multiple years. Please submit separate applications for each year.";
    }
    if (message.contains("Invalid leave") || message.contains("cannot be")) {
      return message;
    }
    return null;
  }

  @GetMapping("/{applicationId}/status")
  public ResponseEntity<LeaveApplicationDTO> getLeaveStatus(@PathVariable Long applicationId) {
    try {
      logger.info("Fetching leave application status for ID: {}", applicationId);
      LeaveApplication application = leaveService.getLeaveApplicationStatus(applicationId);
      if (application == null) {
        logger.warn("Leave application not found with ID: {}", applicationId);
        throw new hrms.bhel.client.exception.ResourceNotFoundException(
          "Leave application not found with ID: " + applicationId
        );
      }
      logger.info("Leave application found with status: {}", application.getStatus());
      return ResponseEntity.ok(convertToApplicationDTO(application));
    } catch (RemoteException e) {
      logger.error("RMI error fetching leave application status for ID: {}", applicationId, e);
      throw new ServiceCommunicationException("Failed to fetch leave status", e);
    }
  }

  @GetMapping("/employee/{employeeId}")
  public ResponseEntity<List<LeaveApplicationDTO>> getLeaveHistory(
    @PathVariable Long employeeId,
    @RequestParam(required = false) Integer year
  ) {
    try {
      int queryYear = (year != null) ? year : Year.now().getValue();
      logger.info("Fetching leave history for employee ID: {}, year: {}", employeeId, queryYear);
      List<LeaveApplication> applications = leaveService.getEmployeeLeaveHistory(employeeId, queryYear);
      List<LeaveApplicationDTO> dtos = applications
        .stream()
        .map(this::convertToApplicationDTO)
        .collect(Collectors.toList());
      logger.info("Retrieved {} leave applications for employee ID: {}", dtos.size(), employeeId);
      return ResponseEntity.ok(dtos);
    } catch (RemoteException e) {
      logger.error("RMI error fetching leave history for employee ID: {}", employeeId, e);
      throw new ServiceCommunicationException("Failed to fetch leave history", e);
    }
  }

  @GetMapping("/pending")
  public ResponseEntity<List<LeaveApplicationDTO>> getPendingApplications() {
    try {
      logger.info("Fetching all pending leave applications");
      List<LeaveApplication> applications = leaveService.getPendingApplications();
      List<LeaveApplicationDTO> dtos = applications
        .stream()
        .map(this::convertToApplicationDTO)
        .collect(Collectors.toList());
      logger.info("Retrieved {} pending leave applications", dtos.size());
      return ResponseEntity.ok(dtos);
    } catch (RemoteException e) {
      logger.error("RMI error fetching pending leave applications", e);
      throw new ServiceCommunicationException("Failed to fetch pending applications", e);
    }
  }

  @PostMapping("/{applicationId}/approve")
  public ResponseEntity<Void> approveLeave(
    @PathVariable Long applicationId,
    @RequestBody(required = false) LeaveApprovalRequest request,
    @RequestHeader("Authorization") String authHeader
  ) {
    try {
      String token = authHeader.substring(7);
      Long approverId = getEmployeeIdFromToken(token);
      String comments = request != null ? request.getComments() : null;
      logger.info("Approving leave application ID: {} by approver ID: {}", applicationId, approverId);
      boolean success = leaveService.approveLeave(applicationId, approverId, comments);
      if (success) {
        logger.info("Leave application approved successfully, ID: {}", applicationId);
        return ResponseEntity.ok().build();
      } else {
        logger.warn("Failed to approve leave application, ID: {}", applicationId);
        return ResponseEntity.badRequest().build();
      }
    } catch (RemoteException e) {
      logger.error("RMI error approving leave application ID: {}", applicationId, e);
      throw new ServiceCommunicationException("Failed to approve leave", e);
    }
  }

  @PostMapping("/{applicationId}/reject")
  public ResponseEntity<Void> rejectLeave(
    @PathVariable Long applicationId,
    @RequestBody(required = false) LeaveApprovalRequest request,
    @RequestHeader("Authorization") String authHeader
  ) {
    try {
      String token = authHeader.substring(7);
      Long approverId = getEmployeeIdFromToken(token);
      String reason = request != null ? request.getComments() : null;
      logger.info("Rejecting leave application ID: {} by approver ID: {}", applicationId, approverId);
      boolean success = leaveService.rejectLeave(applicationId, approverId, reason);
      if (success) {
        logger.info("Leave application rejected successfully, ID: {}", applicationId);
        return ResponseEntity.ok().build();
      } else {
        logger.warn("Failed to reject leave application, ID: {}", applicationId);
        return ResponseEntity.badRequest().build();
      }
    } catch (RemoteException e) {
      logger.error("RMI error rejecting leave application ID: {}", applicationId, e);
      throw new ServiceCommunicationException("Failed to reject leave", e);
    }
  }

  @PostMapping("/{applicationId}/cancel")
  public ResponseEntity<Void> cancelLeave(@PathVariable Long applicationId) {
    try {
      logger.info("Cancelling leave application ID: {}", applicationId);
      boolean success = leaveService.cancelLeave(applicationId);
      if (success) {
        logger.info("Leave application cancelled successfully, ID: {}", applicationId);
        return ResponseEntity.ok().build();
      } else {
        logger.warn("Failed to cancel leave application, ID: {}", applicationId);
        return ResponseEntity.badRequest().build();
      }
    } catch (RemoteException e) {
      logger.error("RMI error cancelling leave application ID: {}", applicationId, e);
      throw new ServiceCommunicationException("Failed to cancel leave", e);
    }
  }

  private LeaveBalanceDTO convertToBalanceDTO(LeaveBalance balance) {
    LeaveBalanceDTO dto = new LeaveBalanceDTO();
    dto.setId(balance.getId());
    dto.setEmployeeId(balance.getEmployeeId());
    dto.setYear(balance.getYear());
    dto.setLeaveTypeName(balance.getLeaveTypeName());
    dto.setTotalDays(balance.getTotalDays() != null ? balance.getTotalDays().intValue() : 0);
    dto.setUsedDays(balance.getUsedDays() != null ? balance.getUsedDays().intValue() : 0);
    dto.setRemainingDays(balance.getRemainingDays() != null ? balance.getRemainingDays().intValue() : 0);
    return dto;
  }

  private LeaveRequest convertToLeaveRequest(LeaveRequestDTO dto) {
    LeaveRequest request = new LeaveRequest();
    request.setEmployeeId(dto.getEmployeeId());
    request.setLeaveTypeId(mapLeaveTypeToId(dto.getLeaveType()));
    java.time.LocalDate startDate = dto.getStartDate();
    java.time.LocalDate endDate = dto.getEndDate();
    request.setStartDate(java.sql.Date.valueOf(startDate));
    request.setEndDate(java.sql.Date.valueOf(endDate));
    long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
    request.setTotalDays(java.math.BigDecimal.valueOf(daysBetween));
    request.setReason(dto.getReason());
    return request;
  }

  private LeaveApplicationDTO convertToApplicationDTO(LeaveApplication application) {
    LeaveApplicationDTO dto = new LeaveApplicationDTO();
    dto.setId(application.getId());
    dto.setEmployeeId(application.getEmployeeId());
    dto.setLeaveTypeName(application.getLeaveTypeName());
    dto.setStartDate(application.getStartDate());
    dto.setEndDate(application.getEndDate());
    dto.setTotalDays(application.getTotalDays() != null ? application.getTotalDays().intValue() : 0);
    dto.setReason(application.getReason());
    dto.setStatus(application.getStatus());
    dto.setAppliedDate(application.getAppliedDate());
    dto.setApprovedBy(application.getApprovedBy());
    dto.setApprovedByName(application.getApproverName());
    dto.setApproverComments(application.getHRComments());
    dto.setApprovedRejectedDate(application.getApprovedDate());
    return dto;
  }

  private Long mapLeaveTypeToId(String leaveType) {
    switch (leaveType) {
      case "annual_leave":
        return 1L;
      case "sick_leave":
        return 2L;
      case "emergency_leave":
        return 3L;
      case "maternity_leave":
        return 4L;
      case "paternity_leave":
        return 5L;
      default:
        throw new IllegalArgumentException("Unknown leave type: " + leaveType);
    }
  }

  private Long getEmployeeIdFromToken(String token) {
    return jwtUtil.getEmployeeIdFromToken(token);
  }
}
