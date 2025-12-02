package com.s401.moas.global.util;

import lombok.Builder;
import lombok.Value;
import org.springframework.data.domain.Page;

/**
 * Spring Data Page 객체에서 공통 페이지 정보를 추출하기 위한 DTO
 */
@Value
@Builder
public class PageInfo {
    int page;
    int size;
    long totalElements;
    int totalPages;

    public static PageInfo from(Page<?> springPage) {
        return PageInfo.builder()
                .page(springPage.getNumber())
                .size(springPage.getSize())
                .totalElements(springPage.getTotalElements())
                .totalPages(springPage.getTotalPages())
                .build();
    }
}