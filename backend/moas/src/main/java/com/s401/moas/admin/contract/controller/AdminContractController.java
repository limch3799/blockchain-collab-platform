package com.s401.moas.admin.contract.controller;

import com.s401.moas.admin.contract.controller.request.AdminCancelRequest;
import com.s401.moas.admin.contract.controller.response.ContractListResponse;
import com.s401.moas.admin.contract.controller.response.ContractLogResponse;
import com.s401.moas.admin.contract.controller.response.ContractStatisticsResponse;
import com.s401.moas.admin.contract.controller.response.ContractStatusUpdateResponse;
import com.s401.moas.admin.contract.service.AdminContractService;
import com.s401.moas.admin.contract.service.dto.ContractListDto;
import com.s401.moas.admin.contract.service.dto.ContractLogDto;
import com.s401.moas.admin.contract.service.dto.ContractStatisticsDto;
import com.s401.moas.contract.controller.request.AdminCancelApproveRequest;
import com.s401.moas.contract.controller.response.ContractCancelResponse;
import com.s401.moas.contract.controller.response.ContractDetailResponse;
import com.s401.moas.contract.domain.ContractStatus;
import com.s401.moas.contract.service.dto.ContractDetailDto;
import com.s401.moas.contract.service.dto.ContractStatusUpdateDto;
import com.s401.moas.global.security.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.annotation.Profile;

import java.util.List;

@Profile("admin")
@RestController
@RequestMapping("/admin/api/contracts")
@RequiredArgsConstructor
public class AdminContractController implements AdminContractControllerSpec {

    private final AdminContractService adminContractService;

    @Override
    @GetMapping
    public ResponseEntity<ContractListResponse> getContracts(
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) ContractStatus status,
            @RequestParam(required = false) Long memberId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<ContractListDto> result = adminContractService.getContracts(
                searchType, searchKeyword, title, status, memberId, projectId, page, size
        );

        ContractListResponse response = ContractListResponse.from(result);

        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/statistics")
    public ResponseEntity<ContractStatisticsResponse> getStatistics() {
        ContractStatisticsDto dto = adminContractService.getStatistics();
        ContractStatisticsResponse response = ContractStatisticsResponse.from(dto);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/{contractId}")
    public ResponseEntity<ContractDetailResponse> getContractDetail(
            @PathVariable Long contractId
    ) {
        ContractDetailDto dto = adminContractService.getContractDetail(contractId);
        ContractDetailResponse response = ContractDetailResponse.from(dto);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/{contractId}/logs")
    public ResponseEntity<ContractLogResponse> getContractLogs(
            @PathVariable Long contractId
    ) {
        List<ContractLogDto> dtos = adminContractService.getContractLogs(contractId);
        ContractLogResponse response = ContractLogResponse.from(dtos);
        return ResponseEntity.ok(response);
    }

    @Override
    @PostMapping("/cancellation-requests/{contractId}/approve")
    public ResponseEntity<ContractStatusUpdateResponse> approveContractCancellation(
            @PathVariable Long contractId,
            @RequestBody @Valid AdminCancelRequest request) {

        Integer adminMemberId = SecurityUtil.getCurrentMemberId();

        ContractStatusUpdateDto updatedDto = adminContractService.approveContractCancellation(
                contractId,
                adminMemberId,
                request.getAdminMemo(),
                request.getArtistWorkingRatio()
        );

        ContractStatusUpdateResponse response = ContractStatusUpdateResponse.from(updatedDto);

        return ResponseEntity.ok(response);
    }

    @Override
    @PostMapping("/cancellation-requests/{contractId}/reject")
    public ResponseEntity<ContractStatusUpdateResponse> rejectCancellation(
            @PathVariable Long contractId,
            @RequestBody @Valid AdminCancelRequest request
    ) {
        Integer adminMemberId = SecurityUtil.getCurrentMemberId();
        ContractStatusUpdateDto dto = adminContractService.rejectContractCancellation(
                contractId, adminMemberId, request.getAdminMemo()
        );
        ContractStatusUpdateResponse response = ContractStatusUpdateResponse.from(dto);
        return ResponseEntity.ok(response);
    }
}