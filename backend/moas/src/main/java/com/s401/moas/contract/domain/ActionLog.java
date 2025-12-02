package com.s401.moas.contract.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 계약 등 주요 도메인의 활동 이력을 기록하는 엔티티입니다.
 * NOTE: 현재는 Contract 도메인에서만 사용되어 임시로 이 패키지에 위치합니다.
 * 추후 별도의 'log' 도메인으로 분리될 수 있습니다.
 */
@Entity
@Table(name = "action_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "related_id", nullable = false)
    private Long relatedId;

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType;

    @Column(name = "actor_member_id")
    private Integer actorMemberId;

    @Lob
    @Column(columnDefinition = "JSON")
    private String details;

    @Setter
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public ActionLog(Long relatedId, String actionType, Integer actorMemberId, String details) {
        this.relatedId = relatedId;
        this.actionType = actionType;
        this.actorMemberId = actorMemberId;
        this.details = details;
    }

    @Builder(builderMethodName = "testBuilder")
    public ActionLog(Long relatedId, String actionType, Integer actorMemberId, String details, LocalDateTime createdAt) {
        this.relatedId = relatedId;
        this.actionType = actionType;
        this.actorMemberId = actorMemberId;
        this.details = details;
    }
}