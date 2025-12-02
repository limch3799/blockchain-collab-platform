package com.s401.moas.admin.inquiry.controller;

import com.s401.moas.admin.inquiry.controller.request.CreateInquiryCommentRequest;
import com.s401.moas.admin.inquiry.controller.response.CreateInquiryCommentResponse;
import com.s401.moas.admin.inquiry.controller.response.InquiryDetailResponse;
import com.s401.moas.admin.inquiry.controller.response.InquiryListResponse;
import com.s401.moas.admin.inquiry.controller.response.InquiryStatsResponse;
import com.s401.moas.admin.inquiry.domain.InquiryCategory;  // ✅ import 추가
import com.s401.moas.admin.inquiry.service.AdminInquiryService;
import com.s401.moas.admin.inquiry.service.dto.InquiryCommentDto;
import com.s401.moas.admin.inquiry.service.dto.InquiryDetailDto;
import com.s401.moas.admin.inquiry.service.dto.InquiryDto;
import com.s401.moas.admin.inquiry.service.dto.InquiryStatsDto;
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
import org.springframework.context.annotation.Profile;

@Profile("admin")
@Slf4j
@RestController
@RequestMapping("/admin/api/inquiries")
@RequiredArgsConstructor
public class AdminInquiryController implements AdminInquiryControllerSpec {

    private final AdminInquiryService adminInquiryService;

    /**
     * 통합된 문의 목록 조회/검색
     */
    @Override
    @GetMapping
    public ResponseEntity<InquiryListResponse> getInquiries(
            @RequestParam(required = false) Integer memberId,
            @RequestParam(required = false) InquiryCategory category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("문의 목록 조회/검색 - memberId: {}, category: {}, keyword: {}, page: {}, size: {}",
                memberId, category, keyword, page, size);

        Pageable pageable = PageRequest.of(page, size);

        Page<InquiryDto> inquiries = adminInquiryService.getInquiries(
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
        log.info("문의 상세 조회 요청 (관리자) - inquiryId: {}", inquiryId);

        InquiryDetailDto dto = adminInquiryService.getInquiryDetail(inquiryId);

        return ResponseEntity.ok(InquiryDetailResponse.from(dto));
    }

    @Override
    @PostMapping("/{inquiryId}/comments")
    public ResponseEntity<CreateInquiryCommentResponse> createComment(
            @PathVariable Integer inquiryId,
            @Valid @ModelAttribute CreateInquiryCommentRequest request) {
        log.info("답변 작성 요청 (관리자) - inquiryId: {}", inquiryId);

        Integer adminId = SecurityUtil.getCurrentAdminId();

        InquiryCommentDto dto = adminInquiryService.createComment(inquiryId, adminId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CreateInquiryCommentResponse.from(dto));
    }

    @Override
    @GetMapping("/stats")
    public ResponseEntity<InquiryStatsResponse> getInquiryStats() {
        log.info("문의 통계 조회 요청 (관리자)");

        InquiryStatsDto dto = adminInquiryService.getInquiryStats();

        return ResponseEntity.ok(InquiryStatsResponse.from(dto));
    }
}