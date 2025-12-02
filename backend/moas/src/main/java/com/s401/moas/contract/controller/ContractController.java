package com.s401.moas.contract.controller;

import com.s401.moas.contract.controller.response.ContractCancelResponse;
import com.s401.moas.contract.controller.request.*;
import com.s401.moas.contract.controller.response.*;
import com.s401.moas.contract.domain.ContractStatus;
import com.s401.moas.contract.exception.ContractException;
import com.s401.moas.contract.service.ContractAssistantService;
import com.s401.moas.contract.service.ContractService;
import com.s401.moas.contract.service.dto.*;
import com.s401.moas.global.security.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/contracts")
@Tag(name = "Contract", description = "계약 관리 API")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;
    private final ContractAssistantService contractAssistantService;

    @Operation(summary = "계약서 상세 조회", description = "특정 계약서의 상세 내용을 조회합니다. 계약 참여자(리더, 아티스트)만 조회 가능합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "계약서 조회 성공",
                    content = @Content(schema = @Schema(implementation = ContractDetailResponse.class))), // 성공 스키마 변경
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "계약서를 조회할 권한이 없는 경우 (계약 참여자가 아님)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "계약서가 존재하지 않는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{contractId}")
    public ResponseEntity<ContractDetailResponse> getContractDetails(@PathVariable Long contractId) {
        Integer memberId = SecurityUtil.getCurrentMemberId();

        log.info("계약서 상세 조회 요청: contractId={}, memberId={}", contractId, memberId);

        ContractDetailDto dto = contractService.getContractDetails(contractId, memberId);
        ContractDetailResponse response = ContractDetailResponse.from(dto);

        log.info("계약서 상세 조회 성공: contractId={}", contractId);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "계약 거절 (아티스트)", description = "아티스트가 제시된 계약 조건을 거절합니다. 계약 상태가 DECLINED로 변경됩니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "계약 거절 성공"),
            @ApiResponse(responseCode = "403", description = "계약 당사자(아티스트)가 아닌 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "계약서가 존재하지 않는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "대기중(PENDING) 상태가 아닌 계약서를 처리하려는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/{contractId}/decline")
    public ResponseEntity<ContractDeclineResponse> declineContract(
            @PathVariable Long contractId) {

        Integer artistMemberId = SecurityUtil.getCurrentMemberId();

        log.info("==> 계약 거절 요청: contractId={}, artistId={}", contractId, artistMemberId);

        ContractStatusUpdateDto updatedDto = contractService.declineContract(contractId, artistMemberId);
        ContractDeclineResponse response = ContractDeclineResponse.from(updatedDto);

        log.info("<== 계약 거절 성공: contractId={}, newStatus={}", response.getContractId(), response.getStatus());

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "수정 계약서 재제시 (리더)", description = "리더가 거절(DECLINED)된 계약을 수정하여 다시 제안합니다. 계약 상태가 PENDING으로 변경됩니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "계약 재제시 성공"),
            @ApiResponse(responseCode = "403", description = "프로젝트 리더가 아닌 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "계약서가 존재하지 않는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "거절(DECLINED) 상태가 아닌 계약서를 수정하려는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/{contractId}")
    public ResponseEntity<ContractUpdateResponse> reofferContract(
            @PathVariable Long contractId,
            @Valid @RequestBody ContractUpdateRequest request) {

        Integer leaderMemberId = SecurityUtil.getCurrentMemberId();

        log.info("수정 계약 재제시 요청: contractId={}, leaderId={}", contractId, leaderMemberId);

        ContractStatusUpdateDto updatedDto = contractService.reofferContract(contractId, leaderMemberId, request);
        ContractUpdateResponse response = ContractUpdateResponse.from(updatedDto);

        log.info("수정 계약 재제시 성공: contractId={}, newStatus={}", response.getContractId(), response.getStatus());

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "계약 제안 철회 (리더)", description = "리더가 PENDING 또는 DECLINED 상태의 계약 제안을 철회합니다. 계약 상태가 WITHDRAWN으로 변경됩니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "계약 제안 철회 성공"),
            @ApiResponse(responseCode = "403", description = "프로젝트 리더가 아닌 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "계약서가 존재하지 않는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "철회 불가능한 상태의 계약서인 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/{contractId}/withdraw")
    public ResponseEntity<ContractUpdateResponse> withdrawContract(
            @PathVariable Long contractId) {

        Integer leaderMemberId = SecurityUtil.getCurrentMemberId();

        log.info("계약 제안 철회 요청: contractId={}, leaderId={}", contractId, leaderMemberId);

        ContractStatusUpdateDto updatedDto = contractService.withdrawContract(contractId, leaderMemberId);
        // ContractUpdateResponse를 재사용하여 응답 DTO 생성
        ContractUpdateResponse response = ContractUpdateResponse.from(updatedDto);

        log.info("계약 제안 철회 성공: contractId={}, newStatus={}", response.getContractId(), response.getStatus());

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "EIP-712 서명 데이터 조회", description = "계약서 서명을 위한 EIP-712 구조화된 데이터를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "서명 데이터 조회 성공"),
            @ApiResponse(responseCode = "403", description = "계약 참여자가 아닌 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "계약서가 존재하지 않는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{contractId}/signature-data")
    public ResponseEntity<TypedDataResponse> getSignatureData(@PathVariable Long contractId) {
        Integer memberId = SecurityUtil.getCurrentMemberId();

        log.info("EIP-712 서명 데이터 요청: contractId={}, memberId={}", contractId, memberId);

        TypedDataResponse response = contractService.getSignatureData(contractId, memberId);

        log.info("EIP-712 서명 데이터 제공 성공: contractId={}", contractId);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "계약 수락 (아티스트)", description = "아티스트가 제시된 계약에 동의하고 전자 서명을 제출합니다. 계약 상태가 ARTIST_SIGNED로 변경됩니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "계약 수락 성공"),
            @ApiResponse(responseCode = "400", description = "서명값이 누락된 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "계약 당사자(아티스트)가 아닌 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "계약서가 존재하지 않는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "대기중(PENDING) 상태가 아닌 계약서를 수락하려는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/{contractId}/accept")
    public ResponseEntity<ContractAcceptResponse> acceptContract(
            @PathVariable Long contractId,
            @Valid @RequestBody ContractAcceptRequest request) {

        Integer artistMemberId = SecurityUtil.getCurrentMemberId();

        log.info("계약 수락 요청: contractId={}, artistId={}", contractId, artistMemberId);

        ContractStatusUpdateDto updatedDto = contractService.acceptContract(
                contractId,
                artistMemberId,
                request.getArtistSignature()
        );
        ContractAcceptResponse response = ContractAcceptResponse.from(updatedDto);

        log.info("계약 수락 성공: contractId={}, newStatus={}", response.getContractId(), response.getStatus());

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "계약 체결 및 결제 요청 (리더)", description = "리더가 아티스트가 수락한 계약에 최종 서명하고 결제를 시작합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "서명 완료 및 결제 준비 성공"),
            @ApiResponse(responseCode = "403", description = "프로젝트 리더가 아닌 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "계약서가 존재하지 않는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "아티스트가 수락한(ARTIST_SIGNED) 상태가 아닌 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/{contractId}/finalize")
    public ResponseEntity<ContractFinalizeResponse> finalizeContract(
            @PathVariable Long contractId,
            @Valid @RequestBody ContractFinalizeRequest request) {

        Integer leaderMemberId = SecurityUtil.getCurrentMemberId();

        log.info("계약 체결 요청: contractId={}, leaderId={}", contractId, leaderMemberId);

        ContractFinalizeResponseDto responseDto = contractService.finalizeContract(
                contractId,
                leaderMemberId,
                request.getLeaderSignature(),
                request.getNftImageUrl()
        );
        ContractFinalizeResponse response = ContractFinalizeResponse.from(responseDto);

        log.info("계약 체결 및 결제 준비 성공: contractId={}, newStatus={}", response.getContractId(), response.getStatus());

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "계약 완료 및 구매 확정 (리더)",
            description = "프로젝트 리더가 계약 이행이 완료되었음을 확인하고 아티스트에게 대금을 정산하도록 요청합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "구매 확정 요청 성공",
                    content = @Content(schema = @Schema(implementation = ContractConfirmResponse.class))),

            @ApiResponse(responseCode = "401", description = "인증 토큰이 없거나 유효하지 않음 (Unauthorized)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),

            @ApiResponse(responseCode = "403", description = "해당 계약의 리더가 아님 (Forbidden)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),

            @ApiResponse(responseCode = "404", description = "ID에 해당하는 계약이 존재하지 않음 (Not Found)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),

            @ApiResponse(responseCode = "409", description = "계약이 구매 확정 가능한 상태(PAYMENT_COMPLETED)가 아님 (Conflict)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/{contractId}/confirm-payment")
    public ResponseEntity<ContractConfirmResponse> confirmPaymentAndCompleteContract(
            @PathVariable Long contractId) {

        Integer leaderMemberId = SecurityUtil.getCurrentMemberId();
        log.info("구매 확정 요청: contractId={}, leaderId={}", contractId, leaderMemberId);

        ContractStatusUpdateDto updatedDto = contractService.confirmPaymentAndTriggerSettlement(contractId, leaderMemberId);
        ContractConfirmResponse response = ContractConfirmResponse.from(updatedDto);

        log.info("구매 확정 성공: contractId={}, newStatus={}", response.getContractId(), response.getStatus());

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "계약 취소 요청 (리더/아티스트)",
            description = "결제가 완료된 계약에 대해 리더 또는 아티스트가 중도 취소를 요청합니다. " +
                    "API가 호출되면 contract.status는 CANCELLATION_REQUESTED로 변경되며, 이후 관리자의 검토 및 승인 절차를 거칩니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "취소 요청 성공", content = @Content(schema = @Schema(implementation = ContractCancelResponse.class))),
            @ApiResponse(responseCode = "400", description = "필수 값인 취소 사유(reason)가 누락됨", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "계약 당사자가 아님", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "계약이 취소 요청 가능한 상태가 아님", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/{contractId}/cancel")
    public ResponseEntity<ContractCancelResponse> requestContractCancellation(
            @PathVariable Long contractId,
            @Valid @RequestBody ContractCancelRequest request) {

        Integer memberId = SecurityUtil.getCurrentMemberId();

        ContractStatusUpdateDto updatedDto = contractService.requestContractCancellation(
                contractId, memberId, request.getReason());

        ContractCancelResponse response = ContractCancelResponse.from(updatedDto);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "내 계약 목록 조회 (진행/완료)", description = "현재 로그인한 사용자의 진행 전/진행 중/완료된 계약을 조회합니다. status 쿼리 파라미터로 필터링할 수 있습니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "계약 목록 조회 성공"),
            @ApiResponse(responseCode = "400", description = "유효하지 않은 status 값으로 요청한 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    public ResponseEntity<MyContractListResponse> getMyContracts(
            @Parameter(description = "필터링할 계약 상태(BEFORE_START, IN_PROGRESS, COMPLETED). 생략 시 전체 조회.")
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Integer memberId = SecurityUtil.getCurrentMemberId();
        ContractViewStatus viewStatus = parseViewStatus(status);
        Pageable pageable = PageRequest.of(page, size);

        MyContractListDto serviceDto = contractService.findMyContracts(memberId, viewStatus, pageable);
        MyContractListResponse response = MyContractListResponse.from(serviceDto);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "내 취소/취소 요청 계약 목록 조회", description = "현재 로그인한 사용자의 취소 요청/취소된 계약을 조회합니다. status 쿼리 파라미터로 필터링할 수 있습니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "취소 관련 계약 목록 조회 성공"),
            @ApiResponse(responseCode = "400", description = "유효하지 않은 status 값으로 요청한 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/canceled")
    public ResponseEntity<MyContractListResponse> getMyCanceledContracts(
            @Parameter(description = "필터링할 계약 상태(CANCELLATION_REQUESTED, CANCELED). 생략 시 전체 조회.")
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Integer memberId = SecurityUtil.getCurrentMemberId();
        ContractStatus contractStatus = parseCanceledStatus(status);
        Pageable pageable = PageRequest.of(page, size);

        MyContractListDto serviceDto = contractService.findMyCanceledContracts(memberId, contractStatus, pageable);
        MyContractListResponse response = MyContractListResponse.from(serviceDto);

        return ResponseEntity.ok(response);
    }

    private ContractViewStatus parseViewStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return null;
        }
        try {
            return ContractViewStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ContractException.invalidStatusParameter();
        }
    }

    private ContractStatus parseCanceledStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return null;
        }
        try {
            ContractStatus parsedStatus = ContractStatus.valueOf(status.trim().toUpperCase());
            if (parsedStatus != ContractStatus.CANCELLATION_REQUESTED && parsedStatus != ContractStatus.CANCELED) {
                throw ContractException.invalidStatusParameter();
            }
            return parsedStatus;
        } catch (IllegalArgumentException e) {
            throw ContractException.invalidStatusParameter();
        }
    }

    @Operation(
            operationId = "generate-contract-draft",
            summary = "계약서 초안 생성 (AI 어시스턴트)",
            description = "AI 어시스턴트를 사용하여 프로젝트 용역 계약서의 초안을 자동으로 생성합니다.\n" +
                    "입력된 계약 핵심 정보와 기존 프로젝트 공고 내용을 바탕으로, 법률적으로 명확한 표준 계약 문안을 JSON 형식으로 작성합니다.\n" +
                    "응답 생성에는 시간이 다소 소요될 수 있습니다 (최대 60초)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "계약서 초안 생성 성공", content = @Content(schema = @Schema(implementation = GenerateContractResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청: 요청 본문의 필수 필드가 누락되었거나 형식이 올바르지 않습니다.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자: 로그인이 필요합니다.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "권한 없음: 프로젝트 리더만 계약서를 생성할 수 있습니다.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "리소스를 찾을 수 없음: 요청에 포함된 프로젝트 ID 또는 포지션 ID에 해당하는 정보가 존재하지 않습니다.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류: LLM API 호출 실패 또는 응답 파싱 실패 등 예상치 못한 서버 오류가 발생했습니다.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "504", description = "게이트웨이 시간 초과: LLM API의 응답이 지연되어 시간 초과가 발생했습니다.", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/assistant")
    public ResponseEntity<GenerateContractResponse> generateContractDraft(
            @RequestBody @Valid GenerateContractRequest request) {

        GenerateContractResponse response = contractAssistantService.generateContract(request);
        return ResponseEntity.ok(response);
    }
}