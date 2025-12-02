package com.s401.moas.admin.contract.controller;

import com.s401.moas.admin.contract.controller.request.AdminCancelRequest;
import com.s401.moas.admin.contract.controller.response.ContractListResponse;
import com.s401.moas.admin.contract.controller.response.ContractLogResponse;
import com.s401.moas.admin.contract.controller.response.ContractStatisticsResponse;
import com.s401.moas.admin.contract.controller.response.ContractStatusUpdateResponse;
import com.s401.moas.contract.controller.request.AdminCancelApproveRequest;
import com.s401.moas.contract.controller.response.ContractCancelResponse;
import com.s401.moas.contract.controller.response.ContractDetailResponse;
import com.s401.moas.contract.domain.ContractStatus;
import com.s401.moas.global.exception.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Admin Contract", description = "관리자 계약 관리 API")
public interface AdminContractControllerSpec {

    @Operation(
            operationId = "01-get-contracts",
            summary = "계약 목록 조회",
            description = "관리자가 전체 계약 목록을 조회합니다. " +
                    "회원 ID/닉네임, 계약 제목으로 검색 가능하며, " +
                    "회원별, 프로젝트별 필터링과 상태별 필터링 및 페이징을 지원합니다. " +
                    "생성일 최신순으로 정렬되어 반환됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = ContractListResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"잘못된 요청입니다.\",\"timestamp\":1762067112276}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증 실패 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "관리자 권한 없음 - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"FORBIDDEN\",\"message\":\"접근 권한이 없습니다.\",\"timestamp\":1762067112276}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}"
                            )
                    )
            )
    })
    ResponseEntity<ContractListResponse> getContracts(
            @Parameter(description = "검색 타입 (MEMBER_ID, NICKNAME)", example = "MEMBER_ID")
            @RequestParam(required = false) String searchType,

            @Parameter(description = "검색 키워드 (회원 ID 또는 닉네임)", example = "1234")
            @RequestParam(required = false) String searchKeyword,

            @Parameter(description = "계약 제목 키워드", example = "콘서트")
            @RequestParam(required = false) String title,

            @Parameter(description = "계약 상태", example = "COMPLETED")
            @RequestParam(required = false) ContractStatus status,

            @Parameter(description = "회원 ID (리더 또는 아티스트)", example = "123")
            @RequestParam(required = false) Long memberId,

            @Parameter(description = "프로젝트 ID", example = "456")
            @RequestParam(required = false) Long projectId,

            @Parameter(description = "페이지 번호 (1부터 시작)", example = "1")
            @RequestParam(defaultValue = "1") int page,

            @Parameter(description = "페이지 크기", example = "20")
            @RequestParam(defaultValue = "20") int size
    );

    @Operation(
            operationId = "02-get-contract-statistics",
            summary = "계약 통계 조회",
            description = "계약 상태별 건수를 조회합니다. " +
                    "모든 상태에 대한 건수가 포함되며, 데이터가 없는 상태는 0으로 표시됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = ContractStatisticsResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증 실패 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "관리자 권한 없음 - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"FORBIDDEN\",\"message\":\"접근 권한이 없습니다.\",\"timestamp\":1762067112276}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}"
                            )
                    )
            )
    })
    ResponseEntity<ContractStatisticsResponse> getStatistics();

    @Operation(
            operationId = "03-get-contract-detail",
            summary = "계약 상세 조회",
            description = "특정 계약의 상세 정보를 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = ContractDetailResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증 실패 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "관리자 권한 없음 - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"FORBIDDEN\",\"message\":\"접근 권한이 없습니다.\",\"timestamp\":1762067112276}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "계약을 찾을 수 없음 - errorCode: CONTRACT_NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"CONTRACT_NOT_FOUND\",\"message\":\"계약을 찾을 수 없습니다.\",\"timestamp\":1762067112276}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}"
                            )
                    )
            )
    })
    ResponseEntity<ContractDetailResponse> getContractDetail(
            @Parameter(description = "계약 ID", example = "123")
            @PathVariable Long contractId
    );

    @Operation(
            operationId = "04-get-contract-logs",
            summary = "계약 이력 조회",
            description = "특정 계약의 모든 변경 이력을 조회합니다. " +
                    "최신순으로 정렬되어 반환됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = ContractLogResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증 실패 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "관리자 권한 없음 - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"FORBIDDEN\",\"message\":\"접근 권한이 없습니다.\",\"timestamp\":1762067112276}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}"
                            )
                    )
            )
    })
    ResponseEntity<ContractLogResponse> getContractLogs(
            @Parameter(description = "계약 ID", example = "123")
            @PathVariable Long contractId
    );

    @Operation(
            operationId = "05-approve-contract-cancellation",
            summary = "계약 취소 승인 및 환불 (관리자용)",
            description = "관리자가 특정 계약의 취소 요청을 최종 승인합니다. 이 작업은 환불/정산 로직을 트리거하고, 계약 상태를 'CANCELED'로 변경합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "취소 승인 및 환불 요청 성공", content = @Content(schema = @Schema(implementation = ContractCancelResponse.class))),
            @ApiResponse(responseCode = "404", description = "계약 또는 관련 주문을 찾을 수 없음", content = @Content(schema = @Schema(implementation = org.springframework.web.ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "계약이 취소 승인 가능한 상태(CANCELLATION_REQUESTED)가 아님", content = @Content(schema = @Schema(implementation = org.springframework.web.ErrorResponse.class)))
    })
    @PostMapping("/cancellation-requests/{contractId}/approve")
    ResponseEntity<ContractStatusUpdateResponse> approveContractCancellation(
            @PathVariable Long contractId,
            @RequestBody @Valid AdminCancelRequest request);

    @Operation(
            operationId = "06-reject-contract-cancellation",
            summary = "취소 요청 반려 (관리자용)",
            description = "관리자가 특정 계약의 취소 요청을 반려합니다. 계약 상태는 취소 요청 이전 상태인 'PAYMENT_COMPLETED'로 되돌아갑니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "취소 요청 반려 성공"),
            @ApiResponse(responseCode = "400", description = "요청 본문이 유효하지 않은 경우 (예: 메모 누락)", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "관리자 권한이 없는 경우", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 계약일 경우", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "계약이 취소 반려 가능한 상태('CANCELLATION_REQUESTED')가 아닐 때 발생", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/cancellation-requests/{contractId}/reject")
    ResponseEntity<ContractStatusUpdateResponse> rejectCancellation(
            @PathVariable Long contractId,
            @RequestBody @Valid AdminCancelRequest request
    );
}