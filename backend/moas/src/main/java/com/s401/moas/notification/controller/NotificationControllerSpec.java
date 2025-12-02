package com.s401.moas.notification.controller;

import com.s401.moas.global.exception.ErrorResponse;
import com.s401.moas.notification.controller.request.GetNotificationsRequest;
import com.s401.moas.notification.controller.response.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(name = "Notification", description = "알림 관리 API")
public interface NotificationControllerSpec {

    @Operation(
            operationId = "1-getNotifications",
            summary = "알림 목록 조회",
            description = "내 알림 목록을 최신순으로 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "알림 목록 조회 성공",
                    content = @Content(schema = @Schema(implementation = NotificationListResponse.class))
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
    ResponseEntity<NotificationListResponse> getNotifications(
            @Valid @ModelAttribute GetNotificationsRequest request
    );

    @Operation(
            operationId = "2-markAsRead",
            summary = "알림 읽음 처리",
            description = "특정 알림을 읽음 상태로 변경합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "알림 읽음 처리 성공",
                    content = @Content(schema = @Schema(implementation = MarkAsReadResponse.class))
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
                    description = "알림을 찾을 수 없음 - errorCode: NOT_FOUND",
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
    ResponseEntity<MarkAsReadResponse> markAsRead(@PathVariable Long notificationId);

    @Operation(
            operationId = "3-markAllAsRead",
            summary = "전체 알림 읽음 처리",
            description = "내 모든 알림을 읽음 상태로 변경합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "전체 알림 읽음 처리 성공",
                    content = @Content(schema = @Schema(implementation = MarkAllAsReadResponse.class))
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
    ResponseEntity<MarkAllAsReadResponse> markAllAsRead();

}