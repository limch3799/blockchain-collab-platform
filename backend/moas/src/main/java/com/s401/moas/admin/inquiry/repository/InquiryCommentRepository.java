package com.s401.moas.admin.inquiry.repository;

import com.s401.moas.admin.inquiry.domain.InquiryComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryCommentRepository extends JpaRepository<InquiryComment, Long> {

    /**
     * 문의에 달린 댓글 목록 조회 (작성순, 삭제되지 않은 것만)
     */
    List<InquiryComment> findByInquiryIdAndDeletedAtIsNullOrderByCreatedAtAsc(Integer inquiryId);

    /**
     * 문의에 달린 댓글 개수 조회 (삭제되지 않은 것만)
     */
    long countByInquiryIdAndDeletedAtIsNull(Integer inquiryId);

    /**
     * 문의에 관리자 댓글이 있는지 확인 (ANSWERED 판단용)
     */
    boolean existsByInquiryIdAndAdminIdIsNotNullAndDeletedAtIsNull(Integer inquiryId);
}
