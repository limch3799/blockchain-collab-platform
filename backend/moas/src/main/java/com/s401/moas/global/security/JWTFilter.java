package com.s401.moas.global.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.s401.moas.auth.exception.AuthException;
import com.s401.moas.auth.service.RefreshTokenService;
import com.s401.moas.global.exception.ErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@AllArgsConstructor
@Slf4j
public class JWTFilter extends OncePerRequestFilter {
    private final JWTUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        String clientIp = resolveClientIp(request);
        String clientRegion = resolveClientRegion(request);
        String requestSignature = String.format("%s %s | ip=%s region=%s", method, requestURI, clientIp, clientRegion);

        log.info("필터 요청: {}", requestSignature);

        // 화이트리스트 경로 체크 (JWT 토큰 검증 불필요)
        boolean isWhitelisted = SecurityWhitelist.isWhitelisted(method, requestURI);
        log.info("화이트리스트 체크 결과: {} - {}", isWhitelisted, requestSignature);

        boolean bookmarkedOnlyRequest = isWhitelisted && "true".equalsIgnoreCase(request.getParameter("bookmarked"));

        if (isWhitelisted && !bookmarkedOnlyRequest) {
            log.info("화이트리스트 경로 - 인증 불필요: {}", requestSignature);
            filterChain.doFilter(request, response);
            return;
        }

        // Authorization 헤더 선조회 (화이트리스트지만 bookmarked=true이거나 비화이트리스트인 경우만 필요)
        String authorization = request.getHeader("Authorization");
        boolean hasBearerToken = authorization != null && authorization.startsWith("Bearer ");

        if (isWhitelisted) {
            log.info("화이트리스트 경로지만 bookmarked=true 요청 - 인증 검증 진행: {}", requestSignature);
        } else {
            log.info("화이트리스트 아님 - 인증 필요: {}", requestSignature);
        }

        // Authorization 헤더 검증
        if (!hasBearerToken) {
            log.warn("인증 실패: Authorization 헤더 없음 - {}", requestSignature);
            sendErrorResponse(response, AuthException.accessTokenNotFound());
            return;
        }

        // 토큰
        String token = authorization.split(" ")[1];

        Integer memberId;
        String role;

        try {
            // 토큰 소멸 시간 검증
            try {
                if (jwtUtil.isExpired(token)) {
                    log.warn("인증 실패: 토큰 만료 - {}", requestSignature);
                    sendErrorResponse(response, AuthException.accessTokenExpired());
                    return;
                }
            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                log.warn("인증 실패: 토큰 만료 - {}", requestSignature);
                sendErrorResponse(response, AuthException.accessTokenExpired());
                return;
            }

            // 토큰 클레임 추출 (파싱 시 예외 발생 가능)
            memberId = jwtUtil.getMemberId(token);
            role = jwtUtil.getRole(token);
            
            // memberId나 role이 null이면 토큰이 유효하지 않음
            if (memberId == null || role == null) {
                log.warn("인증 실패: 토큰에서 memberId 또는 role 추출 불가 - {}", requestSignature);
                sendErrorResponse(response, AuthException.accessTokenInvalid());
                return;
            }

            // Family Version 검증 (즉시 무효화 지원)
            String familyId = jwtUtil.getFamilyId(token);
            Integer tokenFver = jwtUtil.getFamilyVersion(token);
            
            if (familyId != null && tokenFver != null) {
                // Redis에서 현재 Family Version 조회
                int currentVersion = refreshTokenService.getFamilyVersion(familyId);
                
                if (tokenFver != currentVersion) {
                    log.warn("인증 실패: 토큰 버전 불일치 (재사용 감지) - {} | memberId: {}, fid: {}", 
                            requestSignature, memberId, familyId);
                    sendErrorResponse(response, AuthException.refreshTokenReuseDetected());
                    return;
                }
            }

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.warn("인증 실패: 토큰 만료 - {}", requestSignature);
            sendErrorResponse(response, AuthException.accessTokenExpired());
            return;
        } catch (io.jsonwebtoken.JwtException e) {
            log.warn("인증 실패: JWT 예외 - {} | {}", requestSignature, e.getClass().getSimpleName());
            sendErrorResponse(response, AuthException.accessTokenInvalid());
            return;
        } catch (Exception e) {
            log.warn("인증 실패: 토큰 검증 오류 - {} | {}", requestSignature, e.getClass().getSimpleName());
            sendErrorResponse(response, AuthException.accessTokenInvalid());
            return;
        }

        // SecurityContext에 인증 주입
        UsernamePasswordAuthenticationToken auth;
        auth = new UsernamePasswordAuthenticationToken(
                memberId,                              // principal(간단히 memberId)
                null,                                  // credentials
                List.of(new SimpleGrantedAuthority(role))
        );
        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        // 세션에 사용자 등록
        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }

    /**
     * 인증 실패 시 에러 응답 전송
     */
    private void sendErrorResponse(HttpServletResponse response, AuthException authException) throws IOException {
        // 응답이 이미 커밋되었는지 확인
        if (response.isCommitted()) {
            log.warn("응답이 이미 커밋되었습니다. 에러 응답을 전송할 수 없습니다.");
            return;
        }

        response.resetBuffer(); // 기존 버퍼 초기화
        response.setStatus(authException.getHttpStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ErrorResponse errorResponse = ErrorResponse.builder()
                .errorCode(authException.getCode())
                .message(authException.getMessage())
                .timestamp(System.currentTimeMillis())
                .build();

        objectMapper.writeValue(response.getWriter(), errorResponse);
    }

    private static final List<String> CLIENT_IP_HEADER_CANDIDATES = List.of(
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_CLIENT_IP",
            "HTTP_X_FORWARDED_FOR"
    );

    private static final List<String> CLIENT_REGION_HEADER_CANDIDATES = List.of(
            "CF-IPCountry",
            "X-AppEngine-Country",
            "X-Geo-Country",
            "X-Country-Code",
            "X-Forwarded-Country"
    );

    private String resolveClientIp(HttpServletRequest request) {
        for (String header : CLIENT_IP_HEADER_CANDIDATES) {
            String headerValue = request.getHeader(header);
            if (headerValue != null && !headerValue.isBlank() && !"unknown".equalsIgnoreCase(headerValue)) {
                return headerValue.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }

    private String resolveClientRegion(HttpServletRequest request) {
        for (String header : CLIENT_REGION_HEADER_CANDIDATES) {
            String headerValue = request.getHeader(header);
            if (headerValue != null && !headerValue.isBlank() && !"unknown".equalsIgnoreCase(headerValue)) {
                return headerValue.trim();
            }
        }
        return "unknown";
    }
}
