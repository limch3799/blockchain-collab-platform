package com.s401.moas.admin.inquiry.repository.projection;

import com.s401.moas.admin.inquiry.domain.InquiryCategory;
import com.s401.moas.admin.inquiry.domain.InquiryStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 카테고리별 상태별 문의 개수 Projection
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class InquiryCategoryStatusCount {
    private InquiryCategory category;
    private InquiryStatus status;
    private Long count;
}