package com.s401.moas.admin.feepolicy.controller;

import com.s401.moas.admin.feepolicy.controller.request.FeePolicyUpdateRequest;
import com.s401.moas.admin.feepolicy.controller.response.FeePolicyHistoryResponse;
import com.s401.moas.admin.feepolicy.controller.response.FeePolicyUpdateResponse;
import com.s401.moas.admin.feepolicy.service.AdminFeePolicyService;
import com.s401.moas.admin.feepolicy.service.dto.FeePolicyHistoryDto;
import com.s401.moas.admin.feepolicy.service.dto.FeePolicyUpdateDto;
import com.s401.moas.global.security.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.annotation.Profile;

@Profile("admin")
@RestController
@RequestMapping("/admin/api/fee-policies")
@RequiredArgsConstructor
public class AdminFeePolicyController implements AdminFeePolicyControllerSpec {

    private final AdminFeePolicyService adminFeePolicyService;

    @PutMapping
    @Override
    public ResponseEntity<FeePolicyUpdateResponse> updateFeePolicy(@Valid @RequestBody FeePolicyUpdateRequest request) {
        Integer adminId = SecurityUtil.getCurrentAdminId();
        FeePolicyUpdateDto dto = adminFeePolicyService.updateFeePolicy(request, adminId);
        FeePolicyUpdateResponse response = FeePolicyUpdateResponse.from(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Override
    public ResponseEntity<FeePolicyHistoryResponse> getFeePolicyHistory() {
        FeePolicyHistoryDto dto = adminFeePolicyService.getFeePolicyHistory();
        FeePolicyHistoryResponse response = FeePolicyHistoryResponse.from(dto);
        return ResponseEntity.ok(response);
    }
}