package com.s401.moas.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestBody;

import com.s401.moas.auth.controller.request.LoginRequest;
import com.s401.moas.auth.controller.response.LoginResponse;
import com.s401.moas.auth.controller.response.RefreshResponse;
import com.s401.moas.global.exception.ErrorResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Tag(name = "Auth", description = "인증 관리 API")
public interface AuthControllerSpec {

    @Operation(operationId = "01-login", summary = "로그인", description = "Web3Auth idToken을 이용하여 로그인합니다. " +
            "신규 사용자인 경우 자동으로 회원가입이 진행됩니다. " +
            "로그인 성공 시 Access Token과 Refresh Token(쿠키)이 발급됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그인 성공", content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 실패 (idToken 형식 오류, 서명 검증 실패 또는 만료) - errorCode: UNAUTHORIZED", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "404", description = "탈퇴한 회원 로그인 시도 - errorCode: NOT_FOUND", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response);

    @Operation(operationId = "02-refresh", summary = "Access Token 갱신", description = "Refresh Token을 이용하여 새로운 Access Token을 발급받습니다. "
            +
            "Refresh Token은 HttpOnly 쿠키로 전송됩니다. " +
            "Refresh Token 회전 정책이 적용되어 매번 새로운 Refresh Token이 발급됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "토큰 갱신 성공", content = @Content(schema = @Schema(implementation = RefreshResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 실패 (Refresh Token 쿠키 없음, 만료, 유효하지 않음, 세션 차단) - errorCode: UNAUTHORIZED", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "404", description = "회원을 찾을 수 없음 - errorCode: NOT_FOUND", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "409", description = "Refresh Token 재사용 감지 - errorCode: CONFLICT", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"CONFLICT\",\"message\":\"세션이 만료되었습니다. 다시 로그인해 주세요.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<RefreshResponse> refresh(
            @CookieValue(value = "rt", required = false) String refreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse);

    @Operation(operationId = "03-logout", summary = "로그아웃", description = "현재 세션을 종료하고 Refresh Token을 무효화합니다. " +
            "Access Token과 Refresh Token 모두 무효화되며, " +
            "Refresh Token 쿠키가 삭제됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그아웃 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패 (Authorization 헤더 없음, 형식 오류, Access Token 만료 또는 유효하지 않음) - errorCode: UNAUTHORIZED", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<Void> logout(
            @CookieValue(value = "rt", required = false) String refreshToken,
            HttpServletRequest request,
            HttpServletResponse response);
}
