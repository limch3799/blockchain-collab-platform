// src/pages/project-post-detail/components/ProjectPostDetailBottom.tsx
import { ProjectPostInfo } from './ProjectPostInfo';
import { ProjectPostApply } from './ProjectPostApply';

interface ProjectPosition {
  projectPositionId: number;
  positionId: number;
  categoryId: number;
  categoryName: string;
  positionName: string;
  budget: number;
}

interface RecruitArtist {
  role: string;
  budget: number; // ⭐ count에서 budget으로 변경
}

interface ProjectBottomProps {
  project: {
    projectId: number;
    title: string;
    summary: string;
    description: string;
    thumbnailUrl: string | null;
    isOnline: boolean;
    province: string;
    district: string;
    startAt: string;
    endAt: string;
    applyDeadline: string;
    positions: ProjectPosition[];
    totalBudget: number;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
  };
  description?: string;
  recruitArtists?: RecruitArtist[];
}

export function ProjectPostDetailBottom({
  project,
  description,
  recruitArtists,
}: ProjectBottomProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 좌측: 프로젝트 소개 (2/3 width) */}
      <div className="lg:col-span-2">
        <ProjectPostInfo
          description={
            description || project.description || project.summary || '프로젝트 설명이 없습니다.'
          }
          recruitArtists={
            recruitArtists ||
            project.positions.map((p) => ({
              role: p.positionName,
              budget: p.budget, // ⭐ count에서 budget으로 변경
            }))
          }
        />
      </div>

      {/* 우측: 프로젝트 지원 (1/3 width) */}
      <div className="lg:col-span-1">
        <ProjectPostApply project={project} />
      </div>
    </div>
  );
}
