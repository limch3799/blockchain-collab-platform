package com.s401.moas.project.controller;

import com.s401.moas.project.controller.response.*;
import com.s401.moas.project.service.dto.SimilarProjectsDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.s401.moas.global.security.SecurityUtil;
import com.s401.moas.auth.exception.AuthException;
import com.s401.moas.project.controller.request.CreateProjectRequest;
import com.s401.moas.project.controller.request.GenerateDescriptionRequest;
import com.s401.moas.project.controller.request.UpdateProjectRequest;
import com.s401.moas.project.service.ProjectAssistantService;
import com.s401.moas.project.service.ProjectService;
import com.s401.moas.project.service.dto.ProjectDto;
import com.s401.moas.project.service.dto.ProjectListDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController implements ProjectControllerSpec {

    private final ProjectService projectService;
    private final ProjectAssistantService projectAssistantService;
    private final ObjectMapper objectMapper;

    @GetMapping
    @Override
    public ResponseEntity<ProjectListResponse> getProjects(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, name = "categoryIds") String categoryIdsCsv,
            @RequestParam(required = false, name = "positionIds") String positionIdsCsv,
            @RequestParam(required = false) String provinceCode,
            @RequestParam(required = false, name = "districtCodes") String districtCodesCsv,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean bookmarked,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "created") String sort) {
        Integer memberId = null;
        try {
            memberId = SecurityUtil.getCurrentMemberId();
        } catch (Exception ignored) {
            // 비로그인 허용
        }

        // bookmarked=true일 때는 인증이 필요함
        if (Boolean.TRUE.equals(bookmarked) && memberId == null) {
            throw AuthException.accessTokenNotFound();
        }

        int normalizedPage = Math.max(1, page);
        int normalizedSize = Math.min(Math.max(1, size), 100);
        String normalizedSort = switch (sort.toLowerCase()) {
            case "views", "created", "start", "amount" -> sort.toLowerCase();
            default -> "created";
        };

        log.info(
                "프로젝트 목록 조회 요청: page={}, size={}, sort={}, status={}, bookmarked={}, memberId={}, q={}, categoryIds={}, positionIds={}, provinceCode={}, districtCodes={}",
                normalizedPage, normalizedSize, normalizedSort, status, bookmarked, memberId, q, categoryIdsCsv, positionIdsCsv,
                provinceCode, districtCodesCsv);
        ProjectListDto dto = projectService.getProjectList(
                normalizedPage,
                normalizedSize,
                normalizedSort,
                memberId,
                q,
                categoryIdsCsv,
                positionIdsCsv,
                provinceCode,
                districtCodesCsv,
                status,
                bookmarked);
        return ResponseEntity.ok(ProjectListResponse.from(dto));
    }

    @GetMapping("/{projectId}")
    @Override
    public ResponseEntity<ProjectDetailResponse> getProjectDetail(@PathVariable Integer projectId) {
        log.info("프로젝트 상세 조회 요청 - projectId: {}", projectId);

        ProjectDetailResponse response = projectService.getProjectDetail(projectId);

        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Override
    public ResponseEntity<CreateProjectResponse> createProject(
            @RequestPart("data") String data,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) throws Exception {
        // JSON 파트 수동 파싱 (클라이언트가 Content-Type을 정확히 지정하지 않아도 동작)
        CreateProjectRequest request = objectMapper.readValue(data, CreateProjectRequest.class);
        log.info("프로젝트 등록 요청 - 제목: {}, 지역코드: {}", request.getTitle(), request.getDistrictCode());

        // thumbnail을 request에 설정
        request.setThumbnail(thumbnail);

        // Authentication 객체에서 JWT 토큰 추출 후 memberId 가져오기
        Integer memberId = SecurityUtil.getCurrentMemberId();

        ProjectDto dto = projectService.createProject(request, memberId);
        CreateProjectResponse response = CreateProjectResponse.from(dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{projectId}/positions/{positionId}/deletable")
    @Override
    public ResponseEntity<PositionDeletableResponse> checkPositionDeletable(
            @PathVariable Integer projectId,
            @PathVariable Long positionId) {
        log.info("포지션 삭제 가능 여부 확인 요청 - projectId: {}, positionId: {}", projectId, positionId);

        Integer memberId = SecurityUtil.getCurrentMemberId();
        boolean deletable = projectService.isPositionDeletable(projectId, positionId, memberId);

        PositionDeletableResponse response = PositionDeletableResponse.builder()
                .deletable(deletable)
                .message(deletable ? "삭제 가능합니다." : "해당 포지션에 지원자가 있어 삭제할 수 없습니다.")
                .build();

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{projectId}/positions/{positionId}/close")
    @Override
    public ResponseEntity<Void> closePosition(
            @PathVariable Integer projectId,
            @PathVariable Long positionId) {
        log.info("프로젝트 포지션 마감 처리 요청 - projectId: {}, positionId: {}", projectId, positionId);

        // Authentication 객체에서 JWT 토큰 추출 후 memberId 가져오기
        Integer memberId = SecurityUtil.getCurrentMemberId();

        projectService.closePosition(projectId, positionId, memberId);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Override
    public ResponseEntity<ProjectListResponse> getMyProjects(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, name = "categoryIds") String categoryIdsCsv,
            @RequestParam(required = false, name = "positionIds") String positionIdsCsv,
            @RequestParam(required = false) String provinceCode,
            @RequestParam(required = false, name = "districtCodes") String districtCodesCsv,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "created") String sort) {
        Integer memberId = SecurityUtil.getCurrentMemberId();

        int normalizedPage = Math.max(1, page);
        int normalizedSize = Math.min(Math.max(1, size), 100);
        String normalizedSort = switch (sort.toLowerCase()) {
            case "views", "created", "start", "amount" -> sort.toLowerCase();
            default -> "created";
        };

        log.info(
                "자신이 등록한 프로젝트 목록 조회 요청: page={}, size={}, sort={}, status={}, memberId={}, q={}, categoryIds={}, positionIds={}, provinceCode={}, districtCodes={}",
                normalizedPage, normalizedSize, normalizedSort, status, memberId, q, categoryIdsCsv, positionIdsCsv,
                provinceCode, districtCodesCsv);

        ProjectListDto dto = projectService.getMyProjectList(
                normalizedPage,
                normalizedSize,
                normalizedSort,
                memberId,
                q,
                categoryIdsCsv,
                positionIdsCsv,
                provinceCode,
                districtCodesCsv,
                status);

        return ResponseEntity.ok(ProjectListResponse.from(dto));
    }

    @PatchMapping(value = "/{projectId}", consumes = "multipart/form-data")
    @Override
    public ResponseEntity<UpdateProjectResponse> updateProject(
            @PathVariable Integer projectId,
            @RequestPart("data") String data,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) throws Exception {
        // JSON 파트 수동 파싱
        UpdateProjectRequest request = objectMapper.readValue(data, UpdateProjectRequest.class);
        log.info("프로젝트 수정 요청 - projectId: {}, 제목: {}", projectId, request.getTitle());

        // thumbnail을 request에 설정
        request.setThumbnail(thumbnail);

        // Authentication 객체에서 JWT 토큰 추출 후 memberId 가져오기
        Integer memberId = SecurityUtil.getCurrentMemberId();

        UpdateProjectResponse response = projectService.updateProject(projectId, request, memberId);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{projectId}/close")
    @Override
    public ResponseEntity<Void> closeProject(@PathVariable Integer projectId) {
        log.info("프로젝트 마감 처리 요청 - projectId: {}", projectId);

        // Authentication 객체에서 JWT 토큰 추출 후 memberId 가져오기
        Integer memberId = SecurityUtil.getCurrentMemberId();

        projectService.closeProject(projectId, memberId);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{projectId}")
    @Override
    public ResponseEntity<Void> deleteProject(@PathVariable Integer projectId) {
        log.info("프로젝트 삭제 요청 - projectId: {}", projectId);

        // Authentication 객체에서 JWT 토큰 추출 후 memberId 가져오기
        Integer memberId = SecurityUtil.getCurrentMemberId();

        projectService.deleteProject(projectId, memberId);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{projectId}/bookmarks")
    @Override
    public ResponseEntity<ProjectBookmarkResponse> bookmarkProject(@PathVariable Integer projectId) {
        log.info("프로젝트 북마크 등록 요청 - projectId: {}", projectId);

        Integer memberId = SecurityUtil.getCurrentMemberId();

        com.s401.moas.project.domain.ProjectBookmark bookmark = 
                projectService.bookmarkProject(projectId, memberId);

        ProjectBookmarkResponse response = ProjectBookmarkResponse.of(
                bookmark.getMemberId(),
                bookmark.getProjectId(),
                bookmark.getCreatedAt()
        );

        log.info("프로젝트 북마크 등록 성공 - projectId: {}, memberId: {}", projectId, memberId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{projectId}/bookmarks")
    @Override
    public ResponseEntity<Void> unbookmarkProject(@PathVariable Integer projectId) {
        log.info("프로젝트 북마크 해제 요청 - projectId: {}", projectId);

        Integer memberId = SecurityUtil.getCurrentMemberId();

        projectService.unbookmarkProject(projectId, memberId);

        log.info("프로젝트 북마크 해제 성공 - projectId: {}, memberId: {}", projectId, memberId);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/assistants/describe")
    @Override
    public ResponseEntity<GenerateDescriptionResponse> generateDescription(
            @Valid @RequestBody GenerateDescriptionRequest request) {
        log.info("프로젝트 설명 생성 요청 - 제목: {}, 분야: {}", request.getTitle(), request.getCategory());

        GenerateDescriptionResponse response = projectAssistantService.generateDescription(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{projectId}/similar")
    @Override
    public ResponseEntity<SimilarProjectsResponse> getSimilarProjects(
            @PathVariable Integer projectId,
            @RequestParam(defaultValue = "5") int n) {
        log.info("유사 프로젝트 조회 요청 - projectId: {}, n: {}", projectId, n);

        // n 값 검증 및 정규화
        int normalizedN = Math.min(Math.max(1, n), 20);

        SimilarProjectsDto dto = projectService.getSimilarProjects(projectId, normalizedN);
        SimilarProjectsResponse response = SimilarProjectsResponse.from(dto);

        return ResponseEntity.ok(response);
    }
}
