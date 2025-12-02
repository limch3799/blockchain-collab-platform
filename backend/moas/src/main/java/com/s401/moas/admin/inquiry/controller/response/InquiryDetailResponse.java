package com.s401.moas.admin.inquiry.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.inquiry.domain.InquiryCategory;
import com.s401.moas.admin.inquiry.domain.InquiryStatus;
import com.s401.moas.admin.inquiry.service.dto.FileDto;
import com.s401.moas.admin.inquiry.service.dto.InquiryCommentDto;
import com.s401.moas.admin.inquiry.service.dto.InquiryDetailDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@Schema(description = "문의 상세 응답")
public class InquiryDetailResponse {

    @Schema(description = "문의 ID", example = "1")
    private Integer inquiryId;

    @Schema(description = "회원 ID", example = "123")
    private Integer memberId;

    @Schema(description = "회원 닉네임", example = "홍길동")
    private String memberNickname;

    @Schema(description = "문의 유형", example = "계약관리")
    private InquiryCategory category;

    @Schema(description = "제목", example = "계약 취소 문의")
    private String title;

    @Schema(description = "내용", example = "계약을 취소하고 싶습니다.")
    private String content;

    @Schema(description = "문의 상태", example = "PENDING")
    private InquiryStatus status;

    @Schema(description = "첨부파일 목록")
    private List<FileResponse> files;

    @Schema(description = "댓글 목록")
    private List<CommentResponse> comments;

    @Schema(description = "생성일시", example = "2024-11-15T10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Schema(description = "수정일시", example = "2024-11-15T15:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    @Getter
    @Builder
    @Schema(description = "파일 정보")
    public static class FileResponse {

        @Schema(description = "파일 ID", example = "1")
        private Long fileId;

        @Schema(description = "원본 파일명", example = "document.pdf")
        private String originalFileName;

        @Schema(description = "파일 URL", example = "https://s3.amazonaws.com/...")
        private String storedFileUrl;

        @Schema(description = "파일 타입", example = "application/pdf")
        private String fileType;

        @Schema(description = "파일 크기 (bytes)", example = "1024")
        private Integer fileSize;
    }

    @Getter
    @Builder
    @Schema(description = "댓글 정보")
    public static class CommentResponse {

        @Schema(description = "댓글 ID", example = "1")
        private Long commentId;

        @Schema(description = "회원 ID (회원 댓글인 경우)", example = "123")
        private Integer memberId;

        @Schema(description = "회원 닉네임 (회원 댓글인 경우)", example = "홍길동")
        private String memberNickname;

        @Schema(description = "관리자 ID (관리자 댓글인 경우)", example = "1")
        private Integer adminId;

        @Schema(description = "관리자 이름 (관리자 댓글인 경우)", example = "관리자")
        private String adminName;

        @Schema(description = "댓글 내용", example = "답변드립니다.")
        private String content;

        @Schema(description = "첨부파일")
        private FileResponse file;

        @Schema(description = "생성일시", example = "2024-11-15T10:00:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        @Schema(description = "수정일시", example = "2024-11-15T15:30:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime updatedAt;
    }

    public static InquiryDetailResponse from(InquiryDetailDto dto) {
        List<FileResponse> files = dto.getFiles().stream()
                .map(file -> FileResponse.builder()
                        .fileId(file.getFileId())
                        .originalFileName(file.getOriginalFileName())
                        .storedFileUrl(file.getStoredFileUrl())
                        .fileType(file.getFileType())
                        .fileSize(file.getFileSize())
                        .build())
                .collect(Collectors.toList());

        List<CommentResponse> comments = dto.getComments().stream()
                .map(comment -> {
                    FileResponse fileResponse = null;
                    if (comment.getFile() != null) {
                        FileDto fileDto = comment.getFile();
                        fileResponse = FileResponse.builder()
                                .fileId(fileDto.getFileId())
                                .originalFileName(fileDto.getOriginalFileName())
                                .storedFileUrl(fileDto.getStoredFileUrl())
                                .fileType(fileDto.getFileType())
                                .fileSize(fileDto.getFileSize())
                                .build();
                    }

                    return CommentResponse.builder()
                            .commentId(comment.getCommentId())
                            .memberId(comment.getMemberId())
                            .memberNickname(comment.getMemberNickname())
                            .adminId(comment.getAdminId())
                            .adminName(comment.getAdminName())
                            .content(comment.getContent())
                            .file(fileResponse)
                            .createdAt(comment.getCreatedAt())
                            .updatedAt(comment.getUpdatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        return InquiryDetailResponse.builder()
                .inquiryId(dto.getInquiryId())
                .memberId(dto.getMemberId())
                .memberNickname(dto.getMemberNickname())
                .category(dto.getCategory())
                .title(dto.getTitle())
                .content(dto.getContent())
                .status(dto.getStatus())
                .files(files)
                .comments(comments)
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
}