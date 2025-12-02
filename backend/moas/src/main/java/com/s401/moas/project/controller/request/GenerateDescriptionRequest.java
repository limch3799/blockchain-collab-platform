package com.s401.moas.project.controller.request;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.s401.moas.global.validation.DateRange;
import com.s401.moas.global.validation.ValidDateRange;

/**
 * 프로젝트 설명 생성 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ValidDateRange
@JsonIgnoreProperties(ignoreUnknown = true)
public class GenerateDescriptionRequest implements DateRange {

    @NotBlank(message = "제목은 필수입니다.")
    @Size(min = 1, max = 30, message = "제목은 1자 이상 30자 이하여야 합니다.")
    @Pattern(regexp = ".*\\S.*", message = "제목은 공백만 입력할 수 없습니다.")
    private String title;

    @NotBlank(message = "요약은 필수입니다.")
    @Size(min = 1, max = 100, message = "요약은 1자 이상 100자 이하여야 합니다.")
    @Pattern(regexp = ".*\\S.*", message = "요약은 공백만 입력할 수 없습니다.")
    private String summary;

    @NotNull(message = "프로젝트 시작일은 필수입니다.")
    private LocalDateTime startAt;

    @NotNull(message = "프로젝트 종료일은 필수입니다.")
    private LocalDateTime endAt;

    @Size(max = 10, message = "지역 코드는 10자 이하여야 합니다.")
    private String districtCode; // null이면 온라인, 있으면 오프라인

    // 확장 필드 (선택)
    @Valid
    private List<PositionRequest> positions;

    @Size(max = 50, message = "카테고리는 50자 이하여야 합니다.")
    private String category;

    private LocalDateTime applyDeadline;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PositionRequest {
        @NotNull(message = "포지션 ID는 필수입니다.")
        private Integer positionId;

        @Min(value = 1000, message = "예산은 1,000 이상이어야 합니다.")
        private Long budget; // null 가능 (협의 가능)
    }
}

