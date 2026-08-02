package com.yojsetu.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * SecurityConfig — Spring Security configuration for the Yojsetu backend.
 *
 * ─── Why does Spring Security block everything by default? ──────────────────
 * The moment spring-boot-starter-security appears on your classpath, Spring
 * Boot's auto-configuration (SecurityAutoConfiguration) immediately activates.
 * It registers a Servlet filter — the "security filter chain" — that wraps
 * every incoming HTTP request before it even reaches your controllers.
 * That filter demands: "Is this user authenticated?" If not → 401 Unauthorized
 * (or a redirect to a generated /login page in some modes).
 *
 * This is the "secure by default" philosophy. You must explicitly opt IN to
 * open endpoints. Without this file, `GET /api/ping` would return 401.
 *
 * ─── What @Configuration does ───────────────────────────────────────────────
 * Marks this class as a Spring configuration source. During @ComponentScan
 * (triggered by @SpringBootApplication), Spring finds this class, reads all
 * @Bean methods, and registers the returned objects as managed beans.
 *
 * ─── What @EnableWebSecurity does ───────────────────────────────────────────
 * Tells Spring to DISABLE its default auto-configured security and hand full
 * control to the SecurityFilterChain @Bean defined below. Without this, your
 * @Bean might be partially ignored or merged with the auto-config in
 * unpredictable ways.
 *
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ⚠  TEMPORARY CONFIGURATION — DEVELOPMENT ONLY                          ║
 * ║                                                                           ║
 * ║  This configuration intentionally permits ALL requests without any       ║
 * ║  authentication. This is ONLY for Day 4 development so we can test       ║
 * ║  endpoints like /api/ping without setting up real auth.                  ║
 * ║                                                                           ║
 * ║  This file WILL BE REPLACED in a future week with a real filter chain    ║
 * ║  that:                                                                    ║
 * ║    • Validates JWT tokens on protected routes                             ║
 * ║    • Permits only /api/auth/** publicly                                   ║
 * ║    • Locks down all other endpoints to authenticated users                ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Defines the HTTP security filter chain — the rulebook Spring Security
     * consults for every incoming HTTP request.
     *
     * @param http HttpSecurity — a builder object provided by Spring that lets
     *             you configure rules in a fluent (method-chaining) style.
     * @return SecurityFilterChain — the compiled rulebook Spring Security uses.
     * @throws Exception HttpSecurity.build() declares a checked Exception.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            // ── AUTHORIZATION RULES ─────────────────────────────────────────
            // authorizeHttpRequests() is where you define which URLs require
            // authentication and which don't.
            //
            // anyRequest().permitAll() means: every request, regardless of
            // URL path, HTTP method (GET/POST/PUT/DELETE), or user identity
            // → is permitted without any authentication check.
            //
            // FUTURE REPLACEMENT: this block will become something like:
            //   .requestMatchers("/api/auth/**").permitAll()
            //   .anyRequest().authenticated()
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )

            // ── CSRF PROTECTION (DISABLED) ──────────────────────────────────
            // CSRF (Cross-Site Request Forgery) is an attack where a malicious
            // website tricks a user's browser into making an authenticated
            // request to your API using the user's existing session cookie.
            //
            // CSRF protection is ONLY needed when you use session cookies for
            // authentication (the browser automatically sends cookies on every
            // request, which is what CSRF exploits).
            //
            // Yojsetu will use stateless JWT tokens instead:
            //   • JWTs are stored in localStorage/memory, not cookies
            //   • Malicious sites cannot access localStorage of another domain
            //   • Therefore CSRF attacks are impossible with JWTs
            //   • Therefore CSRF protection is unnecessary and would only cause
            //     all POST/PUT/DELETE requests from Postman to fail with 403
            //
            // Disabling it here is the CORRECT decision for a JWT-based API.
            .csrf(csrf -> csrf.disable());

        return http.build();
    }
}
