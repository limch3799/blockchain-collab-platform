package com.s401.moas.project.controller.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 프로젝트 설명 생성 응답 DTO
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateDescriptionResponse {

    /**
     * 전체 설명 본문 (마크다운 형식 허용)
     */
    private String description;
}

