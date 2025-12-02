package com.s401.moas.member.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.s401.moas.global.util.BlockExplorerUtil;
import com.s401.moas.member.controller.response.*;
import com.s401.moas.member.service.dto.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.s401.moas.global.security.SecurityUtil;
import com.s401.moas.member.controller.request.CreateBankAccountRequest;
import com.s401.moas.member.controller.request.UpdateMemberProfileRequest;
import com.s401.moas.member.controller.request.UpdateMemberRoleRequest;
import com.s401.moas.member.controller.response.ArtistMyProfileResponse;
import com.s401.moas.member.controller.response.BankAccountListResponse;
import com.s401.moas.member.controller.response.BankAccountResponse;
import com.s401.moas.member.controller.response.CreateBankAccountResponse;
import com.s401.moas.member.controller.response.DeleteMemberResponse;
import com.s401.moas.member.controller.response.LeaderMyProfileResponse;
import com.s401.moas.member.controller.response.MemberPublicProfileResponse;
import com.s401.moas.member.controller.response.NicknameExistsResponse;
import com.s401.moas.member.controller.response.ReviewListResponse;
import com.s401.moas.member.controller.response.UpdateMemberProfileResponse;
import com.s401.moas.member.controller.response.UpdateMemberRoleResponse;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.domain.MemberBank;
import com.s401.moas.member.exception.MemberException;
import com.s401.moas.member.service.MemberBankService;
import com.s401.moas.member.service.MemberService;
import com.s401.moas.review.service.ReviewService;
import com.s401.moas.review.service.dto.ReviewListDto;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 회원 관리 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController implements MemberControllerSpec {

    private final MemberService memberService;
    private final MemberBankService memberBankService;
    private final ReviewService reviewService;
    private final ObjectMapper objectMapper;
    private final BlockExplorerUtil blockExplorerUtil;
    /**
     * 타인 공개 프로필 조회
     * 인증 없이도 접근 가능
     * PENDING 상태 회원은 404 반환
     *
     * @param memberId 회원 ID (양수여야 함)
     * @return 공개 프로필 정보
     */
    @GetMapping("/{memberId}")
    public ResponseEntity<MemberPublicProfileResponse> getPublicProfile(@PathVariable Integer memberId) {
        log.info("공개 프로필 조회 요청: memberId={}", memberId);

        if (memberId == null || memberId <= 0) {
            log.warn("잘못된 memberId 형식: memberId={}", memberId);
            throw MemberException.invalidMemberIdFormat();
        }

        MemberProfileDto profileDto = memberService.getPublicProfile(memberId);

        Member member = profileDto.getMember();
        MemberProfileDto.ReviewStatsDto stats = profileDto.getReviewStats();

        MemberPublicProfileResponse response = MemberPublicProfileResponse.builder()
                .memberId(member.getId())
                .nickname(member.getNickname())
                .profileImageUrl(member.getProfileImageUrl())
                .chainExploreUrl(blockExplorerUtil.buildWalletNftTransfersUrl(member.getWalletAddress()))
                .role(member.getRole().name())
                .averageRating(stats.getAverageRating())
                .reviewCount(stats.getReviewCount())
                .build();

        log.info("공개 프로필 조회 성공: memberId={}, role={}", memberId, member.getRole());

        return ResponseEntity.ok(response);
    }

    /**
     * 닉네임 중복 조회
     * 인증 없이도 접근 가능
     * 닉네임 형식 오류 시 400 반환
     *
     * @param nickname 조회할 닉네임 (필수, 2-50자)
     * @return 닉네임 중복 여부
     */
    @GetMapping("/nickname/exists")
    @Override
    public ResponseEntity<NicknameExistsResponse> checkNicknameExists(
            @RequestParam String nickname) {
        log.info("닉네임 중복 조회 요청: nickname={}", nickname);

        NicknameCheckResultDto result = memberService.checkNicknameExists(nickname);

        NicknameExistsResponse response = NicknameExistsResponse.builder()
                .available(result.isAvailable())
                .nickname(result.getNickname())
                .build();

        log.info("닉네임 중복 조회 완료: nickname={}, available={}", result.getNickname(), result.isAvailable());

        return ResponseEntity.ok(response);
    }

    /**
     * 프로필 수정
     * 인증이 필요하며, 현재 로그인한 사용자의 프로필 정보를 수정합니다.
     * PATCH 요청에 맞게 null이 아닌 필드만 업데이트됩니다.
     * 변경 가능한 필드: nickname, biography, phoneNumber, profileImageUrl
     *
     * @param data 프로필 수정 요청 DTO
     * @return 수정된 프로필 정보
     */
    @PatchMapping(value = "/me", consumes = "multipart/form-data")
    @Override
    public ResponseEntity<UpdateMemberProfileResponse> updateProfile(
            @RequestPart("data") String data,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) throws Exception {
        log.info("프로필 수정 요청");

        UpdateMemberProfileRequest request = objectMapper.readValue(data, UpdateMemberProfileRequest.class);
        request.setProfileImage(profileImage);

        // 인증된 사용자의 memberId 추출
        Integer memberId = SecurityUtil.getCurrentMemberId();

        Member member = memberService.updateProfile(memberId, request);

        UpdateMemberProfileResponse response = UpdateMemberProfileResponse.builder()
                .memberId(member.getId())
                .nickname(member.getNickname())
                .biography(member.getBiography())
                .phoneNumber(member.getPhoneNumber())
                .profileImageUrl(member.getProfileImageUrl())
                .build();

        log.info("프로필 수정 성공: memberId={}", memberId);

        return ResponseEntity.ok(response);
    }

    /**
     * 회원 탈퇴 (Soft Delete)
     * 인증이 필요하며, 본인만 탈퇴할 수 있습니다.
     * 탈퇴 시 deletedAt 필드가 현재 시각으로 설정됩니다.
     *
     * @return 탈퇴한 회원 정보
     */
    @DeleteMapping("/me")
    @Override
    public ResponseEntity<DeleteMemberResponse> deleteMember() {
        log.info("회원 탈퇴 요청");

        // 인증된 사용자의 memberId 추출
        Integer memberId = SecurityUtil.getCurrentMemberId();

        LocalDateTime deletedAt = memberService.deleteMember(memberId);

        DeleteMemberResponse response = DeleteMemberResponse.builder()
                .memberId(memberId)
                .deletedAt(deletedAt)
                .build();

        log.info("회원 탈퇴 성공: memberId={}, deletedAt={}", memberId, deletedAt);

        return ResponseEntity.ok(response);
    }

    /**
     * 마이페이지 조회
     * 인증된 사용자의 프로필 및 요약 정보를 반환합니다.
     */
    @GetMapping("/me")
    @Override
    public ResponseEntity<?> getMyProfile() {
        Integer memberId = SecurityUtil.getCurrentMemberId();
        Authentication authentication = SecurityUtil.getAuthentication();
        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("");

        if ("LEADER".equals(role)) {
            LeaderMyProfileDto dto = memberService.getLeaderMyProfile(memberId);
            return ResponseEntity.ok(LeaderMyProfileResponse.from(dto));
        } else if ("ARTIST".equals(role)) {
            ArtistMyProfileDto dto = memberService.getArtistMyProfile(memberId);
            return ResponseEntity.ok(ArtistMyProfileResponse.from(dto));
        } else {
            throw MemberException.invalidMemberRole();
        }
    }

    /**
     * 회원 역할 변경
     * PENDING 상태의 회원이 LEADER 또는 ARTIST 역할을 선택합니다.
     * 인증이 필요하며, 본인만 변경할 수 있습니다.
     *
     * @param request 역할 변경 요청 DTO
     * @return 변경된 역할 정보
     */
    @PatchMapping("/me/role")
    @Override
    public ResponseEntity<UpdateMemberRoleResponse> updateRole(
            @Valid @RequestBody UpdateMemberRoleRequest request) {
        log.info("회원 역할 변경 요청");

        // 인증된 사용자의 memberId 추출
        Integer memberId = SecurityUtil.getCurrentMemberId();

        Member member = memberService.updateRole(memberId, request.getRole());

        UpdateMemberRoleResponse response = UpdateMemberRoleResponse.builder()
                .memberId(member.getId())
                .role(member.getRole().name())
                .build();

        log.info("회원 역할 변경 성공: memberId={}, role={}", memberId, member.getRole());

        return ResponseEntity.ok(response);
    }

    /**
     * 내 리뷰 목록 조회
     * 인증된 사용자가 받은 리뷰 또는 작성한 리뷰 목록을 조회합니다.
     *
     * @param type 리뷰 타입 ("received": 받은 리뷰, "sent": 작성한 리뷰, 기본값: "received")
     * @param page 페이지 번호 (기본값: 1)
     * @param size 페이지 크기 (기본값: 10)
     * @return 리뷰 목록
     */
    @GetMapping("/me/reviews")
    @Override
    public ResponseEntity<ReviewListResponse> getMyReviews(
            @RequestParam(required = false, defaultValue = "received") String type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("내 리뷰 목록 조회 요청: type={}, page={}, size={}", type, page, size);

        // type 검증
        if (!"received".equals(type) && !"sent".equals(type)) {
            log.warn("잘못된 type 값: type={}", type);
            throw MemberException.invalidReviewType();
        }

        Integer memberId = SecurityUtil.getCurrentMemberId();

        ReviewListDto dto = reviewService.getMyReviews(memberId, type, page, size);
        ReviewListResponse response = ReviewListResponse.from(dto);

        log.info("내 리뷰 목록 조회 성공: type={}, total={}", type, dto.getTotal());

        return ResponseEntity.ok(response);
    }

    /**
     * 특정 유저가 받은 리뷰 목록 조회
     * 특정 회원이 받은 리뷰 목록을 조회합니다.
     *
     * @param memberId 회원 ID
     * @param page 페이지 번호 (기본값: 1)
     * @param size 페이지 크기 (기본값: 10)
     * @return 리뷰 목록
     */
    @GetMapping("/{memberId}/reviews")
    @Override
    public ResponseEntity<ReviewListResponse> getMemberReviews(
            @PathVariable Integer memberId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("특정 유저 리뷰 목록 조회 요청: memberId={}, page={}, size={}", memberId, page, size);

        // memberId 형식 검증
        if (memberId == null || memberId <= 0) {
            log.warn("잘못된 memberId 형식: memberId={}", memberId);
            throw MemberException.invalidMemberIdFormat();
        }

        // memberId 존재 여부 확인
        memberService.getPublicProfile(memberId);

        // 받은 리뷰만 조회 (type="received" 고정)
        ReviewListDto dto = reviewService.getMyReviews(memberId, "received", page, size);
        ReviewListResponse response = ReviewListResponse.from(dto);

        log.info("특정 유저 리뷰 목록 조회 성공: memberId={}, total={}", memberId, dto.getTotal());

        return ResponseEntity.ok(response);
    }

    /**
     * 내 계좌 목록 조회
     * 인증된 사용자가 등록한 계좌 목록을 조회합니다.
     * 삭제되지 않은 계좌만 조회됩니다.
     *
     * @return 계좌 목록
     */
    @Override
    @GetMapping("/me/bank-accounts")
    public ResponseEntity<BankAccountListResponse> getMyBankAccounts() {
        log.info("내 계좌 목록 조회 요청");

        Integer memberId = SecurityUtil.getCurrentMemberId();

        List<MemberBank> memberBanks = memberBankService.getBankAccounts(memberId);

        BankAccountListResponse response = BankAccountListResponse.from(
                memberBanks,
                memberBankService::getBankName
        );

        log.info("내 계좌 목록 조회 성공: memberId={}, count={}", memberId, memberBanks.size());

        return ResponseEntity.ok(response);
    }

    /**
     * 계좌 등록
     * 인증된 사용자가 계좌 정보를 등록합니다.
     * 계좌번호는 암호화되어 저장됩니다.
     *
     * @param request 계좌 등록 요청 DTO
     * @return 등록된 계좌 정보
     */
    @Override
    @PostMapping("/me/bank-accounts")
    public ResponseEntity<CreateBankAccountResponse> createBankAccount(
            @Valid @RequestBody CreateBankAccountRequest request) {
        log.info("계좌 등록 요청: bankCode={}", request.getBankCode());

        Integer memberId = SecurityUtil.getCurrentMemberId();

        MemberBank memberBank = memberBankService.createBankAccount(memberId, request);

        // 은행명 조회
        String bankName = memberBankService.getBankName(memberBank.getBankCode());

        CreateBankAccountResponse response = CreateBankAccountResponse.from(memberBank, bankName);

        log.info("계좌 등록 성공: accountId={}, memberId={}", memberBank.getId(), memberId);

        return ResponseEntity.ok(response);
    }

    /**
     * 계좌 검증
     * 인증된 사용자가 자신의 계좌를 검증합니다.
     * PENDING 상태의 계좌를 VERIFIED 상태로 변경합니다.
     * 실제로는 금융 API를 통해 검증해야 하지만, 현재는 요청 시 바로 검증 처리합니다.
     *
     * @param accountId 계좌 ID
     * @return 검증된 계좌 정보
     */
    @Override
    @PostMapping("/me/bank-accounts/{accountId}/verify")
    public ResponseEntity<BankAccountResponse> verifyBankAccount(@PathVariable Long accountId) {
        log.info("계좌 검증 요청: accountId={}", accountId);

        Integer memberId = SecurityUtil.getCurrentMemberId();

        MemberBank memberBank = memberBankService.verifyBankAccount(memberId, accountId);

        // 은행명 조회
        String bankName = memberBankService.getBankName(memberBank.getBankCode());

        BankAccountResponse response = BankAccountResponse.from(memberBank, bankName);

        log.info("계좌 검증 성공: accountId={}, memberId={}, status={}",
                accountId, memberId, memberBank.getStatus());

        return ResponseEntity.ok(response);
    }

    /**
     * 계좌 삭제
     * 인증된 사용자가 자신의 계좌를 삭제합니다 (Soft Delete).
     *
     * @param accountId 계좌 ID
     * @return 삭제 성공 응답
     */
    @Override
    @DeleteMapping("/me/bank-accounts/{accountId}")
    public ResponseEntity<Void> deleteBankAccount(@PathVariable Long accountId) {
        log.info("계좌 삭제 요청: accountId={}", accountId);

        Integer memberId = SecurityUtil.getCurrentMemberId();

        memberBankService.deleteBankAccount(memberId, accountId);

        log.info("계좌 삭제 성공: accountId={}, memberId={}", accountId, memberId);

        return ResponseEntity.noContent().build();
    }

    @Override
    @GetMapping("/me/transactions")
    public ResponseEntity<TransactionHistoryResponse> getMyTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Integer memberId = SecurityUtil.getCurrentMemberId(); // 현재 로그인한 사용자 ID 가져오기
        Pageable pageable = PageRequest.of(page, size);
        // 1. Service는 Service DTO를 반환
        TransactionHistoryDto resultDto = memberService.getTransactionHistory(memberId, pageable);

        // 2. Controller가 Response DTO로 변환하여 최종 응답
        TransactionHistoryResponse response = TransactionHistoryResponse.from(resultDto);

        return ResponseEntity.ok(response);
    }
}
