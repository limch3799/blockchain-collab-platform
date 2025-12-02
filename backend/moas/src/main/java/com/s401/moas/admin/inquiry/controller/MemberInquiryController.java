package com.s401.moas.admin.inquiry.controller;

import com.s401.moas.admin.inquiry.controller.request.CreateInquiryCommentRequest;
import com.s401.moas.admin.inquiry.controller.request.CreateInquiryRequest;
import com.s401.moas.admin.inquiry.controller.response.CloseInquiryResponse;
import com.s401.moas.admin.inquiry.controller.response.CreateInquiryCommentResponse;
import com.s401.moas.admin.inquiry.controller.response.CreateInquiryResponse;
import com.s401.moas.admin.inquiry.controller.response.InquiryDetailResponse;
import com.s401.moas.admin.inquiry.controller.response.InquiryListResponse;
import com.s401.moas.admin.inquiry.domain.InquiryCategory;  // ✅ import 추가
import com.s401.moas.admin.inquiry.service.MemberInquiryService;
import com.s401.moas.admin.inquiry.service.dto.InquiryCommentDto;
import com.s401.moas.admin.inquiry.service.dto.InquiryDetailDto;
import com.s401.moas.admin.inquiry.service.dto.InquiryDto;
import com.s401.moas.global.security.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/member/inquiries")
@RequiredArgsConstructor
public class MemberInquiryController implements MemberInquiryControllerSpec {

    private final MemberInquiryService memberInquiryService;

    @Override
    @PostMapping
    public ResponseEntity<CreateInquiryResponse> createInquiry(
            @Valid @ModelAttribute CreateInquiryRequest request) {
        log.info("문의 작성 요청 - 유형: {}, 제목: {}", request.getCategory(), request.getTitle());

        Integer memberId = SecurityUtil.getCurrentMemberId();

        InquiryDto dto = memberInquiryService.createInquiry(memberId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CreateInquiryResponse.from(dto));
    }

    /**
     * ✅ 통합된 내 문의 목록 조회/검색
     */
    @Override
    @GetMapping
    public ResponseEntity<InquiryListResponse> getMyInquiries(
            @RequestParam(required = false) InquiryCategory category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("내 문의 목록 조회/검색 - category: {}, keyword: {}, page: {}, size: {}",
                category, keyword, page, size);

        Integer memberId = SecurityUtil.getCurrentMemberId();
        Pageable pageable = PageRequest.of(page, size);

        Page<InquiryDto> inquiries = memberInquiryService.getMyInquiries(
                memberId,
                category,
                keyword,
                pageable
        );

        return ResponseEntity.ok(InquiryListResponse.from(inquiries));
    }

    @Override
    @GetMapping("/{inquiryId}")
    public ResponseEntity<InquiryDetailResponse> getInquiryDetail(
            @PathVariable Integer inquiryId) {
        log.info("문의 상세 조회 요청 - inquiryId: {}", inquiryId);

        Integer memberId = SecurityUtil.getCurrentMemberId();

        InquiryDetailDto dto = memberInquiryService.getInquiryDetail(inquiryId, memberId);

        return ResponseEntity.ok(InquiryDetailResponse.from(dto));
    }

    @Override
    @PostMapping("/{inquiryId}/comments")
    public ResponseEntity<CreateInquiryCommentResponse> createComment(
            @PathVariable Integer inquiryId,
            @Valid @ModelAttribute CreateInquiryCommentRequest request) {
        log.info("댓글 작성 요청 - inquiryId: {}", inquiryId);

        Integer memberId = SecurityUtil.getCurrentMemberId();

        InquiryCommentDto dto = memberInquiryService.createComment(inquiryId, memberId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CreateInquiryCommentResponse.from(dto));
    }

    @Override
    @PatchMapping("/{inquiryId}/close")
    public ResponseEntity<CloseInquiryResponse> closeInquiry(
            @PathVariable Integer inquiryId) {
        log.info("문의 종료 요청 - inquiryId: {}", inquiryId);

        Integer memberId = SecurityUtil.getCurrentMemberId();

        memberInquiryService.closeInquiry(inquiryId, memberId);

        return ResponseEntity.ok(CloseInquiryResponse.of(inquiryId));
    }
}