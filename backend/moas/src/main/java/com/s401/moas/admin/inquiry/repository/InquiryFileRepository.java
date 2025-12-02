package com.s401.moas.admin.inquiry.repository;

import com.s401.moas.admin.inquiry.domain.InquiryFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryFileRepository extends JpaRepository<InquiryFile, Long> {

    /**
     * 문의의 첨부파일 목록 조회
     */
    List<InquiryFile> findByInquiryId(Integer inquiryId);
}
