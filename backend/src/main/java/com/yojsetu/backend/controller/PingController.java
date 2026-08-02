package com.yojsetu.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * PingController — a minimal health-check controller.
 *
 * Purpose: verify that the server is up, HTTP routing works, and Spring
 * context loaded correctly — all before touching any real business logic.
 * This is always the first endpoint you build on a new backend.
 *
 * ─── What @RestController does ──────────────────────────────────────────────
 * This is a composed annotation — shorthand for two annotations combined:
 *
 *   @Controller
 *     → tells Spring's component scan to register this class as an HTTP
 *       request handler (a "Controller" bean in the Spring context).
 *
 *   @ResponseBody
 *     → tells Spring MVC: whatever value this class's methods return,
 *       write it directly into the HTTP response body.
 *       • If the return type is a String → write it as plain text
 *       • If the return type is a Java object → serialize it to JSON
 *         (using Jackson, which Spring Web bundles automatically)
 *
 * What breaks without @RestController?
 *   The app starts, but GET /api/ping returns a 404 or a template error.
 *   Without @ResponseBody, Spring MVC interprets "pong" as the name of a
 *   view template (like pong.html) to render — not a literal response string.
 *   Since no pong.html exists, it throws an error.
 *
 * ─── What @RequestMapping("/api") does ──────────────────────────────────────
 * Sets a base path prefix for all routes in this class. Every @GetMapping /
 * @PostMapping / etc. inside this class will be prefixed with /api.
 * So @GetMapping("/ping") becomes GET /api/ping.
 * Convention: REST API endpoints are prefixed with /api/ to distinguish
 * them from static assets or admin routes.
 */
@RestController
@RequestMapping("/api")
public class PingController {

    /**
     * Health-check endpoint.
     *
     * ─── What @GetMapping does ───────────────────────────────────────────────
     * Registers this method as the handler for HTTP GET requests to /api/ping.
     * Spring MVC sees an incoming "GET /api/ping" → finds this handler →
     * calls this method → takes the return value → writes it as the response.
     *
     * The full path is: base path ("/api") + this mapping ("/ping") = /api/ping
     *
     * What breaks without @GetMapping?
     *   This becomes a plain Java method. Spring MVC never calls it in response
     *   to an HTTP request. GET /api/ping would return 404 Not Found.
     *
     * @return the literal string "pong", sent as the HTTP response body
     *         with Content-Type: text/plain and HTTP 200 OK status.
     */
    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }
}
