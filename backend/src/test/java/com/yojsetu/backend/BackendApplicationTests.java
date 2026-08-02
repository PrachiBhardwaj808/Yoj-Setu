package com.yojsetu.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * BackendApplicationTests — smoke test for the Spring application context.
 *
 * ─── What @SpringBootTest does ──────────────────────────────────────────────
 * Tells JUnit 5 (the test runner): before executing any @Test methods in
 * this class, start a FULL Spring application context — the same context
 * that boots when you run the app normally.
 * This includes: component scanning, auto-configuration, bean creation,
 * dependency injection wiring, DataSource initialization, etc.
 *
 * ─── What contextLoads() tests ──────────────────────────────────────────────
 * It looks empty, but it's not trivial. This test passes only if:
 *   • All @Bean methods execute without throwing exceptions
 *   • All @Autowired dependencies can be satisfied
 *   • HikariCP successfully connects to MySQL (using your application.properties)
 *   • Spring Security's filter chain is configured without errors
 *   • No auto-configuration throws a startup failure
 *
 * If any of those conditions fail, this test fails with a descriptive error
 * message — making it a cheap, fast safety net to catch misconfiguration early.
 *
 * Run it with: mvn test
 * Or in IntelliJ: right-click the file → Run 'BackendApplicationTests'
 *
 * ⚠ Note: this test WILL fail if MySQL is not running or the password in
 *   application.properties is still the placeholder. Replace the password
 *   first (or configure a test database separately in a future week).
 */
@SpringBootTest
class BackendApplicationTests {

    @Test
    void contextLoads() {
        // No assertions needed.
        // The test passes if the Spring context starts without throwing.
        // The test fails if any bean or auto-configuration throws an exception.
    }
}
