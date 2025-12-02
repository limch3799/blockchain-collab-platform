package com.s401.moas.member.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "member_bank")
public class MemberBank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "member_id", nullable = false)
    private Integer memberId;

    @Column(name = "bank_code", nullable = false, length = 3, columnDefinition = "CHAR(3)")
    private String bankCode;

    @Column(name = "account_holder_name", nullable = false, length = 50)
    private String accountHolderName;

    @Column(name = "account_number_cipher", nullable = false, columnDefinition = "VARBINARY(64)")
    private byte[] accountNumberCipher;

    @Column(name = "account_number_iv", nullable = false, columnDefinition = "VARBINARY(16)")
    private byte[] accountNumberIv;

    @Column(name = "account_last4", nullable = false, columnDefinition = "char(4)")
    private String accountLast4;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private BankAccountStatus status;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Builder
    public MemberBank(Integer memberId, String bankCode, String accountHolderName,
                     byte[] accountNumberCipher, byte[] accountNumberIv, String accountLast4) {
        this.memberId = memberId;
        this.bankCode = bankCode;
        this.accountHolderName = accountHolderName;
        this.accountNumberCipher = accountNumberCipher;
        this.accountNumberIv = accountNumberIv;
        this.accountLast4 = accountLast4;
        this.status = BankAccountStatus.PENDING;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = BankAccountStatus.PENDING;
        }
    }

    /**
     * 계좌 인증 완료 처리
     */
    public void verify() {
        this.status = BankAccountStatus.VERIFIED;
        this.verifiedAt = LocalDateTime.now();
    }

    /**
     * 계좌 삭제 처리 (Soft Delete)
     */
    public void delete() {
        this.deletedAt = LocalDateTime.now();
    }

    /**
     * 삭제 여부 확인
     */
    public boolean isDeleted() {
        return this.deletedAt != null;
    }
}

