package hrms.bhel.client.controller;

import hrms.bhel.client.exception.ServiceCommunicationException;
import hrms.bhel.common.service.ReportService;
import java.rmi.RemoteException;
import java.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for PDF report generation.
 * Provides endpoints for generating employee, department,
 * and organization-wide leave reports.
 */
@RestController
@RequestMapping("/api/reports")
public class ReportController {

  private static final Logger logger = LoggerFactory.getLogger(ReportController.class);

  @Autowired
  @org.springframework.context.annotation.Lazy
  private ReportService reportService;

  @GetMapping("/employee/{id}/yearly")
  public ResponseEntity<byte[]> generateEmployeeReport(
    @PathVariable("id") Long employeeId,
    @RequestParam(required = false) Integer year
  ) {
    try {
      int reportYear = (year != null) ? year : LocalDate.now().getYear();
      logger.info("Generating yearly report for employee ID: {}, year: {}", employeeId, reportYear);
      byte[] pdfBytes = reportService.generateYearlyEmployeeReport(employeeId, reportYear);
      logger.info(
        "Successfully generated employee report for ID: {}, year: {}, size: {} bytes",
        employeeId,
        reportYear,
        pdfBytes.length
      );
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_PDF);
      headers.setContentDispositionFormData(
        "attachment",
        String.format("employee_%d_report_%d.pdf", employeeId, reportYear)
      );
      headers.setContentLength(pdfBytes.length);
      return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    } catch (RemoteException e) {
      logger.error("RMI error generating employee report for ID: {}, year: {}", employeeId, year, e);
      throw new ServiceCommunicationException("Failed to generate employee report", e);
    }
  }

  @GetMapping("/department/{dept}/yearly")
  public ResponseEntity<byte[]> generateDepartmentReport(
    @PathVariable("dept") String department,
    @RequestParam(required = false) Integer year
  ) {
    try {
      int reportYear = (year != null) ? year : LocalDate.now().getYear();
      logger.info("Generating department report for: {}, year: {}", department, reportYear);
      byte[] pdfBytes = reportService.generateDepartmentReport(department, reportYear);
      logger.info(
        "Successfully generated department report for: {}, year: {}, size: {} bytes",
        department,
        reportYear,
        pdfBytes.length
      );
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_PDF);
      headers.setContentDispositionFormData(
        "attachment",
        String.format("department_%s_report_%d.pdf", department.toLowerCase().replace(" ", "_"), reportYear)
      );
      headers.setContentLength(pdfBytes.length);
      return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    } catch (RemoteException e) {
      logger.error("RMI error generating department report for: {}, year: {}", department, year, e);
      throw new ServiceCommunicationException("Failed to generate department report", e);
    }
  }

  @GetMapping("/leave/yearly")
  public ResponseEntity<byte[]> generateLeaveReport(@RequestParam(required = false) Integer year) {
    try {
      int reportYear = (year != null) ? year : LocalDate.now().getYear();
      logger.info("Generating organization-wide leave report for year: {}", reportYear);
      byte[] pdfBytes = reportService.generateLeaveReport(reportYear);
      logger.info("Successfully generated leave report for year: {}, size: {} bytes", reportYear, pdfBytes.length);
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_PDF);
      headers.setContentDispositionFormData("attachment", String.format("leave_report_%d.pdf", reportYear));
      headers.setContentLength(pdfBytes.length);
      return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    } catch (RemoteException e) {
      logger.error("RMI error generating leave report for year: {}", year, e);
      throw new ServiceCommunicationException("Failed to generate leave report", e);
    }
  }
}
