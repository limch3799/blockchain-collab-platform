// src/pages/project-post/components/ProjectList.tsx
import type { Project } from '@/types/project';
import { ProjectCard } from './ProjectCard';

interface ProjectListProps {
  projects: Project[];
  onBookmark?: (id: number) => void;
}

export default function ProjectList({ projects, onBookmark }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="py-20 text-center font-pretendard">
        <h3 className="text-xl font-medium text-moas-gray-7 mb-2">검색 결과가 없습니다.</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-0">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onBookmark={onBookmark} />
      ))}
    </div>
  );
}
