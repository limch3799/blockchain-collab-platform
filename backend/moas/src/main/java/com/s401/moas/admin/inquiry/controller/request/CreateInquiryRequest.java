package com.s401.moas.admin.inquiry.controller.request;

import com.s401.moas.admin.inquiry.domain.InquiryCategory;
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
 * 문의 작성 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateInquiryRequest {

    @NotNull(message = "문의 유형은 필수입니다")  // ✅ 추가
    private InquiryCategory category;

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 최대 200자입니다")
    private String title;

    @NotBlank(message = "내용은 필수입니다")
    private String content;

    private List<MultipartFile> files;
}