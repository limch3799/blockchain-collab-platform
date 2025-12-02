package com.s401.moas.member.util;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * 계좌번호 암호화 키 생성 유틸리티
 * 
 * 사용 방법:
 * 1. 이 클래스를 실행하여 키를 생성합니다.
 * 2. 생성된 키를 환경 변수 ACCOUNT_ENCRYPTION_KEY에 설정합니다.
 * 
 * 주의: 생성된 키는 안전하게 보관하고, 프로덕션 환경에서는 절대 공유하지 마세요.
 */
public class AccountEncryptionKeyGenerator {

    public static void main(String[] args) {
        // AES-256을 위한 32바이트(256비트) 키 생성
        byte[] keyBytes = new byte[32];
        SecureRandom secureRandom = new SecureRandom();
        secureRandom.nextBytes(keyBytes);

        // Base64로 인코딩
        String base64Key = Base64.getEncoder().encodeToString(keyBytes);

        System.out.println("========================================");
        System.out.println("계좌번호 암호화 키 생성 완료");
        System.out.println("========================================");
        System.out.println("생성된 키 (Base64):");
        System.out.println(base64Key);
        System.out.println("========================================");
        System.out.println("환경 변수 설정:");
        System.out.println("export ACCOUNT_ENCRYPTION_KEY=\"" + base64Key + "\"");
        System.out.println("========================================");
        System.out.println("주의: 이 키를 안전하게 보관하고 절대 공유하지 마세요!");
        System.out.println("========================================");
    }
}

