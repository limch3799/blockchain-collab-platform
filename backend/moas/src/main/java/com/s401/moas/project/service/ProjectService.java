package com.s401.moas.project.service;

import java.io.IOException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.s401.moas.project.service.dto.SimilarProjectsDto;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.s401.moas.application.repository.ProjectApplicationRepository;
import com.s401.moas.global.exception.ResourceNotFoundException;
import com.s401.moas.global.security.SecurityUtil;
import com.s401.moas.project.exception.ProjectException;
import com.s401.moas.global.service.S3Service;
import com.s401.moas.global.service.EmbeddingService;
import com.s401.moas.global.util.EmbeddingTextBuilder;
import com.s401.moas.member.domain.MemberRole;
import com.s401.moas.member.exception.MemberException;
import com.s401.moas.project.controller.request.CreateProjectRequest;
import com.s401.moas.project.domain.Project;
import com.s401.moas.project.domain.ProjectPosition;
import com.s401.moas.project.domain.ProjectBookmark;
import com.s401.moas.project.repository.CategoryRepository;
import com.s401.moas.project.repository.PositionRepository;
import com.s401.moas.project.repository.ProjectPositionRepository;
import com.s401.moas.project.repository.ProjectRepository;
import com.s401.moas.project.repository.ProjectBookmarkRepository;
import com.s401.moas.project.service.dto.ProjectDto;
import com.s401.moas.project.service.dto.ProjectListDto;
import com.s401.moas.region.domain.District;
import com.s401.moas.region.domain.Province;
import com.s401.moas.region.repository.DistrictRepository;
import com.s401.moas.region.repository.ProvinceRepository;
import com.s401.moas.member.repository.MemberRepository;
import com.s401.moas.member.domain.Member;
import com.s401.moas.project.domain.Category;
import com.s401.moas.project.domain.Position;
import com.s401.moas.project.controller.request.UpdateProjectRequest;
import com.s401.moas.project.controller.response.UpdateProjectResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectPositionRepository projectPositionRepository;
    private final ProjectBookmarkRepository projectBookmarkRepository;
    private final DistrictRepository districtRepository;
    private final ProvinceRepository provinceRepository;
    private final PositionRepository positionRepository;
    private final CategoryRepository categoryRepository;
    private final MemberRepository memberRepository;
    private final ProjectApplicationRepository projectApplicationRepository;
    private final S3Service s3Service;
    private final EmbeddingService embeddingService;
    private final SimilarProjectService similarProjectService;
    private final ApplicationEventPublisher applicationEventPublisher;

    public ProjectListDto getProjectList(int page, int size, String sort, Integer currentMemberId,
            String q,
            String categoryIdsCsv,
            String positionIdsCsv,
            String provinceCode,
            String districtCodesCsv,
            String status,
            Boolean bookmarked) {
        List<Integer> categoryIds = parseCsvToIntList(categoryIdsCsv);
        List<Integer> positionIds = parseCsvToIntList(positionIdsCsv);
        List<String> districtCodes = parseCsvToStringList(districtCodesCsv);
        
        // 플래그 변수 생성 (빈 리스트는 false로 처리)
        boolean hasCategoryIds = categoryIds != null && !categoryIds.isEmpty();
        boolean hasPositionIds = positionIds != null && !positionIds.isEmpty();
        boolean hasDistrictCodes = districtCodes != null && !districtCodes.isEmpty();
        
        // 빈 리스트는 null로 변환 (SQL IN 절에서 빈 리스트는 오류 발생)
        if (!hasCategoryIds) categoryIds = null;
        if (!hasPositionIds) positionIds = null;
        if (!hasDistrictCodes) districtCodes = null;

        // status 정규화: recruiting, closed, 또는 null(전체)
        String normalizedStatus = null;
        if (status != null && !status.isBlank()) {
            String lowerStatus = status.toLowerCase();
            if ("recruiting".equals(lowerStatus) || "closed".equals(lowerStatus)) {
                normalizedStatus = lowerStatus;
            }
        }

        // bookmarked=true일 때는 북마크한 프로젝트만 조회
        boolean isBookmarkedFilter = Boolean.TRUE.equals(bookmarked);

        long total;
        Pageable pageable = PageRequest.of(page - 1, size);
        List<ProjectRepository.ProjectRow> rows;

        if (isBookmarkedFilter) {
            // 북마크한 프로젝트만 조회
            total = projectRepository.countBookmarkedProjects(currentMemberId, q, hasCategoryIds, categoryIds,
                    hasPositionIds, positionIds, provinceCode, hasDistrictCodes, districtCodes, normalizedStatus);
            rows = projectRepository.findBookmarkedProjects(
                    currentMemberId, q, hasCategoryIds, categoryIds, hasPositionIds, positionIds,
                    provinceCode, hasDistrictCodes, districtCodes, normalizedStatus, pageable);
        } else {
            // 전체 프로젝트 조회
            total = projectRepository.countAllWithFilters(q, hasCategoryIds, categoryIds, hasPositionIds, positionIds,
                    provinceCode, hasDistrictCodes, districtCodes, normalizedStatus);

            switch (sort.toLowerCase()) {
                case "views" -> rows = projectRepository.findProjectsViews(
                        currentMemberId, q, hasCategoryIds, categoryIds, hasPositionIds, positionIds,
                        provinceCode, hasDistrictCodes, districtCodes, normalizedStatus, pageable);
                case "start" -> rows = projectRepository.findProjectsStart(
                        currentMemberId, q, hasCategoryIds, categoryIds, hasPositionIds, positionIds,
                        provinceCode, hasDistrictCodes, districtCodes, normalizedStatus, pageable);
                case "amount" -> rows = projectRepository.findProjectsAmount(
                        currentMemberId, q, hasCategoryIds, categoryIds, hasPositionIds, positionIds,
                        provinceCode, hasDistrictCodes, districtCodes, normalizedStatus, pageable);
                default -> rows = projectRepository.findProjectsCreated(
                        currentMemberId, q, hasCategoryIds, categoryIds, hasPositionIds, positionIds,
                        provinceCode, hasDistrictCodes, districtCodes, normalizedStatus, pageable);
            }
        }

        Map<Integer, List<ProjectListDto.PositionBriefDto>> posMap = findPositionsByProjectIds(
                rows.stream().map(ProjectRepository.ProjectRow::getId).collect(Collectors.toSet()));

        LocalDateTime now = LocalDateTime.now();
        List<ProjectListDto.ProjectItemDto> items = rows.stream().map(r -> {
            boolean isOnline = (r.getProvinceCode() == null && r.getDistrictCode() == null);
            boolean isClosed = (r.getClosedAt() != null) || 
                    (r.getApplyDeadline() != null && !r.getApplyDeadline().toLocalDateTime().isAfter(now));
            return ProjectListDto.ProjectItemDto.builder()
                    .id(r.getId())
                    .title(r.getTitle())
                    .summary(r.getSummary())
                    .leaderNickname(r.getLeaderNickname())
                    .leaderProfileImageUrl(r.getLeaderProfileImageUrl())
                    .thumbnailUrl(r.getThumbnailUrl())
                    .isOnline(isOnline)
                    .provinceCode(isOnline ? null : r.getProvinceCode())
                    .province(isOnline ? null : r.getProvince())
                    .districtCode(isOnline ? null : r.getDistrictCode())
                    .district(isOnline ? null : r.getDistrict())
                    .startAt(toOffsetDateTime(r.getStartAt()))
                    .endAt(toOffsetDateTime(r.getEndAt()))
                    .positions(posMap.getOrDefault(r.getId(), List.of()))
                    .totalBudget(r.getTotalBudget())
                    .viewCount(r.getViewCount())
                    .createdAt(toOffsetDateTime(r.getCreatedAt()))
                    .updatedAt(toOffsetDateTime(r.getUpdatedAt()))
                    .bookmarked(toBoolean(r.getBookmarked()))
                    .isClosed(isClosed)
                    .build();
        }).toList();

        return ProjectListDto.builder()
                .page(page)
                .size(size)
                .total(total)
                .items(items)
                .build();
    }

    private static List<Integer> parseCsvToIntList(String csv) {
        if (csv == null || csv.isBlank())
            return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Integer::valueOf)
                .collect(Collectors.toList());
    }

    private static List<String> parseCsvToStringList(String csv) {
        if (csv == null || csv.isBlank())
            return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    /**
     * 프로젝트 등록
     */
    @Transactional
    public ProjectDto createProject(CreateProjectRequest request, Integer memberId) {
        try {
            // 0. 권한 검증: 리더만 등록 가능 (SecurityContext에서 권한 확인)
            Authentication authentication = SecurityUtil.getAuthentication();
            String role = authentication.getAuthorities().stream()
                    .findFirst()
                    .map(a -> a.getAuthority())
                    .orElse("");
            if (!MemberRole.LEADER.name().equals(role)) {
                throw MemberException.invalidMemberRole();
            }

            // 1. District 조회 및 검증 (null이면 온라인 프로젝트)
            Integer districtId = null;
            if (request.getDistrictCode() != null && !request.getDistrictCode().isBlank()) {
                District district = districtRepository.findByCode(request.getDistrictCode())
                        .orElseThrow(() -> new ResourceNotFoundException("지역", request.getDistrictCode()));
                districtId = district.getId();
            }

            // 2. Position 검증
            for (CreateProjectRequest.PositionRequest positionRequest : request.getPositions()) {
                if (!positionRepository.existsById(positionRequest.getPositionId())) {
                    throw new ResourceNotFoundException("포지션", positionRequest.getPositionId());
                }
            }

            // 3. 날짜 관계 검증: applyDeadline <= startAt <= endAt
            if (request.getApplyDeadline() != null && request.getStartAt() != null && request.getEndAt() != null) {
                if (request.getApplyDeadline().isAfter(request.getStartAt()) || request.getStartAt().isAfter(request.getEndAt())) {
                    throw ProjectException.invalidDateRange();
                }
            }

            // 4. 썸네일 업로드 (있는 경우)
            String thumbnailUrl = null;
            if (request.getThumbnail() != null && !request.getThumbnail().isEmpty()) {
                thumbnailUrl = uploadThumbnail(request.getThumbnail());
            }

            // 5. Project 생성 및 저장
            Project project = Project.builder()
                    .memberId(memberId)
                    .districtId(districtId)
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .summary(request.getSummary())
                    .startAt(request.getStartAt())
                    .endAt(request.getEndAt())
                    .applyDeadline(request.getApplyDeadline())
                    .thumbnailUrl(thumbnailUrl)
                    .viewCount(0)
                    .build();

            Project savedProject = projectRepository.save(project);

            // 6. ProjectPosition 생성 및 저장
            for (CreateProjectRequest.PositionRequest positionRequest : request.getPositions()) {
                ProjectPosition projectPosition = ProjectPosition.builder()
                        .projectId(savedProject.getId())
                        .positionId(positionRequest.getPositionId())
                        .budget(positionRequest.getBudget())
                        .status(ProjectPosition.PositionStatus.RECRUITING)
                        .build();

                projectPositionRepository.save(projectPosition);
            }

            // 7. 벡터 인덱싱을 위한 이벤트 발행 (트랜잭션 커밋 후)
            applicationEventPublisher.publishEvent(new ProjectChangedEvent(savedProject.getId()));

            // 8. DTO 변환 및 반환
            return ProjectDto.builder()
                    .projectId(savedProject.getId())
                    .title(savedProject.getTitle())
                    .summary(savedProject.getSummary())
                    .thumbnailUrl(savedProject.getThumbnailUrl())
                    .positionCount(request.getPositions().size())
                    .createdAt(savedProject.getCreatedAt())
                    .build();

        } catch (IOException e) {
            log.error("프로젝트 등록 중 파일 업로드 오류 발생", e);
            throw new RuntimeException("파일 업로드에 실패했습니다.", e);
        }
    }

    /**
     * 썸네일 업로드
     */
    private String uploadThumbnail(MultipartFile thumbnailFile) throws IOException {
        return s3Service.upload(thumbnailFile, "project/thumbnails");
    }

    /**
     * 프로젝트별 포지션 정보 조회
     */
    private Map<Integer, List<ProjectListDto.PositionBriefDto>> findPositionsByProjectIds(
            java.util.Collection<Integer> projectIds) {
        if (projectIds == null || projectIds.isEmpty()) {
            return Map.of();
        }

        List<Object[]> results = projectRepository.findPositionsByProjectIdsRaw(projectIds);
        Map<Integer, List<ProjectListDto.PositionBriefDto>> map = new HashMap<>();

        for (Object[] row : results) {
            Integer projectId = ((Number) row[0]).intValue();
            String categoryName = (String) row[1];
            String positionName = (String) row[2];
            Long budget = row[3] != null ? ((Number) row[3]).longValue() : null;

            ProjectListDto.PositionBriefDto brief = ProjectListDto.PositionBriefDto.builder()
                    .categoryName(categoryName)
                    .positionName(positionName)
                    .budget(budget)
                    .build();

            map.computeIfAbsent(projectId, k -> new java.util.ArrayList<>()).add(brief);
        }

        return map;
    }

    /**
     * 포지션 삭제 가능 여부 확인
     * 
     * @param projectId  프로젝트 ID
     * @param positionId 프로젝트 포지션 ID
     * @param memberId   회원 ID (프로젝트 소유권 확인용)
     * @return 삭제 가능하면 true, 불가능하면 예외 발생
     * @throws ProjectException 프로젝트 또는 포지션을 찾을 수 없거나, 삭제 불가능한 경우
     */
    @Transactional(readOnly = true)
    public boolean isPositionDeletable(Integer projectId, Long positionId, Integer memberId) {
        // 1. 프로젝트 존재 확인
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> ProjectException.projectNotFound(projectId));

        // 2. 프로젝트 소유권 확인
        if (!project.getMemberId().equals(memberId)) {
            throw ProjectException.projectAccessDenied();
        }

        // 3. 프로젝트 포지션 존재 확인 (soft delete 고려)
        ProjectPosition projectPosition = projectPositionRepository.findByIdAndDeletedAtIsNull(positionId)
                .orElseThrow(() -> ProjectException.projectPositionNotFound(positionId));

        // 4. 포지션이 해당 프로젝트에 속하는지 확인
        if (!projectPosition.getProjectId().equals(projectId)) {
            throw ProjectException.projectPositionMismatch();
        }

        // 5. 해당 포지션에 삭제되지 않은 PENDING 또는 OFFERED 상태의 지원서 존재 여부 확인
        // PENDING, OFFERED 상태의 지원서가 있으면 삭제 불가능
        // ProjectPosition.id는 Long 타입, ProjectApplication.projectPositionId는 Integer 타입
        List<com.s401.moas.application.domain.ApplicationStatus> blockingStatuses = List.of(
                com.s401.moas.application.domain.ApplicationStatus.PENDING,
                com.s401.moas.application.domain.ApplicationStatus.OFFERED);

        boolean hasBlockingApplications = projectApplicationRepository
                .existsByProjectPositionIdAndStatusInAndDeletedAtIsNull(
                        positionId, blockingStatuses);

        // 6. PENDING 또는 OFFERED 상태의 지원서가 있으면 예외 발생
        if (hasBlockingApplications) {
            throw ProjectException.cannotDeletePositionWithApplications();
        }

        // 7. 모든 검증 통과 시 삭제 가능
        return true;
    }

    /**
     * 자신이 등록한 프로젝트 목록 조회
     * 리더 권한이 필요합니다.
     */
    @Transactional(readOnly = true)
    public ProjectListDto getMyProjectList(int page, int size, String sort, Integer memberId,
            String q,
            String categoryIdsCsv,
            String positionIdsCsv,
            String provinceCode,
            String districtCodesCsv,
            String status) {
        // 0. 권한 검증: 리더만 조회 가능
        Authentication authentication = SecurityUtil.getAuthentication();
        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("");
        if (!MemberRole.LEADER.name().equals(role)) {
            throw MemberException.invalidMemberRole();
        }

        List<Integer> categoryIds = parseCsvToIntList(categoryIdsCsv);
        List<Integer> positionIds = parseCsvToIntList(positionIdsCsv);
        List<String> districtCodes = parseCsvToStringList(districtCodesCsv);
        
        // 플래그 변수 생성 (빈 리스트는 false로 처리)
        boolean hasCategoryIds = categoryIds != null && !categoryIds.isEmpty();
        boolean hasPositionIds = positionIds != null && !positionIds.isEmpty();
        boolean hasDistrictCodes = districtCodes != null && !districtCodes.isEmpty();
        
        // 빈 리스트는 null로 변환 (SQL IN 절에서 빈 리스트는 오류 발생)
        if (!hasCategoryIds) categoryIds = null;
        if (!hasPositionIds) positionIds = null;
        if (!hasDistrictCodes) districtCodes = null;

        // status 정규화: recruiting, closed, 또는 null(전체)
        String normalizedStatus = null;
        if (status != null && !status.isBlank()) {
            String lowerStatus = status.toLowerCase();
            if ("recruiting".equals(lowerStatus) || "closed".equals(lowerStatus)) {
                normalizedStatus = lowerStatus;
            }
        }

        long total = projectRepository.countMyProjectsWithFilters(memberId, q, hasCategoryIds, categoryIds,
                hasPositionIds, positionIds, provinceCode, hasDistrictCodes, districtCodes, normalizedStatus);

        // 진행중인 공고 개수와 마감된 공고 개수 조회
        long recruitingCount = projectRepository.countMyRecruitingProjects(memberId, q, hasCategoryIds, categoryIds,
                hasPositionIds, positionIds, provinceCode, hasDistrictCodes, districtCodes);
        long closedCount = projectRepository.countMyClosedProjects(memberId, q, hasCategoryIds, categoryIds,
                hasPositionIds, positionIds, provinceCode, hasDistrictCodes, districtCodes);

        Pageable pageable = PageRequest.of(page - 1, size);
        List<ProjectRepository.ProjectRow> rows;

        switch (sort.toLowerCase()) {
            case "views" -> rows = projectRepository.findMyProjectsViews(
                    memberId, q, hasCategoryIds, categoryIds, hasPositionIds, positionIds,
                    provinceCode, hasDistrictCodes, districtCodes, normalizedStatus, pageable);
            case "start" -> rows = projectRepository.findMyProjectsStart(
                    memberId, q, hasCategoryIds, categoryIds, hasPositionIds, positionIds,
                    provinceCode, hasDistrictCodes, districtCodes, normalizedStatus, pageable);
            case "amount" -> rows = projectRepository.findMyProjectsAmount(
                    memberId, q, hasCategoryIds, categoryIds, hasPositionIds, positionIds,
                    provinceCode, hasDistrictCodes, districtCodes, normalizedStatus, pageable);
            default -> rows = projectRepository.findMyProjectsCreated(
                    memberId, q, hasCategoryIds, categoryIds, hasPositionIds, positionIds,
                    provinceCode, hasDistrictCodes, districtCodes, normalizedStatus, pageable);
        }

        Map<Integer, List<ProjectListDto.PositionBriefDto>> posMap = findPositionsByProjectIds(
                rows.stream().map(ProjectRepository.ProjectRow::getId).collect(Collectors.toSet()));

        LocalDateTime now = LocalDateTime.now();
        List<ProjectListDto.ProjectItemDto> items = rows.stream().map(r -> {
            boolean isOnline = (r.getProvinceCode() == null && r.getDistrictCode() == null);
            boolean isClosed = (r.getClosedAt() != null) || 
                    (r.getApplyDeadline() != null && !r.getApplyDeadline().toLocalDateTime().isAfter(now));
            return ProjectListDto.ProjectItemDto.builder()
                    .id(r.getId())
                    .title(r.getTitle())
                    .summary(r.getSummary())
                    .leaderNickname(r.getLeaderNickname())
                    .leaderProfileImageUrl(r.getLeaderProfileImageUrl())
                    .thumbnailUrl(r.getThumbnailUrl())
                    .isOnline(isOnline)
                    .provinceCode(isOnline ? null : r.getProvinceCode())
                    .province(isOnline ? null : r.getProvince())
                    .districtCode(isOnline ? null : r.getDistrictCode())
                    .district(isOnline ? null : r.getDistrict())
                    .startAt(toOffsetDateTime(r.getStartAt()))
                    .endAt(toOffsetDateTime(r.getEndAt()))
                    .positions(posMap.getOrDefault(r.getId(), List.of()))
                    .totalBudget(r.getTotalBudget())
                    .viewCount(r.getViewCount())
                    .createdAt(toOffsetDateTime(r.getCreatedAt()))
                    .updatedAt(toOffsetDateTime(r.getUpdatedAt()))
                    .bookmarked(toBoolean(r.getBookmarked()))
                    .isClosed(isClosed)
                    .build();
        }).toList();

        return ProjectListDto.builder()
                .page(page)
                .size(size)
                .total(total)
                .recruitingCount(recruitingCount)
                .closedCount(closedCount)
                .items(items)
                .build();
    }

    /**
     * 프로젝트 수정
     * 부분 업데이트 지원: 전달된 필드만 수정
     * positions를 보내면 전체 교체(Replace All) 규칙으로 처리
     */
    @Transactional
    public UpdateProjectResponse updateProject(Integer projectId, UpdateProjectRequest request, Integer memberId) {
        try {
            // 1. 프로젝트 조회 및 검증
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> ProjectException.projectNotFound(projectId));

            // 2. 프로젝트 소유권 확인
            if (!project.getMemberId().equals(memberId)) {
                throw ProjectException.projectAccessDenied();
            }

            // 3. 삭제된 프로젝트 확인
            if (project.getDeletedAt() != null) {
                throw ProjectException.projectNotFound(projectId);
            }

            // 4. 상태 충돌 확인 (마감/종료 이후 수정 불가)
            LocalDateTime now = LocalDateTime.now();
            if (project.getClosedAt() != null || 
                (project.getApplyDeadline() != null && project.getApplyDeadline().isBefore(now)) ||
                (project.getEndAt() != null && project.getEndAt().isBefore(now))) {
                throw ProjectException.projectAlreadyClosed();
            }

            // 5. District 업데이트 및 검증
            Integer districtId = project.getDistrictId();
            if (request.getDistrictCode() != null) {
                District district = districtRepository.findByCode(request.getDistrictCode())
                        .orElseThrow(() -> new ResourceNotFoundException("지역", request.getDistrictCode()));
                districtId = district.getId();
            }

            // 6. 썸네일 업데이트
            String thumbnailUrl = project.getThumbnailUrl();
            if (request.getThumbnail() != null && !request.getThumbnail().isEmpty()) {
                thumbnailUrl = uploadThumbnail(request.getThumbnail());
            } else if (request.getThumbnailUrl() != null) {
                thumbnailUrl = request.getThumbnailUrl();
            }

            // 7. 날짜 업데이트 및 검증
            LocalDateTime applyDeadline = request.getApplyDeadline() != null ? 
                    request.getApplyDeadline() : project.getApplyDeadline();
            LocalDateTime startAt = request.getStartAt() != null ? 
                    request.getStartAt() : project.getStartAt();
            LocalDateTime endAt = request.getEndAt() != null ? 
                    request.getEndAt() : project.getEndAt();

            // 날짜 관계 검증: applyDeadline <= startAt <= endAt
            if (applyDeadline != null && startAt != null && endAt != null) {
                if (applyDeadline.isAfter(startAt) || startAt.isAfter(endAt)) {
                    throw ProjectException.invalidDateRange();
                }
            }

            // 8. 부분 업데이트: 전달된 필드만 수정
            project.update(
                    request.getTitle(),
                    request.getSummary(),
                    request.getDescription(),
                    districtId,
                    thumbnailUrl,
                    applyDeadline,
                    startAt,
                    endAt
            );

            // 6. Project 저장
            Project savedProject = projectRepository.save(project);

            // 7. Positions 전체 교체 (positions를 보내면)
            if (request.getPositions() != null) {
                // 7-1. Position 검증 및 중복 확인
                List<Integer> positionIds = request.getPositions().stream()
                        .map(UpdateProjectRequest.PositionRequest::getPositionId)
                        .collect(Collectors.toList());
                
                // 중복 확인
                if (positionIds.size() != positionIds.stream().distinct().count()) {
                    throw ProjectException.duplicatePositionIds();
                }

                // Position 존재 확인
                for (UpdateProjectRequest.PositionRequest positionRequest : request.getPositions()) {
                    if (!positionRepository.existsById(positionRequest.getPositionId())) {
                        throw new ResourceNotFoundException("포지션", positionRequest.getPositionId());
                    }
                }

                // 7-2. 기존 ProjectPosition 조회
                List<ProjectPosition> existingPositions = projectPositionRepository.findByProjectIdAndDeletedAtIsNull(projectId);
                
                // 7-3. 새 포지션 목록에서 positionId만 추출
                List<Integer> newPositionIds = request.getPositions().stream()
                        .map(UpdateProjectRequest.PositionRequest::getPositionId)
                        .collect(Collectors.toList());
                
                // 7-4. 제거될 포지션 확인 (기존에는 있지만 새에는 없는 포지션)
                for (ProjectPosition existingPosition : existingPositions) {
                    if (!newPositionIds.contains(existingPosition.getPositionId())) {
                        // 제거될 포지션에 대해 삭제 가능 여부 확인 (기존 메서드 활용)
                        isPositionDeletable(projectId, existingPosition.getId(), memberId);
                        // 삭제 가능하면 soft delete
                        existingPosition.delete();
                        projectPositionRepository.save(existingPosition);
                    }
                }

                // 7-5. 기존 포지션 Map 생성 (positionId -> ProjectPosition)
                Map<Integer, ProjectPosition> existingPositionMap = existingPositions.stream()
                        .filter(pp -> newPositionIds.contains(pp.getPositionId()))
                        .collect(Collectors.toMap(ProjectPosition::getPositionId, pp -> pp));

                // 7-6. 새 포지션 추가 또는 기존 포지션 수정
                for (UpdateProjectRequest.PositionRequest positionRequest : request.getPositions()) {
                    ProjectPosition existingPosition = existingPositionMap.get(positionRequest.getPositionId());
                    
                    if (existingPosition != null) {
                        // 기존 포지션 수정 (budget만 업데이트)
                        ProjectPosition updatedPosition = ProjectPosition.builder()
                                .id(existingPosition.getId())
                                .projectId(existingPosition.getProjectId())
                                .positionId(existingPosition.getPositionId())
                                .budget(positionRequest.getBudget())
                                .status(existingPosition.getStatus())
                                .createdAt(existingPosition.getCreatedAt())
                                .deletedAt(existingPosition.getDeletedAt())
                                .build();
                        projectPositionRepository.save(updatedPosition);
                    } else {
                        // 새 포지션 추가
                        ProjectPosition newPosition = ProjectPosition.builder()
                                .projectId(savedProject.getId())
                                .positionId(positionRequest.getPositionId())
                                .budget(positionRequest.getBudget())
                                .status(ProjectPosition.PositionStatus.RECRUITING)
                                .build();
                        projectPositionRepository.save(newPosition);
                    }
                }
            }

            // 8. 벡터 인덱싱을 위한 이벤트 발행 (트랜잭션 커밋 후)
            applicationEventPublisher.publishEvent(new ProjectChangedEvent(savedProject.getId()));

            // 9. 응답 DTO 생성
            return buildUpdateProjectResponse(savedProject);

        } catch (IOException e) {
            log.error("프로젝트 수정 중 파일 업로드 오류 발생", e);
            throw new RuntimeException("파일 업로드에 실패했습니다.", e);
        }
    }

    /**
     * UpdateProjectResponse 생성
     */
    private UpdateProjectResponse buildUpdateProjectResponse(Project project) {
        // District 및 Province 조회 (온라인 프로젝트인 경우 null)
        final Integer districtId = project.getDistrictId();
        final District district = districtId != null
                ? districtRepository.findById(districtId)
                        .orElseThrow(() -> new ResourceNotFoundException("지역", districtId))
                : null;
        final Province province = district != null
                ? provinceRepository.findById(district.getProvinceId())
                        .orElseThrow(() -> new ResourceNotFoundException("시/도", district.getProvinceId()))
                : null;
        final boolean isOnline = district == null;

        // Member 조회
        Member member = memberRepository.findById(project.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("회원", project.getMemberId()));

        // Positions 조회
        List<ProjectPosition> projectPositions = projectPositionRepository.findByProjectIdAndDeletedAtIsNull(project.getId());
        List<UpdateProjectResponse.PositionInfo> positionInfos = projectPositions.stream()
                .map(pp -> {
                    Position position = positionRepository.findById(pp.getPositionId())
                            .orElseThrow(() -> new ResourceNotFoundException("포지션", pp.getPositionId()));
                    Category category = categoryRepository.findById(position.getCategoryId())
                            .orElseThrow(() -> new ResourceNotFoundException("카테고리", position.getCategoryId()));
                    
                    return UpdateProjectResponse.PositionInfo.builder()
                            .positionId(pp.getPositionId())
                            .positionName(position.getPositionName())
                            .categoryId(position.getCategoryId())
                            .categoryName(category.getCategoryName())
                            .budget(pp.getBudget())
                            .build();
                })
                .collect(Collectors.toList());

        return UpdateProjectResponse.builder()
                .projectId(project.getId())
                .title(project.getTitle())
                .summary(project.getSummary())
                .description(project.getDescription())
                .thumbnailUrl(project.getThumbnailUrl())
                .isOnline(isOnline)
                .province(province != null
                        ? UpdateProjectResponse.ProvinceInfo.builder()
                                .id(province.getId())
                                .nameKo(province.getNameKo())
                                .build()
                        : null)
                .district(district != null
                        ? UpdateProjectResponse.DistrictInfo.builder()
                                .id(district.getId())
                                .nameKo(district.getNameKo())
                                .build()
                        : null)
                .positions(positionInfos)
                .viewCount(project.getViewCount().longValue())
                .applyDeadline(project.getApplyDeadline() != null ? 
                        project.getApplyDeadline().atZone(ZoneId.systemDefault()).toOffsetDateTime() : null)
                .startAt(project.getStartAt() != null ? 
                        project.getStartAt().atZone(ZoneId.systemDefault()).toOffsetDateTime() : null)
                .endAt(project.getEndAt() != null ? 
                        project.getEndAt().atZone(ZoneId.systemDefault()).toOffsetDateTime() : null)
                .leader(UpdateProjectResponse.LeaderInfo.builder()
                        .userId(member.getId())
                        .nickname(member.getNickname())
                        .profileImageUrl(member.getProfileImageUrl())
                        .build())
                .createdAt(project.getCreatedAt() != null ? 
                        project.getCreatedAt().atZone(ZoneId.systemDefault()).toOffsetDateTime() : null)
                .updatedAt(project.getUpdatedAt() != null ? 
                        project.getUpdatedAt().atZone(ZoneId.systemDefault()).toOffsetDateTime() : null)
                .build();
    }

    /**
     * 프로젝트 상세 조회
     * 
     * @param projectId 프로젝트 ID
     * @return 프로젝트 상세 정보 (리더 정보 포함)
     * @throws ProjectException 프로젝트를 찾을 수 없는 경우
     */
    @Transactional
    public com.s401.moas.project.controller.response.ProjectDetailResponse getProjectDetail(Integer projectId) {
        // 1. 프로젝트 조회 및 검증
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> ProjectException.projectNotFound(projectId));

        // 2. 삭제된 프로젝트 확인
        if (project.getDeletedAt() != null) {
            throw ProjectException.projectNotFound(projectId);
        }

        // 3. 조회수 증가
        project.incrementViewCount();
        projectRepository.save(project);

        // 4. District 및 Province 조회 (온라인 프로젝트인 경우 null)
        final Integer districtId = project.getDistrictId();
        final District district = districtId != null
                ? districtRepository.findById(districtId)
                        .orElseThrow(() -> new ResourceNotFoundException("지역", districtId))
                : null;
        final Province province = district != null
                ? provinceRepository.findById(district.getProvinceId())
                        .orElseThrow(() -> new ResourceNotFoundException("시/도", district.getProvinceId()))
                : null;
        final boolean isOnline = district == null;

        // 5. Member 조회 (리더 정보)
        Member member = memberRepository.findById(project.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("회원", project.getMemberId()));

        // 6. Positions 조회
        List<ProjectPosition> projectPositions = projectPositionRepository.findByProjectIdAndDeletedAtIsNull(project.getId());
        List<com.s401.moas.project.controller.response.ProjectDetailResponse.PositionInfo> positionInfos = projectPositions.stream()
                .map(pp -> {
                    Position position = positionRepository.findById(pp.getPositionId())
                            .orElseThrow(() -> new ResourceNotFoundException("포지션", pp.getPositionId()));
                    Category category = categoryRepository.findById(position.getCategoryId())
                            .orElseThrow(() -> new ResourceNotFoundException("카테고리", position.getCategoryId()));
                    
                    // 포지션 마감 여부 확인
                    boolean isPositionClosed = pp.getStatus() == ProjectPosition.PositionStatus.COMPLETED;
                    
                    return com.s401.moas.project.controller.response.ProjectDetailResponse.PositionInfo.builder()
                            .projectPositionId(pp.getId())
                            .positionId(pp.getPositionId())
                            .positionName(position.getPositionName())
                            .categoryId(position.getCategoryId())
                            .categoryName(category.getCategoryName())
                            .budget(pp.getBudget())
                            .isClosed(isPositionClosed)
                            .build();
                })
                .collect(Collectors.toList());

        // 7. 리뷰 개수 및 평균 평점 조회 (네이티브 쿼리)
        Object[] reviewStats = projectRepository.findReviewStatsByMemberId(project.getMemberId());
        Integer reviewCount = 0;
        Double averageRating = 0.0;
        
        if (reviewStats != null && reviewStats.length >= 2) {
            reviewCount = reviewStats[0] != null ? ((Number) reviewStats[0]).intValue() : 0;
            averageRating = reviewStats[1] != null ? ((Number) reviewStats[1]).doubleValue() : 0.0;
        }
        
        // 평균 평점을 소수점 아래 1자리로 반올림
        averageRating = Math.round(averageRating * 10.0) / 10.0;

        // 8. 유사 프로젝트 조회
        List<com.s401.moas.project.controller.response.ProjectDetailResponse.SimilarCard> similarCards = List.of();
        try {
            // 포지션 이름 리스트 추출
            List<String> positionNames = positionInfos.stream()
                    .map(com.s401.moas.project.controller.response.ProjectDetailResponse.PositionInfo::getPositionName)
                    .toList();
            
            // 위치 텍스트 추출
            String locationText = isOnline ? "online" : (district != null ? district.getNameKo() : "online");
            
            // 임베딩 텍스트 생성
            String text = EmbeddingTextBuilder.build(
                    project.getTitle(),
                    project.getSummary(),
                    positionNames,
                    locationText
            );
            
            // 벡터 생성
            float[] queryVector = embeddingService.embed(text);
            
            // 유사 프로젝트 검색 (Top-50 가져와서 5개만 사용)
            List<Long> topIds = similarProjectService.searchIds(queryVector, 50, project.getId().longValue());
            List<Long> fiveIds = topIds.stream().limit(5).toList();
            
            if (!fiveIds.isEmpty()) {
                List<Integer> fiveIdsInt = fiveIds.stream().map(Long::intValue).toList();
                List<ProjectRepository.ProjectCardRow> cards = projectRepository.findCardsByIds(fiveIdsInt);
                
                // 순서 유지: ID 리스트 순서대로 정렬
                Map<Integer, ProjectRepository.ProjectCardRow> cardMap = cards.stream()
                        .collect(Collectors.toMap(ProjectRepository.ProjectCardRow::getProjectId, card -> card));
                
                // 유사 프로젝트들의 포지션 정보 조회
                Map<Integer, List<ProjectListDto.PositionBriefDto>> positionsMap = findPositionsByProjectIds(fiveIdsInt);
                
                similarCards = fiveIdsInt.stream()
                        .filter(cardMap::containsKey) // DB에서 조회된 것만
                        .map(id -> {
                            ProjectRepository.ProjectCardRow card = cardMap.get(id);
                            List<com.s401.moas.project.controller.response.ProjectDetailResponse.PositionBrief> positions = 
                                    positionsMap.getOrDefault(id, List.of()).stream()
                                            .map(pos -> com.s401.moas.project.controller.response.ProjectDetailResponse.PositionBrief.builder()
                                                    .categoryName(pos.getCategoryName())
                                                    .positionName(pos.getPositionName())
                                                    .budget(pos.getBudget())
                                                    .build())
                                            .toList();
                            return com.s401.moas.project.controller.response.ProjectDetailResponse.SimilarCard.from(card, positions);
                        })
                        .toList();
            }
        } catch (Exception e) {
            // 임베딩/검색 장애 시에도 상세는 내려가게
            log.warn("유사 프로젝트 조회 실패 - projectId: {}", projectId, e);
        }

        // 9. 응답 DTO 생성
        return com.s401.moas.project.controller.response.ProjectDetailResponse.builder()
                .projectId(project.getId())
                .title(project.getTitle())
                .summary(project.getSummary())
                .description(project.getDescription())
                .thumbnailUrl(project.getThumbnailUrl())
                .isOnline(isOnline)
                .province(province != null
                        ? com.s401.moas.project.controller.response.ProjectDetailResponse.ProvinceInfo.builder()
                                .id(province.getId())
                                .nameKo(province.getNameKo())
                                .build()
                        : null)
                .district(district != null
                        ? com.s401.moas.project.controller.response.ProjectDetailResponse.DistrictInfo.builder()
                                .id(district.getId())
                                .code(district.getCode())
                                .nameKo(district.getNameKo())
                                .build()
                        : null)
                .positions(positionInfos)
                .viewCount(project.getViewCount().longValue())
                .applyDeadline(project.getApplyDeadline() != null ? 
                        project.getApplyDeadline().atZone(ZoneId.systemDefault()).toOffsetDateTime() : null)
                .startAt(project.getStartAt() != null ? 
                        project.getStartAt().atZone(ZoneId.systemDefault()).toOffsetDateTime() : null)
                .endAt(project.getEndAt() != null ? 
                        project.getEndAt().atZone(ZoneId.systemDefault()).toOffsetDateTime() : null)
                .leader(com.s401.moas.project.controller.response.ProjectDetailResponse.LeaderInfo.builder()
                        .userId(member.getId())
                        .nickname(member.getNickname())
                        .profileImageUrl(member.getProfileImageUrl())
                        .reviewCount(reviewCount)
                        .averageRating(averageRating)
                        .build())
                .createdAt(project.getCreatedAt() != null ? 
                        project.getCreatedAt().atZone(ZoneId.systemDefault()).toOffsetDateTime() : null)
                .updatedAt(project.getUpdatedAt() != null ? 
                        project.getUpdatedAt().atZone(ZoneId.systemDefault()).toOffsetDateTime() : null)
                .isClosed(project.getClosedAt() != null || 
                        (project.getApplyDeadline() != null && !project.getApplyDeadline().isAfter(LocalDateTime.now())))
                .similar(similarCards)
                .build();
    }

    /**
     * 프로젝트 마감 처리
     * 
     * @param projectId 프로젝트 ID
     * @param memberId  회원 ID (프로젝트 소유권 확인용)
     * @throws ProjectException 프로젝트를 찾을 수 없거나, 마감 불가능한 경우
     */
    @Transactional
    public void closeProject(Integer projectId, Integer memberId) {
        // 1. 프로젝트 조회 및 검증
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> ProjectException.projectNotFound(projectId));

        // 2. 프로젝트 소유권 확인
        if (!project.getMemberId().equals(memberId)) {
            throw ProjectException.projectAccessDenied();
        }

        // 3. 삭제된 프로젝트 확인
        if (project.getDeletedAt() != null) {
            throw ProjectException.projectNotFound(projectId);
        }

        // 4. 이미 마감된 프로젝트 확인
        if (project.getClosedAt() != null) {
            throw ProjectException.projectAlreadyClosed();
        }

        // 5. 프로젝트의 모든 포지션 조회 및 마감 처리
        List<ProjectPosition> projectPositions = projectPositionRepository.findByProjectIdAndDeletedAtIsNull(projectId);
        for (ProjectPosition projectPosition : projectPositions) {
            // RECRUITING 상태인 포지션만 마감 처리 (이미 마감된 포지션은 건너뜀)
            if (projectPosition.getStatus() == ProjectPosition.PositionStatus.RECRUITING) {
                projectPosition.close();
                projectPositionRepository.save(projectPosition);
            }
        }

        // 6. 프로젝트 마감 처리
        project.close();
        projectRepository.save(project);

        log.info("프로젝트 마감 처리 완료 - projectId: {}, memberId: {}, 마감된 포지션 수: {}", 
                projectId, memberId, projectPositions.size());
    }

    /**
     * 프로젝트 삭제
     * 
     * @param projectId 프로젝트 ID
     * @param memberId  회원 ID (프로젝트 소유권 확인용)
     * @throws ProjectException 프로젝트를 찾을 수 없거나, 삭제 불가능한 경우
     */
    @Transactional
    public void deleteProject(Integer projectId, Integer memberId) {
        // 1. 프로젝트 조회 및 검증
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> ProjectException.projectNotFound(projectId));

        // 2. 프로젝트 소유권 확인
        if (!project.getMemberId().equals(memberId)) {
            throw ProjectException.projectAccessDenied();
        }

        // 3. 이미 삭제된 프로젝트 확인
        if (project.getDeletedAt() != null) {
            throw ProjectException.projectNotFound(projectId);
        }

        // 4. 프로젝트의 모든 포지션 조회
        List<ProjectPosition> projectPositions = projectPositionRepository.findByProjectIdAndDeletedAtIsNull(projectId);

        // 5. 각 포지션에 대해 PENDING 또는 OFFERED 상태의 지원서가 있는지 확인
        List<com.s401.moas.application.domain.ApplicationStatus> blockingStatuses = List.of(
                com.s401.moas.application.domain.ApplicationStatus.PENDING,
                com.s401.moas.application.domain.ApplicationStatus.OFFERED);

        for (ProjectPosition projectPosition : projectPositions) {
            boolean hasBlockingApplications = projectApplicationRepository
                    .existsByProjectPositionIdAndStatusInAndDeletedAtIsNull(
                            projectPosition.getId(), blockingStatuses);

            if (hasBlockingApplications) {
                throw ProjectException.cannotDeletePositionWithApplications();
            }
        }

        // 6. 모든 포지션 soft delete
        for (ProjectPosition projectPosition : projectPositions) {
            projectPosition.delete();
            projectPositionRepository.save(projectPosition);
        }

        // 7. 프로젝트 soft delete (등록자가 삭제하므로 null 전달)
        project.delete(null);
        projectRepository.save(project);

        log.info("프로젝트 삭제 완료 - projectId: {}, memberId: {}", projectId, memberId);
    }

    /**
     * 프로젝트 포지션 마감 처리
     * 지원자 여부와 관계없이 무조건 마감 처리됩니다.
     * 
     * @param projectId 프로젝트 ID
     * @param positionId 포지션 ID
     * @param memberId 회원 ID (프로젝트 소유권 확인용)
     * @throws ProjectException 프로젝트 또는 포지션을 찾을 수 없는 경우
     */
    @Transactional
    public void closePosition(Integer projectId, Long positionId, Integer memberId) {
        // 1. 프로젝트 조회 및 검증
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> ProjectException.projectNotFound(projectId));

        // 2. 프로젝트 소유권 확인
        if (!project.getMemberId().equals(memberId)) {
            throw ProjectException.projectAccessDenied();
        }

        // 3. 삭제된 프로젝트 확인
        if (project.getDeletedAt() != null) {
            throw ProjectException.projectNotFound(projectId);
        }

        // 4. 포지션 조회 및 검증
        ProjectPosition projectPosition = projectPositionRepository.findByIdAndDeletedAtIsNull(positionId)
                .orElseThrow(() -> ProjectException.projectPositionNotFound(positionId));

        // 5. 포지션이 해당 프로젝트에 속하는지 확인
        if (!projectPosition.getProjectId().equals(projectId)) {
            throw ProjectException.projectPositionMismatch();
        }

        // 6. 포지션 마감 처리 (지원자 여부와 관계없이 무조건 마감, 이미 마감된 경우는 그대로 유지)
        projectPosition.close();
        projectPositionRepository.save(projectPosition);

        log.info("프로젝트 포지션 마감 처리 완료 - projectId: {}, positionId: {}, memberId: {}", 
                projectId, positionId, memberId);
    }

    /**
     * java.sql.Timestamp를 java.time.OffsetDateTime으로 변환
     */
    private static OffsetDateTime toOffsetDateTime(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        return timestamp.toInstant().atZone(ZoneId.systemDefault()).toOffsetDateTime();
    }

    /**
     * Long (0 또는 1)을 Boolean으로 변환
     * 네이티브 쿼리에서 CASE WHEN ... THEN FALSE ELSE ... END는 숫자로 반환됨
     */
    private static Boolean toBoolean(Long value) {
        if (value == null) {
            return false;
        }
        return value != 0;
    }

    /**
     * 프로젝트 북마크 등록
     * 아티스트가 마음에 드는 프로젝트를 북마크합니다.
     *
     * @param projectId 프로젝트 ID
     * @param memberId  북마크하는 회원 ID (아티스트)
     * @return 저장된 북마크 엔티티
     * @throws ProjectException 프로젝트를 찾을 수 없거나, 이미 북마크한 경우
     */
    @Transactional
    public ProjectBookmark bookmarkProject(Integer projectId, Integer memberId) {
        // 1. 프로젝트 조회 및 검증
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> ProjectException.projectNotFound(projectId));

        // 2. 삭제된 프로젝트 확인
        if (project.getDeletedAt() != null) {
            throw ProjectException.projectNotFound(projectId);
        }

        // 3. 이미 북마크한 프로젝트인지 확인 (409 Conflict)
        if (projectBookmarkRepository.existsByMemberIdAndProjectId(memberId, projectId)) {
            throw ProjectException.projectBookmarkAlreadyExists();
        }

        // 4. 북마크 엔티티 생성 및 저장
        ProjectBookmark bookmark = ProjectBookmark.builder()
                .memberId(memberId)
                .projectId(projectId)
                .build();

        ProjectBookmark savedBookmark = projectBookmarkRepository.save(bookmark);

        log.info("프로젝트 북마크 등록 완료 - projectId: {}, memberId: {}", projectId, memberId);

        return savedBookmark;
    }

    /**
     * 프로젝트 북마크 해제
     * 아티스트가 북마크한 프로젝트를 해제합니다.
     *
     * @param projectId 프로젝트 ID
     * @param memberId  북마크 해제하는 회원 ID (아티스트)
     * @throws ProjectException 북마크를 찾을 수 없는 경우
     */
    @Transactional
    public void unbookmarkProject(Integer projectId, Integer memberId) {
        // 1. 북마크 엔티티 조회 (404 Not Found)
        ProjectBookmark bookmark = projectBookmarkRepository
                .findByMemberIdAndProjectId(memberId, projectId)
                .orElseThrow(() -> ProjectException.projectBookmarkNotFound());

        // 2. 북마크 삭제
        projectBookmarkRepository.delete(bookmark);

        log.info("프로젝트 북마크 해제 완료 - projectId: {}, memberId: {}", projectId, memberId);
    }

    /**
     * 유사 프로젝트 추천 조회
     *
     * @param projectId 기준 프로젝트 ID
     * @param limit 조회할 유사 프로젝트 개수
     * @return 유사 프로젝트 목록 DTO
     * @throws ProjectException 프로젝트를 찾을 수 없는 경우
     */
    @Transactional(readOnly = true)
    public SimilarProjectsDto getSimilarProjects(Integer projectId, int limit) {
        // 1. 프로젝트 조회 및 검증
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> ProjectException.projectNotFound(projectId));

        // 2. 삭제된 프로젝트 확인
        if (project.getDeletedAt() != null) {
            throw ProjectException.projectNotFound(projectId);
        }

        // 3. 유사 프로젝트 조회
        List<SimilarProjectsDto.SimilarProjectCardDto> similarCards = List.of();

        try {
            // 3-1. 포지션 정보 조회
            List<ProjectPosition> projectPositions = projectPositionRepository
                    .findByProjectIdAndDeletedAtIsNull(project.getId());

            List<String> positionNames = projectPositions.stream()
                    .map(pp -> {
                        Position position = positionRepository.findById(pp.getPositionId())
                                .orElse(null);
                        return position != null ? position.getPositionName() : null;
                    })
                    .filter(java.util.Objects::nonNull)
                    .toList();

            // 3-2. 위치 텍스트 추출
            String locationText = "online";
            if (project.getDistrictId() != null) {
                District district = districtRepository.findById(project.getDistrictId())
                        .orElse(null);
                if (district != null) {
                    locationText = district.getNameKo();
                }
            }

            // 3-3. 임베딩 텍스트 생성
            String text = EmbeddingTextBuilder.build(
                    project.getTitle(),
                    project.getSummary(),
                    positionNames,
                    locationText
            );

            // 3-4. 벡터 생성
            float[] queryVector = embeddingService.embed(text);

            // 3-5. 유사 프로젝트 검색
            List<Long> topIds = similarProjectService.searchIds(
                    queryVector,
                    limit + 10,
                    project.getId().longValue()
            );

            List<Long> limitedIds = topIds.stream().limit(limit).toList();

            if (!limitedIds.isEmpty()) {
                List<Integer> idsInt = limitedIds.stream()
                        .map(Long::intValue)
                        .toList();

                // 3-6. 프로젝트 카드 정보 조회
                List<ProjectRepository.ProjectCardRow> cards = projectRepository.findCardsByIds(idsInt);

                // 3-7. 순서 유지를 위한 Map 생성
                Map<Integer, ProjectRepository.ProjectCardRow> cardMap = cards.stream()
                        .collect(Collectors.toMap(
                                ProjectRepository.ProjectCardRow::getProjectId,
                                card -> card
                        ));

                // 3-8. 유사 프로젝트들의 포지션 정보 조회
                Map<Integer, List<ProjectListDto.PositionBriefDto>> positionsMap =
                        findPositionsByProjectIds(idsInt);

                // 3-9. 순서를 유지하며 카드 DTO 생성
                similarCards = idsInt.stream()
                        .filter(cardMap::containsKey)
                        .map(id -> {
                            ProjectRepository.ProjectCardRow card = cardMap.get(id);
                            List<SimilarProjectsDto.PositionBriefDto> positions =
                                    positionsMap.getOrDefault(id, List.of()).stream()
                                            .map(pos -> SimilarProjectsDto.PositionBriefDto.builder()
                                                    .categoryName(pos.getCategoryName())
                                                    .positionName(pos.getPositionName())
                                                    .budget(pos.getBudget())
                                                    .build())
                                            .toList();

                            return SimilarProjectsDto.SimilarProjectCardDto.builder()
                                    .projectId(card.getProjectId())
                                    .title(card.getTitle())
                                    .thumbnailUrl(card.getThumbnailUrl())
                                    .categoryName(card.getCategoryName())
                                    .locationText(card.getLocationText())
                                    .leaderNickname(card.getLeaderNickname())
                                    .leaderProfileImageUrl(card.getLeaderProfileImageUrl())
                                    .totalBudget(card.getTotalBudget())
                                    .startAt(card.getStartAt() != null ?
                                            card.getStartAt().toLocalDateTime() : null)
                                    .endAt(card.getEndAt() != null ?
                                            card.getEndAt().toLocalDateTime() : null)
                                    .positions(positions)
                                    .build();
                        })
                        .toList();
            }
        } catch (Exception e) {
            log.warn("유사 프로젝트 조회 실패 - projectId: {}", projectId, e);
        }

        return SimilarProjectsDto.builder()
                .baseProjectId(projectId)
                .projects(similarCards)
                .build();
    }

}
