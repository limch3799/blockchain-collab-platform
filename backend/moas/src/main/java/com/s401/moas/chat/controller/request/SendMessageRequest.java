package com.s401.moas.chat.controller.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "채팅 메시지 전송 요청")
public class SendMessageRequest {

    @Size(max = 500, message = "메시지는 최대 500자까지 입력 가능합니다.")
    @Schema(description = "메시지 내용 (파일만 전송 시 null 가능)", example = "안녕하세요, 프로젝트 관련 문의드립니다.", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private String content;

    @Schema(description = "첨부 파일 목록 (내용만 전송 시 null 가능)", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private List<MultipartFile> files;
}