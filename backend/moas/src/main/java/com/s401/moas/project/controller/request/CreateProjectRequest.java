package com.s401.moas.project.controller.request;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.s401.moas.global.validation.DateRange;
import com.s401.moas.global.validation.ValidDateRange;

/**
 * 프로젝트 등록 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ValidDateRange
public class CreateProjectRequest implements DateRange {

    @Size(max = 10, message = "지역 코드는 10자 이하여야 합니다.")
    private String districtCode; // null 또는 공백이면 온라인 프로젝트

    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 30, message = "제목은 30자 이하여야 합니다.")
    private String title;

    @Size(max = 10000, message = "상세 설명은 10,000자 이하여야 합니다.")
    private String description;

    @Size(max = 100, message = "요약은 100자 이하여야 합니다.")
    private String summary;

    @NotNull(message = "프로젝트 시작일은 필수입니다.")
    private LocalDateTime startAt;

    @NotNull(message = "프로젝트 종료일은 필수입니다.")
    private LocalDateTime endAt;

    @NotNull(message = "지원 마감일은 필수입니다.")
    private LocalDateTime applyDeadline;

    private MultipartFile thumbnail;

    @NotEmpty(message = "포지션 정보는 최소 1개 이상 필요합니다.")
    @Valid
    private List<PositionRequest> positions;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PositionRequest {
        @NotNull(message = "포지션 ID는 필수입니다.")
        private Integer positionId;

        @NotNull(message = "예산은 필수입니다.")
        @Min(value = 1000, message = "예산은 1,000 이상이어야 합니다.")
        private Long budget;
    }
}
