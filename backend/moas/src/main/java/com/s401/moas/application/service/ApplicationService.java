package com.s401.moas.application.service;

import com.s401.moas.application.controller.response.ApplicantDetailResponse;
import com.s401.moas.application.controller.response.ApplicantListResponse;
import com.s401.moas.application.controller.response.MyApplicationListResponse;
import com.s401.moas.application.domain.ApplicationStatus;
import com.s401.moas.application.domain.ProjectApplication;
import com.s401.moas.application.exception.ApplicationErrorCode;
import com.s401.moas.application.exception.ApplicationException;
import com.s401.moas.application.repository.ProjectApplicationRepository;
import com.s401.moas.application.service.dto.ApplicantDetailBaseDto;
import com.s401.moas.application.service.dto.ApplicationDto;
import com.s401.moas.application.service.dto.ApplicationStatusUpdateDto;
import com.s401.moas.application.service.dto.MyApplicationListDto;
import com.s401.moas.contract.repository.ContractRepository;
import com.s401.moas.global.util.PageInfo;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.domain.MemberRole;
import com.s401.moas.member.exception.MemberException;
import com.s401.moas.member.repository.MemberRepository;
import com.s401.moas.notification.service.NotificationService;
import com.s401.moas.portfolio.exception.PortfolioException;
import com.s401.moas.portfolio.repository.PortfolioRepository;
import com.s401.moas.portfolio.service.PortfolioService;
import com.s401.moas.portfolio.service.dto.PortfolioDetailDto;
import com.s401.moas.project.domain.Project;
import com.s401.moas.project.domain.ProjectPosition;
import com.s401.moas.project.exception.ProjectErrorCode;
import com.s401.moas.project.exception.ProjectException;
import com.s401.moas.project.repository.PositionRepository;
import com.s401.moas.project.repository.ProjectPositionRepository;
import com.s401.moas.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApplicationService {

    private final ProjectApplicationRepository projectApplicationRepository;
    private final ContractRepository contractRepository;
    private final ProjectPositionRepository projectPositionRepository;
    private final ProjectRepository projectRepository;
    private final MemberRepository memberRepository;
    private final PortfolioRepository portfolioRepository;
    private final PortfolioService portfolioService;
    private final PositionRepository positionRepository;
    private final NotificationService notificationService; // NotificationService 주입

    /**
     * 프로젝트에 지원합니다.
     *
     * @param projectPositionId 지원할 프로젝트 직무 ID
     * @param memberId          지원하는 회원 ID
     * @param portfolioId       제출할 포트폴리오 ID
     * @param message           지원 메시지
     * @return 생성된 지원 정보 DTO
     */
    @Transactional
    public ApplicationDto applyToProject(Long projectPositionId, Integer memberId, Long portfolioId, String message) {
        // 1. 지원자 및 포트폴리오 유효성 검증
        Member applicant = memberRepository.findByIdAndDeletedAtIsNull(memberId)
                .orElseThrow(MemberException::memberNotFound);
        if (applicant.getRole() != MemberRole.ARTIST) {
            throw ApplicationException.leaderCannotApply();
        }
        if (!portfolioRepository.existsByIdAndMemberIdAndDeletedAtIsNull(portfolioId, memberId)) {
            throw PortfolioException.portfolioAccessDenied();
        }
        ProjectPosition projectPosition = projectPositionRepository.findById(projectPositionId)
                .orElseThrow(() -> new ProjectException(ProjectErrorCode.PROJECT_POSITION_NOT_FOUND));
        if (projectPosition.getStatus() != ProjectPosition.PositionStatus.RECRUITING) {
            throw ApplicationException.applicationClosed();
        }
        Project project = projectRepository.findById(projectPosition.getProjectId())
                .orElseThrow(() -> ProjectException.projectNotFound(projectPosition.getProjectId()));
        if (project.getMemberId().equals(memberId)) {
            throw new ApplicationException(ApplicationErrorCode.LEADER_CANNOT_APPLY);
        }
        validateDuplicateApplication(projectPositionId, memberId);

        // 5. 지원서 생성 및 저장
        ProjectApplication newApplication = ProjectApplication.builder()
                .projectPositionId(projectPositionId)
                .memberId(memberId)
                .portfolioId(portfolioId)
                .message(message)
                .build();
        ProjectApplication savedApplication = projectApplicationRepository.save(newApplication);

        // [알림] 리더에게 새로운 지원 알림
        try {
            notificationService.createNotification(
                    project.getMemberId(),
                    "NEW_APPLICATION_RECEIVED",
                    Long.valueOf(project.getId())
            );
        } catch (Exception e) {
            log.error("신규 지원 알림 전송 실패: applicationId={}, leaderMemberId={}",
                    savedApplication.getId(), project.getMemberId(), e);
        }

        // 6. DTO로 변환하여 반환
        return ApplicationDto.from(savedApplication);
    }

    /**
     * 프로젝트 지원을 취소합니다. (Soft Delete)
     *
     * @param applicationId 취소할 지원서 ID
     * @param memberId      요청한 회원 ID (권한 검증용)
     */
    @Transactional
    public void cancelApplication(Long applicationId, Integer memberId) {
        // 1. 지원서 조회
        ProjectApplication application = projectApplicationRepository.findByIdAndDeletedAtIsNull(applicationId)
                .orElseThrow(ApplicationException::applicationNotFound);

        // 2. 지원서 소유권 확인
        if (!application.getMemberId().equals(memberId)) {
            throw ApplicationException.applicationAccessDenied();
        }

        // 3. 엔티티의 비즈니스 메서드 호출
        application.cancel();

//        // [알림] 리더에게 지원 취소 알림
//        try {
//            // 알림을 보낼 리더의 ID를 조회
//            ProjectPosition projectPosition = projectPositionRepository.findById(application.getProjectPositionId())
//                    .orElseThrow(() -> ProjectException.projectPositionNotFound(application.getProjectPositionId()));
//            Project project = projectRepository.findById(projectPosition.getProjectId())
//                    .orElseThrow(() -> ProjectException.projectNotFound(projectPosition.getProjectId()));
//
//            notificationService.createNotification(
//                    project.getMemberId(),
//                    "APPLICATION_CANCELED_BY_ARTIST",
//                    application.getId()
//            );
//        } catch (Exception e) {
//            log.error("지원 취소 알림 전송 실패: applicationId={}", applicationId, e);
//        }
    }

    private void validateDuplicateApplication(Long projectPositionId, Integer memberId) {
        if (projectApplicationRepository.existsByProjectPositionIdAndMemberIdAndDeletedAtIsNull(projectPositionId, memberId)) {
            throw ApplicationException.alreadyApplied();
        }
    }

    /**
     * 프로젝트 리더가 지원서를 거절합니다.
     *
     * @param applicationId 거절할 지원서 ID
     * @param leaderMemberId 요청한 회원 ID (프로젝트 리더)
     * @return 상태가 변경된 지원 정보 DTO
     */
    @Transactional
    public ApplicationStatusUpdateDto rejectApplication(Long applicationId, Integer leaderMemberId) {
        // 1. 지원서 조회
        ProjectApplication application = projectApplicationRepository.findByIdAndDeletedAtIsNull(applicationId)
                .orElseThrow(ApplicationException::applicationNotFound);

        // 2. 권한 검증: 요청자가 해당 프로젝트의 리더인지 확인
        ProjectPosition projectPosition = projectPositionRepository.findById(application.getProjectPositionId())
                .orElseThrow(() -> ProjectException.projectPositionNotFound(application.getProjectPositionId()));
        Project project = projectRepository.findById(projectPosition.getProjectId())
                .orElseThrow(() -> ProjectException.projectNotFound(projectPosition.getProjectId()));
        if (!project.getMemberId().equals(leaderMemberId)) {
            throw ApplicationException.notProjectLeader();
        }

        // 3. 엔티티의 비즈니스 메서드 호출
        application.reject();

        // [알림] 아티스트에게 지원 거절 알림
        try {
            notificationService.createNotification(
                    application.getMemberId(),
                    "APPLICATION_REJECTED",
                    application.getId()
            );
        } catch (Exception e) {
            log.error("지원 거절 알림 전송 실패: applicationId={}, artistMemberId={}",
                    application.getId(), application.getMemberId(), e);
        }

        return ApplicationStatusUpdateDto.from(application);
    }

    /**
     * 지원자 목록 조회
     */
    @Transactional(readOnly = true)
    public ApplicantListResponse getApplicantList(Integer projectId, Integer leaderMemberId) {
        // 1. 리더 권한 검증
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> ProjectException.projectNotFound(projectId));

        if (!project.getMemberId().equals(leaderMemberId)) {
            throw ApplicationException.notProjectLeader();
        }

        List<ApplicantListResponse.ProjectPositionInfo> positions =
                projectPositionRepository.findProjectPositionsForDto(projectId);

        // 2. 커스텀 데이터 조회
        List<ApplicantListResponse.ApplicationSummary> applications =
                projectApplicationRepository.findApplicationSummariesByProjectId(projectId);

        // 3. 조회된 DTO 리스트를 최종 응답 객체에 담아 반환
        return ApplicantListResponse.builder().positions(positions).applications(applications).build();
    }

    /**
     * 지원서 상세 조회
     */
    @Transactional(readOnly = true)
    public ApplicantDetailResponse getApplicantDetail(Long applicationId, Integer memberId) {
        // 1. JPQL을 사용하여 지원서의 기본 정보를 한 번에 조회
        ApplicantDetailBaseDto baseInfo = projectApplicationRepository.findApplicationDetailBaseById(applicationId)
                .orElseThrow(ApplicationException::applicationNotFound);

        // 2. 본인 or 리더 검증
        ProjectPosition projectPosition = projectPositionRepository.findById(baseInfo.getProjectPositionId())
                .orElseThrow(()-> ProjectException.projectPositionNotFound(baseInfo.getProjectPositionId()));
        Project project = projectRepository.findById(projectPosition.getProjectId())
                .orElseThrow(()-> ProjectException.projectNotFound(projectPosition.getProjectId()));

        if(!baseInfo.getUserId().equals(memberId) && !project.getMemberId().equals(memberId) ){
            throw ApplicationException.notOwnerApplication();
        }

        ApplicantListResponse.ApplicantInfo applicantInfo = ApplicantListResponse.ApplicantInfo.builder()
                .userId(baseInfo.getUserId())
                .nickname(baseInfo.getNickname())
                .profileImageUrl(baseInfo.getProfileImageUrl())
                .averageRating(baseInfo.getAverageRating() != null ? baseInfo.getAverageRating() : 0.0)
                .reviewCount(baseInfo.getReviewCount() != null ? baseInfo.getReviewCount().intValue() : 0)
                .build();

        ApplicantListResponse.PositionInfo positionInfo = ApplicantListResponse.PositionInfo.builder()
                .projectPositionId(baseInfo.getProjectPositionId())
                .positionName(baseInfo.getPositionName())
                .build();

        // 3. PortfolioService를 호출하여 포트폴리오 상세 정보만 별도로 조회
        PortfolioDetailDto portfolioDetailDto = portfolioService.getPortfolioDetail(baseInfo.getPortfolioId());
        ApplicantDetailResponse.PortfolioDetail portfolioDetail =
                ApplicantDetailResponse.PortfolioDetail.from(portfolioDetailDto);

        // 4. 최종 DTO 조합 및 반환
        return ApplicantDetailResponse.builder()
                .applicationId(baseInfo.getApplicationId())
                .applicationStatus(baseInfo.getApplicationStatus().name())
                .createdAt(baseInfo.getCreatedAt())
                .message(baseInfo.getMessage())
                .contractId(baseInfo.getContractId())
                .contractStatus(baseInfo.getContractStatus() != null ? baseInfo.getContractStatus().name() : null)
                .applicant(applicantInfo)
                .position(positionInfo)
                .portfolio(portfolioDetail)
                .build();
    }

    public MyApplicationListResponse getApplicationsForArtist(Integer memberId, ApplicationStatus status, Pageable pageable) {
        // 1. 단일 JPQL 쿼리로 서비스 계층의 DTO 페이지를 직접 조회
        Page<MyApplicationListDto.MyApplicationDto> applicationPage = projectApplicationRepository.findMyApplicationsProjectionByMemberId(
                memberId, status, pageable
        );

        List<MyApplicationListDto.MyApplicationDto> myApplicationDtos = applicationPage.getContent();

        // 2. 서비스 DTO (MyApplicationListDto) 생성
        MyApplicationListDto serviceDto = MyApplicationListDto.builder()
                .applications(myApplicationDtos)
                .pageInfo(PageInfo.from(applicationPage))
                .build();

        return MyApplicationListResponse.from(serviceDto);
    }
}