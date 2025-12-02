package com.s401.moas.admin.auth.service;

import com.s401.moas.admin.auth.controller.request.AdminLoginRequest;
import com.s401.moas.admin.auth.controller.request.AdminRefreshRequest;
import com.s401.moas.admin.auth.controller.request.AdminSignupRequest;
import com.s401.moas.admin.auth.domain.Admin;
import com.s401.moas.admin.auth.exception.AdminAuthException;
import com.s401.moas.admin.auth.repository.AdminRepository;
import com.s401.moas.admin.auth.service.dto.AdminLoginDto;
import com.s401.moas.admin.auth.service.dto.AdminSignupDto;
import com.s401.moas.admin.auth.service.dto.AdminTokenDto;
import com.s401.moas.auth.service.RefreshTokenService;
import com.s401.moas.global.security.JWTUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    /**
     * 관리자 회원가입
     */
    @Transactional
    public AdminSignupDto signup(AdminSignupRequest request) {
        // 1. 로그인 ID 중복 체크
        if (adminRepository.existsByLoginIdAndDeletedAtIsNull(request.getLoginId())) {
            throw AdminAuthException.loginIdDuplicated();
        }

        // 2. 비밀번호 암호화
        String passwordHash = passwordEncoder.encode(request.getPassword());

        // 3. 관리자 생성
        Admin admin = Admin.builder()
                .loginId(request.getLoginId())
                .passwordHash(passwordHash)
                .name(request.getName())
                .build();

        Admin savedAdmin = adminRepository.save(admin);

        log.info("관리자 회원가입 완료: adminId={}, loginId={}", savedAdmin.getId(), savedAdmin.getLoginId());

        return AdminSignupDto.from(savedAdmin);
    }

    /**
     * 관리자 로그인
     */
    @Transactional
    public AdminLoginDto login(AdminLoginRequest request) {
        // 1. 관리자 조회
        Admin admin = adminRepository.findByLoginIdAndDeletedAtIsNull(request.getLoginId())
                .orElseThrow(AdminAuthException::adminNotFound);

        // 2. 삭제된 계정 체크
        if (admin.isDeleted()) {
            throw AdminAuthException.adminDeleted();
        }

        // 3. 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw AdminAuthException.invalidPassword();
        }

        // 4. JWT 토큰 생성
        String jti = UUID.randomUUID().toString();
        String accessToken = jwtUtil.createAdminAccessToken(admin.getId());
        String refreshToken = jwtUtil.createAdminRefreshToken(admin.getId(), jti);

        // 5. Refresh Token Redis 저장
        refreshTokenService.saveAdminRefreshToken(
                admin.getId(),
                jti,
                refreshToken,
                24 * 60 * 60 * 1000L  // 24시간
        );

        log.info("관리자 로그인 성공: adminId={}, loginId={}", admin.getId(), admin.getLoginId());

        return AdminLoginDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .name(admin.getName())
                .adminId(admin.getId())
                .build();
    }

    /**
     * 관리자 토큰 갱신
     */
    @Transactional
    public AdminTokenDto refresh(AdminRefreshRequest request) {
        String refreshToken = request.getRefreshToken();

        // 1. Refresh Token 파싱
        Integer adminId;
        String jti;
        try {
            adminId = jwtUtil.getMemberId(refreshToken);
            jti = jwtUtil.getJti(refreshToken);
        } catch (Exception e) {
            log.warn("Refresh Token 파싱 실패: {}", e.getMessage());
            throw AdminAuthException.refreshTokenInvalid();
        }

        // 2. Redis에서 Refresh Token 검증
        String storedToken = refreshTokenService.getAdminRefreshToken(adminId, jti);
        if (storedToken == null || !storedToken.equals(refreshToken)) {
            throw AdminAuthException.refreshTokenNotFound();
        }

        // 3. 관리자 존재 확인
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(AdminAuthException::adminNotFound);

        if (admin.isDeleted()) {
            throw AdminAuthException.adminDeleted();
        }

        // 4. 새 토큰 생성
        String newJti = UUID.randomUUID().toString();
        String newAccessToken = jwtUtil.createAdminAccessToken(adminId);
        String newRefreshToken = jwtUtil.createAdminRefreshToken(adminId, newJti);

        // 5. 기존 Refresh Token 삭제 및 새 토큰 저장
        refreshTokenService.deleteAdminRefreshToken(adminId, jti);
        refreshTokenService.saveAdminRefreshToken(
                adminId,
                newJti,
                newRefreshToken,
                24 * 60 * 60 * 1000L
        );

        log.info("관리자 토큰 갱신 성공: adminId={}", adminId);

        return AdminTokenDto.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    /**
     * 관리자 로그아웃
     */
    @Transactional
    public void logout(Integer adminId, String refreshToken) {
        try {
            String jti = jwtUtil.getJti(refreshToken);
            refreshTokenService.deleteAdminRefreshToken(adminId, jti);
            log.info("관리자 로그아웃 성공: adminId={}", adminId);
        } catch (Exception e) {
            log.warn("관리자 로그아웃 중 오류 발생: adminId={}, error={}", adminId, e.getMessage());
        }
    }
}