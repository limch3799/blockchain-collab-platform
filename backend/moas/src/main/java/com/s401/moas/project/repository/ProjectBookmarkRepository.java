package com.s401.moas.project.repository;

import com.s401.moas.project.domain.ProjectBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectBookmarkRepository extends JpaRepository<ProjectBookmark, ProjectBookmark.ProjectBookmarkId> {

    /**
     * 특정 회원이 특정 프로젝트를 북마크했는지 확인
     */
    boolean existsByMemberIdAndProjectId(Integer memberId, Integer projectId);

    /**
     * 특정 회원이 특정 프로젝트를 북마크한 엔티티 조회
     */
    Optional<ProjectBookmark> findByMemberIdAndProjectId(Integer memberId, Integer projectId);
}

