package com.s401.moas.admin.inquiry.service;

import com.s401.moas.admin.auth.domain.Admin;
import com.s401.moas.admin.auth.repository.AdminRepository;
import com.s401.moas.admin.inquiry.controller.request.CreateInquiryCommentRequest;
import com.s401.moas.admin.inquiry.controller.request.CreateInquiryRequest;
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
import com.s401.moas.admin.inquiry.service.dto.FileDto;
import com.s401.moas.admin.inquiry.service.dto.InquiryCommentDto;
import com.s401.moas.admin.inquiry.service.dto.InquiryDetailDto;
import com.s401.moas.admin.inquiry.service.dto.InquiryDto;
import com.s401.moas.global.service.S3Service;
import com.s401.moas.global.util.FileValidator;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.repository.MemberRepository;
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
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberInquiryService {

    private final InquiryRepository inquiryRepository;
    private final InquiryFileRepository inquiryFileRepository;
    private final InquiryCommentRepository inquiryCommentRepository;
    private final InquiryCommentFileRepository inquiryCommentFileRepository;
    private final MemberRepository memberRepository;
    private final AdminRepository adminRepository;
    private final S3Service s3Service;

    @Value("${inquiry.file.max-files}")
    private int maxFiles;

    @Value("${inquiry.file.max-file-size}")
    private long maxFileSize;

    @Value("${inquiry.file.max-total-size}")
    private long maxTotalSize;

    /**
     * 문의 작성
     */
    @Transactional
    public InquiryDto createInquiry(Integer memberId, CreateInquiryRequest request) {
        try {
            // 1. 파일 유효성 검증
            if (request.getFiles() != null && !request.getFiles().isEmpty()) {
                FileValidator.validateFiles(request.getFiles(), maxFiles, maxFileSize, maxTotalSize);
            }

            // 2. 문의 엔티티 생성
            Inquiry inquiry = Inquiry.builder()
                    .memberId(memberId)
                    .category(request.getCategory())
                    .title(request.getTitle())
                    .content(request.getContent())
                    .status(InquiryStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .build();

            Inquiry savedInquiry = inquiryRepository.save(inquiry);

            // 3. 첨부파일 업로드
            if (request.getFiles() != null && !request.getFiles().isEmpty()) {
                uploadInquiryFiles(savedInquiry.getId(), request.getFiles());
            }

            return InquiryDto.builder()
                    .inquiryId(savedInquiry.getId())
                    .memberId(savedInquiry.getMemberId())
                    .category(savedInquiry.getCategory())
                    .title(savedInquiry.getTitle())
                    .status(savedInquiry.getStatus())
                    .commentCount(0L)
                    .createdAt(savedInquiry.getCreatedAt())
                    .build();

        } catch (IOException e) {
            log.error("문의 작성 중 파일 업로드 실패", e);
            throw InquiryException.fileUploadFailed(e);
        }
    }

    /**
     * ✅ 통합된 내 문의 목록 조회/검색
     */
    public Page<InquiryDto> getMyInquiries(
            Integer memberId,
            InquiryCategory category,
            String keyword,
            Pageable pageable) {

        log.info("내 문의 목록 조회/검색 - memberId: {}, category: {}, keyword: {}",
                memberId, category, keyword);

        // ✅ 동적 쿼리 메서드 사용
        Page<Inquiry> inquiries = inquiryRepository.searchMyInquiries(
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
     * 문의 상세 조회 (본인 확인 포함)
     */
    public InquiryDetailDto getInquiryDetail(Integer inquiryId, Integer memberId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> InquiryException.inquiryNotFound());

        // 본인 문의인지 확인
        if (!inquiry.getMemberId().equals(memberId)) {
            throw InquiryException.inquiryAccessDenied();
        }

        return buildInquiryDetailDto(inquiry);
    }

    /**
     * 댓글 작성 (회원)
     */
    @Transactional
    public InquiryCommentDto createComment(Integer inquiryId, Integer memberId, CreateInquiryCommentRequest request) {
        try {
            // 1. 문의 조회 및 권한 확인
            Inquiry inquiry = inquiryRepository.findById(inquiryId)
                    .orElseThrow(() -> InquiryException.inquiryNotFound());

            if (!inquiry.getMemberId().equals(memberId)) {
                throw InquiryException.inquiryAccessDenied();
            }

            // 2. 파일 유효성 검증
            if (request.getFiles() != null && !request.getFiles().isEmpty()) {
                FileValidator.validateFiles(request.getFiles(), maxFiles, maxFileSize, maxTotalSize);
            }

            // 3. 댓글 생성 (adminId는 NULL → 회원 댓글)
            InquiryComment comment = InquiryComment.builder()
                    .inquiryId(inquiryId)
                    .adminId(null)
                    .content(request.getContent())
                    .createdAt(LocalDateTime.now())
                    .build();

            InquiryComment savedComment = inquiryCommentRepository.save(comment);

            // 4. 첨부파일 업로드
            List<InquiryCommentFile> savedFiles = null;
            if (request.getFiles() != null && !request.getFiles().isEmpty()) {
                savedFiles = uploadCommentFiles(savedComment.getId(), request.getFiles());
            }

            // 5. 회원 정보 조회 (문의 작성자)
            Member member = memberRepository.findById(inquiry.getMemberId())
                    .orElseThrow(() -> InquiryException.memberNotFound());

            // 6. DTO 변환
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

            return InquiryCommentDto.builder()
                    .commentId(savedComment.getId())
                    .memberId(inquiry.getMemberId())
                    .memberNickname(member.getNickname())
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
     * 문의 종료 (CLOSED로 변경)
     */
    @Transactional
    public void closeInquiry(Integer inquiryId, Integer memberId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> InquiryException.inquiryNotFound());

        // 본인 문의인지 확인
        if (!inquiry.getMemberId().equals(memberId)) {
            throw InquiryException.inquiryAccessDenied();
        }

        // 이미 종료된 문의인지 확인
        if (inquiry.getStatus() == InquiryStatus.CLOSED) {
            throw InquiryException.inquiryAlreadyClosed();
        }

        Inquiry updatedInquiry = Inquiry.builder()
                .id(inquiry.getId())
                .memberId(inquiry.getMemberId())
                .category(inquiry.getCategory())  // ✅ 추가
                .title(inquiry.getTitle())
                .content(inquiry.getContent())
                .status(InquiryStatus.CLOSED)
                .createdAt(inquiry.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();

        inquiryRepository.save(updatedInquiry);

        log.info("문의 종료 - inquiryId: {}, memberId: {}", inquiryId, memberId);
    }

    /**
     * 문의 첨부파일 업로드
     */
    private List<InquiryFile> uploadInquiryFiles(Integer inquiryId, List<MultipartFile> files) throws IOException {
        return files.stream()
                .map(file -> {
                    try {
                        String fileUrl = s3Service.upload(file, "inquiry/files");

                        InquiryFile inquiryFile = InquiryFile.builder()
                                .inquiryId(inquiryId)
                                .storedFileUrl(fileUrl)
                                .originalFileName(file.getOriginalFilename())
                                .fileType(file.getContentType())
                                .fileSize((int) file.getSize())
                                .uploadedAt(LocalDateTime.now())
                                .build();

                        return inquiryFileRepository.save(inquiryFile);
                    } catch (IOException e) {
                        throw new RuntimeException("파일 업로드 실패", e);
                    }
                })
                .collect(Collectors.toList());
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
}