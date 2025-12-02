package com.s401.moas.admin.inquiry.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 파일 정보 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileDto {
    private Long fileId;
    private String originalFileName;
    private String storedFileUrl;
    private String fileType;
    private Integer fileSize;
}