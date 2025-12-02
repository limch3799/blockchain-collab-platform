package com.s401.moas.application.controller;

import com.s401.moas.application.controller.request.ApplicationCreateRequest;
import com.s401.moas.application.controller.request.ContractOfferRequest;
import com.s401.moas.application.controller.response.*;
import com.s401.moas.application.domain.ApplicationStatus;
import com.s401.moas.application.exception.ApplicationException;
import com.s401.moas.application.service.ApplicationService;
import com.s401.moas.application.service.dto.ApplicationDto;
import com.s401.moas.application.service.dto.ApplicationStatusUpdateDto;
import com.s401.moas.contract.service.ContractService;
import com.s401.moas.contract.service.dto.ContractOfferResponseDto;
import com.s401.moas.global.security.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api")
@Tag(name = "Application", description = "지원 관리 API")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ContractService contractService;

    @Operation(summary = "프로젝트 지원", description = "아티스트가 특정 프로젝트의 직무에 지원합니다. 성공 시 PENDING 상태의 지원서가 생성됩니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "프로젝트 지원 성공",
                    content = @Content(schema = @Schema(implementation = ApplicationCreateResponse.class))),
            @ApiResponse(responseCode = "400", description = "입력값 유효성 검증 실패 (e.g., 필수 파라미터 누락, 메시지 길이 초과)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "자신이 등록한 프로젝트에 지원하는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "프로젝트 또는 포트폴리오를 찾을 수 없는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "이미 해당 프로젝트에 지원한 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/projects/{projectId}/applications")
    public ResponseEntity<ApplicationCreateResponse> applyToProject(
            @PathVariable Long projectId, // 현재 로직에서는 미사용, 추후 유효성 검증에 사용 가능
            @Valid @RequestBody ApplicationCreateRequest request) {

        Integer memberId = SecurityUtil.getCurrentMemberId();

        log.info("프로젝트 지원 요청: projectId={}, memberId={}, portfolioId={}, positionId={}",
                projectId, memberId, request.getPortfolioId(), request.getProjectPositionId());

        ApplicationDto createdApplicationDto = applicationService.applyToProject(
                request.getProjectPositionId(),
                memberId,
                request.getPortfolioId(),
                request.getMessage()
        );

        ApplicationCreateResponse response = ApplicationCreateResponse.from(createdApplicationDto);

        log.info("프로젝트 지원 성공: applicationId={}", response.getApplicationId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "프로젝트 지원 취소", description = "아티스트가 제출했던 프로젝트 지원서를 취소합니다. (Soft Delete)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "지원 취소 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "지원서를 취소할 권한이 없는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "지원서가 존재하지 않거나 이미 취소된 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "대기중(PENDING) 상태가 아닌 지원서를 취소하려는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/applications/{applicationId}")
    public ResponseEntity<Void> cancelApplication(@PathVariable Long applicationId) {
        Integer memberId = SecurityUtil.getCurrentMemberId();

        log.info("지원 취소 요청: applicationId={}, memberId={}", applicationId, memberId);

        applicationService.cancelApplication(applicationId, memberId);

        log.info("지원 취소 성공: applicationId={}", applicationId);

        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "지원자 거절", description = "프로젝트 리더가 지원서를 검토 후 반려(거절)합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "지원서 반려 성공"),
            @ApiResponse(responseCode = "403", description = "프로젝트 리더가 아닌 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "지원서가 존재하지 않는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "대기중(PENDING) 상태가 아닌 지원서를 처리하려는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/applications/{applicationId}/reject")
    public ResponseEntity<ApplicationRejectResponse> rejectApplication(
            @PathVariable Long applicationId) {

        Integer leaderMemberId = SecurityUtil.getCurrentMemberId();

        log.info("지원서 거절 요청: applicationId={}, leaderId={}", applicationId, leaderMemberId);

        ApplicationStatusUpdateDto updatedDto = applicationService.rejectApplication(applicationId, leaderMemberId);
        ApplicationRejectResponse response = ApplicationRejectResponse.from(updatedDto);

        log.info("지원서 거절 성공: applicationId={}, newStatus={}", response.getApplicationId(), response.getStatus());

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "지원자에게 계약 제시", description = "프로젝트 리더가 지원자에게 계약을 제안합니다. 성공 시 지원서 상태는 OFFERED, 계약서 상태는 PENDING이 됩니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "계약 제시 성공"),
            @ApiResponse(responseCode = "400", description = "입력값 유효성 검증 실패",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "프로젝트 리더가 아닌 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "지원서가 존재하지 않는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "대기중(PENDING) 상태가 아닌 지원서에 제안하는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/applications/{applicationId}/offer-contract")
    public ResponseEntity<ContractOfferResponse> offerContract(
            @PathVariable Long applicationId,
            @Valid @RequestBody ContractOfferRequest request) {

        Integer leaderMemberId = SecurityUtil.getCurrentMemberId();

        log.info("계약 제시 요청: applicationId={}, leaderId={}", applicationId, leaderMemberId);

        ContractOfferResponseDto responseDto = contractService.offerContract(
                applicationId,
                leaderMemberId,
                request.getTitle(),
                request.getDescription(),
                request.getStartAt(),
                request.getEndAt(),
                request.getTotalAmount()
        );

        ContractOfferResponse response = ContractOfferResponse.from(responseDto);

        log.info("계약 제시 성공: applicationId={}, contractId={}, newAppStatus={}, newContractStatus={}",
                response.getApplicationId(), response.getContractId(), response.getApplicationStatus(), response.getContractStatus());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @Operation(summary = "프로젝트 지원자 목록 조회", description = "프로젝트 리더가 자신의 프로젝트에 지원한 아티스트 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "지원자 목록 조회 성공",
                    content = @Content(schema = @Schema(implementation = ApplicantListResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "프로젝트 리더가 아닌 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "프로젝트가 존재하지 않는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/projects/{projectId}/applications")
    public ResponseEntity<ApplicantListResponse> getApplicantList(@PathVariable Integer projectId) {
        Integer leaderMemberId = SecurityUtil.getCurrentMemberId();

        log.info("지원자 목록 조회 요청: projectId={}, leaderId={}", projectId, leaderMemberId);

        ApplicantListResponse response = applicationService.getApplicantList(projectId, leaderMemberId);

        log.info("지원자 목록 조회 성공: projectId={}, 조회된 지원자 수={}", projectId, response.getApplications().size());

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "프로젝트 지원자 상세 조회", description = "프로젝트 리더가 특정 지원서의 상세 내용을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "지원자 상세 조회 성공",
                    content = @Content(schema = @Schema(implementation = ApplicantDetailResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "해당 지원서를 조회할 권한이 없는 경우 (프로젝트 리더가 아님)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "지원서가 존재하지 않는 경우",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/applications/{applicationId}")
    public ResponseEntity<ApplicantDetailResponse> getApplicantDetail(@PathVariable Long applicationId) {
        Integer memberId = SecurityUtil.getCurrentMemberId();

        log.info("지원자 상세 조회 요청: applicationId={}, memberId={}", applicationId, memberId);

        ApplicantDetailResponse response = applicationService.getApplicantDetail(applicationId, memberId);

        log.info("지원자 상세 조회 성공: applicationId={}", applicationId);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "내 지원 현황 조회", description = "아티스트 본인이 지원한 프로젝트 현황을 페이지 단위로 조회합니다. (COMPLETED 상태 제외)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "지원 현황 목록 조회 성공",
                    content = @Content(schema = @Schema(implementation = MyApplicationListResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터 (유효하지 않은 status 값)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/applications/me")
    public ResponseEntity<MyApplicationListResponse> getMyApplications(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Integer memberId = SecurityUtil.getCurrentMemberId();

        ApplicationStatus queryStatus = null; // 서비스 계층으로 전달할 단일 상태 (생략 시 null)

        if (status != null && !status.trim().isEmpty()) {
            try {
                ApplicationStatus parsedStatus = ApplicationStatus.valueOf(status.trim().toUpperCase());

                // COMPLETED 상태는 조회에서 항상 제외되어야 하므로, 명시적으로 요청 시 예외 처리
                if (parsedStatus == ApplicationStatus.COMPLETED) {
                    throw ApplicationException.invalidApplicationStatus();
                }
                queryStatus = parsedStatus;
            } catch (IllegalArgumentException e) {
                // 유효하지 않은 status 값이거나 Enum에 없는 값인 경우 예외 발생
                throw ApplicationException.invalidApplicationStatus();
            }
        }
        // statusString이 null 또는 empty인 경우 "모든 상태 조회"

        Pageable pageable = PageRequest.of(page, size);

        // 서비스 계층에 단일 ApplicationStatus (또는 null) 전달
        MyApplicationListResponse response = applicationService.getApplicationsForArtist(memberId, queryStatus, pageable);

        return ResponseEntity.ok(response);
    }
}