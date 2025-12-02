package com.s401.moas.admin.project.controller;

import com.s401.moas.admin.project.controller.response.*;
import com.s401.moas.admin.project.service.AdminProjectService;
import com.s401.moas.admin.project.service.dto.AdminProjectArtistDto;
import com.s401.moas.admin.project.service.dto.AdminProjectDeleteDto;
import com.s401.moas.admin.project.service.dto.AdminProjectLeaderDto;
import com.s401.moas.admin.project.service.dto.AdminProjectStatsDto;
import com.s401.moas.global.security.SecurityUtil;
import com.s401.moas.project.controller.response.ProjectDetailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Profile("admin")
@Slf4j
@RestController
@RequestMapping("/admin/api/projects")
@RequiredArgsConstructor
public class AdminProjectController implements AdminProjectControllerSpec {

    private final AdminProjectService adminProjectService;

    /**
     * 리더가 등록한 프로젝트 목록 조회 (관리자용)
     */
    @Override
    @GetMapping("/leaders")
    public ResponseEntity<AdminProjectLeaderListResponse> getLeaderProjects(
            @RequestParam(required = false) Integer memberId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("리더 프로젝트 목록 조회 - memberId: {}, keyword: {}, page: {}, size: {}",
                memberId, keyword, page, size);

        Pageable pageable = PageRequest.of(page, size);

        Page<AdminProjectLeaderDto> projects = adminProjectService.getLeaderProjects(
                memberId,
                keyword,
                pageable
        );

        return ResponseEntity.ok(AdminProjectLeaderListResponse.from(projects));
    }

    /**
     * 아티스트가 지원한 프로젝트 목록 조회 (관리자용)
     */
    @Override
    @GetMapping("/artists")
    public ResponseEntity<AdminProjectArtistListResponse> getArtistApplications(
            @RequestParam(required = false) Integer memberId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("아티스트 지원 목록 조회 - memberId: {}, keyword: {}, page: {}, size: {}",
                memberId, keyword, page, size);

        Pageable pageable = PageRequest.of(page, size);

        Page<AdminProjectArtistDto> applications = adminProjectService.getArtistApplications(
                memberId,
                keyword,
                pageable
        );

        return ResponseEntity.ok(AdminProjectArtistListResponse.from(applications));
    }

    /**
     * 프로젝트 상세 조회 (관리자용)
     */
    @Override
    @GetMapping("/{projectId}")
    public ResponseEntity<AdminProjectDetailResponse> getProjectDetail(
            @PathVariable Integer projectId) {

        log.info("프로젝트 상세 조회 요청 (관리자) - projectId: {}", projectId);

        ProjectDetailResponse projectDetail = adminProjectService.getProjectDetail(projectId);

        return ResponseEntity.ok(AdminProjectDetailResponse.from(projectDetail));
    }

    /**
     * 프로젝트 삭제 (관리자용)
     */
    @Override
    @DeleteMapping("/{projectId}")
    public ResponseEntity<AdminProjectDeleteResponse> deleteProject(
            @PathVariable Integer projectId) {

        log.info("프로젝트 삭제 요청 (관리자) - projectId: {}", projectId);

        Integer adminId = SecurityUtil.getCurrentAdminId();

        AdminProjectDeleteDto deleteDto = adminProjectService.deleteProject(projectId, adminId);

        return ResponseEntity.ok(AdminProjectDeleteResponse.from(deleteDto));
    }

    /**
     * 프로젝트 통계 조회 (관리자용)
     */
    @Override
    @GetMapping("/stats")
    public ResponseEntity<AdminProjectStatsResponse> getProjectStats() {

        log.info("프로젝트 통계 조회 요청 (관리자)");

        AdminProjectStatsDto statsDto = adminProjectService.getProjectStats();

        return ResponseEntity.ok(AdminProjectStatsResponse.from(statsDto));
    }
}