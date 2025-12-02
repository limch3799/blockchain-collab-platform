package com.s401.moas.admin.inquiry.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 문의 답변 첨부파일 엔티티
 */
@Entity
@Table(name = "inquiry_comment_file")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryCommentFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "inquiry_comment_id", nullable = false)
    private Long inquiryCommentId;

    @Column(name = "stored_file_url", nullable = false, length = 512)
    private String storedFileUrl;

    @Column(name = "original_file_name", nullable = false, length = 100)
    private String originalFileName;

    @Column(name = "file_type", nullable = false, length = 100)
    private String fileType;

    @Column(name = "file_size", nullable = false)
    private Integer fileSize;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
}
