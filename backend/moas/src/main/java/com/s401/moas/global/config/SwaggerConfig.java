package com.s401.moas.global.config;

import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        // Security Scheme 정의
        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .name("Authorization");

        // Security Requirement 정의
        SecurityRequirement securityRequirement = new SecurityRequirement().addList("Bearer Token");

        return new OpenAPI()
                .info(apiInfo())
                .addSecurityItem(securityRequirement)
                .components(new Components().addSecuritySchemes("Bearer Token", securityScheme)) // 모든 API에 토큰을 적용
                .servers(List.of(
                        new io.swagger.v3.oas.models.servers.Server()
                                .url("https://k13s401.p.ssafy.io")
                                .description("Production Server (HTTPS)"),
                        new io.swagger.v3.oas.models.servers.Server()
                                .url("http://localhost:8080")  // 로컬은 8080이 맞음
                                .description("Localhost (HTTP)"),
                        new io.swagger.v3.oas.models.servers.Server()
                                .url("http://54.180.99.55")  
                                .description("Admin Server (HTTP)")
                ));
    }

    private Info apiInfo() {
        return new Info()
                .title("MOAS API")
                .description("<h3>MOAS에서 사용되는 RESTful API에 대한 문서를 제공한다.</h3>")
                .version("1.0.0");

    }

    // 사용자 API 그룹
    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("1. 사용자 API")
                .pathsToMatch("/api/**") // 사용자 관련 경로
                .build();
    }

    // 관리자 API 그룹
    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("2. 관리자 API")
                .pathsToMatch("/admin/**") // 관리자 경로
                .build();
    }

    // 전체 API 그룹 (선택사항)
    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("0. 전체 API")
                .pathsToMatch("/**")
                .build();
    }
}

