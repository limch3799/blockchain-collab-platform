package com.s401.moas.auth.controller;

import java.util.Date;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.s401.moas.auth.controller.request.LoginRequest;
import com.s401.moas.auth.controller.response.LoginResponse;
import com.s401.moas.auth.controller.response.RefreshResponse;
import com.s401.moas.auth.exception.AuthException;
import com.s401.moas.auth.service.RefreshTokenService;
import com.s401.moas.auth.service.Web3AuthService;
import com.s401.moas.auth.service.dto.Web3AuthMemberDto;
import com.s401.moas.global.exception.ResourceNotFoundException;
import com.s401.moas.global.security.JWTUtil;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.repository.MemberRepository;
import com.s401.moas.member.service.MemberService;
import com.s401.moas.member.service.dto.MemberUpsertResultDto;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController implements AuthControllerSpec {

    private final Web3AuthService web3AuthService;
    private final JWTUtil jwtUtil;
    private final MemberService memberService;
    private final MemberRepository memberRepository;
    private final RefreshTokenService refreshTokenService;

    @Value("${spring.jwt.refresh.expires-ms}")
    private long refreshTtlMs;

    @PostMapping("/login")
    @Override
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        // 1) idToken 파싱→ 우리 서비스에 필요한 최소 정보만 DTO로 획득
        Web3AuthMemberDto info = web3AuthService.parseIdToken(request.idToken(), request.walletAddress());

        // 2) 회원 upsert (Provider + provider_id로 unique 검사)
        MemberUpsertResultDto result = memberService.upsertWeb3AuthMember(info);
        Integer memberId = result.getMemberId();
        boolean isNewUser = result.isNewUser();

        // 3) Member 정보 조회하여 role 추출
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("회원", memberId));

        // 4) [중요] 교차 검증 1: DB의 지갑 주소가 요청된 주소와 일치하는가?
        // (시나리오: providerId로 찾았는데, walletAddress가 다름. 계정 탈취 시도)
        if (!member.getWalletAddress().equalsIgnoreCase(request.walletAddress())) {
            log.error("🚨 보안 경고: WalletAddress 불일치. DB: {}, Request: {}",
                    member.getWalletAddress(), request.walletAddress());
            throw AuthException.invalidArguments(); // 400 Bad Request
        }

        // 5) [중요] 교차 검증 2: DB의 providerId가 토큰의 providerId와 일치하는가?
        // (시나리오: walletAddress로 찾았는데, providerId가 다름. 계정 탈취 시도)
        if (!member.getProviderId().equals(info.getProviderId())) {
            log.error("🚨 보안 경고: ProviderID 불일치. DB: {}, Token: {}",
                    member.getProviderId(), info.getProviderId());
            throw AuthException.invalidArguments(); // 400 Bad Request
        }

        // 6) 탈퇴 회원 체크
        if (member.getDeletedAt() != null) {
            log.warn("탈퇴한 회원 로그인 시도: memberId={}, provider={}, providerId={}",
                    memberId, member.getProvider(), member.getProviderId());
            throw new ResourceNotFoundException("회원", memberId);
        }

        String role = member.getRole().name();

        // 7) Family ID 및 Session ID 생성
        String familyId = UUID.randomUUID().toString();
        String sessionId = UUID.randomUUID().toString();

        // 8) Family Version 가져오기 (없으면 기본값 1)
        int familyVersion = refreshTokenService.getFamilyVersion(familyId);

        // 9) JWT ID (JTI) 생성 (Refresh Token 회전/재사용 탐지용)
        String jti = UUID.randomUUID().toString();

        // 10) Access Token 생성 (familyId, sessionId, familyVersion 포함)
        String accessToken = jwtUtil.createAccessToken(memberId, role, familyId, sessionId, familyVersion);

        // 11) Refresh Token 생성 (familyId, sessionId 포함)
        String refreshToken = jwtUtil.createRefreshToken(memberId, familyId, sessionId, jti);

        // 12) Refresh Token을 Redis에 저장 (회전/재사용 탐지용)
        refreshTokenService.saveRefreshToken(jti, memberId);

        // 13) Refresh Token을 HttpOnly 쿠키로 저장
        addRefreshTokenCookie(response, refreshToken);

        // 14) 응답 바디
        LoginResponse loginResponse = LoginResponse.builder()
                .accessToken(accessToken)
                .newUser(isNewUser)
                .build();
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/refresh")
    @Override
    public ResponseEntity<RefreshResponse> refresh(@CookieValue(value = "rt", required = false) String refreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        // 쿠키에서 refreshToken 읽기
        if (refreshToken == null || refreshToken.isBlank()) {
            throw AuthException.refreshTokenCookieNotFound();
        }

        // 1) RT 서명/만료 검증 및 클레임 추출
        if (jwtUtil.isExpired(refreshToken)) {
            throw AuthException.refreshTokenExpired();
        }

        Integer memberId = jwtUtil.getMemberId(refreshToken);
        String familyId = jwtUtil.getFamilyId(refreshToken);
        String sessionId = jwtUtil.getSessionId(refreshToken);
        String jti = jwtUtil.getJti(refreshToken);

        if (familyId == null || sessionId == null || jti == null) {
            log.warn("Refresh Token에 필수 클레임 없음: memberId={}", memberId);
            throw AuthException.refreshTokenInvalid();
        }

        // RT 만료까지 남은 시간 계산
        Date expiration = jwtUtil.parseClaims(refreshToken).getExpiration();
        long remainingSeconds = Math.max(0, (expiration.getTime() - System.currentTimeMillis()) / 1000);
        long ttlSeconds = remainingSeconds + 120; // 여유 시간 추가

        // 2) Ban 가드
        if (refreshTokenService.isFamilyBanned(familyId)) {
            log.warn("Family 차단됨: fid={}, memberId={}", familyId, memberId);
            throw AuthException.sessionBlocked();
        }

        // 3) 원타임 체크 (재사용 감지)
        boolean firstUse = refreshTokenService.markUsedIfFirst(jti, ttlSeconds);
        if (!firstUse) {
            // 재사용 감지 → 즉시 전체 무효화
            refreshTokenService.incrementFamilyVersion(familyId); // AT 즉시 전부 무효화
            refreshTokenService.banFamily(familyId); // RT 갱신도 차단

            log.error("🚨 Refresh Token 재사용 감지: memberId={}, fid={}, sid={}, jti={}",
                    memberId, familyId, sessionId, jti);

            throw AuthException.refreshTokenReuseDetected();
        }

        // 4) 정상 처리 → 회전 발급
        // Member 정보 조회하여 role 추출
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("회원", memberId));
        String role = member.getRole().name();

        // 현재 Family Version 가져오기
        int familyVersion = refreshTokenService.getFamilyVersion(familyId);

        // 새 토큰 발급
        String newJti = UUID.randomUUID().toString();
        String newRefreshToken = jwtUtil.createRefreshToken(memberId, familyId, sessionId, newJti);
        String newAccessToken = jwtUtil.createAccessToken(memberId, role, familyId, sessionId, familyVersion);

        // 새 Refresh Token을 Redis에 저장
        refreshTokenService.saveRefreshToken(newJti, memberId);

        // Refresh Token을 HttpOnly 쿠키로 저장
        addRefreshTokenCookie(httpResponse, newRefreshToken);

        log.info("✅ Refresh Token 재발급 완료: memberId={}, fid={}, sid={}", memberId, familyId, sessionId);

        return ResponseEntity.ok(RefreshResponse.builder()
                .accessToken(newAccessToken)
                .build());
    }

    @PostMapping("/logout")
    @Override
    public ResponseEntity<Void> logout(
            @CookieValue(value = "rt", required = false) String refreshToken,
            HttpServletRequest request,
            HttpServletResponse response) {

        // 1) Authorization 헤더에서 Access Token 추출
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw AuthException.refreshTokenInvalid();
        }

        String accessToken = authorization.split(" ")[1];

        // 2) Access Token 검증 및 만료 확인
        if (jwtUtil.isExpired(accessToken)) {
            throw AuthException.refreshTokenExpired();
        }

        // 3) Access Token에서 정보 추출
        Integer memberId = jwtUtil.getMemberId(accessToken);
        String familyId = jwtUtil.getFamilyId(accessToken);
        String sessionId = jwtUtil.getSessionId(accessToken);

        if (familyId == null || sessionId == null) {
            log.warn("Access Token에 필수 클레임 없음: memberId={}", memberId);
            throw AuthException.refreshTokenInvalid();
        }

        // 4) Refresh Token 쿠키에서 jti 추출
        if (refreshToken != null && !refreshToken.isBlank()) {
            try {
                // Refresh Token 만료 확인은 하지 않음 (로그아웃이므로)
                String jti = jwtUtil.getJti(refreshToken);

                // Refresh Token의 familyId, sessionId가 Access Token과 일치하는지 확인
                String rtFamilyId = jwtUtil.getFamilyId(refreshToken);
                String rtSessionId = jwtUtil.getSessionId(refreshToken);

                if (rtFamilyId != null && rtSessionId != null &&
                        rtFamilyId.equals(familyId) && rtSessionId.equals(sessionId)) {
                    // 5) Refresh Token을 Redis에서 삭제
                    refreshTokenService.deleteRefreshToken(jti);
                    log.info("✅ Refresh Token 삭제 완료: memberId={}, jti={}, fid={}, sid={}",
                            memberId, jti, familyId, sessionId);
                } else {
                    log.warn("Refresh Token의 familyId/sessionId 불일치: memberId={}, fid={}, sid={}",
                            memberId, familyId, sessionId);
                }
            } catch (Exception e) {
                log.warn("Refresh Token 파싱 실패 (무시하고 계속 진행): {}", e.getMessage());
            }
        }

        // 6) Family Version 증가시켜 Access Token 무효화
        refreshTokenService.incrementFamilyVersion(familyId);

        // 7) Refresh Token 쿠키 삭제
        deleteRefreshTokenCookie(response);

        log.info("✅ 로그아웃 완료: memberId={}, fid={}, sid={}", memberId, familyId, sessionId);

        return ResponseEntity.ok().build();
    }

    private void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        // Set-Cookie: rt=<JWT>; Path=/api/auth/refresh; HttpOnly; Secure; SameSite=Lax;
        // Max-Age={refreshTtlSeconds}
        long maxAgeSeconds = refreshTtlMs / 1000;
        response.addHeader("Set-Cookie",
                "rt=%s; Path=/api/auth/refresh; HttpOnly; Secure; SameSite=Lax; Max-Age=%d".formatted(refreshToken,
                        maxAgeSeconds));
    }

    private void deleteRefreshTokenCookie(HttpServletResponse response) {
        // Set-Cookie: rt=; Path=/api/auth/refresh; HttpOnly; Secure; SameSite=Lax;
        // Max-Age=0
        response.addHeader("Set-Cookie",
                "rt=; Path=/api/auth/refresh; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
    }
}