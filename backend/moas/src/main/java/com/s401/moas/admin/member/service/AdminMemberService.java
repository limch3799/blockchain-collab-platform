package com.s401.moas.admin.member.service;

import com.s401.moas.admin.inquiry.domain.InquiryStatus;
import com.s401.moas.admin.inquiry.repository.InquiryRepository;
import com.s401.moas.admin.inquiry.repository.projection.MemberInquiryCountProjection;
import com.s401.moas.admin.member.controller.request.UpdatePenaltyRequest;
import com.s401.moas.admin.member.exception.AdminMemberException;
import com.s401.moas.admin.member.repository.projection.MemberRoleCountProjection;
import com.s401.moas.admin.member.repository.projection.MemberWithStatsProjection;
import com.s401.moas.admin.member.service.dto.*;
import com.s401.moas.contract.repository.ContractRepository;
import com.s401.moas.global.security.SecurityUtil;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.domain.MemberRole;
import com.s401.moas.member.domain.PenaltyRecord;
import com.s401.moas.member.domain.TotalPenalty;
import com.s401.moas.member.repository.MemberRepository;
import com.s401.moas.member.repository.PenaltyRecordRepository;
import com.s401.moas.member.repository.TotalPenaltyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminMemberService {

    private final MemberRepository memberRepository;
    private final InquiryRepository inquiryRepository;
    private final PenaltyRecordRepository penaltyRecordRepository;
    private final TotalPenaltyRepository totalPenaltyRepository;
    private final ContractRepository contractRepository;

    public MemberListDto getMembers(String role, String keyword, String order, Integer page, Integer size) {
        // 파라미터 검증
        validateSearchParameters(role, order, page, size);

        // Pageable 생성 (createdAt 기준으로만 정렬)
        Pageable pageable = createPageable(page, size, order);

        // 회원 조회
        MemberRole memberRole = (role != null && !role.isEmpty()) ? MemberRole.valueOf(role) : null;
        Page<MemberWithStatsProjection> projectionPage = memberRepository.findMembersWithStats(memberRole, keyword, pageable);

        // 회원 ID 목록 추출
        List<Integer> memberIds = projectionPage.getContent().stream()
                .map(MemberWithStatsProjection::getId)
                .collect(Collectors.toList());

        // PENDING 문의 개수 배치 조회
        Map<Integer, Long> pendingInquiriesMap = getPendingInquiriesMap(memberIds);

        // DTO 변환
        List<MemberListDto.MemberItemDto> content = projectionPage.getContent().stream()
                .map(projection -> toMemberItemDto(projection, pendingInquiriesMap))
                .collect(Collectors.toList());

        return MemberListDto.builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(projectionPage.getTotalElements())
                .totalPages(projectionPage.getTotalPages())
                .build();
    }

    private void validateSearchParameters(String role, String order, Integer page, Integer size) {
        // role 검증
        if (role != null && !role.isEmpty()) {
            try {
                MemberRole.valueOf(role);
            } catch (IllegalArgumentException e) {
                throw AdminMemberException.invalidParameter("role", "LEADER 또는 ARTIST만 가능합니다.");
            }
        }

        // order 검증
        if (!List.of("asc", "desc").contains(order.toLowerCase())) {
            throw AdminMemberException.invalidParameter("order", "asc 또는 desc만 가능합니다.");
        }

        // page 검증
        if (page < 1) {
            throw AdminMemberException.invalidParameter("page", "1 이상이어야 합니다.");
        }

        // size 검증
        if (size < 1 || size > 100) {
            throw AdminMemberException.invalidParameter("size", "1~100 사이의 값이어야 합니다.");
        }
    }

    private Pageable createPageable(Integer page, Integer size, String order) {
        Sort.Direction direction = order.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sortBy = Sort.by(direction, "createdAt");
        return PageRequest.of(page - 1, size, sortBy);
    }

    /**
     * 여러 회원의 PENDING 문의 개수를 배치로 조회
     */
    private Map<Integer, Long> getPendingInquiriesMap(List<Integer> memberIds) {
        if (memberIds.isEmpty()) {
            return new HashMap<>();
        }

        List<MemberInquiryCountProjection> results = inquiryRepository.countPendingInquiriesByMemberIds(
                memberIds,
                InquiryStatus.PENDING
        );

        return results.stream()
                .collect(Collectors.toMap(
                        MemberInquiryCountProjection::getMemberId,
                        MemberInquiryCountProjection::getCount
                ));
    }

    /**
     * Projection을 MemberItemDto로 변환
     */
    private MemberListDto.MemberItemDto toMemberItemDto(
            MemberWithStatsProjection projection,
            Map<Integer, Long> pendingInquiriesMap) {

        // PENDING 문의 개수 조회
        Long pendingInquiries = pendingInquiriesMap.getOrDefault(projection.getId(), 0L);

        // 평균 평점 소수점 첫째자리 반올림
        Double averageRating = projection.getAverageRating();
        averageRating = averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0;

        return MemberListDto.MemberItemDto.builder()
                .id(projection.getId())
                .nickname(projection.getNickname())
                .email(projection.getEmail())
                .role(projection.getRole())
                .profileImageUrl(projection.getProfileImageUrl())
                .createdAt(projection.getCreatedAt())
                .deletedAt(projection.getDeletedAt())
                .stats(MemberListDto.MemberStatsDto.builder()
                        .penaltyScore(projection.getPenaltyScore())
                        .averageRating(averageRating)
                        .reviewCount(projection.getReviewCount().intValue())
                        .pendingInquiries(pendingInquiries.intValue())
                        .build())
                .build();
    }

    // 기존 getMembers() 메서드 아래에 추가

    public MemberDetailDto getMemberDetail(Integer memberId) {
        // 회원 조회 (탈퇴 회원 포함)
        Member member = memberRepository.findById(memberId)
                .orElseThrow(AdminMemberException::memberNotFound);

        // 통계 정보 조회 (기존 메서드 재사용!)
        MemberListDto.MemberStatsDto stats = getMemberStatsForDetail(memberId);

        return MemberDetailDto.builder()
                .id(member.getId())
                .nickname(member.getNickname())
                .biography(member.getBiography())
                .email(member.getEmail())
                .provider(member.getProvider().name())
                .providerId(member.getProviderId())
                .phoneNumber(member.getPhoneNumber())
                .profileImageUrl(member.getProfileImageUrl())
                .walletAddress(member.getWalletAddress())
                .role(member.getRole().name())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .deletedAt(member.getDeletedAt())
                .stats(MemberDetailDto.MemberStatsDto.builder()
                        .penaltyScore(stats.getPenaltyScore())
                        .averageRating(stats.getAverageRating())
                        .reviewCount(stats.getReviewCount())
                        .pendingInquiries(stats.getPendingInquiries())
                        .build())
                .build();
    }

    /**
     * 단일 회원의 통계 정보 조회 (상세 조회용)
     */
    private MemberListDto.MemberStatsDto getMemberStatsForDetail(Integer memberId) {
        // 페널티 점수
        Integer penaltyScore = memberRepository.findMembersWithStats(null, null, Pageable.unpaged())
                .stream()
                .filter(p -> p.getId().equals(memberId))
                .findFirst()
                .map(MemberWithStatsProjection::getPenaltyScore)
                .orElse(0);

        // 평균 평점
        Double averageRating = memberRepository.findMembersWithStats(null, null, Pageable.unpaged())
                .stream()
                .filter(p -> p.getId().equals(memberId))
                .findFirst()
                .map(MemberWithStatsProjection::getAverageRating)
                .orElse(0.0);

        // 리뷰 개수
        Long reviewCount = memberRepository.findMembersWithStats(null, null, Pageable.unpaged())
                .stream()
                .filter(p -> p.getId().equals(memberId))
                .findFirst()
                .map(MemberWithStatsProjection::getReviewCount)
                .orElse(0L);

        // PENDING 문의 개수
        Long pendingInquiries = inquiryRepository.countByMemberIdAndStatus(memberId, InquiryStatus.PENDING);

        return MemberListDto.MemberStatsDto.builder()
                .penaltyScore(penaltyScore)
                .averageRating(averageRating)
                .reviewCount(reviewCount.intValue())
                .pendingInquiries(pendingInquiries.intValue())
                .build();
    }

    /**
     * 회원 페널티 이력 조회
     */
    public MemberPenaltyListDto getMemberPenalties(Integer memberId) {
        // 회원 존재 확인
        memberRepository.findById(memberId)
                .orElseThrow(AdminMemberException::memberNotFound);

        // 페널티 이력 조회
        List<PenaltyRecord> records = penaltyRecordRepository.findByMemberIdOrderByCreatedAtDesc(memberId);

        List<MemberPenaltyListDto.PenaltyItemDto> penalties = records.stream()
                .map(record -> MemberPenaltyListDto.PenaltyItemDto.builder()
                        .id(record.getId())
                        .memberId(record.getMemberId())
                        .contractId(record.getContractId())
                        .changedBy(record.getChangedBy())
                        .penaltyScore(record.getPenaltyScore())
                        .createdAt(record.getCreatedAt())
                        .changedAt(record.getChangedAt())
                        .build())
                .collect(Collectors.toList());

        return MemberPenaltyListDto.builder()
                .penalties(penalties)
                .build();
    }

    /**
     * 회원 페널티 수정
     */
    @Transactional
    public UpdatePenaltyDto updateMemberPenalty(Integer memberId, UpdatePenaltyRequest request) {
        // 회원 존재 확인
        memberRepository.findById(memberId)
                .orElseThrow(AdminMemberException::memberNotFound);

        // 계약 ID가 있으면 계약 존재 확인
        if (request.getContractId() != null) {
            contractRepository.findById(request.getContractId())
                    .orElseThrow(() -> AdminMemberException.invalidParameter(
                            "contractId",
                            "존재하지 않는 계약입니다."
                    ));
        }

        // 현재 페널티 점수 조회
        Integer currentScore = totalPenaltyRepository.findScoreByMemberId(memberId);

        // 새로운 페널티 점수 계산
        Integer newScore = currentScore + request.getPenaltyScore();

        // 음수 방지
        if (newScore < 0) {
            newScore = 0;
        }

        // TotalPenalty 업데이트 또는 생성
        updateOrCreateTotalPenalty(memberId, newScore);

        // 페널티 이력 저장
        createPenaltyRecord(memberId, request.getContractId(), request.getPenaltyScore());

        return UpdatePenaltyDto.builder()
                .memberId(memberId)
                .previousPenaltyScore(currentScore)
                .newPenaltyScore(newScore)
                .changedScore(request.getPenaltyScore())
                .reason(request.getReason())
                .build();
    }

    /**
     * TotalPenalty 업데이트 또는 생성
     */
    private void updateOrCreateTotalPenalty(Integer memberId, Integer newScore) {
        TotalPenalty totalPenalty = totalPenaltyRepository.findById(memberId)
                .orElse(null);

        if (totalPenalty == null) {
            // 새로 생성
            totalPenalty = TotalPenalty.builder()
                    .id(memberId)
                    .score(newScore)
                    .build();
        } else {
            // 기존 엔티티 업데이트
            totalPenalty = TotalPenalty.builder()
                    .id(memberId)
                    .score(newScore)
                    .build();
        }

        totalPenaltyRepository.save(totalPenalty);
    }

    /**
     * 페널티 이력 생성
     */
    private void createPenaltyRecord(Integer memberId, Long contractId, Integer penaltyScore) {
        Integer adminId = SecurityUtil.getCurrentAdminId();

        PenaltyRecord record = PenaltyRecord.builder()
                .memberId(memberId)
                .contractId(contractId)
                .changedBy(adminId)
                .penaltyScore(penaltyScore)
                .build();

        penaltyRecordRepository.save(record);
    }

    /**
     * 회원 통계 조회
     */
    public MemberStatisticsDto getMemberStatistics() {
        // 전체 회원 수 조회
        Long totalMembers = memberRepository.countActiveMembersTotal();

        // 역할별 회원 수 조회
        List<MemberRoleCountProjection> roleCounts = memberRepository.countMembersByRole();

        // Map으로 변환
        Map<String, Long> roleDistribution = roleCounts.stream()
                .collect(Collectors.toMap(
                        projection -> projection.getRole().name(),  // ✅ getRole() 사용
                        MemberRoleCountProjection::getCount         // ✅ getCount() 사용
                ));

        // 각 역할이 없으면 0으로 초기화
        roleDistribution.putIfAbsent("PENDING", 0L);
        roleDistribution.putIfAbsent("LEADER", 0L);
        roleDistribution.putIfAbsent("ARTIST", 0L);

        return MemberStatisticsDto.builder()
                .totalMembers(totalMembers)
                .roleDistribution(roleDistribution)
                .build();
    }
}