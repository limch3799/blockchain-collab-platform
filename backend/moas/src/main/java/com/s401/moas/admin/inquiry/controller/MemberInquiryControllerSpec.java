package com.s401.moas.admin.inquiry.controller;

import com.s401.moas.admin.inquiry.controller.request.CreateInquiryCommentRequest;
import com.s401.moas.admin.inquiry.controller.request.CreateInquiryRequest;
import com.s401.moas.admin.inquiry.controller.response.CloseInquiryResponse;
import com.s401.moas.admin.inquiry.controller.response.CreateInquiryCommentResponse;
import com.s401.moas.admin.inquiry.controller.response.CreateInquiryResponse;
import com.s401.moas.admin.inquiry.controller.response.InquiryDetailResponse;
import com.s401.moas.admin.inquiry.controller.response.InquiryListResponse;
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
import org.springframework.web.bind.annotation.*;

@Tag(name = "Member Inquiry", description = "회원 문의 API")
public interface MemberInquiryControllerSpec {

    @Operation(
            operationId = "01-member-create-inquiry",
            summary = "문의 작성",
            description = "새로운 문의를 작성합니다. 문의 유형은 필수입니다. 최대 10개의 파일(각 10MB, 총 100MB)을 첨부할 수 있습니다.\n" +
                    "파일 첨부 등에 대한 원활한 테스트는 postman 사용을 추천합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "문의 작성 성공",
                    content = @Content(schema = @Schema(implementation = CreateInquiryResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (유효성 검증 실패) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"잘못된 요청입니다.\",\"timestamp\":1699999999999}"
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
                    responseCode = "500",
                    description = "서버 내부 오류 (파일 업로드 실패 등) - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<CreateInquiryResponse> createInquiry(
            @Valid @ModelAttribute CreateInquiryRequest request
    );

    @Operation(
            operationId = "02-member-get-my-inquiries",
            summary = "내 문의 목록 조회/검색",
            description = "내가 작성한 문의 목록을 조회합니다. 문의 유형, 키워드로 필터링할 수 있습니다."
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
                                          "category": "CONTRACT",
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
                                        "totalElements": 5,
                                        "totalPages": 1
                                      }
                                    }
                                    """)
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
    ResponseEntity<InquiryListResponse> getMyInquiries(
            @Parameter(description = "문의 유형 필터 (MEMBER, CONTRACT, PAYMENT, OTHERS)", example = "CONTRACT")
            @RequestParam(required = false) InquiryCategory category,
            @Parameter(description = "제목/내용 키워드 검색", example = "환불")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    );

    @Operation(
            operationId = "03-member-get-inquiry-detail",
            summary = "문의 상세 조회",
            description = "문의의 상세 정보와 댓글을 조회합니다. (본인 문의만 조회 가능)"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "문의 상세 조회 성공",
                    content = @Content(schema = @Schema(implementation = InquiryDetailResponse.class))
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
                    description = "접근 권한 없음 (본인 문의 아님) - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"FORBIDDEN\",\"message\":\"접근 권한이 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "문의를 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"문의를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
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
    ResponseEntity<InquiryDetailResponse> getInquiryDetail(
            @Parameter(description = "문의 ID", example = "1", required = true)
            @PathVariable Integer inquiryId
    );

    @Operation(
            operationId = "04-member-create-inquiry-comment",
            summary = "문의 댓글 작성",
            description = "문의에 댓글을 작성합니다. 최대 10개의 파일(각 10MB, 총 100MB)을 첨부할 수 있습니다.\n" +
                    "파일 첨부 등에 대한 원활한 테스트는 postman 사용을 추천합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "댓글 작성 성공",
                    content = @Content(schema = @Schema(implementation = CreateInquiryCommentResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (유효성 검증 실패) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"잘못된 요청입니다.\",\"timestamp\":1699999999999}"
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
                    description = "접근 권한 없음 (본인 문의 아님) - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"FORBIDDEN\",\"message\":\"접근 권한이 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "문의를 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"문의를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 (파일 업로드 실패 등) - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<CreateInquiryCommentResponse> createComment(
            @Parameter(description = "문의 ID", example = "1", required = true)
            @PathVariable Integer inquiryId,
            @Valid @ModelAttribute CreateInquiryCommentRequest request
    );

    @Operation(
            operationId = "05-member-close-inquiry",
            summary = "문의 종료",
            description = "문의를 종료(CLOSED) 상태로 변경합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "문의 종료 성공",
                    content = @Content(schema = @Schema(implementation = CloseInquiryResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "이미 종료된 문의 - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"이미 종료된 문의입니다.\",\"timestamp\":1699999999999}"
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
                    description = "접근 권한 없음 (본인 문의 아님) - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"FORBIDDEN\",\"message\":\"접근 권한이 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "문의를 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"문의를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
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
    ResponseEntity<CloseInquiryResponse> closeInquiry(
            @Parameter(description = "문의 ID", example = "1", required = true)
            @PathVariable Integer inquiryId
    );
}