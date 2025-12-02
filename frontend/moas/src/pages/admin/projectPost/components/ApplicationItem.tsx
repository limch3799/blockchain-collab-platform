// src/pages/admin/projectPost/components/ApplicationItem.tsx
import type { ArtistApplication } from '@/api/admin/project';

interface ApplicationItemProps {
  application: ArtistApplication;
  index: number;
  onClick: () => void;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: { label: '대기중', className: 'bg-yellow-100 text-yellow-700' },
  OFFERED: { label: '제안됨', className: 'bg-blue-100 text-blue-700' },
  REJECTED: { label: '거절됨', className: 'bg-red-100 text-red-700' },
  COMPLETED: { label: '완료', className: 'bg-green-100 text-green-700' },
};

export const ApplicationItem = ({ application, index, onClick }: ApplicationItemProps) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
  };

  const statusInfo = STATUS_MAP[application.status] || {
    label: application.status,
    className: 'bg-gray-100 text-gray-700',
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

      {/* 지원 ID */}
      <td className="px-4 py-4 text-sm text-gray-700">{application.applicationId}</td>

      {/* 프로젝트 ID */}
      <td className="px-4 py-4 text-sm text-gray-700">{application.projectId}</td>

      {/* 프로젝트 제목 */}
      <td className="px-4 py-4">
        <p className="text-sm font-semibold text-gray-800">{application.projectTitle}</p>
      </td>

      {/* 회원 ID */}
      <td className="px-4 py-4 text-sm text-gray-700">{application.memberId}</td>

      {/* 회원 닉네임 */}
      <td className="px-4 py-4">
        <p className="text-sm text-gray-800">{application.memberNickname}</p>
      </td>

      {/* 상태 */}
      <td className="px-4 py-4 text-center">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
      </td>

      {/* 지원일 */}
      <td className="px-4 py-4 text-center">
        <p className="text-xs text-gray-600 whitespace-nowrap">
          {formatDateTime(application.createdAt)}
        </p>
      </td>
    </tr>
  );
};
