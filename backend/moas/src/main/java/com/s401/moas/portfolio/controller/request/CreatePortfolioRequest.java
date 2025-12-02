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
 * 포트폴리오 생성 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePortfolioRequest {

    @NotNull(message = "포지션 ID는 필수입니다.")
    private Integer positionId;

    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 30, message = "제목은 30자 이하여야 합니다.")
    private String title;

    @Size(max = 10000, message = "설명은 10,000자 이하여야 합니다.")
    private String description;

    @NotNull(message = "썸네일 이미지는 필수입니다.")
    private MultipartFile thumbnailImage;

    private List<MultipartFile> images;

    private List<MultipartFile> files;
}
