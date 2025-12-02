package com.s401.moas.member.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "total_penalty")
public class TotalPenalty {

    @Id
    @Column(name = "id")
    private Integer id; // member_id와 동일

    @Column(name = "score", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Integer score;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public TotalPenalty(Integer id, Integer score) {
        this.id = id;
        this.score = score != null ? score : 0;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 점수 업데이트
     */
    public void updateScore(Integer score) {
        this.score = score;
        this.updatedAt = LocalDateTime.now();
    }
}