package com.s401.moas.portfolio.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 포트폴리오 수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePortfolioRequest {

    @NotNull(message = "포지션 ID는 필수입니다.")
    private Integer positionId;

    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 100, message = "제목은 100자 이하여야 합니다.")
    private String title;

    @Size(max = 10000, message = "설명은 10,000자 이하여야 합니다.")
    private String description;

    // 썸네일 (둘 중 하나만 사용)
    private MultipartFile thumbnailImage;  // 새 썸네일
    private String thumbnailUrl;           // 기존 썸네일 URL

    // 이미지
    private String imageSequence;          // "prev:123,new:0,prev:125,new:1"
    private List<MultipartFile> newImages; // 새로 추가할 이미지들

    // 파일
    private String fileSequence;           // "prev:50,new:0"
    private List<MultipartFile> newFiles;  // 새로 추가할 파일들
}