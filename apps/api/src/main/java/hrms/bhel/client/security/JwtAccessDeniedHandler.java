package hrms.bhel.client.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import hrms.bhel.client.dto.ErrorResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

/**
 * Handler for access denied errors in JWT-authenticated requests.
 * Returns HTTP 403 Forbidden with a JSON error response.
 */
@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public void handle(
    HttpServletRequest request,
    HttpServletResponse response,
    AccessDeniedException accessDeniedException
  ) throws IOException, ServletException {
    ErrorResponse errorResponse = new ErrorResponse(
      HttpStatus.FORBIDDEN.value(),
      "Access Denied",
      "You don't have permission to access this resource.",
      request.getRequestURI()
    );
    response.setStatus(HttpStatus.FORBIDDEN.value());
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    objectMapper.writeValue(response.getOutputStream(), errorResponse);
  }
}
