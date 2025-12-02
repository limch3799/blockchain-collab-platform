package com.s401.moas.project.controller;

import com.s401.moas.global.exception.ErrorResponse;
import com.s401.moas.project.controller.request.GenerateDescriptionRequest;
import com.s401.moas.project.controller.response.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Project", description = "프로젝트 모집공고 API")
public interface ProjectControllerSpec {

    @Operation(
            operationId = "1-getProjects",
            summary = "프로젝트 목록 조회",
            description = "프로젝트 모집공고 카드를 페이지네이션, 정렬 및 필터로 조회합니다.\n" +
                    "각 카드에는 리더 닉네임과 프로필 이미지 URL이 포함됩니다.\n" +
                    "status 파라미터: recruiting(모집 중), closed(마감), 미지정 시 전체 조회\n" +
                    "bookmarked 파라미터: true일 경우 현재 로그인한 사용자가 북마크한 프로젝트만 조회 (인증 필요)"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "프로젝트 목록 조회 성공",
                    content = @Content(schema = @Schema(implementation = ProjectListResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (파라미터 형식 오류) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"요청이 올바르지 않습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자 (bookmarked=true일 때 인증 필요) - errorCode: UNAUTHORIZED",
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
    ResponseEntity<ProjectListResponse> getProjects(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, name = "categoryIds") String categoryIdsCsv,
            @RequestParam(required = false, name = "positionIds") String positionIdsCsv,
            @RequestParam(required = false) String provinceCode,
            @RequestParam(required = false, name = "districtCodes") String districtCodesCsv,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean bookmarked,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "created") String sort
    );

    @Operation(
            operationId = "2-getProjectDetail",
            summary = "프로젝트 상세 조회",
            description = "특정 프로젝트의 상세 정보를 조회합니다. 프로젝트 정보와 함께 등록한 리더의 프로필 정보(프로필 이미지, 닉네임, 리뷰 개수, 평균 평점)를 포함합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "프로젝트 상세 조회 성공",
                    content = @Content(schema = @Schema(implementation = ProjectDetailResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "프로젝트를 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C001\",\"message\":\"프로젝트를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
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
    ResponseEntity<ProjectDetailResponse> getProjectDetail(@PathVariable Integer projectId);

    @Operation(
            operationId = "3-createProject",
            summary = "프로젝트 등록",
            description = "새로운 프로젝트 모집공고를 등록합니다. 파일 업로드를 포함할 수 있습니다.\n" +
                    "districtCode가 null 또는 공백이면 온라인 프로젝트로 등록되며, 장소 정보는 생략됩니다.\n" +
                    "파일 첨부 등에 대한 원활한 테스트는 postman 사용을 추천합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "프로젝트 등록 성공",
                    content = @Content(schema = @Schema(implementation = CreateProjectResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (유효성 검증 실패) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"요청이 올바르지 않습니다.\",\"timestamp\":1699999999999}"
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
                    description = "권한 없음 (리더가 아님) - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"FORBIDDEN\",\"message\":\"권한이 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "지역 또는 포지션을 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
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
    ResponseEntity<CreateProjectResponse> createProject(
            @org.springframework.web.bind.annotation.RequestPart("data") String data,
            @org.springframework.web.bind.annotation.RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail
    ) throws Exception;

    @Operation(
            operationId = "4-checkPositionDeletable",
            summary = "포지션 삭제 가능 여부 확인",
            description = "특정 프로젝트 포지션에 지원자가 있는지 확인하여 삭제 가능 여부를 반환합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "삭제 가능 여부 확인 성공",
                    content = @Content(schema = @Schema(implementation = PositionDeletableResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (프로젝트 소유자가 아님 또는 지원자가 있음) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C003\",\"message\":\"프로젝트 소유자만 가능한 작업입니다.\",\"timestamp\":1699999999999}"
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
                    responseCode = "404",
                    description = "프로젝트 또는 포지션을 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C001\",\"message\":\"프로젝트를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
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
    ResponseEntity<PositionDeletableResponse> checkPositionDeletable(
            @PathVariable Integer projectId,
            @PathVariable Long positionId
    );

    @Operation(
            operationId = "4-closePosition",
            summary = "프로젝트 포지션 마감 처리",
            description = "프로젝트의 특정 포지션을 마감 처리합니다. 등록자만 마감할 수 있으며, " +
                    "이미 마감된 포지션은 다시 마감할 수 없습니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "포지션 마감 처리 성공"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (프로젝트와 포지션이 일치하지 않음) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C004\",\"message\":\"해당 프로젝트의 포지션이 아닙니다.\",\"timestamp\":1699999999999}"
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
                    description = "권한 없음 (프로젝트 소유자가 아님) - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C003\",\"message\":\"프로젝트 소유자만 가능한 작업입니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "프로젝트 또는 포지션을 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C001\",\"message\":\"프로젝트를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "상태 충돌 (이미 마감된 포지션) - errorCode: CONFLICT",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C011\",\"message\":\"이미 마감된 포지션입니다.\",\"timestamp\":1699999999999}"
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
    ResponseEntity<Void> closePosition(
            @PathVariable Integer projectId,
            @PathVariable Long positionId
    );

    @Operation(
            operationId = "5-getMyProjects",
            summary = "자신이 등록한 프로젝트 목록 조회",
            description = "인증된 리더가 자신이 등록한 프로젝트 모집공고 목록을 페이지네이션, 정렬 및 필터로 조회합니다.\n" +
                    "각 카드에는 리더 닉네임과 프로필 이미지 URL이 포함됩니다.\n" +
                    "status 파라미터: recruiting(모집 중), closed(마감), 미지정 시 전체 조회\n" +
                    "응답에는 전체 개수(total) 외에 진행중인 공고 개수(recruitingCount)와 마감된 공고 개수(closedCount)가 포함됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "프로젝트 목록 조회 성공",
                    content = @Content(schema = @Schema(implementation = ProjectListResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (파라미터 형식 오류) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"요청이 올바르지 않습니다.\",\"timestamp\":1699999999999}"
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
                    description = "권한 없음 (리더가 아님) - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"FORBIDDEN\",\"message\":\"권한이 없습니다.\",\"timestamp\":1699999999999}"
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
    ResponseEntity<ProjectListResponse> getMyProjects(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, name = "categoryIds") String categoryIdsCsv,
            @RequestParam(required = false, name = "positionIds") String positionIdsCsv,
            @RequestParam(required = false) String provinceCode,
            @RequestParam(required = false, name = "districtCodes") String districtCodesCsv,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "created") String sort
    );

    @Operation(
            operationId = "6-updateProject",
            summary = "프로젝트 수정",
            description = "프로젝트 모집공고를 수정합니다. 부분 업데이트를 지원하며, 전달된 필드만 수정됩니다.\n" +
                    "positions를 보내면 전체 교체(Replace All) 규칙으로 처리됩니다.\n" +
                    "파일 첨부 등에 대한 원활한 테스트는 postman 사용을 추천합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "프로젝트 수정 성공",
                    content = @Content(schema = @Schema(implementation = UpdateProjectResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (유효성 검증 실패, 날짜 관계 오류, positions 중복 등) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C006\",\"message\":\"날짜 관계가 올바르지 않습니다. (applyDeadline <= startAt <= endAt)\",\"timestamp\":1699999999999}"
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
                    description = "권한 없음 (프로젝트 소유자가 아님) - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C003\",\"message\":\"프로젝트 소유자만 가능한 작업입니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "프로젝트, 지역 또는 포지션을 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C001\",\"message\":\"프로젝트를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "상태 충돌 (마감/종료된 프로젝트, positions 중복, 지원자가 있는 포지션 삭제 시도 등) - errorCode: CONFLICT",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C008\",\"message\":\"마감 또는 종료된 프로젝트는 수정할 수 없습니다.\",\"timestamp\":1699999999999}"
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
    ResponseEntity<UpdateProjectResponse> updateProject(
            @PathVariable Integer projectId,
            @org.springframework.web.bind.annotation.RequestPart("data") String data,
            @org.springframework.web.bind.annotation.RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail
    ) throws Exception;

    @Operation(
            operationId = "6-closeProject",
            summary = "프로젝트 마감 처리",
            description = "프로젝트 모집공고를 마감 처리합니다. 등록자만 마감할 수 있으며, " +
                    "이미 마감된 프로젝트는 다시 마감할 수 없습니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "프로젝트 마감 처리 성공"
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
                    description = "권한 없음 (프로젝트 소유자가 아님) - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C003\",\"message\":\"프로젝트 소유자만 가능한 작업입니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "프로젝트를 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C001\",\"message\":\"프로젝트를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "상태 충돌 (이미 마감된 프로젝트) - errorCode: CONFLICT",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C008\",\"message\":\"마감 또는 종료된 프로젝트는 수정할 수 없습니다.\",\"timestamp\":1699999999999}"
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
    ResponseEntity<Void> closeProject(@PathVariable Integer projectId);

    @Operation(
            operationId = "7-deleteProject",
            summary = "프로젝트 삭제",
            description = "프로젝트 모집공고를 삭제합니다. 소프트 삭제(Soft Delete) 방식으로 처리되며, " +
                    "PENDING 또는 OFFERED 상태의 지원서가 있는 경우 삭제할 수 없습니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "프로젝트 삭제 성공"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (지원자가 있어 삭제 불가능) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C005\",\"message\":\"해당 포지션에 지원자가 있어 삭제할 수 없습니다.\",\"timestamp\":1699999999999}"
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
                    description = "권한 없음 (프로젝트 소유자가 아님) - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C003\",\"message\":\"프로젝트 소유자만 가능한 작업입니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "프로젝트를 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C001\",\"message\":\"프로젝트를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
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
    ResponseEntity<Void> deleteProject(@PathVariable Integer projectId);

    @Operation(
            operationId = "7-bookmarkProject",
            summary = "프로젝트 북마크 등록",
            description = "아티스트가 마음에 드는 프로젝트를 북마크합니다.\n" +
                    "이미 북마크한 프로젝트인 경우 409 Conflict 에러가 반환됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "북마크 등록 성공",
                    content = @Content(schema = @Schema(implementation = ProjectBookmarkResponse.class))
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
                    responseCode = "404",
                    description = "프로젝트를 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C001\",\"message\":\"프로젝트를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "이미 북마크한 프로젝트 - errorCode: CONFLICT",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C009\",\"message\":\"이미 북마크한 프로젝트입니다.\",\"timestamp\":1699999999999}"
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
    ResponseEntity<ProjectBookmarkResponse> bookmarkProject(@PathVariable Integer projectId);

    @Operation(
            operationId = "8-unbookmarkProject",
            summary = "프로젝트 북마크 해제",
            description = "아티스트가 북마크한 프로젝트를 해제합니다.\n" +
                    "북마크가 존재하지 않는 경우 404 Not Found 에러가 반환됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "북마크 해제 성공"
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
                    responseCode = "404",
                    description = "북마크를 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C010\",\"message\":\"북마크를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
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
    ResponseEntity<Void> unbookmarkProject(@PathVariable Integer projectId);

    @Operation(
            operationId = "9-generateDescription",
            summary = "프로젝트 설명 생성 (AI 어시스턴트)",
            description = "AI 어시스턴트를 사용하여 예술 프로젝트의 공고 설명을 자동으로 생성합니다.\n" +
                    "입력된 프로젝트 정보를 바탕으로 전문적인 공고 문안을 작성합니다.\n" +
                    "districtCode가 null이면 온라인 프로젝트, 값이 있으면 오프라인 프로젝트로 처리됩니다.\n" +
                    "응답 생성에는 시간이 걸릴 수 있습니다 (최대 60초)."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "프로젝트 설명 생성 성공",
                    content = @Content(schema = @Schema(implementation = GenerateDescriptionResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (유효성 검증 실패, 날짜 관계 오류 등) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"요청이 올바르지 않습니다.\",\"timestamp\":1699999999999}"
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
                    responseCode = "404",
                    description = "지역 또는 포지션을 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 또는 LLM API 호출 실패 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "504",
                    description = "LLM API 응답 시간 초과 - errorCode: GATEWAY_TIMEOUT",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"GATEWAY_TIMEOUT\",\"message\":\"LLM API 응답 시간이 초과되었습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<GenerateDescriptionResponse> generateDescription(
            @org.springframework.web.bind.annotation.RequestBody GenerateDescriptionRequest request
    );

    @Operation(
            operationId = "10-getSimilarProjects",
            summary = "유사 프로젝트 추천 조회",
            description = "특정 프로젝트와 유사한 다른 프로젝트들을 추천합니다.\n" +
                    "벡터 유사도 기반으로 비슷한 프로젝트를 찾아 반환합니다.\n" +
                    "n 파라미터로 추천받을 프로젝트 개수를 지정할 수 있습니다 (기본값: 5, 최대값: 20)"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "유사 프로젝트 조회 성공",
                    content = @Content(schema = @Schema(implementation = SimilarProjectsResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (n 값이 범위를 벗어남) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"요청이 올바르지 않습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "프로젝트를 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PROJECT_C001\",\"message\":\"프로젝트를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
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
    ResponseEntity<SimilarProjectsResponse> getSimilarProjects(
            @PathVariable Integer projectId,
            @RequestParam(defaultValue = "5") int n
    );
}

