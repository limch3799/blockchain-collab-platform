package com.s401.moas.admin.project.controller;

import com.s401.moas.admin.project.controller.response.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Admin Project", description = "관리자 프로젝트 관리 API")
public interface AdminProjectControllerSpec {

    @Operation(
            summary = "리더 프로젝트 목록 조회",
            description = "리더가 등록한 프로젝트 목록을 조회합니다. 삭제된 프로젝트도 포함됩니다."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = AdminProjectLeaderListResponse.class))
            )
    })
    ResponseEntity<AdminProjectLeaderListResponse> getLeaderProjects(
            @Parameter(description = "회원 ID (선택)", example = "123")
            @RequestParam(required = false) Integer memberId,

            @Parameter(description = "검색 키워드 (프로젝트 제목)", example = "뮤직비디오")
            @RequestParam(required = false) String keyword,

            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "페이지 크기", example = "20")
            @RequestParam(defaultValue = "20") int size
    );

    @Operation(
            summary = "아티스트 지원 목록 조회",
            description = "아티스트가 지원한 프로젝트 목록을 조회합니다. 취소된 지원도 포함됩니다."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = AdminProjectArtistListResponse.class))
            )
    })
    ResponseEntity<AdminProjectArtistListResponse> getArtistApplications(
            @Parameter(description = "회원 ID (선택)", example = "123")
            @RequestParam(required = false) Integer memberId,

            @Parameter(description = "검색 키워드 (프로젝트 제목)", example = "뮤직비디오")
            @RequestParam(required = false) String keyword,

            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "페이지 크기", example = "20")
            @RequestParam(defaultValue = "20") int size
    );

    @Operation(
            summary = "프로젝트 상세 조회",
            description = "프로젝트 상세 정보를 조회합니다. 삭제된 프로젝트도 조회 가능합니다."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = AdminProjectDetailResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "프로젝트를 찾을 수 없음"
            )
    })
    ResponseEntity<AdminProjectDetailResponse> getProjectDetail(
            @Parameter(description = "프로젝트 ID", example = "1", required = true)
            @PathVariable Integer projectId
    );

    @Operation(
            summary = "프로젝트 삭제",
            description = "프로젝트를 삭제(Soft Delete)합니다. 삭제한 관리자 ID가 기록됩니다."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "삭제 성공",
                    content = @Content(schema = @Schema(implementation = AdminProjectDeleteResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "프로젝트를 찾을 수 없음"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "이미 삭제된 프로젝트"
            )
    })
    ResponseEntity<AdminProjectDeleteResponse> deleteProject(
            @Parameter(description = "프로젝트 ID", example = "1", required = true)
            @PathVariable Integer projectId
    );

    @Operation(
            summary = "프로젝트 통계 조회",
            description = "프로젝트 상태별 통계를 조회합니다. (모집중/마감/삭제/전체)"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = AdminProjectStatsResponse.class))
            )
    })
    ResponseEntity<AdminProjectStatsResponse> getProjectStats();
}