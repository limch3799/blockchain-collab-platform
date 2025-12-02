package com.s401.moas.admin.inquiry.repository;

import com.s401.moas.admin.inquiry.domain.InquiryCommentFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryCommentFileRepository extends JpaRepository<InquiryCommentFile, Long> {

    /**
     * 댓글의 첨부파일 목록 조회
     */
    List<InquiryCommentFile> findByInquiryCommentId(Long inquiryCommentId);
}
