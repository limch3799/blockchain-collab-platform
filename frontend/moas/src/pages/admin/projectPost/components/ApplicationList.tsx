// src/pages/admin/projectPost/components/ApplicationList.tsx
import type { ArtistApplication } from '@/api/admin/project';
import { ApplicationItem } from './ApplicationItem';

interface ApplicationListProps {
  applications: ArtistApplication[];
  onApplicationClick: (application: ArtistApplication) => void;
}

export const ApplicationList = ({ applications, onApplicationClick }: ApplicationListProps) => {
  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
        <p className="text-gray-600">지원이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
      <table className="w-full">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800 w-16"></th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800 w-20">
              지원 ID
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800 w-20">
              프로젝트 ID
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800">
              프로젝트 제목
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800 w-24">
              회원 ID
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800">회원 닉네임</th>
            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-800 w-32">상태</th>
            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-800 w-48">
              지원일
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application, index) => (
            <ApplicationItem
              key={application.applicationId}
              application={application}
              index={index + 1}
              onClick={() => onApplicationClick(application)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
