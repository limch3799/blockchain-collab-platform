package com.s401.moas.project.controller.request;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.s401.moas.global.validation.DateRange;
import com.s401.moas.global.validation.ValidDateRange;

/**
 * 프로젝트 수정 요청 DTO
 * 부분 업데이트 지원: 전달된 필드만 수정
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ValidDateRange
public class UpdateProjectRequest implements DateRange {

    @Size(max = 30, message = "제목은 30자 이하여야 합니다.")
    private String title;

    @Size(max = 100, message = "요약은 100자 이하여야 합니다.")
    private String summary;

    private String description; // TEXT

    @Size(max = 10, message = "지역 코드는 10자 이하여야 합니다.")
    private String districtCode; // district.code (province는 서버가 유도)

    @Size(max = 512, message = "썸네일 URL은 512자 이하여야 합니다.")
    @Pattern(regexp = "^https?://.*", message = "썸네일 URL은 http 또는 https로 시작해야 합니다.")
    private String thumbnailUrl;

    private LocalDateTime applyDeadline;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private MultipartFile thumbnail; // 새 썸네일 파일 (thumbnailUrl과 둘 중 하나만 사용)

    // positions를 보내면 "전체 교체(Replace All)" 규칙으로 처리 (없으면 현 상태 유지)
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

        @NotNull(message = "인원수는 필수입니다.")
        @Min(value = 1, message = "인원수는 1 이상이어야 합니다.")
        private Integer headcount;
    }
}

