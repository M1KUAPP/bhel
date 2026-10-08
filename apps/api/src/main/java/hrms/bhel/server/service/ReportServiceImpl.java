package hrms.bhel.server.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.events.Event;
import com.itextpdf.kernel.events.IEventHandler;
import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.layout.Canvas;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import hrms.bhel.common.dto.*;
import hrms.bhel.common.exception.EmployeeNotFoundException;
import hrms.bhel.common.service.ReportService;
import hrms.bhel.server.dao.EmployeeDAO;
import hrms.bhel.server.dao.FamilyDAO;
import hrms.bhel.server.dao.LeaveDAO;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * RMI service implementation for report generation.
 * Generates PDF reports for employees, departments, and organization-wide leave statistics
 * using iText PDF library with styled tables and consistent branding.
 */
public class ReportServiceImpl extends UnicastRemoteObject implements ReportService {

  private static final Logger logger = LoggerFactory.getLogger(ReportServiceImpl.class);
  private static final Color PRIMARY_COLOR = new DeviceRgb(0, 51, 102);
  private static final Color HEADER_BG_COLOR = new DeviceRgb(240, 244, 248);
  private static final Color BORDER_COLOR = new DeviceRgb(200, 200, 200);
  private static final Color SECTION_BG_COLOR = new DeviceRgb(248, 249, 250);
  private static final float THIN_BORDER = 0.5f;
  private static final Color STATUS_APPROVED_COLOR = new DeviceRgb(34, 139, 34);
  private static final Color STATUS_PENDING_COLOR = new DeviceRgb(218, 165, 32);
  private static final Color STATUS_REJECTED_COLOR = new DeviceRgb(178, 34, 34);
  private final EmployeeDAO employeeDAO;
  private final FamilyDAO familyDAO;
  private final LeaveDAO leaveDAO;

  /**
   * Constructs a new ReportServiceImpl with required DAOs.
   * @param employeeDAO the employee data access object
   * @param familyDAO the family data access object
   * @param leaveDAO the leave data access object
   * @throws RemoteException if RMI export fails
   */
  public ReportServiceImpl(EmployeeDAO employeeDAO, FamilyDAO familyDAO, LeaveDAO leaveDAO) throws RemoteException {
    super(0);
    this.employeeDAO = employeeDAO;
    this.familyDAO = familyDAO;
    this.leaveDAO = leaveDAO;
    logger.info("ReportServiceImpl initialized successfully");
  }

  @Override
  public byte[] generateYearlyEmployeeReport(Long employeeId, int year) throws RemoteException {
    logger.info("Generating yearly report for employee ID: {} for year: {}", employeeId, year);
    try {
      List<EmployeeReportData> reportDataList = getEmployeeReportData(employeeId, year);
      if (reportDataList.isEmpty()) {
        throw new EmployeeNotFoundException("Employee not found with ID: " + employeeId);
      }
      EmployeeReportData reportData = reportDataList.get(0);
      ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
      PdfWriter writer = new PdfWriter(outputStream);
      PdfDocument pdfDoc = new PdfDocument(writer);
      Document document = new Document(pdfDoc, PageSize.A4);
      document.setMargins(70, 50, 70, 50);
      PdfFont helvetica = PdfFontFactory.createFont(StandardFonts.HELVETICA);
      PdfFont helveticaBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
      pdfDoc.addEventHandler(PdfDocumentEvent.END_PAGE, new HeaderFooterEventHandler(year, "Employee Yearly Report"));
      addReportHeader(document, "EMPLOYEE YEARLY REPORT", "Fiscal Year " + year, helvetica, helveticaBold);
      document.add(createSectionHeader("Profile", helveticaBold));
      Employee employee = reportData.getEmployee();
      Table empTable = createStyledKeyValueTable(new float[] { 35, 65 });
      addStyledKeyValueRow(empTable, "Employee ID", employee.getId().toString(), helvetica, helveticaBold);
      addStyledKeyValueRow(
        empTable,
        "Full Name",
        employee.getFirstName() + " " + employee.getLastName(),
        helvetica,
        helveticaBold
      );
      addStyledKeyValueRow(empTable, "IC/Passport", employee.getIcPassportNumber(), helvetica, helveticaBold);
      addStyledKeyValueRow(empTable, "Email", employee.getEmail(), helvetica, helveticaBold);
      addStyledKeyValueRow(empTable, "Phone", employee.getPhone(), helvetica, helveticaBold);
      addStyledKeyValueRow(empTable, "Department", employee.getDepartment(), helvetica, helveticaBold);
      addStyledKeyValueRow(empTable, "Position", employee.getPosition(), helvetica, helveticaBold);
      addStyledKeyValueRow(empTable, "Hire Date", formatDate(employee.getHireDate()), helvetica, helveticaBold);
      addStyledKeyValueRow(empTable, "Status", employee.getStatus(), helvetica, helveticaBold);
      document.add(empTable);
      document.add(createSectionSpacer());
      if (reportData.getFamilyMembers() != null && !reportData.getFamilyMembers().isEmpty()) {
        document.add(createSectionHeader("Family Details", helveticaBold));
        Table familyTable = createStyledDataTable(new float[] { 35, 30, 35 });
        addStyledHeaderCell(familyTable, "Name", helveticaBold);
        addStyledHeaderCell(familyTable, "Relationship", helveticaBold);
        addStyledHeaderCell(familyTable, "Date of Birth", helveticaBold);
        boolean alternate = false;
        for (FamilyMember member : reportData.getFamilyMembers()) {
          addStyledDataCell(familyTable, member.getName(), helvetica, alternate);
          addStyledDataCell(familyTable, member.getRelationship(), helvetica, alternate);
          addStyledDataCell(familyTable, formatDate(member.getDateOfBirth()), helvetica, alternate);
          alternate = !alternate;
        }
        document.add(familyTable);
        document.add(createSectionSpacer());
      }
      if (reportData.getLeaveBalances() != null && !reportData.getLeaveBalances().isEmpty()) {
        document.add(createSectionHeader("Leave Balance (" + year + ")", helveticaBold));
        Table leaveBalanceTable = createStyledDataTable(new float[] { 30, 20, 20, 30 });
        addStyledHeaderCell(leaveBalanceTable, "Leave Type", helveticaBold);
        addStyledHeaderCell(leaveBalanceTable, "Total Days", helveticaBold);
        addStyledHeaderCell(leaveBalanceTable, "Used Days", helveticaBold);
        addStyledHeaderCell(leaveBalanceTable, "Remaining Days", helveticaBold);
        boolean alternate = false;
        for (LeaveBalance balance : reportData.getLeaveBalances()) {
          BigDecimal totalDays = balance.getTotalDays() != null ? balance.getTotalDays() : BigDecimal.ZERO;
          BigDecimal usedDays = balance.getUsedDays() != null ? balance.getUsedDays() : BigDecimal.ZERO;
          int remaining = totalDays.intValue() - usedDays.intValue();
          addStyledDataCell(leaveBalanceTable, balance.getLeaveTypeName(), helvetica, alternate);
          addStyledDataCell(leaveBalanceTable, totalDays.toString(), helvetica, alternate, TextAlignment.CENTER);
          addStyledDataCell(leaveBalanceTable, usedDays.toString(), helvetica, alternate, TextAlignment.CENTER);
          addStyledDataCell(leaveBalanceTable, String.valueOf(remaining), helvetica, alternate, TextAlignment.CENTER);
          alternate = !alternate;
        }
        document.add(leaveBalanceTable);
        document.add(createSectionSpacer());
      }
      if (reportData.getLeaveApplications() != null && !reportData.getLeaveApplications().isEmpty()) {
        document.add(createSectionHeader("Leave History (" + year + ")", helveticaBold));
        Table leaveAppTable = createStyledDataTable(new float[] { 14, 14, 14, 8, 12, 14, 24 });
        addStyledHeaderCell(leaveAppTable, "Leave Type", helveticaBold);
        addStyledHeaderCell(leaveAppTable, "Start Date", helveticaBold);
        addStyledHeaderCell(leaveAppTable, "End Date", helveticaBold);
        addStyledHeaderCell(leaveAppTable, "Days", helveticaBold);
        addStyledHeaderCell(leaveAppTable, "Status", helveticaBold);
        addStyledHeaderCell(leaveAppTable, "Applied", helveticaBold);
        addStyledHeaderCell(leaveAppTable, "Reason", helveticaBold);
        boolean alternate = false;
        for (LeaveApplication app : reportData.getLeaveApplications()) {
          addStyledDataCell(leaveAppTable, app.getLeaveTypeName(), helvetica, alternate);
          addStyledDataCell(leaveAppTable, formatDate(app.getStartDate()), helvetica, alternate);
          addStyledDataCell(leaveAppTable, formatDate(app.getEndDate()), helvetica, alternate);
          addStyledDataCell(leaveAppTable, app.getTotalDays().toString(), helvetica, alternate, TextAlignment.CENTER);
          addStyledStatusCell(leaveAppTable, app.getStatus(), helvetica, alternate);
          addStyledDataCell(leaveAppTable, formatDate(app.getAppliedDate()), helvetica, alternate);
          addStyledDataCell(leaveAppTable, app.getReason() != null ? app.getReason() : "—", helvetica, alternate);
          alternate = !alternate;
        }
        document.add(leaveAppTable);
      }
      document.close();
      logger.info("Successfully generated yearly report for employee ID: {}", employeeId);
      return outputStream.toByteArray();
    } catch (EmployeeNotFoundException e) {
      logger.error("Employee not found: {}", e.getMessage());
      throw new RemoteException(e.getMessage(), e);
    } catch (Exception e) {
      String errorMsg = "Error generating yearly report for employee ID " + employeeId + ": " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public List<EmployeeReportData> getEmployeeReportData(Long employeeId, int year) throws RemoteException {
    logger.debug("Retrieving report data for employee ID: {} and year: {}", employeeId, year);
    try {
      Employee employee = employeeDAO.findById(employeeId);
      if (employee == null) {
        logger.warn("Employee not found with ID: {}", employeeId);
        return new ArrayList<>();
      }
      List<FamilyMember> familyMembers = familyDAO.findByEmployeeId(employeeId);
      List<LeaveBalance> leaveBalances = leaveDAO.findBalanceByEmployeeAndYear(employeeId, year);
      List<LeaveApplication> leaveApplications = leaveDAO.findApplicationsByEmployeeAndYear(employeeId, year);
      EmployeeReportData reportData = new EmployeeReportData();
      reportData.setEmployee(employee);
      reportData.setFamilyMembers(familyMembers);
      reportData.setLeaveBalances(leaveBalances);
      reportData.setLeaveApplications(leaveApplications);
      reportData.setReportYear(year);
      List<EmployeeReportData> result = new ArrayList<>();
      result.add(reportData);
      logger.info(
        "Retrieved report data for employee ID: {} - {} leave balances, {} applications",
        employeeId,
        leaveBalances.size(),
        leaveApplications.size()
      );
      return result;
    } catch (SQLException e) {
      String errorMsg =
        "Database error while retrieving report data for employee ID " + employeeId + ": " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public byte[] generateDepartmentReport(String department, int year) throws RemoteException {
    logger.info("Generating department report for: {} for year: {}", department, year);
    try {
      List<Employee> employees = employeeDAO.findByDepartment(department);
      if (employees.isEmpty()) {
        throw new RemoteException("No employees found in department: " + department);
      }
      ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
      PdfWriter writer = new PdfWriter(outputStream);
      PdfDocument pdfDoc = new PdfDocument(writer);
      Document document = new Document(pdfDoc, PageSize.A4);
      document.setMargins(70, 50, 70, 50);
      PdfFont helvetica = PdfFontFactory.createFont(StandardFonts.HELVETICA);
      PdfFont helveticaBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
      pdfDoc.addEventHandler(PdfDocumentEvent.END_PAGE, new HeaderFooterEventHandler(year, "Department Report"));
      addReportHeader(document, "DEPARTMENT REPORT", department + " — Fiscal Year " + year, helvetica, helveticaBold);
      document.add(createSectionHeader("Department Summary", helveticaBold));
      Table summaryTable = createStyledKeyValueTable(new float[] { 40, 60 });
      addStyledKeyValueRow(summaryTable, "Department", department, helvetica, helveticaBold);
      addStyledKeyValueRow(summaryTable, "Total Employees", String.valueOf(employees.size()), helvetica, helveticaBold);
      document.add(summaryTable);
      document.add(createSectionSpacer());
      document.add(createSectionHeader("Employee Leave Statistics", helveticaBold));
      Table empLeaveTable = createStyledDataTable(new float[] { 8, 25, 17, 15, 15, 20 });
      addStyledHeaderCell(empLeaveTable, "ID", helveticaBold);
      addStyledHeaderCell(empLeaveTable, "Name", helveticaBold);
      addStyledHeaderCell(empLeaveTable, "Position", helveticaBold);
      addStyledHeaderCell(empLeaveTable, "Total Leave", helveticaBold);
      addStyledHeaderCell(empLeaveTable, "Used Leave", helveticaBold);
      addStyledHeaderCell(empLeaveTable, "Pending Applications", helveticaBold);
      boolean alternate = false;
      for (Employee emp : employees) {
        List<LeaveBalance> balances = leaveDAO.findBalanceByEmployeeAndYear(emp.getId(), year);
        List<LeaveApplication> applications = leaveDAO.findApplicationsByEmployeeAndYear(emp.getId(), year);
        int totalLeave = balances
          .stream()
          .mapToInt(b -> b.getTotalDays() != null ? b.getTotalDays().intValue() : 0)
          .sum();
        int usedLeave = balances
          .stream()
          .mapToInt(b -> b.getUsedDays() != null ? b.getUsedDays().intValue() : 0)
          .sum();
        long pendingCount = applications
          .stream()
          .filter(a -> "pending".equalsIgnoreCase(a.getStatus()))
          .count();
        addStyledDataCell(empLeaveTable, emp.getId().toString(), helvetica, alternate, TextAlignment.CENTER);
        addStyledDataCell(empLeaveTable, emp.getFirstName() + " " + emp.getLastName(), helvetica, alternate);
        addStyledDataCell(empLeaveTable, emp.getPosition(), helvetica, alternate);
        addStyledDataCell(empLeaveTable, String.valueOf(totalLeave), helvetica, alternate, TextAlignment.CENTER);
        addStyledDataCell(empLeaveTable, String.valueOf(usedLeave), helvetica, alternate, TextAlignment.CENTER);
        addStyledDataCell(empLeaveTable, String.valueOf(pendingCount), helvetica, alternate, TextAlignment.CENTER);
        alternate = !alternate;
      }
      document.add(empLeaveTable);
      document.close();
      logger.info("Successfully generated department report for: {}", department);
      return outputStream.toByteArray();
    } catch (SQLException e) {
      String errorMsg = "Database error while generating department report for " + department + ": " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    } catch (Exception e) {
      String errorMsg = "Error generating department report for " + department + ": " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  @Override
  public byte[] generateLeaveReport(int year) throws RemoteException {
    logger.info("Generating organization-wide leave report for year: {}", year);
    try {
      List<Employee> allEmployees = employeeDAO.findAll();
      if (allEmployees.isEmpty()) {
        throw new RemoteException("No employees found in the system");
      }
      Map<String, DepartmentLeaveStats> departmentStats = new HashMap<>();
      for (Employee emp : allEmployees) {
        String dept = emp.getDepartment();
        departmentStats.putIfAbsent(dept, new DepartmentLeaveStats(dept));
        DepartmentLeaveStats stats = departmentStats.get(dept);
        stats.employeeCount++;
        List<LeaveBalance> balances = leaveDAO.findBalanceByEmployeeAndYear(emp.getId(), year);
        List<LeaveApplication> applications = leaveDAO.findApplicationsByEmployeeAndYear(emp.getId(), year);
        int totalLeave = balances
          .stream()
          .mapToInt(b -> b.getTotalDays() != null ? b.getTotalDays().intValue() : 0)
          .sum();
        int usedLeave = balances
          .stream()
          .mapToInt(b -> b.getUsedDays() != null ? b.getUsedDays().intValue() : 0)
          .sum();
        stats.totalLeave += totalLeave;
        stats.usedLeave += usedLeave;
        stats.approvedApplications += applications
          .stream()
          .filter(a -> "approved".equalsIgnoreCase(a.getStatus()))
          .count();
        stats.pendingApplications += applications
          .stream()
          .filter(a -> "pending".equalsIgnoreCase(a.getStatus()))
          .count();
        stats.rejectedApplications += applications
          .stream()
          .filter(a -> "rejected".equalsIgnoreCase(a.getStatus()))
          .count();
      }
      ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
      PdfWriter writer = new PdfWriter(outputStream);
      PdfDocument pdfDoc = new PdfDocument(writer);
      Document document = new Document(pdfDoc, PageSize.A4);
      document.setMargins(70, 50, 70, 50);
      PdfFont helvetica = PdfFontFactory.createFont(StandardFonts.HELVETICA);
      PdfFont helveticaBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
      pdfDoc.addEventHandler(
        PdfDocumentEvent.END_PAGE,
        new HeaderFooterEventHandler(year, "Organization Leave Report")
      );
      addReportHeader(document, "ORGANIZATION LEAVE REPORT", "Fiscal Year " + year, helvetica, helveticaBold);
      document.add(createSectionHeader("Overall Summary", helveticaBold));
      int totalEmployees = allEmployees.size();
      int totalDepartments = departmentStats.size();
      int orgTotalLeave = departmentStats
        .values()
        .stream()
        .mapToInt(s -> s.totalLeave)
        .sum();
      int orgUsedLeave = departmentStats
        .values()
        .stream()
        .mapToInt(s -> s.usedLeave)
        .sum();
      double utilizationRate = orgTotalLeave > 0 ? ((orgUsedLeave * 100.0) / orgTotalLeave) : 0;
      Table summaryTable = createStyledKeyValueTable(new float[] { 50, 50 });
      addStyledKeyValueRow(summaryTable, "Total Employees", String.valueOf(totalEmployees), helvetica, helveticaBold);
      addStyledKeyValueRow(
        summaryTable,
        "Total Departments",
        String.valueOf(totalDepartments),
        helvetica,
        helveticaBold
      );
      addStyledKeyValueRow(
        summaryTable,
        "Total Leave Days Allocated",
        String.valueOf(orgTotalLeave),
        helvetica,
        helveticaBold
      );
      addStyledKeyValueRow(
        summaryTable,
        "Total Leave Days Used",
        String.valueOf(orgUsedLeave),
        helvetica,
        helveticaBold
      );
      addStyledKeyValueRow(
        summaryTable,
        "Leave Utilization Rate",
        String.format("%.2f%%", utilizationRate),
        helvetica,
        helveticaBold
      );
      document.add(summaryTable);
      document.add(createSectionSpacer());
      document.add(createSectionHeader("Department-wise Leave Statistics", helveticaBold));
      Table deptTable = createStyledDataTable(new float[] { 18, 10, 12, 12, 12, 12, 12, 12 });
      addStyledHeaderCell(deptTable, "Department", helveticaBold);
      addStyledHeaderCell(deptTable, "Employees", helveticaBold);
      addStyledHeaderCell(deptTable, "Total Leave", helveticaBold);
      addStyledHeaderCell(deptTable, "Used Leave", helveticaBold);
      addStyledHeaderCell(deptTable, "Utilization", helveticaBold);
      addStyledHeaderCell(deptTable, "Approved", helveticaBold);
      addStyledHeaderCell(deptTable, "Pending", helveticaBold);
      addStyledHeaderCell(deptTable, "Rejected", helveticaBold);
      boolean alternate = false;
      for (DepartmentLeaveStats stats : departmentStats.values()) {
        double deptUtilization = stats.totalLeave > 0 ? ((stats.usedLeave * 100.0) / stats.totalLeave) : 0;
        addStyledDataCell(deptTable, stats.departmentName, helvetica, alternate);
        addStyledDataCell(deptTable, String.valueOf(stats.employeeCount), helvetica, alternate, TextAlignment.CENTER);
        addStyledDataCell(deptTable, String.valueOf(stats.totalLeave), helvetica, alternate, TextAlignment.CENTER);
        addStyledDataCell(deptTable, String.valueOf(stats.usedLeave), helvetica, alternate, TextAlignment.CENTER);
        addStyledDataCell(
          deptTable,
          String.format("%.1f%%", deptUtilization),
          helvetica,
          alternate,
          TextAlignment.CENTER
        );
        addStyledDataCell(
          deptTable,
          String.valueOf(stats.approvedApplications),
          helvetica,
          alternate,
          TextAlignment.CENTER
        );
        addStyledDataCell(
          deptTable,
          String.valueOf(stats.pendingApplications),
          helvetica,
          alternate,
          TextAlignment.CENTER
        );
        addStyledDataCell(
          deptTable,
          String.valueOf(stats.rejectedApplications),
          helvetica,
          alternate,
          TextAlignment.CENTER
        );
        alternate = !alternate;
      }
      document.add(deptTable);
      document.close();
      logger.info("Successfully generated organization-wide leave report for year: {}", year);
      return outputStream.toByteArray();
    } catch (SQLException e) {
      String errorMsg = "Database error while generating leave report: " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    } catch (Exception e) {
      String errorMsg = "Error generating leave report: " + e.getMessage();
      logger.error(errorMsg, e);
      throw new RemoteException(errorMsg, e);
    }
  }

  private Paragraph createSectionHeader(String title, PdfFont boldFont) {
    return new Paragraph(title)
      .setFont(boldFont)
      .setFontSize(13)
      .setFontColor(PRIMARY_COLOR)
      .setMarginTop(15)
      .setMarginBottom(10)
      .setBorderBottom(new SolidBorder(PRIMARY_COLOR, 1.5f))
      .setPaddingBottom(5);
  }

  private Paragraph createSectionSpacer() {
    return new Paragraph("").setMarginBottom(15);
  }

  private Table createStyledKeyValueTable(float[] columnWidths) {
    Table table = new Table(UnitValue.createPercentArray(columnWidths)).setWidth(UnitValue.createPercentValue(100));
    table.setBorder(Border.NO_BORDER);
    return table;
  }

  private Table createStyledDataTable(float[] columnWidths) {
    Table table = new Table(UnitValue.createPercentArray(columnWidths)).setWidth(UnitValue.createPercentValue(100));
    table.setBorder(new SolidBorder(BORDER_COLOR, THIN_BORDER));
    return table;
  }

  private void addStyledKeyValueRow(Table table, String label, String value, PdfFont font, PdfFont boldFont) {
    Cell labelCell = new Cell()
      .add(new Paragraph(label).setFont(boldFont).setFontSize(10).setFontColor(ColorConstants.DARK_GRAY))
      .setBorder(Border.NO_BORDER)
      .setPadding(6)
      .setBackgroundColor(SECTION_BG_COLOR);
    Cell valueCell = new Cell()
      .add(new Paragraph(value != null ? value : "—").setFont(font).setFontSize(10))
      .setBorder(Border.NO_BORDER)
      .setPadding(6)
      .setBackgroundColor(SECTION_BG_COLOR);
    table.addCell(labelCell);
    table.addCell(valueCell);
  }

  private void addStyledHeaderCell(Table table, String text, PdfFont boldFont) {
    Cell cell = new Cell()
      .add(new Paragraph(text).setFont(boldFont).setFontSize(9).setFontColor(PRIMARY_COLOR))
      .setBackgroundColor(HEADER_BG_COLOR)
      .setBorder(new SolidBorder(BORDER_COLOR, THIN_BORDER))
      .setPadding(8)
      .setTextAlignment(TextAlignment.CENTER)
      .setVerticalAlignment(VerticalAlignment.MIDDLE);
    table.addHeaderCell(cell);
  }

  private void addStyledDataCell(Table table, String text, PdfFont font, boolean alternate) {
    addStyledDataCell(table, text, font, alternate, TextAlignment.LEFT);
  }

  private void addStyledDataCell(Table table, String text, PdfFont font, boolean alternate, TextAlignment alignment) {
    Color bgColor = alternate ? new DeviceRgb(252, 252, 252) : ColorConstants.WHITE;
    Cell cell = new Cell()
      .add(new Paragraph(text != null ? text : "—").setFont(font).setFontSize(9))
      .setBackgroundColor(bgColor)
      .setBorder(new SolidBorder(BORDER_COLOR, THIN_BORDER))
      .setPadding(6)
      .setTextAlignment(alignment)
      .setVerticalAlignment(VerticalAlignment.MIDDLE);
    table.addCell(cell);
  }

  private void addStyledStatusCell(Table table, String status, PdfFont font, boolean alternate) {
    Color bgColor = alternate ? new DeviceRgb(252, 252, 252) : ColorConstants.WHITE;
    Color statusColor;
    switch (status != null ? status.toUpperCase() : "") {
      case "APPROVED":
        statusColor = STATUS_APPROVED_COLOR;
        break;
      case "PENDING":
        statusColor = STATUS_PENDING_COLOR;
        break;
      case "REJECTED":
        statusColor = STATUS_REJECTED_COLOR;
        break;
      default:
        statusColor = ColorConstants.DARK_GRAY;
    }
    Cell cell = new Cell()
      .add(new Paragraph(status != null ? status : "—").setFont(font).setFontSize(9).setFontColor(statusColor))
      .setBackgroundColor(bgColor)
      .setBorder(new SolidBorder(BORDER_COLOR, THIN_BORDER))
      .setPadding(6)
      .setTextAlignment(TextAlignment.CENTER)
      .setVerticalAlignment(VerticalAlignment.MIDDLE);
    table.addCell(cell);
  }

  private void addReportHeader(
    Document document,
    String title,
    String subtitle,
    PdfFont helvetica,
    PdfFont helveticaBold
  ) {
    Paragraph titlePara = new Paragraph(title)
      .setFont(helveticaBold)
      .setFontSize(20)
      .setFontColor(PRIMARY_COLOR)
      .setTextAlignment(TextAlignment.CENTER)
      .setMarginTop(20)
      .setMarginBottom(5);
    document.add(titlePara);
    Paragraph subtitlePara = new Paragraph(subtitle)
      .setFont(helvetica)
      .setFontSize(12)
      .setFontColor(ColorConstants.DARK_GRAY)
      .setTextAlignment(TextAlignment.CENTER)
      .setMarginBottom(20);
    document.add(subtitlePara);
    SimpleDateFormat dateFormat = new SimpleDateFormat("dd MMMM yyyy, HH:mm");
    Paragraph generatedDate = new Paragraph("Generated on: " + dateFormat.format(new Date()))
      .setFont(helvetica)
      .setFontSize(9)
      .setFontColor(ColorConstants.GRAY)
      .setTextAlignment(TextAlignment.RIGHT)
      .setMarginBottom(25);
    document.add(generatedDate);
  }

  private String formatDate(Date date) {
    if (date == null) {
      return "—";
    }
    SimpleDateFormat dateFormat = new SimpleDateFormat("dd MMM yyyy");
    return dateFormat.format(date);
  }

  private static class DepartmentLeaveStats {

    String departmentName;
    int employeeCount = 0;
    int totalLeave = 0;
    int usedLeave = 0;
    long approvedApplications = 0;
    long pendingApplications = 0;
    long rejectedApplications = 0;

    DepartmentLeaveStats(String departmentName) {
      this.departmentName = departmentName;
    }
  }

  private static class HeaderFooterEventHandler implements IEventHandler {

    private final int year;
    private final String reportType;
    private PdfFont helvetica;
    private PdfFont helveticaBold;

    public HeaderFooterEventHandler(int year, String reportType) {
      this.year = year;
      this.reportType = reportType;
      try {
        this.helvetica = PdfFontFactory.createFont(StandardFonts.HELVETICA);
        this.helveticaBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
      } catch (IOException e) {
        LoggerFactory.getLogger(HeaderFooterEventHandler.class).error("Error creating fonts for header/footer", e);
      }
    }

    @Override
    public void handleEvent(Event event) {
      if (helvetica == null || helveticaBold == null) return;
      PdfDocumentEvent docEvent = (PdfDocumentEvent) event;
      PdfDocument pdfDoc = docEvent.getDocument();
      PdfPage page = docEvent.getPage();
      int pageNumber = pdfDoc.getPageNumber(page);
      int totalPages = pdfDoc.getNumberOfPages();
      Rectangle pageSize = page.getPageSize();
      PdfCanvas pdfCanvas = new PdfCanvas(page.newContentStreamBefore(), page.getResources(), pdfDoc);
      float headerY = pageSize.getTop() - 40;
      Canvas canvas = new Canvas(pdfCanvas, pageSize);
      Paragraph companyName = new Paragraph("BHEL")
        .setFont(helveticaBold)
        .setFontSize(14)
        .setFontColor(PRIMARY_COLOR)
        .setTextAlignment(TextAlignment.CENTER);
      canvas.showTextAligned(companyName, pageSize.getWidth() / 2, headerY, TextAlignment.CENTER);
      Paragraph reportSubtitle = new Paragraph(reportType + " — " + year)
        .setFont(helvetica)
        .setFontSize(9)
        .setFontColor(ColorConstants.GRAY)
        .setTextAlignment(TextAlignment.CENTER);
      canvas.showTextAligned(reportSubtitle, pageSize.getWidth() / 2, headerY - 14, TextAlignment.CENTER);
      pdfCanvas.setStrokeColor(new DeviceRgb(200, 200, 200));
      pdfCanvas.setLineWidth(0.5f);
      pdfCanvas.moveTo(50, headerY - 25);
      pdfCanvas.lineTo(pageSize.getWidth() - 50, headerY - 25);
      pdfCanvas.stroke();
      float footerY = 35;
      pdfCanvas.moveTo(50, footerY + 15);
      pdfCanvas.lineTo(pageSize.getWidth() - 50, footerY + 15);
      pdfCanvas.stroke();
      Paragraph pageNum = new Paragraph(String.format("Page %d of %d", pageNumber, totalPages))
        .setFont(helvetica)
        .setFontSize(9)
        .setFontColor(ColorConstants.GRAY);
      canvas.showTextAligned(pageNum, pageSize.getWidth() / 2, footerY, TextAlignment.CENTER);
      Paragraph confidential = new Paragraph("Confidential")
        .setFont(helvetica)
        .setFontSize(8)
        .setFontColor(ColorConstants.LIGHT_GRAY);
      canvas.showTextAligned(confidential, 50, footerY, TextAlignment.LEFT);
      Paragraph yearText = new Paragraph("© BHEL " + year)
        .setFont(helvetica)
        .setFontSize(8)
        .setFontColor(ColorConstants.LIGHT_GRAY);
      canvas.showTextAligned(yearText, pageSize.getWidth() - 50, footerY, TextAlignment.RIGHT);
      canvas.close();
    }
  }
}
