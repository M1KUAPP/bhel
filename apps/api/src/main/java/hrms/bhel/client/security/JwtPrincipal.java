package hrms.bhel.client.security;

import org.springframework.security.core.AuthenticatedPrincipal;

/** The signed-in user, as read from a validated JWT. */
public record JwtPrincipal(String username, Long employeeId) implements AuthenticatedPrincipal {
  @Override
  public String getName() {
    return username;
  }
}
