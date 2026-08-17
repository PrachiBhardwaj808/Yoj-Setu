package com.yojsetu.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// (1) @Configuration tells Spring that this class is a source of bean definitions.
//     Spring will scan it at startup and register the beans declared inside it.
@Configuration
public class CorsConfig {

    // (2) @Bean tells Spring to manage the return value of this method as a
    //     singleton bean in the application context. Spring MVC automatically
    //     picks up beans that implement WebMvcConfigurer and calls their
    //     lifecycle methods (like addCorsMappings) during startup.
    @Bean
    public WebMvcConfigurer corsConfigurer() {

        // (3) We return an anonymous implementation of WebMvcConfigurer.
        //     We only need to override one method — addCorsMappings — so we
        //     use an anonymous class rather than a full class declaration.
        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {

                // (4) registry.addMapping("/**")
                //     "/**" is an Ant-style path pattern meaning: apply this
                //     CORS configuration to ALL endpoints in the application —
                //     /api/ping, /api/users, /api/anything. If you removed this
                //     and used "/api/ping" instead, only that one endpoint
                //     would include CORS headers; every other endpoint would
                //     silently block cross-origin requests.
                registry.addMapping("/**")

                        // (5) .allowedOrigins("http://localhost:5173")
                        //     This sets the exact origin that is permitted to
                        //     make cross-origin requests. Spring will include
                        //     the response header:
                        //         Access-Control-Allow-Origin: http://localhost:5173
                        //     The browser reads this header and only then hands
                        //     the response to your JavaScript.
                        //
                        //     We use an explicit origin, NOT "*" (wildcard),
                        //     because we also set allowCredentials(true) below.
                        //     The browser spec forbids credentials with a wildcard
                        //     origin — it would cause a different CORS error the
                        //     moment you add cookies or Authorization headers.
                        //
                        //     PRODUCTION TODO: This value is hardcoded for
                        //     local development. Before deploying, replace it
                        //     with your real production frontend URL
                        //     (e.g., "https://app.yojsetu.com"). A clean approach
                        //     is to read it from an environment variable or
                        //     application.properties so dev and prod configs
                        //     stay separate without touching this file.
                        .allowedOrigins("http://localhost:5173")

                        // (6) .allowedMethods(...)
                        //     Declares which HTTP methods are permitted from
                        //     cross-origin requests. If a method is not listed
                        //     here and the browser sends a preflight (OPTIONS)
                        //     check asking "can I use PUT?", the server will
                        //     respond without the approval header and the real
                        //     request will never be sent.
                        //
                        //     OPTIONS is included here specifically because it
                        //     is the method used for browser preflight requests.
                        //     If OPTIONS were missing, non-simple requests
                        //     (e.g., POST with Content-Type: application/json,
                        //     or any PUT/DELETE) would fail at the preflight
                        //     stage before the real request ever reaches your
                        //     controller.
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")

                        // (7) .allowedHeaders("*")
                        //     Permits any request header to be sent by the
                        //     browser. This is important for headers like
                        //     Content-Type, Authorization, X-Requested-With,
                        //     and any custom headers you might add later.
                        .allowedHeaders("*")

                        // (8) .allowCredentials(true)
                        //     Tells the browser that this endpoint accepts
                        //     credentialed requests — meaning requests that
                        //     carry cookies, HTTP authentication, or TLS
                        //     client certificates. Without this, the browser
                        //     strips credentials from cross-origin requests
                        //     even if your fetch() call includes
                        //     { credentials: "include" }.
                        //
                        //     This must be true for session-based auth or
                        //     any future cookie-based token you implement.
                        //     It is the reason we cannot use a wildcard "*"
                        //     for allowedOrigins — the two settings are
                        //     mutually exclusive by the browser spec.
                        .allowCredentials(true);
            }
        };
    }
}
