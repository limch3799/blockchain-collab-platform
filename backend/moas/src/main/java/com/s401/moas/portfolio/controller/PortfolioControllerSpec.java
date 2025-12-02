package com.s401.moas.portfolio.controller;

import com.s401.moas.global.exception.ErrorResponse;
import com.s401.moas.portfolio.controller.request.CreatePortfolioRequest;
import com.s401.moas.portfolio.controller.request.UpdatePortfolioRequest;
import com.s401.moas.portfolio.controller.response.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Portfolio", description = "포트폴리오 관리 API")
public interface PortfolioControllerSpec {

    @Operation(
            operationId = "1-createPortfolio",
            summary = "포트폴리오 등록",
            description = "새로운 포트폴리오를 등록합니다. 파일 업로드를 포함할 수 있습니다.\n" +
                    "파일 첨부 등에 대한 원활한 테스트는 postman 사용을 추천합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "포트폴리오 등록 성공",
                    content = @Content(schema = @Schema(implementation = CreatePortfolioResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (유효성 검증 실패) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"잘못된 요청입니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<CreatePortfolioResponse> createPortfolio(
            @Valid @ModelAttribute CreatePortfolioRequest request
    );

    @Operation(
            operationId = "2-deletePortfolio",
            summary = "포트폴리오 삭제",
            description = "포트폴리오를 소프트 삭제합니다. 실제 데이터는 삭제되지 않고 deleted_at이 기록됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "포트폴리오 삭제 성공",
                    content = @Content(schema = @Schema(implementation = DeletePortfolioResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "삭제 권한 없음 - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"FORBIDDEN\",\"message\":\"접근 권한이 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "포트폴리오를 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<DeletePortfolioResponse> deletePortfolio(
            @PathVariable Long portfolioId
    );

    @Operation(
            operationId = "3-updatePortfolio",
            summary = "포트폴리오 수정",
            description = "기존 포트폴리오를 소프트 삭제하고 수정된 내용으로 새로운 포트폴리오를 생성합니다. 기존 이미지/파일은 재사용하고 새로운 것만 업로드합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "포트폴리오 수정 성공",
                    content = @Content(schema = @Schema(implementation = UpdatePortfolioResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (유효성 검증 실패, 잘못된 시퀀스 형식 등) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"잘못된 요청입니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "수정 권한 없음 - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"FORBIDDEN\",\"message\":\"접근 권한이 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "포트폴리오를 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 (파일 업로드 실패 등) - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<UpdatePortfolioResponse> updatePortfolio(
            @PathVariable Long portfolioId,
            @Valid @ModelAttribute UpdatePortfolioRequest request
    );

    @Operation(
            operationId = "4-getMyPortfolios",
            summary = "내 포트폴리오 목록 조회",
            description = "현재 로그인한 사용자의 포트폴리오 목록을 조회합니다. 삭제되지 않은 포트폴리오만 반환됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "포트폴리오 목록 조회 성공",
                    content = @Content(schema = @Schema(implementation = GetMyPortfoliosResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<GetMyPortfoliosResponse> getMyPortfolios();

    @Operation(
            operationId = "5-getPortfolioDetail",
            summary = "포트폴리오 상세 조회",
            description = "포트폴리오의 상세 정보를 조회합니다. 이미지 목록, 첨부파일 목록을 포함합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "포트폴리오 상세 조회 성공",
                    content = @Content(schema = @Schema(implementation = GetPortfolioDetailResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "포트폴리오를 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<GetPortfolioDetailResponse> getPortfolioDetail(
            @PathVariable Long portfolioId
    );

    @Operation(
            operationId = "6-getMyPortfolioByPosition",
            summary = "특정 포지션의 내 포트폴리오 조회",
            description = "현재 로그인한 사용자의 포트폴리오 중 특정 포지션에 해당하는 포트폴리오를 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "포트폴리오 조회 성공",
                    content = @Content(schema = @Schema(implementation = GetMyPortfolioByPositionResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (positionId 누락) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"잘못된 요청입니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "해당 포지션에 대한 포트폴리오가 없습니다. - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<GetMyPortfolioByPositionResponse> getMyPortfolioByPosition(
            @RequestParam(required = true) Integer positionId
    );
}