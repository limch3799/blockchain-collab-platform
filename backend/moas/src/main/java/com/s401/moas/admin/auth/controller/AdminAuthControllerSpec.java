package com.s401.moas.admin.auth.controller;

import com.s401.moas.admin.auth.controller.request.AdminLoginRequest;
import com.s401.moas.admin.auth.controller.request.AdminRefreshRequest;
import com.s401.moas.admin.auth.controller.request.AdminSignupRequest;
import com.s401.moas.admin.auth.controller.response.AdminLoginResponse;
import com.s401.moas.admin.auth.controller.response.AdminSignupResponse;
import com.s401.moas.admin.auth.controller.response.AdminTokenResponse;
import com.s401.moas.global.exception.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@Tag(name = "Admin Auth", description = "관리자 인증 API")
public interface AdminAuthControllerSpec {

    @Operation(
            operationId = "01-admin-signup",
            summary = "관리자 회원가입",
            description = "새로운 관리자 계정을 생성합니다. " +
                    "로그인 ID는 4-20자의 영문, 숫자, _, - 만 사용 가능하며, " +
                    "비밀번호는 8-20자로 영문, 숫자, 특수문자를 포함해야 합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "회원가입 성공",
                    content = @Content(schema = @Schema(implementation = AdminSignupResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (유효성 검증 실패) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"잘못된 파라미터입니다.\",\"timestamp\":1762067112276}")
                    )
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "로그인 ID 중복 - errorCode: ADMIN_LOGIN_ID_DUPLICATED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"ADMIN_LOGIN_ID_DUPLICATED\",\"message\":\"이미 사용 중인 로그인 ID입니다.\",\"timestamp\":1762067112276}")
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")
                    )
            )
    })
    ResponseEntity<AdminSignupResponse> signup(@Valid @RequestBody AdminSignupRequest request);

    @Operation(
            operationId = "02-admin-login",
            summary = "관리자 로그인",
            description = "ID/PW 기반 관리자 로그인을 수행합니다. " +
                    "로그인 성공 시 Access Token과 Refresh Token이 발급됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "로그인 성공",
                    content = @Content(schema = @Schema(implementation = AdminLoginResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증 실패 (비밀번호 불일치) - errorCode: INVALID_PASSWORD",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"INVALID_PASSWORD\",\"message\":\"비밀번호가 일치하지 않습니다.\",\"timestamp\":1762067112276}")
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "삭제된 관리자 계정 - errorCode: ADMIN_DELETED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"ADMIN_DELETED\",\"message\":\"삭제된 관리자 계정입니다.\",\"timestamp\":1762067112276}")
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "존재하지 않는 관리자 - errorCode: ADMIN_NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"ADMIN_NOT_FOUND\",\"message\":\"존재하지 않는 관리자입니다.\",\"timestamp\":1762067112276}")
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")
                    )
            )
    })
    ResponseEntity<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest request);

    @Operation(
            operationId = "03-admin-refresh",
            summary = "관리자 Access Token 갱신",
            description = "Refresh Token을 이용하여 새로운 Access Token을 발급받습니다. " +
                    "Refresh Token 회전 정책이 적용되어 매번 새로운 Refresh Token이 발급됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "토큰 갱신 성공",
                    content = @Content(schema = @Schema(implementation = AdminTokenResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증 실패 (Refresh Token 없음, 만료, 유효하지 않음) - errorCode: ADMIN_REFRESH_TOKEN_NOT_FOUND 또는 ADMIN_REFRESH_TOKEN_INVALID",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"ADMIN_REFRESH_TOKEN_NOT_FOUND\",\"message\":\"Refresh Token이 존재하지 않습니다.\",\"timestamp\":1762067112276}")
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "삭제된 관리자 계정 - errorCode: ADMIN_DELETED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"ADMIN_DELETED\",\"message\":\"삭제된 관리자 계정입니다.\",\"timestamp\":1762067112276}")
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "존재하지 않는 관리자 - errorCode: ADMIN_NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"ADMIN_NOT_FOUND\",\"message\":\"존재하지 않는 관리자입니다.\",\"timestamp\":1762067112276}")
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")
                    )
            )
    })
    ResponseEntity<AdminTokenResponse> refresh(@Valid @RequestBody AdminRefreshRequest request);

    @Operation(
            operationId = "04-admin-logout",
            summary = "관리자 로그아웃",
            description = "현재 세션을 종료하고 Refresh Token을 무효화합니다. " +
                    "Access Token과 Refresh Token 모두 무효화됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "로그아웃 성공"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증 실패 (Authorization 헤더 없음, 형식 오류) - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}")
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "관리자 권한 없음 - errorCode: FORBIDDEN",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"FORBIDDEN\",\"message\":\"접근 권한이 없습니다.\",\"timestamp\":1762067112276}")
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")
                    )
            )
    })
    ResponseEntity<Void> logout(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody AdminRefreshRequest request
    );
}