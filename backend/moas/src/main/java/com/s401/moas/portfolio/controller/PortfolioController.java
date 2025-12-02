package com.s401.moas.portfolio.controller;

import com.s401.moas.global.security.SecurityUtil;
import com.s401.moas.portfolio.controller.request.CreatePortfolioRequest;
import com.s401.moas.portfolio.controller.request.UpdatePortfolioRequest;
import com.s401.moas.portfolio.controller.response.*;
import com.s401.moas.portfolio.service.dto.PortfolioDetailDto;
import com.s401.moas.portfolio.service.dto.PortfolioDto;
import com.s401.moas.portfolio.service.PortfolioService;
import com.s401.moas.portfolio.service.dto.PortfolioListDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/portfolios")
@RequiredArgsConstructor
public class PortfolioController implements PortfolioControllerSpec {

    private final PortfolioService portfolioService;

    @Override
    @PostMapping
    public ResponseEntity<CreatePortfolioResponse> createPortfolio(
            @Valid @ModelAttribute CreatePortfolioRequest request) {
        log.info("포트폴리오 등록 요청 - 제목: {}, 포지션ID: {}", request.getTitle(), request.getPositionId());

        Integer memberId = SecurityUtil.getCurrentMemberId();

        PortfolioDto dto = portfolioService.createPortfolio(request, memberId);
        CreatePortfolioResponse response = CreatePortfolioResponse.from(dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @Override
    @DeleteMapping("/{portfolioId}")
    public ResponseEntity<DeletePortfolioResponse> deletePortfolio(
            @PathVariable Long portfolioId) {
        log.info("포트폴리오 삭제 요청 - ID: {}", portfolioId);

        Integer memberId = SecurityUtil.getCurrentMemberId();

        LocalDateTime deletedAt = portfolioService.deletePortfolio(portfolioId, memberId);

        DeletePortfolioResponse response = DeletePortfolioResponse.builder()
                .portfolioId(portfolioId)
                .deletedAt(deletedAt)
                .build();

        return ResponseEntity.ok(response);
    }

    @Override
    @PutMapping("/{portfolioId}")
    public ResponseEntity<UpdatePortfolioResponse> updatePortfolio(
            @PathVariable Long portfolioId,
            @Valid @ModelAttribute UpdatePortfolioRequest request) {
        log.info("포트폴리오 수정 요청 - ID: {}, 제목: {}", portfolioId, request.getTitle());

        Integer memberId = SecurityUtil.getCurrentMemberId();

        PortfolioDto dto = portfolioService.updatePortfolio(portfolioId, request, memberId);

        UpdatePortfolioResponse response = UpdatePortfolioResponse.builder()
                .portfolioId(dto.getPortfolioId())
                .title(dto.getTitle())
                .thumbnailImageUrl(dto.getThumbnailImageUrl())
                .imageCount(dto.getImageCount())
                .fileCount(dto.getFileCount())
                .createdAt(dto.getCreatedAt())
                .build();

        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/me")
    public ResponseEntity<GetMyPortfoliosResponse> getMyPortfolios() {
        log.info("내 포트폴리오 목록 조회 요청");

        Integer memberId = SecurityUtil.getCurrentMemberId();

        List<PortfolioListDto> portfolioList = portfolioService.getMyPortfolios(memberId);
        GetMyPortfoliosResponse response = GetMyPortfoliosResponse.from(portfolioList);

        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/{portfolioId}")
    public ResponseEntity<GetPortfolioDetailResponse> getPortfolioDetail(
            @PathVariable Long portfolioId) {
        log.info("포트폴리오 상세 조회 요청 - ID: {}", portfolioId);

        PortfolioDetailDto dto = portfolioService.getPortfolioDetail(portfolioId);
        GetPortfolioDetailResponse response = GetPortfolioDetailResponse.from(dto);

        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/me/position")
    public ResponseEntity<GetMyPortfolioByPositionResponse> getMyPortfolioByPosition(
            @RequestParam(required = true) Integer positionId) {
        log.info("특정 포지션의 내 포트폴리오 조회 요청 - positionId: {}", positionId);

        Integer memberId = SecurityUtil.getCurrentMemberId();

        PortfolioListDto dto = portfolioService.getMyPortfolioByPosition(memberId, positionId);
        GetMyPortfolioByPositionResponse response = GetMyPortfolioByPositionResponse.from(dto);

        return ResponseEntity.ok(response);
    }
}