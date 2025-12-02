package com.s401.moas.admin.inquiry.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.inquiry.service.dto.FileDto;
import com.s401.moas.admin.inquiry.service.dto.InquiryCommentDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 댓글 작성 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateInquiryCommentResponse {
    private Long commentId;
    private String content;
    private FileItem file;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileItem {
        private Long fileId;
        private String originalFileName;
        private String storedFileUrl;
        private String fileType;
        private Integer fileSize;

        public static FileItem from(FileDto dto) {
            return FileItem.builder()
                    .fileId(dto.getFileId())
                    .originalFileName(dto.getOriginalFileName())
                    .storedFileUrl(dto.getStoredFileUrl())
                    .fileType(dto.getFileType())
                    .fileSize(dto.getFileSize())
                    .build();
        }
    }

    public static CreateInquiryCommentResponse from(InquiryCommentDto dto) {
        FileItem fileItem = null;
        if (dto.getFile() != null) {
            fileItem = FileItem.from(dto.getFile());
        }

        return CreateInquiryCommentResponse.builder()
                .commentId(dto.getCommentId())
                .content(dto.getContent())
                .file(fileItem)
                .createdAt(dto.getCreatedAt())
                .build();
    }
}