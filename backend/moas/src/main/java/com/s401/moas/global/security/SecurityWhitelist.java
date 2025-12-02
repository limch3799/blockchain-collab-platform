package com.s401.moas.global.security;

import java.util.List;
import java.util.regex.Pattern;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.util.AntPathMatcher;

import jakarta.servlet.http.HttpServletRequest;

/**
 * JWT 인증 화이트리스트 경로 관리
 * SecurityConfig와 JWTFilter에서 공통으로 사용
 */
public class SecurityWhitelist {

    /**
     * 화이트리스트 경로 목록 (여기만 수정하면 됨)
     * (메서드, 경로 패턴)
     * 
     * 패턴 타입:
     * - Ant 패턴: "/swagger-ui/**" (간단한 경로 매칭)
     * - 정확한 경로: "/api/auth/login" (정확히 일치)
     * - 정규식: Pattern.compile("^/api/projects/\\d+$") (복잡한 패턴)
     */
    private static final List<WhitelistEntry> WHITELIST_ENTRIES = List.of(
            // 인증 관련
            new WhitelistEntry(HttpMethod.POST, "/api/auth/login"),
            new WhitelistEntry(HttpMethod.POST, "/api/auth/refresh"),

            // 관리자 인증 추가
            new WhitelistEntry(HttpMethod.POST, "/admin/api/signup"),
            new WhitelistEntry(HttpMethod.POST, "/admin/api/login"),
            new WhitelistEntry(HttpMethod.POST, "/admin/api/refresh"),

            // 헬스체크
            new WhitelistEntry(HttpMethod.GET, "/health"),

            // Swagger UI 및 API 문서
            new WhitelistEntry(HttpMethod.GET, "/swagger-ui/**"),
            new WhitelistEntry(HttpMethod.GET, "/v3/api-docs/**"),
            new WhitelistEntry(HttpMethod.GET, "/swagger-ui.html"),
            new WhitelistEntry(HttpMethod.GET, "/webjars/**"),
            new WhitelistEntry(HttpMethod.GET, "/api-docs"),

            // Static 리소스
            new WhitelistEntry(HttpMethod.GET, "/api-document.html"),
            new WhitelistEntry(HttpMethod.GET, "/*.html"),  // 모든 HTML 파일
            new WhitelistEntry(HttpMethod.GET, "/css/**"),
            new WhitelistEntry(HttpMethod.GET, "/js/**"),
            new WhitelistEntry(HttpMethod.GET, "/images/**"),
            new WhitelistEntry(HttpMethod.GET, "/favicon.ico"),

            // 회원 공개 API
            new WhitelistEntry(HttpMethod.GET, "/api/members/nickname/exists"),
            new WhitelistEntry(HttpMethod.GET, Pattern.compile("^/api/members/\\d+$")), // 정규식 패턴

            // 프로젝트 조회 관련 공개 API
            new WhitelistEntry(HttpMethod.GET, "/api/projects"),
            new WhitelistEntry(HttpMethod.GET, Pattern.compile("^/api/projects/\\d+$")), // 정규식 패턴

            // 토스 페이먼츠 웹훅 사용 API
            new WhitelistEntry(HttpMethod.POST, "/api/payments/webhook/toss"),

            // SSE 연결 시도 API
            //new WhitelistEntry(HttpMethod.GET, "/api/stream"),

            // 메타데이터 접근 API
            new WhitelistEntry(HttpMethod.GET, Pattern.compile("^/api/metadata/\\d+$")),
            new WhitelistEntry(HttpMethod.HEAD, Pattern.compile("^/api/metadata/\\d+$")));
    /**
     * 화이트리스트에 포함된 경로인지 확인
     * 
     * @param method     HTTP 메서드
     * @param requestURI 요청 URI (쿼리 파라미터 제외)
     * @return 화이트리스트에 포함되면 true
     */
    public static boolean isWhitelisted(String method, String requestURI) {
        // OPTIONS 요청은 항상 허용 (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        HttpMethod httpMethod = HttpMethod.valueOf(method.toUpperCase());

        for (WhitelistEntry entry : WHITELIST_ENTRIES) {
            if (entry.matches(httpMethod, requestURI)) {
                return true;
            }
        }

        return false;
    }

    /**
     * SecurityConfig에서 사용할 화이트리스트 엔트리 목록 반환
     */
    public static List<WhitelistEntry> getWhitelistEntries() {
        return WHITELIST_ENTRIES;
    }

    /**
     * SecurityConfig의 authorizeHttpRequests에 화이트리스트 적용
     * 
     * @param authConfig authorizeHttpRequests 설정
     * @return 체이닝을 위한 설정 객체
     */
    public static AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry configureWhitelist(
            AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry authConfig) {

        AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry config = authConfig;

        // OPTIONS 메서드는 모든 경로 허용 (CORS preflight)
        config = config.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();

        for (WhitelistEntry entry : WHITELIST_ENTRIES) {
            if (entry.isRegex() && entry.getPath() instanceof Pattern pattern) {
                // 정규식 패턴 - 커스텀 RequestMatcher 생성
                RequestMatcher regexMatcher = new RegexRequestMatcher(entry.getMethod(), pattern);
                config = config.requestMatchers(regexMatcher).permitAll();
            } else if (entry.getPath() instanceof String pathStr) {
                // Ant 패턴 또는 정확한 경로 - Spring Security의 기본 매칭 사용
                config = config.requestMatchers(entry.getMethod(), pathStr).permitAll();
            }
        }

        return config;
    }

    /**
     * 화이트리스트 엔트리
     */
    public static class WhitelistEntry {
        private static final AntPathMatcher pathMatcher = new AntPathMatcher();
        
        private final HttpMethod method;
        private final Object path; // String (Ant 패턴 또는 정확한 경로) 또는 Pattern (정규식)
        private final boolean isRegex;

        /**
         * Ant 패턴 또는 정확한 경로용 생성자
         * 예: "/swagger-ui/**", "/api/auth/login"
         */
        public WhitelistEntry(HttpMethod method, String path) {
            this.method = method;
            this.path = path;
            this.isRegex = false;
        }

        /**
         * 정규식 패턴용 생성자
         * 예: Pattern.compile("^/api/projects/\\d+$")
         */
        public WhitelistEntry(HttpMethod method, Pattern pattern) {
            this.method = method;
            this.path = pattern;
            this.isRegex = true;
        }

        public boolean matches(HttpMethod requestMethod, String requestURI) {
            // 메서드가 일치하지 않으면 false
            if (method == null || !method.equals(requestMethod)) {
                return false;
            }

            // 정규식 패턴인 경우
            if (isRegex && path instanceof Pattern pattern) {
                return pattern.matcher(requestURI).matches();
            }

            // Ant 패턴 또는 정확한 경로인 경우
            if (!isRegex && path instanceof String pathStr) {
                // AntPathMatcher를 사용하여 매칭
                // Ant 패턴은 자동으로 처리됨: "/swagger-ui/**"는 "/swagger-ui/index.html" 등과 매칭
                return pathMatcher.match(pathStr, requestURI);
            }

            return false;
        }

        public HttpMethod getMethod() {
            return method;
        }

        public Object getPath() {
            return path;
        }

        public boolean isRegex() {
            return isRegex;
        }
    }

    /**
     * 정규식 패턴을 위한 커스텀 RequestMatcher
     */
    private static class RegexRequestMatcher implements RequestMatcher {
        private final HttpMethod method;
        private final Pattern pattern;

        public RegexRequestMatcher(HttpMethod method, Pattern pattern) {
            this.method = method;
            this.pattern = pattern;
        }

        @Override
        public boolean matches(HttpServletRequest request) {
            // HTTP 메서드 확인
            String requestMethod = request.getMethod();
            if (method != null && !method.name().equals(requestMethod)) {
                return false;
            }

            // URI 패턴 매칭 (쿼리 파라미터 제외)
            String requestURI = request.getRequestURI();
            return pattern.matcher(requestURI).matches();
        }
    }
}
