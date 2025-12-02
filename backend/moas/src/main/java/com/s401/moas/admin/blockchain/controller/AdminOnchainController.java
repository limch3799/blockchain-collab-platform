package com.s401.moas.admin.blockchain.controller;

import com.s401.moas.admin.blockchain.service.AdminOnchainService;
import com.s401.moas.admin.blockchain.service.dto.FailedOnchainRecordDto;
import com.s401.moas.admin.blockchain.service.dto.OnchainRecordDetailDto;
import com.s401.moas.admin.blockchain.service.dto.RetryResponseDto;
import com.s401.moas.blockchain.domain.ActionType;


import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Profile("admin")
@RestController
@RequestMapping("/admin/api/onchain-records")
@RequiredArgsConstructor
public class AdminOnchainController {

    private final AdminOnchainService adminOnchainService;

    @GetMapping("/failed")
    public ResponseEntity<Page<FailedOnchainRecordDto>> getFailedRecords(
            // Spring Data의 Pageable을 사용하여 페이징 파라미터를 자동으로 받습니다.
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) ActionType type
    ) {
        Page<FailedOnchainRecordDto> failedRecords = adminOnchainService.getFailedRecords(
                pageable, type
        );
        return ResponseEntity.ok(failedRecords);
    }

    @GetMapping("/{recordId}/details")
    public ResponseEntity<OnchainRecordDetailDto> getRecordDetails(
            @PathVariable Long recordId
    ) {
        OnchainRecordDetailDto recordDetails = adminOnchainService.getOnchainRecordDetails(recordId);
        return ResponseEntity.ok(recordDetails);
    }

    @PostMapping("/{recordId}/retry")
    public ResponseEntity<RetryResponseDto> retryFailedJob(
            @PathVariable Long recordId
    ) {
        RetryResponseDto response = adminOnchainService.retryFailedJob(recordId);
        // 202 Accepted: 요청이 접수되었으며, 비동기적으로 처리될 것임을 나타냄
        return ResponseEntity.accepted().body(response);
    }
}