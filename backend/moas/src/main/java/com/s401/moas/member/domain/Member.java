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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "member")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "nickname", nullable = false, length = 50)
    private String nickname;

    @Column(name = "biography", length = 200)
    private String biography;

    @Column(name = "email", nullable = true, length = 254)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false, length = 10)
    private OAuthProvider provider;

    @Column(name = "provider_id", nullable = false, length = 128)
    private String providerId;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "profile_image_url", length = 512)
    private String profileImageUrl;

    @Column(name = "wallet_address", length = 128)
    private String walletAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 10)
    private MemberRole role;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Builder
    public Member(String nickname, String biography, String email, OAuthProvider provider,
            String providerId, String phoneNumber, String profileImageUrl,
            String walletAddress, MemberRole role) {
        this.nickname = nickname;
        this.biography = biography;
        this.email = email;
        this.provider = provider;
        this.providerId = providerId;
        this.phoneNumber = phoneNumber;
        this.profileImageUrl = profileImageUrl;
        this.walletAddress = walletAddress;
        this.role = role != null ? role : MemberRole.PENDING;
    }

    /**
     * 테스트 코드에서만 사용하기 위한 빌더입니다.
     * id, createdAt 등 자동 생성 필드를 포함한 모든 필드를 설정할 수 있습니다.
     */
    @Builder(builderMethodName = "testBuilder")
    public Member(Integer id, String nickname, String biography, String email, OAuthProvider provider,
                  String providerId, String phoneNumber, String profileImageUrl,
                  String walletAddress, MemberRole role, LocalDateTime createdAt,
                  LocalDateTime updatedAt, LocalDateTime deletedAt) {
        this.id = id;
        this.nickname = nickname;
        this.biography = biography;
        this.email = email;
        this.provider = provider;
        this.providerId = providerId;
        this.phoneNumber = phoneNumber;
        this.profileImageUrl = profileImageUrl;
        this.walletAddress = walletAddress;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        if (this.role == null) {
            this.role = MemberRole.PENDING;
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 회원 탈퇴 처리 (Soft Delete)
     * deletedAt 필드를 현재 시각으로 설정합니다.
     */
    public void delete() {
        this.deletedAt = LocalDateTime.now();
    }

    /**
     * 프로필 정보 업데이트
     * PATCH 요청에 맞게 null이 아닌 필드만 업데이트합니다.
     *
     * @param nickname        닉네임 (null이면 업데이트하지 않음)
     * @param biography       자기소개 (null이면 업데이트하지 않음)
     * @param phoneNumber     전화번호 (null이면 업데이트하지 않음)
     * @param profileImageUrl 프로필 이미지 URL (null이면 업데이트하지 않음)
     */
    public void updateProfile(String nickname, String biography, String phoneNumber, String profileImageUrl) {
        if (nickname != null) {
            this.nickname = nickname.trim();
        }
        if (biography != null) {
            this.biography = biography.trim().isEmpty() ? null : biography.trim();
        }
        if (phoneNumber != null) {
            this.phoneNumber = phoneNumber.trim().isEmpty() ? null : phoneNumber.trim();
        }
        if (profileImageUrl != null) {
            this.profileImageUrl = profileImageUrl.trim().isEmpty() ? null : profileImageUrl.trim();
        }
    }

    /**
     * 회원 역할 변경
     * PENDING 상태에서만 LEADER 또는 ARTIST로 변경할 수 있습니다.
     *
     * @param role 변경할 역할 (LEADER 또는 ARTIST)
     * @throws IllegalStateException PENDING 상태가 아닌 경우
     */
    public void updateRole(MemberRole role) {
        if (this.role != MemberRole.PENDING) {
            throw new IllegalStateException("PENDING 상태에서만 역할을 변경할 수 있습니다.");
        }
        if (role != MemberRole.LEADER && role != MemberRole.ARTIST) {
            throw new IllegalArgumentException("역할은 LEADER 또는 ARTIST만 가능합니다.");
        }
        this.role = role;
    }
}
