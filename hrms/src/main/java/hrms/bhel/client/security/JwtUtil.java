package hrms.bhel.client.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * JWT utility class for token generation and validation.
 * Handles token creation with username, role, and employee ID claims,
 * as well as token parsing and validation.
 */
@Component
public class JwtUtil {

  private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);
  private static final long DEFAULT_EXPIRATION = 86400000L;
  private static final String DEFAULT_SECRET = "your-jwt-secret-need-at-least-32-characters";
  private final String secret;
  private final long expiration;

  public JwtUtil() {
    String secretEnv = System.getenv("JWT_SECRET");
    this.secret = secretEnv != null ? secretEnv : DEFAULT_SECRET;
    String expirationEnv = System.getenv("JWT_EXPIRATION");
    this.expiration = expirationEnv != null ? Long.parseLong(expirationEnv) : DEFAULT_EXPIRATION;
  }

  private SecretKey getSigningKey() {
    return Keys.hmacShaKeyFor(secret.getBytes());
  }

  public String generateToken(String username, String role, Long employeeId) {
    logger.debug("Generating JWT token for username: {}, role: {}, employeeId: {}", username, role, employeeId);
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + expiration);
    JwtBuilder builder = Jwts.builder().subject(username).claim("role", role).issuedAt(now).expiration(expiryDate);
    if (employeeId != null) {
      builder.claim("employeeId", employeeId);
    }
    String token = builder.signWith(getSigningKey()).compact();
    logger.info("JWT token generated successfully for username: {}", username);
    return token;
  }

  public String getUsernameFromToken(String token) {
    Claims claims = Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
    return claims.getSubject();
  }

  public String getRoleFromToken(String token) {
    Claims claims = Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
    return claims.get("role", String.class);
  }

  public Long getEmployeeIdFromToken(String token) {
    Claims claims = Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
    Integer employeeId = claims.get("employeeId", Integer.class);
    return employeeId != null ? employeeId.longValue() : null;
  }

  public boolean validateToken(String token) {
    try {
      Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
      logger.debug("JWT token validated successfully");
      return true;
    } catch (ExpiredJwtException e) {
      logger.warn("JWT token is expired: {}", e.getMessage());
      return false;
    } catch (UnsupportedJwtException e) {
      logger.warn("JWT token is unsupported: {}", e.getMessage());
      return false;
    } catch (MalformedJwtException e) {
      logger.warn("JWT token is malformed: {}", e.getMessage());
      return false;
    } catch (io.jsonwebtoken.security.SignatureException e) {
      logger.warn("JWT token signature validation failed: {}", e.getMessage());
      return false;
    } catch (IllegalArgumentException e) {
      logger.warn("JWT token is invalid: {}", e.getMessage());
      return false;
    } catch (JwtException e) {
      logger.warn("JWT token validation failed: {}", e.getMessage());
      return false;
    }
  }
}
