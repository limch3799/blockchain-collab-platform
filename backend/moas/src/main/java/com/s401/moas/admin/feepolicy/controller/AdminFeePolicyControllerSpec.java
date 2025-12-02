package com.s401.moas.admin.feepolicy.controller;

import com.s401.moas.admin.feepolicy.controller.request.FeePolicyUpdateRequest;
import com.s401.moas.admin.feepolicy.controller.response.FeePolicyHistoryResponse;
import com.s401.moas.admin.feepolicy.controller.response.FeePolicyUpdateResponse;
import com.s401.moas.global.exception.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Admin Fee Policy", description = "관리자 수수료 정책 관리 API")
public interface AdminFeePolicyControllerSpec {

    @Operation(
            operationId = "01-update-fee-policy",
            summary = "수수료 정책 변경",
            description = "수수료율을 변경합니다. " +
                    "미래 날짜에 적용될 정책만 설정 가능하며, " +
                    "이미 미래 정책이 존재하면 기존 정책을 업데이트합니다. " +
                    "과거 또는 현재 적용 중인 정책은 변경할 수 없습니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "수수료 정책 변경 성공",
                    content = @Content(schema = @Schema(implementation = FeePolicyUpdateResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (수수료율 범위 오류, 과거 날짜, 유효성 검증 실패) - errorCode: INVALID_FEE_RATE, INVALID_START_DATE, BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = {
                                    @ExampleObject(
                                            name = "수수료율 범위 오류",
                                            value = "{\"errorCode\":\"INVALID_FEE_RATE\",\"message\":\"수수료율은 0~100% 사이여야 합니다.\",\"timestamp\":1762067112276}"
                                    ),
                                    @ExampleObject(
                                            name = "과거 날짜 설정",
                                            value = "{\"errorCode\":\"INVALID_START_DATE\",\"message\":\"적용 시작일은 미래 날짜여야 합니다.\",\"timestamp\":1762067112276}"
                                    )
                            }
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증 실패 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}")
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "관리자 권한 없음 - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"FORBIDDEN\",\"message\":\"접근 권한이 없습니다.\",\"timestamp\":1762067112276}")
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "관리자를 찾을 수 없음 - errorCode: ADMIN_NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"ADMIN_NOT_FOUND\",\"message\":\"존재하지 않는 관리자입니다.\",\"timestamp\":1762067112276}")
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")
                    )
            )
    })
    ResponseEntity<FeePolicyUpdateResponse> updateFeePolicy(@Valid @RequestBody FeePolicyUpdateRequest request);

    @Operation(
            operationId = "02-get-fee-policy-history",
            summary = "수수료 변경 이력 조회",
            description = "전체 수수료 정책 변경 이력을 조회합니다. " +
                    "각 정책의 적용 시작일과 종료일, 설정한 관리자 정보가 포함됩니다. " +
                    "적용 종료일은 다음 정책의 시작일이며, 현재 적용 중인 정책의 종료일은 null입니다. " +
                    "최신순으로 정렬되어 반환됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = FeePolicyHistoryResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증 실패 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}")
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "관리자 권한 없음 - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"FORBIDDEN\",\"message\":\"접근 권한이 없습니다.\",\"timestamp\":1762067112276}")
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")
                    )
            )
    })
    ResponseEntity<FeePolicyHistoryResponse> getFeePolicyHistory();
}