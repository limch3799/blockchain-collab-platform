package com.s401.moas.project.domain;

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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "project_position")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ProjectPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Integer projectId;

    @Column(name = "position_id", nullable = false)
    private Integer positionId;

    @Column(name = "budget", nullable = false, columnDefinition = "INT UNSIGNED")
    private Long budget;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private PositionStatus status = PositionStatus.RECRUITING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    /**
     * Soft delete 수행
     */
    public void delete() {
        this.deletedAt = LocalDateTime.now();
    }

    /**
     * 삭제 여부 확인
     */
    public boolean isDeleted() {
        return deletedAt != null;
    }

    /**
     * 포지션 마감 처리 (상태를 COMPLETED로 변경)
     * 지원자 여부와 관계없이 무조건 마감 처리됩니다.
     * 이미 마감된 포지션인 경우는 그대로 유지됩니다.
     */
    public void close() {
        // 이미 마감된 경우는 그대로 유지 (예외 발생하지 않음)
        if (this.status != PositionStatus.COMPLETED) {
            this.status = PositionStatus.COMPLETED;
        }
    }

    public enum PositionStatus {
        RECRUITING, COMPLETED
    }
}
