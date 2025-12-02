package com.s401.moas.project.domain;

import java.time.LocalDateTime;

import com.s401.moas.global.domain.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "project")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Project extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "member_id", nullable = false)
    private Integer memberId;

    @Column(name = "district_id")
    private Integer districtId;

    @Column(name = "title", nullable = false, length = 30)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "summary", length = 100)
    private String summary;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Column(name = "apply_deadline", nullable = false)
    private LocalDateTime applyDeadline;

    @Column(name = "thumbnail_url", length = 512)
    private String thumbnailUrl;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private Integer deletedBy;

    /**
     * 프로젝트 정보 업데이트 (부분 업데이트 지원)
     */
    public void update(String title, String summary, String description, Integer districtId,
                      String thumbnailUrl, LocalDateTime applyDeadline, 
                      LocalDateTime startAt, LocalDateTime endAt) {
        if (title != null) {
            this.title = title;
        }
        if (summary != null) {
            this.summary = summary;
        }
        if (description != null) {
            this.description = description;
        }
        if (districtId != null) {
            this.districtId = districtId;
        }
        if (thumbnailUrl != null) {
            this.thumbnailUrl = thumbnailUrl;
        }
        if (applyDeadline != null) {
            this.applyDeadline = applyDeadline;
        }
        if (startAt != null) {
            this.startAt = startAt;
        }
        if (endAt != null) {
            this.endAt = endAt;
        }
    }

    /**
     * Soft delete 수행
     * 
     * @param deletedBy 삭제자 ID (null이면 등록자가 삭제한 것, 값이 있으면 관리자가 삭제한 것)
     */
    public void delete(Integer deletedBy) {
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = deletedBy;
    }

    /**
     * 삭제 여부 확인
     */
    public boolean isDeleted() {
        return deletedAt != null;
    }

    /**
     * 조회수 증가
     */
    public void incrementViewCount() {
        this.viewCount++;
    }

    /**
     * 프로젝트 마감 처리
     */
    public void close() {
        this.closedAt = LocalDateTime.now();
    }
}
