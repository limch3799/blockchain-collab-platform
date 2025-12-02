package com.s401.moas.review.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "review")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "reviewer_member_id", nullable = false)
    private Integer reviewerMemberId;

    @Column(name = "reviewee_member_id", nullable = false)
    private Integer revieweeMemberId;

    @Column(nullable = false)
    private Byte rating;

    @Column(length = 500)
    private String comment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 엔티티가 영속화되기 전에 createdAt 필드를 현재 시간으로 초기화합니다.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public Review(Long contractId, Integer reviewerMemberId, Integer revieweeMemberId, Byte rating, String comment) {
        this.contractId = contractId;
        this.reviewerMemberId = reviewerMemberId;
        this.revieweeMemberId = revieweeMemberId;
        this.rating = rating;
        this.comment = comment;
    }
}