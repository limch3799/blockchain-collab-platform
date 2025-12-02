package com.s401.moas.global.config;

import java.util.List;

import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class CorsMvcConfig {

    private final Environment environment;

    @Bean
    @SuppressWarnings("unchecked")
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Binder를 사용하여 타입 안전하게 리스트 읽기
        Binder binder = Binder.get(environment);

        // allowed-origins 리스트 읽기
        List<String> allowedOrigins = binder
                .bind("app.cors.allowed-origins", List.class)
                .orElse(null);
        if (allowedOrigins != null) {
            config.setAllowedOriginPatterns(allowedOrigins); // cors 설정 테스트 수정, 기존엔 setAllowedOrigins
        }

        // allowed-headers 리스트 읽기
        List<String> allowedHeaders = binder
                .bind("app.cors.allowed-headers", List.class)
                .orElse(null);
        if (allowedHeaders != null) {
            config.setAllowedHeaders(allowedHeaders);
        }

        // allowed-methods 리스트 읽기
        List<String> allowedMethods = binder
                .bind("app.cors.allowed-methods", List.class)
                .orElse(null);
        if (allowedMethods != null) {
            config.setAllowedMethods(allowedMethods);
        }

        // allow-credentials 읽기
        Boolean allowCredentials = binder
                .bind("app.cors.allow-credentials", Boolean.class)
                .orElse(false);
        config.setAllowCredentials(allowCredentials);

        config.setExposedHeaders(List.of("Authorization", "Set-Cookie"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
