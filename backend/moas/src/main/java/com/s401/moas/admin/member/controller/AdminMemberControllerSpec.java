package com.s401.moas.admin.member.controller;

import com.s401.moas.admin.member.controller.request.UpdatePenaltyRequest;
import com.s401.moas.admin.member.controller.response.*;
import com.s401.moas.global.exception.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Admin Member", description = "관리자 회원 관리 API")
public interface AdminMemberControllerSpec {

    @Operation(
            operationId = "01-admin-get-members",
            summary = "회원 목록 조회/검색",
            description = "관리자가 회원 목록을 조회하고 검색합니다. " +
                    "역할, 닉네임으로 필터링하고 정렬할 수 있으며, 페이징을 지원합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "회원 목록 조회 성공",
                    content = @Content(
                            schema = @Schema(implementation = MemberListResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "content": [
                                        {
                                          "id": 123,
                                          "nickname": "기깔난개발자",
                                          "email": "developer@example.com",
                                          "role": "LEADER",
                                          "profileImageUrl": "https://example.com/profile.jpg",
                                          "createdAt": "2024-01-01T00:00:00",
                                          "deletedAt": null,
                                          "stats": {
                                            "penaltyScore": 0,
                                            "averageRating": 4.5,
                                            "reviewCount": 10,
                                            "pendingInquiries": 1
                                          }
                                        }
                                      ],
                                      "pageInfo": {
                                        "page": 1,
                                        "size": 20,
                                        "totalElements": 200,
                                        "totalPages": 10
                                      }
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
    ResponseEntity<MemberListResponse> getMembers(
            @Parameter(description = "회원 역할 필터 (LEADER, ARTIST)", example = "LEADER")
            @RequestParam(required = false) String role,
            @Parameter(description = "닉네임 검색 키워드", example = "홍길동")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "정렬 방향 (asc, desc)", example = "desc")
            @RequestParam(defaultValue = "desc") String order,
            @Parameter(description = "페이지 번호 (1부터 시작)", example = "1")
            @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "페이지 크기", example = "20")
            @RequestParam(defaultValue = "20") Integer size
    );

    // 기존 getMembers() 메서드 아래에 추가

    @Operation(
            operationId = "02-admin-get-member-detail",
            summary = "회원 상세 조회",
            description = "관리자가 특정 회원의 상세 정보를 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "회원 상세 조회 성공",
                    content = @Content(
                            schema = @Schema(implementation = MemberDetailResponse.class),
                            examples = @ExampleObject(value = """
                                {
                                  "id": 123,
                                  "nickname": "기깔난개발자",
                                  "biography": "백엔드 개발자입니다",
                                  "email": "developer@example.com",
                                  "provider": "GOOGLE",
                                  "providerId": "google_12345",
                                  "phoneNumber": "010-1234-5678",
                                  "profileImageUrl": "https://example.com/profile.jpg",
                                  "walletAddress": "0x1234567890abcdef",
                                  "role": "LEADER",
                                  "createdAt": "2024-01-01T00:00:00",
                                  "updatedAt": "2024-11-13T10:00:00",
                                  "deletedAt": null,
                                  "stats": {
                                    "penaltyScore": 0,
                                    "averageRating": 4.5,
                                    "reviewCount": 10,
                                    "pendingInquiries": 1
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
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "회원을 찾을 수 없음 - errorCode: MEMBER_NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = """
                                {
                                  "errorCode": "MEMBER_NOT_FOUND",
                                  "message": "존재하지 않는 회원입니다.",
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
    ResponseEntity<MemberDetailResponse> getMemberDetail(
            @Parameter(description = "조회할 회원의 ID", example = "123", required = true)
            @PathVariable Integer memberId
    );

    @Operation(
            operationId = "03-admin-get-member-penalties",
            summary = "회원 페널티 이력 조회",
            description = "관리자가 특정 회원의 페널티 이력을 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "페널티 이력 조회 성공",
                    content = @Content(
                            schema = @Schema(implementation = MemberPenaltyListResponse.class),
                            examples = @ExampleObject(value = """
                                {
                                  "penalties": [
                                    {
                                      "id": 1,
                                      "memberId": 123,
                                      "contractId": 456,
                                      "changedBy": 1,
                                      "penaltyScore": 10,
                                      "createdAt": "2024-10-01T10:00:00",
                                      "changedAt": "2024-10-01T10:00:00"
                                    },
                                    {
                                      "id": 2,
                                      "memberId": 123,
                                      "contractId": null,
                                      "changedBy": 1,
                                      "penaltyScore": -5,
                                      "createdAt": "2024-10-15T14:30:00",
                                      "changedAt": "2024-10-15T14:30:00"
                                    }
                                  ]
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
                    responseCode = "404",
                    description = "회원을 찾을 수 없음 - errorCode: MEMBER_NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = """
                                {
                                  "errorCode": "MEMBER_NOT_FOUND",
                                  "message": "존재하지 않는 회원입니다.",
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
    ResponseEntity<MemberPenaltyListResponse> getMemberPenalties(
            @Parameter(description = "페널티 이력을 조회할 회원의 ID", example = "123", required = true)
            @PathVariable Integer memberId
    );

    @Operation(
            operationId = "04-admin-update-member-penalty",
            summary = "회원 페널티 수정",
            description = "관리자가 특정 회원의 페널티를 수정합니다. 양수는 증가, 음수는 감소를 의미합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "페널티 수정 성공",
                    content = @Content(
                            schema = @Schema(implementation = UpdatePenaltyResponse.class),
                            examples = @ExampleObject(value = """
                                {
                                  "memberId": 123,
                                  "previousPenaltyScore": 0,
                                  "newPenaltyScore": 5,
                                  "changedScore": 5,
                                  "reason": "계약 불이행으로 인한 페널티 부여"
                                }
                                """)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 - errorCode: BAD_REQUEST",
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
                    responseCode = "404",
                    description = "리소스를 찾을 수 없음 - errorCode: MEMBER_NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = """
                                {
                                  "errorCode": "MEMBER_NOT_FOUND",
                                  "message": "존재하지 않는 회원입니다.",
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
    ResponseEntity<UpdatePenaltyResponse> updateMemberPenalty(
            @Parameter(description = "페널티를 수정할 회원의 ID", example = "123", required = true)
            @PathVariable Integer memberId,
            @Valid @RequestBody UpdatePenaltyRequest request
    );

    @Operation(
            operationId = "05-admin-get-member-statistics",
            summary = "회원 통계 조회",
            description = "관리자가 전체 회원 수와 역할별 회원 수 분포를 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "회원 통계 조회 성공",
                    content = @Content(
                            schema = @Schema(implementation = MemberStatisticsResponse.class),
                            examples = @ExampleObject(value = """
                                {
                                  "totalMembers": 1500,
                                  "roleDistribution": {
                                    "pending": 50,
                                    "leader": 600,
                                    "artist": 850
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
    ResponseEntity<MemberStatisticsResponse> getMemberStatistics();
}