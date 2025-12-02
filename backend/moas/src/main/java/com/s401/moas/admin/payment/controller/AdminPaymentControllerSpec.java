package com.s401.moas.admin.payment.controller;

import com.s401.moas.admin.payment.controller.request.AdminPaymentRequest;
import com.s401.moas.admin.payment.controller.response.AdminPaymentResponse;
import com.s401.moas.global.exception.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;

@Tag(name = "Admin Payment", description = "관리자 정산 및 거래 내역 API")
public interface AdminPaymentControllerSpec {

    @Operation(
            operationId = "01-admin-get-payments",
            summary = "정산 및 거래 내역 조회/검색",
            description = "관리자가 전체 정산 및 거래 내역을 필터링하여 조회합니다. " +
                    "거래 유형, 상태, 기간, 주문/계약 ID, 회원 ID 등으로 검색 및 필터링 가능합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "정산 내역 목록 조회 성공",
                    content = @Content(
                            schema = @Schema(implementation = Page.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "content": [
                                        {
                                          "paymentId": 100,
                                          "paymentType": "PURCHASE",
                                          "paymentStatus": "COMPLETED",
                                          "paymentAmount": 50000,
                                          "createdAt": "2024-11-01T10:00:00",
                                          "completedAt": "2024-11-01T10:01:00",
                                          "primaryMemberId": 123,
                                          "orderId": "ORD-ABC-001",
                                          "contractId": 456,
                                          "orderStatus": "DONE",
                                          "payerMemberId": 123
                                        }
                                      ],
                                      "totalPages": 10,
                                      "totalElements": 200,
                                      "size": 20,
                                      "number": 0
                                    }
                                    """)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (파라미터 값 오류) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "errorCode": "BAD_REQUEST",
                                      "message": "요청이 올바르지 않습니다. 입력 값을 다시 확인해주세요.",
                                      "timestamp": 1762067112276
                                    }
                                    """)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증 실패 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "errorCode": "UNAUTHORIZED",
                                      "message": "인증이 필요합니다.",
                                      "timestamp": 1762067112276
                                    }
                                    """)
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "권한 없음 - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "errorCode": "FORBIDDEN",
                                      "message": "접근 권한이 없습니다.",
                                      "timestamp": 1762067112276
                                    }
                                    """)
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "errorCode": "INTERNAL_SERVER_ERROR",
                                      "message": "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                                      "timestamp": 1762067112276
                                    }
                                    """)
                    )
            )
    })
    ResponseEntity<Page<AdminPaymentResponse>> getPaymentList(
            @Parameter(description = "필터링 및 검색 조건 DTO")
            @ModelAttribute AdminPaymentRequest request,

            @Parameter(hidden = true)
            Pageable pageable
    );
}