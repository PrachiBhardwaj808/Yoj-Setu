package com.yojsetu.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * BackendApplication — the single entry point for the entire Yojsetu backend.
 *
 * When you hit "Run" in IntelliJ (or run `mvn spring-boot:run` / `java -jar`),
 * the JVM looks for a class with a public static void main() and starts here.
 *
 * ─── What @SpringBootApplication does ───────────────────────────────────────
 * This one annotation is actually three annotations combined:
 *
 *   @Configuration
 *     → marks this class as a source of Spring "bean" definitions.
 *       A bean is just an object whose lifecycle Spring manages for you
 *       (creation, wiring dependencies, destruction).
 *
 *   @EnableAutoConfiguration
 *     → Spring Boot inspects your classpath and auto-wires sensible defaults.
 *       Examples:
 *         • spring-boot-starter-web on classpath  → auto-configures Tomcat + MVC
 *         • spring-boot-starter-jdbc on classpath → auto-configures HikariCP
 *           connection pool + JdbcTemplate (reads your application.properties)
 *         • spring-boot-starter-security          → auto-locks all endpoints
 *       This is the core of "convention over configuration" — Spring Boot
 *       does the boring wiring so you only configure what you want to change.
 *
 *   @ComponentScan
 *     → scans the package com.yojsetu.backend (and every sub-package like
 *       .config, .controller, .service, .dao, etc.) for classes annotated
 *       with @Component, @Service, @Repository, @Controller, @RestController,
 *       @Configuration, etc., and registers them as Spring-managed beans.
 *       This is why your PingController and SecurityConfig will be picked up
 *       automatically — you don't have to register them manually anywhere.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        // SpringApplication.run() does the following in order:
        //   1. Creates the Spring ApplicationContext (the "container" that
        //      holds and wires all your beans)
        //   2. Triggers @EnableAutoConfiguration to scan and configure
        //   3. Starts the embedded Tomcat server on port 8080
        //   4. Prints the "Started BackendApplication in X seconds" log line
        SpringApplication.run(BackendApplication.class, args);
    }
}
