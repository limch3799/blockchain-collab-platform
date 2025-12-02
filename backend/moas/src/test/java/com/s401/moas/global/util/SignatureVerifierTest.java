package com.s401.moas.global.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.s401.moas.contract.controller.response.TypedDataResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.ECKeyPair;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.crypto.StructuredDataEncoder;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class SignatureVerifierTest {

    private SignatureVerifier signatureVerifier;
    private ObjectMapper objectMapper = new ObjectMapper();

    // 테스트용 개인키와 지갑 정보 (실제 키가 아닌 임시 생성된 키)
    private Credentials credentials;
    private String testWalletAddress;

    private TypedDataResponse testTypedData;

    @BeforeEach
    void setUp() throws Exception {
        signatureVerifier = new SignatureVerifier();

        // 1. 테스트를 위한 임시 이더리움 지갑 생성
        ECKeyPair ecKeyPair = Keys.createEcKeyPair();
        credentials = Credentials.create(ecKeyPair);
        testWalletAddress = credentials.getAddress();
        System.out.println("테스트 지갑 주소: " + testWalletAddress);
        System.out.println("테스트 개인키: " + credentials.getEcKeyPair().getPrivateKey().toString(16));

        // 2. 테스트용 EIP-712 데이터 생성 (실제 API 응답과 동일한 구조)
        // Domain 객체
        TypedDataResponse.Domain domain = TypedDataResponse.Domain.builder()
                .name("MOASContract")
                .version("1")
                .chainId(11155111L)
                .verifyingContract("0x5D3C4CdB6934055923E45A9Fc4F88BC4113a04aC")
                .build();

        // EIP712Domain 타입 정의
        List<TypedDataResponse.Type> eip712DomainType = List.of(
                TypedDataResponse.Type.builder().name("name").type("string").build(),
                TypedDataResponse.Type.builder().name("version").type("string").build(),
                TypedDataResponse.Type.builder().name("chainId").type("uint256").build(),
                TypedDataResponse.Type.builder().name("verifyingContract").type("address").build()
        );

        // ContractSignature 타입 정의
        List<TypedDataResponse.Type> contractSignatureType = List.of(
                TypedDataResponse.Type.builder().name("tokenId").type("uint256").build(),
                TypedDataResponse.Type.builder().name("title").type("string").build(),
                TypedDataResponse.Type.builder().name("leader").type("address").build(),
                TypedDataResponse.Type.builder().name("artist").type("address").build(),
                TypedDataResponse.Type.builder().name("totalAmount").type("uint256").build(),
                TypedDataResponse.Type.builder().name("startsAt").type("string").build(),
                TypedDataResponse.Type.builder().name("endsAt").type("string").build()
        );

        Map<String, List<TypedDataResponse.Type>> types = Map.of(
                "EIP712Domain", eip712DomainType,
                "ContractSignature", contractSignatureType);

        TypedDataResponse.Message message = TypedDataResponse.Message.builder()
                .tokenId("105").title("Test Contract").leader(testWalletAddress)
                .artist("0x0000000000000000000000000000000000000002")
                .totalAmount("10000").startsAt("...").endsAt("...").build();

        testTypedData = TypedDataResponse.builder()
                .domain(domain).types(types).primaryType("ContractSignature").message(message).build();
    }

    private String createTestSignature(TypedDataResponse data) throws Exception {
        String jsonData = objectMapper.writeValueAsString(data);
        StructuredDataEncoder dataEncoder = new StructuredDataEncoder(jsonData);
        Sign.SignatureData signatureData = Sign.signMessage(dataEncoder.hashStructuredData(), credentials.getEcKeyPair(), false);
        // r, s, v 바이트 배열을 합쳐서 hex 문자열로 반환
        return org.web3j.utils.Numeric.toHexString(signatureData.getR()) +
                org.web3j.utils.Numeric.toHexString(signatureData.getS()).substring(2) +
                org.web3j.utils.Numeric.toHexString(signatureData.getV()).substring(2);
    }

    @Test
    @DisplayName("유효한 서명은 검증에 성공해야 한다 (성공 시나리오)")
    void verify_withValidSignature_shouldReturnTrue() throws Exception {
        // given: 유효한 서명 생성
        String validSignature = createTestSignature(testTypedData);

        // when: 검증 실행
        boolean result = signatureVerifier.verify(testWalletAddress, testTypedData, validSignature);

        // then: 결과는 true여야 함
        assertTrue(result, "유효한 서명 검증에 실패했습니다.");
    }

    @Test
    @DisplayName("잘못된 지갑 주소로 검증하면 실패해야 한다 (실패 시나리오 1)")
    void verify_withWrongAddress_shouldReturnFalse() throws Exception {
        // given: 유효한 서명
        String validSignature = createTestSignature(testTypedData);
        String wrongAddress = "0x1234567890123456789012345678901234567890";

        // when: 잘못된 주소로 검증
        boolean result = signatureVerifier.verify(wrongAddress, testTypedData, validSignature);

        // then: 결과는 false여야 함
        assertFalse(result, "잘못된 주소로 검증했는데 성공했습니다.");
    }

    @Test
    @DisplayName("서명 데이터 내용이 변경되면 검증에 실패해야 한다 (실패 시나리오 2)")
    void verify_withTamperedData_shouldReturnFalse() throws Exception {
        // given: 유효한 서명
        String validSignature = createTestSignature(testTypedData);

        // when: 서명에 사용된 원본 데이터의 내용을 살짝 변경
        TypedDataResponse.Message tamperedMessage = TypedDataResponse.Message.builder()
                .tokenId("106") // tokenId 변경!
                .title("Test Contract").leader(testWalletAddress)
                .artist("0x0000000000000000000000000000000000000002")
                .totalAmount("10000").startsAt("...").endsAt("...").build();

        TypedDataResponse tamperedData = TypedDataResponse.builder()
                .domain(testTypedData.getDomain())
                .types(testTypedData.getTypes())
                .primaryType(testTypedData.getPrimaryType())
                .message(tamperedMessage).build();

        boolean result = signatureVerifier.verify(testWalletAddress, tamperedData, validSignature);

        // then: 결과는 false여야 함
        assertFalse(result, "내용이 변경된 데이터로 검증했는데 성공했습니다.");
    }
}