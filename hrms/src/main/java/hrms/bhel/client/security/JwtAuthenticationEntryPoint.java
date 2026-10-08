package hrms.bhel.client.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import hrms.bhel.client.dto.ErrorResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

/**
 * Entry point handler for unauthenticated requests.
 * Returns HTTP 401 Unauthorized with a JSON error response.
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
    throws IOException, ServletException {
    ErrorResponse errorResponse = new ErrorResponse(
      HttpStatus.UNAUTHORIZED.value(),
      "Unauthorized",
      "Authentication required. Please provide a valid JWT token.",
      request.getRequestURI()
    );
    response.setStatus(HttpStatus.UNAUTHORIZED.value());
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    objectMapper.writeValue(response.getOutputStream(), errorResponse);
  }
}
