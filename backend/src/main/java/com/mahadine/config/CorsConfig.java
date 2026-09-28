package com.mahadine.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> origins = (allowedOrigins == null || allowedOrigins.isBlank())
                ? List.of()
                : Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList();

        if (origins.isEmpty()) {
            // Same-origin deployment (frontend served by this Spring Boot app) - no cross-origin calls needed.
            // Keeping this empty avoids ever using a wildcard with credentials, which is insecure.
            configuration.setAllowedOriginPatterns(List.of());
        } else {
            configuration.setAllowedOriginPatterns(origins);
        }

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
