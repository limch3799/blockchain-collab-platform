package com.s401.moas.member.controller.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

/**
 * 프로필 수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class UpdateMemberProfileRequest {

    @Size(min = 2, max = 50, message = "닉네임은 2~50자여야 합니다.")
    private String nickname;

    @Size(max = 200, message = "자기소개는 200자 이하여야 합니다.")
    private String biography;

    @Size(max = 20, message = "전화번호는 20자 이하여야 합니다.")
    private String phoneNumber;

    private MultipartFile profileImage;
}
