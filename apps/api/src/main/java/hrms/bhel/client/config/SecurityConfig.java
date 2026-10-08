package hrms.bhel.client.config;

import hrms.bhel.client.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security configuration for the API Gateway.
 * Configures JWT-based stateless authentication, endpoint authorization rules,
 * and custom authentication/access denied handlers.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Autowired
  private JwtAuthenticationFilter jwtAuthenticationFilter;

  @Autowired
  private hrms.bhel.client.security.JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

  @Autowired
  private hrms.bhel.client.security.JwtAccessDeniedHandler jwtAccessDeniedHandler;

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .exceptionHandling(exceptions ->
        exceptions.authenticationEntryPoint(jwtAuthenticationEntryPoint).accessDeniedHandler(jwtAccessDeniedHandler)
      )
      .authorizeHttpRequests(auth ->
        auth
          .requestMatchers("/api/auth/**")
          .permitAll()
          .requestMatchers(HttpMethod.GET, "/api/employees/{id}")
          .authenticated()
          .requestMatchers(HttpMethod.PUT, "/api/employees/{id}/profile")
          .authenticated()
          .requestMatchers(HttpMethod.GET, "/api/employees/{id}/family")
          .authenticated()
          .requestMatchers(HttpMethod.PUT, "/api/employees/{id}/family")
          .authenticated()
          .requestMatchers("/api/employees/**")
          .hasAnyRole("HR", "ADMIN")
          .requestMatchers("/api/leaves/balance/**")
          .authenticated()
          .requestMatchers(HttpMethod.GET, "/api/leaves/pending")
          .hasAnyRole("HR", "ADMIN")
          .requestMatchers(HttpMethod.POST, "/api/leaves/*/approve", "/api/leaves/*/reject")
          .hasAnyRole("HR", "ADMIN")
          .requestMatchers("/api/leaves/**")
          .authenticated()
          .requestMatchers("/api/reports/**")
          .hasAnyRole("HR", "ADMIN")
          .anyRequest()
          .authenticated()
      )
      .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }
}
