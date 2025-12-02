package com.s401.moas.admin.inquiry.repository.projection;

/**
 * 회원별 문의 개수 Projection
 */
public interface MemberInquiryCountProjection {
    Integer getMemberId();
    Long getCount();
}