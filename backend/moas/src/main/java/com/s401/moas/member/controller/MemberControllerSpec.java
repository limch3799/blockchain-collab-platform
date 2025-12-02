package com.s401.moas.member.controller;

import com.s401.moas.member.controller.response.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import com.s401.moas.global.exception.ErrorResponse;
import com.s401.moas.member.controller.request.CreateBankAccountRequest;
import com.s401.moas.member.controller.request.UpdateMemberRoleRequest;
import com.s401.moas.member.controller.response.DeleteMemberResponse;
import com.s401.moas.member.controller.response.BankAccountListResponse;
import com.s401.moas.member.controller.response.BankAccountResponse;
import com.s401.moas.member.controller.response.CreateBankAccountResponse;
import com.s401.moas.member.controller.response.MemberPublicProfileResponse;
import com.s401.moas.member.controller.response.NicknameExistsResponse;
import com.s401.moas.member.controller.response.ReviewListResponse;
import com.s401.moas.member.controller.response.UpdateMemberProfileResponse;
import com.s401.moas.member.controller.response.UpdateMemberRoleResponse;

import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Member", description = "회원 관리 API")
public interface MemberControllerSpec {

    @Operation(operationId = "4-getPublicProfile", summary = "공개 프로필 조회", description = "특정 회원의 공개 프로필을 조회합니다. " +
            "인증 없이도 접근 가능하며, PENDING 상태 회원은 404를 반환합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "공개 프로필 조회 성공", content = @Content(schema = @Schema(implementation = MemberPublicProfileResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 memberId 형식 (양수가 아님) - errorCode: BAD_REQUEST", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"요청이 올바르지 않습니다. 입력 값을 다시 확인해주세요.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "404", description = "회원을 찾을 수 없음 (PENDING 상태 또는 삭제된 회원) - errorCode: NOT_FOUND", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<MemberPublicProfileResponse> getPublicProfile(
            @PathVariable Integer memberId);

    @Operation(operationId = "5-checkNicknameExists", summary = "닉네임 중복 확인", description = "닉네임의 사용 가능 여부를 확인합니다. "
            +
            "인증 없이도 접근 가능하며, 닉네임 형식 오류 시 400을 반환합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "닉네임 중복 확인 완료", content = @Content(schema = @Schema(implementation = NicknameExistsResponse.class))),
            @ApiResponse(responseCode = "400", description = "닉네임 형식 오류 (2-50자 범위를 벗어남) - errorCode: BAD_REQUEST", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"요청이 올바르지 않습니다. 입력 값을 다시 확인해주세요.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<NicknameExistsResponse> checkNicknameExists(
            @RequestParam String nickname);

    @Operation(operationId = "2-updateProfile", summary = "프로필 수정", description = "현재 로그인한 회원의 프로필 정보를 수정합니다. " +
            "PATCH 요청에 맞게 null이 아닌 필드만 업데이트됩니다. " +
            "변경 가능한 필드: nickname, biography, phoneNumber, profileImageUrl. " +
            "닉네임은 2-50자여야 하며, 휴대폰 번호는 하이픈 포함 형식(예: 010-1234-5678)이어야 합니다. " +
            "인증이 필요하며, 본인만 수정할 수 있습니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "프로필 수정 성공", content = @Content(schema = @Schema(implementation = UpdateMemberProfileResponse.class))),
            @ApiResponse(responseCode = "400", description = "형식/길이/패턴 위반 - errorCode: BAD_REQUEST", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"요청이 올바르지 않습니다. 입력 값을 다시 확인해주세요.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "401", description = "액세스 토큰 없음/만료 - errorCode: UNAUTHORIZED", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "409", description = "닉네임 중복 - errorCode: CONFLICT", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"CONFLICT\",\"message\":\"이미 사용 중인 닉네임입니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류 - errorCode: INTERNAL_SERVER_ERROR", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<UpdateMemberProfileResponse> updateProfile(
            @RequestPart("data") String data,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) throws Exception;

    @Operation(operationId = "3-deleteMember", summary = "회원 탈퇴", description = "현재 로그인한 회원의 계정을 탈퇴 처리합니다. " +
            "Soft Delete 방식으로 실제 데이터는 삭제되지 않고 deletedAt 필드가 설정됩니다. " +
            "본인만 탈퇴할 수 있으며, 인증이 필요합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "회원 탈퇴 성공", content = @Content(schema = @Schema(implementation = DeleteMemberResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "404", description = "회원을 찾을 수 없음 - errorCode: NOT_FOUND", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "409", description = "탈퇴 제한 상태 (계약 진행중, 정산 미종료 등) - errorCode: CONFLICT", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"CONFLICT\",\"message\":\"현재 상태에서는 요청을 처리할 수 없습니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<DeleteMemberResponse> deleteMember();

    @Operation(operationId = "1-getMyProfile", summary = "마이페이지 조회", description = "인증된 사용자의 프로필 및 요약 정보를 반환합니다. " +
            "사용자의 역할(LEADER 또는 ARTIST)에 따라 다른 응답 구조를 반환합니다. " +
            "LEADER 역할의 경우 프로젝트 지원 정보를, ARTIST 역할의 경우 프로젝트 지원 및 관심 프로젝트 정보를 포함합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "마이페이지 조회 성공", content = @Content(mediaType = "application/json", examples = {
                    @ExampleObject(name = "LEADER 응답", value = "{\"profileImageUrl\":\"https://example.com/profile.jpg\",\"nickname\":\"리더닉네임\",\"biography\":\"자기소개\",\"appliedProjectCount\":5,\"inProgressProjectCount\":2,\"completedProjectCount\":3,\"inProgressProjectThumbnails\":[\"https://example.com/thumb1.jpg\"],\"interestedProjectThumbnails\":[\"https://example.com/thumb2.jpg\"]}", description = "LEADER 역할 사용자의 응답"),
                    @ExampleObject(name = "ARTIST 응답", value = "{\"profileImageUrl\":\"https://example.com/profile.jpg\",\"nickname\":\"아티스트닉네임\",\"biography\":\"자기소개\",\"appliedProjectCount\":10,\"inProgressProjectCount\":3,\"completedProjectCount\":7,\"inProgressProjectThumbnails\":[\"https://example.com/thumb1.jpg\"],\"interestedProjectThumbnails\":[\"https://example.com/thumb2.jpg\"]}", description = "ARTIST 역할 사용자의 응답")
            })),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "403", description = "권한 없음 (유효하지 않은 역할) - errorCode: FORBIDDEN", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"FORBIDDEN\",\"message\":\"권한이 없습니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "404", description = "회원을 찾을 수 없음 - errorCode: NOT_FOUND", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<?> getMyProfile();

    @Operation(operationId = "6-updateRole", summary = "회원 역할 변경", description = "PENDING 상태의 회원이 LEADER 또는 ARTIST 역할을 선택합니다. "
            +
            "PENDING 상태에서만 역할을 변경할 수 있으며, 한 번 설정된 역할은 변경할 수 없습니다. " +
            "인증이 필요하며, 본인만 변경할 수 있습니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "역할 변경 성공", content = @Content(schema = @Schema(implementation = UpdateMemberRoleResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (role이 null이거나 LEADER/ARTIST가 아님) - errorCode: BAD_REQUEST", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"요청이 올바르지 않습니다. 입력 값을 다시 확인해주세요.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "404", description = "회원을 찾을 수 없음 - errorCode: NOT_FOUND", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "409", description = "PENDING 상태가 아닌 경우 - errorCode: CONFLICT", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"CONFLICT\",\"message\":\"PENDING 상태에서만 역할을 변경할 수 있습니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<UpdateMemberRoleResponse> updateRole(
            @RequestBody UpdateMemberRoleRequest request);

    @Operation(operationId = "10-getMyBankAccounts", summary = "내 계좌 목록 조회", description = "인증된 사용자가 등록한 계좌 목록을 조회합니다. " +
            "삭제되지 않은 계좌만 조회되며, 각 계좌의 은행명, 예금주명, 계좌번호 뒤 4자리, 인증 상태 등의 정보가 포함됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "계좌 목록 조회 성공",
                    content = @Content(schema = @Schema(implementation = BankAccountListResponse.class),
                            examples = @ExampleObject(value = "{\n" +
                                    "  \"accounts\": [\n" +
                                    "    {\n" +
                                    "      \"accountId\": 12,\n" +
                                    "      \"bankCode\": \"088\",\n" +
                                    "      \"bankName\": \"신한\",\n" +
                                    "      \"accountHolderName\": \"홍길동\",\n" +
                                    "      \"accountLast4\": \"1234\",\n" +
                                    "      \"status\": \"VERIFIED\",\n" +
                                    "      \"verifiedAt\": \"2025-11-12T10:00:00\",\n" +
                                    "      \"createdAt\": \"2025-11-11T09:30:12\"\n" +
                                    "    },\n" +
                                    "    {\n" +
                                    "      \"accountId\": 13,\n" +
                                    "      \"bankCode\": \"004\",\n" +
                                    "      \"bankName\": \"KB국민\",\n" +
                                    "      \"accountHolderName\": \"홍길동\",\n" +
                                    "      \"accountLast4\": \"5678\",\n" +
                                    "      \"status\": \"PENDING\",\n" +
                                    "      \"verifiedAt\": null,\n" +
                                    "      \"createdAt\": \"2025-11-13T14:20:00\"\n" +
                                    "    }\n" +
                                    "  ]\n" +
                                    "}"))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<BankAccountListResponse> getMyBankAccounts();

    @Operation(operationId = "8-createBankAccount", summary = "계좌 등록", description = "인증된 사용자가 정산용 계좌를 등록합니다. " +
            "계좌번호는 AES-256-GCM 방식으로 암호화되어 저장되며, 등록 직후 상태는 PENDING 입니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "계좌 등록 성공",
                    content = @Content(schema = @Schema(implementation = CreateBankAccountResponse.class),
                            examples = @ExampleObject(value = "{\n" +
                                    "  \"accountId\": 12,\n" +
                                    "  \"bankCode\": \"088\",\n" +
                                    "  \"bankName\": \"신한\",\n" +
                                    "  \"accountHolderName\": \"홍길동\",\n" +
                                    "  \"accountLast4\": \"1234\",\n" +
                                    "  \"status\": \"PENDING\",\n" +
                                    "  \"createdAt\": \"2025-11-11T09:30:12\"\n" +
                                    "}"))),
            @ApiResponse(responseCode = "400", description = "요청 본문 누락 또는 검증 실패 - errorCode: BAD_REQUEST",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"요청 본문이 비어 있거나 형식이 올바르지 않습니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "400", description = "존재하지 않는 은행 코드 - errorCode: BAD_REQUEST",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"존재하지 않는 은행 코드입니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "409", description = "이미 활성 계좌가 존재함 - errorCode: CONFLICT",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"CONFLICT\",\"message\":\"이미 등록된 계좌가 있습니다. 계좌를 삭제한 후 다시 등록해주세요.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<CreateBankAccountResponse> createBankAccount(
            @Valid @RequestBody CreateBankAccountRequest request);

    @Operation(operationId = "11-verifyBankAccount", summary = "계좌 검증", description = "인증된 사용자가 자신의 계좌를 검증합니다. " +
            "PENDING 상태의 계좌를 VERIFIED 상태로 변경합니다. " +
            "실제로는 금융 API를 통해 검증해야 하지만, 현재는 요청 시 바로 검증 처리됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "계좌 검증 성공",
                    content = @Content(schema = @Schema(implementation = BankAccountResponse.class),
                            examples = @ExampleObject(value = "{\n" +
                                    "  \"accountId\": 12,\n" +
                                    "  \"bankCode\": \"088\",\n" +
                                    "  \"bankName\": \"신한\",\n" +
                                    "  \"accountHolderName\": \"홍길동\",\n" +
                                    "  \"accountLast4\": \"1234\",\n" +
                                    "  \"status\": \"VERIFIED\",\n" +
                                    "  \"verifiedAt\": \"2025-11-12T10:00:00\",\n" +
                                    "  \"createdAt\": \"2025-11-11T09:30:12\"\n" +
                                    "}"))),
            @ApiResponse(responseCode = "400", description = "검증할 수 없는 계좌 상태 (PENDING이 아님) - errorCode: BAD_REQUEST",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"PENDING 상태의 계좌만 검증할 수 있습니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "404", description = "계좌를 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"계좌를 찾을 수 없습니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<BankAccountResponse> verifyBankAccount(@PathVariable Long accountId);

    @Operation(operationId = "9-deleteBankAccount", summary = "계좌 삭제", description = "인증된 사용자가 자신의 정산 계좌를 삭제합니다. " +
            "Soft Delete 방식으로 deletedAt 필드가 설정됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "계좌 삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "404", description = "계좌를 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"계좌를 찾을 수 없습니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<Void> deleteBankAccount(@PathVariable Long accountId);

    @Operation(operationId = "7-getMyReviews", summary = "내 리뷰 목록 조회", 
            description = "인증된 사용자가 받은 리뷰 또는 작성한 리뷰 목록을 조회합니다. " +
            "type 파라미터로 'received'(받은 리뷰) 또는 'sent'(작성한 리뷰)를 지정할 수 있으며, " +
            "기본값은 'received'입니다. 각 리뷰에는 계약 정보(제목, 시작일, 종료일)가 포함됩니다. " +
            "응답에는 전체 리뷰 수(total)와 평균 평점(averageRating)이 포함됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "리뷰 목록 조회 성공", 
                    content = @Content(schema = @Schema(implementation = ReviewListResponse.class),
                    examples = @ExampleObject(value = "{\n" +
                            "  \"page\": 1,\n" +
                            "  \"size\": 10,\n" +
                            "  \"total\": 2,\n" +
                            "  \"averageRating\": 4.5,\n" +
                            "  \"items\": [\n" +
                            "    {\n" +
                            "      \"id\": 3,\n" +
                            "      \"contractId\": 2,\n" +
                            "      \"reviewerMemberId\": 2,\n" +
                            "      \"revieweeMemberId\": 6,\n" +
                            "      \"rating\": 4,\n" +
                            "      \"comment\": \"마감 기한을 잘 지켜주셔서 좋았습니다.\",\n" +
                            "      \"createdAt\": \"2024-01-15T10:30:00+09:00\",\n" +
                            "      \"contractTitle\": \"dd\",\n" +
                            "      \"contractStartAt\": \"2024-01-20T10:00:00+09:00\",\n" +
                            "      \"contractEndAt\": \"2024-02-20T10:00:00+09:00\"\n" +
                            "    },\n" +
                            "    {\n" +
                            "      \"id\": 1,\n" +
                            "      \"contractId\": 1,\n" +
                            "      \"reviewerMemberId\": 1,\n" +
                            "      \"revieweeMemberId\": 6,\n" +
                            "      \"rating\": 5,\n" +
                            "      \"comment\": \"프로젝트 내내 소통이 원활했고 실력도 훌륭하셨습니다. 다음에도 함께하고 싶습니다!\",\n" +
                            "      \"createdAt\": \"2024-01-15T10:20:00+09:00\",\n" +
                            "      \"contractTitle\": \"ㅇㅇ\",\n" +
                            "      \"contractStartAt\": \"2024-01-20T10:00:00+09:00\",\n" +
                            "      \"contractEndAt\": \"2024-02-20T10:00:00+09:00\"\n" +
                            "    }\n" +
                            "  ]\n" +
                            "}"))),
            @ApiResponse(responseCode = "400", description = "잘못된 type 값 - errorCode: BAD_REQUEST", 
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class), 
                    examples = @ExampleObject(value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"type은 'received' 또는 'sent'만 가능합니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED", 
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class), 
                    examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR", 
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class), 
                    examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<ReviewListResponse> getMyReviews(
            @RequestParam(required = false, defaultValue = "received") String type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size);

    @Operation(operationId = "7-1-getMemberReviews", summary = "특정 유저가 받은 리뷰 목록 조회", 
            description = "특정 회원이 받은 리뷰 목록을 조회합니다. " +
            "각 리뷰에는 계약 정보(제목, 시작일, 종료일)가 포함됩니다. " +
            "응답에는 전체 리뷰 수(total)와 평균 평점(averageRating)이 포함됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "리뷰 목록 조회 성공", 
                    content = @Content(schema = @Schema(implementation = ReviewListResponse.class),
                    examples = @ExampleObject(value = "{\n" +
                            "  \"page\": 1,\n" +
                            "  \"size\": 10,\n" +
                            "  \"total\": 2,\n" +
                            "  \"averageRating\": 4.5,\n" +
                            "  \"items\": [\n" +
                            "    {\n" +
                            "      \"id\": 3,\n" +
                            "      \"contractId\": 2,\n" +
                            "      \"reviewerMemberId\": 2,\n" +
                            "      \"revieweeMemberId\": 6,\n" +
                            "      \"rating\": 4,\n" +
                            "      \"comment\": \"마감 기한을 잘 지켜주셔서 좋았습니다.\",\n" +
                            "      \"createdAt\": \"2024-01-15T10:30:00+09:00\",\n" +
                            "      \"contractTitle\": \"dd\",\n" +
                            "      \"contractStartAt\": \"2024-01-20T10:00:00+09:00\",\n" +
                            "      \"contractEndAt\": \"2024-02-20T10:00:00+09:00\"\n" +
                            "    },\n" +
                            "    {\n" +
                            "      \"id\": 1,\n" +
                            "      \"contractId\": 1,\n" +
                            "      \"reviewerMemberId\": 1,\n" +
                            "      \"revieweeMemberId\": 6,\n" +
                            "      \"rating\": 5,\n" +
                            "      \"comment\": \"프로젝트 내내 소통이 원활했고 실력도 훌륭하셨습니다. 다음에도 함께하고 싶습니다!\",\n" +
                            "      \"createdAt\": \"2024-01-15T10:20:00+09:00\",\n" +
                            "      \"contractTitle\": \"ㅇㅇ\",\n" +
                            "      \"contractStartAt\": \"2024-01-20T10:00:00+09:00\",\n" +
                            "      \"contractEndAt\": \"2024-02-20T10:00:00+09:00\"\n" +
                            "    }\n" +
                            "  ]\n" +
                            "}"))),
            @ApiResponse(responseCode = "400", description = "잘못된 memberId 형식 (양수가 아님) - errorCode: BAD_REQUEST", 
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class), 
                    examples = @ExampleObject(value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"요청이 올바르지 않습니다. 입력 값을 다시 확인해주세요.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "404", description = "회원을 찾을 수 없음 (PENDING 상태 또는 삭제된 회원) - errorCode: NOT_FOUND", 
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class), 
                    examples = @ExampleObject(value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR", 
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class), 
                    examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<ReviewListResponse> getMemberReviews(
            @PathVariable Integer memberId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size);

    @Operation(operationId = "8-getMyTransactions", summary = "내 결제 및 정산 내역 조회", description = "플랫폼에서 발생한 자신의 모든 거래(결제, 환불, 정산) 내역을 조회합니다.\n" +
            "• 사용자의 현재 역할(리더/아티스트)에 따라 summary 객체의 내용이 동적으로 변경됩니다.\n" +
            "• transactions 목록에는 모든 타입의 거래 내역이 시간순으로 포함됩니다. (Pagination)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공적으로 조회되었습니다."),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "404", description = "회원을 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"계좌를 찾을 수 없습니다.\",\"timestamp\":1762067112276}"))),
            @ApiResponse(responseCode = "500", description = "서버 에러 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1762067112276}")))
    })
    ResponseEntity<TransactionHistoryResponse> getMyTransactions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    );
}
