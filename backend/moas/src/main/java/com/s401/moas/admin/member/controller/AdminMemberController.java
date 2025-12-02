package com.s401.moas.admin.member.controller;

import com.s401.moas.admin.member.controller.request.UpdatePenaltyRequest;
import com.s401.moas.admin.member.controller.response.*;
import com.s401.moas.admin.member.service.AdminMemberService;
import com.s401.moas.admin.member.service.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.annotation.Profile;

@Profile("admin")
@RestController
@RequestMapping("/admin/api/members")
@RequiredArgsConstructor
public class AdminMemberController implements AdminMemberControllerSpec {

    private final AdminMemberService adminMemberService;

    @GetMapping
    @Override
    public ResponseEntity<MemberListResponse> getMembers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "desc") String order,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size
    ) {
        MemberListDto dto = adminMemberService.getMembers(role, keyword, order, page, size);
        MemberListResponse response = MemberListResponse.from(dto);
        return ResponseEntity.ok(response);
    }

    // 기존 getMembers() 메서드 아래에 추가

    @GetMapping("/{memberId}")
    @Override
    public ResponseEntity<MemberDetailResponse> getMemberDetail(@PathVariable Integer memberId) {
        MemberDetailDto dto = adminMemberService.getMemberDetail(memberId);
        MemberDetailResponse response = MemberDetailResponse.from(dto);
        return ResponseEntity.ok(response);

    }

    @GetMapping("/{memberId}/penalties")
    @Override
    public ResponseEntity<MemberPenaltyListResponse> getMemberPenalties(@PathVariable Integer memberId) {
        MemberPenaltyListDto dto = adminMemberService.getMemberPenalties(memberId);
        MemberPenaltyListResponse response = MemberPenaltyListResponse.from(dto);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{memberId}/penalty")
    @Override
    public ResponseEntity<UpdatePenaltyResponse> updateMemberPenalty(
            @PathVariable Integer memberId,
            @Valid @RequestBody UpdatePenaltyRequest request) {
        UpdatePenaltyDto dto = adminMemberService.updateMemberPenalty(memberId, request);
        UpdatePenaltyResponse response = UpdatePenaltyResponse.from(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/statistics")
    @Override
    public ResponseEntity<MemberStatisticsResponse> getMemberStatistics() {
        MemberStatisticsDto dto = adminMemberService.getMemberStatistics();
        MemberStatisticsResponse response = MemberStatisticsResponse.from(dto);
        return ResponseEntity.ok(response);
    }
}