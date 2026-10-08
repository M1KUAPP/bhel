package hrms.bhel.client.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * JWT authentication filter for processing Bearer tokens.
 * Extracts and validates JWT tokens from Authorization headers,
 * and sets up the Spring Security authentication context.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

  @Autowired
  private JwtUtil jwtUtil;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
    throws ServletException, IOException {
    try {
      String header = request.getHeader("Authorization");
      if (header != null && header.startsWith("Bearer ")) {
        String token = header.substring(7);
        logger.debug("JWT token found in Authorization header");
        if (jwtUtil.validateToken(token)) {
          String username = jwtUtil.getUsernameFromToken(token);
          String role = jwtUtil.getRoleFromToken(token);
          logger.debug("JWT token validated for username: {}, role: {}", username, role);
          SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
          UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            new JwtPrincipal(username, jwtUtil.getEmployeeIdFromToken(token)),
            null,
            Collections.singletonList(authority)
          );
          authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(authentication);
          logger.info("User authenticated successfully: {} with role: {}", username, role);
        } else {
          logger.warn("JWT token validation failed");
        }
      }
    } catch (Exception e) {
      logger.error("Error processing JWT authentication: {}", e.getMessage(), e);
    }
    filterChain.doFilter(request, response);
  }
}
