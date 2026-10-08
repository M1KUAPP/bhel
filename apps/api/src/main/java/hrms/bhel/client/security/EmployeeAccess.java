package hrms.bhel.client.security;

import java.util.Objects;
import java.util.Set;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/** Limits an employee's per-employee routes to their own records; HR and admins reach everyone's. */
@Component
public class EmployeeAccess {

  private static final Set<String> STAFF_ROLES = Set.of("ROLE_HR", "ROLE_ADMIN");

  public void requireSelfOrStaff(Long employeeId) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null) {
      throw new AccessDeniedException("Authentication required");
    }
    boolean staff = authentication
      .getAuthorities()
      .stream()
      .map(GrantedAuthority::getAuthority)
      .anyMatch(STAFF_ROLES::contains);
    if (staff) {
      return;
    }
    if (
      authentication.getPrincipal() instanceof JwtPrincipal principal &&
      principal.employeeId() != null &&
      Objects.equals(principal.employeeId(), employeeId)
    ) {
      return;
    }
    throw new AccessDeniedException("You can only access your own employee records.");
  }
}
