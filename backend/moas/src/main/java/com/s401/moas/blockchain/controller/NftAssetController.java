package com.s401.moas.blockchain.controller;

import com.s401.moas.global.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/assets/nft")
@RequiredArgsConstructor
public class NftAssetController {

    private final S3Service s3Service;

    /**
     * Active, Completed, Canceled 상태의 NFT 이미지 3개를 한 번에 업로드합니다.
     * 프론트엔드는 form-data에 각 상태에 맞는 key로 파일을 담아 보내야 합니다.
     *
     * @param activeImage    'active' 상태의 이미지 파일 (key: "activeImage")
     * @param completedImage 'completed' 상태의 이미지 파일 (key: "completedImage")
     * @param canceledImage  'canceled' 상태의 이미지 파일 (key: "canceledImage")
     * @param contractId     이 이미지들이 속한 계약의 ID (key: "contractId")
     * @return 대표 이미지(active 버전)의 S3 URL
     */
    @PostMapping("/images/bundle")
    public ResponseEntity<Map<String, String>> uploadNftImageBundle(
            @RequestParam("activeImage") MultipartFile activeImage,
            @RequestParam("completedImage") MultipartFile completedImage,
            @RequestParam("canceledImage") MultipartFile canceledImage,
            @RequestParam("contractId") Long contractId
    ) {
        log.info("NFT 이미지 3종 번들 업로드 요청. contractId={}", contractId);

        try {
            // 각 상태별로 정해진 파일명으로 S3에 업로드
            String activeImagePath = String.format("nft-images/%d/%d_active.png", contractId, contractId);
            String completedImagePath = String.format("nft-images/%d/%d_completed.png", contractId, contractId);
            String canceledImagePath = String.format("nft-images/%d/%d_canceled.png", contractId, contractId);

            // 각 파일을 정해진 이름으로 S3에 업로드합니다.
            String activeImageUrl = s3Service.uploadWithCustomName(activeImage, activeImagePath);
            s3Service.uploadWithCustomName(completedImage, completedImagePath);
            s3Service.uploadWithCustomName(canceledImage, canceledImagePath);

            log.info("NFT 이미지 3종 번들 업로드 성공. 대표 URL: {}", activeImageUrl);
            // 모든 업로드가 성공하면, 대표 URL(active 버전)만 JSON으로 반환합니다.
            return ResponseEntity.ok(Map.of("imageUrl", activeImageUrl));
        } catch (IOException e) {
            log.error("NFT 이미지 번들 업로드 중 파일 처리 오류 발생. contractId={}", contractId, e);
            // 하나라도 실패하면 500 에러 응답
            return ResponseEntity.internalServerError().body(Map.of("error", "이미지 번들 업로드 중 오류가 발생했습니다."));
        }
    }
}
