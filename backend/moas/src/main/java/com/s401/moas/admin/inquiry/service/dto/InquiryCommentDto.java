package com.s401.moas.admin.inquiry.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 문의 댓글 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryCommentDto {
    private Long commentId;
    private Integer memberId;
    private String memberNickname;
    private Integer adminId;
    private String adminName;
    private String content;
    private FileDto file;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}