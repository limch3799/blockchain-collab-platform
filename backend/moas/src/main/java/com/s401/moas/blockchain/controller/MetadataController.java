package com.s401.moas.blockchain.controller;

import com.s401.moas.blockchain.domain.NftMetadata;
import com.s401.moas.blockchain.service.MetadataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/metadata")
@RequiredArgsConstructor
public class MetadataController {

    private final MetadataService metadataService;

    /**
     * NFT 메타데이터를 반환하는 API 엔드포인트입니다.
     * OpenSea, Etherscan 등 외부 서비스가 이 URL을 호출하여 NFT 정보를 가져갑니다.
     *
     * @param tokenId 조회할 NFT의 토큰 ID (우리 시스템의 contract.id와 동일)
     * @return 표준 NFT 메타데이터 형식의 JSON
     */
    @Operation(summary = "NFT 메타데이터 조회",
            description = "토큰 ID에 해당하는 NFT의 표준 메타데이터를 JSON 형식으로 반환합니다. 이 API는 OpenSea 등 외부 마켓플레이스에서 호출됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "메타데이터 조회 성공"),
            @ApiResponse(responseCode = "404", description = "해당 토큰 ID의 NFT(계약)를 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping(value = "/{tokenId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<NftMetadata> getMetadata(@PathVariable Long tokenId) {
        // MetadataService를 호출하여 동적으로 메타데이터를 생성합니다.
        NftMetadata metadata = metadataService.generateMetadata(tokenId);
        // 생성된 메타데이터를 HTTP 응답 본문에 담아 반환합니다.
        return ResponseEntity.ok(metadata);
    }
}
