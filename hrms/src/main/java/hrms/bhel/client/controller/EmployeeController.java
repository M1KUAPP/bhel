package hrms.bhel.client.controller;

import hrms.bhel.client.dto.*;
import hrms.bhel.client.exception.RmiExceptionUtils;
import hrms.bhel.client.exception.ServiceCommunicationException;
import hrms.bhel.common.dto.*;
import hrms.bhel.common.service.EmployeeService;
import jakarta.validation.Valid;
import java.rmi.RemoteException;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for employee management operations.
 * Provides endpoints for employee registration, retrieval,
 * profile updates, and family details management.
 */
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

  private static final Logger logger = LoggerFactory.getLogger(EmployeeController.class);

  @Autowired
  private EmployeeService employeeService;

  @PostMapping
  public ResponseEntity<EmployeeDTO> registerEmployee(@Valid @RequestBody EmployeeRegistrationDTO dto) {
    try {
      logger.info("Registering employee: {} {}", dto.getFirstName(), dto.getLastName());
      EmployeeRegistration registration = convertToRegistration(dto);
      Employee employee = employeeService.registerEmployee(registration);
      logger.info("Employee registered successfully with ID: {}", employee.getId());
      return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(employee));
    } catch (RemoteException e) {
      RmiExceptionUtils.handleDuplicateEmployee(e, logger);
      logger.error("RMI error registering employee", e);
      throw new ServiceCommunicationException("Failed to register employee", e);
    }
  }

  @GetMapping
  public ResponseEntity<List<EmployeeDTO>> getAllEmployees() {
    try {
      logger.info("Fetching all employees");
      List<Employee> employees = employeeService.getAllEmployees();
      List<EmployeeDTO> dtos = employees.stream().map(this::convertToDTO).collect(Collectors.toList());
      logger.info("Retrieved {} employees", dtos.size());
      return ResponseEntity.ok(dtos);
    } catch (RemoteException e) {
      logger.error("RMI error fetching employees", e);
      throw new ServiceCommunicationException("Failed to fetch employees", e);
    }
  }

  @GetMapping("/{id}")
  public ResponseEntity<EmployeeDTO> getEmployee(@PathVariable Long id) {
    try {
      logger.info("Fetching employee with ID: {}", id);
      Employee employee = employeeService.getEmployeeById(id);
      if (employee == null) {
        logger.warn("Employee not found with ID: {}", id);
        throw new hrms.bhel.client.exception.ResourceNotFoundException("Employee not found with ID: " + id);
      }
      logger.info("Employee found: {} {}", employee.getFirstName(), employee.getLastName());
      return ResponseEntity.ok(convertToDTO(employee));
    } catch (RemoteException e) {
      logger.error("RMI error fetching employee: {}", id, e);
      throw new ServiceCommunicationException("Failed to fetch employee", e);
    }
  }

  @PutMapping("/{id}/profile")
  public ResponseEntity<Void> updateProfile(@PathVariable Long id, @Valid @RequestBody ProfileUpdateDTO dto) {
    try {
      logger.info("Updating profile for employee ID: {}", id);
      ProfileUpdate update = convertToProfileUpdate(dto);
      boolean success = employeeService.updateEmployeeProfile(id, update);
      if (!success) {
        logger.warn("Employee not found for profile update, ID: {}", id);
        throw new hrms.bhel.client.exception.ResourceNotFoundException("Employee not found with ID: " + id);
      }
      logger.info("Employee profile updated successfully for ID: {}", id);
      return ResponseEntity.ok().build();
    } catch (RemoteException e) {
      RmiExceptionUtils.handleEmployeeNotFound(e, logger);
      RmiExceptionUtils.handleDuplicateEmployee(e, logger);
      logger.error("RMI error updating profile for employee ID: {}", id, e);
      throw new ServiceCommunicationException("Failed to update profile", e);
    }
  }

  @GetMapping("/{id}/family")
  public ResponseEntity<List<FamilyMemberDTO>> getFamilyDetails(@PathVariable Long id) {
    try {
      logger.info("Fetching family details for employee ID: {}", id);
      List<FamilyMember> members = employeeService.getFamilyDetails(id);
      List<FamilyMemberDTO> dtos = members.stream().map(this::convertToFamilyDTO).collect(Collectors.toList());
      logger.info("Retrieved {} family members for employee ID: {}", dtos.size(), id);
      return ResponseEntity.ok(dtos);
    } catch (RemoteException e) {
      logger.error("RMI error fetching family details for employee ID: {}", id, e);
      throw new ServiceCommunicationException("Failed to fetch family details", e);
    }
  }

  @PutMapping("/{id}/family")
  public ResponseEntity<Void> updateFamilyDetails(
    @PathVariable Long id,
    @Valid @RequestBody List<FamilyMemberDTO> dtos
  ) {
    try {
      logger.info("Updating family details for employee ID: {}", id);
      List<FamilyMember> members = dtos.stream().map(this::convertToFamilyMember).collect(Collectors.toList());
      boolean success = employeeService.updateFamilyDetails(id, members);
      if (success) {
        logger.info("Family details updated successfully for employee ID: {}", id);
        return ResponseEntity.ok().build();
      } else {
        logger.warn("Failed to update family details for employee ID: {}", id);
        return ResponseEntity.badRequest().build();
      }
    } catch (RemoteException e) {
      logger.error("RMI error updating family details for employee ID: {}", id, e);
      throw new ServiceCommunicationException("Failed to update family details", e);
    }
  }

  private EmployeeRegistration convertToRegistration(EmployeeRegistrationDTO dto) {
    EmployeeRegistration reg = new EmployeeRegistration();
    reg.setFirstName(dto.getFirstName());
    reg.setLastName(dto.getLastName());
    reg.setIcPassportNumber(dto.getIcPassportNumber());
    reg.setEmail(dto.getEmail());
    reg.setPhone(dto.getPhone());
    reg.setDepartment(dto.getDepartment());
    reg.setPosition(dto.getPosition());
    reg.setHireDate(dto.getHireDate());
    return reg;
  }

  private EmployeeDTO convertToDTO(Employee employee) {
    EmployeeDTO dto = new EmployeeDTO();
    dto.setId(employee.getId());
    dto.setFirstName(employee.getFirstName());
    dto.setLastName(employee.getLastName());
    dto.setIcPassportNumber(employee.getIcPassportNumber());
    dto.setEmail(employee.getEmail());
    dto.setPhone(employee.getPhone());
    dto.setDepartment(employee.getDepartment());
    dto.setPosition(employee.getPosition());
    dto.setHireDate(employee.getHireDate());
    dto.setStatus(employee.getStatus());
    dto.setCreatedAt(employee.getCreatedAt());
    dto.setUpdatedAt(employee.getUpdatedAt());
    return dto;
  }

  private ProfileUpdate convertToProfileUpdate(ProfileUpdateDTO dto) {
    ProfileUpdate update = new ProfileUpdate();
    update.setFirstName(dto.getFirstName());
    update.setLastName(dto.getLastName());
    update.setEmail(dto.getEmail());
    update.setIcPassportNumber(dto.getIcPassportNumber());
    update.setPhone(dto.getPhone());
    update.setDepartment(dto.getDepartment());
    update.setPosition(dto.getPosition());
    update.setHireDate(dto.getHireDate());
    update.setStatus(dto.getStatus());
    return update;
  }

  private FamilyMemberDTO convertToFamilyDTO(FamilyMember member) {
    FamilyMemberDTO dto = new FamilyMemberDTO();
    dto.setId(member.getId());
    dto.setEmployeeId(member.getEmployeeId());
    dto.setName(member.getName());
    dto.setRelationship(member.getRelationship());
    dto.setDateOfBirth(member.getDateOfBirth());
    dto.setContactNumber(member.getContactNumber());
    return dto;
  }

  private FamilyMember convertToFamilyMember(FamilyMemberDTO dto) {
    FamilyMember member = new FamilyMember();
    member.setId(dto.getId());
    member.setEmployeeId(dto.getEmployeeId());
    member.setName(dto.getName());
    member.setRelationship(dto.getRelationship());
    member.setDateOfBirth(dto.getDateOfBirth());
    member.setContactNumber(dto.getContactNumber());
    return member;
  }
}
