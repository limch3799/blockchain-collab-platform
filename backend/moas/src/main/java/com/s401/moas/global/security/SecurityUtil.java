package com.s401.moas.global.security;

import com.s401.moas.auth.exception.AuthException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Spring Security Context에서 인증 정보를 추출하는 유틸리티 클래스
 */
@Slf4j
public class SecurityUtil {

    /**
     * 현재 인증된 사용자의 memberId를 반환합니다.
     * JWTFilter에서 파싱한 JWT의 memberId를 SecurityContext에 설정한 값을 가져옵니다.
     *
     * @return 현재 인증된 사용자의 memberId (Integer)
     * @throws AuthException 인증되지 않은 경우 (Authentication이 null이거나 principal이 없는 경우)
     */
    public static Integer getCurrentMemberId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || authentication.getPrincipal() == null) {
            log.warn("인증되지 않은 사용자 - SecurityContext에 Authentication이 없습니다");
            throw AuthException.refreshTokenInvalid();
        }
        
        Object principal = authentication.getPrincipal();
        
        // anonymous 사용자 체크 (AnonymousAuthenticationFilter에서 설정한 "anonymousUser" String)
        if (principal instanceof String && "anonymousUser".equals(principal)) {
            log.warn("인증되지 않은 사용자 - anonymous 사용자로 인증된 상태입니다. JWT 토큰이 필요합니다.");
            throw AuthException.refreshTokenInvalid();
        }
        
        if (!(principal instanceof Integer)) {
            log.warn("잘못된 principal 타입: {} (값: {})", principal.getClass().getName(), principal);
            throw AuthException.refreshTokenInvalid();
        }
        
        return (Integer) principal;
    }

    /**
     * 현재 인증된 사용자의 Authentication 객체를 반환합니다.
     *
     * @return Authentication 객체, 없으면 null
     */
    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    /**
     * 현재 사용자가 인증되어 있는지 확인합니다.
     *
     * @return 인증되어 있으면 true, 아니면 false
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null 
                && authentication.isAuthenticated() 
                && authentication.getPrincipal() != null
                && authentication.getPrincipal() instanceof Integer;
    }


    /**
     * 현재 사용자가 관리자인지 확인
     */
    public static boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(auth -> "ADMIN".equals(auth.getAuthority()));
    }

    /**
     * 관리자가 아니면 예외 발생
     */
    public static void requireAdmin() {
        if (!isAdmin()) {
            log.warn("관리자 권한 필요 - 현재 사용자: {}",
                    isAuthenticated() ? getCurrentMemberId() : "익명");
            throw AuthException.forbidden();  // 또는 적절한 Exception
        }
    }

    /**
     * 현재 관리자 ID 반환 (관리자 전용)
     */
    public static Integer getCurrentAdminId() {
        requireAdmin();
        return getCurrentMemberId();  // memberId에 adminId가 저장됨
    }



}

