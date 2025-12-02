package com.s401.moas.admin.auth.controller;

import com.s401.moas.admin.auth.controller.request.AdminLoginRequest;
import com.s401.moas.admin.auth.controller.request.AdminRefreshRequest;
import com.s401.moas.admin.auth.controller.request.AdminSignupRequest;
import com.s401.moas.admin.auth.controller.response.AdminLoginResponse;
import com.s401.moas.admin.auth.controller.response.AdminSignupResponse;
import com.s401.moas.admin.auth.controller.response.AdminTokenResponse;
import com.s401.moas.admin.auth.service.AdminAuthService;
import com.s401.moas.admin.auth.service.dto.AdminLoginDto;
import com.s401.moas.admin.auth.service.dto.AdminSignupDto;
import com.s401.moas.admin.auth.service.dto.AdminTokenDto;
import com.s401.moas.global.security.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.annotation.Profile;

@Profile("admin")
@RestController
@RequestMapping("/admin/api")
@RequiredArgsConstructor
public class AdminAuthController implements AdminAuthControllerSpec {

    private final AdminAuthService adminAuthService;

    @PostMapping("/signup")  // ✅ 추가
    @Override
    public ResponseEntity<AdminSignupResponse> signup(@Valid @RequestBody AdminSignupRequest request) {
        AdminSignupDto dto = adminAuthService.signup(request);
        AdminSignupResponse response = AdminSignupResponse.from(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")  // ✅ 추가
    @Override
    public ResponseEntity<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        AdminLoginDto dto = adminAuthService.login(request);
        AdminLoginResponse response = AdminLoginResponse.from(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")  // ✅ 추가
    @Override
    public ResponseEntity<AdminTokenResponse> refresh(@Valid @RequestBody AdminRefreshRequest request) {
        AdminTokenDto dto = adminAuthService.refresh(request);
        AdminTokenResponse response = AdminTokenResponse.from(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")  // ✅ 추가
    @Override
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authorization,
                                       @Valid @RequestBody AdminRefreshRequest request) {
        Integer adminId = SecurityUtil.getCurrentAdminId();
        adminAuthService.logout(adminId, request.getRefreshToken());
        return ResponseEntity.noContent().build();
    }
}