package com.s401.moas.member.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import com.s401.moas.global.util.BlockExplorerUtil;
import com.s401.moas.global.util.PageInfo;
import com.s401.moas.member.service.dto.*;
import com.s401.moas.payment.domain.PaymentType;
import com.s401.moas.payment.repository.PaymentRepository;
import com.s401.moas.review.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.s401.moas.application.domain.ApplicationStatus;
import com.s401.moas.application.domain.ProjectApplication;
import com.s401.moas.application.repository.ProjectApplicationRepository;
import com.s401.moas.auth.service.dto.Web3AuthMemberDto;
import com.s401.moas.contract.domain.Contract;
import com.s401.moas.contract.domain.ContractStatus;
import com.s401.moas.contract.repository.ContractRepository;
import com.s401.moas.global.exception.InvalidFileFormatException;
import com.s401.moas.global.service.S3Service;
import com.s401.moas.member.controller.request.UpdateMemberProfileRequest;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.domain.MemberRole;
import com.s401.moas.member.domain.OAuthProvider;
import com.s401.moas.member.exception.MemberException;
import com.s401.moas.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final ContractRepository contractRepository;
    private final ProjectApplicationRepository projectApplicationRepository;
    private final ReviewRepository reviewRepository;
    private final S3Service s3Service;
    private final PaymentRepository paymentRepository;
    private final BlockExplorerUtil blockExplorerUtil;

    // 진행중인 계약 상태 목록 (탈퇴 제한 조건)
    // PENDING, DECLINED, WITHDRAWN, COMPLETED, CANCELED를 제외한 상태에서 탈퇴 불가
    private static final List<ContractStatus> ONGOING_CONTRACT_STATUSES = Arrays.asList(
            ContractStatus.ARTIST_SIGNED,
            ContractStatus.PAYMENT_PENDING,
            ContractStatus.PAYMENT_COMPLETED,
            ContractStatus.CANCELLATION_REQUESTED);

    @Transactional
    public MemberUpsertResultDto upsertWeb3AuthMember(Web3AuthMemberDto info) {
        OAuthProvider provider = toProviderEnum(info.getProvider());
        String providerId = info.getProviderId();

        return memberRepository.findByProviderAndProviderId(provider, providerId)
                .map(member -> MemberUpsertResultDto.builder()
                        .memberId(member.getId())
                        .isNewUser(false)
                        .build())
                .orElseGet(() -> {
                    Member created = Member.builder()
                            .nickname(generateDefaultNickname())
                            .provider(provider)
                            .providerId(providerId)
                            .walletAddress(info.getWalletAddress())
                            .role(MemberRole.PENDING)
                            .build();
                    Member saved = memberRepository.save(created);
                    return MemberUpsertResultDto.builder()
                            .memberId(saved.getId())
                            .isNewUser(true)
                            .build();
                });
    }

    private OAuthProvider toProviderEnum(String provider) {
        if (provider == null)
            return OAuthProvider.GOOGLE; // 기본값 임시
        String p = provider.trim().toUpperCase();
        if (p.contains("KAKAO"))
            return OAuthProvider.KAKAO;
        return OAuthProvider.GOOGLE;
    }

    private String generateDefaultNickname() {
        return "member-" + System.currentTimeMillis();
    }

    /**
     * 회원 공개 프로필 조회
     * DB 조회 후 검증: 미존재/비공개(PENDING)/탈퇴/형식 은닉 처리
     *
     * @param memberId 회원 ID (양수, 컨트롤러에서 이미 검증됨)
     * @return 공개 프로필 정보
     * @throws MemberException 회원이 없거나 PENDING 상태인 경우 (404)
     */
    @Transactional(readOnly = true)
    public MemberProfileDto getPublicProfile(Integer memberId) {
        // 1. Member 엔티티 조회 및 검증 (존재 여부, 상태, 탈퇴 여부)
        Member member = memberRepository.findById(memberId)
                .filter(m -> m.getRole() != MemberRole.PENDING && m.getDeletedAt() == null)
                .orElseThrow(() -> {
                    log.debug("조회할 수 없는 회원 프로필 요청: memberId={}", memberId);
                    return MemberException.memberNotFound();
                });

        // 2. 리뷰 통계 별도 조회
        MemberProfileDto.ReviewStatsDto stats = reviewRepository.findReviewStatsByMemberId(memberId)
                .orElse(new MemberProfileDto.ReviewStatsDto(0.0, 0)); // 리뷰가 없으면 기본값 DTO 사용

        // 3. 두 정보를 조합하여 최종 DTO 반환
        return new MemberProfileDto(member, stats);
    }

    /**
     * 닉네임 중복 체크
     * 닉네임 형식 검증 및 중복 여부 확인
     *
     * @param nickname 조회할 닉네임
     * @return 닉네임 사용 가능 여부 (true: 사용 가능, false: 중복됨) 및 검증된 닉네임
     * @throws MemberException 닉네임 형식 오류 시 (400)
     */
    @Transactional(readOnly = true)
    public NicknameCheckResultDto checkNicknameExists(String nickname) {
        // 닉네임 형식 검증 (DB 조회 전 검증)
        if (nickname == null || nickname.isBlank()) {
            log.warn("빈 닉네임으로 중복 체크 시도");
            throw MemberException.invalidMemberIdFormat();
        }

        String trimmedNickname = nickname.trim();
        if (trimmedNickname.length() < 2 || trimmedNickname.length() > 50) {
            log.warn("닉네임 길이 오류: nickname={}, length={}", trimmedNickname, trimmedNickname.length());
            throw MemberException.invalidMemberIdFormat();
        }

        // 닉네임 중복 체크
        boolean exists = memberRepository.existsByNickname(trimmedNickname);
        boolean available = !exists; // exists의 반대값: true면 사용 가능

        log.debug("닉네임 중복 체크: nickname={}, available={}", trimmedNickname, available);

        return NicknameCheckResultDto.builder()
                .nickname(trimmedNickname)
                .available(available)
                .build();
    }

    /**
     * 회원 탈퇴 (Soft Delete)
     * deletedAt 필드를 현재 시각으로 설정합니다.
     * 탈퇴 제한 조건:
     * - 진행중인 계약이 있는 경우 (리더 또는 아티스트로)
     * 진행중 상태: PENDING, WAITING_FOR_PAYMENT, PAID, CANCELLATION_REQUESTED
     * - 채용 제안을 받은 지원서가 있는 경우 (OFFERED 상태)
     *
     * @param memberId 탈퇴할 회원 ID
     * @return 탈퇴 시각
     * @throws MemberException 회원이 없거나 이미 탈퇴한 경우 (404)
     * @throws MemberException 탈퇴 제한 상태인 경우 (409)
     */
    @Transactional
    public LocalDateTime deleteMember(Integer memberId) {
        // 1. 회원 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> {
                    log.debug("존재하지 않는 회원 탈퇴 시도: memberId={}", memberId);
                    return MemberException.memberNotFound();
                });

        // 2. 이미 탈퇴한 회원인지 확인
        if (member.getDeletedAt() != null) {
            log.debug("이미 탈퇴한 회원 탈퇴 시도: memberId={}", memberId);
            throw MemberException.memberNotFound();
        }

        // 3. 진행중인 계약 확인 (리더로 참여)
        boolean hasOngoingContractAsLeader = contractRepository.existsByLeaderMemberIdAndStatusIn(
                memberId, ONGOING_CONTRACT_STATUSES);
        if (hasOngoingContractAsLeader) {
            log.warn("진행중인 계약(리더)이 있어 탈퇴 불가: memberId={}", memberId);
            throw MemberException.memberDeleteConflict();
        }

        // 4. 진행중인 계약 확인 (아티스트로 참여)
        boolean hasOngoingContractAsArtist = contractRepository.existsByArtistMemberIdAndStatusIn(
                memberId, ONGOING_CONTRACT_STATUSES);
        if (hasOngoingContractAsArtist) {
            log.warn("진행중인 계약(아티스트)이 있어 탈퇴 불가: memberId={}", memberId);
            throw MemberException.memberDeleteConflict();
        }

        // 5. 채용 제안을 받은 지원서 확인 (OFFERED 상태)
        boolean hasOfferedApplication = projectApplicationRepository.existsByMemberIdAndStatusAndDeletedAtIsNull(
                memberId, ApplicationStatus.OFFERED);
        if (hasOfferedApplication) {
            log.warn("채용 제안을 받은 지원서가 있어 탈퇴 불가: memberId={}", memberId);
            throw MemberException.memberDeleteConflict();
        }

        // 6. 진행 중인 계약 중 PENDING, DECLINED 상태를 WITHDRAWN으로 변경
        // PENDING, DECLINED 상태의 계약만 WITHDRAWN으로 변경 가능
        List<ContractStatus> withdrawableStatuses = Arrays.asList(
                ContractStatus.PENDING,
                ContractStatus.DECLINED);

        // 리더로 참여한 계약 조회
        List<Contract> leaderContracts = contractRepository.findByLeaderMemberIdAndStatusIn(memberId,
                withdrawableStatuses);
        for (Contract contract : leaderContracts) {
            ContractStatus previousStatus = contract.getStatus();
            contract.withdraw();
            log.debug("탈퇴 시 계약 상태를 WITHDRAWN으로 변경 (리더): contractId={}, memberId={}, fromStatus={}",
                    contract.getId(), memberId, previousStatus);
        }

        // 아티스트로 참여한 계약 조회
        List<Contract> artistContracts = contractRepository.findByArtistMemberIdAndStatusIn(memberId,
                withdrawableStatuses);
        for (Contract contract : artistContracts) {
            ContractStatus previousStatus = contract.getStatus();
            contract.withdraw();
            log.debug("탈퇴 시 계약 상태를 WITHDRAWN으로 변경 (아티스트): contractId={}, memberId={}, fromStatus={}",
                    contract.getId(), memberId, previousStatus);
        }

        // 7. 지원서 삭제 (Soft Delete)
        // PENDING 상태인 지원서만 취소 가능
        List<ProjectApplication> applications = projectApplicationRepository.findByMemberIdAndDeletedAtIsNull(memberId);
        for (ProjectApplication application : applications) {
            if (application.getStatus() == ApplicationStatus.PENDING) {
                application.cancel();
                log.debug("탈퇴 시 지원서 취소: applicationId={}, memberId={}", application.getId(), memberId);
            }
        }

        // 8. Soft Delete: deletedAt 업데이트
        member.delete();
        memberRepository.save(member);

        log.info("회원 탈퇴 완료: memberId={}, deletedAt={}", memberId, member.getDeletedAt());

        return member.getDeletedAt();
    }

    @Transactional(readOnly = true)
    public ArtistMyProfileDto getArtistMyProfile(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(MemberException::memberNotFound);

        if (member.getDeletedAt() != null) {
            throw MemberException.memberNotFound();
        }

        Integer appliedProjectCount = projectApplicationRepository.countByMemberIdAndStatusAndDeletedAtIsNull(memberId,
                ApplicationStatus.PENDING);
        Integer inProgressProjectCount = contractRepository.countByArtistMemberIdAndStatusIn(memberId, Arrays
                .asList(ContractStatus.PENDING, ContractStatus.PAYMENT_PENDING, ContractStatus.PAYMENT_COMPLETED));
        Integer completedProjectCount = contractRepository.countByArtistMemberIdAndStatusIn(memberId,
                Arrays.asList(ContractStatus.COMPLETED, ContractStatus.CANCELED));

        return ArtistMyProfileDto.builder()
                .profileImageUrl(member.getProfileImageUrl())
                .chainExplorerUrl(blockExplorerUtil.buildWalletNftTransfersUrl(member.getWalletAddress()))
                .nickname(member.getNickname())
                .biography(member.getBiography())
                .appliedProjectCount(appliedProjectCount)
                .inProgressProjectCount(inProgressProjectCount)
                .completedProjectCount(completedProjectCount)
                .inProgressProjectThumbnails(List.of())
                .interestedProjectThumbnails(List.of())
                .build();
    }

    @Transactional(readOnly = true)
    public LeaderMyProfileDto getLeaderMyProfile(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(MemberException::memberNotFound);

        if (member.getDeletedAt() != null) {
            throw MemberException.memberNotFound();
        }

        Integer inProgressProjectCount = contractRepository.countByLeaderMemberIdAndStatusIn(memberId, Arrays
                .asList(ContractStatus.PENDING, ContractStatus.PAYMENT_PENDING, ContractStatus.PAYMENT_COMPLETED));
        Integer completedProjectCount = contractRepository.countByLeaderMemberIdAndStatusIn(memberId,
                Arrays.asList(ContractStatus.COMPLETED, ContractStatus.CANCELED));

        return LeaderMyProfileDto.builder()
                .profileImageUrl(member.getProfileImageUrl())
                .chainExploreUrl(blockExplorerUtil.buildWalletNftTransfersUrl(member.getWalletAddress()))
                .nickname(member.getNickname())
                .biography(member.getBiography())
                .appliedProjectCount(0)
                .inProgressProjectCount(inProgressProjectCount)
                .completedProjectCount(completedProjectCount)
                .inProgressProjectThumbnails(List.of())
                .interestedProjectThumbnails(List.of())
                .build();
    }

    /**
     * 프로필 수정
     * 현재 인증된 사용자의 프로필 정보를 업데이트합니다.
     * PATCH 요청에 맞게 null이 아닌 필드만 업데이트합니다.
     *
     * @param memberId 회원 ID
     * @param request  프로필 수정 요청 DTO
     * @return 업데이트된 회원 정보
     * @throws MemberException 회원이 없거나 이미 탈퇴한 경우 (404)
     * @throws MemberException 닉네임이 중복된 경우 (400)
     */
    @Transactional
    public Member updateProfile(Integer memberId, UpdateMemberProfileRequest request) {
        // 1. 회원 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> {
                    log.debug("존재하지 않는 회원 프로필 수정 시도: memberId={}", memberId);
                    return MemberException.memberNotFound();
                });

        // 2. 이미 탈퇴한 회원인지 확인
        if (member.getDeletedAt() != null) {
            log.debug("이미 탈퇴한 회원 프로필 수정 시도: memberId={}", memberId);
            throw MemberException.memberNotFound();
        }

        // 3. 닉네임 검증 (길이, 중복 체크)
        if (request.getNickname() != null && !request.getNickname().trim().isEmpty()) {
            String trimmedNickname = request.getNickname().trim();

            // 3-1. 닉네임 길이 검증 (2-50자 범위)
            if (trimmedNickname.length() < 2 || trimmedNickname.length() > 50) {
                log.warn("닉네임 길이 오류: memberId={}, nickname={}, length={}", memberId, trimmedNickname,
                        trimmedNickname.length());
                throw MemberException.nicknameTooLong();
            }

            // 3-2. 닉네임 중복 체크 (현재 닉네임과 다른 경우에만)
            if (!trimmedNickname.equals(member.getNickname())) {
                boolean exists = memberRepository.existsByNickname(trimmedNickname);
                if (exists) {
                    log.warn("닉네임 중복으로 프로필 수정 실패: memberId={}, nickname={}", memberId, trimmedNickname);
                    throw MemberException.nicknameDuplicate();
                }
            }
        }

        // 4. 휴대폰 번호 형식 검증
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            String trimmedPhoneNumber = request.getPhoneNumber().trim();
            if (!isValidPhoneNumber(trimmedPhoneNumber)) {
                log.warn("휴대폰 번호 형식 오류: memberId={}, phoneNumber={}", memberId, trimmedPhoneNumber);
                throw MemberException.invalidPhoneNumberFormat();
            }
        }

        // 5. 프로필 이미지 업로드 (있는 경우)
        String uploadedProfileImageUrl = uploadProfileImageIfPresent(request.getProfileImage(), memberId);

        // 6. 프로필 업데이트
        member.updateProfile(
                request.getNickname(),
                request.getBiography(),
                request.getPhoneNumber(),
                uploadedProfileImageUrl);

        memberRepository.save(member);

        log.info("프로필 수정 완료: memberId={}, nickname={}, biography={}, phoneNumber={}, profileImageUrl={}",
                memberId, member.getNickname(), member.getBiography(), member.getPhoneNumber(),
                member.getProfileImageUrl());

        return member;
    }

    private String uploadProfileImageIfPresent(MultipartFile profileImage, Integer memberId) {
        if (profileImage == null || profileImage.isEmpty()) {
            return null;
        }

        String contentType = profileImage.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            log.warn("지원하지 않는 프로필 이미지 형식: memberId={}, filename={}, contentType={}",
                    memberId, profileImage.getOriginalFilename(), contentType);
            throw new InvalidFileFormatException(contentType);
        }

        try {
            String uploadedUrl = s3Service.upload(profileImage, "member/profile-images");
            log.info("프로필 이미지 업로드 성공: memberId={}, filename={}, url={}",
                    memberId, profileImage.getOriginalFilename(), uploadedUrl);
            return uploadedUrl;
        } catch (IOException e) {
            log.error("프로필 이미지 업로드 실패: memberId={}, filename={}", memberId, profileImage.getOriginalFilename(), e);
            throw new IllegalStateException("프로필 이미지 업로드에 실패했습니다.");
        }
    }

    /**
     * 회원 역할 변경
     * PENDING 상태의 회원만 LEADER 또는 ARTIST로 변경할 수 있습니다.
     *
     * @param memberId 회원 ID
     * @param role     변경할 역할 (LEADER 또는 ARTIST)
     * @return 업데이트된 회원 정보
     * @throws MemberException 회원이 없거나 이미 탈퇴한 경우 (404)
     * @throws MemberException PENDING 상태가 아닌 경우 (409)
     */
    @Transactional
    public Member updateRole(Integer memberId, MemberRole role) {
        // 1. 회원 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> {
                    log.debug("존재하지 않는 회원 역할 변경 시도: memberId={}", memberId);
                    return MemberException.memberNotFound();
                });

        // 2. 이미 탈퇴한 회원인지 확인
        if (member.getDeletedAt() != null) {
            log.debug("이미 탈퇴한 회원 역할 변경 시도: memberId={}", memberId);
            throw MemberException.memberNotFound();
        }

        // 3. PENDING 상태가 아닌 경우 에러
        if (member.getRole() != MemberRole.PENDING) {
            log.warn("PENDING 상태가 아닌 회원 역할 변경 시도: memberId={}, currentRole={}", memberId, member.getRole());
            throw MemberException.cannotUpdateRoleNotPending();
        }

        // 4. 역할 변경
        try {
            member.updateRole(role);
            memberRepository.save(member);
            log.info("회원 역할 변경 완료: memberId={}, role={}", memberId, role);
        } catch (IllegalStateException | IllegalArgumentException e) {
            log.warn("회원 역할 변경 실패: memberId={}, role={}, error={}", memberId, role, e.getMessage());
            throw MemberException.cannotUpdateRoleNotPending();
        }

        return member;
    }

    /**
     * 휴대폰 번호 형식 검증
     * 하이픈 포함 형식만 허용합니다:
     * - 010-1234-5678
     * - 011-123-4567 등
     *
     * @param phoneNumber 검증할 휴대폰 번호
     * @return 유효한 형식이면 true, 아니면 false
     */
    private boolean isValidPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }

        // 하이픈이 포함되어야 함
        if (!phoneNumber.contains("-")) {
            return false;
        }

        // 한국 휴대폰 번호 형식: 01[0-9]-XXXX-XXXX 또는 01[0-9]-XXX-XXXX
        // 예: 010-1234-5678, 011-123-4567
        String phonePattern = "^01[0-9]-[0-9]{3,4}-[0-9]{4}$";

        return Pattern.matches(phonePattern, phoneNumber);
    }

    @Transactional(readOnly = true)
    public TransactionHistoryDto getTransactionHistory(Integer memberId, Pageable pageable) {
        // 1. 사용자 정보 및 역할 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(MemberException::memberNotFound);

        // 2. 역할에 맞는 Summary 계산
        TransactionHistoryDto.SummaryDto summaryDto = buildSummaryDto(memberId, member.getRole());

        // 3. 거래 내역 목록 조회
        Page<TransactionHistoryDto.TransactionItemDto> transactionPage =
                paymentRepository.findTransactionItemsByMemberId(memberId, pageable);

        // 4. 최종 DTO 조립
        return TransactionHistoryDto.builder()
                .summary(summaryDto)
                .transactions(transactionPage.getContent())
                .pagination(PageInfo.from(transactionPage))
                .build();
    }

    private TransactionHistoryDto.SummaryDto buildSummaryDto(Integer memberId, MemberRole role) {
        TransactionHistoryDto.SummaryDto.SummaryDtoBuilder summaryBuilder = TransactionHistoryDto.SummaryDto.builder();

        if (role == MemberRole.LEADER) {
            Object[] summaryResultWrapper = paymentRepository.findLeaderSummaryAmounts(memberId);

            Object[] summaryAmounts = (Object[]) summaryResultWrapper[0];

            long totalAmount = ((Number) summaryAmounts[0]).longValue();
            long totalDepositAmount = ((Number) summaryAmounts[1]).longValue();

            summaryBuilder.leaderSummary(TransactionHistoryDto.LeaderSummaryDto.builder()
                    .totalAmount(totalAmount)
                    .totalDepositAmount(totalDepositAmount)
                    .build());
        } else if (role == MemberRole.ARTIST) {
            Long totalSettlement = paymentRepository.findArtistTotalSettlementAmount(memberId);
            summaryBuilder.artistSummary(TransactionHistoryDto.ArtistSummaryDto.builder()
                    .totalAmount(totalSettlement != null ? totalSettlement : 0L)
                    .build());
        }

        return summaryBuilder.build();
    }

}
