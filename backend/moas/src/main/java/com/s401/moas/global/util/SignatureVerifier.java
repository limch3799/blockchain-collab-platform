package com.s401.moas.global.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.s401.moas.contract.controller.response.TypedDataResponse;
import org.springframework.stereotype.Component;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.crypto.StructuredDataEncoder;
import org.web3j.utils.Numeric;

import java.io.IOException;
import java.math.BigInteger;
import java.security.SignatureException;
import java.util.Arrays;

@Component
public class SignatureVerifier {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * EIP-712 서명을 검증합니다. (web3j 4.x 버전 호환)
     *
     * @param signerAddress     서명한 사람의 예상 지갑 주소 (0x 접두사 포함)
     * @param typedDataResponse 서명에 사용된 원본 TypedData 객체
     * @param signature         검증할 서명값 (0x 접두사 포함)
     * @return 서명이 유효하면 true, 그렇지 않으면 false
     */
    public boolean verify(String signerAddress, TypedDataResponse typedDataResponse, String signature) {
        try {
            // 1. DTO를 JSON 문자열로 변환
            String typedDataJson = objectMapper.writeValueAsString(typedDataResponse);

            // 2. web3j의 StructuredDataEncoder를 사용하여 EIP-712 해시 생성
            StructuredDataEncoder dataEncoder = new StructuredDataEncoder(typedDataJson);
            byte[] messageHash = dataEncoder.hashStructuredData();

            // 3. 서명값에서 r, s, v 분리
            byte[] signatureBytes = Numeric.hexStringToByteArray(signature);
            byte v = signatureBytes[64];
            // web3j에서 v값은 27 또는 28이어야 함
            if (v < 27) {
                v += 27;
            }
            byte[] r = Arrays.copyOfRange(signatureBytes, 0, 32);
            byte[] s = Arrays.copyOfRange(signatureBytes, 32, 64);

            Sign.SignatureData signatureData = new Sign.SignatureData(v, r, s);

            // 4. 서명 데이터와 해시를 사용하여 서명자의 공개키 복구
            BigInteger recoveredPublicKey = Sign.signedMessageHashToKey(messageHash, signatureData);
            if (recoveredPublicKey == null) {
                return false;
            }

            // 5. 공개키로부터 지갑 주소 계산
            String recoveredAddress = "0x" + Keys.getAddress(recoveredPublicKey);

            // 6. 복구된 주소와 예상 주소가 일치하는지 확인 (대소문자 무시)
            return signerAddress.equalsIgnoreCase(recoveredAddress);

        } catch (SignatureException | IOException e) {
            // JSON 파싱 오류 또는 서명 복구 오류 발생 시
            System.err.println("EIP-712 서명 검증 중 오류 발생: " + e.getMessage());
            return false;
        }
    }
}