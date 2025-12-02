package com.s401.moas.global.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.http.fileupload.InvalidFileNameException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${spring.cloud.aws.region.static}")
    private String region;

    /**
     * 파일 업로드
     * @param file 업로드할 파일
     * @param dirName 저장할 디렉토리명 (예: "portfolio/thumbnails", "portfolio/images")
     * @return 업로드된 파일의 URL
     */
    public String upload(MultipartFile file, String dirName) throws IOException {
        String originalFileName = file.getOriginalFilename();

        if (originalFileName != null && originalFileName.contains("..")) {
            throw new InvalidFileNameException(originalFileName, "원본 파일명에 유효하지 않은 경로 문자가 포함되어 있습니다.");
        }

        // 파일명에서 공백 제거 또는 언더스코어로 변경s
        String sanitizedFileName = originalFileName.replaceAll("\\s+", "_");

        String fileName = dirName + "/" + UUID.randomUUID() + "_" + sanitizedFileName;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(fileName)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // URL 생성 시 파일명을 URL 인코딩
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");  // '+' 를 공백(%20)으로 변경

        String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, encodedFileName);
        log.info("S3 파일 업로드 완료: {}", fileUrl);

        return fileUrl;
    }


    /**
     * 파일 삭제
     * @param fileUrl 삭제할 파일의 URL
     */
    public void delete(String fileUrl) {
        try {
            String fileName = extractFileNameFromUrl(fileUrl);

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(fileName)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("S3 파일 삭제 완료: {}", fileName);
        } catch (Exception e) {
            log.error("S3 파일 삭제 실패: {}", fileUrl, e);
        }
    }

    /**
     * 지정된 파일명으로 파일을 업로드합니다. (덮어쓰기)
     * @param file 업로드할 파일
     * @param fileName S3에 저장될 전체 경로 포함 파일명 (예: "nft-images/123_active.png")
     * @return 업로드된 파일의 URL
     */
    public String uploadWithCustomName(MultipartFile file, String fileName) throws IOException {
        // Path Traversal 공격 방지
        if (fileName.contains("..")) {
            throw new InvalidFileNameException(fileName, "파일명에 유효하지 않은 경로 문자가 포함되어 있습니다.");
        }

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(fileName)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, fileName);

        log.info("S3 파일 업로드 완료 (커스텀 이름): {}", fileUrl);
        return fileUrl;
    }


    /**
     * URL에서 파일명 추출
     */
    private String extractFileNameFromUrl(String fileUrl) {
        try {
            // URL 디코딩을 통해 원래 파일명 추출
            String encoded = fileUrl.substring(fileUrl.indexOf(bucket) + bucket.length() + 1);
            return java.net.URLDecoder.decode(encoded, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("파일명 추출 실패: {}", fileUrl, e);
            return fileUrl.substring(fileUrl.indexOf(bucket) + bucket.length() + 1);
        }
    }
}