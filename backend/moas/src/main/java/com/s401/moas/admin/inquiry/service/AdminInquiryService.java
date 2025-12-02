package com.s401.moas.admin.inquiry.service;

import com.s401.moas.admin.auth.domain.Admin;
import com.s401.moas.admin.auth.repository.AdminRepository;
import com.s401.moas.admin.inquiry.controller.request.CreateInquiryCommentRequest;
import com.s401.moas.admin.inquiry.domain.Inquiry;
import com.s401.moas.admin.inquiry.domain.InquiryCategory;  // ✅ import 추가
import com.s401.moas.admin.inquiry.domain.InquiryComment;
import com.s401.moas.admin.inquiry.domain.InquiryCommentFile;
import com.s401.moas.admin.inquiry.domain.InquiryFile;
import com.s401.moas.admin.inquiry.domain.InquiryStatus;
import com.s401.moas.admin.inquiry.exception.InquiryException;
import com.s401.moas.admin.inquiry.repository.InquiryCommentFileRepository;
import com.s401.moas.admin.inquiry.repository.InquiryCommentRepository;
import com.s401.moas.admin.inquiry.repository.InquiryFileRepository;
import com.s401.moas.admin.inquiry.repository.InquiryRepository;
import com.s401.moas.admin.inquiry.repository.projection.InquiryCategoryStatusCount;
import com.s401.moas.admin.inquiry.service.dto.*;
import com.s401.moas.global.service.S3Service;
import com.s401.moas.global.util.FileValidator;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.repository.MemberRepository;
import com.s401.moas.notification.domain.Notification;
import com.s401.moas.notification.repository.NotificationRepository;
import com.s401.moas.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminInquiryService {

    private final InquiryRepository inquiryRepository;
    private final InquiryFileRepository inquiryFileRepository;
    private final InquiryCommentRepository inquiryCommentRepository;
    private final InquiryCommentFileRepository inquiryCommentFileRepository;
    private final MemberRepository memberRepository;
    private final AdminRepository adminRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final S3Service s3Service;

    @Value("${inquiry.file.max-files}")
    private int maxFiles;

    @Value("${inquiry.file.max-file-size}")
    private long maxFileSize;

    @Value("${inquiry.file.max-total-size}")
    private long maxTotalSize;

    /**
     * ✅ 통합된 문의 목록 조회/검색
     * memberId, category, keyword를 선택적으로 조합하여 검색 가능
     */
    public Page<InquiryDto> getInquiries(
            Integer memberId,
            InquiryCategory category,
            String keyword,
            Pageable pageable) {

        log.info("문의 목록 조회 - memberId: {}, category: {}, keyword: {}",
                memberId, category, keyword);

        // 동적 쿼리 실행
        Page<Inquiry> inquiries = inquiryRepository.searchInquiries(
                memberId,
                category,
                keyword,
                pageable
        );

        return inquiries.map(inquiry -> {
            long commentCount = inquiryCommentRepository.countByInquiryIdAndDeletedAtIsNull(inquiry.getId());

            return InquiryDto.builder()
                    .inquiryId(inquiry.getId())
                    .memberId(inquiry.getMemberId())
                    .category(inquiry.getCategory())  // ✅ 추가
                    .title(inquiry.getTitle())
                    .status(inquiry.getStatus())
                    .commentCount(commentCount)
                    .createdAt(inquiry.getCreatedAt())
                    .updatedAt(inquiry.getUpdatedAt())
                    .build();
        });
    }

    /**
     * 문의 상세 조회 (관리자는 모든 문의 조회 가능)
     */
    public InquiryDetailDto getInquiryDetail(Integer inquiryId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> InquiryException.inquiryNotFound());

        return buildInquiryDetailDto(inquiry);
    }

    /**
     * 댓글 작성 (관리자) - 알림 발송 포함
     */
    @Transactional
    public InquiryCommentDto createComment(Integer inquiryId, Integer adminId, CreateInquiryCommentRequest request) {
        try {
            // 1. 문의 조회
            Inquiry inquiry = inquiryRepository.findById(inquiryId)
                    .orElseThrow(() -> InquiryException.inquiryNotFound());

            // 2. 파일 유효성 검증
            if (request.getFiles() != null && !request.getFiles().isEmpty()) {
                FileValidator.validateFiles(request.getFiles(), maxFiles, maxFileSize, maxTotalSize);
            }

            // 3. 댓글 생성 (관리자이므로 adminId 설정)
            InquiryComment comment = InquiryComment.builder()
                    .inquiryId(inquiryId)
                    .adminId(adminId)
                    .content(request.getContent())
                    .createdAt(LocalDateTime.now())
                    .build();

            InquiryComment savedComment = inquiryCommentRepository.save(comment);

            // 4. 첨부파일 업로드
            List<InquiryCommentFile> savedFiles = null;
            if (request.getFiles() != null && !request.getFiles().isEmpty()) {
                savedFiles = uploadCommentFiles(savedComment.getId(), request.getFiles());
            }

            // 5. 문의 상태 업데이트 (PENDING -> ANSWERED)
            if (inquiry.getStatus() == InquiryStatus.PENDING) {
                updateInquiryStatus(inquiry, InquiryStatus.ANSWERED);
            }

            // 6. 알림 생성
            notificationService.createNotification(
                    inquiry.getMemberId(),
                    "INQUIRY_ANSWERED",
                    inquiryId.longValue()
            );

            // 7. 관리자 정보 조회
            Admin admin = adminRepository.findById(adminId)
                    .orElseThrow(() -> InquiryException.adminNotFound());

            // 8. DTO 변환
            FileDto fileDto = null;
            if (savedFiles != null && !savedFiles.isEmpty()) {
                InquiryCommentFile file = savedFiles.get(0);
                fileDto = FileDto.builder()
                        .fileId(file.getId())
                        .originalFileName(file.getOriginalFileName())
                        .storedFileUrl(file.getStoredFileUrl())
                        .fileType(file.getFileType())
                        .fileSize(file.getFileSize())
                        .build();
            }

            log.info("관리자 답변 작성 완료 - inquiryId: {}, adminId: {}", inquiryId, adminId);

            return InquiryCommentDto.builder()
                    .commentId(savedComment.getId())
                    .adminId(savedComment.getAdminId())
                    .adminName(admin.getName())
                    .content(savedComment.getContent())
                    .file(fileDto)
                    .createdAt(savedComment.getCreatedAt())
                    .build();

        } catch (IOException e) {
            log.error("댓글 작성 중 파일 업로드 실패", e);
            throw InquiryException.fileUploadFailed(e);
        }
    }

    /**
     * 댓글 첨부파일 업로드
     */
    private List<InquiryCommentFile> uploadCommentFiles(Long commentId, List<MultipartFile> files) throws IOException {
        return files.stream()
                .map(file -> {
                    try {
                        String fileUrl = s3Service.upload(file, "inquiry/comments");

                        InquiryCommentFile commentFile = InquiryCommentFile.builder()
                                .inquiryCommentId(commentId)
                                .storedFileUrl(fileUrl)
                                .originalFileName(file.getOriginalFilename())
                                .fileType(file.getContentType())
                                .fileSize((int) file.getSize())
                                .uploadedAt(LocalDateTime.now())
                                .build();

                        return inquiryCommentFileRepository.save(commentFile);
                    } catch (IOException e) {
                        throw new RuntimeException("파일 업로드 실패", e);
                    }
                })
                .collect(Collectors.toList());
    }

    /**
     * 문의 상태 업데이트
     */
    private void updateInquiryStatus(Inquiry inquiry, InquiryStatus newStatus) {
        Inquiry updatedInquiry = Inquiry.builder()
                .id(inquiry.getId())
                .memberId(inquiry.getMemberId())
                .category(inquiry.getCategory())
                .title(inquiry.getTitle())
                .content(inquiry.getContent())
                .status(newStatus)
                .createdAt(inquiry.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();

        inquiryRepository.save(updatedInquiry);

        log.info("문의 상태 변경 - inquiryId: {}, status: {} -> {}", inquiry.getId(), inquiry.getStatus(), newStatus);
    }


    /**
     * InquiryDetailDto 구성
     */
    private InquiryDetailDto buildInquiryDetailDto(Inquiry inquiry) {
        // 회원 정보 조회
        Member member = memberRepository.findById(inquiry.getMemberId())
                .orElseThrow(() -> InquiryException.memberNotFound());

        // 첨부파일 조회
        List<InquiryFile> files = inquiryFileRepository.findByInquiryId(inquiry.getId());
        List<FileDto> fileDtos = files.stream()
                .map(file -> FileDto.builder()
                        .fileId(file.getId())
                        .originalFileName(file.getOriginalFileName())
                        .storedFileUrl(file.getStoredFileUrl())
                        .fileType(file.getFileType())
                        .fileSize(file.getFileSize())
                        .build())
                .collect(Collectors.toList());

        // 댓글 조회
        List<InquiryComment> comments = inquiryCommentRepository.findByInquiryIdAndDeletedAtIsNullOrderByCreatedAtAsc(inquiry.getId());
        List<InquiryCommentDto> commentDtos = comments.stream()
                .map(this::buildCommentDto)
                .collect(Collectors.toList());

        return InquiryDetailDto.builder()
                .inquiryId(inquiry.getId())
                .memberId(inquiry.getMemberId())
                .memberNickname(member.getNickname())
                .category(inquiry.getCategory())  // ✅ 추가
                .title(inquiry.getTitle())
                .content(inquiry.getContent())
                .status(inquiry.getStatus())
                .files(fileDtos)
                .comments(commentDtos)
                .createdAt(inquiry.getCreatedAt())
                .updatedAt(inquiry.getUpdatedAt())
                .build();
    }

    /**
     * InquiryCommentDto 구성
     */
    private InquiryCommentDto buildCommentDto(InquiryComment comment) {
        String nickname = null;
        String adminName = null;
        Integer memberId = null;

        // 관리자 댓글인 경우
        if (comment.getAdminId() != null) {
            Admin admin = adminRepository.findById(comment.getAdminId())
                    .orElseThrow(() -> InquiryException.adminNotFound());
            adminName = admin.getName();
        } else {
            // 회원 댓글인 경우 (adminId가 NULL)
            // 문의 조회해서 작성자 정보 가져오기
            Inquiry inquiry = inquiryRepository.findById(comment.getInquiryId())
                    .orElseThrow(() -> InquiryException.inquiryNotFound());

            memberId = inquiry.getMemberId();
            Member member = memberRepository.findById(inquiry.getMemberId())
                    .orElseThrow(() -> InquiryException.memberNotFound());
            nickname = member.getNickname();
        }

        // 첨부파일 조회
        List<InquiryCommentFile> files = inquiryCommentFileRepository.findByInquiryCommentId(comment.getId());
        FileDto fileDto = null;
        if (!files.isEmpty()) {
            InquiryCommentFile file = files.get(0);
            fileDto = FileDto.builder()
                    .fileId(file.getId())
                    .originalFileName(file.getOriginalFileName())
                    .storedFileUrl(file.getStoredFileUrl())
                    .fileType(file.getFileType())
                    .fileSize(file.getFileSize())
                    .build();
        }

        return InquiryCommentDto.builder()
                .commentId(comment.getId())
                .memberId(memberId)
                .memberNickname(nickname)
                .adminId(comment.getAdminId())
                .adminName(adminName)
                .content(comment.getContent())
                .file(fileDto)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    /**
     * 카테고리별 상태별 문의 통계 조회
     */
    public InquiryStatsDto getInquiryStats() {
        log.info("문의 통계 조회 시작");

        // 1. DB에서 카테고리별 상태별 개수 조회
        List<InquiryCategoryStatusCount> rawStats = inquiryRepository.getInquiryStatsByCategory();

        // 2. 카테고리별로 그룹핑
        Map<InquiryCategory, Map<InquiryStatus, Long>> categoryStatusMap = rawStats.stream()
                .collect(Collectors.groupingBy(
                        InquiryCategoryStatusCount::getCategory,
                        Collectors.toMap(
                                InquiryCategoryStatusCount::getStatus,
                                InquiryCategoryStatusCount::getCount
                        )
                ));

        // 3. 각 카테고리별 통계 DTO 생성
        List<InquiryStatsDto.CategoryStatDto> categoryStats = Arrays.stream(InquiryCategory.values())
                .map(category -> {
                    Map<InquiryStatus, Long> statusCountMap = categoryStatusMap.getOrDefault(
                            category,
                            new HashMap<>()
                    );

                    long pendingCount = statusCountMap.getOrDefault(InquiryStatus.PENDING, 0L);
                    long answeredCount = statusCountMap.getOrDefault(InquiryStatus.ANSWERED, 0L);
                    long closedCount = statusCountMap.getOrDefault(InquiryStatus.CLOSED, 0L);
                    long totalCount = pendingCount + answeredCount + closedCount;

                    return InquiryStatsDto.CategoryStatDto.builder()
                            .category(category)
                            .pendingCount(pendingCount)
                            .answeredCount(answeredCount)
                            .closedCount(closedCount)
                            .totalCount(totalCount)
                            .build();
                })
                .collect(Collectors.toList());

        // 4. 전체 통계 계산
        long totalCount = categoryStats.stream()
                .mapToLong(InquiryStatsDto.CategoryStatDto::getTotalCount)
                .sum();

        log.info("문의 통계 조회 완료 - 전체: {}", totalCount);

        return InquiryStatsDto.builder()
                .totalCount(totalCount)
                .categoryStats(categoryStats)
                .build();
    }
}