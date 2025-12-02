package com.s401.moas.project.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "project_bookmark")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@IdClass(ProjectBookmark.ProjectBookmarkId.class)
public class ProjectBookmark {

    @Id
    @Column(name = "member_id", nullable = false)
    private Integer memberId;

    @Id
    @Column(name = "project_id", nullable = false)
    private Integer projectId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * 복합 키 클래스
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectBookmarkId implements Serializable {
        private Integer memberId;
        private Integer projectId;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ProjectBookmarkId that = (ProjectBookmarkId) o;
            return Objects.equals(memberId, that.memberId) &&
                   Objects.equals(projectId, that.projectId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(memberId, projectId);
        }
    }
}

