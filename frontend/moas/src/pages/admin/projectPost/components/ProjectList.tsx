// src/pages/admin/projectPost/components/ProjectList.tsx
import type { LeaderProject } from '@/api/admin/project';
import { ProjectItem } from './ProjectItem';

interface ProjectListProps {
  projects: LeaderProject[];
  onProjectClick: (projectId: number) => void;
}

export const ProjectList = ({ projects, onProjectClick }: ProjectListProps) => {
  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
        <p className="text-gray-600">프로젝트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
      <table className="w-full">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800 w-16"></th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800 w-20">ID</th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800">제목</th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800">리더 닉네임</th>
            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-800 w-48">
              지원 마감일
            </th>
            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-800 w-48">
              생성일
            </th>
            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-800 w-48">
              삭제일
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => (
            <ProjectItem
              key={project.projectId}
              project={project}
              index={index + 1}
              onClick={() => onProjectClick(project.projectId)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
