package com.s401.moas.global.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
public class JWTUtil {
    private final SecretKey key;
    private final JwtParser parser;
    private final long accessTtlMs;
    private final long refreshTtlMs;

    public JWTUtil(@Value("${spring.jwt.secret}") String secret, @Value("${spring.jwt.access.expires-ms}") long accessTtlMs, @Value("${spring.jwt.refresh.expires-ms}") long refreshTtlMs) {
        // 키 생성, 키 알고리즘은 HS256
        this.key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), Jwts.SIG.HS256.key().build().getAlgorithm());
        this.parser = Jwts.parser().verifyWith(key).build();
        this.accessTtlMs = accessTtlMs;
        this.refreshTtlMs = refreshTtlMs;
        
        log.debug("JWTUtil initialized. AccessToken TTL: {}분, RefreshToken TTL: {}일", 
                accessTtlMs / 60000.0, refreshTtlMs / 86400000.0);
    }

    // 기존 메서드 (하위 호환성 유지)
    public String createAccessToken(Integer memberId, String role) {
        return createAccessToken(memberId, role, null, null, 1);
    }

    public String createRefreshToken(Integer memberId, String jti) {
        return createRefreshToken(memberId, null, null, jti);
    }

    // 확장된 토큰 생성 메서드 (familyId, sessionId, familyVersion 지원)
    public String createAccessToken(Integer memberId, String role, String familyId, String sessionId, int familyVersion) {
        long now = System.currentTimeMillis();
        
        var builder = Jwts.builder()
                .claim("memberId", memberId)
                .claim("role", role)
                .issuedAt(new Date(now))
                .expiration(new Date(now + accessTtlMs));

        if (familyId != null) {
            builder.claim("fid", familyId);
        }
        if (sessionId != null) {
            builder.claim("sid", sessionId);
        }
        builder.claim("fver", familyVersion);

        String jwt = builder.signWith(key).compact();
        log.debug("Access Token 생성: memberId={}, role={}", memberId, role);
        return jwt;
    }

    public String createRefreshToken(Integer memberId, String familyId, String sessionId, String jti) {
        long now = System.currentTimeMillis();
        var builder = Jwts.builder()
                .claim("memberId", memberId)
                .id(jti)
                .issuedAt(new Date(now))
                .expiration(new Date(now + refreshTtlMs));

        if (familyId != null) {
            builder.claim("fid", familyId);
        }
        if (sessionId != null) {
            builder.claim("sid", sessionId);
        }

        String jwt = builder.signWith(key).compact();
        log.debug("Refresh Token 생성: memberId={}, jti={}", memberId, jti);
        return jwt;
    }

    // ✅ 관리자용 Access Token 생성 (familyId, sessionId 불필요)
    public String createAdminAccessToken(Integer adminId) {
        long now = System.currentTimeMillis();

        String jwt = Jwts.builder()
                .claim("memberId", adminId)  // memberId 키 그대로 사용 (기존 필터 호환)
                .claim("role", "ADMIN")
                .issuedAt(new Date(now))
                .expiration(new Date(now + accessTtlMs))
                .signWith(key)
                .compact();

        log.debug("Admin Access Token 생성: adminId={}", adminId);
        return jwt;
    }

    // 관리자용 Refresh Token 생성
    public String createAdminRefreshToken(Integer adminId, String jti) {
        long now = System.currentTimeMillis();

        String jwt = Jwts.builder()
                .claim("memberId", adminId)  // memberId 키 그대로 사용
                .claim("role", "ADMIN")
                .id(jti)
                .issuedAt(new Date(now))
                .expiration(new Date(now + refreshTtlMs))
                .signWith(key)
                .compact();

        log.debug("Admin Refresh Token 생성: adminId={}, jti={}", adminId, jti);
        return jwt;
    }

    public Integer getMemberId(String token) {
        Number memberIdNumber = parse(token).get("memberId", Number.class);
        if (memberIdNumber == null) {
            return null;
        }
        return memberIdNumber.intValue();
    }

    public String getRole(String token) {
        return parse(token).get("role", String.class);
    }

    public String getSubject(String token) {
        return parse(token).getSubject();
    }

    public String getJti(String token) {
        return parse(token).getId();
    }

    /**
     * 토큰이 만료되었는지 확인
     * 만료된 토큰은 parse 시 예외가 발생하므로 예외 처리 필요
     */
    public boolean isExpired(String token) {
        try {
            Claims claims = parse(token);
            Date expiration = claims.getExpiration();
            Date now = new Date();
            return expiration.before(now);
        } catch (ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            log.warn("토큰 파싱 실패 (만료 여부 확인 중): {}", e.getClass().getSimpleName());
            throw e;
        }
    }

    // 새 클레임 추출 메서드
    public String getFamilyId(String token) {
        return parse(token).get("fid", String.class);
    }

    public String getSessionId(String token) {
        return parse(token).get("sid", String.class);
    }

    public Integer getFamilyVersion(String token) {
        return parse(token).get("fver", Integer.class);
    }

    // 내부 파서
    private Claims parse(String token) {
        return parser.parseSignedClaims(token).getPayload();
    }

    // 외부에서 Claims 직접 접근 (Refresh 엔드포인트 등에서 사용)
    public Claims parseClaims(String token) {
        return parse(token);
    }
}
