package com.s401.moas.admin.inquiry.controller.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 댓글 작성 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateInquiryCommentRequest {

    @NotBlank(message = "내용은 필수입니다")
    private String content;

    private List<MultipartFile> files;
}