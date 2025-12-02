package com.s401.moas.review.controller.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateReviewRequest {
    
    @NotNull(message = "계약 ID는 필수입니다.")
    private Long contractId;
    
    @NotNull(message = "리뷰 대상 회원 ID는 필수입니다.")
    private Integer revieweeMemberId;
    
    @NotNull(message = "평점은 필수입니다.")
    @Min(value = 1, message = "평점은 1 이상이어야 합니다.")
    @Max(value = 5, message = "평점은 5 이하여야 합니다.")
    private Byte rating;
    
    @Size(max = 500, message = "리뷰 내용은 500자 이하여야 합니다.")
    private String comment;
}

