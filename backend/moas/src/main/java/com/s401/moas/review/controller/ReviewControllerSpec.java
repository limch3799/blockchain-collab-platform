package com.s401.moas.review.controller;

import com.s401.moas.global.exception.ErrorResponse;
import com.s401.moas.review.controller.request.CreateReviewRequest;
import com.s401.moas.review.controller.response.CreateReviewResponse;
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

@Tag(name = "Review", description = "리뷰 API")
public interface ReviewControllerSpec {
    
    @Operation(
            operationId = "1-createReview",
            summary = "리뷰 작성",
            description = "계약 상대방에 대한 리뷰를 작성합니다. 리뷰는 계약당 1회만 작성할 수 있으며, " +
                    "평점은 1~5점 범위입니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "리뷰 작성 성공",
                    content = @Content(schema = @Schema(implementation = CreateReviewResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (유효성 검증 실패, 잘못된 대상 지정 등) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"리뷰 대상 회원 ID는 필수입니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "권한 없음 (계약 당사자가 아닌 경우) - errorCode: REVIEW_C002",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"REVIEW_C002\",\"message\":\"해당 계약에 대한 리뷰를 작성할 권한이 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "계약을 찾을 수 없음 - errorCode: CON_C001",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"CON_C001\",\"message\":\"계약서를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "리뷰 중복 또는 계약 상태 충돌 - errorCode: REVIEW_C001/REVIEW_C006",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"REVIEW_C001\",\"message\":\"이미 해당 계약에 대해 리뷰를 작성했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<CreateReviewResponse> createReview(@Valid @RequestBody CreateReviewRequest request);
}

