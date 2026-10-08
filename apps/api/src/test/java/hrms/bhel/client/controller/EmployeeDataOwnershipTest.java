package hrms.bhel.client.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import hrms.bhel.client.security.JwtUtil;
import hrms.bhel.common.dto.Employee;
import hrms.bhel.common.dto.LeaveApplication;
import hrms.bhel.common.service.EmployeeService;
import hrms.bhel.common.service.LeaveService;
import hrms.bhel.common.service.ReportService;
import hrms.bhel.common.service.UserService;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/**
 * The per-employee routes behind the gateway: an employee reaches only their own records, HR and admins reach
 * everyone's. The RMI services are mocks, so these tests exercise the gateway's security rules and controllers.
 */
@SpringBootTest
@AutoConfigureMockMvc
class EmployeeDataOwnershipTest {

  private static final long OWN_ID = 3L;
  private static final long OTHER_ID = 4L;
  private static final long OWN_APPLICATION_ID = 30L;
  private static final long OTHER_APPLICATION_ID = 40L;

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private JwtUtil jwtUtil;

  @MockitoBean
  private EmployeeService employeeService;

  @MockitoBean
  private LeaveService leaveService;

  @MockitoBean
  private ReportService reportService;

  @MockitoBean
  private UserService userService;

  /** One request per per-employee route, aimed at the given employee and leave application. */
  record Route(String name, HttpMethod method, String path, String body) {
    MockHttpServletRequestBuilder build(long employeeId, long applicationId) {
      String url = path.replace("{employeeId}", Long.toString(employeeId)).replace(
        "{applicationId}",
        Long.toString(applicationId)
      );
      MockHttpServletRequestBuilder builder = request(method, url);
      if (body != null) {
        builder.contentType(MediaType.APPLICATION_JSON).content(body.replace("{employeeId}", Long.toString(employeeId)));
      }
      return builder;
    }

    @Override
    public String toString() {
      return name;
    }
  }

  static Stream<Route> routes() {
    String leaveRequest =
      "{\"employeeId\": {employeeId}, \"leaveType\": \"annual_leave\", \"startDate\": \"" +
      LocalDate.now().plusDays(7) +
      "\", \"endDate\": \"" +
      LocalDate.now().plusDays(8) +
      "\", \"reason\": \"Family trip\"}";
    return Stream.of(
      new Route("read profile", HttpMethod.GET, "/api/employees/{employeeId}", null),
      new Route("edit profile", HttpMethod.PUT, "/api/employees/{employeeId}/profile", "{\"phone\": \"+60123456789\"}"),
      new Route("read family", HttpMethod.GET, "/api/employees/{employeeId}/family", null),
      new Route("edit family", HttpMethod.PUT, "/api/employees/{employeeId}/family", "[]"),
      new Route("read leave balance", HttpMethod.GET, "/api/leaves/balance/{employeeId}", null),
      new Route("read leave history", HttpMethod.GET, "/api/leaves/employee/{employeeId}", null),
      new Route("read leave application", HttpMethod.GET, "/api/leaves/{applicationId}/status", null),
      new Route("apply for leave", HttpMethod.POST, "/api/leaves", leaveRequest),
      new Route("cancel leave application", HttpMethod.POST, "/api/leaves/{applicationId}/cancel", null)
    );
  }

  @BeforeEach
  void stubServices() throws Exception {
    when(employeeService.getEmployeeById(anyLong())).thenAnswer(call -> employee(call.getArgument(0)));
    when(employeeService.updateEmployeeProfile(anyLong(), any())).thenReturn(true);
    when(employeeService.getFamilyDetails(anyLong())).thenReturn(List.of());
    when(employeeService.updateFamilyDetails(anyLong(), any())).thenReturn(true);
    when(leaveService.getLeaveBalance(anyLong(), anyInt())).thenReturn(List.of());
    when(leaveService.getEmployeeLeaveHistory(anyLong(), anyInt())).thenReturn(List.of());
    when(leaveService.getLeaveApplicationStatus(OWN_APPLICATION_ID)).thenReturn(application(OWN_APPLICATION_ID, OWN_ID));
    when(leaveService.getLeaveApplicationStatus(OTHER_APPLICATION_ID)).thenReturn(
      application(OTHER_APPLICATION_ID, OTHER_ID)
    );
    when(leaveService.applyForLeave(any())).thenAnswer(call ->
      application(50L, ((hrms.bhel.common.dto.LeaveRequest) call.getArgument(0)).getEmployeeId())
    );
    when(leaveService.cancelLeave(anyLong())).thenReturn(true);
  }

  @ParameterizedTest(name = "employee can {0} for themselves")
  @MethodSource("routes")
  void employeeReachesOwnRecords(Route route) throws Exception {
    mockMvc
      .perform(route.build(OWN_ID, OWN_APPLICATION_ID).header("Authorization", bearer("employee", "EMPLOYEE", OWN_ID)))
      .andExpect(status().is2xxSuccessful());
  }

  @ParameterizedTest(name = "employee cannot {0} for another employee")
  @MethodSource("routes")
  void employeeIsForbiddenFromAnotherEmployeesRecords(Route route) throws Exception {
    mockMvc
      .perform(
        route.build(OTHER_ID, OTHER_APPLICATION_ID).header("Authorization", bearer("employee", "EMPLOYEE", OWN_ID))
      )
      .andExpect(status().isForbidden());
  }

  @ParameterizedTest(name = "hr can {0} for any employee")
  @MethodSource("routes")
  void hrReachesAnyEmployeesRecords(Route route) throws Exception {
    mockMvc
      .perform(route.build(OTHER_ID, OTHER_APPLICATION_ID).header("Authorization", bearer("hr", "HR", 2L)))
      .andExpect(status().is2xxSuccessful());
  }

  @ParameterizedTest(name = "admin can {0} for any employee")
  @MethodSource("routes")
  void adminReachesAnyEmployeesRecords(Route route) throws Exception {
    mockMvc
      .perform(route.build(OTHER_ID, OTHER_APPLICATION_ID).header("Authorization", bearer("admin", "ADMIN", 1L)))
      .andExpect(status().is2xxSuccessful());
  }

  private String bearer(String username, String role, long employeeId) {
    return "Bearer " + jwtUtil.generateToken(username, role, employeeId);
  }

  private static Employee employee(long id) {
    Employee employee = new Employee();
    employee.setId(id);
    employee.setStatus("active");
    return employee;
  }

  private static LeaveApplication application(long id, long employeeId) {
    LeaveApplication application = new LeaveApplication();
    application.setId(id);
    application.setEmployeeId(employeeId);
    application.setStatus("pending");
    return application;
  }
}
