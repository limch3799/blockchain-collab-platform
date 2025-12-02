// src/pages/admin/projectPost/components/ProjectItem.tsx
import type { LeaderProject } from '@/api/admin/project';

interface ProjectItemProps {
  project: LeaderProject;
  index: number;
  onClick: () => void;
}

export const ProjectItem = ({ project, index, onClick }: ProjectItemProps) => {
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <tr
      onClick={onClick}
      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      {/* 인덱스 */}
      <td className="px-4 py-4 text-center">
        <div className="inline-flex items-center justify-center w-8 h-8 text-black text-lg font-semibold rounded">
          {index}
        </div>
      </td>

      {/* 프로젝트 ID */}
      <td className="px-4 py-4 text-sm text-gray-700">{project.projectId}</td>

      {/* 제목 */}
      <td className="px-4 py-4">
        <p className="text-sm font-semibold text-gray-800">{project.title}</p>
      </td>

      {/* 리더 닉네임 */}
      <td className="px-4 py-4">
        <p className="text-sm text-gray-800">{project.memberNickname}</p>
      </td>

      {/* 지원 마감일 */}
      <td className="px-4 py-4 text-center">
        <p className="text-xs text-gray-600 whitespace-nowrap">
          {formatDateTime(project.applyDeadline)}
        </p>
      </td>

      {/* 생성일 */}
      <td className="px-4 py-4 text-center">
        <p className="text-xs text-gray-600 whitespace-nowrap">
          {formatDateTime(project.createdAt)}
        </p>
      </td>

      {/* 삭제일 */}
      <td className="px-4 py-4 text-center">
        {project.deletedAt ? (
          <p className="text-xs text-red-600 whitespace-nowrap">
            {formatDateTime(project.deletedAt)}
          </p>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </td>
    </tr>
  );
};
