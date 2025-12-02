package com.s401.moas.admin.inquiry.controller;

import com.s401.moas.admin.inquiry.controller.request.CreateInquiryCommentRequest;
import com.s401.moas.admin.inquiry.controller.response.CreateInquiryCommentResponse;
import com.s401.moas.admin.inquiry.controller.response.InquiryDetailResponse;
import com.s401.moas.admin.inquiry.controller.response.InquiryListResponse;
import com.s401.moas.admin.inquiry.controller.response.InquiryStatsResponse;
import com.s401.moas.admin.inquiry.domain.InquiryCategory;  // ✅ import 추가
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
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Admin Inquiry", description = "관리자 문의 관리 API")
public interface AdminInquiryControllerSpec {

    @Operation(
            operationId = "01-admin-get-inquiries",
            summary = "문의 목록 조회/검색",
            description = "관리자가 문의 목록을 조회하거나 검색합니다. " +
                    "회원 ID, 문의 유형, 키워드를 선택적으로 조합하여 필터링할 수 있습니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "문의 목록 조회 성공",
                    content = @Content(
                            schema = @Schema(implementation = InquiryListResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "content": [
                                        {
                                          "inquiryId": 1,
                                          "memberId": 123,
                                          "category": "계약관리",
                                          "title": "계약 취소 문의",
                                          "status": "PENDING",
                                          "commentCount": 0,
                                          "createdAt": "2024-11-15T10:00:00",
                                          "updatedAt": null
                                        }
                                      ],
                                      "pageInfo": {
                                        "page": 0,
                                        "size": 10,
                                        "totalElements": 50,
                                        "totalPages": 5
                                      }
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
            )
    })
    ResponseEntity<InquiryListResponse> getInquiries(
            @Parameter(description = "회원 ID 필터", example = "123")
            @RequestParam(required = false) Integer memberId,
            @Parameter(description = "문의 유형 필터 (사용자관리, 계약관리, 정산관리, 기타)", example = "계약관리")
            @RequestParam(required = false) InquiryCategory category,
            @Parameter(description = "제목/내용 키워드 검색", example = "환불")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    );

    @Operation(
            operationId = "02-admin-get-inquiry-detail",
            summary = "문의 상세 조회",
            description = "관리자가 특정 문의의 상세 정보를 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "문의 상세 조회 성공",
                    content = @Content(
                            schema = @Schema(implementation = InquiryDetailResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "inquiryId": 1,
                                      "memberId": 123,
                                      "memberNickname": "홍길동",
                                      "category": "계약관리",
                                      "title": "계약 취소 문의",
                                      "content": "계약을 취소하고 싶습니다.",
                                      "status": "PENDING",
                                      "files": [],
                                      "comments": [],
                                      "createdAt": "2024-11-15T10:00:00",
                                      "updatedAt": null
                                    }
                                    """)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증 실패",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "문의를 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    ResponseEntity<InquiryDetailResponse> getInquiryDetail(
            @Parameter(description = "문의 ID", example = "1", required = true)
            @PathVariable Integer inquiryId
    );

    @Operation(
            operationId = "03-admin-create-inquiry-comment",
            summary = "문의 답변 작성",
            description = "관리자가 문의에 답변을 작성합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "답변 작성 성공",
                    content = @Content(schema = @Schema(implementation = CreateInquiryCommentResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증 실패",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "문의를 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    ResponseEntity<CreateInquiryCommentResponse> createComment(
            @Parameter(description = "문의 ID", example = "1", required = true)
            @PathVariable Integer inquiryId,
            @Valid @ModelAttribute CreateInquiryCommentRequest request
    );

    @Operation(
            operationId = "04-admin-get-inquiry-stats",
            summary = "문의 통계 조회",
            description = "카테고리별 상태별 문의 개수를 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "통계 조회 성공",
                    content = @Content(
                            schema = @Schema(implementation = InquiryStatsResponse.class),
                            examples = @ExampleObject(value = """
                                {
                                  "totalCount": 150,
                                  "categoryStats": [
                                    {
                                      "category": "MEMBER",
                                      "pendingCount": 10,
                                      "answeredCount": 20,
                                      "closedCount": 5,
                                      "totalCount": 35
                                    },
                                    {
                                      "category": "CONTRACT",
                                      "pendingCount": 15,
                                      "answeredCount": 30,
                                      "closedCount": 10,
                                      "totalCount": 55
                                    },
                                    {
                                      "category": "PAYMENT",
                                      "pendingCount": 8,
                                      "answeredCount": 25,
                                      "closedCount": 7,
                                      "totalCount": 40
                                    },
                                    {
                                      "category": "OTHERS",
                                      "pendingCount": 5,
                                      "answeredCount": 10,
                                      "closedCount": 5,
                                      "totalCount": 20
                                    }
                                  ]
                                }
                                """)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증 실패",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "권한 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    ResponseEntity<InquiryStatsResponse> getInquiryStats();
}