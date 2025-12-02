package com.s401.moas.member.service;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

/**
 * 계좌번호 암호화/복호화 서비스
 * AES-256-GCM 알고리즘 사용
 */
@Slf4j
@Service
public class AccountEncryptionService {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // GCM 권장 IV 길이
    private static final int GCM_TAG_LENGTH = 16; // GCM 태그 길이 (128비트)

    private final SecretKey secretKey;

    public AccountEncryptionService(@Value("${app.encryption.account-key:}") String encryptionKey) {
        if (encryptionKey == null || encryptionKey.isBlank()) {
            throw new IllegalStateException("계좌번호 암호화 키가 설정되지 않았습니다. ACCOUNT_ENCRYPTION_KEY 환경 변수를 설정해주세요.");
        }
        
        try {
            // Base64로 인코딩된 키를 디코딩하여 SecretKey 생성
            // AES-256을 사용하려면 32바이트(256비트) 키가 필요
            byte[] keyBytes = Base64.getDecoder().decode(encryptionKey);
            if (keyBytes.length != 32) {
                throw new IllegalArgumentException("암호화 키는 32바이트(256비트)여야 합니다. 현재 길이: " + keyBytes.length);
            }
            this.secretKey = new SecretKeySpec(keyBytes, ALGORITHM);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("계좌번호 암호화 키 형식이 올바르지 않습니다. Base64로 인코딩된 32바이트 키여야 합니다.", e);
        }
    }

    /**
     * 계좌번호 암호화
     * 
     * @param accountNumber 평문 계좌번호
     * @return 암호화 결과 (암호화된 데이터와 IV를 포함)
     */
    public EncryptionResult encrypt(String accountNumber) {
        try {
            // IV 생성 (매번 랜덤하게 생성)
            byte[] iv = new byte[GCM_IV_LENGTH];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);

            // Cipher 초기화
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            // 암호화 수행
            byte[] plaintext = accountNumber.getBytes(StandardCharsets.UTF_8);
            byte[] ciphertext = cipher.doFinal(plaintext);

            return new EncryptionResult(ciphertext, iv);
        } catch (Exception e) {
            log.error("계좌번호 암호화 실패", e);
            throw new RuntimeException("계좌번호 암호화 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 계좌번호 복호화
     * 
     * @param ciphertext 암호화된 데이터
     * @param iv 초기화 벡터
     * @return 복호화된 평문 계좌번호
     */
    public String decrypt(byte[] ciphertext, byte[] iv) {
        try {
            // Cipher 초기화
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            // 복호화 수행
            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("계좌번호 복호화 실패", e);
            throw new RuntimeException("계좌번호 복호화 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 암호화 결과를 담는 클래스
     */
    public static class EncryptionResult {
        private final byte[] ciphertext;
        private final byte[] iv;

        public EncryptionResult(byte[] ciphertext, byte[] iv) {
            this.ciphertext = ciphertext;
            this.iv = iv;
        }

        public byte[] getCiphertext() {
            return ciphertext;
        }

        public byte[] getIv() {
            return iv;
        }
    }
}

