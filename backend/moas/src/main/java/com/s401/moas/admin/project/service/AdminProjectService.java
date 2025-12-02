package com.s401.moas.admin.project.service;

import com.s401.moas.admin.auth.domain.Admin;
import com.s401.moas.admin.auth.repository.AdminRepository;
import com.s401.moas.admin.project.exception.AdminProjectException;
import com.s401.moas.admin.project.service.dto.AdminProjectArtistDto;
import com.s401.moas.admin.project.service.dto.AdminProjectDeleteDto;
import com.s401.moas.admin.project.service.dto.AdminProjectLeaderDto;
import com.s401.moas.admin.project.service.dto.AdminProjectStatsDto;
import com.s401.moas.application.domain.ProjectApplication;
import com.s401.moas.application.repository.ProjectApplicationRepository;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.repository.MemberRepository;
import com.s401.moas.project.controller.response.ProjectDetailResponse;
import com.s401.moas.project.domain.Category;
import com.s401.moas.project.domain.Position;
import com.s401.moas.project.domain.Project;
import com.s401.moas.project.domain.ProjectPosition;
import com.s401.moas.project.repository.CategoryRepository;
import com.s401.moas.project.repository.PositionRepository;
import com.s401.moas.project.repository.ProjectPositionRepository;
import com.s401.moas.project.repository.ProjectRepository;
import com.s401.moas.project.repository.projection.ProjectStatsProjection;
import com.s401.moas.region.domain.District;
import com.s401.moas.region.domain.Province;
import com.s401.moas.region.repository.DistrictRepository;
import com.s401.moas.region.repository.ProvinceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectApplicationRepository projectApplicationRepository;
    private final ProjectPositionRepository projectPositionRepository;
    private final MemberRepository memberRepository;
    private final AdminRepository adminRepository;
    private final DistrictRepository districtRepository;
    private final ProvinceRepository provinceRepository;
    private final PositionRepository positionRepository;
    private final CategoryRepository categoryRepository;

    /**
     * 리더가 등록한 프로젝트 목록 조회 (삭제된 프로젝트 포함)
     */
    public Page<AdminProjectLeaderDto> getLeaderProjects(
            Integer memberId,
            String keyword,
            Pageable pageable) {

        log.info("리더 프로젝트 목록 조회 - memberId: {}, keyword: {}", memberId, keyword);

        Page<Project> projects = projectRepository.findAllProjectsForAdmin(
                memberId,
                keyword,
                pageable
        );

        return projects.map(project -> {
            // 회원 정보 조회
            Member member = memberRepository.findById(project.getMemberId())
                    .orElse(null);

            // 삭제한 관리자 정보 조회
            String deletedByAdminName = null;
            if (project.getDeletedBy() != null) {
                Admin admin = adminRepository.findById(project.getDeletedBy())
                        .orElse(null);
                if (admin != null) {
                    deletedByAdminName = admin.getName();
                }
            }

            return AdminProjectLeaderDto.builder()
                    .projectId(project.getId())
                    .title(project.getTitle())
                    .summary(project.getSummary())
                    .memberId(project.getMemberId())
                    .memberNickname(member != null ? member.getNickname() : null)
                    .applyDeadline(project.getApplyDeadline())
                    .startAt(project.getStartAt())
                    .endAt(project.getEndAt())
                    .viewCount(project.getViewCount())
                    .createdAt(project.getCreatedAt())
                    .updatedAt(project.getUpdatedAt())
                    .closedAt(project.getClosedAt())
                    .deletedAt(project.getDeletedAt())
                    .deletedBy(project.getDeletedBy())
                    .deletedByAdminName(deletedByAdminName)
                    .build();
        });
    }

    /**
     * 아티스트가 지원한 프로젝트 목록 조회 (취소된 지원 포함)
     */
    public Page<AdminProjectArtistDto> getArtistApplications(
            Integer memberId,
            String keyword,
            Pageable pageable) {

        log.info("아티스트 지원 목록 조회 - memberId: {}, keyword: {}", memberId, keyword);

        Page<ProjectApplication> applications = projectApplicationRepository.findAllApplicationsForAdmin(
                memberId,
                keyword,
                pageable
        );

        return applications.map(application -> {
            // 프로젝트 포지션에서 프로젝트 ID 조회
            ProjectPosition projectPosition = projectPositionRepository.findById(application.getProjectPositionId())
                    .orElse(null);

            // 프로젝트 정보 조회
            Project project = null;
            if (projectPosition != null) {
                project = projectRepository.findById(projectPosition.getProjectId())
                        .orElse(null);
            }

            // 회원 정보 조회
            Member member = memberRepository.findById(application.getMemberId())
                    .orElse(null);

            return AdminProjectArtistDto.builder()
                    .applicationId(application.getId())
                    .projectId(project != null ? project.getId() : null)
                    .projectTitle(project != null ? project.getTitle() : null)
                    .memberId(application.getMemberId())
                    .memberNickname(member != null ? member.getNickname() : null)
                    .portfolioId(application.getPortfolioId())
                    .status(application.getStatus())
                    .message(application.getMessage())
                    .createdAt(application.getCreatedAt())
                    .updatedAt(application.getUpdatedAt())
                    .deletedAt(application.getDeletedAt())
                    .build();
        });
    }

    /**
     * 프로젝트 상세 조회 (삭제된 프로젝트도 조회 가능)
     */
    public ProjectDetailResponse getProjectDetail(Integer projectId) {
        log.info("프로젝트 상세 조회 (관리자) - projectId: {}", projectId);

        // 프로젝트 존재 여부 확인 (삭제된 것도 포함)
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> AdminProjectException.projectNotFound());

        return buildProjectDetailResponse(project);
    }

    /**
     * 프로젝트 삭제 (Soft Delete)
     */
    @Transactional
    public AdminProjectDeleteDto deleteProject(Integer projectId, Integer adminId) {
        log.info("프로젝트 삭제 요청 - projectId: {}, adminId: {}", projectId, adminId);

        // 프로젝트 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> AdminProjectException.projectNotFound());

        // 이미 삭제된 프로젝트인지 확인
        if (project.isDeleted()) {
            throw AdminProjectException.projectAlreadyDeleted();
        }

        // Soft Delete 수행
        project.delete(adminId);
        projectRepository.save(project);

        log.info("프로젝트 삭제 완료 - projectId: {}, deletedBy: {}", projectId, adminId);

        return AdminProjectDeleteDto.builder()
                .projectId(project.getId())
                .deletedAt(project.getDeletedAt())
                .deletedBy(project.getDeletedBy())
                .build();
    }


    /**
     * 프로젝트 상태별 통계 조회
     */
    public AdminProjectStatsDto getProjectStats() {
        log.info("프로젝트 통계 조회 시작");

        ProjectStatsProjection stats = projectRepository.getProjectStatsForAdmin();

        Long recruitingCount = stats.getRecruitingCount() != null ? stats.getRecruitingCount() : 0L;
        Long closedCount = stats.getClosedCount() != null ? stats.getClosedCount() : 0L;
        Long deletedCount = stats.getDeletedCount() != null ? stats.getDeletedCount() : 0L;
        Long totalCount = stats.getTotalCount() != null ? stats.getTotalCount() : 0L;

        log.info("프로젝트 통계 조회 완료 - 전체: {}", totalCount);

        return AdminProjectStatsDto.builder()
                .recruitingCount(recruitingCount)
                .closedCount(closedCount)
                .deletedCount(deletedCount)
                .totalCount(totalCount)
                .build();
    }

    /**
     * ProjectDetailResponse 구성
     */
    private ProjectDetailResponse buildProjectDetailResponse(Project project) {
        // 리더 정보 조회
        Member leader = memberRepository.findById(project.getMemberId())
                .orElse(null);

        // 리뷰 통계 조회 (기존 Repository 쿼리 사용)
        Object[] reviewStats = projectRepository.findReviewStatsByMemberId(project.getMemberId());
        Integer reviewCount = 0;
        Double averageRating = 0.0;

        if (reviewStats != null && reviewStats.length == 2) {
            reviewCount = reviewStats[0] != null ? ((Number) reviewStats[0]).intValue() : 0;
            averageRating = reviewStats[1] != null ? ((Number) reviewStats[1]).doubleValue() : 0.0;
        }

        // 포지션 정보 조회
        List<ProjectPosition> projectPositions = projectPositionRepository.findByProjectIdAndDeletedAtIsNull(project.getId());
        List<ProjectDetailResponse.PositionInfo> positions = projectPositions.stream()
                .map(pp -> {
                    // Position 조회
                    Position position = positionRepository.findById(pp.getPositionId())
                            .orElse(null);

                    // Category 조회
                    Integer categoryId = null;
                    String categoryName = null;

                    if (position != null) {
                        categoryId = position.getCategoryId();
                        if (categoryId != null) {
                            Category category = categoryRepository.findById(categoryId)
                                    .orElse(null);
                            if (category != null) {
                                categoryName = category.getCategoryName();
                            }
                        }
                    }

                    return ProjectDetailResponse.PositionInfo.builder()
                            .projectPositionId(pp.getId())
                            .positionId(pp.getPositionId())
                            .positionName(position != null ? position.getPositionName() : null)
                            .categoryId(categoryId)
                            .categoryName(categoryName)
                            .budget(pp.getBudget())
                            .build();
                })
                .collect(Collectors.toList());

        // 지역 정보 조회
        ProjectDetailResponse.ProvinceInfo provinceInfo = null;
        ProjectDetailResponse.DistrictInfo districtInfo = null;

        if (project.getDistrictId() != null) {
            District district = districtRepository.findById(project.getDistrictId())
                    .orElse(null);
            if (district != null) {
                Province province = provinceRepository.findById(district.getProvinceId())
                        .orElse(null);

                if (province != null) {
                    provinceInfo = ProjectDetailResponse.ProvinceInfo.builder()
                            .id(province.getId())
                            .nameKo(province.getNameKo())
                            .build();
                }

                districtInfo = ProjectDetailResponse.DistrictInfo.builder()
                        .id(district.getId())
                        .code(district.getCode())
                        .nameKo(district.getNameKo())
                        .build();
            }
        }

        // 리더 정보 구성
        ProjectDetailResponse.LeaderInfo leaderInfo = null;
        if (leader != null) {
            leaderInfo = ProjectDetailResponse.LeaderInfo.builder()
                    .userId(leader.getId())
                    .nickname(leader.getNickname())
                    .profileImageUrl(leader.getProfileImageUrl())
                    .reviewCount(reviewCount)
                    .averageRating(averageRating)
                    .build();
        }

        return ProjectDetailResponse.builder()
                .projectId(project.getId())
                .title(project.getTitle())
                .summary(project.getSummary())
                .description(project.getDescription())
                .thumbnailUrl(project.getThumbnailUrl())
                .isOnline(project.getDistrictId() == null)
                .province(provinceInfo)
                .district(districtInfo)
                .positions(positions)
                .viewCount(project.getViewCount().longValue())
                .applyDeadline(project.getApplyDeadline().atOffset(java.time.ZoneOffset.UTC))
                .startAt(project.getStartAt().atOffset(java.time.ZoneOffset.UTC))
                .endAt(project.getEndAt().atOffset(java.time.ZoneOffset.UTC))
                .leader(leaderInfo)
                .createdAt(project.getCreatedAt().atOffset(java.time.ZoneOffset.UTC))
                .updatedAt(project.getUpdatedAt() != null ?
                        project.getUpdatedAt().atOffset(java.time.ZoneOffset.UTC) : null)
                .isClosed(project.getClosedAt() != null)
                .build();
    }
}