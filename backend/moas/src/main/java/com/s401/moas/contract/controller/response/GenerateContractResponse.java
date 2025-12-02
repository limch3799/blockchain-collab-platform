package com.s401.moas.contract.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor // Jackson 역직렬화를 위함
@AllArgsConstructor // Builder와 toBuilder를 위함
@Builder(toBuilder = true) // toBuilder=true 추가
public class GenerateContractResponse {
    private String title;
    private String description;
    private Long totalAmount;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endAt;
}