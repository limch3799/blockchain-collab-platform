package com.s401.moas.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.concurrent.TimeUnit;

/**
 * Refresh Token을 Redis에 저장/조회/삭제하는 서비스
 * Refresh Token 회전 및 재사용 탐지에 사용
 * Family Version 기반 즉시 무효화 지원
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final StringRedisTemplate stringRedisTemplate;

    @Value("${spring.jwt.refresh.expires-ms}")
    private long refreshTtlMs;

    @Value("${spring.jwt.secret}")
    private String jwtSecret;

    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";
    private static final String MEMBER_TOKEN_PREFIX = "member_token:";
    private static final String RT_USED_PREFIX = "rt:used:";
    private static final String RT_BAN_PREFIX = "rt:ban:";
    private static final String FAMILY_VERSION_PREFIX = "family:ver:";

    /**
     * Refresh Token을 Redis에 저장
     * Key: "refresh_token:{jti}" → Value: "{memberId}"
     * Key: "member_token:{memberId}" → Value: "{jti}" (최신 토큰 추적용)
     *
     * @param jti       JWT ID (Refresh Token의 고유 식별자)
     * @param memberId  회원 ID
     */
    public void saveRefreshToken(String jti, Integer memberId) {
        String refreshTokenKey = REFRESH_TOKEN_PREFIX + jti;
        String memberTokenKey = MEMBER_TOKEN_PREFIX + memberId;

        // 기존 Refresh Token이 있다면 삭제 (토큰 회전 시 이전 토큰 무효화)
        String existingJti = stringRedisTemplate.opsForValue().get(memberTokenKey);
        if (existingJti != null) {
            String oldRefreshTokenKey = REFRESH_TOKEN_PREFIX + existingJti;
            stringRedisTemplate.delete(oldRefreshTokenKey);
            log.info("기존 Refresh Token 삭제: jti={}, memberId={}", existingJti, memberId);
        }

        // 새로운 Refresh Token 저장
        long ttlSeconds = refreshTtlMs / 1000;
        stringRedisTemplate.opsForValue().set(refreshTokenKey, memberId.toString(), ttlSeconds, TimeUnit.SECONDS);
        stringRedisTemplate.opsForValue().set(memberTokenKey, jti, ttlSeconds, TimeUnit.SECONDS);

        log.info("Refresh Token 저장 완료: jti={}, memberId={}, ttl={}초", jti, memberId, ttlSeconds);
    }

    /**
     * Refresh Token이 유효한지 확인 (재사용 탐지)
     *
     * @param jti      JWT ID
     * @param memberId 회원 ID
     * @return 유효하면 true, 없거나 불일치하면 false
     */
    public boolean isValidRefreshToken(String jti, Integer memberId) {
        String refreshTokenKey = REFRESH_TOKEN_PREFIX + jti;
        String storedMemberId = stringRedisTemplate.opsForValue().get(refreshTokenKey);

        if (storedMemberId == null) {
            log.warn("Refresh Token이 Redis에 없음 (재사용 의심): jti={}", jti);
            return false;
        }

        if (!storedMemberId.equals(memberId.toString())) {
            log.warn("Refresh Token의 memberId 불일치 (재사용 의심): jti={}, 기대={}, 실제={}", 
                    jti, memberId, storedMemberId);
            return false;
        }

        return true;
    }

    /**
     * Refresh Token 삭제 (로그아웃 시 사용)
     *
     * @param jti JWT ID
     */
    public void deleteRefreshToken(String jti) {
        String refreshTokenKey = REFRESH_TOKEN_PREFIX + jti;
        String memberIdStr = stringRedisTemplate.opsForValue().get(refreshTokenKey);

        if (memberIdStr != null) {
            String memberTokenKey = MEMBER_TOKEN_PREFIX + memberIdStr;
            stringRedisTemplate.delete(refreshTokenKey);
            stringRedisTemplate.delete(memberTokenKey);
            log.info("Refresh Token 삭제 완료: jti={}, memberId={}", jti, memberIdStr);
        } else {
            log.warn("삭제할 Refresh Token이 Redis에 없음: jti={}", jti);
        }
    }

    /**
     * 회원의 모든 Refresh Token 삭제 (강제 로그아웃 시 사용)
     *
     * @param memberId 회원 ID
     */
    public void deleteAllRefreshTokensByMemberId(Integer memberId) {
        String memberTokenKey = MEMBER_TOKEN_PREFIX + memberId;
        String jti = stringRedisTemplate.opsForValue().get(memberTokenKey);

        if (jti != null) {
            String refreshTokenKey = REFRESH_TOKEN_PREFIX + jti;
            stringRedisTemplate.delete(refreshTokenKey);
            stringRedisTemplate.delete(memberTokenKey);
            log.info("회원의 모든 Refresh Token 삭제 완료: memberId={}, jti={}", memberId, jti);
        }
    }

    /**
     * JTI를 HMAC-SHA256으로 해시 (원문 보관 금지)
     */
    private String hashJti(String jti) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(jti.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("JTI 해시 실패: {}", e.getMessage(), e);
            // 폴백: SHA-256 해시
            try {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] hash = digest.digest(jti.getBytes(StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder();
                for (byte b : hash) {
                    sb.append(String.format("%02x", b));
                }
                return sb.toString();
            } catch (Exception ex) {
                throw new RuntimeException("JTI 해시 실패", ex);
            }
        }
    }

    /**
     * Refresh Token 사용 여부 마킹 (원타임 체크)
     * @param jti JWT ID
     * @param ttlSeconds TTL (초)
     * @return 처음 사용이면 true, 이미 사용된 경우 false
     */
    public boolean markUsedIfFirst(String jti, long ttlSeconds) {
        String jtiHash = hashJti(jti);
        String key = RT_USED_PREFIX + jtiHash;
        
        // SETNX: 키가 없으면 설정, 있으면 실패
        Boolean success = stringRedisTemplate.opsForValue().setIfAbsent(key, "1", ttlSeconds, TimeUnit.SECONDS);
        
        if (Boolean.TRUE.equals(success)) {
            log.debug("Refresh Token 사용 마킹: jtiHash={}, ttl={}초", jtiHash, ttlSeconds);
            return true;
        } else {
            log.warn("Refresh Token 재사용 감지: jtiHash={}", jtiHash);
            return false;
        }
    }

    /**
     * Family가 차단되었는지 확인
     * @param familyId Family ID
     * @return 차단되었으면 true
     */
    public boolean isFamilyBanned(String familyId) {
        String key = RT_BAN_PREFIX + familyId;
        Boolean exists = stringRedisTemplate.hasKey(key);
        return Boolean.TRUE.equals(exists);
    }

    /**
     * Family를 차단 (재사용 감지 시 호출)
     * @param familyId Family ID
     */
    public void banFamily(String familyId) {
        String key = RT_BAN_PREFIX + familyId;
        stringRedisTemplate.opsForValue().set(key, "1");
        log.warn("Family 차단: fid={}", familyId);
    }

    /**
     * Family Version 가져오기 (없으면 기본값 1)
     * @param familyId Family ID
     * @return Family Version
     */
    public int getFamilyVersion(String familyId) {
        String key = FAMILY_VERSION_PREFIX + familyId;
        String versionStr = stringRedisTemplate.opsForValue().get(key);
        if (versionStr == null) {
            return 1;
        }
        try {
            return Integer.parseInt(versionStr);
        } catch (NumberFormatException e) {
            log.warn("Family Version 파싱 실패: fid={}, value={}", familyId, versionStr);
            return 1;
        }
    }

    /**
     * Family Version 증가 (재사용 감지 시 호출하여 AT 즉시 무효화)
     * @param familyId Family ID
     * @return 증가된 버전
     */
    public long incrementFamilyVersion(String familyId) {
        String key = FAMILY_VERSION_PREFIX + familyId;
        Long newVersion = stringRedisTemplate.opsForValue().increment(key);
        if (newVersion == null || newVersion == 1) {
            // 키가 없어서 처음 생성된 경우, 기본값 2로 설정
            stringRedisTemplate.opsForValue().set(key, "2");
            log.warn("Family Version 증가: fid={}, 새 버전=2", familyId);
            return 2;
        }
        log.warn("Family Version 증가: fid={}, 새 버전={}", familyId, newVersion);
        return newVersion;
    }

    // ✅ 관리자 Refresh Token 저장 (familyId 없이)
    public void saveAdminRefreshToken(Integer adminId, String jti, String refreshToken, long ttlMs) {
        String key = "admin:refresh:" + adminId + ":" + jti;
        stringRedisTemplate.opsForValue().set(key, refreshToken, ttlMs, TimeUnit.MILLISECONDS);
    }

    // ✅ 관리자 Refresh Token 조회
    public String getAdminRefreshToken(Integer adminId, String jti) {
        String key = "admin:refresh:" + adminId + ":" + jti;
        return stringRedisTemplate.opsForValue().get(key);
    }

    // ✅ 관리자 Refresh Token 삭제 (로그아웃)
    public void deleteAdminRefreshToken(Integer adminId, String jti) {
        String key = "admin:refresh:" + adminId + ":" + jti;
        stringRedisTemplate.delete(key);
    }
}

